import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedCard } from "@/components/animated-card"
import { Trophy, Calendar, DollarSign, Gamepad2 } from "lucide-react"
import { format } from "date-fns"

export default async function TournamentsPage() {
  const session = await getServerSession(authOptions)

  const tournaments = await prisma.tournament.findMany({
    orderBy: {
      startDate: "desc",
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-500/20 text-blue-400"
      case "ONGOING":
        return "bg-green-500/20 text-green-400"
      case "COMPLETED":
        return "bg-purple-500/20 text-purple-400"
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

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <h1 className="text-4xl font-bold text-white mb-2">Турниры</h1>
        <p className="text-muted-foreground text-lg">
          Просмотр и управление турнирами
        </p>
      </AnimatedSection>

      {tournaments.length === 0 ? (
        <AnimatedSection>
          <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Нет турниров</h3>
              <p className="text-muted-foreground">
                Турниры будут отображаться здесь
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament, index) => (
            <AnimatedCard key={tournament.id} delay={index * 0.1}>
              <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all">
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
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  )
}

