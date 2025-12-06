import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        tag: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
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
    const { name, tag, description, managerId, status, playerIds } = body

    if (!name || !tag || !managerId) {
      return NextResponse.json(
        { error: "Name, tag, and managerId are required" },
        { status: 400 }
      )
    }

    // Check if team with this tag already exists
    const existingTeam = await prisma.team.findUnique({
      where: { tag },
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: "Team with this tag already exists" },
        { status: 400 }
      )
    }

    // Check if manager exists
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
    })

    if (!manager || manager.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Manager not found or user is not a manager" },
        { status: 400 }
      )
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        tag,
        description: description || null,
        managerId,
        status: status || "ACTIVE",
        members: playerIds && Array.isArray(playerIds) && playerIds.length > 0
          ? {
              create: playerIds.map((playerId: string) => ({
                userId: playerId,
              })),
            }
          : undefined,
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
