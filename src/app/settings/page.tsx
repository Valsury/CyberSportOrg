"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AnimatedSection } from "@/components/animated-section"
import { Camera, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.avatar || null)

  if (!session) {
    return null
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

    setUploading(true)

    try {
      // Конвертируем файл в base64 или используем URL
      // Для простоты используем base64, но в продакшене лучше использовать внешний сервис (Cloudinary, AWS S3 и т.д.)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        // Отправляем на сервер
        const res = await fetch(`/api/users/${session.user.id}/avatar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar: base64String }),
        })

        if (res.ok) {
          const data = await res.json()
          setAvatarUrl(data.avatar)
          await update() // Обновляем сессию
          router.refresh()
        } else {
          const error = await res.json()
          alert(error.error || "Ошибка при загрузке фото")
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Ошибка при загрузке фото")
      setUploading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!confirm("Удалить фото профиля?")) return

    try {
      const res = await fetch(`/api/users/${session.user.id}/avatar`, {
        method: "DELETE",
      })

      if (res.ok) {
        setAvatarUrl(null)
        await update()
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || "Ошибка при удалении фото")
      }
    } catch (error) {
      console.error("Error deleting avatar:", error)
      alert("Ошибка при удалении фото")
    }
  }

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <h1 className="text-4xl font-bold text-white mb-2">Настройки</h1>
        <p className="text-muted-foreground text-lg">
          Управление вашей учетной записью
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Профиль</CardTitle>
            <CardDescription>Информация о вашей учетной записи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="space-y-4">
              <Label className="text-white">Фото профиля</Label>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <div className="relative">
                    <Image
                      src={avatarUrl}
                      alt={session.user.name || "Avatar"}
                      width={100}
                      height={100}
                      className="rounded-full object-cover border-2 border-purple-500/50"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                    {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        {avatarUrl ? "Изменить фото" : "Загрузить фото"}
                      </>
                    )}
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      disabled={uploading}
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
              <p className="text-xs text-muted-foreground">
                Рекомендуемый размер: 200x200px. Максимальный размер файла: 5MB
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input
                value={session.user.email}
                disabled
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Email нельзя изменить
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Имя</Label>
              <Input
                value={session.user.name || ""}
                disabled
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Имя можно изменить только через администратора
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Роль</Label>
              <Input
                value={
                  session.user.role === "ADMIN" ? "Администратор" :
                  session.user.role === "MANAGER" ? "Менеджер" : "Игрок"
                }
                disabled
                className="bg-background/50"
              />
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
