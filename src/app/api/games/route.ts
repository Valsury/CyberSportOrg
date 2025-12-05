import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(games)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, icon, color, playersPerTeam } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Check if game already exists
    const existingGame = await prisma.game.findUnique({
      where: { name },
    })

    if (existingGame) {
      return NextResponse.json(
        { error: "Game with this name already exists" },
        { status: 400 }
      )
    }

    // Create game
    const game = await prisma.game.create({
      data: {
        name,
        description: description || null,
        icon: icon || null,
        color: color || null,
        playersPerTeam: playersPerTeam || 5,
      },
    })

    return NextResponse.json(game, { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

