# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands you’ll use

- Development server
  - npm run dev
- Build and run production
  - npm run build
  - npm run start
- Lint
  - npm run lint
- Prisma (MongoDB)
  - Generate client: npx prisma generate
  - Sync schema (non-migrations): npx prisma db push
  - Seed database: npx prisma db seed
- Tests
  - No test framework is configured in this repo (no jest/vitest/playwright/cypress settings or scripts found).

## High-level architecture

- Framework and routing
  - Next.js 14 App Router with source under src/app. Uses route groups (e.g., src/app/(dashboard)/...) and dynamic routes like [id].
  - Auth is handled by Clerk. The sign-in flow lives at src/app/[[...sign-in]]/page.tsx and redirects users to /{role} based on Clerk user publicMetadata.role.
  - Images are configured in next.config.mjs to allow remote images from Pexels and Cloudinary.

- Data layer
  - Prisma ORM with a MongoDB datasource (see prisma/schema.prisma). Models cover core LMS entities: Admin, Student, Teacher, Parent, Grade, Class, Subject, Lesson, Exam, Assignment, Result, Attendance, Event, Announcement, plus explicit many-to-many join models TeacherSubject and TeacherClass.
  - Prisma client instantiation is centralized in src/lib/prisma.ts with a globalThis cache to avoid multiple clients in dev.
  - Seed script prisma/seed.ts clears existing data and populates sample records across all entities.

- Server actions and APIs
  - Server Actions: src/lib/actions.ts contains create/update/delete logic for most entities and uses next/cache revalidatePath to refresh relevant pages. These actions integrate with Clerk (e.g., creating/updating/deleting corresponding Clerk users for teachers, students, and parents).
  - API Routes: src/app/api/* provide fetch endpoints (e.g., students, teachers, subjects, classes, parent) implemented with NextResponse and Prisma.

- UI and styling
  - Tailwind CSS is used (tailwind.config.ts and postcss.config.mjs). Components largely follow a shadcn/Radix-style composition in src/components/ui. Domain-specific forms live under src/components/forms.

- Conventions and config
  - TypeScript path alias @/* maps to ./src/* (see tsconfig.json). You’ll see imports like "@/lib/prisma" and "@/components/...".
  - Linting is via next lint (eslint + eslint-config-next). No separate formatter config is present in the repo.

## Notes from README

- Start the development server with npm run dev and open http://localhost:3000.
- The primary entry for editing UI is under src/app (App Router).
