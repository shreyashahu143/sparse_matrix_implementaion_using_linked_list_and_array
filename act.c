#include <stdio.h>
#include <stdlib.h>

// Module 5 Structure: Linked List Node
struct Node {
    int row, col, val;
    struct Node* next;
};

// Module 2 Structure: Triplet Array Element
struct Element {
    int row, col, val;
};

// Module 3: Display Function for Array Representation
void displayArray(struct Element triplet[]) {
    int n = triplet[0].val;
    printf("\n--- Sparse Matrix (Triplet Array) ---\n");
    printf("Row\tCol\tValue\n");
    for (int i = 0; i <= n; i++) {
        printf("%d\t%d\t%d\n", triplet[i].row, triplet[i].col, triplet[i].val);
    }
}

// Module 6: Display Function for Linked List
void displayList(struct Node* head, int r, int c) {
    struct Node* temp = head;
    printf("\n--- Sparse Matrix (Linked List) ---\n");
    printf("Metadata: %d Rows, %d Columns\n", r, c);
    printf("Row\tCol\tValue\n");
    while (temp != NULL) {
        printf("%d\t%d\t%d\n", temp->row, temp->col, temp->val);
        temp = temp->next;
    }
}

int main() {
    int rows, cols, nz, choice;

    // Module 1: Initialization & Metadata
    printf("Enter total Rows and Columns: ");
    scanf("%d %d", &rows, &cols);
    printf("Enter number of Non-Zero elements: ");
    scanf("%d", &nz);

    printf("\nChoose Storage Method:\n1. Triplet Array\n2. Linked List\nChoice: ");
    scanf("%d", &choice);
// commented part is for sparse matrix creation  and display with linked list and array 
//     if (choice == 1) {
//         // Module 2: Array Creation
//         struct Element *triplet = (struct Element*)malloc((nz + 1) * sizeof(struct Element));
//         triplet[0] = (struct Element){rows, cols, nz};

//         for (int i = 1; i <= nz; i++) {
//             printf("Enter Row, Col, Value for element %d: ", i);
//             scanf("%d %d %d", &triplet[i].row, &triplet[i].col, &triplet[i].val);
//         }
//         displayArray(triplet); // Module 3
//         free(triplet);
//     } 
//     else if (choice == 2) {
//         // Module 5: Linked List Creation
//         struct Node *head = NULL, *last = NULL;
//         for (int i = 0; i < nz; i++) {
//             struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
//             printf("Enter Row, Col, Value for element %d: ", i + 1);
//             scanf("%d %d %d", &newNode->row, &newNode->col, &newNode->val);
//             newNode->next = NULL;

//             if (head == NULL) head = newNode;
//             else last->next = newNode;
//             last = newNode;
//         }
//         displayList(head, rows, cols); // Module 6
//     }
//     return 0;
}