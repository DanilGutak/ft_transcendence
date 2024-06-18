from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import TwoFactorAuth

@receiver(post_save, sender=User)
def create_two_factor_auth(sender, instance, created, **kwargs):
    if created:
        TwoFactorAuth.objects.create(user=instance, two_factor_enabled=False)