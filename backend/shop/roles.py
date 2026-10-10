"""Panel rollari: bosh admin (superuser) hammasini ko'radi, oshxona xodimi — faqat o'z oshxonasini."""
from django.contrib.auth.models import Group, Permission

MANAGER_GROUP = "Oshxona xodimi"

# Oshxona xodimi nima qila oladi: o'z oshxonasi ma'lumotini tahrirlash, menyuni to'liq boshqarish,
# buyurtmalarni ko'rish va holatini o'zgartirish. Oshxona qo'shish/o'chirish va toifalar — faqat bosh adminda.
MANAGER_PERMISSIONS = [
    "view_restaurant", "change_restaurant",
    "view_menusection", "add_menusection", "change_menusection", "delete_menusection",
    "view_dish", "add_dish", "change_dish", "delete_dish",
    "view_order", "change_order",
    "view_orderitem",
]


def ensure_manager_group():
    group, _ = Group.objects.get_or_create(name=MANAGER_GROUP)
    group.permissions.set(Permission.objects.filter(content_type__app_label="shop", codename__in=MANAGER_PERMISSIONS))
    return group


def managed_restaurants(user):
    """Foydalanuvchi boshqara oladigan oshxonalar. None — cheklov yo'q (bosh admin)."""
    if user.is_superuser:
        return None
    return user.restaurants.all()
