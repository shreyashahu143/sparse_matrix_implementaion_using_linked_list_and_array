import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type Strategy = "array" | "linked" | null;

const operations = [
  { label: "ADDITION", icon: "add", color: "primary" },
  { label: "SUBTRACTION", icon: "remove", color: "primary" },
  { label: "MULTIPLICATION", icon: "close", color: "primary" },
  { label: "TRANSPOSE", icon: "swap_calls", color: "primary" },
];

interface OperationsPanelProps {
  onPerform: (operation: string) => void;
  hasImageA: boolean;
  hasImageB: boolean;
}

const OperationsPanel = ({ onPerform, hasImageA, hasImageB }: OperationsPanelProps) => {
  const [strategy, setStrategy] = useState<Strategy>(null);
  const [activeOp, setActiveOp] = useState<string | null>(null);

  const unlocked = strategy !== null;

  const handlePerform = () => {
    if (!activeOp) return;
    if (!hasImageA) {
      toast.error("Upload Source Image A first");
      return;
    }
    if (activeOp !== "TRANSPOSE" && !hasImageB) {
      toast.error("Upload Source Image B for this operation");
      return;
    }
    onPerform(activeOp);
    toast.success(`${activeOp} executed via ${strategy === "array" ? "Array" : "Linked List"} mode`);
  };

  return (
    <div className="panel p-4 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-display font-semibold text-foreground tracking-wider">
          Phase 4: Operation CMD
        </span>
      </div>

      {/* Strategy Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setStrategy("array")}
          className={`flex-1 py-2 text-[10px] font-display font-semibold tracking-wider rounded-sm border transition-all ${
            strategy === "array"
              ? "border-primary bg-primary/10 text-primary text-glow"
              : "border-border text-muted-foreground hover:border-primary/30"
          }`}
        >
          Array Mode
        </button>
        <button
          onClick={() => setStrategy("linked")}
          className={`flex-1 py-2 text-[10px] font-display font-semibold tracking-wider rounded-sm border transition-all ${
            strategy === "linked"
              ? "border-secondary bg-secondary/10 text-secondary text-glow-cyan"
              : "border-border text-muted-foreground hover:border-secondary/30"
          }`}
        >
          Linked List
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] text-muted-foreground">Storage Strategy</span>
        <span className="text-[9px] text-muted-foreground">Mode:</span>
        <span className={`text-[9px] font-semibold ${strategy ? "text-primary" : "text-accent"}`}>
          {strategy ? (strategy === "array" ? "ARRAY" : "LINKED_LIST") : "Pending"}
        </span>
      </div>

      {/* Lock / Operations */}
      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-dashed border-muted-foreground/20 rounded-sm p-6 flex flex-col items-center gap-2"
          >
            <span className="material-symbols-outlined text-muted-foreground/30 text-2xl">lock</span>
            <span className="text-[9px] text-muted-foreground text-center">
              Select Strategy<br />to Unlock Operations
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <span className="material-symbols-outlined text-primary text-xs">lock_open</span>
              <span className="text-[9px] text-primary font-semibold tracking-wider">Unlocked</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {operations.map((op) => (
                <button
                  key={op.label}
                  onClick={() => setActiveOp(activeOp === op.label ? null : op.label)}
                  className={`py-2.5 px-2 text-[9px] font-display font-semibold tracking-wider rounded-sm border transition-all flex items-center justify-center gap-1.5 ${
                    activeOp === op.label
                      ? "border-primary bg-primary/15 text-primary glow-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px]">{op.label}</span>
                  <span className="material-symbols-outlined text-xs">{op.icon}</span>
                </button>
              ))}
            </div>

            {/* Perform Button */}
            <AnimatePresence>
              {activeOp && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  onClick={handlePerform}
                  className="w-full mt-3 py-2.5 text-[10px] font-display font-bold tracking-widest rounded-sm border border-primary bg-primary/20 text-primary text-glow hover:bg-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  PERFORM {activeOp}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OperationsPanel;
