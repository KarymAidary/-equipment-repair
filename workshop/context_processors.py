from workshop.models import Basket, Category


def getting_basket_item(request):
    session_key = request.session.session_key
    if not session_key:
        request.session.cycle_key()
    try:
        basket = Basket.objects.get(session_key=session_key)
        basket_url = basket.hashed_url
        product_total = basket.services.count()
    except:
        product_total = 0
    return locals()


def category_showing(request):
    category_list = Category.objects.all()
    return {'category_list': category_list}
