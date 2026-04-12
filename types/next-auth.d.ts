import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
    accessToken: string
    accessTokenExpiry: number
    error?: string
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    accessToken?: string
    accessTokenExpiry?: number
    refreshToken?: string
    error?: string
  }
}