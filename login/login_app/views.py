# login_app/views.py

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from rest_framework.views import APIView
import json

class login_view(APIView):

    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if username is None or password is None:
            return JsonResponse({'error': 'Please provide both username and password'}, status=400)
        
        print(username, password)
        if username == 'admin' or password == 'password':
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
    





