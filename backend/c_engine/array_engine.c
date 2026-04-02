#include <stdio.h>
#include <stdlib.h>
#include <string.h>



#define MAX_NNZ 1024   

typedef struct {
    int row;
    int col;
    int val;
} Entry;


typedef struct {
    Entry data[MAX_NNZ]; 
    int   nnz;            
} SparseMatrix;


static int cmp_entry(const void *x, const void *y) {
    const Entry *a = (const Entry *)x;
    const Entry *b = (const Entry *)y;
    if (a->row != b->row) return a->row - b->row;
    return a->col - b->col;
}


static void sort_matrix(SparseMatrix *m) {
    qsort(m->data, (size_t)m->nnz, sizeof(Entry), cmp_entry);
}


static void insert_entry(SparseMatrix *m, int r, int c, int v) {
    if (m->nnz >= MAX_NNZ) {
        fprintf(stderr, "Error: too many non-zeros (max %d)\n", MAX_NNZ);
        exit(1);
    }
    m->data[m->nnz].row = r;
    m->data[m->nnz].col = c;
    m->data[m->nnz].val = v;
    m->nnz++;
}


static void read_matrix(SparseMatrix *m) {
    m->nnz = 0;
    int n;
    if (scanf("%d", &n) != 1) {
        fprintf(stderr, "Error reading entry count\n");
        exit(1);
    }
    for (int i = 0; i < n; i++) {
        int r, c, v;
        if (scanf("%d %d %d", &r, &c, &v) != 3) {
            fprintf(stderr, "Error reading entry %d\n", i);
            exit(1);
        }
        if (v != 0) insert_entry(m, r, c, v);  
    }
}

/* Print all non-zeros of a matrix  */
static void print_matrix(const SparseMatrix *m) {
    for (int i = 0; i < m->nnz; i++) {
        printf("%d %d %d\n", m->data[i].row, m->data[i].col, m->data[i].val);
    }
}


/* ══════════════════════════════════════════════════════════
   3. OPERATIONS
   ══════════════════════════════════════════════════════════ */

// ── ADD: result = A + B ──
 
SparseMatrix add_matrices(const SparseMatrix *a, const SparseMatrix *b) {
    SparseMatrix result;
    result.nnz = 0;

    int i = 0, j = 0;

    while (i < a->nnz && j < b->nnz) {
        int ar = a->data[i].row, ac = a->data[i].col;
        int br = b->data[j].row, bc = b->data[j].col;

        if (ar < br || (ar == br && ac < bc)) {
            /* A's entry comes first — copy it */
            insert_entry(&result, ar, ac, a->data[i].val);
            i++;
        } else if (br < ar || (br == ar && bc < ac)) {
            /* B's entry comes first — copy it */
            insert_entry(&result, br, bc, b->data[j].val);
            j++;
        } else {
            /* Same position — sum the values, drop if zero */
            int sum = a->data[i].val + b->data[j].val;
            if (sum != 0) insert_entry(&result, ar, ac, sum);
            i++;
            j++;
        }
    }
   
    while (i < a->nnz) {
        insert_entry(&result, a->data[i].row, a->data[i].col, a->data[i].val);
        i++;
    }
    
    while (j < b->nnz) {
        insert_entry(&result, b->data[j].row, b->data[j].col, b->data[j].val);
        j++;
    }
    return result;
}

// ── SUBTRACT: result = A - B ──
 
SparseMatrix subtract_matrices(const SparseMatrix *a, const SparseMatrix *b) {
  
    SparseMatrix neg_b;
    neg_b.nnz = b->nnz;
    for (int i = 0; i < b->nnz; i++) {
        neg_b.data[i].row = b->data[i].row;
        neg_b.data[i].col = b->data[i].col;
        neg_b.data[i].val = -(b->data[i].val);  
    }
    return add_matrices(a, &neg_b);
}

// ── TRANSPOSE: result = A^T ──
 
SparseMatrix transpose_matrix(const SparseMatrix *a) {
    SparseMatrix result;
    result.nnz = a->nnz;

    for (int i = 0; i < a->nnz; i++) {
        result.data[i].row = a->data[i].col;   /* swap row <-> col */
        result.data[i].col = a->data[i].row;
        result.data[i].val = a->data[i].val;
    }
    sort_matrix(&result);  
    return result;
}

// ── MULTIPLY: result = A × B ──
 
SparseMatrix multiply_matrices(const SparseMatrix *a, const SparseMatrix *b) {
    SparseMatrix result;
    result.nnz = 0;

    /* Find result dimensions to size the accumulator */
    int max_row = 0, max_col = 0;
    for (int i = 0; i < a->nnz; i++)
        if (a->data[i].row > max_row) max_row = a->data[i].row;
    for (int j = 0; j < b->nnz; j++)
        if (b->data[j].col > max_col) max_col = b->data[j].col;
    int R = max_row + 1;
    int C = max_col + 1;

    
    int *acc = (int *)calloc((size_t)(R * C), sizeof(int));
    if (!acc) { fprintf(stderr, "malloc failed\n"); exit(1); }

    for (int i = 0; i < a->nnz; i++) {
        for (int j = 0; j < b->nnz; j++) {
            if (a->data[i].col == b->data[j].row) {
                int r    = a->data[i].row;
                int c    = b->data[j].col;
                int prod = a->data[i].val * b->data[j].val;
                acc[r * C + c] += prod;
            }
        }
    }

    
    for (int r = 0; r < R; r++) {
        for (int c = 0; c < C; c++) {
            if (acc[r * C + c] != 0) {
                insert_entry(&result, r, c, acc[r * C + c]);
            }
        }
    }
    free(acc);
    return result;
}


/* ══════════════════════════════════════════════════════════
   4. MAIN
   ══════════════════════════════════════════════════════════ */
int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: ./array_engine <OPERATION>\n");
        fprintf(stderr, "Operations: ADD  SUBTRACT  MULTIPLY  TRANSPOSE\n");
        return 1;
    }

    SparseMatrix A, B, result;
    A.nnz = 0;
    B.nnz = 0;
    result.nnz = 0;

    /* Read matrix A */
    read_matrix(&A);
    sort_matrix(&A);   

    /* Read matrix B only for binary operations */
    if (strcmp(argv[1], "ADD")      == 0 ||
        strcmp(argv[1], "SUBTRACT") == 0 ||
        strcmp(argv[1], "MULTIPLY") == 0) {
        read_matrix(&B);
        sort_matrix(&B);
    }

    
    if (strcmp(argv[1], "ADD") == 0) {
        result = add_matrices(&A, &B);
    }
    else if (strcmp(argv[1], "SUBTRACT") == 0) {
        result = subtract_matrices(&A, &B);
    }
    else if (strcmp(argv[1], "TRANSPOSE") == 0) {
        result = transpose_matrix(&A);
    }
    else if (strcmp(argv[1], "MULTIPLY") == 0) {
        result = multiply_matrices(&A, &B);
    }
    else {
        fprintf(stderr, "Invalid operation: %s\n", argv[1]);
        fprintf(stderr, "Use: ADD  SUBTRACT  MULTIPLY  TRANSPOSE\n");
        return 1;
    }


    print_matrix(&result);

   
    return 0;
}