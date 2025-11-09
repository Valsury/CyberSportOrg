# Исправление проблемы с npx

## Проблема
npx может не работать из-за конфликтов в PATH или неправильного порядка путей в Windows.

## Решение 1: Использование скриптов из package.json (Рекомендуется) ✅

Я добавил скрипт в `package.json` и создал обертку, которая использует правильный путь к npx:

```bash
npm run npx -- shadcn@latest add button
npm run npx -- shadcn@latest add card
npm run npx -- create-next-app@latest my-app
```

**Это решение уже работает и протестировано!**

## Решение 2: Использование скриптов-оберток

Используйте скрипты из папки `scripts/`:

### PowerShell:
```powershell
.\scripts\npx.ps1 shadcn@latest add button
```

### CMD:
```cmd
scripts\npx.bat shadcn@latest add button
```

## Решение 3: Использование локального shadcn CLI

Уже установленный shadcn CLI можно использовать через npm скрипт:

```bash
npm run shadcn add button
```

## Решение 4: Постоянное исправление PATH (для системы)

Если вы хотите исправить проблему навсегда, добавьте путь к Node.js в начало системного PATH:

1. Откройте "Системные переменные среды"
2. Найдите переменную `PATH`
3. Убедитесь, что `C:\Program Files\nodejs` находится в начале списка
4. Перезапустите терминал

## Решение 5: Использование полного пути

Вы можете использовать полный путь к npx напрямую:

```powershell
& "C:\Program Files\nodejs\npx.cmd" shadcn@latest add button
```

## Проверка работы

Проверьте, что npx работает:

```bash
npm run npx -- --version
```

Должно вывести версию npx (11.6.2).

## Рекомендация

Для этого проекта используйте:
- `npm run shadcn add [component]` - для добавления компонентов shadcn
- `npm run npx -- [command]` - для других команд npx

