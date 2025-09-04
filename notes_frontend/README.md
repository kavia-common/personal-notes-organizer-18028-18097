# Notes Frontend (Remix)

A modern, minimalistic notes app UI built with Remix + Tailwind.

Features:
- User authentication (login/register/logout)
- Create, edit, delete notes
- Search and filter by tag
- Responsive layout with fixed sidebar, top app bar
- Light/Dark theme toggle (persisted in cookie)
- Uses REST API to communicate with notes backend

## Prerequisites
- Node.js >= 20
- A running backend API. Provide its base URL through environment variable.

## Setup

1. Copy environment example and set values:
```bash
cp .env.example .env
# edit .env and set NOTES_API_URL to your backend
```

2. Install dependencies:
```bash
npm install
```

3. Run dev server:
```bash
npm run dev
```

4. Build and run production:
```bash
npm run build
npm start
```

## Environment

- NOTES_API_URL: Base URL of the notes backend (e.g. http://localhost:4000)

## Styling and Theme

Tailwind is preconfigured. Primary colors:
- primary: #4F8EF7
- secondary: #F5F6FA
- accent: #FFB347

Theme can be switched with the sun/moon icon in the top app bar.
