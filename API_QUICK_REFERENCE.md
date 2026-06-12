# API Quick Reference Guide

## Base URL
```
http://localhost:3000/api/v1
```

---

## 🏥 Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Check API and MongoDB status | ❌ No |

**Example:**
```bash
curl http://localhost:3000/api/v1/health
```

---

## 👤 User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users` | Create a new user | ❌ No |

**Create User Example:**
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": null,
    "isVerified": false,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "User created successfully"
}
```

---

## 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new account | ❌ No |
| POST | `/auth/login` | Login to account | ❌ No |
| POST | `/auth/refresh` | Refresh access token | ❌ No |
| POST | `/auth/logout` | Logout and revoke session | ❌ No |
| GET | `/auth/me` | Get current user profile | ✅ Yes |

### Signup
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Get Current User
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📋 Task Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/tasks` | Create a new task | ✅ Yes |
| GET | `/tasks/project/:projectId` | Get tasks by project | ✅ Yes |

### Create Task
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement login API",
    "description": "Create login endpoint with JWT authentication",
    "projectId": "PROJECT_ID",
    "priority": "high",
    "status": "todo"
  }'
```

### Get Tasks by Project
```bash
curl -X GET http://localhost:3000/api/v1/tasks/project/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔑 Authentication Headers

For protected endpoints (marked with ✅), include the JWT access token:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 📊 Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🚦 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST requests (resource created) |
| 204 | No Content | Successful DELETE or logout |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 500 | Internal Server Error | Server-side errors |

---

## 🛠️ Testing Tools

### Using cURL (Command Line)
All examples above use cURL

### Using Postman
1. Import collection with all endpoints
2. Set base URL: `http://localhost:3000/api/v1`
3. Use environment variables for tokens

### Using HTTPie (Alternative to cURL)
```bash
# Login
http POST localhost:3000/api/v1/auth/login \
  email=user@example.com \
  password=Password123

# Get current user (with auth)
http GET localhost:3000/api/v1/auth/me \
  Authorization:"Bearer YOUR_TOKEN"
```

### Using JavaScript Fetch
```javascript
// Login
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123'
  })
});
const data = await response.json();
console.log(data.data.accessToken);
```

---

## 🔒 Security Notes

1. **Never expose tokens in URLs** - Use Authorization headers
2. **Store tokens securely** - Use httpOnly cookies or secure storage
3. **Passwords are hashed** - bcrypt with 10 salt rounds
4. **HTTPS in production** - Always use HTTPS for sensitive data
5. **Token expiry** - Access tokens expire in 15 minutes, refresh in 7 days
6. **Rate limiting** - Applied to all `/api/` routes

---

## 📚 Detailed Documentation

- **Authentication API**: See `AUTH_API_DOCUMENTATION.md`
- **User API**: See `USER_API_DOCUMENTATION.md`
- **Complete Spec**: Check `.kiro/specs/` directory

---

## 🐛 Common Issues

### 1. "Unauthorized" Error
- Check if access token is expired (refresh it)
- Verify token is in Authorization header: `Bearer <token>`

### 2. "Validation Failed" Error
- Check all required fields are present
- Verify field formats (email, password length, etc.)

### 3. "Email Already Exists" Error
- Use login instead of signup
- Or use a different email address

### 4. MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MongoDB connection string in `.env`

### 5. Redis Error (Fixed)
- Redis has been disabled for MVP
- No action needed

---

## 🚀 Quick Start Workflow

1. **Start Server**
   ```bash
   npm start
   ```

2. **Check Health**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

3. **Create User (Option 1)**
   ```bash
   curl -X POST http://localhost:3000/api/v1/users \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test1234","firstName":"Test","lastName":"User"}'
   ```

4. **Register via Auth (Option 2)**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"auth@example.com","password":"Test1234","firstName":"Auth","lastName":"User"}'
   ```

5. **Login**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test1234"}'
   ```

6. **Save Tokens**
   Copy `accessToken` and `refreshToken` from login response

7. **Get Current User**
   ```bash
   curl http://localhost:3000/api/v1/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

8. **Create Task**
   ```bash
   curl -X POST http://localhost:3000/api/v1/tasks \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"My Task","projectId":"123"}'
   ```

---

## 📝 Environment Setup

Create `.env` file:
```env
# Server
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1

# MongoDB
MONGODB_URI=mongodb://localhost:27017/collabflow

# JWT
JWT_ACCESS_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (Optional for MVP)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## ✅ What's Working

- ✅ Redis removed - No connection errors
- ✅ Health check API
- ✅ User creation API
- ✅ Complete authentication (signup, login, logout, refresh, me)
- ✅ Task management APIs
- ✅ MongoDB auto-collection creation
- ✅ Input validation
- ✅ Error handling
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Session management

---

**Need Help?** Check the detailed documentation files:
- `AUTH_API_DOCUMENTATION.md`
- `USER_API_DOCUMENTATION.md`
