from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf import settings

from workshop.views import ServiceListView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', ServiceListView.as_view(), name='services'),
    path('workshop/', include('workshop.urls', namespace='workshop')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
