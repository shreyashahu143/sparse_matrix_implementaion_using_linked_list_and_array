interface ThresholdSliderProps {
  value: number;
  onChange: (v: number) => void;
}

const ThresholdSlider = ({ value, onChange }: ThresholdSliderProps) => {
  return (
    <div className="panel p-4 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-display font-semibold text-foreground tracking-wider">
          Threshold Logic
        </span>
        <span className="text-[10px] font-display text-primary font-bold text-glow">{value}</span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={255}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 appearance-none bg-muted rounded-full cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(160_100%_45%/0.6)]
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div
          className="absolute top-0 left-0 h-1 bg-primary/30 rounded-full pointer-events-none"
          style={{ width: `${(value / 255) * 100}%` }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-[8px] text-muted-foreground">0</span>
        <span className="text-[8px] text-muted-foreground">255</span>
      </div>

      <div className="mt-3 border border-border/50 rounded-sm p-2.5 bg-muted/5 space-y-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="material-symbols-outlined text-secondary text-xs">info</span>
          <span className="text-[9px] font-display font-semibold text-secondary tracking-wider">WHAT IS SPARSIFICATION SENSITIVITY?</span>
        </div>
        <p className="text-[8px] text-muted-foreground leading-relaxed">
          An image is made of tiny dots called <strong className="text-foreground">pixels</strong>, each with a brightness value from <strong className="text-foreground">0</strong> (black) to <strong className="text-foreground">255</strong> (white).
        </p>
        <p className="text-[8px] text-muted-foreground leading-relaxed">
          This slider sets a <strong className="text-foreground">cutoff point</strong>. Any pixel <strong className="text-foreground">darker</strong> than the chosen value is treated as zero — meaning "nothing important here." The matrix then only stores the remaining bright pixels, saving memory.
        </p>
        <p className="text-[8px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Low value (e.g. 30)</strong> → keeps most pixels → less compression.<br/>
          <strong className="text-foreground">High value (e.g. 200)</strong> → removes more pixels → greater compression.<br/>
          <strong className="text-foreground">128</strong> is a good starting point for balanced results.
        </p>
      </div>
    </div>
  );
};

export default ThresholdSlider;
