# Authentication API

This API provides endpoints for user management and authentication.

## Technology Stack

- TypeScript: programming language
- NodeJS: JavaScript runtime
- ExpressJS: Web framework
- PostgreSQL: database engine
- Docker: container system
- Prisma ORM: database entity management
- Zod: schema and type validation
- Resend: email service

## Folder Structure

```
src/
├── app.ts
├── domain/
│   ├── entities/
│   ├── errors/
│   ├── repositories/
│   └── use-cases/
├── infrastructure/
│   ├── data/
│   ├── repositories/
│   └── services/
├── presentation/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── schemas/
│   ├── templates/
│   └── server.ts
└── shared/
    ├── config.ts
    ├── email-templates.ts
    ├── encrypt.ts
    ├── jwt.ts
    └── properties.ts
```

## Data Model

```mermaid
erDiagram
    User {
        string id PK "UUID, Primary Key"
        string name "Optional, User's first name"
        string lastName "Optional, User's last name"
        string email UK "Unique, User's email address"
        boolean verified "Default: false, Email verification status"
        string verificationCode "Optional, nanoid() for email verification"
        datetime verificationCodeExpiresAt "Optional, Verification code expiration"
        string passwordResetCode "Optional, nanoid() for password reset"
        datetime passwordResetCodeExpiresAt "Optional, Password reset code expiration"
        int failedLoginAttempts "Default: 0, Track failed login attempts"
        enum status "ACTIVE|INACTIVE|BLOCKED, User account status"
        string password "Hashed, Encrypted user password"
        string refreshTokenId "Optional, nanoid() for refresh token management"
        boolean mfaEnabled "Default: false, Multi-factor authentication status"
        string mfaSecret "Optional, TOTP secret for MFA"
        datetime createdAt "Default: now(), Record creation timestamp"
        datetime updatedAt "Default: now(), Record last update timestamp"
    }

    UserStatus {
        string ACTIVE "User account is active and can access the system"
        string INACTIVE "User account is inactive (default state)"
        string BLOCKED "User account is blocked due to security reasons"
    }

    User ||--o{ UserStatus : "has status"
```

## API Endpoints

### Authentication

| Method | URL             | Payload                                     |
| ------ | --------------- | ------------------------------------------- |
| POST   | `/auth/login`   | `{"email": "string", "password": "string"}` |
| POST   | `/auth/logout`  | -                                           |
| POST   | `/auth/refresh` | -                                           |
| GET    | `/auth/me`      | -                                           |

### Users

| Method | URL                                               | Payload                                                                                                          |
| ------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| POST   | `/user/register`                                  | `{"email": "string", "password": "string", "confirmPassword": "string", "name": "string", "lastName": "string"}` |
| GET    | `/user/verify/:userId/:verificationCode`          | -                                                                                                                |
| POST   | `/user/forgot-password`                           | `{"email": "string"}`                                                                                            |
| POST   | `/user/reset-password/:userId/:passwordResetCode` | `{"password": "string", "confirmPassword": "string", "code": "string"}`                                          |

### Multi-Factor Authentication (MFA)

| Method | URL           | Payload               |
| ------ | ------------- | --------------------- |
| POST   | `/mfa/setup`  | -                     |
| POST   | `/mfa/verify` | `{"token": "string"}` |
| POST   | `/mfa/reset`  | -                     |
