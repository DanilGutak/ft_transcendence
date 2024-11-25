# login_app/views.py

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from .serializers import RegisterSerializer , LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import redirect, render
from django.contrib.auth import get_user_model

from django.utils.crypto import get_random_string
from django.utils import timezone
from django.core.mail import send_mail
from .models import TwoFactorAuth
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
import json

from datetime import datetime, timedelta


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
            if two_factor_auth.otp_valid_until and two_factor_auth.otp_valid_until > timezone.now():
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
    permission_classes = []#IsAuthenticated]
    def post(self, request):
    
        refresh_token = request.data['refresh']
        if not refresh_token:
            return JsonResponse({'error': 'Refresh Token is required'}, status=400)
        try:
            # Attempt to blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            return JsonResponse({'error': 'Invalid or expired refresh token'}, status=400)

        logout(request)
        return JsonResponse({'message': 'User logged out successfully'}, status=200)

class LoggedInView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return JsonResponse({'message': 'User is logged in'}, status=200)

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

class TwoFactorAuthViewStatus(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        two_factor_auth = TwoFactorAuth.objects.get(user=request.user)
        return JsonResponse({'two_factor_enabled': two_factor_auth.two_factor_enabled}, status=200)



# OAuth functions below...

from oauthlib.oauth2 import WebApplicationClient
import requests
from django.urls import reverse
from django.contrib.auth.models import User

client = WebApplicationClient(settings.OAUTH_CLIENT_ID)

class OAuthLoginView(APIView):
    def get(self, request):
        #1, get redirect uri
        redirect_uri = 'https://127.0.0.1:8005/api/oauth/callback/'
        #2, build oauth_url
        #oauth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.OAUTH_CLIENT_ID}&redirect_uri={redirect_uri}&response_type=code"
        oauth_url = client.prepare_request_uri(
            "https://api.intra.42.fr/oauth/authorize",
            redirect_uri=redirect_uri,
            scope=["public"],
        )
        
        return JsonResponse({'oauth_url': oauth_url})

class OAuthCallbackView(APIView): # this gets called when the route (urls.py) "/api/oauth/callback" is accessed 
    def redirect_with_param(self, request, param):
        # add a new variable to the session to decide success or not
        try:
            #request.session['oauth_redirected'] = True
            request.session['oauth_status'] = param['status']
            request.session.modified = True
            if (param['status'] == 'success'):
                return redirect(f'/?oauth_redirected=true')
            elif param['status'] == 'failure':
                return redirect(f'/?oauth_redirected=false')
        except Exception as e:
            return redirect('/')

    def get(self, request):
        # Extract the authorization code from the callback URL
        code = request.GET.get('code') #code is given to me by 42 in case of successful auth from 42
        if not code:
            return self.redirect_with_param(request, {'status': 'failure'})

        #redirect_uri = request.build_absolute_uri(reverse('oauth_callback'))
        redirect_uri = 'https://127.0.0.1:8005/api/oauth/callback/' #this is the endpoint where THIS class is accessed by, later 42's endpoint will redirect here again
        token_url = 'https://api.intra.42.fr/oauth/token'

        token_data = {
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH_CLIENT_ID,
            'client_secret': settings.OAUTH_CLIENT_SECRET,
            'code': code,
            'redirect_uri': redirect_uri,
        }

        token_response = requests.post(token_url, data=token_data)  #this is where the token_data is sent to 42's endpoint that expect EXACTLY those variables

        #check response
        if not token_response.ok:
            return self.redirect_with_param(request, {'status': 'failure'})

        client.parse_request_body_response(token_response.text)

        userinfo_endpoint = settings.OAUTH_USERINFO_URL
        uri, headers, body = client.add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body)
        #check response
        if not userinfo_response.ok:
            return self.redirect_with_param(request, {'status': 'failure'})

        user_info = userinfo_response.json()

		# Extract user details from the OAuth provider's response
        username = user_info.get('login')
        email = user_info.get('email')

        if not email or not username:
            return self.redirect_with_param(request, {'status': 'failure'})
            #return JsonResponse({'error': 'Incomplete user information'}, status=400)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user = User.objects.create_user(username=username, email=email)
                user.save()

        token_json = token_response.json()

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        expires_in = token_json['expires_in']

        expiration_time = datetime.now() + timedelta(seconds=expires_in)

        # store the tokens in the backend
        request.session['access_token'] = str(access)
        request.session['refresh_token'] = str(refresh)
        request.session['access_token_expiration'] = expiration_time.strftime('%Y-%m-%d %H:%M:%S')

        return self.redirect_with_param(request, {'status': 'success'})

def refresh_access_token(request):
    refresh_token = request.session.get('refresh_token')
    if not refresh_token:
        return None  # missing refresh token

    token_url = 'https://api.intra.42.fr/oauth/token'
    
    token_data = {
        'grant_type': 'refresh_token',
        'client_id': settings.OAUTH_CLIENT_ID,
        'client_secret': settings.OAUTH_CLIENT_SECRET,
        'refresh_token': refresh_token,
    }

    #do a post request to oauth's endpoint
    token_response = requests.post(token_url, data=token_data)
    
    if token_response.status_code != 200:
        return None  # handle token refresh failure

    token_json = token_response.json()

    access_token = token_json['access_token']
    expires_in = token_json['expires_in']

    expiration_time = datetime.now() + timedelta(seconds=expires_in)

    # update these tokens
    request.session['access_token'] = access_token
    request.session['access_token_expiration'] = expiration_time.strftime('%Y-%m-%d %H:%M:%S')

    return access_token

def check_token_and_refresh(request):
    expiration_time_str = request.session.get('access_token_expiration')
    if not expiration_time_str:
        return None

    expiration_time = datetime.strptime(expiration_time_str, '%Y-%m-%d %H:%M:%S')

    if expiration_time < datetime.now():
        return refresh_access_token(request)

    return request.session.get('access_token')

from rest_framework.response import Response

class OAuthStatusView(APIView):
    def get(self, request):
        status = request.session.pop('oauth_status', None)  # Clear it after retrieval
        return Response({'status': status})

class GetOAuthTokens(APIView):
    def get(self, request):
        access_token = check_token_and_refresh(request)
        refresh_token = request.session.get('refresh_token')

        if access_token and refresh_token:
            return JsonResponse({
                'access': access_token,
                'refresh': refresh_token,
            })
        else:
            return JsonResponse({'error': 'Tokens not found'}, status=400)