from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import Category, Dish, MenuSection, Order, OrderItem, Restaurant
from .serializers import OrderInput, category_data, order_data, restaurant_data
from .telegram import notify_new_order


class OrderThrottle(AnonRateThrottle):
    """Bitta manzildan juda ko'p buyurtma yuborilishini cheklaydi."""

    scope = "orders"


def delivery_fee_for(subtotal):
    return 0 if subtotal >= settings.FREE_DELIVERY_FROM else settings.DELIVERY_FEE


@api_view(["GET"])
def catalog(request):
    """Sayt uchun barcha ma'lumot bitta so'rovda: narxlar, toifalar, oshxonalar va menyular."""
    restaurants = Restaurant.objects.filter(is_active=True).prefetch_related(
        "categories",
        Prefetch("sections", queryset=MenuSection.objects.prefetch_related(
            Prefetch("dishes", queryset=Dish.objects.select_related("section__restaurant"))
        )),
    )
    return Response({
        "fees": {
            "free_delivery_from": settings.FREE_DELIVERY_FROM,
            "delivery": settings.DELIVERY_FEE,
            "service": settings.SERVICE_FEE,
        },
        "categories": [category_data(c) for c in Category.objects.all()],
        "restaurants": [restaurant_data(r) for r in restaurants],
    })


@api_view(["POST"])
@throttle_classes([OrderThrottle])
def create_order(request):
    form = OrderInput(data=request.data)
    form.is_valid(raise_exception=True)
    data = form.validated_data

    restaurant = Restaurant.objects.filter(slug=data["restaurant"], is_active=True).first()
    if not restaurant:
        return Response({"restaurant": ["Bunday oshxona topilmadi."]}, status=status.HTTP_400_BAD_REQUEST)

    # Bir xil taom ikki marta kelsa, sonini qo'shamiz
    quantities = {}
    for item in data["items"]:
        quantities[item["dish"]] = quantities.get(item["dish"], 0) + item["quantity"]

    # Faqat shu oshxonaning sotuvdagi taomlari qabul qilinadi
    dishes = Dish.objects.filter(
        id__in=quantities, section__restaurant=restaurant, is_available=True
    ).select_related("section__restaurant")
    if len(dishes) != len(quantities):
        return Response(
            {"items": ["Ba'zi taomlar hozir sotuvda yo'q. Savatni yangilab, qayta urinib ko'ring."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Narxlar mijozdan emas, bazadan olinadi
    subtotal = sum(dish.final_price * quantities[dish.id] for dish in dishes)
    delivery = delivery_fee_for(subtotal)

    with transaction.atomic():
        order = Order.objects.create(
            restaurant=restaurant,
            customer_name=data.get("name", "").strip(),
            phone=data["phone"],
            address=data["address"].strip(),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            note=data.get("note", "").strip(),
            payment=data["payment"],
            subtotal=subtotal,
            delivery_fee=delivery,
            service_fee=settings.SERVICE_FEE,
            total=subtotal + delivery + settings.SERVICE_FEE,
        )
        OrderItem.objects.bulk_create([
            OrderItem(order=order, dish=dish, name=dish.name_uz, price=dish.final_price, quantity=quantities[dish.id])
            for dish in dishes
        ])

    notify_new_order(order)
    return Response(order_data(order), status=status.HTTP_201_CREATED)


@api_view(["GET"])
def order_detail(request, public_id):
    """Mijoz buyurtma holatini kuzatadi."""
    order = get_object_or_404(Order.objects.select_related("restaurant").prefetch_related("items"), public_id=public_id)
    return Response(order_data(order))
