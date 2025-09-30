from django.shortcuts import render
from rest_framework import viewsets, filters, permissions
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Budget
from .serializers import BudgetSerializer
from transactions.views import StandardResultsSetPagination


class BudgetFilter(django_filters.FilterSet):
    category = django_filters.NumberFilter(field_name='category')
    min_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    month = django_filters.NumberFilter(field_name='month')
    year = django_filters.NumberFilter(field_name='year')
    
    class Meta:
        model = Budget
        fields = ['category', 'month', 'year', 'min_amount', 'max_amount']


class BudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Budget instances.
    Users can only see their own budgets.
    """
    serializer_class = BudgetSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BudgetFilter
    search_fields = ['category__name']
    ordering_fields = ['year', 'month', 'amount', 'category__name']
    ordering = ['-year', '-month']
    
    def get_queryset(self):
        """
        This view should return a list of all budgets
        for the currently authenticated user.
        """
        return Budget.objects.filter(user=self.request.user)