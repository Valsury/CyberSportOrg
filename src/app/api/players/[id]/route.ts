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

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { email, password, name, username, bio, avatar, teamId, teamRole } = body

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

    // Обновляем пользователя
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    // Управление командой
    if (teamId !== undefined) {
      // Удаляем из всех команд
      await prisma.teamMember.deleteMany({
        where: { userId: id },
      })

      // Добавляем в новую команду, если указана
      if (teamId && teamId !== "") {
        await prisma.teamMember.create({
          data: {
            userId: id,
            teamId: teamId,
            role: teamRole || null,
          },
        })
      }
    }

    // Получаем обновленного пользователя с командой
    const updatedUser = await prisma.user.findUnique({
      where: { id },
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

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating player:", error)
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

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting player:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

