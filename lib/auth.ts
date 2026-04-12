import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const ACCESS_TOKEN_EXPIRY = 24 * 60 * 60        // 1 day in seconds
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60   // 7 days in seconds

function generateToken() {
  return crypto.randomBytes(32).toString("hex")
}

async function refreshAccessToken(token: any) {
  try {
    // Verify refresh token is still valid (not expired)
    if (!token.refreshToken || Date.now() > token.refreshTokenExpiry) {
      return { ...token, error: "RefreshTokenExpired" }
    }

    // For admin, just reissue tokens
    if (token.role === "ADMIN") {
      return {
        ...token,
        accessToken: generateToken(),
        accessTokenExpiry: Date.now() + ACCESS_TOKEN_EXPIRY * 1000,
        error: undefined,
      }
    }

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: token.sub! },
      select: { id: true, role: true, email: true }
    })

    if (!user) {
      return { ...token, error: "UserNotFound" }
    }

    return {
      ...token,
      role: user.role,
      accessToken: generateToken(),
      accessTokenExpiry: Date.now() + ACCESS_TOKEN_EXPIRY * 1000,
      refreshToken: generateToken(),
      refreshTokenExpiry: Date.now() + REFRESH_TOKEN_EXPIRY * 1000,
      error: undefined,
    }
  } catch {
    return { ...token, error: "RefreshAccessTokenError" }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Admin login via env credentials
        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "admin",
            email: credentials.email,
            name: "Admin",
            role: "ADMIN",
          }
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) return null

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: REFRESH_TOKEN_EXPIRY, // session cookie lives as long as refresh token
  },
  jwt: {
    maxAge: REFRESH_TOKEN_EXPIRY,
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in — issue both tokens
      if (user) {
        token.role = user.role
        token.accessToken = generateToken()
        token.accessTokenExpiry = Date.now() + ACCESS_TOKEN_EXPIRY * 1000
        token.refreshToken = generateToken()
        token.refreshTokenExpiry = Date.now() + REFRESH_TOKEN_EXPIRY * 1000
        token.error = undefined
        return token
      }

      // Access token still valid — return as-is
      if (Date.now() < (token.accessTokenExpiry ?? 0)) {
        return token
      }

      // Access token expired — attempt refresh
      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
        session.accessTokenExpiry = token.accessTokenExpiry as number
        session.error = token.error as string | undefined
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
