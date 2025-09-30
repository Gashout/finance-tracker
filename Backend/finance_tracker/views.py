from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions


class APIRootView(APIView):
    """Root view for the API"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Return API endpoints information"""
        data = {
            'status': 'success',
            'message': 'Welcome to Finance Tracker API',
            'endpoints': {
                'auth': {
                    'register': request.build_absolute_uri('/api/auth/register/'),
                    'login': request.build_absolute_uri('/api/auth/login/'),
                    'logout': request.build_absolute_uri('/api/auth/logout/'),
                    'profile': request.build_absolute_uri('/api/auth/profile/'),
                    'change_password': request.build_absolute_uri('/api/auth/change-password/'),
                    'user_info': request.build_absolute_uri('/api/auth/me/'),
                },
                'transactions': request.build_absolute_uri('/api/transactions/'),
                'categories': request.build_absolute_uri('/api/transactions/categories/'),
                'budgets': request.build_absolute_uri('/api/budgets/budgets/'),
                # 'docs': request.build_absolute_uri('/docs/'),
            }
        }
        return Response(data, status=status.HTTP_200_OK)
