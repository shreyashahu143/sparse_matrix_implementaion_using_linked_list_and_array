import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const MatrixHeader = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isLearn = location.pathname === "/learn";

  return (
    <header className="border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <motion.h1
          className="font-display text-lg font-bold text-primary text-glow tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          MATRIX_CMD
        </motion.h1>
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
              isHome
                ? "text-foreground bg-muted border-border hover:border-primary/50"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/learn"
            className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
              isLearn
                ? "text-foreground bg-muted border-border hover:border-primary/50"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            Learn
          </Link>
          <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Kernels
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground tracking-wider uppercase">System Status</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-[10px] text-primary font-semibold tracking-wider">ONLINE</span>
        </div>
      </div>
    </header>
  );
};

export default MatrixHeader;
