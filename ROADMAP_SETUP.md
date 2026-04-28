# Roadmap Feature Setup

## 1. Stop the dev server, then run:
npx prisma generate
npx prisma db push

## 2. Add your OpenAI key to .env:
OPENAI_API_KEY=sk-...

## 3. Restart dev server:
npm run dev

## Done! Visit /roadmap in the app.
