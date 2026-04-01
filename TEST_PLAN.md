# UI Test Plan (SADAD Web)

## Auth
1. Login with valid credentials -> redirect to dashboard.
2. Login with invalid credentials -> error banner.
3. Register with valid data -> login success -> dashboard.
4. Reset password flow -> token -> new password -> login.
5. Access `/dashboard` without session -> redirect to `/login?redirect=...`.

## Dashboard
1. Summary cards load without errors.
2. Recent activity table shows data and empty state when none.
3. Language toggle updates direction and labels.
4. Theme toggle persists.

## Customers
1. List loads with pagination.
2. Search filters results.
3. Empty state shown when no items.
4. Create customer -> appears in list.

## Debts
1. Create debt -> appears with correct status/type.
2. Debt details show installments and guarantor.
3. Empty state shown when no items.

## Reminders
1. Overdue list renders with actions.
2. Upcoming list renders.
3. Sent list renders.
4. Empty states show correctly.

## Settings
1. Update profile data.
2. Update store settings.
3. Change password with validation.

## Associations
1. Create association -> appears in list.
2. Edit association -> updates values.
3. Empty state when list is empty.
