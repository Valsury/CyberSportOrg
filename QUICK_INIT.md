# Быстрая инициализация базы данных

## Проблема
Таблицы не созданы в базе данных, нужно их создать через API endpoint.

## Быстрое решение

### Шаг 1: Получите секретный ключ

1. Зайдите на https://render.com
2. Откройте ваш **Web Service**
3. Перейдите в **"Environment"**
4. Найдите `INIT_DB_SECRET` и скопируйте значение

### Шаг 2: Вызовите endpoint

Откройте в браузере или используйте curl:

```
https://your-app-name.onrender.com/api/admin/init-db-full
```

**Но это не сработает напрямую** - нужен заголовок Authorization.

### Шаг 3: Используйте онлайн инструмент

1. Откройте https://reqbin.com
2. Выберите **POST**
3. URL: `https://your-app-name.onrender.com/api/admin/init-db-full`
4. В разделе **Headers** добавьте:
   - **Name**: `Authorization`
   - **Value**: `Bearer YOUR_INIT_DB_SECRET`
5. Нажмите **Send**

### Или через curl (если есть доступ к терминалу):

```bash
curl -X POST https://your-app-name.onrender.com/api/admin/init-db-full \
  -H "Authorization: Bearer YOUR_INIT_DB_SECRET"
```

## После вызова

Вы должны получить ответ:
```json
{
  "success": true,
  "message": "Database fully initialized",
  "results": [...]
}
```

Затем обновите страницу приложения и попробуйте войти!

