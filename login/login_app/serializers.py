from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.validators import EmailValidator
from django.contrib.auth import authenticate

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, max_length=150,required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, max_length=150,required=True)
    username = serializers.CharField(max_length=150,required=True, validators=[UniqueValidator(queryset=User.objects.all()), UnicodeUsernameValidator()])
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all()), EmailValidator()])
    class Meta:
        model = User
        fields = ['username','email', 'password', 'password2']
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Password fields did not match'})
        return attrs
    def create(self, validated_data):
        user = User.objects.create(username=validated_data['username'], email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        return user
# validatation for login attempt
class LoginSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=150,required=True)
    password = serializers.CharField(max_length=150,required=True)
    class Meta:
        model = User
        fields = ['username','password']
    #idk what to add here yet
    