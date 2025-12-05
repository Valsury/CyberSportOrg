/**
 * Очищает строку от дублирования
 */
function cleanDuplicateText(text: string): string {
  if (!text) return text
  
  let cleaned = text.trim()
  
  // Проверяем, не является ли строка результатом дублирования самого себя
  const halfLength = Math.floor(cleaned.length / 2)
  const firstHalf = cleaned.substring(0, halfLength).trim()
  const secondHalf = cleaned.substring(halfLength).trim()
  
  if (firstHalf.length > 0 && secondHalf.length > 0) {
    const normalizedFirst = firstHalf.toLowerCase().replace(/['"`@\s]/g, '')
    const normalizedSecond = secondHalf.toLowerCase().replace(/['"`@\s]/g, '')
    if (normalizedFirst === normalizedSecond || normalizedSecond.startsWith(normalizedFirst)) {
      cleaned = firstHalf
    }
  }
  
  // Удаляем дублирование слов
  const words = cleaned.split(/\s+/)
  const seen = new Set<string>()
  const result: string[] = []
  
  for (const word of words) {
    const normalized = word.toLowerCase().replace(/['"`@]/g, '').trim()
    if (normalized && !seen.has(normalized)) {
      result.push(word)
      seen.add(normalized)
    }
  }
  
  return result.join(' ').trim() || text.trim()
}

/**
 * Универсальная функция для форматирования имени пользователя
 * Всегда возвращает только один вариант: @username или email
 * НЕ показывает name, чтобы избежать дублирования
 */
export function formatUserName(user: {
  username?: string | null
  name?: string | null
  email: string
}): string {
  // Показываем ТОЛЬКО username (если есть) или email
  // Никогда не показываем name, чтобы избежать дублирования
  if (user.username && user.username.trim()) {
    // Очищаем username от дублирования и лишних символов
    let cleaned = user.username.trim()
    // Убираем @ если он уже есть
    cleaned = cleaned.replace(/^@+/g, '')
    // Очищаем от дублирования
    cleaned = cleanDuplicateText(cleaned)
    return `@${cleaned}`
  }
  
  // Если username нет - показываем только email
  return user.email
}

/**
 * Получить первую букву для аватара
 */
export function getUserInitial(user: {
  username?: string | null
  name?: string | null
  email: string
}): string {
  if (user.username) {
    return user.username[0].toUpperCase()
  }
  if (user.name) {
    return user.name[0].toUpperCase()
  }
  return user.email[0].toUpperCase()
}

