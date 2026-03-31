import { toAPIPayload, type SparseMatrix, type SparseMatrixPayload } from "./sparse-matrix";

const BASE_URL = "http://localhost:8000";

interface SparseResult {
  entries: [number, number, number][];
  rows: number;
  cols: number;
  nnz: number;
}

function resultToSparseMatrix(result: SparseResult): SparseMatrix {
  return {
    rows: result.rows,
    cols: result.cols,
    entries: result.entries.map(([row, col, value]) => ({ row, col, value })),
  };
}

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Public API functions ──
// representation = "ARRAY" | "LINKEDLIST"
// FastAPI uses this to pick the correct .exe

export async function apiAdd(
  a: SparseMatrix,
  b: SparseMatrix,
  threshold: number,
  representation: "ARRAY" | "LINKEDLIST"
): Promise<SparseMatrix> {
  const result = await post<SparseResult>("/sparse/add", {
    a: toAPIPayload(a, threshold),
    b: toAPIPayload(b, threshold),
    representation,
  });
  return resultToSparseMatrix(result);
}

export async function apiSubtract(
  a: SparseMatrix,
  b: SparseMatrix,
  threshold: number,
  representation: "ARRAY" | "LINKEDLIST"
): Promise<SparseMatrix> {
  const result = await post<SparseResult>("/sparse/subtract", {
    a: toAPIPayload(a, threshold),
    b: toAPIPayload(b, threshold),
    representation,
  });
  return resultToSparseMatrix(result);
}

export async function apiMultiply(
  a: SparseMatrix,
  b: SparseMatrix,
  threshold: number,
  representation: "ARRAY" | "LINKEDLIST"
): Promise<SparseMatrix> {
  const result = await post<SparseResult>("/sparse/multiply", {
    a: toAPIPayload(a, threshold),
    b: toAPIPayload(b, threshold),
    representation,
  });
  return resultToSparseMatrix(result);
}

export async function apiTranspose(
  a: SparseMatrix,
  threshold: number,
  representation: "ARRAY" | "LINKEDLIST"
): Promise<SparseMatrix> {
  const result = await post<SparseResult>("/sparse/transpose", {
    a: toAPIPayload(a, threshold),
    representation,
  });
  return resultToSparseMatrix(result);
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}