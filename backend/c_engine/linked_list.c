#include <stdio.h>
#include <stdlib.h>
#include <string.h>
// 1. DATA STRUCTURE (The Blueprint)
struct node{
    int row;
    int col;
    int value;
    struct node* next;
};

void insert_node(struct node** head, struct node** tail , int r , int c , int v){
    struct node* new_node =(struct node*)malloc(sizeof(struct node));
    if(!new_node){
        printf("memory aloocation failed\n");
        exit(1);
    }

    new_node->row=r;
    new_node->col=c;
    new_node->value=v;
    new_node->next=NULL;

    if(*head==NULL){
        *head=new_node;
        *tail=new_node;
    }else{
        (*tail)->next=new_node;
        *tail=new_node;
    }
}
void free_matrix(struct node** head){
    struct node* current=*head;
    struct node* next_node;
    
    while(current!=NULL){
        next_node=current->next;
        free(current);
        current=next_node;
    }
    *head=NULL;
}

struct node* add_matrices(struct node* a, struct node* b){
    struct node* res_head=NULL;
    struct node* res_tail=NULL;
    while(a!=NULL && b!=NULL){
    if (a->row<b->row|| (a->row==b->row && a->col<b->col)){
        insert_node(&res_head, &res_tail, a->row, a->col, a->value);
        a=a->next;
    }
    else if (b->row<a->row||(b->row==a->row&&b->col<a->col)){
        insert_node(&res_head, &res_tail, b->row, b->col, b->value);
        b=b->next;
    }
    else{
        int sum = a->value + b->value;
            if (sum != 0) { // Only store non-zero values to maintain sparsity
                insert_node(&res_head, &res_tail, a->row, a->col, sum);
            }
            a = a->next;
            b = b->next;
        }
    
    }
    while(a!=NULL){
        insert_node(&res_head, &res_tail,a->row,a->col,a->value);
        a=a->next;
    }
    while(b!=NULL){
        insert_node(&res_head, &res_tail,b->row,b->col,b->value);
        b=b->next;
    }
    return res_head;
}
struct node* subtract_matrices(struct node* a, struct node* b){
    struct node* res_head=NULL;
    struct node* res_tail=NULL;
    while(a!=NULL && b!=NULL){
    if (a->row<b->row|| (a->row==b->row && a->col<b->col)){
        insert_node(&res_head, &res_tail, a->row, a->col, a->value);
        a=a->next;
    }
    else if (b->row<a->row||(b->row==a->row&&b->col<a->col)){
        insert_node(&res_head, &res_tail, b->row, b->col, -(b->value));
        b=b->next;
    }
    else{
        int diff = a->value - b->value;
            if (diff != 0) { // Only store non-zero values to maintain sparsity
                insert_node(&res_head, &res_tail, a->row, a->col, diff);
            }
            a = a->next;
            b = b->next;
        }
    
    }
    while(a!=NULL){
        insert_node(&res_head, &res_tail,a->row,a->col,a->value);
        a=a->next;
    }
    while(b!=NULL){
        insert_node(&res_head, &res_tail,b->row,b->col,-(b->value));
        b=b->next;
    }
    return res_head;
}

int main(int argc,char *argv[]){

    if(argc!=2){
        fprintf(stderr,"Usage: ./engine <OPERATION>\n");
        return 1;
    }

    struct node* Head_a=NULL;
    struct node* Tail_a=NULL;
    struct node* Head_b=NULL;
    struct node* Tail_b=NULL;
    
    int r,c,v;
    int n;
    scanf("%d", &n);  // number of entries in matrix A
    for(int i=0; i<n; i++){
        scanf("%d %d %d",&r,&c,&v);
        insert_node(&Head_a, &Tail_a, r, c, v);
    }
    scanf("%d", &n);  // number of entries in matrix B
    for(int i=0; i<n; i++){
        scanf("%d %d %d",&r,&c,&v);
        insert_node(&Head_b, &Tail_b, r, c, v);
    }

    struct node* result=NULL;

    if(strcmp(argv[1],"ADD")==0){
        result=add_matrices(Head_a,Head_b);
    }
    else if(strcmp(argv[1],"SUBTRACT")==0){
        result=subtract_matrices(Head_a,Head_b);
    }
    else{
        fprintf(stderr,"Invalid operation. Use ADD or SUBTRACT.\n");
        return 1;
    }
    struct node* temp=result;
    while(temp!=NULL){
        printf("%d %d %d\n",temp->row,temp->col,temp->value);
        temp=temp->next;
    }
    free_matrix(&Head_a);
    free_matrix(&Head_b);
    free_matrix(&result);
    return 0;
}
