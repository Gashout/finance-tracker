# Finance Tracker - Project Structure and Dependencies

This document provides a comprehensive overview of the Finance Tracker project structure, dependencies, and deployment requirements.

## Project Structure

### Backend (Django)

```
finance_tracker/
├── accounts/                  # User authentication and profile management
│   ├── management/            # Custom management commands
│   │   └── commands/          # Command implementations
│   │       └── create_tokens.py  # Generate auth tokens for existing users
│   ├── migrations/            # Database migrations
│   ├── templates/             # HTML templates for auth flows
│   │   ├── password_reset_complete.html
│   │   ├── password_reset_confirm.html
│   │   ├── password_reset_done.html
│   │   ├── password_reset_email.html
│   │   └── password_reset.html
│   ├── admin.py               # Django admin configuration
│   ├── apps.py                # App configuration
│   ├── models.py              # Data models (extends Django User)
│   ├── serializers.py         # DRF serializers for User data
│   ├── tests.py               # Unit tests
│   ├── urls.py                # URL routing for auth endpoints
│   └── views.py               # API view implementations
│
├── transactions/              # Transaction management
│   ├── migrations/            # Database migrations
│   ├── admin.py               # Django admin configuration
│   ├── apps.py                # App configuration
│   ├── models.py              # Transaction and Category models
│   ├── serializers.py         # DRF serializers
│   ├── tests.py               # Unit tests
│   ├── urls.py                # URL routing
│   └── views.py               # API view implementations
│
├── budgets/                   # Budget management
│   ├── migrations/            # Database migrations
│   ├── admin.py               # Django admin configuration
│   ├── apps.py                # App configuration
│   ├── models.py              # Budget model
│   ├── serializers.py         # DRF serializers
│   ├── tests.py               # Unit tests
│   ├── urls.py                # URL routing
│   └── views.py               # API view implementations
│
├── finance_tracker/           # Project configuration
│   ├── settings.py            # Django settings
│   ├── urls.py                # Main URL routing
│   ├── views.py               # Project-level views (API root)
│   ├── wsgi.py                # WSGI configuration
│   └── asgi.py                # ASGI configuration
│
├── manage.py                  # Django management script
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (not in version control)
└── .env.example               # Example environment variables
```

### Frontend (React)

```
frontend/
├── public/                    # Static files
│   ├── index.html             # HTML entry point
│   ├── favicon.ico            # Favicon
│   └── manifest.json          # PWA manifest
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx     # Application header
│   │   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   │   └── Layout.tsx     # Main layout wrapper
│   │   │
│   │   └── ui/                # UI components from shadcn/ui
│   │       ├── button.tsx     # Button component
│   │       ├── card.tsx       # Card component
│   │       ├── input.tsx      # Input component
│   │       └── ...            # Other UI components
│   │
│   ├── context/               # React context providers
│   │   └── AuthContext.tsx    # Authentication context
│   │
│   ├── pages/                 # Page components
│   │   ├── budgets/           # Budget management pages
│   │   │   ├── BudgetForm.tsx # Budget creation/edit form
│   │   │   ├── BudgetList.tsx # Budget listing
│   │   │   └── BudgetPage.tsx # Budget page container
│   │   │
│   │   ├── categories/        # Category management pages
│   │   │   ├── CategoryForm.tsx       # Category form
│   │   │   └── CategoryPage.tsx       # Category page
│   │   │
│   │   ├── transactions/      # Transaction management pages
│   │   │   ├── TransactionForm.tsx    # Transaction form
│   │   │   ├── TransactionList.tsx    # Transaction listing
│   │   │   └── TransactionPage.tsx    # Transaction page
│   │   │
│   │   ├── Dashboard.tsx      # Dashboard page
│   │   ├── LoginPage.tsx      # Login page
│   │   ├── RegisterPage.tsx   # Registration page
│   │   └── PasswordResetRequest.tsx  # Password reset
│   │
│   ├── services/              # API service functions
│   │   ├── api.ts             # Base API configuration
│   │   ├── authService.ts     # Authentication services
│   │   ├── transactionService.ts  # Transaction API calls
│   │   └── budgetService.ts   # Budget API calls
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts           # Common types
│   │   └── transaction.ts     # Transaction-specific types
│   │
│   ├── utils/                 # Utility functions
│   │   └── utils.ts           # General utilities
│   │
│   ├── App.tsx                # Main application component
│   ├── index.tsx              # Application entry point
│   └── index.css              # Global styles
│
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Frontend dependencies
└── config-overrides.js        # React app configuration overrides
```

