const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY || "",
}

export async function apiClient<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: HEADERS,
        ...options,
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
}