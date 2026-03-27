import { motion } from "framer-motion";
import MatrixHeader from "@/components/MatrixHeader";
import StatusBar from "@/components/StatusBar";

const sectionVariant = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

const Learn = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col animate-flicker">
      <div className="fixed inset-0 scanline-overlay z-50 pointer-events-none" />
      <MatrixHeader />

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8">
        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h2 className="font-display text-xl font-bold text-foreground text-glow tracking-wide">
            Knowledge Base
          </h2>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Everything you need to understand what sparse matrices are, why they matter, and how this tool works.
          </p>
        </motion.div>

        {/* Section 1 — What is a Sparse Matrix */}
        <motion.section custom={0} initial="hidden" animate="visible" variants={sectionVariant} className="panel p-5 relative z-10 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-base">grid_on</span>
            <h3 className="font-display text-sm font-bold text-foreground tracking-wider">What is a Sparse Matrix?</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            A <strong className="text-foreground">matrix</strong> is simply a grid of numbers arranged in rows and columns — like a spreadsheet. A <strong className="text-foreground">sparse matrix</strong> is a matrix where <strong className="text-primary">most of the values are zero</strong>.
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Imagine a 1000×1000 grid (1 million cells). If only 5,000 cells have actual values and the rest are zero, storing all 1 million numbers wastes memory. A sparse matrix format stores <strong className="text-foreground">only the non-zero values</strong> along with their positions, dramatically reducing memory usage.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="border border-border rounded-sm p-3 bg-muted/5">
              <span className="text-[9px] font-display font-semibold text-accent tracking-wider">DENSE (wasteful)</span>
              <pre className="text-[9px] text-muted-foreground mt-1.5 font-mono leading-relaxed">
{`0  0  0  5
0  0  0  0
0  3  0  0
0  0  0  0`}
              </pre>
              <span className="text-[8px] text-muted-foreground mt-1 block">Stores all 16 values</span>
            </div>
            <div className="border border-primary/30 rounded-sm p-3 bg-primary/5">
              <span className="text-[9px] font-display font-semibold text-primary tracking-wider">SPARSE (efficient)</span>
              <pre className="text-[9px] text-primary/80 mt-1.5 font-mono leading-relaxed">
{`(0,3) → 5
(2,1) → 3`}
              </pre>
              <span className="text-[8px] text-muted-foreground mt-1 block">Stores only 2 entries</span>
            </div>
          </div>
        </motion.section>

        {/* Section 2 — Why Images? */}
        <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariant} className="panel p-5 relative z-10 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-secondary text-base">image</span>
            <h3 className="font-display text-sm font-bold text-foreground tracking-wider">Why Use Images as Input?</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Typing a large matrix by hand is tedious and error-prone. But every <strong className="text-foreground">digital image is already a matrix</strong> — each pixel is a number representing brightness (0 = black, 255 = white).
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            By uploading an image, you instantly get a real-world matrix with thousands of values. The <strong className="text-foreground">Threshold Slider</strong> then converts it into a sparse matrix by setting dark pixels (below the threshold) to zero. This lets you visually see how sparsification works — and then perform operations like addition, subtraction, and transposition on real data.
          </p>
          <div className="border border-secondary/30 rounded-sm p-3 bg-secondary/5 mt-2">
            <span className="text-[9px] font-display font-semibold text-secondary tracking-wider">FLOW</span>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {["Upload Image", "→ Pixel Matrix", "→ Apply Threshold", "→ Sparse Matrix", "→ Perform Operations"].map((step, i) => (
                <span key={i} className={`text-[9px] px-2 py-1 rounded-sm border ${i === 0 || i === 4 ? "border-primary/40 text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
                  {step}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Section 3 — Operations */}
        <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariant} className="panel p-5 relative z-10 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-base">calculate</span>
            <h3 className="font-display text-sm font-bold text-foreground tracking-wider">Sparse Matrix Operations</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "ADDITION", icon: "add", desc: "Combines two matrices by adding corresponding values. Only non-zero positions from either matrix need processing." },
              { name: "SUBTRACTION", icon: "remove", desc: "Finds the difference between two matrices. Useful for detecting changes between two images." },
              { name: "MULTIPLICATION", icon: "close", desc: "Multiplies two matrices following linear algebra rules. Sparse formats skip entire zero rows/columns." },
              { name: "TRANSPOSE", icon: "swap_calls", desc: "Flips rows and columns. Position (i,j) becomes (j,i). Rearranges the storage structure." },
            ].map((op) => (
              <div key={op.name} className="border border-border rounded-sm p-3 bg-muted/5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-primary text-xs">{op.icon}</span>
                  <span className="text-[9px] font-display font-semibold text-foreground tracking-wider">{op.name}</span>
                </div>
                <p className="text-[8px] text-muted-foreground leading-relaxed">{op.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Section 4 — Array vs Linked List */}
        <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariant} className="panel p-5 relative z-10 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-accent text-base">storage</span>
            <h3 className="font-display text-sm font-bold text-foreground tracking-wider">Storage Strategies: Array vs Linked List</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Once we know which values are non-zero, we need to <strong className="text-foreground">store them efficiently</strong>. Two common approaches:
          </p>

          <div className="grid grid-cols-2 gap-4 mt-2">
            {/* Array */}
            <div className="border border-primary/30 rounded-sm p-4 bg-primary/5 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-sm">view_array</span>
                <span className="text-[10px] font-display font-bold text-primary tracking-wider">ARRAY MODE</span>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed">
                Stores non-zero values in <strong className="text-foreground">three parallel arrays</strong>: one for row indices, one for column indices, and one for the values.
              </p>
              <pre className="text-[8px] text-primary/70 font-mono bg-background/50 p-2 rounded-sm">
{`Row:    [0, 2]
Col:    [3, 1]
Value:  [5, 3]`}
              </pre>
              <div className="space-y-1 mt-1">
                <p className="text-[8px] text-primary/80">✓ Fast random access by index</p>
                <p className="text-[8px] text-primary/80">✓ Cache-friendly, great for bulk operations</p>
                <p className="text-[8px] text-primary/80">✓ Simple to implement</p>
                <p className="text-[8px] text-accent/80">✗ Inserting/deleting requires shifting elements</p>
              </div>
              <div className="border-t border-border/30 pt-2 mt-2">
                <span className="text-[8px] font-display font-semibold text-primary tracking-wider">BEST FOR</span>
                <p className="text-[8px] text-muted-foreground mt-0.5">Static matrices, batch processing, mathematical computations, image filters</p>
              </div>
            </div>

            {/* Linked List */}
            <div className="border border-secondary/30 rounded-sm p-4 bg-secondary/5 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-sm">link</span>
                <span className="text-[10px] font-display font-bold text-secondary tracking-wider">LINKED LIST</span>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed">
                Each non-zero element is a <strong className="text-foreground">node</strong> containing the value, position, and a pointer to the next node. Nodes are chained together.
              </p>
              <pre className="text-[8px] text-secondary/70 font-mono bg-background/50 p-2 rounded-sm">
{`[0,3,5] → [2,1,3] → null`}
              </pre>
              <div className="space-y-1 mt-1">
                <p className="text-[8px] text-secondary/80">✓ Easy insertion and deletion</p>
                <p className="text-[8px] text-secondary/80">✓ Dynamic size, no reallocation needed</p>
                <p className="text-[8px] text-secondary/80">✓ Efficient for frequently changing matrices</p>
                <p className="text-[8px] text-accent/80">✗ Slower traversal, no random access</p>
              </div>
              <div className="border-t border-border/30 pt-2 mt-2">
                <span className="text-[8px] font-display font-semibold text-secondary tracking-wider">BEST FOR</span>
                <p className="text-[8px] text-muted-foreground mt-0.5">Dynamic graphs, network topology, real-time updates, sparse systems that change over time</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 5 — Real World Use Cases */}
        <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariant} className="panel p-5 relative z-10 space-y-3 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-base">public</span>
            <h3 className="font-display text-sm font-bold text-foreground tracking-wider">Real-World Use Cases</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { title: "Search Engines", icon: "search", desc: "Google's PageRank uses sparse matrices to model billions of web page links." },
              { title: "Machine Learning", icon: "psychology", desc: "Neural network weight matrices are often sparse, enabling faster training and inference." },
              { title: "Image Processing", icon: "photo_filter", desc: "Filters, edge detection, and compression all leverage sparse representations." },
              { title: "Social Networks", icon: "group", desc: "Friendship graphs with millions of users but few connections per user are naturally sparse." },
              { title: "Scientific Simulation", icon: "science", desc: "Physics simulations (FEM, CFD) produce huge sparse systems of equations." },
              { title: "Recommendation Systems", icon: "recommend", desc: "User-item interaction matrices are extremely sparse (most items unrated)." },
            ].map((uc) => (
              <div key={uc.title} className="border border-border rounded-sm p-3 bg-muted/5 hover:border-primary/30 transition-colors">
                <span className="material-symbols-outlined text-primary text-sm">{uc.icon}</span>
                <span className="text-[9px] font-display font-semibold text-foreground tracking-wider block mt-1">{uc.title}</span>
                <p className="text-[8px] text-muted-foreground leading-relaxed mt-1">{uc.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      <StatusBar />
    </div>
  );
};

export default Learn;
