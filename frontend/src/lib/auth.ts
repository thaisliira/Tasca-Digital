const API_BASE =
  typeof window === "undefined"
    ? process.env.API_URL || "http://backend:8080"
    : "http://localhost:8080";

export type User = {
  id: string;
  name: string;
  email: string;
  department: string;
  avatar_color: string;
};

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body?.error ?? fallback;
  } catch {
    return fallback;
  }
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Falha no login"));
  return res.json();
}

export async function signup(input: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res, "Falha no cadastro"));
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe(): Promise<User | null> {
  const res = await fetch(`${API_BASE}/me`, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Falha ao carregar usuário");
  return res.json();
}

export type ProfileUpdate = {
  name?: string;
  department?: string;
  avatar_color?: string;
  current_password?: string;
  new_password?: string;
};

export async function updateProfile(input: ProfileUpdate): Promise<void> {
  const res = await fetch(`${API_BASE}/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res, "Falha ao atualizar perfil"));
}
