import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import MatrixHeader from "@/components/MatrixHeader";
import StepGuide from "@/components/StepGuide";
import ImageScanner from "@/components/ImageScanner";
import SparsePanel from "@/components/SparsePanel";
import ThresholdSlider from "@/components/ThresholdSlider";
import OperationsPanel from "@/components/OperationsPanel";
import StatusBar from "@/components/StatusBar";
import {
  imageToGrayscaleMatrix,
  sparsify,
  addSparse,
  subtractSparse,
  multiplySparse,
  transposeSparse,
  computeStats,
  type SparseMatrix,
} from "@/lib/sparse-matrix";

const Index = () => {
  const [matrixA, setMatrixA] = useState<number[][] | null>(null);
  const [matrixB, setMatrixB] = useState<number[][] | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [resultSparse, setResultSparse] = useState<SparseMatrix | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleImageA = useCallback((img: HTMLImageElement | null) => {
    if (!img) { setMatrixA(null); return; }
    const { matrix } = imageToGrayscaleMatrix(img);
    setMatrixA(matrix);
  }, []);

  const handleImageB = useCallback((img: HTMLImageElement | null) => {
    if (!img) { setMatrixB(null); return; }
    const { matrix } = imageToGrayscaleMatrix(img);
    setMatrixB(matrix);
  }, []);

  const handlePerform = useCallback((operation: string) => {
    if (!matrixA) return;
    setProcessing(true);

    // Use requestAnimationFrame so the UI can show the processing state
    requestAnimationFrame(() => {
      const sparseA = sparsify(matrixA, threshold);

      let result: SparseMatrix;

      if (operation === "TRANSPOSE") {
        result = transposeSparse(sparseA);
      } else {
        if (!matrixB) {
          setProcessing(false);
          return;
        }
        const sparseB = sparsify(matrixB, threshold);

        switch (operation) {
          case "ADDITION":
            result = addSparse(sparseA, sparseB);
            break;
          case "SUBTRACTION":
            result = subtractSparse(sparseA, sparseB);
            break;
          case "MULTIPLICATION":
            result = multiplySparse(sparseA, sparseB);
            break;
          default:
            setProcessing(false);
            return;
        }
      }

      setResultSparse(result);
      setProcessing(false);
    });
  }, [matrixA, matrixB, threshold]);

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
                hasImageA={!!matrixA}
                hasImageB={!!matrixB}
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
    </div>
  );
};

export default Index;
