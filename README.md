# Groupie Tracker - Frontend 🎨

The frontend of Groupie Tracker is a modern React application built for performance, scalability, and a premium user experience. It leverages the TanStack ecosystem for robust routing and data management.

## 🛠 Tech Stack

- **Framework**: React 19 (Vite)
- **Routing**: TanStack Router (File-based)
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS 4 with custom animations (Framer Motion)
- **UI Components**: Shadcn UI & Radix UI
- **Mobile Integration**: Capacitor (iOS focused)
- **Testing**: Vitest

## 📦 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

### Production Build

```bash
npm run build
```

## 📱 Mobile Workflow (Capacitor)

1. **Build the web app**: `npm run build`
2. **Sync with iOS native project**: `npx cap sync ios`
3. **Open Xcode**: `npx cap open ios`

## 📂 Project Structure

- `src/routes/`: File-based routing logic.
- `src/features/`: Core business logic and components.
- `src/shared/`: Reusable components, hooks, and utilities.
- `src/styles.css`: Global styles and Tailwind configuration.

## 🧪 Testing

Run unit and integration tests with Vitest:

```bash
npm run test
```
