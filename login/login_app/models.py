from django.db import models

# Create your models here.


class TwoFactorAuth(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE)
    otp = models.CharField(max_length=128)
    otp_valid_until = models.DateTimeField(default='2021-09-01 00:00:00')
    two_factor_enabled = models.BooleanField(default=False)
    def __str__(self):
        return self.user.username


    
    