# 🏃‍♂️ AI Тренер по бегу

Персональный AI-тренер, который анализирует ваши беговые тренировки из Strava и дает профессиональные рекомендации.

## Возможности

- 📊 **Анализ тренировок** - получение и анализ беговых активностей из Strava
- 💬 **Интерактивный диалог** - агент задает уточняющие вопросы о самочувствии
- 🎯 **Персональные рекомендации** - план тренировок на основе вашей статистики
- 📈 **Детальная статистика** - темп, пульс, перепад высот, сплиты
- 🔄 **Streaming ответы** - ответы в реальном времени

## Технологии

- **Next.js 15** (App Router)
- **Vercel AI SDK** - для создания агента
- **Anthropic Claude Sonnet 4** - языковая модель
- **Strava API** - интеграция с беговыми данными
- **TypeScript** + **Tailwind CSS**

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Anthropic API

Получите API ключ на [console.anthropic.com](https://console.anthropic.com/) и добавьте в `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Настройка Strava API

#### Шаг 1: Создайте приложение в Strava

1. Перейдите на [strava.com/settings/api](https://www.strava.com/settings/api)
2. Создайте новое приложение:
   - **Application Name**: Running Coach AI
   - **Category**: Training
   - **Website**: http://localhost:3000
   - **Authorization Callback Domain**: localhost

#### Шаг 2: Получите токены

После создания приложения скопируйте **Client ID** и **Client Secret**.

Для получения **Refresh Token** выполните OAuth flow:

1. Откройте в браузере (замените YOUR_CLIENT_ID):
```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000&response_type=code&scope=activity:read_all
```

2. Разрешите доступ, скопируйте `code` из URL
3. Выполните запрос (замените значения):

```bash
curl -X POST https://www.strava.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=YOUR_CODE \
  -d grant_type=authorization_code
```

4. Скопируйте `refresh_token` из ответа

#### Шаг 3: Добавьте в `.env.local`

```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REFRESH_TOKEN=your_refresh_token
```

### 4. Запуск приложения

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Как работает агент

Агент использует три инструмента для работы со Strava:

1. **getRecentActivities** - получает последние беговые тренировки
2. **getActivityDetails** - детальный анализ конкретной тренировки
3. **getAthleteStats** - общая статистика (недельный/месячный километраж)

Агент автоматически вызывает нужные инструменты на основе вашего вопроса и анализирует данные, давая профессиональные рекомендации.

## Примеры вопросов

- "Покажи мои последние 5 тренировок"
- "Проанализируй мою последнюю длительную тренировку"
- "Какая у меня общая статистика за месяц?"
- "Дай рекомендации для следующей недели"
- "Почему у меня упал темп на последней тренировке?"

## Структура проекта

```
running-coach/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # AI агент с Strava инструментами
│   ├── page.tsx               # UI чата
│   └── layout.tsx
├── .env.local                 # Конфигурация API ключей
└── package.json
```

## Развертывание на Vercel

1. Установите [Vercel CLI](https://vercel.com/docs/cli):
```bash
npm i -g vercel
```

2. Разверните проект:
```bash
vercel
```

3. Добавьте переменные окружения в Vercel Dashboard:
   - `ANTHROPIC_API_KEY`
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `STRAVA_REFRESH_TOKEN`

## Лицензия

MIT

---

Создано с помощью [Claude Code](https://claude.com/claude-code)
