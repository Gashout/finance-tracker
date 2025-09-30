from django.contrib import admin
from .models import Category, Transaction

# Register your models here.

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    list_filter = ('user', 'created_at')
    search_fields = ('name', 'user__username')
    ordering = ('name',)
    readonly_fields = ('created_at',)
    
    def get_queryset(self, request):
        """Filter categories to show only those belonging to the current user for non-superusers"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)
    
    def save_model(self, request, obj, form, change):
        """Automatically set the user to the current user when creating a category"""
        if not change:  # Only when creating
            obj.user = request.user
        super().save_model(request, obj, form, change)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'transaction_type', 'category', 'user', 'date', 'created_at')
    list_filter = ('transaction_type', 'category', 'user', 'date', 'created_at')
    search_fields = ('description', 'user__username', 'category__name')
    date_hierarchy = 'date'
    ordering = ('-date', '-created_at')
    readonly_fields = ('created_at',)
    list_per_page = 20
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('user', 'description', 'amount', 'transaction_type', 'date')
        }),
        ('Category', {
            'fields': ('category',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter transactions to show only those belonging to the current user for non-superusers"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filter category choices to show only categories belonging to the current user"""
        if db_field.name == "category":
            if not request.user.is_superuser:
                kwargs["queryset"] = Category.objects.filter(user=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def save_model(self, request, obj, form, change):
        """Automatically set the user to the current user when creating a transaction"""
        if not change:  # Only when creating
            obj.user = request.user
        super().save_model(request, obj, form, change)