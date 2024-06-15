from django.db import models
from django.contrib.auth.hashers import make_password, check_password

# Create your models here.

class User(models.Model):
    username = models.CharField("username", max_length=100)
    password = models.CharField("password", max_length=100)
    def __str__(self):
        return self.username    
    def set_password(self, password):
        self.password = make_password(password)
    def check_password(self, password):
        return check_password(password, self.password)
