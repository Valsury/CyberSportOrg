import { Role } from "@/generated/prisma/enums"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: Role
      avatar?: string | null
    }
  }

  interface User {
    role: Role
    avatar?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    id: string
    avatar?: string | null
  }
}

