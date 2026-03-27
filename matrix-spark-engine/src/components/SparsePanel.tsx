import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { computeStats, type SparseMatrix } from "@/lib/sparse-matrix";

interface SparsePanelProps {
  resultSparse?: SparseMatrix | null;
  processing?: boolean;
}

const SparsePanel = ({ resultSparse, processing }: SparsePanelProps) => {
  const [dots, setDots] = useState<{ x: number; y: number; opacity: number }[]>([]);

  const stats = useMemo(() => {
    if (!resultSparse) return null;
    return computeStats(resultSparse);
  }, [resultSparse]);

  // Convert sparse entries into dot positions for visualization
  useEffect(() => {
    if (resultSparse && resultSparse.entries.length > 0) {
      const maxDots = 200; // cap for performance
      const entries = resultSparse.entries;
      const step = Math.max(1, Math.floor(entries.length / maxDots));
      const mapped = [];
      for (let i = 0; i < entries.length && mapped.length < maxDots; i += step) {
        const e = entries[i];
        mapped.push({
          x: resultSparse.cols > 0 ? (e.col / resultSparse.cols) * 100 : Math.random() * 100,
          y: resultSparse.rows > 0 ? (e.row / resultSparse.rows) * 100 : Math.random() * 100,
          opacity: Math.min(1, Math.abs(e.value) / 255) * 0.7 + 0.3,
        });
      }
      setDots(mapped);
    } else if (!resultSparse) {
      // Default random dots when no result yet
      const generated = Array.from({ length: 60 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.7 + 0.3,
      }));
      setDots(generated);
    }
  }, [resultSparse]);

  return (
    <div className="panel p-4 relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-display font-semibold text-accent tracking-wider">
          Sparse Representation
        </span>
      </div>

      <div className="relative w-full aspect-square border border-border rounded-sm bg-background/50 overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 grid-bg" />

        {/* Processing overlay */}
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <span className="text-[9px] text-primary font-display tracking-widest animate-pulse">COMPUTING...</span>
          </div>
        )}

        {/* Sparse dots */}
        {dots.map((dot, i) => (
          <motion.div
            key={`${i}-${dot.x}-${dot.y}`}
            className="absolute w-1 h-1 rounded-full bg-primary"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              opacity: dot.opacity,
              boxShadow: "0 0 4px hsl(160 100% 45% / 0.6)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.005, duration: 0.3 }}
          />
        ))}

        {/* Corner brackets */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-accent/30" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-accent/30" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-accent/30" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-accent/30" />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">Compression Ratio:</span>
        <span className="text-[10px] font-display text-accent font-bold">
          {stats ? `1:${stats.compressionRatio.toFixed(1)}` : "1:14.2"}
        </span>
      </div>
    </div>
  );
};

export default SparsePanel;
