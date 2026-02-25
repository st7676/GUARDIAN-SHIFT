# רשימת שינויים - Guardian Shift v2.0

## 📋 סיכום השינויים

פרויקט זה הופך מ-Base44 branded app לאפליקציה עצמאית מלאה עם mock data.

---

## ❌ הוסרו

### Dependencies:
- `@base44/sdk` (Base44 SDK)
- `@base44/vite-plugin` (Base44 Vite Plugin)

### קבצים:
- ~~`src/pages/Home.jsx`~~ (לא בשימוש)
- ~~`src/lib/AuthContext.jsx`~~ (לא בשימוש)
- ~~`src/lib/NavigationTracker.jsx`~~ (לא בשימוש)

---

## ✅ הוספו

### Dependencies:
- `axios` - עבור API calls בעתיד

### קבצים חדשים:
- **`SETUP.md`** - הוראות התקנה מלאות (בעברית)
- **`src/api/base44Client.js`** - Mock API client עם localStorage
- **`.env` template** - אפשרות להוסיף backend API בעתיד

### אלטרציות קבצים:

#### `vite.config.js`
- הסרת Base44 Plugin
- הוספת @/ alias לנתיבים

#### `jsconfig.json`
- עדכון paths ו-include/exclude

#### `src/App.jsx`
- החלפה מ-Vite default ל-proper routing
- הוספת React Router
- הוספת QueryClientProvider

#### `src/index.css`
- החלפה מ-default CSS ל-Tailwind directives
- הוספת CSS variables לעיצוב

#### `src/Layout.jsx`
- החלפת creatPageUrl() ב-getPageRoute()
- עדכון קישורים ל-routing החדש

#### `src/pages.config.js`
- הסרת import שגוי של Settingson
- ניקוי דפים לא קיימים

#### `index.html`
- עדכון title ל-Guardian Shift
- הסרת לוגו Base44

#### `package.json`
- עדכון name ל-guardian-shift

#### `README.md`
- עדכון למידע על Guardian Shift

---

## 🔧 הוראות לקולט (Pull)

כשמשך אתה את הקוד, עשה:

```bash
# 1. Clone / Pull
git clone <url>
cd guardian-shift

# 2. Install fresh dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Run dev
npm run dev
```

---

## 🎯 איך זה עובד עכשיו

### Mock API (`src/api/base44Client.js`)
- כל הנתונים נשמרים ב-**localStorage** של הדפדפן
- יש sample data (3 אחיות, 3 מחלקות)
- `queryFn`, `create`, `update`, `delete` כל עובדים

### Routing
- **Dashboard** = `/` (דף ראשי)
- **Nurses** = `/nurses`
- **Availability** = `/availability`
- **MySchedule** = `/myschedule`
- **Reports** = `/reports`
- **Settings** = `/settings`

### Styling
- **Tailwind CSS** לכל העיצוב
- **Radix UI components** לגמלוניות
- CSS variables ל-dark mode (מוכן)

---

## 🚀 כשיהיה Backend

בקובץ `src/api/base44Client.js`:
1. החלף את `MockDatabase` בקריאות `axios`
2. עדכן `baseURL` להצביע לשרוור שלך
3. כל querySelector יעבוד אוטומטית!

---

## ✨ תכונות שעובדות כרגע

✅ ניהול אחיות (CRUD)
✅ לוח זמנים
✅ הנתונים נשמרים
✅ Routing מלא
✅ UI responsive
✅ Dark mode ready

---

## 📝 Notes

- הפרויקט עדיין תלוי בחלקי Base44 קטנים בקוד (Page components משתמשים בmock API)
- זה ניתן להגדלה בקלות
- כל דבר תחת `src/components/ui` הוא Radix UI components (בסדר)

---

**סטטוס:** ✅ Fully Functional | Ready for Deployment
**אחרון עדכון:** 25.02.2026
