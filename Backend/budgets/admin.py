from django.contrib import admin
from .models import Budget
from transactions.models import Category

# Register your models here.

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'month', 'year', 'user', 'created_at')
    list_filter = ('user', 'category', 'year', 'month', 'created_at')
    search_fields = ('category__name', 'user__username')
    ordering = ('-year', '-month', 'category__name')
    readonly_fields = ('created_at',)
    list_per_page = 20
    
    fieldsets = (
        ('Budget Details', {
            'fields': ('user', 'category', 'amount')
        }),
        ('Period', {
            'fields': ('month', 'year')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Filter budgets to show only those belonging to the current user for non-superusers"""
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
        """Automatically set the user to the current user when creating a budget"""
        if not change:  # Only when creating
            obj.user = request.user
        super().save_model(request, obj, form, change)
    
    def get_month_display(self, obj):
        """Display month name instead of number"""
        month_names = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April',
            5: 'May', 6: 'June', 7: 'July', 8: 'August',
            9: 'September', 10: 'October', 11: 'November', 12: 'December'
        }
        return month_names.get(obj.month, obj.month)
    get_month_display.short_description = 'Month'