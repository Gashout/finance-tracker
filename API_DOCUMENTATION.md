# Finance Tracker API Documentation

This document provides a comprehensive overview of the Finance Tracker API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:8000/api/
```

For production, this would be replaced with your domain name.

## Authentication

The API uses token-based authentication. Most endpoints require authentication except for user registration, login, and password reset.

### Authentication Header

Include the token in the Authorization header for authenticated requests:

```
Authorization: Token <your-token-here>
```

### Obtaining a Token

To obtain an authentication token, use the login endpoint.

## API Endpoints

### Authentication Endpoints

#### Register User

```
POST /auth/register/
```

Creates a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

**Status Codes:**
- `201 Created`: User successfully created
- `400 Bad Request`: Validation error

#### Login

```
POST /auth/login/
```

Authenticates a user and returns a token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

**Status Codes:**
- `200 OK`: Login successful
- `400 Bad Request`: Invalid credentials

#### Logout

```
POST /auth/logout/
```

Invalidates the user's authentication token.

**Headers:**
- `Authorization: Token <token>`

**Response:**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

**Status Codes:**
- `200 OK`: Logout successful
- `400 Bad Request`: Token not found
- `401 Unauthorized`: Authentication required

#### User Profile

```
GET /auth/profile/
```

Retrieves the authenticated user's profile.

**Headers:**
- `Authorization: Token <token>`

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Authentication required

```
PUT /auth/profile/
```

Updates the authenticated user's profile.

**Headers:**
- `Authorization: Token <token>`

**Request Body:**
```json
{
  "first_name": "Johnny",
  "last_name": "Doe",
  "email": "johnny@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "johnny@example.com",
    "first_name": "Johnny",
    "last_name": "Doe"
  }
}
```

**Status Codes:**
- `200 OK`: Profile updated successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required

#### Password Change

```
POST /auth/change-password/
```

Changes the authenticated user's password.

**Headers:**
- `Authorization: Token <token>`

**Request Body:**
```json
{
  "old_password": "securepassword123",
  "new_password": "evenmoresecure456"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password changed successfully",
  "token": "new-token-after-password-change"
}
```

**Status Codes:**
- `200 OK`: Password changed successfully
- `400 Bad Request`: Invalid old password or validation error
- `401 Unauthorized`: Authentication required

#### Password Reset

```
POST /auth/password-reset/
```

Initiates the password reset process by sending an email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset email sent"
}
```

**Status Codes:**
- `200 OK`: Email sent (or would be sent if email exists)
- `400 Bad Request`: Validation error

```
POST /auth/password-reset-confirm/{uid}/{token}/
```

Confirms the password reset and sets a new password.

**Request Body:**
```json
{
  "new_password1": "newpassword123",
  "new_password2": "newpassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password has been reset successfully"
}
```

**Status Codes:**
- `200 OK`: Password reset successful
- `400 Bad Request`: Validation error or invalid token

#### CSRF Token

```
GET /auth/csrf-token/
```

Returns a CSRF token for use in forms.

**Response:**
```json
{
  "csrfToken": "token-value",
  "message": "CSRF token generated successfully"
}
```

**Status Codes:**
- `200 OK`: Token generated successfully

### Transaction Endpoints

#### List Transactions

```
GET /transactions/
```

Returns a paginated list of the authenticated user's transactions.

**Headers:**
- `Authorization: Token <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Number of items per page (default: 10)
- `start_date`: Filter by start date (YYYY-MM-DD)
- `end_date`: Filter by end date (YYYY-MM-DD)
- `category`: Filter by category ID
- `transaction_type`: Filter by transaction type (IN, EX, TR)
- `search`: Search in description field
- `ordering`: Field to order by (e.g., -date for descending date)

**Response:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/transactions/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 1,
      "category": 2,
      "category_detail": {
        "id": 2,
        "name": "Groceries"
      },
      "amount": "45.67",
      "description": "Weekly grocery shopping",
      "date": "2025-09-25",
      "transaction_type": "EX",
      "created_at": "2025-09-25T14:30:45Z"
    },
    // More transactions...
  ]
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Authentication required

#### Create Transaction

```
POST /transactions/
```

Creates a new transaction.

**Headers:**
- `Authorization: Token <token>`

**Request Body:**
```json
{
  "category": 2,
  "amount": "45.67",
  "description": "Weekly grocery shopping",
  "date": "2025-09-25",
  "transaction_type": "EX"
}
```

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "category": 2,
  "category_detail": {
    "id": 2,
    "name": "Groceries"
  },
  "amount": "45.67",
  "description": "Weekly grocery shopping",
  "date": "2025-09-25",
  "transaction_type": "EX",
  "created_at": "2025-09-25T14:30:45Z"
}
```

