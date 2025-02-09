import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios, { AxiosError } from "axios";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data?.token) {
            return {
              token: response.data.token,
              id: response.data.id,
              user_id: response.data.user_id,
              email: response.data.email,
              gender: response.data.gender,
              birthDay: response.data.birthDay,
              phoneNumber: response.data.phoneNumber,
              avatarImg: response.data.avatarImg || "/default-avatar.png",
              name: response.data.username,
              role: response.data.role,
            };
          } else {
            console.error(
              "Login failed:",
              response.data.message || "Unknown error"
            );
            return null;
          }
        } catch (error) {
          const err = error as AxiosError;
          console.error(
            "Error in authorize function:",
            err.response?.data || err.message
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.user_id = user.user_id;
        token.name = user.name;
        token.gender = user.gender;
        token.birthDay = user.birthDay;
        token.phoneNumber = user.phoneNumber;
        token.avatarImg = user.avatarImg || "/default-avatar.png";
        token.role = user.role;
        token.token = user.token;
      }
      return token;
    },

    // async session({ session, token }) {

    //   session.user.id = token.id as string;
    //   session.user.email = token.email as string;
    //   session.user.role = token.role as string;
    //   session.user.token = token.token as string;
    //   session.user.name = token.name as string;
    //   session.user.avatarImg = token.avatarImg || "/default-avatar.png";
    //   session.gender = token.gender as string;
    //   session.birthDay = token.birthDay as string;
    //   session.phoneNumber = token.phoneNumber as number;
    //   return session;
    // },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        user_id: token.user_id as string,
        email: token.email as string,
        role: token.role as string,
        token: token.token as string,
        name: token.name as string,
        avatarImg: token.avatarImg || "/default-avatar.png",
        gender: token.gender as string,
        birthDay: token.birthDay as string,
        phoneNumber: token.phoneNumber as string,
      };
      return session;
    },
    async signIn({ user, account }) {
      if (!user || !account) {
        return false;
      }

      if (account.type === "credentials") {
        return true;
      }

      const payload = {
        token: user.token,
        id: user.id,
        provider: account.provider,
        avatarImg: user.avatarImg || "/default-avatar.png",
        email: user.email,
        name: user.name,
        picture: user.image,
      };

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/callback/oauth`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.data) {
          console.error("Error: API response data is null");
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error during API call in sign-in callback:", error);
        return false;
      }
    },
  },
});
