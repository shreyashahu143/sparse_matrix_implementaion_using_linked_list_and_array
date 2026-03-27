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

// ── Extract grayscale pixel matrix from an image via canvas ──
export function imageToGrayscaleMatrix(
  img: HTMLImageElement,
  maxSize = 100
): { matrix: number[][]; width: number; height: number } {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const matrix: number[][] = [];
  for (let r = 0; r < h; r++) {
    const row: number[] = [];
    for (let c = 0; c < w; c++) {
      const i = (r * w + c) * 4;
      // luminance
      row.push(Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]));
    }
    matrix.push(row);
  }
  return { matrix, width: w, height: h };
}

// ── Sparsify: zero out values below threshold ──
export function sparsify(matrix: number[][], threshold: number): SparseMatrix {
  const entries: SparseEntry[] = [];
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] >= threshold) {
        entries.push({ row: r, col: c, value: matrix[r][c] });
      }
    }
  }
  return { rows, cols, entries };
}

// ── Operations ──

function entryKey(r: number, c: number) {
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
  const ma = toMap(a);
  const mb = toMap(b);
  const result = new Map<string, number>();
  const allKeys = new Set([...ma.keys(), ...mb.keys()]);
  allKeys.forEach((k) => {
    result.set(k, (ma.get(k) ?? 0) + (mb.get(k) ?? 0));
  });
  return {
    rows: Math.max(a.rows, b.rows),
    cols: Math.max(a.cols, b.cols),
    entries: mapToEntries(result),
  };
}

export function subtractSparse(a: SparseMatrix, b: SparseMatrix): SparseMatrix {
  const ma = toMap(a);
  const mb = toMap(b);
  const result = new Map<string, number>();
  const allKeys = new Set([...ma.keys(), ...mb.keys()]);
  allKeys.forEach((k) => {
    result.set(k, (ma.get(k) ?? 0) - (mb.get(k) ?? 0));
  });
  return {
    rows: Math.max(a.rows, b.rows),
    cols: Math.max(a.cols, b.cols),
    entries: mapToEntries(result),
  };
}

export function multiplySparse(a: SparseMatrix, b: SparseMatrix): SparseMatrix {
  // Group B entries by row for fast lookup
  const bByRow = new Map<number, { col: number; value: number }[]>();
  for (const e of b.entries) {
    if (!bByRow.has(e.row)) bByRow.set(e.row, []);
    bByRow.get(e.row)!.push({ col: e.col, value: e.value });
  }

  const result = new Map<string, number>();
  for (const ea of a.entries) {
    const bRow = bByRow.get(ea.col); // a.col must match b.row
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
export function computeStats(sp: SparseMatrix) {
  const totalCells = sp.rows * sp.cols;
  const nnz = sp.entries.length;
  const density = totalCells > 0 ? (nnz / totalCells) * 100 : 0;
  const compressionRatio = nnz > 0 ? totalCells / nnz : 0;
  return { nnz, density, compressionRatio, totalCells };
}
