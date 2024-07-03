from django.contrib import admin

# Register your models here.

from .models import TwoFactorAuth

admin.site.register(TwoFactorAuth)

