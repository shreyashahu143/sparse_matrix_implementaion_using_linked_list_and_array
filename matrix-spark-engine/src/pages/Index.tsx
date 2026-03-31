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

type Representation = "ARRAY" | "LINKEDLIST";

const Index = () => {
  const { toast } = useToast();

  const [sparseA, setSparseA] = useState<SparseMatrix | null>(null);
  const [sparseB, setSparseB] = useState<SparseMatrix | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [resultSparse, setResultSparse] = useState<SparseMatrix | null>(null);
  const [processing, setProcessing] = useState(false);

  // "ARRAY" → sparse_array.exe, "LINKEDLIST" → sparse_linkedlist.exe
  // This gets passed to every API call so FastAPI routes to the correct binary.
  const [representation, setRepresentation] = useState<Representation>("LINKEDLIST");

  // ── Image refs ──
  const imgARef = useRef<HTMLImageElement | null>(null);
  const imgBRef = useRef<HTMLImageElement | null>(null);

  // ── Recompute matrices when threshold changes (debounced 120ms) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imgARef.current) {
        setSparseA(imageToSparseMatrix(imgARef.current, threshold));
      }
      if (imgBRef.current) {
        const sb = imageToSparseMatrix(imgBRef.current, threshold);
        setSparseB(sb);
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
      setResultSparse(null);
    }, 120);
    return () => clearTimeout(timer);
  }, [threshold]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageA = useCallback(
    (img: HTMLImageElement | null) => {
      imgARef.current = img;
      if (!img) { setSparseA(null); return; }
      setSparseA(imageToSparseMatrix(img, threshold));
    },
    [threshold]
  );

  const handleImageB = useCallback(
    (img: HTMLImageElement | null) => {
      imgBRef.current = img;
      if (!img) { setSparseB(null); return; }
      const sb = imageToSparseMatrix(img, threshold);
      setSparseB(sb);
      if (sparseA && (sb.rows !== sparseA.rows || sb.cols !== sparseA.cols)) {
        toast({
          variant: "destructive",
          title: "Resolution mismatch",
          description: `Image A is ${sparseA.cols}×${sparseA.rows}px, Image B is ${sb.cols}×${sb.rows}px. Addition and subtraction require identical dimensions.`,
        });
      }
    },
    [threshold, sparseA, toast]
  );

  // ── Backend health check on mount ──
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

      try {
        let result: SparseMatrix;

        // representation is passed to every API call so FastAPI knows
        // which binary to invoke: sparse_array.exe or sparse_linkedlist.exe
        switch (operation) {
          case "ADDITION":
            result = await apiAdd(sparseA, sparseB!, threshold, representation);
            break;
          case "SUBTRACTION":
            result = await apiSubtract(sparseA, sparseB!, threshold, representation);
            break;
          case "MULTIPLICATION":
            result = await apiMultiply(sparseA, sparseB!, threshold, representation);
            break;
          case "TRANSPOSE":
            result = await apiTranspose(sparseA, threshold, representation);
            break;
          default:
            return;
        }

        setResultSparse(result);
        toast({
          title: "Operation complete",
          description: `${operation} via ${representation} produced ${result.entries.length.toLocaleString()} non-zero entries.`,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({ variant: "destructive", title: "Operation failed", description: message });
        console.error(`Operation "${operation}" failed:`, err);
      } finally {
        setProcessing(false);
      }
    },
    [sparseA, sparseB, threshold, representation, toast]
  );

  const stats = resultSparse ? computeStats(resultSparse) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col animate-flicker">
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

        {/* Representation Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="panel p-3 flex items-center gap-4"
        >
          <span className="text-[11px] text-muted-foreground uppercase tracking-widest">
            Storage Model
          </span>
          <div className="flex gap-2">
            {(["LINKEDLIST", "ARRAY"] as Representation[]).map((rep) => (
              <button
                key={rep}
                onClick={() => setRepresentation(rep)}
                className={`px-3 py-1 text-[11px] uppercase tracking-widest border transition-colors ${
                  representation === rep
                    ? "border-primary text-primary bg-primary/10"
                    : "border-muted text-muted-foreground hover:border-primary/50"
                }`}
              >
                {rep === "LINKEDLIST" ? "Linked List" : "Array"}
              </button>
            ))}
          </div>
          {/* Shows which binary will be called — useful for demo */}
          <span className="text-[10px] text-muted-foreground ml-auto font-mono">
            → {representation === "LINKEDLIST" ? "linkedlist.exe" : "sparse_array.exe"}
          </span>
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
      <Toaster />
    </div>
  );
};

export default Index;