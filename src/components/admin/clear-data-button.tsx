"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ClearDataButton() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [results, setResults] = useState<string[]>([])

  const handleClearData = async () => {
    setIsClearing(true)
    setResults([])

    try {
      const res = await fetch("/api/admin/clear-data", {
        method: "POST",
      })

      const data = await res.json()

      if (res.ok) {
        setResults(data.results || [])
        setTimeout(() => {
          setIsDialogOpen(false)
          router.refresh()
          window.location.reload()
        }, 2000)
      } else {
        setResults([`Ошибка: ${data.error || "Неизвестная ошибка"}`])
      }
    } catch (error) {
      console.error("Error clearing data:", error)
      setResults([`Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`])
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsDialogOpen(true)}
        className="w-full sm:w-auto"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Очистить все данные
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Очистить все данные?</DialogTitle>
            <DialogDescription>
              Это действие удалит все данные из базы данных:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Всех пользователей (кроме текущего администратора)</li>
                <li>Все команды</li>
                <li>Всех участников команд</li>
                <li>Все турниры</li>
                <li>Все игры</li>
              </ul>
              <span className="block mt-4 text-destructive font-semibold">
                Это действие нельзя отменить!
              </span>
            </DialogDescription>
          </DialogHeader>
          {results.length > 0 && (
            <div className="max-h-60 overflow-y-auto bg-muted/50 p-4 rounded-md">
              <div className="space-y-1 text-sm">
                {results.map((result, index) => (
                  <div key={index} className="text-foreground">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setResults([])
              }}
              disabled={isClearing}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleClearData} disabled={isClearing}>
              {isClearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Очистка...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Да, удалить все
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

