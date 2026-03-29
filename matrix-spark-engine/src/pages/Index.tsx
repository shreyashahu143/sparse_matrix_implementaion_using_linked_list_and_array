import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import MatrixHeader from "@/components/MatrixHeader";
import StepGuide from "@/components/StepGuide";
import ImageScanner from "@/components/ImageScanner";
import SparsePanel from "@/components/SparsePanel";
import ThresholdSlider from "@/components/ThresholdSlider";
import OperationsPanel from "@/components/OperationsPanel";
import StatusBar from "@/components/StatusBar";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  imageToSparseMatrix,
  computeStats,
  type SparseMatrix,
} from "@/lib/sparse-matrix";
import { apiAdd, apiSubtract, apiMultiply, apiTranspose, checkBackendHealth } from "@/lib/api";

const Index = () => {
  const { toast } = useToast();

  const [sparseA, setSparseA] = useState<SparseMatrix | null>(null);
  const [sparseB, setSparseB] = useState<SparseMatrix | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [resultSparse, setResultSparse] = useState<SparseMatrix | null>(null);
  const [processing, setProcessing] = useState(false);

  // ── Image refs ──
  // We store the original HTMLImageElement here so we can re-run
  // imageToSparseMatrix when the threshold slider changes.
  // useRef — not useState — because storing the element should NOT
  // trigger a re-render on its own. It's just a data hold.
  const imgARef = useRef<HTMLImageElement | null>(null);
  const imgBRef = useRef<HTMLImageElement | null>(null);

  // ── Recompute matrices when threshold changes ──
  // Debounced: 120ms after the user stops dragging.
  // Without this, every drag pixel fires a full image recompute → UI freeze.
  // The cleanup function cancels the timeout if threshold changes again
  // before 120ms — so only the final resting value triggers the work.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imgARef.current) {
        setSparseA(imageToSparseMatrix(imgARef.current, threshold));
      }
      if (imgBRef.current) {
        const sb = imageToSparseMatrix(imgBRef.current, threshold);
        setSparseB(sb);
        // Re-run dimension check with fresh matrices at new threshold
        // sparseA here is the OLD value — use the recomputed one for accurate check
        if (imgARef.current) {
          const sa = imageToSparseMatrix(imgARef.current, threshold);
          if (sa.rows !== sb.rows || sa.cols !== sb.cols) {
            toast({
              variant: "destructive",
              title: "Resolution mismatch",
              description: `Image A is ${sa.cols}×${sa.rows}px, Image B is ${sb.cols}×${sb.rows}px. Addition and subtraction require identical dimensions.`,
            });
          }
        }
      }
      // Clear any stale result — it was computed at the old threshold
      setResultSparse(null);
    }, 120);

    return () => clearTimeout(timer); // cleanup on next render
  }, [threshold]); // eslint-disable-line react-hooks/exhaustive-deps
  // toast intentionally excluded from deps — it's stable, adding it
  // would cause the effect to re-register on every render needlessly.

  const handleImageA = useCallback(
    (img: HTMLImageElement | null) => {
      imgARef.current = img; // store ref first
      if (!img) { setSparseA(null); return; }
      setSparseA(imageToSparseMatrix(img, threshold));
    },
    [threshold]
  );

  const handleImageB = useCallback(
    (img: HTMLImageElement | null) => {
      imgBRef.current = img; // store ref first
      if (!img) { setSparseB(null); return; }
      const sb = imageToSparseMatrix(img, threshold);
      setSparseB(sb);

      // ── Early dimension warning ──
      if (sparseA && (sb.rows !== sparseA.rows || sb.cols !== sparseA.cols)) {
        toast({
          variant: "destructive",
          title: "Resolution mismatch",
          description: `Image A is ${sparseA.cols}×${sparseA.rows}px, Image B is ${sb.cols}×${sb.rows}px. Addition and subtraction require identical dimensions. Upload images of the same resolution.`,
        });
      }
    },
    [threshold, sparseA, toast]
  );

  // ── Backend health check on mount ──
  // Agar server chal nahi raha toh user ko pehle hi bata do.
  // Warna wo operation click karega aur generic "fetch failed" aayega.
  useEffect(() => {
    checkBackendHealth().then((ok) => {
      if (!ok) {
        toast({
          variant: "destructive",
          title: "Backend unreachable",
          description: "FastAPI server not running on localhost:8000. Start: uvicorn main:app --reload",
        });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePerform = useCallback(
    async (operation: string) => {
      if (!sparseA) return;

      // ── Dimension guards ──
      if (operation === "ADDITION" || operation === "SUBTRACTION") {
        if (!sparseB) {
          toast({ variant: "destructive", title: "Image B required", description: "Upload a second image to perform this operation." });
          return;
        }
        if (sparseA.rows !== sparseB.rows || sparseA.cols !== sparseB.cols) {
          toast({
            variant: "destructive",
            title: "Dimension mismatch",
            description: `${operation} requires identical dimensions. A is ${sparseA.cols}×${sparseA.rows}, B is ${sparseB.cols}×${sparseB.rows}.`,
          });
          return;
        }
      }

      if (operation === "MULTIPLICATION") {
        if (!sparseB) {
          toast({ variant: "destructive", title: "Image B required", description: "Upload a second image to perform this operation." });
          return;
        }
        if (sparseA.cols !== sparseB.rows) {
          toast({
            variant: "destructive",
            title: "Dimension mismatch",
            description: `Multiplication requires A.cols = B.rows. A.cols=${sparseA.cols}, B.rows=${sparseB.rows}.`,
          });
          return;
        }
      }

      setProcessing(true);

      // No requestAnimationFrame needed — await naturally yields to event loop
      // so React flushes processing=true before the fetch goes out.
      try {
        let result: SparseMatrix;

        switch (operation) {
          case "ADDITION":
            result = await apiAdd(sparseA, sparseB!, threshold);
            break;
          case "SUBTRACTION":
            result = await apiSubtract(sparseA, sparseB!, threshold);
            break;
          case "MULTIPLICATION":
            result = await apiMultiply(sparseA, sparseB!, threshold);
            break;
          case "TRANSPOSE":
            result = await apiTranspose(sparseA, threshold);
            break;
          default:
            return;
        }

        setResultSparse(result);
        toast({
          title: "Operation complete",
          description: `${operation} produced ${result.entries.length.toLocaleString()} non-zero entries.`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({ variant: "destructive", title: "Operation failed", description: message });
        console.error(`Operation "${operation}" failed:`, err);
      } finally {
        setProcessing(false);
      }
    },
    [sparseA, sparseB, threshold, toast]
  );

  const stats = resultSparse ? computeStats(resultSparse) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col animate-flicker">
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanline-overlay z-50" />

      <MatrixHeader />

      <main className="flex-1 p-6 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-xl font-bold text-foreground text-glow tracking-wide">
            Tactical Sparse Matrix Engine
          </h2>
          <p className="text-[11px] text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            This interface demonstrates high-performance sparse matrix operations leveraging optimized C backends.
            By representing only non-zero elements, we achieve significant memory compression and computational
            speedups for large-scale image processing and topology mapping.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="panel p-4 relative z-10"
        >
          <StepGuide />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left: Image Scanners + Sparse */}
          <div className="col-span-8 grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <ImageScanner label="Source Image A" icon="camera_front" onImageLoad={handleImageA} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <ImageScanner label="Source Image B" icon="camera_rear" onImageLoad={handleImageB} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <SparsePanel resultSparse={resultSparse} processing={processing} />
            </motion.div>
          </div>

          {/* Right: Controls */}
          <div className="col-span-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <ThresholdSlider value={threshold} onChange={setThreshold} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <OperationsPanel
                onPerform={handlePerform}
                hasImageA={!!sparseA}
                hasImageB={!!sparseB}
              />
            </motion.div>
          </div>
        </div>
      </main>

      <StatusBar
        density={stats?.density ?? null}
        nnz={stats?.nnz ?? null}
        compressionRatio={stats?.compressionRatio ?? null}
      />
      {/* Toaster must be mounted for toasts to render */}
      <Toaster />
    </div>
  );
};

export default Index;