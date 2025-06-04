"use server";

import { cookies } from "next/headers";

interface LoginDto {
  email: string;
  password: string;
}

interface LoginResponseDto {
  token: string;
  user_id: string;
  email: string;
  username: string;
  avatarImg: string;
  gender: string;
  birthDay: string;
  phoneNumber: number;
  role: string;
}

export async function loginApi({
  email,
  password,
}: LoginDto): Promise<LoginResponseDto | null> {
  try {
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      console.error("Login failed", await res.text());
      return null;
    }

    const data: LoginResponseDto = await res.json();

    const cookieStore = cookies();
    cookieStore.set("token", data.token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    cookieStore.set("user", JSON.stringify(data), {
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return data;
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
}
