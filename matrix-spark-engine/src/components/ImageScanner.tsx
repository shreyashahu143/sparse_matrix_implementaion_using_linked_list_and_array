import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ImageScannerProps {
  label: string;
  icon: string;
  onImageLoad?: (img: HTMLImageElement | null) => void;
}

const ImageScanner = ({ label, icon, onImageLoad }: ImageScannerProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setImageSrc(src);
      setScanning(true);
      setTimeout(() => setScanning(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  // When imageSrc changes, load it as an HTMLImageElement and pass upstream
  useEffect(() => {
    if (!imageSrc) {
      onImageLoad?.(null);
      return;
    }
    const img = new Image();
    img.onload = () => onImageLoad?.(img);
    img.src = imageSrc;
  }, [imageSrc]); // intentionally omit onImageLoad to avoid re-triggering

  return (
    <div className="panel p-4 relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-secondary text-sm">{icon}</span>
        <span className="text-[10px] font-display font-semibold text-secondary tracking-wider text-glow-cyan">
          {label}
        </span>
      </div>

      <div
        className="relative w-full aspect-square border border-border rounded-sm bg-background/50 cursor-pointer overflow-hidden group"
        onClick={() => fileRef.current?.click()}
      >
        {imageSrc ? (
          <>
            <img src={imageSrc} alt={label} className="w-full h-full object-cover opacity-80" />
            {scanning && (
              <motion.div
                className="absolute inset-x-0 h-0.5 bg-primary/80 shadow-[0_0_15px_hsl(160_100%_45%/0.6)]"
                initial={{ top: 0 }}
                animate={{ top: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-8 h-8 border border-dashed border-muted-foreground/30 rounded-sm flex items-center justify-center">
              <span className="text-muted-foreground/40 text-lg">+</span>
            </div>
            <span className="text-[9px] text-muted-foreground tracking-wider uppercase animate-pulse-glow">
              SCANNING READY
            </span>
          </div>
        )}

        {/* Corner brackets */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-primary/30" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-primary/30" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-primary/30" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-primary/30" />
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default ImageScanner;
