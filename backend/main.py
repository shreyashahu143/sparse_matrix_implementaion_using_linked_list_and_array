# main.py — FastAPI stub server
#
# This is a STUB. No C engine yet.
# Every operation currently echoes back matrix A's entries as the result.
# When C engine is ready: replace the stub logic inside each route with
# subprocess call to the C binary. The routes, models, and CORS stay identical.
#
# Run with:
#   uvicorn main:app --reload --port 8000

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import BinaryOperationRequest, UnaryOperationRequest, SparseResult

app = FastAPI(title="Sparse Matrix Engine", version="0.1.0")

# ── CORS ──
# Allow requests from the Vite dev server.
# Without this, browser will block every request with a CORS error.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default
        "http://localhost:3000",   # fallback
        "http://localhost:8080",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ── Health check ──
# Hit http://localhost:8000/health in browser to confirm server is running.
@app.get("/health")
def health():
    return {"status": "ok", "engine": "stub"}


# ── ADD ──
@app.post("/sparse/add", response_model=SparseResult)
def add(req: BinaryOperationRequest):
    if req.a.width != req.b.width or req.a.height != req.b.height:
        raise HTTPException(
            status_code=422,
            detail=f"Dimension mismatch: A is {req.a.width}×{req.a.height}, B is {req.b.width}×{req.b.height}"
        )

    # ── STUB: replace this block with subprocess C call ──
    # Real logic: merge entries from A and B, sum values at same (row, col)
    result_entries = req.a.entries  # placeholder — returns A unchanged
    # ── end stub ──

    return SparseResult(
        entries=result_entries,
        rows=req.a.height,
        cols=req.a.width,
        nnz=len(result_entries),
    )


# ── SUBTRACT ──
@app.post("/sparse/subtract", response_model=SparseResult)
def subtract(req: BinaryOperationRequest):
    if req.a.width != req.b.width or req.a.height != req.b.height:
        raise HTTPException(
            status_code=422,
            detail=f"Dimension mismatch: A is {req.a.width}×{req.a.height}, B is {req.b.width}×{req.b.height}"
        )

    # ── STUB: replace this block with subprocess C call ──
    result_entries = req.a.entries
    # ── end stub ──

    return SparseResult(
        entries=result_entries,
        rows=req.a.height,
        cols=req.a.width,
        nnz=len(result_entries),
    )


# ── MULTIPLY ──
@app.post("/sparse/multiply", response_model=SparseResult)
def multiply(req: BinaryOperationRequest):
    # Multiply rule: A.cols must equal B.rows
    if req.a.width != req.b.height:
        raise HTTPException(
            status_code=422,
            detail=f"Dimension mismatch: A.cols={req.a.width} must equal B.rows={req.b.height}"
        )

    # ── STUB: replace this block with subprocess C call ──
    result_entries = req.a.entries
    # ── end stub ──

    return SparseResult(
        entries=result_entries,
        rows=req.a.height,
        cols=req.b.width,
        nnz=len(result_entries),
    )


# ── TRANSPOSE ──
@app.post("/sparse/transpose", response_model=SparseResult)
def transpose(req: UnaryOperationRequest):
    # ── STUB: replace this block with subprocess C call ──
    # Real logic: swap row and col for every entry
    result_entries = [[e[1], e[0], e[2]] for e in req.a.entries]  # swap row↔col
    # ── end stub —— this one is simple enough that the stub IS correct logic

    return SparseResult(
        entries=result_entries,
        rows=req.a.width,   # transposed: rows become cols
        cols=req.a.height,
        nnz=len(result_entries),
    )