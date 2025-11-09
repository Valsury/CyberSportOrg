"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AnimatedSection } from "@/components/animated-section"
import { UserPlus, Edit, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"

interface Team {
  id: string
  name: string
  tag: string
  status: string
}

interface Manager {
  id: string
  email: string
  name: string | null
  username: string | null
  bio: string | null
  avatar: string | null
  managedTeams: Team[]
}

export default function ManagersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [managers, setManagers] = useState<Manager[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingManager, setEditingManager] = useState<Manager | null>(null)
  const [deletingManager, setDeletingManager] = useState<Manager | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    bio: "",
    avatar: "",
    teamIds: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)

  const canManage = session?.user.role === "ADMIN"

  useEffect(() => {
    if (canManage) {
      fetchManagers()
      fetchTeams()
    }
  }, [canManage])

  const fetchManagers = async () => {
    try {
      const res = await fetch("/api/managers")
      if (res.ok) {
        const data = await res.json()
        setManagers(data)
      }
    } catch (error) {
      console.error("Error fetching managers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams")
      if (res.ok) {
        const data = await res.json()
        setTeams(data)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const handleOpenCreate = () => {
    setEditingManager(null)
    setFormData({
      email: "",
      password: "",
      name: "",
      username: "",
      bio: "",
      avatar: "",
      teamIds: [],
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (manager: Manager) => {
    setEditingManager(manager)
    setFormData({
      email: manager.email,
      password: "",
      name: manager.name || "",
      username: manager.username || "",
      bio: manager.bio || "",
      avatar: manager.avatar || "",
      teamIds: manager.managedTeams.map((t) => t.id),
    })
    setIsDialogOpen(true)
  }

  const handleOpenDelete = (manager: Manager) => {
    setDeletingManager(manager)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingManager
        ? `/api/managers/${editingManager.id}`
        : "/api/managers"
      const method = editingManager ? "PUT" : "POST"

      const payload: any = {
        email: formData.email,
        name: formData.name || null,
        username: formData.username || null,
        bio: formData.bio || null,
        avatar: formData.avatar || null,
        teamIds: formData.teamIds,
      }

      if (formData.password) {
        payload.password = formData.password
      }

      // Для создания пароль обязателен
      if (!editingManager && !formData.password) {
        alert("Пароль обязателен для нового менеджера")
        setSubmitting(false)
        return
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
        fetchManagers()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при сохранении менеджера")
      }
    } catch (error) {
      console.error("Error saving manager:", error)
      alert("Ошибка при сохранении менеджера")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingManager) return

    try {
      const res = await fetch(`/api/managers/${deletingManager.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingManager(null)
        router.refresh()
        fetchManagers()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при удалении менеджера")
      }
    } catch (error) {
      console.error("Error deleting manager:", error)
      alert("Ошибка при удалении менеджера")
    }
  }

  const toggleTeam = (teamId: string) => {
    setFormData((prev) => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId)
        ? prev.teamIds.filter((id) => id !== teamId)
        : [...prev.teamIds, teamId],
    }))
  }

  if (!canManage) {
    return (
      <div className="space-y-8">
        <AnimatedSection>
          <h1 className="text-4xl font-bold text-white mb-2">Менеджеры</h1>
          <p className="text-muted-foreground text-lg">
            У вас нет доступа к этой странице
          </p>
        </AnimatedSection>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <AnimatedSection>
          <h1 className="text-4xl font-bold text-white mb-2">Менеджеры</h1>
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
            <h1 className="text-4xl font-bold text-white mb-2">Менеджеры</h1>
            <p className="text-muted-foreground text-lg">
              Управление менеджерами организации
            </p>
          </div>
          {canManage && (
            <Button onClick={handleOpenCreate}>
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить менеджера
            </Button>
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <Card className="bg-card/80 backdrop-blur-sm border-red-500/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Менеджер</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Команды</TableHead>
                  <TableHead className="text-white">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Нет менеджеров
                    </TableCell>
                  </TableRow>
                ) : (
                  managers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {manager.avatar ? (
                            <Image
                              src={manager.avatar}
                              alt={manager.name || ""}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                              {(manager.name || manager.email || "U")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">
                              {manager.name || manager.username || manager.email}
                            </p>
                            {manager.username && (
                              <p className="text-xs text-muted-foreground">@{manager.username}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{manager.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {manager.managedTeams.length > 0 ? (
                            manager.managedTeams.map((team) => (
                              <span
                                key={team.id}
                                className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400"
                              >
                                {team.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Нет команд</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(manager)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleOpenDelete(manager)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingManager ? "Редактировать менеджера" : "Добавить менеджера"}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о менеджере
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Пароль {editingManager ? "(оставьте пустым, чтобы не менять)" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingManager}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Биография</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-background/50"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">URL аватара</Label>
              <Input
                id="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="bg-background/50"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Команды</Label>
              <div className="border rounded-md p-4 bg-background/50 max-h-48 overflow-y-auto">
                {teams.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет доступных команд</p>
                ) : (
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <label
                        key={team.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.teamIds.includes(team.id)}
                          onChange={() => toggleTeam(team.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-white">
                          {team.name} (@{team.tag})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Выберите команды, которыми будет управлять этот менеджер
              </p>
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
                ) : editingManager ? (
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
            <DialogTitle className="text-white">Удалить менеджера?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить менеджера "{deletingManager?.name || deletingManager?.email}"? 
              {deletingManager && deletingManager.managedTeams.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Внимание: у менеджера есть назначенные команды. Сначала нужно переназначить команды.
                </span>
              )}
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

