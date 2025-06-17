# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This project is a full-stack web application that allows users to create dating profiles for themselves, and friends can create and curate dating profiles on behalf of their friends.

Each user will have:
1. A database pool of assets (photos, videos, audio) that can be used to create a profile
2. A list of profiles that their friends have made for them 
3. A list of profiles that they have made for their friends

## Project Structure

- **`frontend/`** - React/TypeScript frontend with Vite
- **`server/`** - Node.js/Express backend with TypeScript
- **`database/`** - PostgreSQL migrations and schema 

## Development Commands

### Local Development Setup
```bash
# First time setup
cd server
make compose    # Start local PostgreSQL in Docker
make clean      # Clear older builds
make setup      # Download packages (yarn)
make watch      # Start development server with auto-rebuild

# Frontend development (separate terminal)
cd frontend
npm install     # Install frontend dependencies
npm run dev     # Start Vite development server
```

### Database Operations
```bash
# From server directory
make migrate              # Run database migrations
make generate-db-types    # Generate TypeScript types from database schema
make reset-local-db       # Reset local database
make backup-db           # Backup database
make restore-db          # Restore database
```

### Testing
```bash
# From server directory
make test                # Run all tests
make watch-test          # Run tests in watch mode
# To run specific tests, modify TESTS variable in server/Makefile
```

### Build
```bash
# Backend build (from server directory)
make build              # TypeScript build
make lint               # Run ESLint with auto-fix

# Frontend build (from frontend directory)
npm run build           # TypeScript + Vite build
npm run lint            # Run ESLint
```

### Production Deployment
```bash
# From root directory
make deploy-production  # Deploy to production
make stop-production    # Stop production containers
make start-production   # Start production containers
```

## AI Instructions

### Code Generation
- Always explain architectural decisions
- Ask clarifying questions if requirements are ambiguous
- Suggest improvements but don't implement without approval
- Generate complete, working code blocks (no placeholders)

### Problem Solving
- Start with the simplest solution that works
- Only add complexity when specifically requested
- Highlight potential issues or edge cases
- Suggest testing approaches for new features

## Architecture Overview

### Frontend project structure
- Should follow bulletproof react formatting- https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md

### Database Layer
- **PostgreSQL** with Flyway migrations in `database/migrations/`
- **Objection.js** ORM with Knex query builder
- **Kanel** for generating TypeScript types from database schema
- Database types auto-generated in `src/types/database/`
- Base model class in `src/database/base-model.ts`

### API Structure
- **Express.js** REST API with modular route structure
- Main API router in `src/web/api.ts`
- Route modules in `src/modules/*/` directories
- Middleware in `src/middleware/`
- Request validation using AJV schemas
- Do not use try-catch unless specifically for 3rd party requests.
- All API requests use POST, there is no GET / DELETE etc.

### Job Scheduling
- **pg-boss** for job queue management
- Base job classes in `src/scheduler/`
- Cron jobs extend `CronJob` class
- One-time jobs extend `OneTimeJob` class
- Job service setup in `src/scheduler/job-service-setup.ts`

### Key Services
- **S3Service** in `src/services/s3-service.ts` for file uploads
- **DatabaseService** for database operations
- **JobService** for background job management

### Testing Framework
- **Jest** for unit tests with SWC transform
- **Mocha** for integration tests
- Tests in `__tests__/` directory
- Global test setup in `__tests__/helpers/`


### Upsert Patterns
```typescript
// Regular upsert
const result = await context.databaseService
  .query(Model)
  .insert(data)
  .onConflict(['unique_key'])
  .merge()
  .returning('*')
  .first();

// Batch upsert
const batches = await batchQuery(context, items, async batchItems => {
  return await context.databaseService
    .query(Model)
    .insert(batchItems)
    .onConflict(['unique_keys'])
    .merge()
    .returning('*');
}, batchSize);
```

### Data Handling
- **Dates**: Use `LocalDate.parse()` for pure dates, `ZonedDateTime` for timestamps
- **JSONB**: Always `JSON.stringify()` before database insert
- **Arrays**: Send native JS arrays for PostgreSQL array columns
- **Conflicts**: Use `.merge()` for data tables, `.ignore()` for link tables

### Configuration
- Environment variables managed with `envalid`
- Configuration files in `src/config/`
- Separate `.env` files for different environments
- Docker Compose for local development database

### Utilities
- Time utilities using `@js-joda` library in `src/utils/time.ts`
- Error handling utilities in `src/utils/error-handler.ts`
- Result types for consistent API responses in `src/utils/results.ts`
- Winston logging configuration in `src/config/logger.ts`

### File Structure
- `src/modules/` - Feature modules with controllers, routes, and business logic
- `src/persisters/` - Database persistence layer
- `src/types/` - TypeScript type definitions
- `src/utils/` - Shared utilities
- `src/web/` - Express setup and routing
- `lib/` - Compiled JavaScript output (gitignored)


### Core Architecture Pattern
- **Persister** (`*-persister.ts`): Database operations only, one per table
- **Service** (`*-service.ts`): Business logic, exports const functions
- **Controller** (`*-controller.ts`): HTTP request handling, registered with Controller.register
- **Route** (`*-route.ts`): API endpoint definitions using Express

### Database Design
- **Global ID sequence** across all tables using `template.base_table`
- **Flyway migrations** with checksum validation and automatic repair in development
- **TypeScript types** auto-generated from database schema using Kanel
- **Audit columns** (`id`, `created_at`, `last_modified`) inherited from base template


### Development Notes
- TypeScript compiled to `lib/` directory
- Source maps enabled for debugging
- Pre-commit hooks configured with husky
- Uses yarn for package management
- Strict TypeScript configuration with comprehensive type checking