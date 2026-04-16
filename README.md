# Sparse Matrix Operations Engine

**Sparse matrix ADD · SUBTRACT · MULTIPLY · TRANSPOSE**  
C engine · FastAPI backend · React/TypeScript frontend

---

## Project Structure

```
sparse_matrix_implementation/
├── backend/
│   ├── main.py                  # FastAPI server — 4 REST endpoints
│   ├── models.py                # Pydantic request/response models
│   ├── requirements.txt         # Python dependencies
│   └── c_engine/
│       ├── array_engine.c       # COO array-based sparse matrix (C)
│       ├── array_engine.exe     # Compiled binary (Windows)
│       ├── array_engine.o       # Object file
│       ├── linked_list.c        # Linked list sparse matrix (C)
│       ├── linked_list.exe      # Compiled binary (Windows)
│       └── linked_list.o        # Object file
└── matrix-spark-engine/         # React frontend (Vite)
    ├── src/
    │   ├── components/
    │   │   ├── ImageScanner.tsx     # Upload image → pixel matrix
    │   │   ├── MatrixHeader.tsx     # Dimension display + swap
    │   │   ├── NavLink.tsx
    │   │   ├── OperationsPanel.tsx  # Operation selector
    │   │   ├── SparsePanel.tsx      # Matrix input grid
    │   │   ├── StatusBar.tsx
    │   │   ├── StepGuide.tsx
    │   │   └── ThresholdSlider.tsx  # Sparsity threshold control
    │   ├── lib/
    │   │   ├── api.ts               # Fetch wrappers for all endpoints
    │   │   ├── sparse-matrix.ts     # Client-side sparse representation
    │   │   └── utils.ts
    │   └── pages/
    │       ├── Index.tsx            # Main app page
    │       ├── Learn.tsx            # Theory/educational page
    │       └── NotFound.tsx
    └── public/
        ├── favicon.ico
        ├── placeholder.svg
        └── robots.txt
```

---

## What It Does

This project implements sparse matrix operations in two different C data structures and exposes them via a REST API.

### Operations

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| ADD | `POST /sparse/add` | A + B — merge non-zeros, drop cancellations |
| SUBTRACT | `POST /sparse/subtract` | A − B — negate B then add |
| MULTIPLY | `POST /sparse/multiply` | A × B — requires A.cols == B.rows |
| TRANSPOSE | `POST /sparse/transpose` | Aᵀ — swap row↔col, re-sort |

### Representations

**Array (COO format)** — `array_engine.c`  
Stores non-zeros in a static array of `{row, col, val}` structs sorted by `(row, col)`. Uses `qsort` for ordering and a dense accumulator for multiplication. Max 1024 non-zeros per matrix.

**Linked List** — `linked_list.c`  
Each non-zero is a heap-allocated `struct node {row, col, value, *next}`. Dynamically sized with no hard limit. Uses bubble sort for transpose and linear-scan accumulation for multiply.

---

## Getting Started

### 1. Compile the C Engines

```bash
# Windows (MinGW)
gcc -O2 -o c_engine/array_engine.exe c_engine/array_engine.c
gcc -O2 -o c_engine/linked_list.exe  c_engine/linked_list.c

# Linux / macOS
gcc -O2 -o c_engine/array_engine c_engine/array_engine.c
gcc -O2 -o c_engine/linked_list  c_engine/linked_list.c
```

> On Linux/macOS, update the binary paths in `main.py` (remove `.exe`).

### 2. Run the FastAPI Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check: http://localhost:8000/health  
Interactive API docs: http://localhost:8000/docs

### 3. Run the React Frontend

```bash
cd matrix-spark-engine
npm install
npm run dev
```

Opens at http://localhost:5173

---

## API Reference

All endpoints accept and return JSON.

### Binary Operation Body
```json
{
  "a": {
    "width": 3,
    "height": 3,
    "threshold": 0,
    "format": "COO",
    "entries": [[0, 1, 5], [1, 2, -3], [2, 0, 7]]
  },
  "b": { ... },
  "representation": "ARRAY"
}
```
`representation` can be `"ARRAY"` or `"LINKEDLIST"`.

### Unary Operation Body (TRANSPOSE)
```json
{
  "a": { ... },
  "representation": "LINKEDLIST"
}
```

### Response
```json
{
  "entries": [[0, 1, 5], [2, 0, 10]],
  "rows": 3,
  "cols": 3,
  "nnz": 2
}
```

---

## Test the C Engine Directly

```bash
# ADD example — 3 entries in A, 2 in B
printf "3\n0 1 5\n1 2 -3\n2 0 7\n2\n0 1 -5\n2 0 3\n" | ./c_engine/array_engine.exe ADD

# Expected output:
# 1 2 -3
# 2 0 10
# (position 0,1 cancels: 5 + (-5) = 0, dropped)

# TRANSPOSE example
printf "3\n0 1 5\n1 2 -3\n2 0 7\n" | ./c_engine/array_engine.exe TRANSPOSE
# Expected: 0 2 7 / 1 0 5 / 2 1 -3
```

---

## Input Format (stdin to C binary)

For binary operations (ADD, SUBTRACT, MULTIPLY):
```
<count_A>
<row> <col> <value>
...
<count_B>
<row> <col> <value>
...
```

For unary operations (TRANSPOSE):
```
<count_A>
<row> <col> <value>
...
```

Output: one `row col value` line per non-zero result entry.

---

## Running Tests

```bash
# Frontend unit tests (Vitest)
cd matrix-spark-engine
npm run test

# End-to-end tests (Playwright)
npx playwright test
```

---

## Dependencies

### Python (backend)
```
fastapi==0.135.2
uvicorn==0.42.0
pydantic==2.12.5
```

### Node (frontend)
- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- Playwright (e2e), Vitest (unit)

### C
- GCC ≥ 9 (standard C11)
- No external libraries — only `<stdio.h>`, `<stdlib.h>`, `<string.h>`

---

## Algorithm Complexity

| Operation | Array Engine | Linked List Engine |
|-----------|--------------|--------------------|
| ADD / SUBTRACT | O(nnz_A + nnz_B) | O(nnz_A + nnz_B) |
| MULTIPLY | O(nnz_A × nnz_B) | O(nnz_A × nnz_B × nnz_result) |
| TRANSPOSE | O(nnz log nnz) via qsort | O(nnz²) bubble sort |

---

## Notes

- Zero values in input are silently ignored (never stored).
- Results that are zero after addition/subtraction are dropped.
- The array engine exits with an error if `nnz > 1024` (MAX_NNZ).
- CORS is enabled for `localhost:5173`, `localhost:3000`, and `localhost:8080`.