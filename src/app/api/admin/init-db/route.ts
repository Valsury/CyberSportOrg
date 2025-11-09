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

    // 1. Проверяем, существует ли уже хотя бы один пользователь
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      return NextResponse.json({
        success: false,
        message: "Database already initialized. Users exist.",
        userCount: existingUsers,
      })
    }

    // 2. Пытаемся создать таблицы через прямые SQL запросы
    // (Prisma db push не работает через API, поэтому создаем таблицы вручную)
    try {
      // Проверяем, существует ли таблица users
      await prisma.$queryRaw`SELECT 1 FROM "users" LIMIT 1`
      results.push("✅ Tables already exist")
    } catch (error: any) {
      // Если таблицы не существуют, возвращаем инструкцию
      return NextResponse.json({
        success: false,
        message: "Tables do not exist. Please run 'npx prisma db push' first.",
        instructions: [
          "1. You need to create tables first",
          "2. This endpoint can only create the admin user",
          "3. Tables must be created via Prisma migration or db push",
        ],
      }, { status: 400 })
    }

    // 3. Создаем администратора
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
      message: "Database initialization completed",
      results,
    })
  } catch (error: any) {
    console.error("Init DB error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        details: error.code,
      },
      { status: 500 }
    )
  }
}

