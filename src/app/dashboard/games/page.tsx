import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedCard } from "@/components/animated-card"
import { Gamepad2, Users, Trophy } from "lucide-react"

export default async function GamesPage() {
  const session = await getServerSession(authOptions)

  // Пока статический список игр, в будущем можно добавить в БД
  const games = [
    {
      id: "1",
      name: "Counter-Strike 2",
      description: "Тактический шутер от первого лица",
      icon: "🎯",
      color: "from-orange-500 to-red-500",
      playersPerTeam: 5,
    },
    {
      id: "2",
      name: "Dota 2",
      description: "Многопользовательская онлайн-арена",
      icon: "⚔️",
      color: "from-red-500 to-pink-500",
      playersPerTeam: 5,
    },
    {
      id: "3",
      name: "Valorant",
      description: "Тактический шутер от Riot Games",
      icon: "🔫",
      color: "from-purple-500 to-pink-500",
      playersPerTeam: 5,
    },
    {
      id: "4",
      name: "League of Legends",
      description: "MOBA от Riot Games",
      icon: "🏆",
      color: "from-blue-500 to-cyan-500",
      playersPerTeam: 5,
    },
    {
      id: "5",
      name: "Apex Legends",
      description: "Королевская битва",
      icon: "🛡️",
      color: "from-yellow-500 to-orange-500",
      playersPerTeam: 3,
    },
    {
      id: "6",
      name: "Rocket League",
      description: "Футбол на машинах",
      icon: "⚽",
      color: "from-green-500 to-emerald-500",
      playersPerTeam: 3,
    },
  ]

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <h1 className="text-4xl font-bold text-white mb-2">Игры</h1>
        <p className="text-muted-foreground text-lg">
          Управление играми организации
        </p>
      </AnimatedSection>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <AnimatedCard key={game.id} delay={index * 0.1}>
            <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all">
              <CardHeader>
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${game.color} flex items-center justify-center mb-4 text-3xl`}>
                  {game.icon}
                </div>
                <CardTitle className="text-white">{game.name}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
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
    </div>
  )
}

