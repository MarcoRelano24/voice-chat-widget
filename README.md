# Voice Widget Platform

A comprehensive platform for creating and managing customizable voice chat widgets powered by Vapi AI.

## Project Structure

```
voice-chat-widget/
├── dashboard/              # Main Next.js application
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   │   ├── login/     # Authentication pages
│   │   │   ├── dashboard/ # Dashboard pages
│   │   │   └── api/       # API routes
│   │   ├── lib/           # Utilities and helpers
│   │   │   ├── supabase/  # Supabase client setup
│   │   │   └── types/     # TypeScript definitions
│   │   └── middleware.ts  # Auth middleware
│   ├── .env.local         # Environment variables
│   └── package.json
└── docs/                   # Documentation files
    ├── BUILDING-STATUS.md
    ├── CUSTOMIZATION.md
    ├── DEPLOYMENT.md
    ├── FEATURES.md
    └── PLATFORM-PLAN.md
