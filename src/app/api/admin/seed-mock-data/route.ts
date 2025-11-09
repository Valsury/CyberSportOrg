import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"

// Моковые данные для игроков
const mockPlayers = [
  {
    email: "player1@afina.org",
    password: "player123",
    name: "Алексей 'S1mple' Костилев",
    username: "s1mple",
    role: "PLAYER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=S1mple",
    bio: "Профессиональный игрок в Counter-Strike 2. Специализация: AWPer",
  },
  {
    email: "player2@afina.org",
    password: "player123",
    name: "Дмитрий 'Dendi' Ишутин",
    username: "dendi",
    role: "PLAYER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dendi",
    bio: "Легендарный игрок в Dota 2. Позиция: Mid",
  },
  {
    email: "player3@afina.org",
    password: "player123",
    name: "Иван 'Zeus' Тесленко",
    username: "zeus",
    role: "PLAYER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zeus",
    bio: "Опытный игрок в CS2. Роль: IGL",
  },
  {
    email: "player4@afina.org",
    password: "player123",
    name: "Сергей 'Solo' Березин",
    username: "solo",
    role: "PLAYER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Solo",
    bio: "Профессиональный игрок в Dota 2. Позиция: Support",
  },
  {
    email: "player5@afina.org",
    password: "player123",
    name: "Андрей 'B1ad3' Городенский",
    username: "b1ad3",
    role: "PLAYER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=B1ad3",
    bio: "Игрок в CS2. Специализация: Rifler",
  },
  {
    email: "player6@afina.org",
    password: "player123",
    name: "Егор 'flamie' Васильев",
    username: "flamie",
    role: "PLAYER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Flamie",
    bio: "Профессиональный игрок в CS2. Роль: Entry Fragger",
  },
  {
    email: "player7@afina.org",
    password: "player123",
    name: "Александр 's1mple' Костылев",
    username: "s1mple2",
    role: "PLAYER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=S1mple2",
    bio: "Игрок в Valorant. Роль: Duelist",
  },
  {
    email: "player8@afina.org",
    password: "player123",
    name: "Максим 'Perfecto' Захаров",
    username: "perfecto",
    role: "PLAYER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Perfecto",
    bio: "Профессиональный игрок в CS2. Позиция: Support",
  },
]

// Моковые данные для менеджеров
const mockManagers = [
  {
    email: "manager1@afina.org",
    password: "manager123",
    name: "Владимир 'Vlad' Петров",
    username: "vlad_manager",
    role: "MANAGER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VladManager",
    bio: "Опытный менеджер киберспортивных команд",
  },
  {
    email: "manager2@afina.org",
    password: "manager123",
    name: "Ольга 'Olga' Смирнова",
    username: "olga_manager",
    role: "MANAGER" as const,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=OlgaManager",
    bio: "Менеджер по развитию команд",
  },
]

// Моковые данные для турниров
const mockTournaments = [
  {
    name: "Afina Championship 2024",
    description: "Главный турнир года от Afina. Призовой фонд $100,000",
    startDate: new Date("2024-12-01T10:00:00Z"),
    endDate: new Date("2024-12-15T18:00:00Z"),
    prizePool: 100000,
    game: "Counter-Strike 2",
    status: "UPCOMING",
  },
  {
    name: "Dota 2 Winter Cup",
    description: "Зимний кубок по Dota 2",
    startDate: new Date("2024-11-15T12:00:00Z"),
    endDate: new Date("2024-11-20T20:00:00Z"),
    prizePool: 50000,
    game: "Dota 2",
    status: "COMPLETED",
  },
  {
    name: "Valorant Masters",
    description: "Турнир по Valorant для лучших команд",
    startDate: new Date("2024-10-01T14:00:00Z"),
    endDate: new Date("2024-10-10T22:00:00Z"),
    prizePool: 75000,
    game: "Valorant",
    status: "COMPLETED",
  },
  {
    name: "CS2 Pro League",
    description: "Профессиональная лига по Counter-Strike 2",
    startDate: new Date("2024-12-20T16:00:00Z"),
    endDate: new Date("2025-01-05T18:00:00Z"),
    prizePool: 150000,
    game: "Counter-Strike 2",
    status: "UPCOMING",
  },
]

