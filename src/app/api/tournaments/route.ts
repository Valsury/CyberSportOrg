import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, startDate, endDate, prizePool, game, status } = body

    if (!name || !startDate) {
      return NextResponse.json(
        { error: "Name and start date are required" },
        { status: 400 }
      )
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        prizePool: prizePool ? parseFloat(prizePool) : null,
        game: game || null,
        status: status || "UPCOMING",
      },
    })

    return NextResponse.json(tournament, { status: 201 })
  } catch (error) {
    console.error("Error creating tournament:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

