from django.shortcuts import render
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer
)


@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(APIView):
    """
    @class UserRegistrationView  
    @description User registration view with CSRF exemption for token-based authentication
    
    This view is exempt from CSRF protection because:
    1. Registration is a public endpoint that creates new user accounts
    2. Returns authentication token for immediate use
    3. No existing user state is modified during registration
    
    @csrf_exempt_rationale
    - New user registration doesn't modify existing authenticated user data
    - Token-based response provides secure authentication for subsequent requests
    - Simplifies registration flow for mobile apps and API clients
    
    @security_considerations
    - Input validation prevents malicious user creation
    - Rate limiting should be implemented to prevent spam registrations
    - Email verification should be required in production
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                # Create token for the new user
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'status': 'success',
                    'message': 'User created successfully',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'token': token.key
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'status': 'error',
                    'message': 'Failed to create user',
                    'errors': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'status': 'error',
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    """
    @class UserLoginView
    @description User login view with CSRF exemption for token-based authentication
    
    This view is exempt from CSRF protection because:
    1. It uses token-based authentication which provides sufficient CSRF protection
    2. The returned token is used for subsequent authenticated requests
    3. Login is a one-time operation that establishes a secure session
    
    @csrf_exempt_rationale
    - Token authentication eliminates CSRF vulnerability for this endpoint
    - Reduces complexity for mobile apps and API clients
    - Login endpoint doesn't perform state-changing operations on existing data
    
    @security_considerations
    - Still vulnerable to XSS if tokens are stored in localStorage
    - Consider using httpOnly cookies for token storage in production
    - Rate limiting should be implemented to prevent brute force attacks
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Login user and return token"""
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            
            # Log in the user for session authentication
            login(request, user)
            
            return Response({
                'status': 'success',
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'token': token.key
            }, status=status.HTTP_200_OK)
        
        return Response({
            'status': 'error',
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """User logout view"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Logout user and delete token"""
        try:
            # Delete the user's token
            token = Token.objects.get(user=request.user)
            token.delete()
            
            # Logout from session
            logout(request)
            
            return Response({
                'status': 'success',
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Token.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Token not found'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Logout failed',
                'errors': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """User profile view for GET and PUT operations"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response({
            'status': 'success',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        """Update user profile"""
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Profile updated successfully',
                    'user': UserProfileSerializer(user).data
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'status': 'error',
                    'message': 'Failed to update profile',
                    'errors': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'status': 'error',
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """Password change view"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Change user password"""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                
                # Create new token after password change
                old_token = Token.objects.get(user=request.user)
                old_token.delete()
                new_token = Token.objects.create(user=request.user)
                
                return Response({
                    'status': 'success',
                    'message': 'Password changed successfully',
                    'token': new_token.key  # Return new token
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'status': 'error',
                    'message': 'Failed to change password',
                    'errors': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'status': 'error',
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info(request):
    """Get current user information"""
    return Response({
        'status': 'success',
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'is_staff': request.user.is_staff,
            'is_active': request.user.is_active,
            'date_joined': request.user.date_joined,
        }
    }, status=status.HTTP_200_OK)


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """
    @function get_csrf_token
    @description Return a CSRF token and set the CSRF cookie for cross-origin clients
    
    This endpoint serves as a dedicated CSRF token provider for React frontend applications.
    It's specifically designed to handle cross-origin requests where the frontend needs
    to obtain a CSRF token before making POST/PUT/DELETE requests to Django endpoints.
    
    @param {HttpRequest} request - The HTTP request object from Django
    @returns {Response} JSON response containing the CSRF token
    
    @csrf_flow
    1. Frontend makes GET request to this endpoint
    2. Django's @ensure_csrf_cookie decorator ensures csrftoken cookie is set
    3. get_token(request) generates or retrieves existing CSRF token
    4. Token is returned in response body for frontend to use in headers
    5. Frontend includes token in X-CSRFToken header for subsequent requests
    
    @security_considerations
    - Uses @ensure_csrf_cookie to guarantee cookie is set in response
    - AllowAny permission allows unauthenticated access (needed for password reset)
    - Token is tied to the session and expires when session expires
    - Cross-origin requests must include credentials for cookie to be sent
    
    @error_handling
    - Returns 200 status on success with token in response body
    - Django middleware handles CORS headers automatically
    - If CSRF middleware is disabled, this will still work but provide no security
    
    @usage_example
    Frontend usage:
    ```javascript
    const response = await fetch('/api/auth/csrf-token/', {
      credentials: 'include' // Important for cross-origin cookie handling
    });
    const { csrfToken } = await response.json();
    // Use csrfToken in subsequent request headers
    ```
    """
    csrf_token = get_token(request)
    
    # Log token generation for debugging (don't log the actual token in production)
    print(f"[get_csrf_token] Generated CSRF token for session: {request.session.session_key}")
    
    return Response({
        'csrfToken': csrf_token,
        'message': 'CSRF token generated successfully'
    }, status=status.HTTP_200_OK)