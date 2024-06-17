# login_app/views.py

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from .serializers import RegisterSerializer , LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import TwoFactorAuth
import json

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({'message': 'User created successfully'}, status=201)
        return JsonResponse(serializer.errors, status=400)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.data['username']
            password = serializer.data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                refresh = RefreshToken.for_user(user)
                return JsonResponse({'refresh': str(refresh), 'access': str(refresh.access_token)}, status=200)
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
        return JsonResponse(serializer.errors, status=400)
            
        
        
        





