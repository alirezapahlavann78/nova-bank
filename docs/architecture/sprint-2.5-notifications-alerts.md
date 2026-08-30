# Sprint 2.5 — Notifications, Budget Alerts & Goal Milestones

## Scope
Implement notifications foundation, notification center, budget alerts, goal milestone notifications, notification preferences, read/unread management, and integration with existing financial modules.

## Database Changes
- Added `Notification` model with type, title, body, data (JSON), isRead, readAt
- Added `NotificationPreference` model with user-specific alert toggles
- Added `NotificationType` enum with BUDGET_WARNING, BUDGET_EXCEEDED, GOAL_MILESTONE, GOAL_COMPLETED, TRANSACTION_CREATED, TRANSFER_COMPLETED, SYSTEM
- Updated `Device` model with `@@unique([deviceId])`
- All relations scoped to authenticated user

## Notification Model
- Fields: id, userId, type, title, body, data (JSON, optional), isRead, readAt, createdAt, updatedAt
- Owned by single user
- No sensitive auth data stored
- Indexed for efficient user queries

## NotificationPreference Model
- Fields: id, userId (unique), budgetAlerts, goalAlerts, transactionAlerts, transferAlerts, systemAlerts, pushEnabled, timestamps
- Default values: budgetAlerts=true, goalAlerts=true, transactionAlerts=false, transferAlerts=false, systemAlerts=true, pushEnabled=true
- One preference record per user

## Budget Alerts
- Triggered after EXPENSE transaction creation
- 80% warning: BUDGET_WARNING when spending reaches 80%+ of budget amount
- 100% exceeded: BUDGET_EXCEEDED when spending >= budget amount
- Duplicate prevention via server-side notification deduplication
- Respects user notification preferences
- Only counts EXPENSE transactions; INCOME and TRANSFER excluded

## Goal Milestones
- Triggered after goal progress update
- 25%, 50%, 75% milestones: GOAL_MILESTONE notifications
- 100% completion: GOAL_COMPLETED notification
- Duplicate prevention via server-side notification deduplication
- Respects user notification preferences

## Transaction Integration
- TRANSACTION_CREATED notification after successful transaction creation
- Only when transactionAlerts preference is enabled
- Notification failure does not corrupt transaction

## Transfer Integration
- TRANSFER_COMPLETED notification after successful atomic transfer
- Only when transferAlerts preference is enabled
- Notification created inside the same transaction to maintain atomicity

## Notification Deduplication
- Server-side deterministic deduplication using notification type + data key/value
- Prevents duplicate budget warnings, exceeded alerts, and goal milestones
- Uses `hasNotification` service method before creating new notifications

## API Endpoints

### Notifications
- GET /notifications — List own notifications (paginated, newest first)
- GET /notifications/:id — Get one notification
- PATCH /notifications/:id/read — Mark as read
- PATCH /notifications/read-all — Mark all as read
- DELETE /notifications/:id — Delete notification

### Notification Preferences
- GET /notifications/preferences — Get user preferences
- PATCH /notifications/preferences — Update user preferences

## Mobile Integration
- Services: notifications.ts
- Hooks: useNotifications, useNotificationPreferences
- Screens: notifications/index, notifications/[id], notifications/preferences
- Dashboard updated with notifications tab
- Persian RTL UI throughout

## Security Decisions
- userId derived from JWT, never from client
- Every query scoped to authenticated user
- Cross-user access returns NotFoundException
- No sensitive auth data in notifications
- Financial calculations remain server-side
- Notification preferences ownership enforced

## Tests
- Notifications controller tests
- Notifications service tests
- Notification preferences controller tests
- All existing tests preserved

## Migration Status
- Migration SQL created at apps/api/prisma/migrations/0.2.5_add_notifications/migration.sql
- Prisma schema validation: PASS
- Prisma Client generation: PASS
- PostgreSQL unavailable — migration execution BLOCKED

## Known Limitations
- No actual push notification delivery (FCM/APNs not implemented)
- No email/SMS notifications
- No notification scheduling
- No rich media notifications

## Explicitly Deferred Features
- Firebase/FCM/APNs push delivery
- SMS/Email/WhatsApp notifications
- Notification scheduling
- Rich media attachments
- Notification analytics