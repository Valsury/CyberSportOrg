import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcryptjs from "bcryptjs"
import { Role } from "@/generated/prisma/enums"

export const authOptions: NextAuthOptions = {
  // Не используем adapter для credentials provider
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log("User not found:", credentials.email)
            return null
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email)
            return null
          }

          console.log("User authenticated:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.avatar = (user as any).avatar
      }
      // Обновляем avatar при обновлении сессии
      if (trigger === "update" && token.id) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { avatar: true },
        })
        if (updatedUser) {
          token.avatar = updatedUser.avatar
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.email = token.email as string
        session.user.name = token.name as string | null
        session.user.avatar = token.avatar as string | null
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
}

