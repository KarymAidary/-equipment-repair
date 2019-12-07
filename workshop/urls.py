from django.urls import path

from .views import (ServiceDetailView,
                    ServiceListView,
                    basket_adding,
                    CartPageView,
                    discount,
                    checkout_step_one,
                    remove_from_basket,
                    )

app_name = 'workshop'
urlpatterns = [
    path('used-cupone-code/', discount, name='discount'),
    path('cart/', CartPageView.as_view(), name='checkout'),
    path('add/to/cart/', basket_adding, name='add_to_basket'),
    path('remove/from/basket', remove_from_basket, name='remove_from_basket'),
    path('checkout/<str:basket_url>step=customer_information/', checkout_step_one, name='checkout_step_one'),
    path('<slug:category>/', ServiceListView.as_view(), name='service'),
    path('<slug:product>/<slug:slug>/', ServiceDetailView.as_view(), name='service_detail'),
]
