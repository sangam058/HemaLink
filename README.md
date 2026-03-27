# Hemalink - Blood Donation Platform

A modern blood donation management platform built with React, TypeScript, and Supabase. Connects donors, blood requesters, and hospitals to streamline the blood donation process.

## 🚀 Features

### For Donors
- **Personal Dashboard**: Track donations, points, and rewards
- **Blood Request Matching**: Get notified for matching blood requests
- **Donation Booking**: Schedule donations at nearby hospitals
- **Gamification**: Earn points, level up, and unlock badges
- **Campaign Participation**: Join blood donation campaigns

### For Blood Requesters
- **Request Management**: Create and track blood requests
- **Real-time Updates**: Get notified when donors are assigned
- **Emergency Requests**: Priority marking for urgent needs
- **Request History**: View all past and current requests

### For Hospitals
- **Inventory Management**: Track blood stock levels
- **Donation Coordination**: Manage donor appointments
- **Campaign Organization**: Create and manage blood drives
- **Request Fulfillment**: Process and fulfill blood requests

### For Administrators
- **User Management**: Oversee all platform users
- **System Monitoring**: Track platform activity and health
- **Report Generation**: Generate insights and reports
- **Content Moderation**: Approve hospitals and campaigns

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **State Management**: Zustand
- **Routing**: React Router v7
- **UI Components**: Custom components with TailwindCSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
