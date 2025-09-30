from django.shortcuts import render
from rest_framework import viewsets, filters, permissions
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return obj.user == request.user

        # Write permissions are only allowed to the owner of the object
        return obj.user == request.user


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CategoryFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Category
        fields = ['name']


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Category instances.
    Users can only see their own categories.
    """
    serializer_class = CategorySerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CategoryFilter
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        """
        This view should return a list of all categories
        for the currently authenticated user.
        """
        return Category.objects.filter(user=self.request.user)


class TransactionFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name='category')
    min_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    start_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    transaction_type = django_filters.ChoiceFilter(choices=Transaction.TransactionType.choices)
    
    class Meta:
        model = Transaction
        fields = ['category', 'transaction_type', 'min_amount', 'max_amount', 'start_date', 'end_date']


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Transaction instances.
    Users can only see their own transactions.
    """
    serializer_class = TransactionSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TransactionFilter
    search_fields = ['description', 'category__name']
    ordering_fields = ['date', 'amount', 'created_at', 'category__name']
    ordering = ['-date']
    
    def get_queryset(self):
        """
        This view should return a list of all transactions
        for the currently authenticated user.
        """
        return Transaction.objects.filter(user=self.request.user)