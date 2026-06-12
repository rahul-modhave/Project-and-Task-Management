# Authentication API Documentation

## Overview
This document describes the complete Authentication API endpoints following professional clean architecture with route → controller → service → repository pattern.

## Architecture

### Module Structure
```
src/modules/auth/
├── entity/
│   ├── user.entity.ts              # User schema for auth
│   └── session.entity.ts           # Session/token management
├── dto/
│   ├── signup.dto.ts               # Signup validation
│   └── login.dto.ts                # Login validation
├── interface/
│   ├── user.repository.interface.ts
│   └── session.repository.interface.ts
├── repository/
│   ├── user.repository.ts          # User DB operations
│   └── session.repository.ts       # Session DB operations
├── service/
│   └── auth.service.ts             # Authentication business logic
├── controller/
│   └── auth.controller.ts          # Request handling
└── route/
    └── auth.route.ts               # Route definitions
```

### Data Flow
```
Client Request
    ↓
Route (auth.route.ts)
    ↓
Validation Middleware (validates DTO)
    ↓
Controller (auth.controller.ts)
    ↓
Service (auth.service.ts) - Business Logic
    ↓
Repository (user.repository.ts / session.repository.ts)
    ↓
MongoDB (users / sessions collections)
```

---

## Endpoints

### 1. User Signup

**POST** `/api/v1/auth/signup`

Creates a new user account with authentication credentials.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Field Validations

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Minimum 8 characters |
| firstName | string | Yes | Cannot be empty |
| lastName | string | Yes | Cannot be empty |

#### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "emailVerified": false,
      "firstName": "John",
      "lastName": "Doe",
      "avatarUrl": null,
      "status": "active",
      "metadata": {},
      "lastLoginAt": null,
      "deletedAt": null,
      "version": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Error Responses

**409 Conflict - Email Already Registered**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_REGISTERED",
    "message": "Email already registered"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": {
      "email": ["Please provide a valid email address"],
      "password": ["Password must be at least 8 characters long"]
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. User Login

**POST** `/api/v1/auth/login`

Authenticates a user and returns access/refresh tokens.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Field Validations

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Cannot be empty |

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "emailVerified": false,
      "firstName": "John",
      "lastName": "Doe",
      "avatarUrl": null,
      "status": "active",
      "metadata": {},
      "lastLoginAt": "2024-01-15T10:35:00.000Z",
      "deletedAt": null,
      "version": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

#### Error Responses

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

**403 Forbidden - Account Suspended**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_SUSPENDED",
    "message": "Your account has been suspended"
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": {
      "email": ["Please provide a valid email address"],
      "password": ["Password is required"]
    }
  },
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

---

### 3. Refresh Token

**POST** `/api/v1/auth/refresh`

Generates a new access token using a valid refresh token.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully",
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

#### Error Responses

**401 Unauthorized - Invalid Token**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid or expired refresh token"
  },
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

**401 Unauthorized - Session Expired**
```json
{
  "success": false,
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "Session has been revoked or expired"
  },
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

---

### 4. Logout

**POST** `/api/v1/auth/logout`

Revokes the user's refresh token and ends the session.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (204 No Content)
```
(Empty response body)
```

#### Error Responses

**404 Not Found - Session Not Found**
```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found"
  },
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```

**400 Bad Request - Missing Token**
```json
{
  "success": false,
  "message": "Refresh token is required"
}
```

---

### 5. Get Current User

**GET** `/api/v1/auth/me`

Returns the authenticated user's profile information.

#### Request Headers
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "emailVerified": false,
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": null,
    "status": "active",
    "metadata": {},
    "lastLoginAt": "2024-01-15T10:35:00.000Z",
    "deletedAt": null,
    "version": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  "message": "Current user profile fetched",
  "timestamp": "2024-01-15T10:50:00.000Z"
}
```

#### Error Responses

**401 Unauthorized - Missing Token**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is required"
  },
  "timestamp": "2024-01-15T10:50:00.000Z"
}
```

**401 Unauthorized - Invalid Token**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token"
  },
  "timestamp": "2024-01-15T10:50:00.000Z"
}
```

---

## Authentication Flow

