import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan?: string | null;
      isAdmin?: boolean;
      status?: string;
      tokens: number;
      provider?: string;
    };
    accessToken?: string;
    error?: string;
  }

  interface User {
    id: number;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan?: string | null;
    isAdmin?: boolean;
    status?: string;
    tokens: number;
    provider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires: number;
    error?: 'RefreshAccessTokenError';
  }
}
