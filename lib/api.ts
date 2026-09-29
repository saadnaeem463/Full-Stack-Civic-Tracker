export type ApiIssue = {
    path?: Array<string | number>;
    message?: string;
};

export class ApiError extends Error {
    status: number;
    issues: ApiIssue[];

    constructor(message: string, status: number, issues: ApiIssue[] = []) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.issues = issues;
    }
}

type ApiFetchOptions = RequestInit & {
    /** send the user to /auth/login when the session is missing or expired */
    redirectToLogin?: boolean;
};

/**
 * Shared fetch wrapper: normalises errors into ApiError and turns an expired
 * session into a redirect instead of a broken, silently failing page.
 */
export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
    const { redirectToLogin, ...init } = options;

    let response: Response;
    try {
        response = await fetch(url, init);
    } catch {
        throw new ApiError("Network error. Check your connection and try again.", 0);
    }

    if (response.status === 401 && redirectToLogin && typeof window !== "undefined") {
        window.location.assign("/auth/login");
        throw new ApiError("Your session has expired. Please sign in again.", 401);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(
            (data && typeof data.error === "string" && data.error) || `Request failed (${response.status})`,
            response.status,
            (data && Array.isArray(data.issues) ? data.issues : []) as ApiIssue[]
        );
    }

    return data as T;
}

/** first validation message for a field, used to surface server side issues inline */
export function issueFor(issues: ApiIssue[] | undefined, field: string): string | undefined {
    return issues?.find((issue) => issue.path?.[issue.path.length - 1] === field)?.message;
}
