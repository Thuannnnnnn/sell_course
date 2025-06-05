import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            // Try parse error message from API
            let errorMessage = "Login failed";
            try {
              const errorData = await res.json();
              errorMessage = errorData.message || errorMessage;
            } catch {}
            throw new Error(errorMessage);
          }

          const user = await res.json();
          if (!user) {
            throw new Error("No user data returned");
          }

          return user;
        } catch (error) {
          // Re-throw error for NextAuth to handle
          throw new Error(error instanceof Error ? error.message : "Unknown error");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
  async session({ session, token }) {
    if (token?.user) {
      session.user = token.user as {
        id: string;
        email: string;
        name?: string;
        avatarImg?: string;
        gender?: string;
        birthDay?: string;
        phoneNumber?: string;
        role?: string;
      };
    }
    return session;
  },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
