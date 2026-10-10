import re

from rest_framework import serializers

from .models import Order


def localized(obj, field):
    """name_uz / name_ru / name_en → {"uz": ..., "ru": ..., "en": ...}; bo'sh tarjima o'rniga o'zbekchasi."""
    uz = getattr(obj, f"{field}_uz")
    return {"uz": uz, "ru": getattr(obj, f"{field}_ru") or uz, "en": getattr(obj, f"{field}_en") or uz}


def category_data(category):
    return {"id": category.slug, "name": localized(category, "name"), "photo": category.photo}


def dish_data(dish):
    return {
        "id": dish.id,
        "name": localized(dish, "name"),
        "description": localized(dish, "description"),
        "price": dish.final_price,
        "base_price": dish.base_price,
        "weight": dish.weight,
        "photo": dish.photo,
    }


def restaurant_data(restaurant):
    return {
        "id": restaurant.slug,
        "name": restaurant.name,
        "categories": [c.slug for c in restaurant.categories.all()],
        "rating": float(restaurant.rating),
        "reviews": restaurant.reviews,
        "time": restaurant.delivery_minutes,
        "distance": float(restaurant.distance_km),
        "discount": restaurant.discount_percent,
        "address": restaurant.address,
        "hours": restaurant.hours,
        "cover": restaurant.cover,
        "sections": [
            {
                "id": section.id,
                "title": localized(section, "title"),
                # Sotuvda yo'q taomlar saytga chiqmaydi
                "dishes": [dish_data(d) for d in section.dishes.all() if d.is_available],
            }
            for section in restaurant.sections.all()
        ],
    }


def order_data(order):
    return {
        "id": str(order.public_id),
        "number": order.number,
        "status": order.status,
        "restaurant": order.restaurant.slug,
        "items": [
            {"dish": item.dish_id, "name": item.name, "price": item.price, "quantity": item.quantity}
            for item in order.items.all()
        ],
        "subtotal": order.subtotal,
        "delivery_fee": order.delivery_fee,
        "service_fee": order.service_fee,
        "total": order.total,
        "address": order.address,
        "latitude": float(order.latitude) if order.latitude is not None else None,
        "longitude": float(order.longitude) if order.longitude is not None else None,
        "phone": order.phone,
        "note": order.note,
        "payment": order.payment,
        "created_at": order.created_at.isoformat(),
    }


class OrderItemInput(serializers.Serializer):
    dish = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=50)


class OrderInput(serializers.Serializer):
    """Mijozdan keladigan buyurtma. Narxlar bu yerda yo'q — ularni server o'zi hisoblaydi."""

    restaurant = serializers.SlugField()
    items = OrderItemInput(many=True, allow_empty=False, max_length=60)
    address = serializers.CharField(max_length=300)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-90, max_value=90, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-180, max_value=180, required=False, allow_null=True)
    phone = serializers.CharField(max_length=24)
    name =serializers.CharField(max_length=80, required=False, allow_blank=True)
    note = serializers.CharField(max_length=300, required=False, allow_blank=True)
    payment = serializers.ChoiceField(choices=Order.Payment.choices, default=Order.Payment.CASH)

    def validate_phone(self, value):
        if len(re.sub(r"\D", "", value)) < 12:
            raise serializers.ValidationError("Telefon raqamni to'liq kiriting: +998 XX XXX XX XX")
        return value.strip()
