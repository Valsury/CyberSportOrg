import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const players = await prisma.user.findMany({
      where: {
        role: "PLAYER",
      },
      include: {
        teamMembers: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                tag: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error("Error fetching players:", error)
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
    const { email, password, name, username, bio, avatar, teamId, teamRole } = body

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        username: username || null,
        bio: bio || null,
        avatar: avatar || null,
        role: "PLAYER",
      },
      include: {
        teamMembers: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                tag: true,
              },
            },
          },
        },
      },
    })

    // Add to team if specified
    if (teamId && teamId !== "") {
      await prisma.teamMember.create({
        data: {
          userId: user.id,
          teamId: teamId,
          role: teamRole || null,
        },
      })

      // Fetch updated user with team
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          teamMembers: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  tag: true,
                },
              },
            },
          },
        },
      })

      return NextResponse.json(updatedUser, { status: 201 })
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating player:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
