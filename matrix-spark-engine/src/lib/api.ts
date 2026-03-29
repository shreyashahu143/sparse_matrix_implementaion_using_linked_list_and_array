// api.ts — all HTTP calls to FastAPI in one place
//
// Nothing in this file does any matrix math.
// It only knows how to: serialize payload → send → deserialize response.
// When backend URL changes (e.g. deployed), change BASE_URL here only.

import { toAPIPayload, type SparseMatrix, type SparseMatrixPayload } from "./sparse-matrix";

const BASE_URL = "http://localhost:8000";

// ── Response type from FastAPI ──
interface SparseResult {
  entries: [number, number, number][];
  rows: number;
  cols: number;
  nnz: number;
}

// ── Convert FastAPI response back to SparseMatrix ──
// Frontend works with SparseMatrix objects everywhere.
// This keeps the conversion in one place.
function resultToSparseMatrix(result: SparseResult): SparseMatrix {
  return {
    rows: result.rows,
    cols: result.cols,
    entries: result.entries.map(([row, col, value]) => ({ row, col, value })),
  };
}

// ── Generic POST helper ──
// All our endpoints are POST with JSON body — no point repeating fetch boilerplate.
async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // FastAPI sends { detail: "..." } on errors — surface that message
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Public API functions ──
// These are what Index.tsx calls instead of the local addSparse/subtractSparse etc.

export async function apiAdd(a: SparseMatrix, b: SparseMatrix, threshold: number): Promise<SparseMatrix> {
  const result = await post<SparseResult>("/sparse/add", {
    a: toAPIPayload(a, threshold),
    b: toAPIPayload(b, threshold),
  });
  return resultToSparseMatrix(result);
}

export async function apiSubtract(a: SparseMatrix, b: SparseMatrix, threshold: number): Promise<SparseMatrix> {
  const result = await post<SparseResult>("/sparse/subtract", {
    a: toAPIPayload(a, threshold),
    b: toAPIPayload(b, threshold),
  });
  return resultToSparseMatrix(result);
}

export async function apiMultiply(a: SparseMatrix, b: SparseMatrix, threshold: number): Promise<SparseMatrix> {
  const result = await post<SparseResult>("/sparse/multiply", {
    a: toAPIPayload(a, threshold),
    b: toAPIPayload(b, threshold),
  });
  return resultToSparseMatrix(result);
}

export async function apiTranspose(a: SparseMatrix, threshold: number): Promise<SparseMatrix> {
  const result = await post<SparseResult>("/sparse/transpose", {
    a: toAPIPayload(a, threshold),
  });
  return resultToSparseMatrix(result);
}

// ── Health check — call this on app load to confirm backend is reachable ──
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}