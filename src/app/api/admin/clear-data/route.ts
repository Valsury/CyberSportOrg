import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results: string[] = []

    try {
      // Удаляем все данные, начиная с зависимых таблиц
      results.push("🗑️ Начинаем очистку данных...")

      // Удаляем участников команд
      const deletedMembers = await prisma.teamMember.deleteMany({})
      results.push(`✅ Удалено участников команд: ${deletedMembers.count}`)

      // Удаляем команды
      const deletedTeams = await prisma.team.deleteMany({})
      results.push(`✅ Удалено команд: ${deletedTeams.count}`)

      // Удаляем турниры
      const deletedTournaments = await prisma.tournament.deleteMany({})
      results.push(`✅ Удалено турниров: ${deletedTournaments.count}`)

      // Удаляем сессии и аккаунты (они удалятся каскадно при удалении пользователей)
      const deletedSessions = await prisma.session.deleteMany({})
      results.push(`✅ Удалено сессий: ${deletedSessions.count}`)

      const deletedAccounts = await prisma.account.deleteMany({})
      results.push(`✅ Удалено аккаунтов: ${deletedAccounts.count}`)

      // Удаляем игры (если таблица существует)
      try {
        const deletedGames = await prisma.game.deleteMany({})
        results.push(`✅ Удалено игр: ${deletedGames.count}`)
      } catch (error: any) {
        if (!error.message?.includes("does not exist")) {
          results.push(`⚠️ Игры: ${error.message}`)
        }
      }

      // Удаляем всех пользователей кроме текущего админа
      const deletedUsers = await prisma.user.deleteMany({
        where: {
          id: {
            not: session.user.id,
          },
        },
      })
      results.push(`✅ Удалено пользователей: ${deletedUsers.count}`)

      results.push("✅ Очистка данных завершена успешно!")

      return NextResponse.json({
        success: true,
        results,
      })
    } catch (error: any) {
      console.error("Error clearing data:", error)
      results.push(`❌ Ошибка при очистке: ${error.message}`)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          results,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in clear-data route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

