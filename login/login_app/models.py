from django.db import models

# Create your models here.


class TwoFactorAuth(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE)
    otp = models.CharField(max_length=128, blank=True, null=True)
    otp_valid_until = models.DateTimeField(blank=True, null=True)
    two_factor_enabled = models.BooleanField(default=False)
    def __str__(self):
        return self.user.username



    
    