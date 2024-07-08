"""
URL configuration for login project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from login_app.views import *
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/',LoginView.as_view() , name='Login'),
    path('api/register/',RegisterView.as_view() , name='Register'),
    path('api/token/refresh', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='Logout'),
    path('api/loggedin/', LoggedInView.as_view(), name='LoggedIn'),
    path('api/2fa/send', SendTwoFactorAuthView.as_view(), name='SendTwoFactorAuth'),
    path('api/2fa/verify', VerifyTwoFactorAuthView.as_view(), name='VerifyTwoFactorAuth'),
    path('api/2fa/enable', TwoFactorAuthViewEnable.as_view(), name='EnableTwoFactorAuth'),
    path('api/2fa/disable', TwoFactorAuthViewDisable.as_view(), name='DisableTwoFactorAuth'),
    path('api/2fa/status', TwoFactorAuthViewStatus.as_view(), name='TwoFactorAuthStatus'),



]
