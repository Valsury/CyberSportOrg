# Быстрый старт

## Шаг 1: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cybersportorg?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Admin User (for initial setup)
ADMIN_EMAIL="admin@cybersport.org"
ADMIN_PASSWORD="admin123"
```

### Генерация NEXTAUTH_SECRET

Выполните команду:
```bash
openssl rand -base64 32
```

Или используйте онлайн генератор: https://generate-secret.vercel.app/32

## Шаг 2: Настройка базы данных

### Вариант 1: Локальная PostgreSQL

1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE cybersportorg;
```
3. Обновите DATABASE_URL в .env файле

### Вариант 2: Использование Render PostgreSQL (для деплоя)

1. Создайте PostgreSQL базу данных на Render
2. Используйте Internal Database URL в DATABASE_URL

## Шаг 3: Инициализация базы данных

```bash
# Применить схему базы данных
npm run db:push

# Сгенерировать Prisma Client
npm run db:generate

# Создать администратора
npm run db:seed
```

## Шаг 4: Запуск приложения

```bash
npm run dev
```

Откройте http://localhost:3000 в браузере.

## Шаг 5: Вход в систему

Используйте учетные данные администратора:
- Email: тот, который вы указали в `ADMIN_EMAIL` (по умолчанию: admin@cybersport.org)
- Пароль: тот, который вы указали в `ADMIN_PASSWORD` (по умолчанию: admin123)

## Что дальше?

1. Войдите в систему как администратор
2. Перейдите в админ-панель (кнопка в навбаре)
3. Создайте новых пользователей с разными ролями
4. Изучите функционал приложения

## Решение проблем

### Ошибка подключения к базе данных

- Убедитесь, что PostgreSQL запущен
- Проверьте правильность DATABASE_URL
- Убедитесь, что база данных создана

### Ошибка "Missing required environment variable: DATABASE_URL"

- Создайте файл `.env` в корне проекта
- Добавьте переменную DATABASE_URL
- Перезапустите dev сервер

### Ошибка при создании администратора

- Убедитесь, что база данных инициализирована (npm run db:push)
- Проверьте, что Prisma Client сгенерирован (npm run db:generate)
- Проверьте логи в консоли

## Деплой на Render

Подробные инструкции по деплою см. в файле `DEPLOY.md`.

