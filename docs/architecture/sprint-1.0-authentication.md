# Sprint 1.0 — Authentication & Identity Foundation

## Overview

Implemented a secure, production-oriented authentication and identity foundation on top of the Sprint 0.x codebase.

## Authentication Flow

### Registration
1. Client sends phone, password, optional profile fields
2. Server normalizes phone (Persian/Arabic digits to ASCII)
3. Server validates uniqueness
4. Server hashes password with bcrypt (cost factor 12)
5. Server creates user and optional device record
6. Server generates access JWT (15m) and opaque refresh token (30d)
7. Server stores only refresh token hash in database
8. Server returns sanitized user + tokens

### Login
1. Client sends phone + password
2. Server normalizes phone
3. Server finds user by phone
4. Server compares password hash
5. Server returns generic "Invalid credentials" on failure
6. Server creates session and issues tokens

### Refresh
1. Client sends refresh token
2. Server hashes and finds matching active session
3. Server rotates refresh token (new hash, old revoked)
4. Server issues new access token

### Logout
1. Client sends access token
2. Server revokes current session
3. Historical session records are preserved

## Security Decisions

- Passwords hashed with bcrypt (cost factor 12)
- Refresh tokens stored as SHA-256 hashes only
- JWT contains only `sub` (userId) and optional `sid` (sessionId)
- No passwords, hashes, or tokens returned in API responses
- Generic authentication errors prevent user enumeration
- Phone normalization handles Persian/Arabic digits
- Rate limiting foundation via in-memory interceptor (replaceable with Redis)
- Mobile stores refresh tokens in SecureStore, access tokens in memory

## API Endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | /api/v1/auth/register | No | Register user |
| POST | /api/v1/auth/login | No | Login |
| POST | /api/v1/auth/refresh | No | Refresh token |
| POST | /api/v1/auth/logout | Yes | Revoke session |
| GET | /api/v1/users/me | Yes | Current profile |
| PATCH | /api/v1/users/me | Yes | Update profile |

## Mobile Changes

- `services/api.ts` — HTTP client with auth headers
- `services/auth.ts` — Login, register, refresh, logout flows
- `stores/authStore.ts` — Zustand auth state
- `hooks/useAuth.ts` — Auth hook with initialization
- `app/(auth)/login/index.tsx` — Login screen
- `app/(auth)/register/index.tsx` — Register screen
- `app/(tabs)/dashboard.tsx` — Protected dashboard
- `app/_layout.tsx` — Auth routing guard

## Tests

Backend tests cover:
- Registration succeeds
- Duplicate phone rejected
- Password hashing
- Login with correct/incorrect credentials
- Access token generation
- Refresh token rotation
- Session revocation
- Logout
- /users/me requires auth
- /users/me does not expose password
- Invalid JWT rejection

## Environment

Updated `.env.example` with authentication variables.

## Known Limitations

- Rate limiting uses in-memory store (not suitable for multi-instance deployment)
- Redis not yet integrated for distributed rate limiting
- Password reset not implemented
- Email verification not implemented
- No admin roles yet
