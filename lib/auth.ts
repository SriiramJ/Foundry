import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const SESSION_EXPIRY = 24 * 60 * 60  // 24 hours in seconds

function generateToken() {
  return crypto.randomBytes(32).toString("hex")
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
            twoFactorEnabled: false,
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
            twoFactorEnabled: user.twoFactorEnabled,
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
    maxAge: SESSION_EXPIRY,
  },
  jwt: {
    maxAge: SESSION_EXPIRY,
  },
  callbacks: {
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      if (user) {
        token.role = user.role
        token.twoFactorEnabled = (user as any).twoFactorEnabled ?? false
        token.twoFactorVerified = !(user as any).twoFactorEnabled // auto-verified if 2FA not enabled
        token.accessToken = generateToken()
        token.accessTokenExpiry = Date.now() + SESSION_EXPIRY * 1000
        token.error = undefined
        return token
      }

      // Handle session.update() call from 2FA verify page
      if (trigger === "update" && sessionUpdate?.twoFactorVerified === true) {
        token.twoFactorVerified = true
        return token
      }

      if (Date.now() < (token.accessTokenExpiry ?? 0)) {
        return token
      }

      return { ...token, error: "RefreshTokenExpired" }
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
        session.accessTokenExpiry = token.accessTokenExpiry as number
        session.error = token.error as string | undefined
        ;(session as any).twoFactorEnabled = token.twoFactorEnabled
        ;(session as any).twoFactorVerified = token.twoFactorVerified
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  },
  events: {
    async signOut({ token }: any) {
      // Clean up any DB sessions for this user (PrismaAdapter may create them)
      if (token?.sub && token.sub !== "admin") {
        try {
          await prisma.session.deleteMany({ where: { userId: token.sub } });
        } catch {}
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
