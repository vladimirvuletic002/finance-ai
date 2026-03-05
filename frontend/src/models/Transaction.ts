export type TransactionResponse = {
    data: ListObj[],
    pagination: {
        page: number,
        pageSize: number,
        total: number
    }
}

export type ListObj = {
    id: number,
    userId: number,
    categoryId: number,
    type: string,
    amount: string,
    currency: string,
    note: string,
    merchant: string,
    date: string,
    createdAt: string,
    category: {
        id: number,
        name: string,
    }

}

export type TransactionCreate = {
    categoryId: number,
    type: string,
    amount: number,
    currency: string,
    note: string,
    merchant: string,
    date: string,
}

export type TransactionCreateResponse = {
    data: {
        userId: number,
        categoryId: number,
        type: string,
        amount: string,
        currency: string,
        note: string,
        merchant: string,
        date: string
    }
}