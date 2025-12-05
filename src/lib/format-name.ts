/**
 * Очищает строку от дублирования
 */
function cleanDuplicateText(text: string): string {
  if (!text) return text
  
  // Удаляем дублирование слов
  const words = text.trim().split(/\s+/)
  const seen = new Set<string>()
  const cleaned: string[] = []
  
  for (const word of words) {
    const normalized = word.toLowerCase().replace(/['"`@]/g, '').trim()
    if (normalized && !seen.has(normalized)) {
      cleaned.push(word)
      seen.add(normalized)
    }
  }
  
  return cleaned.join(' ').trim()
}

/**
 * Универсальная функция для форматирования имени пользователя
 * Всегда возвращает только один вариант: @username, name или email
 * Очищает от дублирования
 */
export function formatUserName(user: {
  username?: string | null
  name?: string | null
  email: string
}): string {
  // Приоритет: username > name > email
  if (user.username) {
    // Очищаем username от дублирования
    const cleanedUsername = cleanDuplicateText(user.username)
    return `@${cleanedUsername}`
  }
  if (user.name) {
    // Очищаем name от дублирования и проверяем, не содержит ли он username
    let cleanedName = cleanDuplicateText(user.name)
    
    // Если в name есть username, удаляем его
    if (user.username) {
      const usernameLower = user.username.toLowerCase()
      const nameWords = cleanedName.split(/\s+/)
      cleanedName = nameWords
        .filter(word => {
          const wordLower = word.toLowerCase().replace(/['"`@]/g, '')
          return wordLower !== usernameLower && !wordLower.includes(usernameLower) && !usernameLower.includes(wordLower)
        })
        .join(' ')
        .trim()
    }
    
    return cleanedName || user.email
  }
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

