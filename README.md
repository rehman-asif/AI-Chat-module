# AI Chat Module - REST API

A TypeScript-based REST API implementing an AI Chat Module with subscription bundle management, following Domain-Driven Design (DDD) principles and using PostgreSQL as the database.

## Features

### Module 1: AI Chat Module

- ✅ Accepts user questions via REST API
- ✅ Returns mocked OpenAI-style responses with simulated API delay
- ✅ Stores questions, answers, and tokens in the database
- ✅ Monthly usage tracking per user:
  - Each user gets 3 free messages per month
  - Free quota automatically resets on the 1st of each month
- ✅ Subscription bundle support with multiple tiers:
  - **Basic**: 10 responses
  - **Pro**: 100 responses
  - **Enterprise**: Unlimited responses
- ✅ Multiple active bundles per user supported
- ✅ Smart quota deduction from bundle with latest remaining quota
- ✅ Structured error responses for quota exceeded scenarios
- ✅ Simulated OpenAI API response time delay (500ms - 2000ms)

## Architecture

This project follows **Domain-Driven Design (DDD)** principles with a clean layered architecture:

```
src/
├── domain/              # Domain layer (business logic)
│   ├── entities/        # Domain entities (User, Bundle, ChatMessage, UsageTracking)
│   ├── repositories/    # Repository interfaces
│   ├── services/        # Domain service interfaces
│   ├── value-objects/   # Value objects (BundleQuota)
│   └── errors/          # Domain-specific errors
├── application/         # Application layer (use cases)
│   └── services/        # Application services (ChatService, QuotaResetService)
├── infrastructure/      # Infrastructure layer (implementations)
│   ├── database/        # Database connection
│   ├── repositories/    # Repository implementations
│   ├── services/        # Infrastructure services (MockOpenAIService)
│   └── scheduler/       # Background jobs (QuotaResetScheduler)
└── presentation/        # Presentation layer (REST API)
    ├── controllers/     # HTTP controllers
    ├── routes/          # Express routes
    └── app.ts           # Express application setup
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb ai_chat_db

   # Or using psql:
   psql -U postgres
   CREATE DATABASE ai_chat_db;
   ```

4. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ai_chat_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   PORT=3000
   NODE_ENV=development
   ```

5. **Run database migrations:**
   ```bash
   npm run migrate
   ```
   
   **Note:** Make sure your `database.json` file matches your PostgreSQL credentials, or update it with your database connection details.

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Send Chat Message

```http
POST /api/users/:userId/chat
Content-Type: application/json

{
  "question": "What is artificial intelligence?"
}
```

**Success Response (200):**
```json
{
  "id": "uuid",
  "question": "What is artificial intelligence?",
  "answer": "This is a mocked response...",
  "tokensUsed": 150,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Question is required and must be a non-empty string"
}
```

**403 - Quota Exceeded:**
```json
{
  "error": "QUOTA_EXCEEDED",
  "message": "You have exceeded your free monthly quota. Please subscribe to a bundle to continue.",
  "details": {
    "freeQuotaUsed": 3,
    "freeQuotaLimit": 3,
    "requiresSubscription": true
  }
}
```

**404 - User Not Found:**
```json
{
  "error": "USER_NOT_FOUND",
  "message": "User not found"
}
```

## Database Schema

### Users
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `created_at` (TIMESTAMP)

### Bundles
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `tier` (VARCHAR: 'basic', 'pro', 'enterprise')
- `quota` (INTEGER)
- `remaining_quota` (INTEGER)
- `created_at` (TIMESTAMP)
- `expires_at` (TIMESTAMP, nullable)

### Chat Messages
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `question` (TEXT)
- `answer` (TEXT)
- `tokens_used` (INTEGER)
- `created_at` (TIMESTAMP)

### Usage Tracking
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `month` (INTEGER, 1-12)
- `year` (INTEGER)
- `free_messages_used` (INTEGER, 0-3)
- `last_reset_at` (TIMESTAMP)

## Business Logic

### Free Quota Management
- Each user receives **3 free messages per month**
- Free quota automatically resets on the **1st of each month at 00:00**
- Quota reset is handled by a cron job scheduler

### Bundle Quota Management
- Users can have **multiple active bundles** simultaneously
- When a user exceeds free quota, the system:
  1. Checks for active bundles
  2. Selects the bundle with the **latest remaining quota**
  3. Deducts usage from that bundle
- Bundle tiers:
  - **Basic**: 10 responses
  - **Pro**: 100 responses
  - **Enterprise**: Unlimited (MAX_INT)

### Quota Deduction Priority
1. Free monthly quota (first 3 messages)
2. Active bundles (sorted by remaining quota, descending)

## Example Usage

### 1. Create a User (manually in database or via your user management system)
```sql
INSERT INTO users (id, email) VALUES ('user-123', 'user@example.com');
```

### 2. Send a Chat Message
```bash
curl -X POST http://localhost:3000/api/users/user-123/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello, how are you?"}'
```

### 3. Create a Bundle (manually in database)
```sql
INSERT INTO bundles (user_id, tier, quota, remaining_quota)
VALUES ('user-123', 'pro', 100, 100);
```

## Testing

### Manual Testing

1. **Test free quota:**
   - Send 3 messages - should succeed
   - Send 4th message - should fail with quota exceeded

2. **Test bundle quota:**
   - Create a bundle for a user
   - Exhaust free quota (3 messages)
   - Send messages using bundle quota
   - Verify remaining_quota decreases

3. **Test multiple bundles:**
   - Create multiple bundles for same user
   - System should use bundle with highest remaining quota

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with hot reload
- `npm start` - Run compiled JavaScript
- `npm run migrate` - Run database migrations
- `npm run migrate:down` - Rollback last migration

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Migrations**: node-pg-migrate
- **Scheduling**: node-cron
- **Validation**: Zod (ready for use)

## Project Structure

- **Domain Layer**: Pure business logic, no dependencies on infrastructure
- **Application Layer**: Orchestrates domain logic and use cases
- **Infrastructure Layer**: Database, external services, frameworks
- **Presentation Layer**: HTTP controllers and routes

## Notes

- The OpenAI service is **mocked** and simulates response delays (500-2000ms)
- Monthly quota reset runs automatically via cron job on the 1st of each month
- All errors are structured and follow a consistent format
- The API follows REST principles
- Database transactions are used to ensure atomicity when deducting quotas and saving messages
- Bundle quota deduction uses the bundle with the highest remaining quota first

## License

ISC

## Author

[Your Name Here]

