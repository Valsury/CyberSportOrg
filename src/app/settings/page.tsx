import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Настройки</h1>
        <p className="text-muted-foreground text-lg">
          Управление вашей учетной записью
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Профиль</CardTitle>
            <CardDescription>Информация о вашей учетной записи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-white">{session.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Имя</label>
              <p className="text-white">{session.user.name || "Не указано"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Роль</label>
              <p className="text-white capitalize">
                {session.user.role === "ADMIN" ? "Администратор" : 
                 session.user.role === "MANAGER" ? "Менеджер" : "Игрок"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

