from django.shortcuts import render , redirect

# Create your views here.



def IndexView(request):
    context = {'page_title': 'home'}
    return render(request, 'index.html', context)
def LoginView(request):
    context = {'page_title': 'login'}
    return render(request, 'index.html', context)
def RegisterView(request):
    context = {'page_title': 'register'}
    return render(request, 'index.html', context)
def ProfileView(request):
    context = {'page_title': 'profile'}
    return render(request, 'index.html', context)
def GameView(request):
    context = {'page_title': 'game'}
    return render(request, 'index.html', context)