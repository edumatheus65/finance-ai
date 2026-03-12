// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

// Extende o tipo da session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      subscriptionStatus?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    subscriptionStatus?: string | null;
  }
}
