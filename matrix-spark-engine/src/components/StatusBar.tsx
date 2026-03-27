interface StatusBarProps {
  density?: number | null;
  nnz?: number | null;
  compressionRatio?: number | null;
}

const StatusBar = ({ density, nnz, compressionRatio }: StatusBarProps) => {
  const hasResult = density !== null && density !== undefined;

  return (
    <div className="border-t border-border px-6 py-2.5 flex items-center justify-between">
      <p className="text-[9px] text-muted-foreground">
        Optimization level set to <span className="text-primary">O3-AGGRESSIVE</span>. Memory fragmentation risk:{" "}
        <span className={hasResult ? "text-primary" : "text-accent"}>
          {hasResult ? "COMPUTED" : "PENDING"}
        </span>.
      </p>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Density Factor</span>
          <span className="text-[10px] font-display text-primary font-bold text-glow">
            {hasResult ? `${density!.toFixed(3)}%` : "0.024%"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Total NNZ</span>
          <span className="text-[10px] font-display text-secondary font-bold text-glow-cyan">
            {nnz != null ? nnz.toLocaleString() : "14,204"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
