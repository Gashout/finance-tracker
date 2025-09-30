from rest_framework import serializers
from .models import Budget
from transactions.models import Category
from transactions.serializers import UserSerializer, CategoryDisplaySerializer
from django.utils import timezone
from datetime import datetime


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for the Budget model with category details and user auto-assignment"""
    
    # Nested serializers for display
    category_detail = CategoryDisplaySerializer(source='category', read_only=True)
    user = UserSerializer(read_only=True)
    
    # For write operations (will accept just the ID)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=True
    )
    
    class Meta:
        model = Budget
        fields = [
            'id', 'user', 'category', 'category_detail', 'amount',
            'month', 'year', 'created_at'
        ]
        read_only_fields = ['created_at', 'user']
    
    def validate_amount(self, value):
        """Validate that amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Budget amount must be greater than zero.")
        return value
    
    def validate_month(self, value):
        """Validate that month is between 1 and 12"""
        if value < 1 or value > 12:
            raise serializers.ValidationError("Month must be between 1 and 12.")
        return value
    
    def validate_year(self, value):
        """Validate that year is not in the distant past or future"""
        current_year = timezone.now().year
        if value < current_year - 5 or value > current_year + 5:
            raise serializers.ValidationError(f"Year must be within 5 years of the current year ({current_year}).")
        return value
    
    def validate_category(self, value):
        """Validate that the category belongs to the current user"""
        if value and self.context.get('request'):
            user = self.context['request'].user
            if value.user != user:
                raise serializers.ValidationError("You can only use your own categories.")
        return value
    
    def validate(self, data):
        """Validate that a budget for this category, month and year doesn't already exist"""
        user = self.context['request'].user
        month = data.get('month')
        year = data.get('year')
        category = data.get('category')
        
        # Check if this is an update operation
        instance = getattr(self, 'instance', None)
        
        if user and month and year and category:
            # Check if budget already exists for this user, category, month, year
            query = Budget.objects.filter(user=user, category=category, month=month, year=year)
            if instance:
                query = query.exclude(pk=instance.pk)
                
            if query.exists():
                raise serializers.ValidationError({
                    "non_field_errors": ["A budget for this category in this month and year already exists."]
                })
        
        return data
    
    def create(self, validated_data):
        """Create a new budget with auto-assigned user from request"""
        # Get user from context, which will be set in the view
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update a budget, ensuring user doesn't change"""
        # Remove user from validated data if it's there
        validated_data.pop('user', None)
        return super().update(instance, validated_data)
    
    def to_representation(self, instance):
        """Add extra representation data like month name"""
        data = super().to_representation(instance)
        month_names = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April',
            5: 'May', 6: 'June', 7: 'July', 8: 'August',
            9: 'September', 10: 'October', 11: 'November', 12: 'December'
        }
        data['month_name'] = month_names.get(instance.month)
        return data
