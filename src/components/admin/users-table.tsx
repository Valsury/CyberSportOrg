"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Role } from "@/generated/prisma/enums"
import { Pencil, Trash2, Plus, UserPlus } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string | null
  username: string | null
  role: Role
  createdAt: Date
  _count: {
    teamMembers: number
  }
}

interface UsersTableProps {
  users: User[]
}

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    username: "",
    password: "",
    role: "PLAYER" as Role,
  })

  const handleCreate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newUser = await response.json()
        setUsers([...users, { ...newUser, _count: { teamMembers: 0 } }])
        setIsCreateOpen(false)
        setFormData({
          email: "",
          name: "",
          username: "",
          password: "",
          role: "PLAYER",
        })
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Ошибка при создании пользователя")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Ошибка при создании пользователя")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name || "",
      username: user.username || "",
      password: "",
      role: user.role,
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingUser) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(
          users.map((u) =>
            u.id === editingUser.id
              ? { ...updatedUser, _count: u._count }
              : u
          )
        )
        setIsEditOpen(false)
        setEditingUser(null)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Ошибка при обновлении пользователя")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Ошибка при обновлении пользователя")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId))
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Ошибка при удалении пользователя")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Ошибка при удалении пользователя")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <UserPlus className="mr-2 h-4 w-4" />
              Создать пользователя
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-white">Создать пользователя</DialogTitle>
              <DialogDescription>
                Заполните форму для создания нового пользователя
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as Role })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                >
                  <option value="PLAYER">Игрок</option>
                  <option value="MANAGER">Менеджер</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>
              <Button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {loading ? "Создание..." : "Создать"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-purple-500/20">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Имя</TableHead>
              <TableHead className="text-white">Username</TableHead>
              <TableHead className="text-white">Роль</TableHead>
              <TableHead className="text-white">Команд</TableHead>
              <TableHead className="text-white">Дата создания</TableHead>
              <TableHead className="text-right text-white">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
              >
                <TableCell className="text-white">{user.email}</TableCell>
                <TableCell className="text-white">{user.name || "-"}</TableCell>
                <TableCell className="text-white">{user.username || "-"}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === "ADMIN"
                        ? "bg-purple-500/20 text-purple-300"
                        : user.role === "MANAGER"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {user.role === "ADMIN"
                      ? "Админ"
                      : user.role === "MANAGER"
                      ? "Менеджер"
                      : "Игрок"}
                  </span>
                </TableCell>
                <TableCell className="text-white">{user._count.teamMembers}</TableCell>
                <TableCell className="text-white">
                  {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Измените информацию о пользователе
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Имя</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Новый пароль (оставьте пустым, чтобы не менять)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Роль</Label>
              <select
                id="edit-role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as Role })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
              >
                <option value="PLAYER">Игрок</option>
                <option value="MANAGER">Менеджер</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>
            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

