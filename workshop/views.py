import json
from django.core.exceptions import ObjectDoesNotExist
from django.core.signing import Signer
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.generic.base import TemplateView

from workshop.forms import CustomerForm
from .models import Service, Basket, BasketItem, CouponCode, Customer, Order
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from django.shortcuts import redirect, render, get_list_or_404
# from .forms import CustomerForm
from django.urls import reverse
from django.db.models import Q
from django.template.loader import render_to_string


class ServiceListView(ListView):
    template_name = 'workshop/serviceList.html'
    paginate_by = 32

    def get_queryset(self):
        slug = self.kwargs.get("category")
        if slug is not None:
            queryset = get_list_or_404(Service.objects.filter(category__slug=slug))
        else:
            queryset = Service.objects.all()
        return queryset


class ServiceDetailView(DetailView):
    template_name = 'workshop/serviceDetail.html'
    model = Service


def basket_adding(request):
    return_dict = dict()
    session_key = request.session.session_key
    data = request.POST
    service = Service.objects.get(id=data.get("product_id"))
    new_basket, created = Basket.objects.get_or_create(session_key=session_key)
    basket_item, created = BasketItem.objects.get_or_create(service=service)
    new_basket.services.add(basket_item)
    new_basket.count_total_price()
    product_total = new_basket.services.count()
    return_dict["service_total"] = product_total
    return JsonResponse(return_dict)


def remove_from_basket(request):
    return_dict = dict()
    session_key = request.session.session_key
    data = request.POST
    if data.get("is_delete") == 'true':
        basket = Basket.objects.get(session_key=session_key)
        basket.products.get(id=data.get("service_id")).delete()
        return_dict["is_deleted"] = True
        return_dict['service_total'] = basket.products.count()
        if basket.products.count() < 1 or basket.total <= 3.50:
            basket.delete()
            return_dict['empty_basket'] = render_to_string('workshop/emptyBasket.html')
        else:
            basket.count_total_price()
        return_dict['basket_total'] = basket.total
    return JsonResponse(return_dict)


class CartPageView(TemplateView):
    template_name = 'workshop/cart.html'
    model = Service


def discount(request):
    session_key = request.session.session_key
    if request.method == 'POST':
        code = request.POST.get('cupone_code')
        basket = Basket.objects.get(session_key=session_key)
        try:
            coupon_code = CouponCode.objects.get(code=code)
            if basket.coupon_code:
                return JsonResponse({'status': 'already'})
            elif coupon_code.code == 'HEARTNECKLACE':
                basket.coupon_code = coupon_code
                product = Service.objects.get(name__iexact='Heart necklace')
                basket_item = BasketItem.objects.create(material=None, se=product, size=None, amount=1)
                basket.products.add(basket_item)
                basket.save()
                return JsonResponse({'status': 'successfully', 'discount': basket.coupon_code.discount})
            else:
                basket.coupon_code = coupon_code
                basket.discount()
                return JsonResponse({'status': 'successfully', 'basket_total': basket.total,
                                     'discount': render_to_string('shop/sale.html', {
                                         'discount': basket.coupon_code.discount})})
        except:
            return JsonResponse({'status': 'invalid'})
    return HttpResponse('/')


def checkout_step_one(request, basket_url):
    try:
        session_key = Signer().unsign(basket_url)
        basket = Basket.objects.get(session_key=session_key)
    except:
        return HttpResponseRedirect(reverse('core:main'))
    template_name = 'shop/checkout.html'
    initial_customer = Customer.objects.filter(session_key=session_key).first()
    if request.method == 'POST':
        form = CustomerForm(request.POST or None)
        if form.is_valid():
            customer, created = Customer.objects.get_or_create(session_key=session_key, defaults={**form.cleaned_data})
            if created:
                customer.session_key = session_key
                customer.save()
            order, created = Order.objects.get_or_create(basket=basket)
            order.customer = customer
            order.save()
            return redirect(reverse('shop:checkout_step_two', kwargs={'basket_url': basket_url}))
    else:
        form = CustomerForm(initial={'email': initial_customer.email if initial_customer else '',
                                     'first_name': initial_customer.first_name if initial_customer else '',
                                     'last_name': initial_customer.last_name if initial_customer else '',
                                     'street': initial_customer.street if initial_customer else '',
                                     'country': initial_customer.country if initial_customer else '',
                                     'city': initial_customer.city if initial_customer else '',
                                     'post_code': initial_customer.post_code if initial_customer else ''})
    return render(request, template_name, {'form': form})
