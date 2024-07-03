# login_app/views.py

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from .serializers import RegisterSerializer , LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

from django.utils.crypto import get_random_string
from django.utils import timezone
from django.core.mail import send_mail
from .models import TwoFactorAuth
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
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
                if TwoFactorAuth.objects.get(user=user).two_factor_enabled:
                    return JsonResponse({'message': 'Two factor authentication required'}, status=201)
                refresh = RefreshToken.for_user(user)
                return JsonResponse({'refresh': str(refresh), 'access': str(refresh.access_token)}, status=200)
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
        return JsonResponse(serializer.errors, status=400)
    
# 
class SendTwoFactorAuthView(APIView):
    def post(self, request):
        data = json.loads(request.body)
        user = authenticate(username=data['username'], password=data['password'])
        if user is not None:
            # Generate OTP
            otp = get_random_string(length=6, allowed_chars='1234567890')
            # Save OTP to the database
            two_factor_auth = TwoFactorAuth.objects.get(user=user)
            two_factor_auth.otp = make_password(otp)
            two_factor_auth.otp_valid_until = timezone.now() + timezone.timedelta(minutes=5)
            two_factor_auth.save()
            # Send OTP to user's email
            send_mail(
                'Your OTP',
                f'Your OTP is {otp}',
                settings.EMAIL_HOST_USER,
                [two_factor_auth.user.email,],
                fail_silently=False,
            )
            return JsonResponse({'message': 'OTP sent successfully'}, status=200)
        return JsonResponse({'error': 'Invalid credentials'}, status=400)



class VerifyTwoFactorAuthView(APIView):
    def post(self, request):
        data = json.loads(request.body)
        user = authenticate(username=data['username'], password=data['password'])
        if user is not None:
            two_factor_auth = TwoFactorAuth.objects.get(user=user)
            if two_factor_auth.otp_valid_until > timezone.now():
                if check_password(data['otp'], two_factor_auth.otp):
                    refresh = RefreshToken.for_user(user)
                    two_factor_auth.otp = None
                    two_factor_auth.otp_valid_until = None
                    two_factor_auth.save()
                    return JsonResponse({'refresh': str(refresh), 'access': str(refresh.access_token)}, status=200)

                return JsonResponse({'error': 'Invalid OTP'}, status=400)
            return JsonResponse({'error': 'OTP expired'}, status=400)
        return JsonResponse({'error': 'Invalid credentials'}, status=400)


class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):

        refresh_token = request.data['refresh']
        if not refresh_token:
            return JsonResponse({'error': 'Token is required'}, status=400)
        token = RefreshToken(refresh_token)
        token.blacklist()
        logout(request)
        return JsonResponse({'message': 'User logged out successfully'}, status=200)

class TwoFactorAuthViewEnable(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        two_factor_auth = TwoFactorAuth.objects.get(user=request.user)
        two_factor_auth.two_factor_enabled = True
        two_factor_auth.save()
        return JsonResponse({'message': 'Two factor authentication enabled'}, status=200)


class TwoFactorAuthViewDisable(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        two_factor_auth = TwoFactorAuth.objects.get(user=request.user)
        two_factor_auth.two_factor_enabled = False
        two_factor_auth.save()
        return JsonResponse({'message': 'Two factor authentication disabled'}, status=200)