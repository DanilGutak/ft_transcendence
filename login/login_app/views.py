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

from django.shortcuts import redirect
from django.contrib.auth import get_user_model

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
    permission_classes = [IsAuthenticated]
    def post(self, request):

        refresh_token = request.data['refresh']
        if not refresh_token:
            return JsonResponse({'error': 'Token is required'}, status=400)
        token = RefreshToken(refresh_token)
        token.blacklist()
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


client = WebApplicationClient(env(OAUTH_CLIENT_ID))

class OAuthLoginView(APIView):
    def get(self, request):
        # Generate the OAuth provider authorization URL
        #1, get redirect uri
        redirect_uri = request.build_absolute_uri(reverse('OAuthCallbackView'))

        #2, build oauth_url
        oauth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"

        '''
        oauth_url = client.prepare_request_uri(
            settings.OAUTH_AUTHORIZATION_URL,
            redirect_uri=redirect_uri,
            scope=["openid", "email", "profile"],
        )
        '''
        return JsonResponse({'oauth_url': oauth_url})

class OAuthCallbackView(APIView):
    def get(self, request):
        # Extract the authorization code from the callback URL
        code = request.GET.get('code')
        if not code:
            return JsonResponse({'error': 'Authorization code missing'}, status=400)

        # Exchange the authorization code for tokens
        redirect_uri = request.build_absolute_uri(reverse('OAuthCallbackView'))
        token_url = 'https://api.intra.42.fr/oauth/token'

        token_data = {
            'grant_type': 'authorization_code',
            'client_id': env(OAUTH_CLIENT_ID),
            'client_secret': env(OAUTH_CLIENT_SECRET),
            'code': code,
            'redirect_uri': redirect_uri,
        }

        token_response = requests.post(token_url, data=token_data)
    
        # Parse the tokens
        client.parse_request_body_response(token_response.text)

        # Get user info
        userinfo_endpoint = settings.OAUTH_USERINFO_URL
        uri, headers, body = client.add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body)

        user_info = userinfo_response.json()

		# Extract user details from the OAuth provider's response
        username = user_info.get('login')  # Username from 42 API
        email = user_info.get('email')  # Email from 42 API

        if not email or not username:
            return JsonResponse({'error': 'Incomplete user information'}, status=400)

        # Check if the user already exists in your database
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # If user does not exist, create a new user
            user = User.objects.create_user(username=username, email=email)  
            user.save()

        # Generate access and refresh tokens for the user
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return JsonResponse({
            'refresh': str(refresh),
            'access': str(access),
        }, status=200)


#OLD...

def oauth_42(request):
    print('STARTING OAUTH')
    client_id = env('FORTY_TWO_CLIENT_ID')
    redirect_uri = request.build_absolute_uri(reverse('oauth_42_callback'))
    oauth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"
    print(f"Redirecting to: {oauth_url}")
    return redirect(oauth_url)

def oauth_42_callback(request):
    print('STARTING OAUTH CALLBACK')
    code = request.GET.get('code')
    if not code:
        return redirect('login')

    token_url = "https://api.intra.42.fr/oauth/token"
    token_data = {
        'grant_type': 'authorization_code',
        'client_id': env('FORTY_TWO_CLIENT_ID'),
        'client_secret': env('FORTY_TWO_CLIENT_SECRET'),
        'code': code,
        'redirect_uri': request.build_absolute_uri(reverse('oauth_42_callback')),
    }
    token_response = requests.post(token_url, data=token_data)
    token_json = token_response.json()
    access_token = token_json.get('access_token')

    if not access_token:
        print(f"Error: {token_json}")
        return redirect('login')

    user_info_url = "https://api.intra.42.fr/v2/me"
    headers = {'Authorization': f'Bearer {access_token}'}
    user_info_response = requests.get(user_info_url, headers=headers)
    user_info = user_info_response.json()

    User = get_user_model()
    try:
        user = User.objects.get(email=user_info['email'])
        if user.is_2fa_enabled:
            request.session['oauth_user_info'] = user_info
            return redirect('oauth_2fa_verification')
        auth_login(request, user)
        refresh = RefreshToken.for_user(user)
        print(f"User {user.id} logged in")
        return render(request, 'jwt_login.html', {'refresh': str(refresh), 'access': str(refresh.access_token)})
    except User.DoesNotExist:
        request.session['oauth_user_info'] = user_info
        print(f"User {user_info['email']} does not exist, redirecting to complete_registration")
        return redirect('complete_registration')

def complete_registration(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        try:
            validate_email(email)
        except ValidationError:
            return render(request, 'complete_registration.html', {'error': request.t('invalid_email')}, status=400)

        if password != confirm_password:
            return render(request, 'complete_registration.html', {'error': request.t('passwords_do_not_match')}, status=400)
        
        if username:
            existing_user = get_user_model().objects.filter(username=username).first()
            if existing_user:
                return render(request, 'complete_registration.html', {'error': request.t('username_already_exists')}, status=400)

        user_info = request.session.get('oauth_user_info')
        if not user_info:
            return redirect('login')

        try:
            user = get_user_model().objects.create_user(username=username, email=email, password=password)
            user.save()
            auth_login(request, user)
            refresh = RefreshToken.for_user(user)
            return render(request, 'jwt_login.html', {'refresh': str(refresh), 'access': str(refresh.access_token)})
        except IntegrityError:
            return render(request, 'complete_registration.html', {'error': request.t('username_already_exists')})
        except ValidationError as e:
            return render(request, 'complete_registration.html', {'error': '{}: {}'.format(request.t('invalid_data'), str(e))})
        except Exception as e:
            return render(request, 'complete_registration.html', {'error': '{}: {}'.format(request.t('an_unexpected_error_occurred'), str(e))})
    else:
        user_info = request.session.get('oauth_user_info', {})
        return render(request, 'complete_registration.html', {
            'username': user_info.get('login', ''),
            'email': user_info.get('email', '')
        })