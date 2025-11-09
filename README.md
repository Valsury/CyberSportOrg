# CyberSportOrg

Веб-приложение для управления киберспортивной организацией с поддержкой ролей (администратор, менеджер, игрок), управлением командами и турнирами.

## Технологии

- **Next.js 16** - React фреймворк с App Router
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **shadcn/ui** - UI компоненты
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - база данных
- **NextAuth.js** - аутентификация
- **Framer Motion** - анимации

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd CyberSportOrg
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
cp .env.example .env
```

Отредактируйте `.env` файл и укажите:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `NEXTAUTH_URL` - URL вашего приложения
- `NEXTAUTH_SECRET` - секретный ключ (можно сгенерировать командой: `openssl rand -base64 32`)
- `ADMIN_EMAIL` - email администратора (по умолчанию: admin@cybersport.org)
- `ADMIN_PASSWORD` - пароль администратора (по умолчанию: admin123)

4. Настройте базу данных:
```bash
# Применить миграции
npm run db:push

# Сгенерировать Prisma Client
npm run db:generate

# Создать администратора
npm run db:seed
```

5. Запустите dev сервер:
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Деплой на Render

### Подготовка

1. Создайте PostgreSQL базу данных на Render
2. Скопируйте внутренний URL базы данных
3. Создайте новый Web Service на Render
4. Подключите ваш репозиторий

### Настройка переменных окружения на Render

Добавьте следующие переменные окружения:

- `DATABASE_URL` - внутренний URL PostgreSQL базы данных от Render
- `NEXTAUTH_URL` - URL вашего приложения на Render (например: https://cybersportorg.onrender.com)
- `NEXTAUTH_SECRET` - сгенерируйте случайную строку
- `ADMIN_EMAIL` - email администратора
- `ADMIN_PASSWORD` - пароль администратора

### Деплой

Render автоматически:
1. Установит зависимости (`npm install`)
2. Сгенерирует Prisma Client (`prisma generate`)
3. Соберет приложение (`npm run build`)
4. Запустит приложение (`npm start`)

После первого деплоя выполните миграции базы данных:
```bash
# Подключитесь к вашему сервису через SSH или используйте Render Shell
npm run db:push
npm run db:seed
```

## Структура проекта

```
├── src/
│   ├── app/              # App Router страницы
│   │   ├── admin/        # Админ-панель
│   │   ├── api/          # API роуты
│   │   ├── auth/         # Страницы аутентификации
│   │   └── dashboard/    # Дашборд
│   ├── components/       # React компоненты
│   │   ├── admin/        # Компоненты админ-панели
│   │   ├── ui/           # UI компоненты shadcn
│   │   └── providers/    # Провайдеры
│   ├── lib/              # Утилиты
│   └── scripts/          # Скрипты инициализации
├── prisma/               # Prisma схема
└── public/               # Статические файлы
```

## Функциональность

### Роли пользователей

- **Администратор (ADMIN)** - полный доступ ко всему функционалу, управление пользователями
- **Менеджер (MANAGER)** - управление командами и турнирами
- **Игрок (PLAYER)** - просмотр информации о командах и турнирах

### Админ-панель

- Создание, редактирование и удаление пользователей
- Изменение ролей пользователей
- Просмотр статистики пользователей

## Скрипты

- `npm run dev` - запуск dev сервера
- `npm run build` - сборка проекта
- `npm run start` - запуск production сервера
- `npm run lint` - проверка кода линтером
- `npm run db:push` - применить изменения схемы к БД
- `npm run db:migrate` - создать миграцию
- `npm run db:generate` - сгенерировать Prisma Client
- `npm run db:seed` - создать администратора
- `npm run shadcn` - использование shadcn CLI
- `npm run npx -- [command]` - использование npx

## Лицензия

MIT
