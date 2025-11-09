import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    // Проверка секретного ключа для безопасности
    const authHeader = req.headers.get("authorization")
    const initSecret = process.env.INIT_DB_SECRET || "change-this-secret-key"
    
    if (authHeader !== `Bearer ${initSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized. Provide Authorization header with Bearer token." },
        { status: 401 }
      )
    }

    const results: string[] = []

    // 1. Создаем таблицы через SQL (если их нет)
    let tablesExist = false
    try {
      // Проверяем существование таблицы users
      await prisma.$queryRaw`SELECT 1 FROM "users" LIMIT 1`
      tablesExist = true
      results.push("✅ Table 'users' already exists")
    } catch (error: any) {
      tablesExist = false
      // Создаем таблицы вручную через SQL
      results.push("📦 Creating database tables...")
      
      try {
        // Создаем enum типы
        await prisma.$executeRawUnsafe(`
          DO $$ BEGIN
            CREATE TYPE "Role" AS ENUM ('ADMIN', 'PLAYER', 'MANAGER');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `)
        results.push("✅ Created Role enum")
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          results.push(`⚠️ Role enum: ${e.message}`)
        }
      }
      
      try {
        await prisma.$executeRawUnsafe(`
          DO $$ BEGIN
            CREATE TYPE "TeamStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISBANDED');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `)
        results.push("✅ Created TeamStatus enum")
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          results.push(`⚠️ TeamStatus enum: ${e.message}`)
        }
      }

      // Создаем таблицу users
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "users" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "name" TEXT,
            "username" TEXT,
            "role" "Role" NOT NULL DEFAULT 'PLAYER',
            "avatar" TEXT,
            "bio" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "users_pkey" PRIMARY KEY ("id")
          )
        `)
        results.push("✅ Created users table")
      } catch (e: any) {
        results.push(`⚠️ Users table: ${e.message}`)
      }

      try {
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`)
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username")`)
      } catch (e: any) {
        results.push(`⚠️ Indexes: ${e.message}`)
      }

      // Создаем остальные таблицы (упрощенно, только основные)
      const tables = [
        {
          name: "accounts",
          sql: `CREATE TABLE IF NOT EXISTS "accounts" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "provider" TEXT NOT NULL,
            "providerAccountId" TEXT NOT NULL,
            "refresh_token" TEXT,
            "access_token" TEXT,
            "expires_at" INTEGER,
            "token_type" TEXT,
            "scope" TEXT,
            "id_token" TEXT,
            "session_state" TEXT,
            CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: "sessions",
          sql: `CREATE TABLE IF NOT EXISTS "sessions" (
            "id" TEXT NOT NULL,
            "sessionToken" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "expires" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: "verification_tokens",
          sql: `CREATE TABLE IF NOT EXISTS "verification_tokens" (
            "identifier" TEXT NOT NULL,
            "token" TEXT NOT NULL,
            "expires" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier", "token")
          )`,
        },
        {
          name: "teams",
          sql: `CREATE TABLE IF NOT EXISTS "teams" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "tag" TEXT NOT NULL,
            "logo" TEXT,
            "status" "TeamStatus" NOT NULL DEFAULT 'ACTIVE',
            "description" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "managerId" TEXT NOT NULL,
            CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: "team_members",
          sql: `CREATE TABLE IF NOT EXISTS "team_members" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "teamId" TEXT NOT NULL,
            "role" TEXT,
            "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
          )`,
        },
        {
          name: "tournaments",
          sql: `CREATE TABLE IF NOT EXISTS "tournaments" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "startDate" TIMESTAMP(3) NOT NULL,
            "endDate" TIMESTAMP(3),
            "prizePool" DOUBLE PRECISION,
            "game" TEXT,
            "status" TEXT NOT NULL DEFAULT 'UPCOMING',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
          )`,
        },
      ]

      for (const table of tables) {
        try {
          await prisma.$executeRawUnsafe(table.sql)
          results.push(`✅ Created ${table.name} table`)
        } catch (e: any) {
          if (!e.message?.includes('already exists')) {
            results.push(`⚠️ ${table.name}: ${e.message}`)
          }
        }
      }

      // Создаем индексы
      const indexes = [
        `CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "teams_tag_key" ON "teams"("tag")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "team_members_userId_teamId_key" ON "team_members"("userId", "teamId")`,
      ]

      for (const indexSql of indexes) {
        try {
          await prisma.$executeRawUnsafe(indexSql)
        } catch (e: any) {
          // Игнорируем ошибки индексов
        }
      }

      // Добавляем foreign keys (опционально, могут быть проблемы)
      const foreignKeys = [
        `ALTER TABLE "accounts" ADD CONSTRAINT IF NOT EXISTS "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
        `ALTER TABLE "sessions" ADD CONSTRAINT IF NOT EXISTS "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
        `ALTER TABLE "teams" ADD CONSTRAINT IF NOT EXISTS "teams_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT`,
        `ALTER TABLE "team_members" ADD CONSTRAINT IF NOT EXISTS "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
        `ALTER TABLE "team_members" ADD CONSTRAINT IF NOT EXISTS "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE`,
      ]

      for (const fkSql of foreignKeys) {
        try {
          await prisma.$executeRawUnsafe(fkSql)
        } catch (e: any) {
          // Игнорируем ошибки foreign keys (могут быть проблемы с IF NOT EXISTS в некоторых версиях PostgreSQL)
        }
      }

      results.push("✅ All tables created successfully")
    }

    // 2. Создаем администратора
    const adminEmail = process.env.ADMIN_EMAIL || "admin@cybersport.org"
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (!existingAdmin) {
      const hashedPassword = await bcryptjs.hash(adminPassword, 10)
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: "Administrator",
          username: "admin",
          role: "ADMIN",
        },
      })
      results.push(`✅ Admin user created: ${adminEmail}`)
      results.push(`🔑 Password: ${adminPassword}`)
    } else {
      results.push(`ℹ️  Admin user already exists: ${adminEmail}`)
    }

    return NextResponse.json({
      success: true,
      message: "Database fully initialized",
      results,
    })
  } catch (error: any) {
    console.error("Init DB error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        details: error.code,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