### Registration & Login Flow
```
1. User sends signup request → POST /api/v1/auth/signup
2. Server validates input
3. Server hashes password with bcrypt
4. Server creates user in database
5. Server generates JWT access token (15min expiry)
6. Server generates JWT refresh token (7 days expiry)
7. Server creates session record in database
8. Server sends verification email (async)
9. Server returns user + tokens
```

### Token Refresh Flow
```
1. Client detects access token expired
2. Client sends refresh token → POST /api/v1/auth/refresh
3. Server validates refresh token
4. Server checks session validity in database
5. Server generates new access token
6. Server generates new refresh token
7. Server revokes old session
8. Server creates new session
9. Server returns new tokens
```

### Authenticated Request Flow
```
1. Client includes: Authorization: Bearer <accessToken>
2. Auth middleware validates JWT signature
3. Auth middleware checks token expiry
4. Auth middleware extracts userId from token
5. Auth middleware fetches user from database
6. Auth middleware attaches user to req.user
7. Request proceeds to controller
```

---

## Security Features

### 1. Password Security
- **Bcrypt Hashing**: Passwords hashed with bcrypt (10 salt rounds)
- **Never Stored**: Raw passwords never stored in database
- **Never Returned**: passwordHash excluded from all API responses

### 2. Token Security
- **JWT Tokens**: Industry-standard JSON Web Tokens
- **Short-Lived Access**: Access tokens expire in 15 minutes
- **Refresh Rotation**: Refresh tokens rotated on each refresh
- **Session Tracking**: All sessions stored in database for revocation

### 3. Account Protection
- **Email Uniqueness**: Prevents duplicate accounts
- **Account Status**: Supports active/suspended/deleted states
- **Soft Delete**: Deleted accounts preserved with deletedAt timestamp
- **Login Tracking**: lastLoginAt updated on each successful login

### 4. Rate Limiting
- Global rate limiter applied to all `/api/` routes
- Prevents brute force attacks
- Configurable limits

---

## Testing

### 1. Signup
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

### 3. Get Current User
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Database Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  emailVerified: Boolean (default: false),
  passwordHash: String (bcrypt),
  firstName: String,
  lastName: String,
  avatarUrl: String (nullable),
  status: Enum ["active", "suspended", "deleted"],
  metadata: Object (flexible JSONB),
  lastLoginAt: Date (nullable),
  deletedAt: Date (nullable, soft delete),
  version: Number (default: 1),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Sessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  refreshToken: String,
  accessTokenJti: String (JWT ID),
  expiresAt: Date,
  revokedAt: Date (nullable),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | Success (login, refresh, get user) |
| 201 | Created (signup) |
| 204 | No Content (logout) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (invalid credentials/token) |
| 403 | Forbidden (account suspended) |
| 404 | Not Found (session not found) |
| 409 | Conflict (email already exists) |
| 500 | Internal Server Error |

---

## Professional Features Implemented

✅ **Clean Architecture** - Separation of concerns (route/controller/service/repository)  
✅ **Dependency Injection** - InversifyJS for loose coupling  
✅ **Input Validation** - class-validator with DTOs  
✅ **Error Handling** - Centralized error middleware  
✅ **Security Best Practices** - bcrypt hashing, JWT tokens, session management  
✅ **Token Rotation** - Refresh tokens rotated on use  
✅ **Soft Delete** - Users marked deleted, not removed  
✅ **Account Status** - Active/suspended/deleted states  
✅ **Logging** - Structured logging throughout  
✅ **Type Safety** - Full TypeScript coverage  
✅ **Database Indexes** - Optimized queries  
✅ **Email Verification** - Async email sending  
✅ **Consistent Response Format** - Standardized API responses  
✅ **Professional Error Messages** - User-friendly error codes  

---

## Environment Variables Required

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
MONGODB_URI=mongodb://localhost:27017/collabflow

# Email Service (for verification)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=your-password

# Server
PORT=3000
NODE_ENV=development
```

---

## Notes

- All endpoints follow RESTful conventions
- Consistent error response format across all endpoints
- passwordHash is NEVER included in responses
- Tokens should be stored securely on the client (httpOnly cookies recommended)
- Access tokens should be sent in Authorization header: `Bearer <token>`
- Refresh tokens should be stored securely and used only for token refresh
- Email verification is sent asynchronously (non-blocking)
