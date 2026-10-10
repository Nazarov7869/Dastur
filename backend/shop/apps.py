from django.apps import AppConfig
from django.contrib.admin.apps import AdminConfig


class ShopConfig(AppConfig):
    name = "shop"
    verbose_name = "Oshxonalar va buyurtmalar"


class UlfatlarAdminConfig(AdminConfig):
    """Standart admin o'rniga statistika sahifali o'z panelimiz ishlatiladi."""

    default_site = "shop.adminsite.UlfatlarAdminSite"