## Dependencies

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Django | 4.2.24 | Web framework |
| djangorestframework | 3.15.2 | REST API framework |
| django-cors-headers | 4.4.0 | Handle CORS for frontend communication |
| django-filter | 24.3 | Advanced filtering for API endpoints |
| python-decouple | 3.8 | Environment variable management |
| coreapi | 2.3.3 | API schema generation |
| Pillow | * | Image processing (if needed) |

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.1.1 | UI library |
| react-dom | 19.1.1 | DOM manipulation |
| typescript | 4.9.5 | Type safety |
| react-router-dom | 7.9.3 | Routing |
| axios | 1.12.2 | HTTP client |
| react-hook-form | 7.63.0 | Form handling |
| zod | 3.22.4 | Schema validation |
| tailwindcss | 3.4.17 | Utility-first CSS |
| @shadcn/ui | 0.0.4 | UI component library |
| class-variance-authority | 0.7.1 | Component styling variants |
| clsx | 2.1.1 | Conditional class names |
| lucide-react | 0.544.0 | Icon library |

## Environment Configuration

### Backend (.env)

```
# Django settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database settings (for production)
# DATABASE_URL=postgres://user:password@localhost:5432/finance_tracker

# Email settings (for production)
# EMAIL_HOST=smtp.example.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=your-email@example.com
# EMAIL_HOST_PASSWORD=your-email-password
# DEFAULT_FROM_EMAIL=noreply@financetracker.com
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_DEBUG=true
```

## Deployment Requirements

### Backend Deployment

#### System Requirements
- Python 3.8+
- PostgreSQL 12+ (for production)
- WSGI-compatible web server (Gunicorn, uWSGI)
- Nginx or similar for reverse proxy (production)

#### Deployment Steps
1. Set up a virtual environment
2. Install dependencies from requirements.txt
3. Configure environment variables for production
4. Run database migrations
5. Collect static files
6. Configure WSGI server
7. Set up reverse proxy

#### Production Settings
- Set `DEBUG=False`
- Configure a production database (PostgreSQL)
- Set up proper ALLOWED_HOSTS
- Configure CORS for production domain
- Set up HTTPS with proper certificates
- Configure email backend for password reset functionality

### Frontend Deployment

#### System Requirements
- Node.js 16+
- npm 8+

#### Deployment Steps
1. Update API URL in environment variables
2. Build the production bundle with `npm run build`
3. Deploy static files to a CDN or static file server
4. Configure routing to handle client-side routes

#### Production Settings
- Set `REACT_APP_API_URL` to production API URL
- Set `REACT_APP_DEBUG=false`
- Enable GZIP compression for static assets
- Configure cache headers for optimal performance
- Set up HTTPS with proper certificates

## Database Schema

### Core Tables

#### User (Django's built-in User model)
- id (PK)
- username
- email
- password (hashed)
- first_name
- last_name
- is_active
- is_staff
- date_joined

#### Category
- id (PK)
- name
- user_id (FK to User)
- created_at

#### Transaction
- id (PK)
- user_id (FK to User)
- category_id (FK to Category, nullable)
- amount (Decimal)
- description
- date
- transaction_type (choices: 'IN', 'EX', 'TR')
- created_at

#### Budget
- id (PK)
- user_id (FK to User)
- category_id (FK to Category)
- amount (Decimal)
- month (Integer)
- year (Integer)
- created_at

### Relationships
- User has many Categories (one-to-many)
- User has many Transactions (one-to-many)
- User has many Budgets (one-to-many)
- Category belongs to User (many-to-one)
- Category has many Transactions (one-to-many)
- Category has many Budgets (one-to-many)
- Transaction belongs to User (many-to-one)
- Transaction optionally belongs to Category (many-to-one)
- Budget belongs to User (many-to-one)
- Budget belongs to Category (many-to-one)

## Scaling Considerations

### Database Scaling
- Implement database connection pooling
- Add appropriate indexes for common queries
- Consider read replicas for high-traffic deployments
- Implement query optimization for complex reports

### Application Scaling
- Deploy multiple application servers behind a load balancer
- Implement caching for frequently accessed data
- Use asynchronous processing for reports and analytics
- Consider containerization (Docker) for consistent deployment

### Frontend Scaling
- Use a CDN for static asset delivery
- Implement code splitting for optimized loading
- Consider server-side rendering for initial page load
- Implement progressive web app features for offline capabilities
