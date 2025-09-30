# Finance Tracker

A comprehensive personal finance management application with expense tracking, budgeting, and financial analytics. Built with Django REST Framework backend and React TypeScript frontend.

![Finance Tracker](https://via.placeholder.com/800x400?text=Finance+Tracker)

## Features

- **User Authentication**: Secure login, registration, and password reset functionality
- **Transaction Management**: Track income, expenses, and transfers with categorization
- **Budget Planning**: Set monthly budgets by category with progress tracking
- **Category Management**: Create and manage custom transaction categories
- **Dashboard Analytics**: Visual overview of financial status and spending patterns
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Modern UI**: Clean interface built with Tailwind CSS and shadcn/ui components

## Technology Stack

### Backend
- Django 4.2.x
- Django REST Framework 3.15.x
- SQLite (development) / PostgreSQL (production-ready)
- Token-based authentication
- Python 3.8+

### Frontend
- React 19.x with TypeScript
- React Router for navigation
- Axios for API communication
- Tailwind CSS for styling
- shadcn/ui component library
- React Hook Form for form handling

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16.x or higher
- npm 8.x or higher

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Gashout/finance_tracker.git
   cd finance_tracker
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root with the following variables:
   ```
   SECRET_KEY=your-secret-key
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

5. Apply migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. (Optional) Load sample data:
   ```bash
   python create_test_data.py
   ```

8. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

The API will be available at http://localhost:8000/api/

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000/

## Project Structure

### Backend (Django)

```
finance_tracker/
├── accounts/              # User authentication and profile management
├── transactions/          # Transaction models, views, and serializers
├── budgets/               # Budget models, views, and serializers
├── finance_tracker/       # Project settings and main URL configuration
└── manage.py              # Django management script
```

### Frontend (React)

```
frontend/
├── public/                # Static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── layout/        # Layout components (Header, Sidebar)
│   │   └── ui/            # UI components from shadcn/ui
│   ├── context/           # React context providers
│   ├── pages/             # Page components
│   │   ├── budgets/       # Budget management pages
│   │   ├── categories/    # Category management pages
│   │   └── transactions/  # Transaction management pages
│   ├── services/          # API service functions
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
└── package.json           # Frontend dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and receive authentication token
- `POST /api/auth/logout/` - Logout and invalidate token
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/password-reset/` - Request password reset
- `POST /api/auth/password-reset-confirm/{uid}/{token}/` - Confirm password reset

### Transactions
- `GET /api/transactions/` - List transactions
- `POST /api/transactions/` - Create transaction
- `GET /api/transactions/{id}/` - Retrieve transaction
- `PUT /api/transactions/{id}/` - Update transaction
- `DELETE /api/transactions/{id}/` - Delete transaction
- `GET /api/transactions/categories/` - List categories

### Budgets
- `GET /api/budgets/` - List budgets
- `POST /api/budgets/` - Create budget
- `GET /api/budgets/{id}/` - Retrieve budget
- `PUT /api/budgets/{id}/` - Update budget
- `DELETE /api/budgets/{id}/` - Delete budget

## Testing

### Backend Tests

Run the Django test suite:
```bash
python manage.py test
```

### Frontend Tests

Run the React test suite:
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment

The Django application is ready for deployment on platforms like Heroku, AWS, or DigitalOcean. For production, make sure to:

1. Set `DEBUG=False` in your environment variables
2. Configure a production database (PostgreSQL recommended)
3. Set up proper CORS and CSRF settings for your production domain
4. Configure a production-ready web server (Gunicorn, uWSGI)

### Frontend Deployment

The React application can be deployed to Netlify, Vercel, or any static hosting service:

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the contents of the `build` directory to your hosting provider

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Django](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
# finance-tracker
# finance-tracker