export async function POST(req: NextRequest) {
  try {
    // Проверка авторизации - только ADMIN
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const results: string[] = []

    // 1. Создаем игроков
    results.push("📝 Создание игроков...")
    const createdPlayers = []
    for (const player of mockPlayers) {
      const existing = await prisma.user.findUnique({
        where: { email: player.email },
      })
      if (!existing) {
        const hashedPassword = await bcryptjs.hash(player.password, 10)
        const created = await prisma.user.create({
          data: {
            ...player,
            password: hashedPassword,
          },
        })
        createdPlayers.push(created)
        results.push(`  ✅ Создан игрок: ${player.name} (${player.email})`)
      } else {
        results.push(`  ℹ️  Игрок уже существует: ${player.email}`)
        createdPlayers.push(existing)
      }
    }

    // 2. Создаем менеджеров
    results.push("\n👔 Создание менеджеров...")
    const createdManagers = []
    for (const manager of mockManagers) {
      const existing = await prisma.user.findUnique({
        where: { email: manager.email },
      })
      if (!existing) {
        const hashedPassword = await bcryptjs.hash(manager.password, 10)
        const created = await prisma.user.create({
          data: {
            ...manager,
            password: hashedPassword,
          },
        })
        createdManagers.push(created)
        results.push(`  ✅ Создан менеджер: ${manager.name} (${manager.email})`)
      } else {
        results.push(`  ℹ️  Менеджер уже существует: ${manager.email}`)
        createdManagers.push(existing)
      }
    }

    // 3. Создаем команды
    results.push("\n🏆 Создание команд...")
    const teams = [
      {
        name: "Afina CS2 Team",
        tag: "AFINA-CS",
        description: "Профессиональная команда по Counter-Strike 2",
        manager: createdManagers[0],
        players: [createdPlayers[0], createdPlayers[2], createdPlayers[4], createdPlayers[5], createdPlayers[7]],
        playerRoles: ["AWPer", "IGL", "Rifler", "Entry Fragger", "Support"],
      },
      {
        name: "Afina Dota 2 Squad",
        tag: "AFINA-DOTA",
        description: "Команда по Dota 2",
        manager: createdManagers[1],
        players: [createdPlayers[1], createdPlayers[3]],
        playerRoles: ["Mid", "Support"],
      },
    ]

    const createdTeams = []
    for (const teamData of teams) {
      const existing = await prisma.team.findUnique({
        where: { tag: teamData.tag },
      })
      if (!existing) {
        // Проверяем, что менеджер существует
        if (!teamData.manager) {
          results.push(`  ⚠️  Пропущена команда ${teamData.name}: менеджер не найден`)
          continue
        }

        const team = await prisma.team.create({
          data: {
            name: teamData.name,
            tag: teamData.tag,
            description: teamData.description,
            managerId: teamData.manager.id,
            status: "ACTIVE",
            members: {
              create: teamData.players
                .filter((p) => p) // Фильтруем undefined
                .map((player, index) => ({
                  userId: player.id,
                  role: teamData.playerRoles[index] || "Player",
                })),
            },
          },
        })
        createdTeams.push(team)
        results.push(`  ✅ Создана команда: ${teamData.name} (${teamData.tag})`)
      } else {
        results.push(`  ℹ️  Команда уже существует: ${teamData.tag}`)
        createdTeams.push(existing)
      }
    }

    // 4. Создаем турниры
    results.push("\n🎮 Создание турниров...")
    let tournamentsCreated = 0
    for (const tournament of mockTournaments) {
      const existing = await prisma.tournament.findFirst({
        where: { name: tournament.name },
      })
      if (!existing) {
        await prisma.tournament.create({
          data: tournament,
        })
        tournamentsCreated++
        results.push(`  ✅ Создан турнир: ${tournament.name}`)
      } else {
        results.push(`  ℹ️  Турнир уже существует: ${tournament.name}`)
      }
    }

    results.push("\n✨ Генерация моковых данных завершена!")
    results.push("\n📊 Статистика:")
    results.push(`  - Игроков: ${createdPlayers.length}`)
    results.push(`  - Менеджеров: ${createdManagers.length}`)
    results.push(`  - Команд: ${createdTeams.length}`)
    results.push(`  - Турниров: ${tournamentsCreated} новых`)

    return NextResponse.json({
      success: true,
      message: "Mock data seeded successfully",
      results,
      stats: {
        players: createdPlayers.length,
        managers: createdManagers.length,
        teams: createdTeams.length,
        tournaments: tournamentsCreated,
      },
    })
  } catch (error: any) {
    console.error("Seed mock data error:", error)
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

