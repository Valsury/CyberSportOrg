import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { AnimatedCard } from "@/components/animated-card"
import { Users, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default async function TeamsPage() {
  const session = await getServerSession(authOptions)

  const teams = await prisma.team.findMany({
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              username: true,
              role: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Команды</h1>
            <p className="text-muted-foreground text-lg">
              Управление командами организации
            </p>
          </div>
          {(session?.user.role === "ADMIN" || session?.user.role === "MANAGER") && (
            <Button asChild>
              <Link href="/dashboard/teams/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Создать команду
              </Link>
            </Button>
          )}
        </div>
      </AnimatedSection>

      {teams.length === 0 ? (
        <AnimatedSection>
          <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Нет команд</h3>
              <p className="text-muted-foreground">
                Создайте первую команду для начала работы
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team, index) => (
            <AnimatedCard key={team.id} delay={index * 0.1}>
              <Card className="bg-card/80 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center`}>
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      team.status === "ACTIVE" ? "bg-green-500/20 text-green-400" :
                      team.status === "INACTIVE" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {team.status === "ACTIVE" ? "Активна" :
                       team.status === "INACTIVE" ? "Неактивна" : "Распущена"}
                    </span>
                  </div>
                  <CardTitle className="text-white">{team.name}</CardTitle>
                  <CardDescription>@{team.tag}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {team.description && (
                    <p className="text-sm text-muted-foreground">{team.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Менеджер:</span>
                      <div className="flex items-center gap-2">
                        {team.manager.avatar && (
                          <Image
                            src={team.manager.avatar}
                            alt={team.manager.name || ""}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        )}
                        <span className="text-white">{team.manager.name || team.manager.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Участников:</span>
                      <span className="text-white">{team.members.length}</span>
                    </div>
                  </div>
                  
                  {team.members.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Игроки:</p>
                      <div className="space-y-2">
                        {team.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 text-sm">
                            {member.user.avatar ? (
                              <Image
                                src={member.user.avatar}
                                alt={member.user.name || ""}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                {(member.user.name || member.user.email || "U")[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-white">{member.user.name || member.user.username || member.user.email}</p>
                              {member.role && (
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  )
}
