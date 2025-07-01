# AI Resume Matcher

## Overview

This is a full-stack web application that analyzes resume-to-job description compatibility using AI-powered analysis. The application allows users to upload PDF resumes and input job descriptions to receive detailed matching scores and improvement recommendations.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

- **Frontend**: React TypeScript SPA with Vite build system
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM (configured but using in-memory storage currently)
- **AI Integration**: OpenRouter API for intelligent resume analysis
- **PDF Processing**: PDF.js for text extraction from resume files

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions
- **Theme**: Custom light/dark theme system with CSS variables

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle with PostgreSQL dialect
- **File Upload**: Multer middleware for PDF handling
- **PDF Processing**: PDF.js for text extraction
- **AI Service**: OpenRouter client for GPT-4 analysis
- **Fallback Analysis**: Text similarity algorithm when AI is unavailable
- **Storage**: Currently using in-memory storage with interface for database migration

### Database Schema
```typescript
matchAnalyses table:
- id (serial primary key)
- jobDescription (text)
- resumeText (text) 
- matchScore (integer)
- skillMatch, experienceMatch, educationMatch, keywordMatch (integers)
- strengths, improvements, recommendations (text arrays)
- summary (text)
- isAiGenerated (boolean)
- createdAt (timestamp)
```

### API Endpoints
- `POST /api/extract-pdf` - Extract text from uploaded PDF resume
- `POST /api/match` - Analyze resume against job description

## Data Flow

1. **PDF Upload**: User uploads resume PDF → Multer processes file → PDF.js extracts text
2. **Job Input**: User enters job description in textarea
3. **Analysis Request**: Combined data sent to `/api/match` endpoint
4. **AI Processing**: OpenRouter API analyzes compatibility using GPT-4
5. **Fallback Logic**: Text similarity analysis if AI service unavailable
6. **Results Display**: Scores, insights, and recommendations rendered with animations
7. **Storage**: Analysis results stored (currently in-memory, ready for DB)

## External Dependencies

### AI Services
- **OpenRouter API**: Primary AI analysis using GPT-4 model
- **Fallback Algorithm**: Local text similarity analysis for reliability

### PDF Processing
- **PDF.js**: Client-side PDF text extraction library
- **Multer**: File upload middleware with size/type validation

### Database
- **Neon Database**: Serverless PostgreSQL (configured via DATABASE_URL)
- **Drizzle ORM**: Type-safe database operations with migration support

### UI/UX Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Icon library for consistent iconography

## Deployment Strategy

### Development
- **Vite Dev Server**: Hot module replacement for frontend development
- **TSX**: TypeScript execution for backend development
- **Replit Integration**: Custom plugins for Replit development environment

### Production Build
- **Frontend**: Vite builds optimized SPA to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend in production
- **Environment**: NODE_ENV-based configuration switching

### Database
- **Migrations**: Drizzle Kit manages schema migrations
- **Connection**: PostgreSQL via DATABASE_URL environment variable
- **Fallback**: In-memory storage for development/demo purposes

## Changelog
- July 01, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.