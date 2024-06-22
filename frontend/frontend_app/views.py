from django.shortcuts import render , redirect

# Create your views here.


def render_page(request, page_name):
    context = {"login": False, "register": True}
    return render(request, 'index.html', context)