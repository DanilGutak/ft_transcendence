from django.shortcuts import render , redirect

# Create your views here.


def render_page(request, page_name):
    context = { page_name: True}
    return render(request, 'index.html', context)


def redirect_to_home(request):
    return redirect('Index')


from django.views.generic import TemplateView

class OAuthSuccessView(TemplateView):
    template_name = 'oauth_success.html'  # The HTML file where the JavaScript will be loaded

