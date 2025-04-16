# ArticuLITE Project Structure

This document outlines the folder structure and organization of the ArticuLITE application.

## Directory Structure

### App Directory (Next.js App Router)
- `/app` - Next.js App Router pages and layouts
  - `/app/page.tsx` - Landing page
  - `/app/layout.tsx` - Root layout with providers
  - `/app/game` - Game screen
  - `/app/setup` - Game setup and configuration
  - `/app/auth` - Password protection

### Components
- `/components` - Reusable UI components
  - `/components/ui` - Generic UI components
  - `/components/layout` - Layout components
  - `/components/forms` - Form components and inputs
  - `/components/articulate` - Game-specific components
    - `/components/articulate/question` - Question display components
    - `/components/articulate/board` - Board visualization components
    - `/components/articulate/timer` - Timer components
    - `/components/articulate/team` - Team management components

### State Management
- `/contexts` - React Context providers
  - `/contexts/game` - Game state management
  - `/contexts/auth` - Authentication state
  - `/contexts/questions` - Question management state

### Custom Hooks
- `/hooks` - Custom React hooks
  - `/hooks/use-game` - Game logic hooks
  - `/hooks/use-timer` - Timer functionality
  - `/hooks/use-storage` - Local storage interactions
  - `/hooks/use-ai` - OpenAI API integration

### Utilities
- `/utils` - Helper functions and utilities
  - `/utils/storage` - LocalStorage utilities
  - `/utils/openai` - OpenAI API integration
  - `/utils/validation` - Input validation

### Data
- `/data` - Static data, game constants, etc.

### Types
- `/types` - TypeScript type definitions

### Styles
- `/styles` - Global styles and Tailwind CSS configuration

## Implementation Details

- The project uses Next.js with App Router for page routing
- Components are organized by feature and function
- Context API is used for state management across components
- Custom hooks encapsulate reusable logic
- Utility functions provide common functionality used across the application

## Conventions

- File naming uses kebab-case for components: `question-card.tsx`
- Component directories include an index.ts file for clean exports
- TypeScript is used throughout the project for type safety
- Tailwind CSS is used for styling components 