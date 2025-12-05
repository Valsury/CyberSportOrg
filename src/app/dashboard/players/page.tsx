"use client"

import { useState, useEffect, useRef } from "react"
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
import { UserPlus, Edit, Trash2, Loader2, Camera } from "lucide-react"
import Image from "next/image"
import { formatUserName, getUserInitial } from "@/lib/format-name"

interface Team {
  id: string
  name: string
  tag: string
}

interface TeamMember {
  id: string
  team: Team
  role: string | null
}

interface Player {
  id: string
  email: string
  name: string | null
  username: string | null
  bio: string | null
  avatar: string | null
  teamMembers: TeamMember[]
}

export default function PlayersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
    bio: "",
    avatar: "",
    teamId: "",
    teamRole: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [originalAvatar, setOriginalAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER"
  const canDelete = session?.user.role === "ADMIN"

  // Функция для очистки дублирования в имени
  const cleanName = (name: string | null): string | null => {
    if (!name) return null
    
    let trimmed = name.trim()
    
    // Проверяем, не является ли имя результатом дублирования самого себя
    const halfLength = Math.floor(trimmed.length / 2)
    const firstHalf = trimmed.substring(0, halfLength).trim()
    const secondHalf = trimmed.substring(halfLength).trim()
    
    // Если вторая половина похожа на первую, возвращаем только первую половину
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const normalizedFirst = firstHalf.toLowerCase().replace(/['"`\s]/g, "")
      const normalizedSecond = secondHalf.toLowerCase().replace(/['"`\s]/g, "")
      if (normalizedFirst === normalizedSecond || normalizedSecond.startsWith(normalizedFirst)) {
        trimmed = firstHalf
      }
    }
    
    // Удаляем дублирование слов (сохраняем только первое вхождение каждого слова)
    const words = trimmed.split(/\s+/)
    const cleaned: string[] = []
    const seen = new Set<string>()
    
    for (const word of words) {
      // Нормализуем слово для сравнения (убираем кавычки и приводим к нижнему регистру)
      const normalized = word.toLowerCase().replace(/['"`]/g, "").trim()
      
      // Пропускаем пустые строки
      if (!normalized) continue
      
      // Добавляем слово только если мы его еще не видели
      if (!seen.has(normalized)) {
        cleaned.push(word)
        seen.add(normalized)
      }
    }
    
    const result = cleaned.join(" ").trim()
    return result.length > 0 ? result : null
  }

  useEffect(() => {
    if (canManage) {
      fetchPlayers()
      fetchTeams()
    }
  }, [canManage])

  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/players")
      if (res.ok) {
        const data = await res.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error("Error fetching players:", error)
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
    setEditingPlayer(null)
    setFormData({
      email: "",
      password: "",
      name: "",
      username: "",
      bio: "",
      avatar: "",
      teamId: "",
      teamRole: "",
    })
    setAvatarPreview(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player)
    const currentTeam = player.teamMembers[0]?.team
    const playerAvatar = player.avatar || ""
    setFormData({
      email: player.email,
      password: "",
      name: player.name || "",
      username: player.username || "",
      bio: player.bio || "",
      avatar: playerAvatar,
      teamId: currentTeam?.id || "",
      teamRole: player.teamMembers[0]?.role || "",
    })
    setAvatarPreview(playerAvatar || null)
    setOriginalAvatar(playerAvatar || null)
    setIsDialogOpen(true)
  }

  const handleOpenDelete = (player: Player) => {
    setDeletingPlayer(player)
    setIsDeleteDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите изображение")
      return
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Размер файла не должен превышать 5MB")
      return
    }

    setUploadingAvatar(true)

    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setFormData({ ...formData, avatar: base64String })
        setAvatarPreview(base64String)
        setUploadingAvatar(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error reading file:", error)
      alert("Ошибка при чтении файла")
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = () => {
    setFormData({ ...formData, avatar: "" })
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingPlayer
        ? `/api/players/${editingPlayer.id}`
        : "/api/players"
      const method = editingPlayer ? "PUT" : "POST"

      // Очищаем имя от дублирования перед сохранением
      const cleanedName = formData.name ? cleanName(formData.name) : null
      
      const payload: any = {
        email: formData.email,
        name: cleanedName,
        username: formData.username || null,
        bio: formData.bio || null,
        avatar: formData.avatar || null,
        teamId: formData.teamId || null,
        teamRole: formData.teamRole || null,
      }

      if (formData.password) {
        payload.password = formData.password
      }

      // Для создания пароль обязателен
      if (!editingPlayer && !formData.password) {
        alert("Пароль обязателен для нового игрока")
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
        // Если редактируем и аватар был удален (был, но теперь пустой)
        if (editingPlayer && originalAvatar && !formData.avatar) {
          await fetch(`/api/users/${editingPlayer.id}/avatar`, {
            method: "DELETE",
          })
        }

        setIsDialogOpen(false)
        setAvatarPreview(null)
        setOriginalAvatar(null)
        router.refresh()
        fetchPlayers()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при сохранении игрока")
      }
    } catch (error) {
      console.error("Error saving player:", error)
      alert("Ошибка при сохранении игрока")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingPlayer) return

    try {
      const res = await fetch(`/api/players/${deletingPlayer.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingPlayer(null)
        router.refresh()
        fetchPlayers()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при удалении игрока")
      }
    } catch (error) {
      console.error("Error deleting player:", error)
      alert("Ошибка при удалении игрока")
    }
  }

  if (!canManage) {
    return (
      <div className="space-y-8">
        <AnimatedSection>
          <h1 className="text-4xl font-bold text-white mb-2">Игроки</h1>
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
          <h1 className="text-4xl font-bold text-white mb-2">Игроки</h1>
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
            <h1 className="text-4xl font-bold text-white mb-2">Игроки</h1>
            <p className="text-muted-foreground text-lg">
              Управление игроками организации
            </p>
          </div>
          {canManage && (
            <Button onClick={handleOpenCreate}>
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить игрока
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
                  <TableHead className="text-white">Игрок</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Команда</TableHead>
                  <TableHead className="text-white">Роль в команде</TableHead>
                  <TableHead className="text-white">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Нет игроков
                    </TableCell>
                  </TableRow>
                ) : (
                  players.map((player) => {
                    const currentTeam = player.teamMembers[0]?.team
                    const displayName = formatUserName({
                      username: player.username,
                      name: player.name,
                      email: player.email,
                    })
                    const displayInitial = getUserInitial({
                      username: player.username,
                      name: player.name,
                      email: player.email,
                    })
                    return (
                      <TableRow key={player.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {player.avatar ? (
                              <Image
                                src={player.avatar}
                                alt={displayName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold">
                                {displayInitial}
                              </div>
                            )}
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <span className="text-white font-medium block truncate">
                                {displayName}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{player.email}</TableCell>
                        <TableCell className="text-white">
                          {currentTeam ? (
                            <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
                              {currentTeam.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Нет команды</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white">
                          {player.teamMembers[0]?.role || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(player)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {canDelete && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleOpenDelete(player)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
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
              {editingPlayer ? "Редактировать игрока" : "Добавить игрока"}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию об игроке
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
                  Пароль {editingPlayer ? "(оставьте пустым, чтобы не менять)" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingPlayer}
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
            <div className="space-y-4">
              <Label>Фото профиля</Label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <div className="relative">
                    <Image
                      src={avatarPreview}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="rounded-full object-cover border-2 border-red-500/50"
                      title=""
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(formData.name || formData.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar || submitting}
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        {avatarPreview ? "Изменить фото" : "Загрузить фото"}
                      </>
                    )}
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      disabled={uploadingAvatar || submitting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar-url">Или введите URL аватара</Label>
                <Input
                  id="avatar-url"
                  value={formData.avatar && !formData.avatar.startsWith("data:") ? formData.avatar : ""}
                  onChange={(e) => {
                    setFormData({ ...formData, avatar: e.target.value })
                    setAvatarPreview(e.target.value || null)
                  }}
                  className="bg-background/50"
                  placeholder="https://..."
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Рекомендуемый размер: 200x200px. Максимальный размер файла: 5MB
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamId">Команда</Label>
                <Select
                  value={formData.teamId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, teamId: value === "none" ? "" : value })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Выберите команду" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Нет команды</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} (@{team.tag})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamRole">Роль в команде</Label>
                <Input
                  id="teamRole"
                  value={formData.teamRole}
                  onChange={(e) => setFormData({ ...formData, teamRole: e.target.value })}
                  className="bg-background/50"
                  placeholder="AWPer, IGL, Support..."
                />
              </div>
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
                ) : editingPlayer ? (
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
            <DialogTitle className="text-white">Удалить игрока?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить игрока "{deletingPlayer ? formatUserName({
                username: deletingPlayer.username,
                name: deletingPlayer.name,
                email: deletingPlayer.email,
              }) : ''}"? Это действие нельзя отменить.
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

