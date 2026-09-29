import { apiFetch } from "@/lib/api";

export type ProfileUser = {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    isVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type ProfileUpdateInput = {
    name: string;
    email: string;
    avatar?: string;
};

export type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword?: string;
};

export function getProfile() {
    return apiFetch<{ user: ProfileUser }>("/api/profile", { redirectToLogin: true });
}

export function updateProfile(data: ProfileUpdateInput) {
    return apiFetch<{ message: string; user: ProfileUser; requiresEmailVerification: boolean }>("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        redirectToLogin: true,
    });
}

export function changePassword(data: ChangePasswordInput) {
    return apiFetch<{ message: string }>("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        redirectToLogin: true,
    });
}
