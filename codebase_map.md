# 🗺️ Student Portal — Codebase Map

> **Agent Navigation Guide**: Use this document to jump directly to any file without exploratory listing commands. All paths are absolute and clickable. Files are grouped by domain and annotated with key contents.

**Repo**: `https://github.com/destopianpirate/student_portal`  
**Root**: `c:\Users\DELL\OneDrive\Desktop\destopianpirate\studentportal\`  
**Framework**: Vite + React 18 + Firebase + Framer Motion

---

## ⚠️ Files Above 600 Lines (13 files — High Token Cost)

| Lines | File | Size | Domain |
|------:|------|-----:|--------|
| 3,094 | [NotesPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/NotesPage.jsx) | 158 KB | Notes editor with full toolbar, blocks, rich text |
| 1,771 | [notes.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/pages/notes.css) | 38 KB | All notes editor styles, mobile/desktop toolbar, themes |
| 1,392 | [part3.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/pages/part3.css) | 35 KB | Pages-specific CSS part 3 |
|   932 | [TimetablePage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/TimetablePage.jsx) | 46 KB | Full timetable CRUD, drag-drop scheduling |
|   777 | [auth/part2.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/auth/part2.css) | — | Auth styles part 2 |
|   775 | [home/part2.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/home/part2.css) | — | Home page styles part 2 |
|   748 | [HomePage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/HomePage.jsx) | 29 KB | Dashboard: schedule, HUD, metrics, mess menu |
|   695 | [CalendarPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/CalendarPage.jsx) | 36 KB | Full calendar, events, AgendaView, filters |
|   645 | [GradesPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/GradesPage.jsx) | 29 KB | Grades, CGPA, semester cards, simulators |
|   643 | [SettingsPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/SettingsPage.jsx) | 30 KB | Settings: profile, theme, security, exports |
|   642 | [base/part3.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base/part3.css) | 20 KB | Base styles part 3 (largest base chunk) |
|   632 | [settingsExporter.js](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/utils/settingsExporter.js) | — | Settings import/export utilities |
|   606 | [academics/part1.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/academics/part1.css) | — | Academic styles part 1 |

---

## 📁 Full Directory Tree

```
studentportal/
├── index.html                    (entry HTML)
├── vite.config.js                (Vite config: aliases, plugins)
├── package.json                  (deps: react, framer-motion, firebase, lucide-react)
├── vercel.json                   (SPA routing: all → /index.html)
├── .env                          (Firebase keys — not committed)
└── src/
    ├── main.jsx                  (21L — React DOM render, providers)
    ├── App.jsx                   (285L — Routes, auth guard, theme, sidebar layout)
    ├── firebase.js               (24L — Firebase app init + exports)
    ├── index.css                 (9L — bare CSS reset import)
    │
    ├── pages/                    (20 page components)
    ├── components/               (sub-components grouped by domain)
    ├── contexts/                 (React contexts)
    ├── styles/                   (CSS organized by domain)
    ├── utils/                    (utility/helper JS files)
    └── data/                    (static data files)
