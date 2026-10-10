from django.urls import path

from . import views

urlpatterns = [
    path("catalog/", views.catalog),
    path("orders/", views.create_order),
    path("orders/<uuid:public_id>/", views.order_detail),
]
