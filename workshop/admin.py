from django.contrib import admin
from .models import (
    Service,
    Category,
    CouponCode,
    BasketItem,
    Basket,
    Order,
    Customer
)


class InlineBasketAdmin(admin.StackedInline):
    model = Basket


class CategoryAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Category._meta.fields]

    class Meta:
        model = Category


class ServiceAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Service._meta.fields]
    list_filter = ('category', 'price', 'discount')

    class Meta:
        model = Service


class BasketAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Basket._meta.fields]

    class Meta:
        model = Basket


class BasketItemAdmin(admin.ModelAdmin):
    list_display = [field.name for field in BasketItem._meta.fields]

    class Meta:
        model = BasketItem


class OrderAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Order._meta.fields]

    class Meta:
        model = Order


class CustomerAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Customer._meta.fields]

    class Meta:
        model = Customer


class CouponCodeAdmin(admin.ModelAdmin):
    list_display = [field.name for field in CouponCode._meta.fields]

    class Meta:
        model = CouponCode


admin.site.register(CouponCode, CouponCodeAdmin)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Basket, BasketAdmin)
admin.site.register(BasketItem, BasketItemAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Service, ServiceAdmin)
