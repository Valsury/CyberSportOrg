# Моковые данные

## Описание

Скрипт `seed-mock-data.ts` создает тестовые данные для разработки и демонстрации:
- 8 игроков с аватарами
- 2 менеджера
- 2 команды (CS2 и Dota 2) с игроками
- 4 турнира

## Использование

### Локально

```bash
# Убедитесь, что база данных инициализирована
npm run db:push
npm run db:generate

# Создайте администратора (если еще не создан)
npm run db:seed

# Загрузите моковые данные
npm run db:seed:mock
```

### На Render (через API)

После инициализации базы данных через `/api/admin/init-db-full`, вы можете запустить скрипт локально, подключившись к удаленной базе данных:

```bash
# Установите DATABASE_URL на удаленную базу данных
export DATABASE_URL="postgresql://..."

# Запустите скрипт
npm run db:seed:mock
```

## Созданные данные

### Игроки

Все игроки имеют пароль: `player123`

1. **Алексей 'S1mple' Костилев** (s1mple@afina.org)
   - Роль: AWPer в CS2
   
2. **Дмитрий 'Dendi' Ишутин** (dendi@afina.org)
   - Роль: Mid в Dota 2

3. **Иван 'Zeus' Тесленко** (zeus@afina.org)
   - Роль: IGL в CS2

4. **Сергей 'Solo' Березин** (solo@afina.org)
   - Роль: Support в Dota 2

5. **Андрей 'B1ad3' Городенский** (b1ad3@afina.org)
   - Роль: Rifler в CS2

6. **Егор 'flamie' Васильев** (flamie@afina.org)
   - Роль: Entry Fragger в CS2

7. **Александр 's1mple' Костылев** (s1mple2@afina.org)
   - Роль: Duelist в Valorant

8. **Максим 'Perfecto' Захаров** (perfecto@afina.org)
   - Роль: Support в CS2

### Менеджеры

Все менеджеры имеют пароль: `manager123`

1. **Владимир 'Vlad' Петров** (vlad_manager@afina.org)
   - Менеджер команды CS2

2. **Ольга 'Olga' Смирнова** (olga_manager@afina.org)
   - Менеджер команды Dota 2

### Команды

1. **Afina CS2 Team** (@AFINA-CS)
   - Менеджер: Владимир Петров
   - Игроки: S1mple, Zeus, B1ad3, flamie, Perfecto

2. **Afina Dota 2 Squad** (@AFINA-DOTA)
   - Менеджер: Ольга Смирнова
   - Игроки: Dendi, Solo

### Турниры

1. **Afina Championship 2024**
   - Игра: Counter-Strike 2
   - Призовой фонд: $100,000
   - Статус: Предстоящий

2. **Dota 2 Winter Cup**
   - Игра: Dota 2
   - Призовой фонд: $50,000
   - Статус: Завершен

3. **Valorant Masters**
   - Игра: Valorant
   - Призовой фонд: $75,000
   - Статус: Завершен

4. **CS2 Pro League**
   - Игра: Counter-Strike 2
   - Призовой фонд: $150,000
   - Статус: Предстоящий

## Примечания

- Скрипт проверяет существование данных перед созданием, поэтому его можно запускать несколько раз
- Аватары генерируются через DiceBear API (случайные аватары на основе имени пользователя)
- Все пароли хешируются с помощью bcryptjs

