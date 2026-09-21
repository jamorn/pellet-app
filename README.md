# 🏢 IRPC Pellet App (TIS Grade Management)

ระบบจัดการและแสดงผลข้อมูลรายการเกรดเม็ดพลาสติก (IRPC TIS Grade System) พัฒนาด้วย Next.js 14 App Router, TypeScript, NextAuth.js และ Tailwind CSS

---

## 🛠️ Tech Stack & Features

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js (Session & Auth Handler)
- **Styling**: Tailwind CSS & Lucide React
- **Architecture**: Service Pattern, Models & Component-Driven Design

---

## 📂 Project Structure

```text
pellet-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts     # NextAuth.js Route Handler
│   │   ├── layout.tsx                # Root Layout & Global Providers
│   │   └── page.tsx                  # Main Page / Dashboard Entry Point
│   │
│   ├── components/
│   │   ├── Navbar.tsx                # Top Navigation Bar & Dark Mode Switcher
│   │   ├── Providers.tsx             # Session & Theme Context Providers
│   │   ├── UserTableView.tsx         # Component สำหรับ Public/User Data View
│   │   └── AdminCrudView.tsx         # Component สำหรับ Admin Management (CRUD)
│   │
│   ├── lib/
│   │   └── auth.ts                   # NextAuth Configuration Options
│   │
│   ├── models/
│   │   └── TISGradeModel.ts          # Data Model / Class / Schema Helper
│   │
│   ├── services/
│   │   └── TISApiService.ts          # API Service for fetching & managing TIS Data
│   │
│   └── types/
│       ├── tis.ts                    # TypeScript Type Definitions for TIS Items
│       └── css.d.ts                  # CSS Type Declarations
│
├── .next/                            # Next.js Build Output & Generated Types
├── next-env.d.ts                     # Next.js TypeScript declarations
└── README.md