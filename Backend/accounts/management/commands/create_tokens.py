from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = 'Create tokens for all users who don\'t have one'

    def handle(self, *args, **options):
        users_without_tokens = User.objects.filter(auth_token__isnull=True)
        created_count = 0
        
        for user in users_without_tokens:
            Token.objects.create(user=user)
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Created token for user: {user.username}')
            )
        
        if created_count == 0:
            self.stdout.write(
                self.style.WARNING('All users already have tokens')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Created {created_count} tokens')
            )
