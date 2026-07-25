# How to Run Frontend + Backend

Project path:

`C:\Users\Administrator\Documents\DATABASE PROJECT\Gaming Tournament Management System`

## 1. Backend (Node.js + MySQL)

```bash
cd backend
npm install
```

- Import `backend/schema.sql` in MySQL (phpMyAdmin or CLI).
- Check `backend/.env` (host, user, password, database name `tekken`).

```bash
node index.js
```

Server: **http://localhost:5001**

## 2. Frontend (React + Vite)

```bash
npm install
npm run dev
```

Open: **http://localhost:5173**

## 3. Login wallpaper

Your image is here:

`public/tekken-bg.png`

To replace it: overwrite that file with your wallpaper (keep the name `tekken-bg.png` or update `TekkenWallpaperBackground` in `src/app/App.tsx`).

## 4. Default logins

Check `backend/schema.sql` for seeded `users` table (admin / user emails and passwords).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Black login screen | Ensure `public/tekken-bg.png` exists; hard refresh (Ctrl+F5) |
| API errors | Start backend on port 5001; MySQL must be running |
| CORS errors | Backend already uses `cors()` — keep API_URL as `http://localhost:5001/api` |
