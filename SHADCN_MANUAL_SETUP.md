# Руководство по установке компонентов shadcn/ui без npx

## Способ 1: Использование локального shadcn CLI

Теперь вы можете использовать shadcn через npm скрипт:

```bash
npm run shadcn add button
npm run shadcn add card
npm run shadcn add input
```

## Способ 2: Установка компонентов вручную

Если вы хотите установить компоненты вручную, выполните следующие шаги:

### 1. Найдите нужный компонент на GitHub

Перейдите на https://github.com/shadcn-ui/ui/tree/main/apps/www/registry/default/ui

### 2. Скопируйте код компонента

Например, для Button:
- Откройте файл компонента (например, `button.tsx`)
- Скопируйте код
- Создайте файл в `src/components/ui/button.tsx`

### 3. Установите необходимые зависимости

Каждый компонент может требовать дополнительные зависимости. Проверьте файл компонента на импорты из `@radix-ui/*` или других пакетов.

Например, для Button нужен:
```bash
npm install @radix-ui/react-slot
```

### 4. Используйте компонент

```tsx
import { Button } from "@/components/ui/button"

export default function MyComponent() {
  return <Button>Кнопка</Button>
}
```

## Уже установленные компоненты

- ✅ Button (`src/components/ui/button.tsx`)
  - Зависимости: `@radix-ui/react-slot`

## Популярные компоненты и их зависимости

- **Button**: `@radix-ui/react-slot`
- **Card**: не требует дополнительных зависимостей
- **Input**: не требует дополнительных зависимостей
- **Dialog**: `@radix-ui/react-dialog`
- **Dropdown Menu**: `@radix-ui/react-dropdown-menu`
- **Select**: `@radix-ui/react-select`
- **Toast**: `@radix-ui/react-toast`

## Полезные ссылки

- [Документация shadcn/ui](https://ui.shadcn.com)
- [GitHub репозиторий](https://github.com/shadcn-ui/ui)
- [Компоненты в реестре](https://ui.shadcn.com/docs/components)

