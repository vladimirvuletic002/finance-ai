export type CategoryListResponse = {
    data: {
        userId: number,
        name: string,
        icon: string,
        color: string,
        createdAt: string,
        deletedAt: string,
        isDefault: boolean,
        updatedAt: string
    }
}