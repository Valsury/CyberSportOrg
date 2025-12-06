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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnimatedSection } from "@/components/animated-section"
import { ArrowLeft, Loader2, Users } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatUserName } from "@/lib/format-name"

interface Manager {
  id: string
  email: string
  name: string | null
  username: string | null
}

interface Player {
  id: string
  email: string
  name: string | null
  username: string | null
}

export default function NewTeamPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [managers, setManagers] = useState<Manager[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    description: "",
    managerId: "",
    status: "ACTIVE",
    selectedPlayerIds: [] as string[],
  })

  const canManage = session?.user.role === "ADMIN" || session?.user.role === "MANAGER"

  useEffect(() => {
    if (canManage) {
      fetchManagers()
      fetchPlayers()
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

  const fetchPlayers = async () => {
    try {
      const res = await fetch("/api/players")
      if (res.ok) {
        const data = await res.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error("Error fetching players:", error)
    }
  }

  const togglePlayer = (playerId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlayerIds: prev.selectedPlayerIds.includes(playerId)
        ? prev.selectedPlayerIds.filter((id) => id !== playerId)
        : [...prev.selectedPlayerIds, playerId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          tag: formData.tag,
          description: formData.description || null,
          managerId: formData.managerId,
          status: formData.status,
          playerIds: formData.selectedPlayerIds,
        }),
      })

      if (res.ok) {
        router.push("/dashboard/teams")
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при создании команды")
      }
    } catch (error) {
      console.error("Error creating team:", error)
      alert("Ошибка при создании команды")
    } finally {
      setSubmitting(false)
    }
  }

  if (!canManage) {
    return (
      <div className="space-y-8">
        <AnimatedSection>
          <h1 className="text-4xl font-bold text-white mb-2">Создать команду</h1>
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
          <h1 className="text-4xl font-bold text-white mb-2">Создать команду</h1>
          <p className="text-muted-foreground text-lg">Загрузка...</p>
        </AnimatedSection>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Создать команду</h1>
            <p className="text-muted-foreground text-lg">
              Заполните информацию о новой команде
            </p>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <Card className="bg-card/80 backdrop-blur-sm border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white">Информация о команде</CardTitle>
            <CardDescription>
              Основная информация о команде
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название команды *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-background/50"
                    placeholder="Afina CS2 Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag">Тег команды *</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                    required
                    className="bg-background/50"
                    placeholder="AFINA-CS"
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background/50"
                  rows={3}
                  placeholder="Профессиональная команда по Counter-Strike 2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="managerId">Менеджер *</Label>
                  <Select
                    value={formData.managerId}
                    onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                    required
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Выберите менеджера" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {formatUserName({
                            username: manager.username,
                            name: manager.name,
                            email: manager.email,
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="ACTIVE">Активна</SelectItem>
                      <SelectItem value="INACTIVE">Неактивна</SelectItem>
                      <SelectItem value="DISBANDED">Распущена</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Игроки команды</Label>
                <div className="border rounded-md p-4 bg-background/50 max-h-96 overflow-y-auto">
                  {players.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет доступных игроков</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-white w-12"></TableHead>
                          <TableHead className="text-white">Игрок</TableHead>
                          <TableHead className="text-white">Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {players.map((player) => (
                          <TableRow key={player.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={formData.selectedPlayerIds.includes(player.id)}
                                onChange={() => togglePlayer(player.id)}
                                className="rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell className="text-white">
                              {formatUserName({
                                username: player.username,
                                name: player.name,
                                email: player.email,
                              })}
                            </TableCell>
                            <TableCell className="text-white">{player.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Выберите игроков, которые будут в команде
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Создать команду
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}

