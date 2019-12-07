from decimal import Decimal

from django.core.signing import Signer
from django.db import models
from django.db.models.signals import pre_save

from workshop.utils import unique_slug_generator


class Category(models.Model):
    name = models.CharField(verbose_name='Name', max_length=100, unique=True)
    slug = models.SlugField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'


def category_pre_save_receiver(sender, instance, *args, **kwargs):
    if not instance.slug:
        instance.slug = unique_slug_generator(instance)


pre_save.connect(category_pre_save_receiver, sender=Category)


class Service(models.Model):
    category = models.ForeignKey(to=Category, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='img', null=True, blank=True, default=None)
    name = models.CharField(verbose_name='Name', max_length=120, null=True, default=None)
    price = models.DecimalField(verbose_name='Price', max_digits=10, decimal_places=2, default=0)
    old_price = models.DecimalField(verbose_name='Old price', max_digits=10, decimal_places=2, default=0)
    discount = models.IntegerField(verbose_name='Discount (%)', default=0)
    slug = models.SlugField(blank=True, null=True)
    description = models.TextField()

    def save(self, *args, **kwargs):
        if self.discount > 0:
            self.old_price = self.price
            self.price = self.old_price - (self.old_price / 100 * self.discount)
        super(Service, self).save(*args, **kwargs)

    def __str__(self):
        return str(self.name)

    class Meta:
        verbose_name = 'Service'
        verbose_name_plural = 'Services'


def product_pre_save_receiver(sender, instance, *args, **kwargs):
    if not instance.slug:
        instance.slug = unique_slug_generator(instance)


pre_save.connect(product_pre_save_receiver, sender=Service)


class Basket(models.Model):
    total = models.DecimalField(verbose_name='total', max_digits=10, decimal_places=2, default=0)
    session_key = models.CharField(max_length=128, default=None, blank=True)
    services = models.ManyToManyField(to='BasketItem')
    coupon_code = models.ForeignKey(to='CouponCode', verbose_name='Coupon code', blank=True, null=True,
                                    on_delete=models.CASCADE)

    def count_total_price(self):
        items = self.services.all()
        total = 0
        for item in items:
            total += item.service.price
        self.total = Decimal(total)
        if self.coupon_code:
            self.discount()
        self.save()

    def discount(self):
        if self.coupon_code:
            self.total = Decimal(self.total) - (Decimal(self.total) * self.coupon_code.discount) / 100
        else:
            self.total = Decimal(self.total)
        self.save()
        return self.total

    def __str__(self):
        return '%s' % (self.id,)

    @property
    def hashed_url(self):
        return Signer().sign(self.session_key)

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('shop:checkout', args=[self.hashed_url])

    class Meta:
        verbose_name = 'Basket'


class BasketItem(models.Model):
    service = models.ForeignKey(to='Service', null=True, on_delete=models.CASCADE, unique=False)
    amount = models.IntegerField(verbose_name='Amount', default=0)

    def __str__(self):
        return self.service.name

    class Meta:
        verbose_name = 'Basket Item'
        verbose_name_plural = 'Basket Items'


class Order(models.Model):
    basket = models.OneToOneField('Basket', on_delete=models.CASCADE, related_name='basket')
    date_ordered = models.DateTimeField(auto_now=True)
    customer = models.ForeignKey(to='Customer', on_delete=models.CASCADE, blank=True, null=True)
    is_ordered = models.BooleanField(default=False, verbose_name='payment State')

    def get_cart_items(self):
        return self.items.all()


class Customer(models.Model):
    session_key = models.CharField(max_length=128, default=None, blank=True)
    email = models.EmailField(verbose_name='Email address', max_length=255, default=None, null=True)
    first_name = models.CharField(verbose_name='First name', max_length=30, default=None, null=True)
    last_name = models.CharField(verbose_name='Last name', max_length=150, default=None, null=True)
    street = models.CharField(verbose_name='Street', max_length=150, null=True, default=None)
    country = models.CharField(verbose_name='Country', max_length=50, null=True, default=None)
    city = models.CharField(verbose_name='City', max_length=50, null=True, default=None)
    post_code = models.CharField(verbose_name='Postal code', max_length=12, default=None, null=True)

    def __str__(self):
        return self.email


class CouponCode(models.Model):
    code = models.CharField(max_length=225, verbose_name='code')
    discount = models.IntegerField(verbose_name='Discount (%)', default=0)

    def __str__(self):
        return self.code
