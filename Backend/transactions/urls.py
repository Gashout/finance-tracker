from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TransactionViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]
