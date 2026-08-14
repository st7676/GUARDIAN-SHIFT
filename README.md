# Guardian Shift - מערכת ניהול משמרות לאחיות

**אפליקציה מודרנית לניהול לוחות זמנים וזיהוי משמרות לסגל סיעודי.**

## ✨ תכונות

- 👥 ניהול אחיות וזיהוי משמרות
- 📅 לוח זמנים גמיש וטלאי
- 🔄 הזמנת משמרות
- 📊 דוחות וסטטיסטיקות
- 🌙 עזרה למטפלות במציאת משמרות חופשיות

## 🚀 התחלה מהירה

```bash
# 1. התקנת dependencies
npm install

# 2. הרצת שרוור פיתוח
npm run dev

# 3. פתח בדפדפן
http://localhost:5173
```

## 📖 הוראות מלאות

👉 ראה את קובץ [SETUP.md](SETUP.md) לפרטים מלאים על התקנה ועיצוב

## 🛠️ טכנולוגיות

- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **Radix UI** - UI Components

## 📂 ארכיטקטורה

### מבנה הפרויקט

```
src/
├── api/              # API Client (mock data currently)
├── components/       # React Components
│   ├── scheduling/   # Scheduling components
│   ├── ui/          # UI library components
│   └── loaders/     # Loading skeletons
├── hooks/           # Custom React hooks
├── lib/             # Utilities & helpers
│   ├── ErrorBoundary.jsx
│   ├── AuthProvider.jsx
│   └── api-config.js
├── pages/           # Page components
├── utils/           # Utility functions
└── App.jsx          # Main app component
```

## 🔗 Backend Integration

### מצב נוכחי
- ✅ Mock data ב-localStorage
- ✅ מבנה API מוכן להתחברות ל-backend

### איך לעבור ל-Real API

1. **בחר ספרייה HTTP** (axios מומלץ):
```bash
npm install axios
```

2. **עדכן את `src/api/Client.js`:**
   - החלף את MockDatabase בקריאות axios
   - בנה request interceptor לאישור (token)
   - קרא להערות בקובץ להנחיות מלאות

3. **הגדר environment variables:**
```bash
cp .env.example .env
# עדכן את VITE_API_BASE_URL להצביע לה-backend שלך
```

4. **משפחת API Endpoints:**
```
POST   /auth/login
POST   /auth/logout
GET    /auth/me
GET    /nurses
POST   /nurses
PUT    /nurses/:id
GET    /departments
GET    /schedules
POST   /schedules
GET    /assignments
POST   /assignments
```

ראה `src/lib/api-config.js` ו-`src/api/Client.js` להערות מפורטות.

## 📂 מידע נוסף

- 📦 **Mock Data:** פרויקט זה עובד כרגע עם **mock data** המאוחסן ב-localStorage
- 🔌 **Backend Ready:** הקוד מוכן להתחברות ל-backend API
- 🚀 **Production Ready:** הקוד מוכן לפרודקשן ב- `npm run build`
- 🎯 **Error Handling:** יש ErrorBoundary component לטיפול בשגיאות
- ⚡ **Performance:** Skeleton loaders עבור טוב UX

## 🧪 Testing

יש test infrastructure מוכן להרחבה. כדי להתחיל:

```bash
# 1. התקן testing dependencies
npm install -D vitest @testing-library/react @testing-library/dom happy-dom

# 2. הוסף scripts ל-package.json מהקובץ package.json.test-scripts

# 3. הרץ tests
npm test              # watch mode
npm run test:run      # single run
npm run test:coverage # with coverage report
```

### Tests Included
- ✅ useLoginForm hook tests
- ✅ useRoleSelection hook tests
- ✅ api-config utility tests

### Writing New Tests
```bash
# Create test file in src/__tests__/{feature}.test.js
# Use vitest + React Testing Library
# See existing tests for examples
```

## 📝 פקודות

```bash
npm run dev        # פיתוח
npm run build      # ייצור
npm run lint       # בדיקת קוד
npm run preview    # תצוגה מקדימה
npm test           # tests in watch mode
```

---

**פרויקט Guardian Shift | 2026**
