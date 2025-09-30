from rest_framework import serializers
from .models import Category, Transaction
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - used for nested display"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = fields


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for the Category model with user auto-assignment"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'user', 'created_at']
        read_only_fields = ['created_at', 'user']
    
    def validate_name(self, value):
        """Validate that category name is not empty or too short"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long.")
        return value.strip()
    
    def create(self, validated_data):
        """Create a new category with auto-assigned user from request"""
        # Get user from context, which will be set in the view
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class CategoryDisplaySerializer(serializers.ModelSerializer):
    """Simplified Category serializer for nested display"""
    
    class Meta:
        model = Category
        fields = ['id', 'name']


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for the Transaction model with nested category display and user auto-assignment"""
    
    # Nested serializers for display
    category_detail = CategoryDisplaySerializer(source='category', read_only=True)
    user = UserSerializer(read_only=True)
    
    # For write operations (will accept just the ID)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'category', 'category_detail', 'amount', 
            'description', 'date', 'transaction_type', 'created_at'
        ]
        read_only_fields = ['created_at', 'user']
    
    def validate_amount(self, value):
        """Validate that amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
    
    def validate_description(self, value):
        """Validate that description is not empty"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Description must be at least 2 characters long.")
        return value.strip()
    
    def validate_category(self, value):
        """Validate that the category belongs to the current user"""
        if value and self.context.get('request'):
            user = self.context['request'].user
            if value.user != user:
                raise serializers.ValidationError("You can only use your own categories.")
        return value
    
    def create(self, validated_data):
        """Create a new transaction with auto-assigned user from request"""
        # Get user from context, which will be set in the view
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update a transaction, ensuring user doesn't change"""
        # Remove user from validated data if it's there
        validated_data.pop('user', None)
        return super().update(instance, validated_data)
