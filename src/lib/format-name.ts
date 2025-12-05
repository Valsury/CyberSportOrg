/**
 * Очищает строку от дублирования - более агрессивная версия
 */
function cleanDuplicateText(text: string): string {
  if (!text) return text
  
  let cleaned = text.trim()
  
  // Убираем все @ в начале
  cleaned = cleaned.replace(/^@+/g, '')
  
  // Проверяем, не является ли строка результатом дублирования самого себя
  const halfLength = Math.floor(cleaned.length / 2)
  if (halfLength > 0) {
    const firstHalf = cleaned.substring(0, halfLength).trim()
    const secondHalf = cleaned.substring(halfLength).trim()
    
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const normalizedFirst = firstHalf.toLowerCase().replace(/['"`@\s\-_]/g, '')
      const normalizedSecond = secondHalf.toLowerCase().replace(/['"`@\s\-_]/g, '')
      if (normalizedFirst === normalizedSecond || normalizedSecond.startsWith(normalizedFirst) || normalizedFirst.startsWith(normalizedSecond)) {
        cleaned = firstHalf
      }
    }
  }
  
  // Удаляем дублирование слов и символов
  const words = cleaned.split(/[\s\-_]+/)
  const seen = new Set<string>()
  const result: string[] = []
  
  for (const word of words) {
    const normalized = word.toLowerCase().replace(/['"`@]/g, '').trim()
    if (normalized && normalized.length > 0 && !seen.has(normalized)) {
      result.push(word)
      seen.add(normalized)
    }
  }
  
  const final = result.join(' ').trim()
  return final || text.trim().replace(/^@+/g, '')
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
  if (user.username) {
    // Очищаем username от дублирования и лишних символов
    let cleaned = String(user.username).trim()
    
    // Убираем @ если он уже есть
    cleaned = cleaned.replace(/^@+/g, '')
    
    // Если пусто после очистки, используем email
    if (!cleaned) {
      return user.email
    }
    
    // Очищаем от дублирования
    cleaned = cleanDuplicateText(cleaned)
    
    // Если после очистки пусто, используем email
    if (!cleaned) {
      return user.email
    }
    
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

