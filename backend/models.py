# models.py — request/response contracts between frontend and FastAPI
#
# SparsePayload matches exactly what toAPIPayload() sends from sparse-matrix.ts:
# {
#   width, height, threshold, format: "COO",
#   entries: [[row, col, value], ...]   ← flat triplets, not objects
# }

from pydantic import BaseModel
from typing import Literal, List


class SparsePayload(BaseModel):
    width: int
    height: int
    threshold: int
    format: str  # "COO" — Literal not supported cleanly in pydantic v1
    entries: List[List[int]]


class BinaryOperationRequest(BaseModel):
    a: SparsePayload
    b: SparsePayload
    representation: str  # "ARRAY" | "LINKEDLIST" — Literal not supported cleanly in pydantic v1


class UnaryOperationRequest(BaseModel):
    a: SparsePayload


class SparseResult(BaseModel):
    entries: List[List[int]]
    rows: int
    cols: int
    nnz: int