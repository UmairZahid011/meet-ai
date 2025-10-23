import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
// import { db } from "@/lib/db";
import {pool }from '@/lib/db';
import { JWT } from "next-auth/jwt";

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    });

    const refreshedTokens = await response.json();
    if (!response.ok) throw refreshedTokens;

    const newAccessToken = refreshedTokens.access_token;
    const newRefreshToken = refreshedTokens.refresh_token ?? token.refreshToken;
    const newAccessTokenExpires = Date.now() + refreshedTokens.expires_in * 1000;

    await pool.query(
      `UPDATE users SET
        google_access_token = ?,
        google_refresh_token = ?,
        google_access_token_expires_at = ?
      WHERE id = ?`,
      [newAccessToken, newRefreshToken, new Date(newAccessTokenExpires), token.id]
    );

    return {
      ...token,
      accessToken: newAccessToken,
      accessTokenExpires: newAccessTokenExpires,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);

    await pool.query(
      `UPDATE users SET
        google_access_token = NULL,
        google_refresh_token = NULL,
        google_access_token_expires_at = NULL
      WHERE id = ?`,
      [token.id]
    );

    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const [result] = await pool.query('SELECT * FROM users WHERE email = ?', [credentials?.email]);
        const user = (result as any[])[0];

        if (user && await bcrypt.compare(credentials!.password, user.password)) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            isAdmin: user.is_admin,
            status: user.status,
            tokens: user.tokens,
            // ✅ don't return image here (we fetch it from /api/user)
          };
        }

        if (user && !user.password) {
          throw new Error("This account uses Google login. Please sign in with Google.");
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [user.email]);
        const existingUser = (result as any[])[0];

        if (!existingUser) {
          const [insertResult] = await pool.query(
            "INSERT INTO users (name, email, plan, is_admin) VALUES (?, ?, ?, ?)",
            [user.name, user.email, "free", false]
          ) as any;

          user.id = insertResult.insertId;
        } else {
          user.id = existingUser.id;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        // if (account.provider === "google") {
        //   await pool.query(
        //     `UPDATE users SET
        //       google_access_token = ?,
        //       google_refresh_token = ?,
        //       google_access_token_expires_at = ?
        //     WHERE id = ?`,
        //     [
        //       account.access_token,
        //       account.refresh_token,
        //       account.expires_at ? new Date(account.expires_at * 1000) : null,
        //       user.id
        //     ]
        //   );
        // }

        if (account?.provider === "google") {
            const grantedScopes = account.scope?.split(" ") || [];
            const hasCalendarAccess = grantedScopes.includes("https://www.googleapis.com/auth/calendar");
            if (!hasCalendarAccess) {
              console.warn("❌ User denied Google Calendar permission.");
              return false;
            }
            const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [user.email]);
            const existingUser = (result as any[])[0];

            if (!existingUser) {
                const [insertResult] = await pool.query(
                    "INSERT INTO users (name, email, plan, is_admin, provider) VALUES (?, ?, ?, ?, ?)",
                    [user.name, user.email, "free", false, "google"]
                ) as any;
                user.id = insertResult.insertId;
                user.plan = "free";
                user.isAdmin = false;
                user.status = "active";
                user.tokens = 0;
            } else {
                user.id = existingUser.id;
                user.plan = existingUser.plan;
                user.isAdmin = existingUser.is_admin;
                user.status = existingUser.status;
                user.tokens = existingUser.tokens;
                existingUser.provider = existingUser.provider || 'google';
            }
        }

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          id: user.id,
          plan: user.plan,
          isAdmin: user.isAdmin,
          status: user.status,
          tokens: user.tokens,
          provider: account.provider,
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.id = token.id as number;
      session.user.plan = token.plan as string;
      session.user.isAdmin = token.isAdmin as boolean;
      session.user.status = token.status as string;
      session.user.tokens = token.tokens as number;
      session.user.provider = token.provider as string;
      return session;
    },
  },
  pages:{
    error: '/login',
    signIn: '/login'
  }
};
