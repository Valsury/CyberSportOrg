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

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, description, icon, color, playersPerTeam } = body

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: { id },
    })

    if (!existingGame) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      )
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingGame.name) {
      const nameExists = await prisma.game.findUnique({
        where: { name },
      })

      if (nameExists) {
        return NextResponse.json(
          { error: "Game with this name already exists" },
          { status: 400 }
        )
      }
    }

    // Update game
    const game = await prisma.game.update({
      where: { id },
      data: {
        name: name || existingGame.name,
        description: description !== undefined ? description : existingGame.description,
        icon: icon !== undefined ? icon : existingGame.icon,
        color: color !== undefined ? color : existingGame.color,
        playersPerTeam: playersPerTeam !== undefined ? playersPerTeam : existingGame.playersPerTeam,
      },
    })

    return NextResponse.json(game)
  } catch (error) {
    console.error("Error updating game:", error)
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

    await prisma.game.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting game:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

