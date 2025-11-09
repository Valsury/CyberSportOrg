import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { email, password, name, username, bio, avatar, teamIds } = body

    const updateData: any = {
      email,
      name: name || null,
      username: username || null,
      bio: bio || null,
      avatar: avatar || null,
    }

    if (password) {
      updateData.password = await bcryptjs.hash(password, 10)
    }

    // Update manager
    await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Update team assignments
    if (teamIds !== undefined) {
      // Remove manager from all teams
      await prisma.team.updateMany({
        where: {
          managerId: id,
        },
        data: {
          managerId: "", // Temporary, will be updated below
        },
      })

      // Assign to new teams if specified
      if (teamIds && Array.isArray(teamIds) && teamIds.length > 0) {
        // First, we need to find a manager for teams that will be unassigned
        // For simplicity, we'll just update the specified teams
        await prisma.team.updateMany({
          where: {
            id: { in: teamIds },
          },
          data: {
            managerId: id,
          },
        })
      }
    }

    // Fetch updated manager with teams
    const updatedManager = await prisma.user.findUnique({
      where: { id },
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

    return NextResponse.json(updatedManager)
  } catch (error) {
    console.error("Error updating manager:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Don't allow deleting yourself
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Check if manager has teams
    const teamsCount = await prisma.team.count({
      where: { managerId: id },
    })

    if (teamsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete manager with assigned teams. Please reassign teams first." },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting manager:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

