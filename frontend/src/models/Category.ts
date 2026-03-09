export type CategoryListResponse = {
    data: ListObj[]
}

export type ListObj = {
    id: number,
    userId: number,
    name: string,
    icon: string,
    color: string,
    createdAt: string,
    deletedAt: string,
    isDefault: boolean,
    updatedAt: string
}

export type Category = {
    id: number,
    name: string
}