**Status Codes:**
- `201 Created`: Transaction created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required

#### Retrieve Transaction

```
GET /transactions/{id}/
```

Retrieves a specific transaction.

**Headers:**
- `Authorization: Token <token>`

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "category": 2,
  "category_detail": {
    "id": 2,
    "name": "Groceries"
  },
  "amount": "45.67",
  "description": "Weekly grocery shopping",
  "date": "2025-09-25",
  "transaction_type": "EX",
  "created_at": "2025-09-25T14:30:45Z"
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Transaction not found

#### Update Transaction

```
PUT /transactions/{id}/
```

Updates a specific transaction.

**Headers:**
- `Authorization: Token <token>`

**Request Body:**
```json
{
  "category": 2,
  "amount": "50.00",
  "description": "Updated grocery shopping",
  "date": "2025-09-25",
  "transaction_type": "EX"
}
```

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "category": 2,
  "category_detail": {
    "id": 2,
    "name": "Groceries"
  },
  "amount": "50.00",
  "description": "Updated grocery shopping",
  "date": "2025-09-25",
  "transaction_type": "EX",
  "created_at": "2025-09-25T14:30:45Z"
}
```

**Status Codes:**
- `200 OK`: Transaction updated successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Transaction not found

#### Delete Transaction

```
DELETE /transactions/{id}/
```

Deletes a specific transaction.

**Headers:**
- `Authorization: Token <token>`

**Response:**
```
204 No Content
```

**Status Codes:**
- `204 No Content`: Transaction deleted successfully
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Transaction not found

### Category Endpoints

#### List Categories

```
GET /transactions/categories/
```

Returns a list of the authenticated user's categories.

**Headers:**
- `Authorization: Token <token>`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Groceries",
    "user": 1,
    "created_at": "2025-09-20T10:15:30Z"
  },
  {
    "id": 2,
    "name": "Utilities",
    "user": 1,
    "created_at": "2025-09-20T10:16:45Z"
  }
]
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Authentication required

#### Create Category

```
POST /transactions/categories/
```

Creates a new category.

**Headers:**
- `Authorization: Token <token>`

**Request Body:**
```json
{
  "name": "Entertainment"
}
```

**Response:**
```json
{
  "id": 3,
  "name": "Entertainment",
  "user": 1,
  "created_at": "2025-09-28T08:45:12Z"
}
```

**Status Codes:**
- `201 Created`: Category created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required

#### Retrieve Category

```
GET /transactions/categories/{id}/
```

Retrieves a specific category.

**Headers:**
- `Authorization: Token <token>`

**Response:**
```json
{
  "id": 3,
  "name": "Entertainment",
  "user": 1,
  "created_at": "2025-09-28T08:45:12Z"
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Category not found

#### Update Category

```
PUT /transactions/categories/{id}/
```

Updates a specific category.

**Headers:**
- `Authorization: Token <token>`

**Request Body:**
```json
{
  "name": "Movies & Entertainment"
}
```

**Response:**
```json
{
  "id": 3,
  "name": "Movies & Entertainment",
  "user": 1,
  "created_at": "2025-09-28T08:45:12Z"
}
```

**Status Codes:**
- `200 OK`: Category updated successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Category not found

#### Delete Category

```
DELETE /transactions/categories/{id}/
```

Deletes a specific category.

**Headers:**
- `Authorization: Token <token>`

**Response:**
```
204 No Content
```

**Status Codes:**
- `204 No Content`: Category deleted successfully
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Category not found

### Budget Endpoints

#### List Budgets

```
GET /budgets/
```

Returns a paginated list of the authenticated user's budgets.

**Headers:**
- `Authorization: Token <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Number of items per page (default: 10)
- `month`: Filter by month (1-12)
- `year`: Filter by year (e.g., 2025)
- `category`: Filter by category ID

**Response:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 1,
      "category": 2,
      "category_detail": {
        "id": 2,
        "name": "Groceries"
      },
      "amount": "300.00",
      "month": 9,
      "year": 2025,
      "created_at": "2025-09-01T10:00:00Z"
    },
    // More budgets...
  ]
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Authentication required

#### Create Budget

```
POST /budgets/
```

Creates a new budget.

**Headers:**
- `Authorization: Token <token>`

**Request Body:**
```json
{
  "category": 2,
  "amount": "300.00",
  "month": 9,
  "year": 2025
}
```

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "category": 2,
  "category_detail": {
    "id": 2,
    "name": "Groceries"
  },
  "amount": "300.00",
  "month": 9,
  "year": 2025,
  "created_at": "2025-09-28T09:15:30Z"
}
```

**Status Codes:**
- `201 Created`: Budget created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required

#### Retrieve Budget

```
GET /budgets/{id}/
```

Retrieves a specific budget.

**Headers:**
- `Authorization: Token <token>`

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "category": 2,
  "category_detail": {
    "id": 2,
    "name": "Groceries"
  },
  "amount": "300.00",
  "month": 9,
  "year": 2025,
  "created_at": "2025-09-28T09:15:30Z"
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Budget not found

#### Update Budget

```
PUT /budgets/{id}/
```

Updates a specific budget.

**Headers:**
- `Authorization: Token <token>`

**Request Body:**
```json
{
  "category": 2,
  "amount": "350.00",
  "month": 9,
  "year": 2025
}
```

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "category": 2,
  "category_detail": {
    "id": 2,
    "name": "Groceries"
  },
  "amount": "350.00",
  "month": 9,
  "year": 2025,
  "created_at": "2025-09-28T09:15:30Z"
}
```

**Status Codes:**
- `200 OK`: Budget updated successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Budget not found

#### Delete Budget

```
DELETE /budgets/{id}/
```

Deletes a specific budget.

**Headers:**
- `Authorization: Token <token>`

**Response:**
```
204 No Content
```

**Status Codes:**
- `204 No Content`: Budget deleted successfully
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Budget not found

## Error Responses

The API returns consistent error responses across all endpoints:

### Validation Error

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "field_name": [
      "Error message for this field"
    ]
  }
}
```

