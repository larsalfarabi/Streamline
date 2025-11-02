// Extend NextAuth types
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      role?: "HOST" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    role?: "HOST" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    role?: "HOST" | "ADMIN";
  }
}
