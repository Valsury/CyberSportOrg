"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedCard } from "@/components/animated-card"
import { Users, Gamepad2, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Game {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  playersPerTeam: number
}

export default function GamesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [deletingGame, setDeletingGame] = useState<Game | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "",
    playersPerTeam: 5,
  })
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = session?.user.role === "ADMIN"

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games")
      if (res.ok) {
        const data = await res.json()
        setGames(data)
      }
    } catch (error) {
      console.error("Error fetching games:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingGame(null)
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "",
      playersPerTeam: 5,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (game: Game) => {
    setEditingGame(game)
    setFormData({
      name: game.name,
      description: game.description || "",
      icon: game.icon || "",
      color: game.color || "",
      playersPerTeam: game.playersPerTeam,
    })
    setIsDialogOpen(true)
  }

  const handleOpenDelete = (game: Game) => {
    setDeletingGame(game)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingGame ? `/api/games/${editingGame.id}` : "/api/games"
      const method = editingGame ? "PUT" : "POST"

      const payload: any = {
        name: formData.name,
        description: formData.description || null,
        icon: formData.icon || null,
        color: formData.color || null,
        playersPerTeam: formData.playersPerTeam,
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setIsDialogOpen(false)
        router.refresh()
        fetchGames()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при сохранении игры")
      }
    } catch (error) {
      console.error("Error saving game:", error)
      alert("Ошибка при сохранении игры")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingGame) return

    try {
      const res = await fetch(`/api/games/${deletingGame.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingGame(null)
        router.refresh()
        fetchGames()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при удалении игры")
      }
    } catch (error) {
      console.error("Error deleting game:", error)
      alert("Ошибка при удалении игры")
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <AnimatedSection>
          <h1 className="text-4xl font-bold text-white mb-2">Игры</h1>
          <p className="text-muted-foreground text-lg">Загрузка...</p>
        </AnimatedSection>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Игры</h1>
            <p className="text-muted-foreground text-lg">
              Управление играми организации
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Создать игру
            </Button>
          )}
        </div>
      </AnimatedSection>

      {games.length === 0 ? (
        <AnimatedSection>
          <Card className="bg-card/80 backdrop-blur-sm border-red-500/20">
            <CardContent className="py-12 text-center">
              <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Нет игр</h3>
              <p className="text-muted-foreground">
                {isAdmin ? "Создайте первую игру для начала работы" : "Игры пока не добавлены"}
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => (
            <AnimatedCard key={game.id} delay={index * 0.1}>
              <Card className="bg-card/80 backdrop-blur-sm border-red-500/20 hover:border-red-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${game.color || "from-gray-500 to-gray-600"} flex items-center justify-center text-3xl`}>
                      {game.icon || "🎮"}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(game)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenDelete(game)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-white">{game.name}</CardTitle>
                  <CardDescription>{game.description || "Без описания"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Игроков в команде:</span>
                    <span className="text-white">{game.playersPerTeam}</span>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingGame ? "Редактировать игру" : "Создать игру"}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию об игре
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background/50"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Иконка (эмодзи)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="bg-background/50"
                  placeholder="🎮"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Цвет (Tailwind классы)</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="bg-background/50"
                  placeholder="from-blue-500 to-cyan-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playersPerTeam">Игроков в команде *</Label>
              <Input
                id="playersPerTeam"
                type="number"
                min="1"
                max="10"
                value={formData.playersPerTeam}
                onChange={(e) => setFormData({ ...formData, playersPerTeam: parseInt(e.target.value) || 5 })}
                required
                className="bg-background/50"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : editingGame ? (
                  "Сохранить"
                ) : (
                  "Создать"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-white">Удалить игру?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить игру "{deletingGame?.name}"? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

