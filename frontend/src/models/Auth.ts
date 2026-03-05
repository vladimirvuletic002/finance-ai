export type AuthResponse = {
    user: {
        id: number;
        email: string;
        name: string;
    };
    token: string;
}

export type LoginPayload = {
    email: string;
    password: string;
}

export type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    confirmPass: string;
}

export type UserProfile = {
    name: string;
    email: string;
}

