import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Shield, Trophy, Gamepad2 } from "lucide-react"
import { motion } from "framer-motion"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const cards = [
    {
      title: "Команды",
      description: "Управление командами",
      icon: Users,
      href: "/dashboard/teams",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Турниры",
      description: "Просмотр турниров",
      icon: Trophy,
      href: "/dashboard/tournaments",
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Игры",
      description: "Управление играми",
      icon: Gamepad2,
      href: "/dashboard/games",
      color: "from-green-500 to-emerald-500",
    },
  ]

  if (session?.user.role === "ADMIN") {
    cards.push({
      title: "Админ-панель",
      description: "Управление системой",
      icon: Shield,
      href: "/admin",
      color: "from-purple-500 to-pink-500",
    })
  }

  return (
    <div className="space-y-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Добро пожаловать, {session?.user.name || session?.user.email}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Панель управления киберспортивной организацией
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer bg-card/80 backdrop-blur-sm">
                <Link href={card.href}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

