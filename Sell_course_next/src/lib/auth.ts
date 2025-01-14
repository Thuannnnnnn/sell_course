import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account}) {
      if (!account) {
        console.error("Account is null");
        return false;
      }

      // Extract relevant data to match the backend DTO
      const payload = {
        email: user.email,
        name: user.name,
        picture: user.image,
      };

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/auth/oauth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error("Failed to send data to API:", responseData);
          return false;
        }

        console.log("Response from backend:", responseData);
        return true;
      } catch (error) {
        console.error("Error in sign-in callback:", error);
        return false;
      }
    },
  },
});
