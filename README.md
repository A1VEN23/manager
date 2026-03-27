# Instagram AI Manager

Бессерверное приложение для Vercel, которое автоматически отвечает на сообщения в Instagram Direct с помощью AI (Google Gemini).

## Архитектура

```
├── api/
│   └── webhook.js          # Главный эндпоинт для обработки вебхуков Meta
├── services/
│   ├── memory.js           # Работа с Redis (хранение истории диалогов)
│   ├── ai.js              # Интеграция с Google Gemini
│   └── instagram.js       # Отправка сообщений через Meta Graph API
├── package.json
├── .env.example
└── README.md
```

## Возможности

- ✅ Автоматические ответы на сообщения в Instagram Direct
- ✅ Сохранение истории диалогов (24 часа)
- ✅ Контекстные ответы с учетом предыдущих сообщений
- ✅ Обработка ошибок и защита от падения бота
- ✅ Вебхук верификация для Meta
- ✅ Модульная архитектура для легкой кастомизации

## Требования

- Node.js 18+
- Аккаунт Vercel
- Meta Developer Account
- Google AI Studio API Key
- Upstash Redis Database

## Установка

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd instagram-ai-manager
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env.local` и заполните значения:

```bash
cp .env.example .env.local
```

#### Обязательные переменные:

- `VERCEL_URL` - URL вашего Vercel приложения
- `UPSTASH_REDIS_REST_URL` - URL Upstash Redis базы
- `UPSTASH_REDIS_REST_TOKEN` - Токен Upstash Redis
- `GEMINI_API_KEY` - API ключ Google AI Studio
- `META_ACCESS_TOKEN` - Access токен Meta для Instagram
- `META_VERIFY_TOKEN` - Произвольный токен для верификации вебхука

#### Опциональные:

- `SYSTEM_PROMPT` - Системный промпт для AI (по умолчанию: базовый ассистент)

### 3. Настройка Meta Developer

1. Создайте приложение в [Meta Developers](https://developers.facebook.com/)
2. Добавьте продукт "Messenger"
3. Настройте Webhook:
   - Callback URL: `https://your-vercel-app.vercel.app/api/webhook`
   - Verify Token: тот же, что в `META_VERIFY_TOKEN`
4. Подпишитесь на события:
   - `messages`
   - `messaging_postbacks`
5. Получите Access Token с правами `pages_messaging`, `instagram_basic`

### 4. Настройка Upstash Redis

1. Создайте бесплатную базу данных в [Upstash](https://upstash.com/)
2. Скопируйте REST URL и токен в `.env.local`

### 5. Настройка Google AI Studio

1. Перейдите в [Google AI Studio](https://aistudio.google.com/)
2. Создайте API ключ для Gemini
3. Добавьте ключ в `GEMINI_API_KEY`

## Развертывание

### Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Через Vercel Dashboard

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в настройках проекта
3. Разверните проект

## Тестирование

### Локальная разработка

```bash
npm run dev
```

### Тестирование вебхука

Для проверки вебхука используйте ngrok или похожий сервис:

```bash
ngrok http 3000
```

И обновите Callback URL в настройках Meta Developer.

## Структура кода

### api/webhook.js
- Обрабатывает GET запросы для верификации вебхука
- Принимает POST запросы с сообщениями от Instagram
- Координирует работу всех сервисов

### services/memory.js
- `getHistory(userId)` - получает историю диалога
- `addMessage(userId, role, text)` - добавляет сообщение
- Автоматически очищает старые сообщения (TTL 24 часа)

### services/ai.js
- `generateResponse(systemPrompt, history, userMessage)` - генерирует ответ
- Использует Gemini 1.5 Flash для быстрых ответов
- Обрабатывает ошибки и возвращает запасные ответы

### services/instagram.js
- `sendMessage(recipientId, messageText)` - отправляет текстовое сообщение
- Поддерживает быстрые ответы и вложения
- Проверяет валидность access token

## Кастомизация

### Изменение AI модели

В `services/ai.js` измените модель:

```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

### Настройка истории диалогов

В `services/memory.js` измените лимит сообщений:

```javascript
await redis.ltrim(key, 0, 19); // 20 сообщений вместо 15
```

### Добавление новых типов сообщений

Расширьте `api/webhook.js` для обработки других типов сообщений:

```javascript
if (messaging.message.attachments) {
  // Обработка вложений
}
```

## Безопасность

- Все API ключи хранятся в переменных окружения
- Вебхук верифицируется перед обработкой
- Ошибки не раскрывают чувствительную информацию
- История диалогов автоматически удаляется через 24 часа

## Поддержка

При возникновении проблем:

1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Проверьте валидность Meta Access Token
4. Убедитесь, что вебхук правильно настроен в Meta Developer

## Лицензия

MIT License