```

---

## 📄 Pages

| Lines | File | Key Contents |
|------:|------|-------------|
| 3,094 | [NotesPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/NotesPage.jsx) | Block editor, toolbar (3 rows), rich text, context menu, drawing canvas, slash commands, font/color/highlight pickers, export (MD/TXT/PDF), voice dictation, mobile bottom-sheet modals |
|   932 | [TimetablePage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/TimetablePage.jsx) | Weekly timetable grid, CRUD for classes, drag-to-schedule |
|   748 | [HomePage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/HomePage.jsx) | Dashboard widgets: attendance, grades summary, schedule, mess menu, HUD, profile |
|   695 | [CalendarPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/CalendarPage.jsx) | Month/week/agenda views, add event modal, holiday highlight, CalendarContext |
|   645 | [GradesPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/GradesPage.jsx) | Semester CGPA, SemesterCard, CGPA Forecaster, What-If Simulator, weekly schedule |
|   643 | [SettingsPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/SettingsPage.jsx) | Profile editing, theme toggle, notifications, security, export/import data |
|   601 | [StudyAIPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/StudyAIPage.jsx) | AI chat interface, Gemini API, study assistant features |
|   532 | [SignupPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/SignupPage.jsx) | Multi-step signup flow, Firebase auth, profile setup |
|   479 | [NotificationsPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/NotificationsPage.jsx) | Notification list, read/unread, filters, Firebase |
|   445 | [LandingPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/LandingPage.jsx) | Marketing landing: hero, features, showcase, FAQ, CTA |
|   394 | [LoginPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/LoginPage.jsx) | Email/password + Google OAuth login, forgot password |
|   360 | [AcademicsPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/AcademicsPage.jsx) | Academic records: courses, assignments, attendance link |
|   323 | [ProfileSetupPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/ProfileSetupPage.jsx) | Post-signup profile wizard: avatar, branch, year |
|   293 | [GoalsPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/GoalsPage.jsx) | Goal tracker: add/complete/delete goals, progress |
|   293 | [AdminPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/AdminPage.jsx) | Admin panel: user management, data operations |
|   252 | [AttendancePage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/AttendancePage.jsx) | Attendance tracking per subject, bunk calculator |
|   233 | [AssignmentsPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/AssignmentsPage.jsx) | Assignment list, due dates, status toggle |
|   110 | [ProjectsPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/ProjectsPage.jsx) | Project cards: team, status, github link |
|    95 | [CertificatesPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/CertificatesPage.jsx) | Certificate cards with upload and view |
|    50 | [ExplorePage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/ExplorePage.jsx) | Explore placeholder / upcoming features |

---

## 🧩 Components

### Core / Layout

| Lines | File | Key Contents |
|------:|------|-------------|
|   374 | [Sidebar.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/Sidebar.jsx) | Main navigation sidebar, collapsible, active route highlight |
|   167 | [CommandPalette.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/CommandPalette.jsx) | Ctrl+K command palette, route navigation |
|   105 | [LogoutConfirmModal.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/LogoutConfirmModal.jsx) | Animated logout confirmation dialog |
|   107 | [CourseInput.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/CourseInput.jsx) | Reusable course entry input with autocomplete |
|    55 | [ToastContainer.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/ToastContainer.jsx) | Global toast notifications (success/error/info) |
|    41 | [ErrorBoundary.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/ErrorBoundary.jsx) | React error boundary wrapper |
|    30 | [Navbar.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/Navbar.jsx) | Top navbar (mobile) |
|    22 | [ProtectedRoute.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/ProtectedRoute.jsx) | Auth guard — redirects unauthenticated users |
|    21 | [AdminRoute.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/AdminRoute.jsx) | Admin-only guard route |

### Home Components (`src/components/home/`)

| Lines | File | Key Contents |
|------:|------|-------------|
|   340 | [ProfileSection.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/home/ProfileSection.jsx) | Home profile card: avatar, stats, quick links |
|   203 | [ScheduleSection.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/home/ScheduleSection.jsx) | Today's schedule widget |
|   162 | [HomeModals.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/home/HomeModals.jsx) | All modals used in HomePage |
|   153 | [TimelineRibbon.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/home/TimelineRibbon.jsx) | Horizontal timeline of daily events |
|   143 | [MessMenuSection.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/home/MessMenuSection.jsx) | Mess/cafeteria daily menu card |
|   128 | [CampusHUD.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/home/CampusHUD.jsx) | Campus status HUD widget |

### Calendar Components (`src/components/calendar/`)

| Lines | File | Key Contents |
|------:|------|-------------|
|   203 | [DayDetailContent.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/calendar/DayDetailContent.jsx) | Day detail panel shown in agenda/day view |
|   152 | [AddEventModal.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/calendar/AddEventModal.jsx) | Add/edit calendar event modal |

### Grades Components (`src/components/grades/`)

| Lines | File | Key Contents |
|------:|------|-------------|
|   204 | [SemesterCard.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/grades/SemesterCard.jsx) | Per-semester grade card with subjects |
|   171 | [WhatIfSimulator.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/grades/WhatIfSimulator.jsx) | What-if grade simulator |
|   114 | [CreditAuditWidget.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/grades/CreditAuditWidget.jsx) | Credit audit / completion widget |
|    76 | [WeeklySchedule.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/grades/WeeklySchedule.jsx) | Weekly class schedule display |
|    67 | [CGPAForecaster.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/grades/CGPAForecaster.jsx) | CGPA forecast chart |

### Settings Components (`src/components/settings/`)

| Lines | File | Key Contents |
|------:|------|-------------|
|   357 | [EditProfilePhoto.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/settings/EditProfilePhoto.jsx) | Avatar crop/upload with Firebase Storage |
|   336 | [SettingsModals.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/settings/SettingsModals.jsx) | All settings modal dialogs |
|   260 | [EditProfileDetails.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/settings/EditProfileDetails.jsx) | Edit name, bio, branch, year |
|   251 | [AccountSecuritySection.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/settings/AccountSecuritySection.jsx) | Password change, 2FA, account deletion |
|   175 | [PreferencesSection.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/settings/PreferencesSection.jsx) | Theme, language, notification preferences |
|   119 | [DigitalIdentityCards.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/settings/DigitalIdentityCards.jsx) | Downloadable/printable student ID cards |
|    93 | [EditContactSocials.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/settings/EditContactSocials.jsx) | Edit phone, LinkedIn, GitHub socials |

### Landing Components (`src/components/landing/`)

| Lines | File | Key Contents |
|------:|------|-------------|
|   312 | [ShowcaseSection.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/landing/ShowcaseSection.jsx) | Feature showcase with animated previews |
|    55 | [FaqSection.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/landing/FaqSection.jsx) | Accordion FAQ section |

---

## ⚙️ Contexts

| Lines | File | Key Contents |
|------:|------|-------------|
|   367 | [AuthContext.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/contexts/AuthContext.jsx) | Firebase auth state, user profile, Firestore sync |
|   241 | [CalendarContext.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/contexts/CalendarContext.jsx) | Calendar events CRUD, recurring events, Firebase |
|    66 | [NotificationContext.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/contexts/NotificationContext.jsx) | Toast/notification queue context |

---

## 🔧 Utils

| Lines | File | Key Contents |
|------:|------|-------------|
|   632 | [settingsExporter.js](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/utils/settingsExporter.js) | Settings export to JSON/PDF, import restore |
|   473 | [homeUtils.js](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/utils/homeUtils.js) | Home page data helpers, schedule calculation |
|   137 | [parser.js](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/utils/parser.js) | Text/markdown parser utilities |
|   117 | [exporter.js](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/utils/exporter.js) | PDF/Excel export helpers |
|    92 | [avatarUtils.js](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/utils/avatarUtils.js) | Avatar initials, color generation |
|    74 | [messParser.js](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/utils/messParser.js) | Parse mess/cafeteria menu data |
|    61 | [qrUtils.js](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/utils/qrUtils.js) | QR code generation for student ID |

---

## 🎨 Styles Architecture

CSS is split into parts to stay under IDE limits. Each domain folder has a main import CSS that re-exports all parts.

### Global / Base

| File | Lines | Purpose |
|------|------:|---------|
| [variables.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/variables.css) | 432 | CSS custom properties: colors, spacing, breakpoints, themes |
| [animations.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/animations.css) | 409 | Global keyframes and animation utility classes |

### Base Styles (`src/styles/base/`)
> Imported via [base.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base.css)

| File | Lines |
|------|------:|
| [part1.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base/part1.css) | 524 |
| [part2.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base/part2.css) | 509 |
| [part3.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base/part3.css) | **642** |
| [part4.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base/part4.css) | 509 |
| [part5.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base/part5.css) | 521 |
| [part6.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base/part6.css) | 509 |
| [part7.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base/part7.css) | 568 |
| [part8.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/base/part8.css) | 382 |

### Pages Styles (`src/styles/pages/`)
> Imported via [pages.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/pages.css)

| File | Lines | Purpose |
|------|------:|---------|
| [notes.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/pages/notes.css) | **1,771** | All Notes editor styles |
| [part1.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/pages/part1.css) | 486 | General page styles part 1 |
| [part2.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/pages/part2.css) | 476 | General page styles part 2 |
| [part3.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/pages/part3.css) | **1,392** | General page styles part 3 |
| [part4.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/pages/part4.css) | 285 | General page styles part 4 |

### Home Styles (`src/styles/home/`)
> Imported via [home.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/home.css)

| File | Lines |
|------|------:|
| [part1.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/home/part1.css) | 599 |
| [part2.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/home/part2.css) | **775** |
| [part3.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/home/part3.css) | 144 |

### Auth Styles (`src/styles/auth/`)
> Imported via [auth.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/auth.css)

| File | Lines |
|------|------:|
| [part1.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/auth/part1.css) | 210 |
| [part2.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/auth/part2.css) | **777** |

### Academics Styles (`src/styles/academics/`)
> Imported via [academics.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/academics.css)

| File | Lines |
|------|------:|
| [part1.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/academics/part1.css) | **606** |
| [part2.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/academics/part2.css) | 542 |
| [part3.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/academics/part3.css) | 581 |
| [part4.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/academics/part4.css) | 439 |

### Landing Styles (`src/styles/landing/`)
> Imported via [landing.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/landing.css)

| File | Lines |
|------|------:|
| [part1.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/landing/part1.css) | 450 |
| [part2.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/landing/part2.css) | 436 |
| [part3.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/landing/part3.css) | 436 |
| [part4.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/landing/part4.css) | 443 |
| [part5.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/landing/part5.css) | 382 |
| [part6.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/landing/part6.css) | 506 |

### Navigation Styles (`src/styles/navigation/`)
> Imported via [navigation.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/navigation.css)

| File | Lines |
|------|------:|
| [part1.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/navigation/part1.css) | 393 |
| [part2.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/navigation/part2.css) | 370 |
| [part3.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/navigation/part3.css) | 101 |

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Total source files | ~85 |
| Files **above 600 lines** | **13** |
| Files **above 400 lines** | ~25 |
| Largest file | `NotesPage.jsx` — 3,094 lines / 158 KB |
| Total estimated source LOC | ~22,000 lines |

---

## 🧭 Quick Agent Navigation Tips

| Task | Jump To |
|------|---------|
| Edit notes toolbar / editor | [NotesPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/NotesPage.jsx) + [notes.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/pages/notes.css) |
| Fix auth / login flow | [AuthContext.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/contexts/AuthContext.jsx) + [LoginPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/LoginPage.jsx) |
| Change theme / CSS vars | [variables.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/variables.css) |
| Edit sidebar navigation | [Sidebar.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/Sidebar.jsx) |
| Change app routing | [App.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/App.jsx) |
| Work on calendar events | [CalendarPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/CalendarPage.jsx) + [CalendarContext.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/contexts/CalendarContext.jsx) |
| Work on timetable | [TimetablePage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/TimetablePage.jsx) |
| Change landing page | [LandingPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/LandingPage.jsx) + [ShowcaseSection.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/landing/ShowcaseSection.jsx) |
| Edit grade calculations | [GradesPage.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/pages/GradesPage.jsx) + [SemesterCard.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/components/grades/SemesterCard.jsx) |
| Add global animations | [animations.css](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/styles/animations.css) |
| Debug Firebase | [firebase.js](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/firebase.js) + [AuthContext.jsx](file:///c:/Users/DELL/OneDrive/Desktop/destopianpirate/studentportal/src/contexts/AuthContext.jsx) |
