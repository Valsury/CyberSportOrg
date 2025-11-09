import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { avatar } = body

    // Пользователь может обновлять только свой аватар, или админ может обновлять любой
    if (session.user.id !== id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        avatar: avatar || null,
      },
      select: {
        id: true,
        avatar: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating avatar:", error)
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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Пользователь может удалять только свой аватар, или админ может удалять любой
    if (session.user.id !== id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        avatar: null,
      },
      select: {
        id: true,
        avatar: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error deleting avatar:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

