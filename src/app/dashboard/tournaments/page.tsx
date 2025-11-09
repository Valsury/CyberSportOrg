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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedCard } from "@/components/animated-card"
import { Trophy, Calendar, DollarSign, Gamepad2, Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface Tournament {
  id: string
  name: string
  description: string | null
  startDate: string
  endDate: string | null
  prizePool: number | null
  game: string | null
  status: string
}

export default function TournamentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
  const [deletingTournament, setDeletingTournament] = useState<Tournament | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    prizePool: "",
    game: "",
    status: "UPCOMING",
  })
  const [submitting, setSubmitting] = useState(false)

  const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER"

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const res = await fetch("/api/tournaments")
      if (res.ok) {
        const data = await res.json()
        setTournaments(data)
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingTournament(null)
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      prizePool: "",
      game: "",
      status: "UPCOMING",
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (tournament: Tournament) => {
    setEditingTournament(tournament)
    // Convert ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
    const startDate = tournament.startDate
      ? new Date(tournament.startDate).toISOString().slice(0, 16)
      : ""
    const endDate = tournament.endDate
      ? new Date(tournament.endDate).toISOString().slice(0, 16)
      : ""
    
    setFormData({
      name: tournament.name,
      description: tournament.description || "",
      startDate,
      endDate,
      prizePool: tournament.prizePool?.toString() || "",
      game: tournament.game || "",
      status: tournament.status,
    })
    setIsDialogOpen(true)
  }

  const handleOpenDelete = (tournament: Tournament) => {
    setDeletingTournament(tournament)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingTournament
        ? `/api/tournaments/${editingTournament.id}`
        : "/api/tournaments"
      const method = editingTournament ? "PUT" : "POST"

      // Convert datetime-local to ISO string
      const startDateISO = formData.startDate ? new Date(formData.startDate).toISOString() : ""
      const endDateISO = formData.endDate ? new Date(formData.endDate).toISOString() : null

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          startDate: startDateISO,
          endDate: endDateISO,
          prizePool: formData.prizePool ? parseFloat(formData.prizePool) : null,
          game: formData.game || null,
          status: formData.status,
        }),
      })

      if (res.ok) {
        setIsDialogOpen(false)
        router.refresh()
        fetchTournaments()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при сохранении турнира")
      }
    } catch (error) {
      console.error("Error saving tournament:", error)
      alert("Ошибка при сохранении турнира")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTournament) return

    try {
      const res = await fetch(`/api/tournaments/${deletingTournament.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingTournament(null)
        router.refresh()
        fetchTournaments()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при удалении турнира")
      }
    } catch (error) {
      console.error("Error deleting tournament:", error)
      alert("Ошибка при удалении турнира")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-500/20 text-blue-400"
      case "ONGOING":
        return "bg-green-500/20 text-green-400"
      case "COMPLETED":
        return "bg-red-500/20 text-red-400"
      case "CANCELLED":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "Предстоящий"
      case "ONGOING":
        return "Идет"
      case "COMPLETED":
        return "Завершен"
      case "CANCELLED":
        return "Отменен"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <AnimatedSection>
          <h1 className="text-4xl font-bold text-white mb-2">Турниры</h1>
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
            <h1 className="text-4xl font-bold text-white mb-2">Турниры</h1>
            <p className="text-muted-foreground text-lg">
              Просмотр и управление турнирами
            </p>
          </div>
          {canManage && (
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Создать турнир
            </Button>
          )}
        </div>
      </AnimatedSection>

      {tournaments.length === 0 ? (
        <AnimatedSection>
          <Card className="bg-card/80 backdrop-blur-sm border-red-500/20">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Нет турниров</h3>
              <p className="text-muted-foreground">
                {canManage
                  ? "Создайте первый турнир"
                  : "Турниры будут отображаться здесь"}
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament, index) => (
            <AnimatedCard key={tournament.id} delay={index * 0.1}>
              <Card className="bg-card/80 backdrop-blur-sm border-red-500/20 hover:border-red-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center`}>
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {getStatusText(tournament.status)}
                    </span>
                  </div>
                  <CardTitle className="text-white">{tournament.name}</CardTitle>
                  {tournament.description && (
                    <CardDescription>{tournament.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Начало:</span>
                      <span className="text-white">
                        {format(new Date(tournament.startDate), "d MMMM yyyy")}
                      </span>
                    </div>
                    {tournament.endDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Конец:</span>
                        <span className="text-white">
                          {format(new Date(tournament.endDate), "d MMMM yyyy")}
                        </span>
                      </div>
                    )}
                    {tournament.game && (
                      <div className="flex items-center gap-2 text-sm">
                        <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Игра:</span>
                        <span className="text-white">{tournament.game}</span>
                      </div>
                    )}
                    {tournament.prizePool && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Призовой фонд:</span>
                        <span className="text-white">${tournament.prizePool.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(tournament)}
                        className="flex-1"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenDelete(tournament)}
                        className="flex-1"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingTournament ? "Редактировать турнир" : "Создать турнир"}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о турнире
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
                <Label htmlFor="startDate">Дата начала *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Дата окончания</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="game">Игра</Label>
                <Input
                  id="game"
                  value={formData.game}
                  onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                  className="bg-background/50"
                  placeholder="Counter-Strike 2, Dota 2, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prizePool">Призовой фонд ($)</Label>
                <Input
                  id="prizePool"
                  type="number"
                  step="0.01"
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                  className="bg-background/50"
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">Предстоящий</SelectItem>
                  <SelectItem value="ONGOING">Идет</SelectItem>
                  <SelectItem value="COMPLETED">Завершен</SelectItem>
                  <SelectItem value="CANCELLED">Отменен</SelectItem>
                </SelectContent>
              </Select>
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
                {submitting ? "Сохранение..." : editingTournament ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-white">Удалить турнир?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить турнир "{deletingTournament?.name}"? Это действие нельзя отменить.
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
