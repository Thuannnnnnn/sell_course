"use server";

import { signIn } from "@/lib/auth";

export async function handleGoogleSignIn() {
  try {
    await signIn("google");
  } catch (error) {
    console.error("Error during Google sign-in:", error);
  }
}
