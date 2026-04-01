// ── Sparse Matrix representation & operations ──

export interface SparseEntry {
  row: number;
  col: number;
  value: number;
}

export interface SparseMatrix {
  rows: number;
  cols: number;
  entries: SparseEntry[];
}

// ── API Payload type (what gets sent to FastAPI) ──
export interface SparseMatrixPayload {
  width: number;
  height: number;
  threshold: number;
  format: "COO";
  entries: [number, number, number][]; // [row, col, value] triplets — compact, no object overhead
}

// ──────────────────────────────────────────────────────────────
// imageToSparseMatrix
//
// Single-pass conversion: raw image → sparse matrix
// NO intermediate dense number[][] allocated.
// maxSize = 0 means full resolution (default).
// Set maxSize > 0 only when you explicitly want a preview/thumbnail.
// ──────────────────────────────────────────────────────────────
export function imageToSparseMatrix(
  img: HTMLImageElement,
  threshold: number,
  maxSize = 0
): SparseMatrix {
  const canvas = document.createElement("canvas");

  const scale =
    maxSize > 0
      ? Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
      : 1;

  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const entries: SparseEntry[] = [];

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = (r * w + c) * 4;
      // ITU-R BT.601 luminance weights
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      // Keep values AT or ABOVE threshold (signal), discard noise below
      if (gray >= threshold) {
        entries.push({ row: r, col: c, value: gray });
      }
    }
  }

  return { rows: h, cols: w, entries };
}

// ──────────────────────────────────────────────────────────────
// toAPIPayload
//
// Converts SparseMatrix to the wire format sent to FastAPI.
// Uses flat [row, col, value] triplets instead of objects —
// meaningfully smaller JSON for large matrices.
// ──────────────────────────────────────────────────────────────
export function toAPIPayload(
  sp: SparseMatrix,
  threshold: number
): SparseMatrixPayload {
  return {
    width: sp.cols,
    height: sp.rows,
    threshold,
    format: "COO",
    entries: sp.entries.map((e) => [e.row, e.col, e.value]),
  };
}

// ──────────────────────────────────────────────────────────────
// LOCAL operations (used before API is wired up)
// These stay in the frontend for now.
// Once FastAPI + C engine is ready, replace call sites with
// API calls and delete these — don't maintain two versions.
// ──────────────────────────────────────────────────────────────

function entryKey(r: number, c: number): string {
  return `${r},${c}`;
}

function toMap(sp: SparseMatrix): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of sp.entries) m.set(entryKey(e.row, e.col), e.value);
  return m;
}

function mapToEntries(m: Map<string, number>): SparseEntry[] {
  const entries: SparseEntry[] = [];
  m.forEach((value, key) => {
    if (value !== 0) {
      const [r, c] = key.split(",").map(Number);
      entries.push({ row: r, col: c, value });
    }
  });
  return entries;
}

export function addSparse(a: SparseMatrix, b: SparseMatrix): SparseMatrix {
  if (a.rows !== b.rows || a.cols !== b.cols) {
    throw new Error(
      `Dimension mismatch: (${a.rows}×${a.cols}) + (${b.rows}×${b.cols})`
    );
  }
  const ma = toMap(a);
  const mb = toMap(b);
  const result = new Map<string, number>();
  const allKeys = new Set([...ma.keys(), ...mb.keys()]);
  allKeys.forEach((k) => {
    result.set(k, (ma.get(k) ?? 0) + (mb.get(k) ?? 0));
  });
  return {
    rows: a.rows,
    cols: a.cols,
    entries: mapToEntries(result),
  };
}

export function subtractSparse(a: SparseMatrix, b: SparseMatrix): SparseMatrix {
  if (a.rows !== b.rows || a.cols !== b.cols) {
    throw new Error(
      `Dimension mismatch: (${a.rows}×${a.cols}) - (${b.rows}×${b.cols})`
    );
  }
  const ma = toMap(a);
  const mb = toMap(b);
  const result = new Map<string, number>();
  const allKeys = new Set([...ma.keys(), ...mb.keys()]);
  allKeys.forEach((k) => {
    result.set(k, (ma.get(k) ?? 0) - (mb.get(k) ?? 0));
  });
  return {
    rows: a.rows,
    cols: a.cols,
    entries: mapToEntries(result),
  };
}

export function multiplySparse(a: SparseMatrix, b: SparseMatrix): SparseMatrix {
  if (a.cols !== b.rows) {
    throw new Error(
      `Dimension mismatch for multiply: a.cols=${a.cols} must equal b.rows=${b.rows}`
    );
  }
  // Group B entries by row index for O(1) lookup per a entry
  const bByRow = new Map<number, { col: number; value: number }[]>();
  for (const e of b.entries) {
    if (!bByRow.has(e.row)) bByRow.set(e.row, []);
    bByRow.get(e.row)!.push({ col: e.col, value: e.value });
  }

  const result = new Map<string, number>();
  for (const ea of a.entries) {
    const bRow = bByRow.get(ea.col);
    if (!bRow) continue;
    for (const eb of bRow) {
      const key = entryKey(ea.row, eb.col);
      result.set(key, (result.get(key) ?? 0) + ea.value * eb.value);
    }
  }

  return {
    rows: a.rows,
    cols: b.cols,
    entries: mapToEntries(result),
  };
}

export function transposeSparse(a: SparseMatrix): SparseMatrix {
  return {
    rows: a.cols,
    cols: a.rows,
    entries: a.entries.map((e) => ({ row: e.col, col: e.row, value: e.value })),
  };
}

// ── Stats ──
export interface SparseStats {
  nnz: number;
  totalCells: number;
  density: number;        // percentage of non-zero cells
  compressionRatio: number; // totalCells / nnz
  sparsityPercent: number;  // 100 - density, more intuitive to display
}

export function computeStats(sp: SparseMatrix): SparseStats {
  const totalCells = sp.rows * sp.cols;
  const nnz = sp.entries.length;
  const density = totalCells > 0 ? (nnz / totalCells) * 100 : 0;
  const compressionRatio = nnz > 0 ? totalCells / nnz : 0;
  const sparsityPercent = 100 - density;
  return { nnz, totalCells, density, compressionRatio, sparsityPercent };
}