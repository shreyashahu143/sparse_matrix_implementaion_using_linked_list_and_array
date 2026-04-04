# main.py — FastAPI stub server
#
# This is a STUB. No C engine yet.
# Every operation currently echoes back matrix A's entries as the result.
# When C engine is ready: replace the stub logic inside each route with
# subprocess call to the C binary. The routes, models, and CORS stay identical.
#
# Run with:
#   uvicorn main:app --reload --port 8000

import subprocess

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

    binary = "./c_engine/array_engine.exe" if req.representation == "ARRAY" else "./c_engine/linked_list.exe"

    # Build payload — count first, then entries
    lines = [str(len(req.a.entries))]
    for e in req.a.entries:
        lines.append(f"{e[0]} {e[1]} {e[2]}")
    lines.append(str(len(req.b.entries)))
    for e in req.b.entries:
        lines.append(f"{e[0]} {e[1]} {e[2]}")

    payload = "\n".join(lines)

    result = subprocess.run(
        [binary, "ADD"],
        input=payload,
        capture_output=True,
        text=True,
        timeout=120
    )

    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr)

    result_entries = []
    for line in result.stdout.strip().split("\n"):
        if line:
            parts = line.split()
            result_entries.append([int(parts[0]), int(parts[1]), int(parts[2])])

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

    binary = "./c_engine/array_engine.exe" if req.representation == "ARRAY" else "./c_engine/linked_list.exe"

    # Build payload — count first, then entries
    lines = [str(len(req.a.entries))]
    for e in req.a.entries:
        lines.append(f"{e[0]} {e[1]} {e[2]}")
    lines.append(str(len(req.b.entries)))
    for e in req.b.entries:
        lines.append(f"{e[0]} {e[1]} {e[2]}")

    payload = "\n".join(lines)

    result = subprocess.run(
        [binary, "SUBTRACT"],
        input=payload,
        capture_output=True,
        text=True,
        timeout=120
    )

    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr)

    result_entries = []
    for line in result.stdout.strip().split("\n"):
        if line:
            parts = line.split()
            result_entries.append([int(parts[0]), int(parts[1]), int(parts[2])])

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

    binary = "./c_engine/array_engine.exe" if req.representation == "ARRAY" else "./c_engine/linked_list.exe"

    # Build payload — count first, then entries
    lines = [str(len(req.a.entries))]
    for e in req.a.entries:
        lines.append(f"{e[0]} {e[1]} {e[2]}")
    lines.append(str(len(req.b.entries)))
    for e in req.b.entries:
        lines.append(f"{e[0]} {e[1]} {e[2]}")

    payload = "\n".join(lines)

    result = subprocess.run(
        [binary, "MULTIPLY"],
        input=payload,
        capture_output=True,
        text=True,
        timeout=120
    )

    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr)

    result_entries = []
    for line in result.stdout.strip().split("\n"):
        if line:
            parts = line.split()
            result_entries.append([int(parts[0]), int(parts[1]), int(parts[2])])


    return SparseResult(
        entries=result_entries,
        rows=req.a.height,      # Result rows = A's rows
        cols=req.b.width,       # Result cols = B's cols  ← YOU HAVE THIS WRONG TOO
        nnz=len(result_entries),
    )


# ── TRANSPOSE ──
@app.post("/sparse/transpose", response_model=SparseResult)
def transpose(req: UnaryOperationRequest):
    binary = "./c_engine/array_engine.exe" if req.representation == "ARRAY" else "./c_engine/linked_list.exe"

    # Build payload — count first, then entries
    lines = [str(len(req.a.entries))]
    for e in req.a.entries:
        lines.append(f"{e[0]} {e[1]} {e[2]}")

    payload = "\n".join(lines)

    result = subprocess.run(
        [binary, "TRANSPOSE"],
        input=payload,
        capture_output=True,
        text=True,
        timeout=120
    )

    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr)

    result_entries = []
    for line in result.stdout.strip().split("\n"):
        if line:
            parts = line.split()
            result_entries.append([int(parts[0]), int(parts[1]), int(parts[2])])

    return SparseResult(
        entries=result_entries,
        rows=req.a.width,   # transposed: rows ↔ cols
        cols=req.a.height,
        nnz=len(result_entries),
    )