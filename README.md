# Family Expense Tracker - Frontend

A modern, responsive Ionic React application for tracking family expenses with beautiful UI and charts.

## 🚀 Features

- **Modern UI**: Built with Ionic React components
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Real-time Updates**: Pull-to-refresh functionality
- **Interactive Charts**: Visualize income and expenses with Chart.js
- **State Management**: Zustand for efficient state handling
- **Offline Support**: PWA capabilities with service workers
- **Secure Authentication**: JWT-based auth with auto token refresh

## 🛠️ Tech Stack

- **Framework**: Ionic React
- **UI Components**: Ionic Components
- **Routing**: React Router
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Chart.js & React-ChartJS-2
- **Build Tool**: Vite
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js (v16 or higher)
- Backend API running on `http://localhost:3000`

## ⚙️ Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API endpoint** (optional)
   
   Update the `API_BASE_URL` in `src/services/api.ts` if your backend runs on a different URL.

3. **Start development server**
   ```bash
   npm run dev
   ```

The app will run on `http://localhost:8100`

## 📱 App Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.tsx       # Main layout with menu
│   │   └── ProtectedRoute.tsx
│   ├── pages/               # Page components
│   │   ├── Auth/            # Login & Register
│   │   ├── Dashboard/       # Dashboard with charts
│   │   ├── Income/          # Income management
│   │   ├── Expense/         # Expense management
│   │   ├── Family/          # Family members
│   │   └── Profile/         # User profile
│   ├── services/            # API services
│   │   └── api.ts           # Axios instance & API calls
│   ├── store/               # State management
│   │   └── authStore.ts     # Auth state with Zustand
│   ├── theme/               # Ionic theming
│   │   └── variables.css
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

## 📄 Pages Overview

### Authentication
- **Login**: Family code + Email + Password login
- **Register**: 3-step registration with OTP verification
  1. Send OTP to email
  2. Verify OTP
  3. Complete profile and join/create family

### Dashboard
- Toggle between family and personal views
- Summary cards (Income, Expense, Balance)
- Interactive charts (Pie & Bar charts)
- Member breakdown (family view only)

### Incomes
- List all income records
- Add/Edit/Delete operations
- Categorization
- Notes support

### Expenses
- List all expense records
- Add/Edit/Delete operations
- Multiple categories
- Notes support

### Family
- View family details and code
- List all family members
- Remove members (Admin only)
- Role badges

### Profile
- User information
- Logout functionality
- App information

## 🎨 Features

### Responsive Design
- Mobile-first approach
- Works seamlessly on tablets and desktops
- Adaptive layouts with Ionic grid

### Pull to Refresh
- All data pages support pull-to-refresh
- Real-time data updates

### State Management
- Zustand for lightweight state management
- Persistent authentication
- Auto-rehydration on app reload

### API Integration
- Axios interceptors for token refresh
- Automatic retry on 401 errors
- Structured error handling

### Charts & Visualization
- Pie charts for category breakdown
- Bar charts for comparisons
- Responsive chart sizing

## 🔐 Security

- JWT tokens stored in localStorage
- Automatic token refresh on expiry
- Protected routes with auth guards
- Secure API communication

## 📱 Mobile Build

### Android
```bash
npm install @capacitor/android
npx cap add android
npm run build
npx cap sync
npx cap open android
```

### iOS
```bash
npm install @capacitor/ios
npx cap add ios
npm run build
npx cap sync
npx cap open ios
```

## 🧪 Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎯 Key Components

### Layout Component
- Side menu with navigation
- Header with menu button
- User info display
- Consistent across all pages

### Protected Routes
- Redirect unauthenticated users to login
- Preserve intended destination

### API Service
- Centralized API calls
- Token management
- Error handling
- Type-safe responses

## 🌈 Customization

### Theme Colors
Edit `src/theme/variables.css` to customize:
- Primary color
- Success/Warning/Danger colors
- Dark mode support

### Categories
Add/modify categories in:
- `src/pages/Income/Incomes.tsx` - `INCOME_CATEGORIES`
- `src/pages/Expense/Expenses.tsx` - `EXPENSE_CATEGORIES`

### API Endpoint
Change `API_BASE_URL` in `src/services/api.ts`

## 📄 License

MIT License

