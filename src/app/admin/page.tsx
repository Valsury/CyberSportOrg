import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import UsersTable from "@/components/admin/users-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedCard } from "@/components/animated-card"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          teamMembers: true,
        },
      },
    },
  })

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    managers: users.filter((u) => u.role === "MANAGER").length,
    players: users.filter((u) => u.role === "PLAYER").length,
  }

  return (
    <div className="space-y-8 min-h-screen">
      <AnimatedSection>
        <h1 className="text-4xl font-bold text-white mb-2">Админ-панель</h1>
        <p className="text-muted-foreground text-lg">
          Управление пользователями и системой
        </p>
      </AnimatedSection>

      <div className="grid gap-4 md:grid-cols-4">
        <AnimatedCard delay={0.1} scale>
          <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
            <CardHeader className="pb-2">
              <CardDescription>Всего пользователей</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
        </AnimatedCard>
        <AnimatedCard delay={0.2} scale>
          <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
            <CardHeader className="pb-2">
              <CardDescription>Администраторы</CardDescription>
              <CardTitle className="text-3xl text-purple-400">{stats.admins}</CardTitle>
            </CardHeader>
          </Card>
        </AnimatedCard>
        <AnimatedCard delay={0.3} scale>
          <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
            <CardHeader className="pb-2">
              <CardDescription>Менеджеры</CardDescription>
              <CardTitle className="text-3xl text-blue-400">{stats.managers}</CardTitle>
            </CardHeader>
          </Card>
        </AnimatedCard>
        <AnimatedCard delay={0.4} scale>
          <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
            <CardHeader className="pb-2">
              <CardDescription>Игроки</CardDescription>
              <CardTitle className="text-3xl text-green-400">{stats.players}</CardTitle>
            </CardHeader>
          </Card>
        </AnimatedCard>
      </div>

      <AnimatedSection delay={0.5}>
        <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Управление пользователями</CardTitle>
            <CardDescription>
              Создавайте, редактируйте и удаляйте учетные записи пользователей
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable users={users} />
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}

