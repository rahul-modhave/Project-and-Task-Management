# User Creation API Documentation

## Overview
This document describes the User Creation API endpoint that follows proper clean architecture with route → controller → service → repository pattern.

## Endpoint

**POST** `/api/v1/users`

Creates a new user in the MongoDB `users` collection. If the collection doesn't exist, it will be automatically created.

## Architecture

### Module Structure
```
src/modules/user/
├── entity/user.entity.ts           # Mongoose schema definition
├── dto/create-user.dto.ts          # Data validation
├── interface/user-entity.repository.interface.ts
├── repository/user-entity.repository.ts  # Database operations
├── service/user.service.ts         # Business logic
├── controller/user.controller.ts   # Request handling
└── route/user.route.ts             # Route definition
```

### Data Flow
```
Client Request
    ↓
Route (user.route.ts)
    ↓
Validation Middleware (validates CreateUserDto)
    ↓
Controller (user.controller.ts)
    ↓
Service (user.service.ts)
    ↓
Repository (user-entity.repository.ts)
    ↓
MongoDB (users collection)
```

## Database Schema

### Collection: `users`

```javascript
{
  _id: ObjectId,              // Auto-generated
  email: String,              // Required, unique, lowercase
  passwordHash: String,       // Required, bcrypt hashed
  firstName: String,          // Required
  lastName: String,           // Required
  avatar: String,             // Optional, default: null
  isVerified: Boolean,        // Optional, default: false
  lastLoginAt: Date,          // Optional, default: null
  createdAt: Date,            // Auto-generated (timestamps)
  updatedAt: Date             // Auto-generated (timestamps)
}
```

## Request

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://example.com/avatar.jpg",  // Optional
  "isVerified": false                          // Optional
}
```

### Field Validations

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| email | string | Yes | Must be valid email format |
| password | string | Yes | Minimum 8 characters |
| firstName | string | Yes | Cannot be empty |
| lastName | string | Yes | Cannot be empty |
| avatar | string | No | Valid string or null |
| isVerified | boolean | No | Default: false |

## Response

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg",
    "isVerified": false,
    "lastLoginAt": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "User created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Note:** The `passwordHash` field is NOT returned in the response for security reasons.

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters long"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 409 Conflict - Email Already Exists
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "User with this email already exists"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "USER_CREATION_FAILED",
    "message": "Failed to create user"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Features

### 1. **Automatic Collection Creation**
- If the `users` collection doesn't exist in MongoDB, it will be automatically created
- Proper indexes are set up automatically (unique index on email)

### 2. **Email Uniqueness**
- Prevents duplicate users with the same email
- Returns 409 Conflict error if email already exists

### 3. **Password Security**
- Passwords are hashed using bcrypt with salt rounds of 10
- Raw passwords are never stored in the database
- Password hashes are never returned in API responses

### 4. **Input Validation**
- Request body is validated using class-validator decorators
- Invalid requests return detailed validation errors

### 5. **Proper Error Handling**
- All errors are caught and formatted consistently
- Detailed error messages for debugging
- Appropriate HTTP status codes

## Testing

### Using cURL

```bash
# Create a new user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg",
    "isVerified": false
  }'
```

### Using Postman

1. Set method to **POST**
2. URL: `http://localhost:3000/api/v1/users`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Using JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/api/v1/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'SecurePassword123',
    firstName: 'John',
    lastName: 'Doe',
  }),
});

const result = await response.json();
console.log(result);
```

## Implementation Details

### Repository Layer
- Extends `BaseRepository` for common CRUD operations
- Includes `ensureCollectionExists()` method to create collection if needed
- `findByEmail()` method for checking existing users

### Service Layer
- Contains business logic for user creation
- Handles password hashing with bcrypt
- Validates email uniqueness
- Ensures collection exists before operations
- Comprehensive error handling

### Controller Layer
- Handles HTTP request/response
- Removes sensitive data (passwordHash) from response
- Delegates business logic to service layer
- Passes errors to error middleware

### Route Layer
- Defines endpoint path and HTTP method
- Applies validation middleware
- Resolves controller from DI container

## Security Considerations

1. **Password Hashing**: All passwords are hashed with bcrypt before storage
2. **No Password in Response**: passwordHash is never returned to clients
3. **Email Validation**: Only valid email formats are accepted
4. **Input Sanitization**: Email is converted to lowercase and trimmed
5. **Error Messages**: Generic error messages prevent information leakage

## Database Operations

The repository automatically:
- Creates the `users` collection if it doesn't exist
- Sets up indexes for optimal query performance
- Handles timestamps (createdAt, updatedAt) automatically via Mongoose

## Status Codes

| Code | Meaning |
|------|---------|
| 201 | User created successfully |
| 400 | Validation error (invalid input) |
| 409 | Conflict (email already exists) |
| 500 | Internal server error |

## Notes

- The API uses dependency injection for loose coupling
- All components are testable in isolation
- Follows Clean Architecture principles
- MongoDB connection must be established before using this API
- The endpoint is available at `/api/v1/users` (prefix configured in app config)
