import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const managers = await prisma.user.findMany({
      where: {
        role: "MANAGER",
      },
      include: {
        managedTeams: {
          select: {
            id: true,
            name: true,
            tag: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(managers)
  } catch (error) {
    console.error("Error fetching managers:", error)
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
    const { email, password, name, username, bio, avatar, teamIds } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create manager
    const manager = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        username: username || null,
        bio: bio || null,
        avatar: avatar || null,
        role: "MANAGER",
      },
      include: {
        managedTeams: {
          select: {
            id: true,
            name: true,
            tag: true,
            status: true,
          },
        },
      },
    })

    // Assign teams if specified
    if (teamIds && Array.isArray(teamIds) && teamIds.length > 0) {
      await prisma.team.updateMany({
        where: {
          id: { in: teamIds },
        },
        data: {
          managerId: manager.id,
        },
      })

      // Fetch updated manager with teams
      const updatedManager = await prisma.user.findUnique({
        where: { id: manager.id },
        include: {
          managedTeams: {
            select: {
              id: true,
              name: true,
              tag: true,
              status: true,
            },
          },
        },
      })

      return NextResponse.json(updatedManager, { status: 201 })
    }

    return NextResponse.json(manager, { status: 201 })
  } catch (error) {
    console.error("Error creating manager:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

