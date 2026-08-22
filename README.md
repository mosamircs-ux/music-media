# 🎵 MusicMotion

> **Production-ready AI & Music-to-Video Creation Platform**
> Turn licensed music tracks into synchronized, captivating vertical videos (Reels/TikTok/Shorts) with AI visual scenes, customizable animated captions, waveforms, and Remotion video rendering.

---

## 🌟 Core Features

1. **Licensed Music Discovery & User Uploads**:
   - Provider abstraction supporting legal providers like Jamendo API and direct user audio uploads.
   - Respects licensing restrictions and track attribution.
2. **Audio Waveform & Precise Trimming**:
   - Interactive visual waveform rendering powered by WaveSurfer.js.
   - Millisecond-precise start and end time region selection.
3. **Timed Animated Captions**:
   - Add, edit, and style caption blocks synchronized to audio beats and words.
   - Built-in multi-language and RTL (Right-to-Left) typography support.
4. **AI Visual Scene Generation**:
   - Pluggable AI generation backend (OpenAI, Replicate, Stability) to generate thematic scenes matching music mood and captions.
5. **Timeline Synchronization & Preview**:
   - Real-time in-browser preview of scenes, transition effects, dynamic captions, and music audio.
6. **Video Export & Queue Pipeline**:
   - Remotion-powered vertical (9:16) video rendering engine with background asynchronous processing via BullMQ & Redis.
7. **Internationalization & Localization**:
   - Built-in English & Arabic support with automatic RTL layout switching.
   - Dark mode & Light mode theming with fluid transitions.

---

## 🏗️ Architecture & Monorepo Structure

```
music-media/
├── apps/
│   └── web/                   # Next.js 16 (App Router, Tailwind CSS, shadcn/ui, Zustand)
├── packages/
│   ├── ui/                    # Shared design system components, RTL & Theme providers
│   ├── music/                 # Music provider abstractions (Jamendo, Upload) & Waveform types
│   ├── video/                 # Remotion 4.x composition components, FFmpeg & rendering queue
│   ├── ai/                    # AI visual scene generation abstraction & prompt enhancers
│   ├── database/              # Prisma schema, client, and PostgreSQL migrations
│   └── shared/                # Shared TypeScript types, Zod validation schemas, i18n & utilities
├── tooling/                   # Shared TypeScript, ESLint, and Prettier configurations
├── docker/                    # Docker Compose development & worker configurations
├── turbo.json                 # Turborepo task pipeline
└── pnpm-workspace.yaml        # pnpm monorepo workspace definition
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose (for PostgreSQL and Redis)
- FFmpeg (for video rendering worker)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repo-url> musicmotion
cd musicmotion

# Install all workspace packages
pnpm install
```

### 2. Environment Setup
```bash
# Copy example env file
cp .env.example .env

# Configure your database and provider API keys in .env
```

### 3. Start Database & Redis Services
```bash
# Run PostgreSQL and Redis via Docker Compose
pnpm docker:up
# Or directly:
docker compose -f docker/docker-compose.yml up -d
```

### 4. Initialize Database
```bash
pnpm db:push
# Or generate Prisma client
pnpm db:generate
```

### 5. Launch Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing, Quality & Production Builds

```bash
# Run TypeScript typechecks across all packages
pnpm typecheck

# Run linter
pnpm lint

# Run automated tests
pnpm test

# Build for production
pnpm build
```

---

## 🔒 Licensing & Music Attribution
- Music integration strictly respects provider licensing agreements.
- Jamendo tracks require appropriate CC attribution where applicable.
- Remotion is subject to its respective commercial licensing terms for production deployment.
