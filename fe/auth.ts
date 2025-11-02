import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Call backend login API
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            return null;
          }

          // Return user object dengan token
          return {
            id: data.data.user.id.toString(),
            name: data.data.user.displayName,
            email: data.data.user.username, // Gunakan username sebagai email
            accessToken: data.data.token,
            role: data.data.user.role, // Include role from backend
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Simpan access token dan role ke JWT token saat login
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach access token, user id, dan role ke session
      if (token) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.user.role = token.role as "HOST" | "ADMIN";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