### Authentication Error

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Permission Error

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Not Found Error

```json
{
  "detail": "Not found."
}
```

## Pagination

List endpoints return paginated results with the following structure:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=3",
  "previous": "http://localhost:8000/api/endpoint/?page=1",
  "results": [
    // Array of items
  ]
}
```

- `count`: Total number of items
- `next`: URL to the next page (null if there is no next page)
- `previous`: URL to the previous page (null if there is no previous page)
- `results`: Array of items for the current page

## Filtering and Sorting

Many endpoints support filtering and sorting through query parameters:

- Filtering: `?field_name=value`
- Multiple filters: `?field1=value1&field2=value2`
- Date range: `?start_date=2025-01-01&end_date=2025-12-31`
- Sorting: `?ordering=field_name` (prefix with `-` for descending order)

## Rate Limiting

The API implements rate limiting to prevent abuse:

- Anonymous users: 20 requests per hour
- Authenticated users: 100 requests per minute

When the rate limit is exceeded, the API returns a `429 Too Many Requests` response with a `Retry-After` header indicating when the client can make the next request.

## API Versioning

The API does not currently implement versioning, but future versions will be accessible via URL path versioning:

```
/api/v2/endpoint/
```

## Testing the API

You can test the API using tools like:

1. The Django REST Framework browsable API (available when accessing endpoints via a browser)
2. Postman or Insomnia REST clients
3. curl command-line tool

Example curl command for login:

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "password": "securepassword123"}'
```

Example curl command for authenticated request:

```bash
curl http://localhost:8000/api/transactions/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

## Conclusion

This API documentation provides a comprehensive overview of the Finance Tracker API. For more detailed information about specific endpoints or features, please refer to the inline code documentation or contact the development team.
