from django.shortcuts import render , redirect

# Create your views here.


def render_page(request, page_name):
    context = { page_name: True}
    return render(request, 'index.html', context)


def redirect_to_home(request):
    return redirect('Index')

