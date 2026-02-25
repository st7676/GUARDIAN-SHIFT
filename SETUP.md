# Guardian Shift - הוראות התקנה

## 📋 דרישות קדם

- **Node.js** גרסה 18 ומעלה
- **npm** או **yarn**
- **Git**

## 🚀 התקנת הפרויקט

### 1. Clone את הפרויקט
```bash
git clone <repository-url>
cd guardian-shift
```

### 2. התקנת Dependencies
```bash
npm install
```

### 3. (אופציונלי) יצירת קובץ `.env.local`
אם יש backend משלך בעתיד:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**כרגע:** הפרויקט עובד עם mock data המאוחסן ב-localStorage של הדפדפן. אין צורך בקובץ env.

### 4. הרצת השרוור
```bash
npm run dev
```

השרוור יפעל על: **http://localhost:5173**

---

## 📦 מה עשינו שונה מ-Base44

### ✅ הוסרו:
- `@base44/sdk` - SDK של Base44
- `@base44/vite-plugin` - Plugin של Base44

### ✅ הוספנו:
- `axios` - לקריאות API בעתיד
- Mock Database ב-localStorage
- Routing מלא עם React Router
- Tailwind CSS styling

---

## 🎯 אופן פעולה

### הנתונים נשמרים ב-localStorage (בדפדפן)
- כל הנתונים (אחיות, זמן משמרות, הגדרות) נשמרים במקומית
- הם יַנִּצָּלוּ עם סגירת הדפדפן

### קישור ב-future ל-Backend
כשיהיה backend אמיתי, צריך להחליף את `src/api/base44Client.js` בקריאות axios ל-API.

---

## 📝 פקודות מהירות

```bash
# פיתוח
npm run dev

# בניית production
npm run build

# בדיקת שגיאות קוד
npm run lint

# תיקון שגיאות אוטומטית
npm run lint:fix

# בדיקת TypeScript
npm run typecheck

# תצוגה מקדימה של build
npm run preview
```

---

## 🗂️ מבנה הפרויקט

```
src/
├── api/
│   └── base44Client.js      # Mock API client עם localStorage
├── components/
│   ├── scheduling/          # רכיבים של לוח הזמנים
│   └── ui/                  # UI components (Radix UI)
├── pages/                   # דפים (Dashboard, Nurses וכו')
├── lib/                     # Utility functions
├── hooks/                   # React hooks
├── App.jsx                  # Root component עם routing
└── index.css               # Tailwind CSS
```

---

## ⚙️ Tailwind CSS

הפרויקט משתמש ב-**Tailwind CSS** לעיצוב.
כל ה-styling נעשה בעזרת class names (`className="px-4 py-2 rounded..."`).

---

## 🐛 Troubleshooting

### "Port 5173 already in use"
```bash
# Kill the process on port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9

# או ב-Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### "Module not found: @/something"
✅ ה-@/ alias כבר קonfigured ב-vite.config.js ו-jsconfig.json

### Mock data לא נשמר
בדוק את ה-localStorage של הדפדפן (DevTools > Application > Local Storage)

---

## 📞 עזרה

- **הגדרות:** `src/lib/app-params.js`
- **Mock Data:** `src/api/base44Client.js`
- **Routing:** `src/App.jsx` ו-`src/Layout.jsx`

---

**עדכון אחרון:** 25.02.2026
**מצב:** ✅ עובד עם mock data, מוכן ל-backend
