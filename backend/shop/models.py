import math
import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Category(models.Model):
    slug = models.SlugField("kod", unique=True)
    name_uz = models.CharField("nomi (o'zbekcha)", max_length=60)
    name_ru = models.CharField("nomi (ruscha)", max_length=60, blank=True)
    name_en = models.CharField("nomi (inglizcha)", max_length=60, blank=True)
    photo = models.CharField("rasm manzili", max_length=300, blank=True)
    order = models.PositiveIntegerField("tartib", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "toifa"
        verbose_name_plural = "toifalar"

    def __str__(self):
        return self.name_uz


class Restaurant(models.Model):
    slug = models.SlugField("kod (manzilda ishlatiladi)", unique=True)
    name = models.CharField("nomi", max_length=120)
    categories = models.ManyToManyField(Category, verbose_name="toifalar", related_name="restaurants", blank=True)
    rating = models.DecimalField("reyting", max_digits=2, decimal_places=1, default=5)
    reviews = models.PositiveIntegerField("baholar soni", default=0)
    delivery_minutes = models.PositiveIntegerField("yetkazish vaqti (daqiqa)", default=30)
    distance_km = models.DecimalField("masofa (km)", max_digits=4, decimal_places=2, default=1)
    discount_percent = models.PositiveIntegerField(
        "butun menyuga chegirma (%)", default=0, validators=[MaxValueValidator(90)]
    )
    address = models.CharField("manzil", max_length=200, blank=True)
    hours = models.CharField("ish vaqti", max_length=40, blank=True)
    cover = models.CharField("muqova rasmi manzili", max_length=300, blank=True)
    telegram_chat_id = models.CharField(
        "Telegram chat ID",
        max_length=40,
        blank=True,
        help_text="Shu oshxona buyurtmalari tushadigan guruh. Bo'sh bo'lsa, umumiy chat ishlatiladi.",
    )
    managers = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        verbose_name="boshqaruvchilar",
        related_name="restaurants",
        blank=True,
        help_text="Shu oshxona paneliga kira oladigan xodimlar: faqat shu oshxona menyusi va buyurtmalarini ko'radi.",
    )
    is_active = models.BooleanField("saytda ko'rinadi", default=True)
    order = models.PositiveIntegerField("tartib", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "oshxona"
        verbose_name_plural = "oshxonalar"

    def __str__(self):
        return self.name


class MenuSection(models.Model):
    restaurant = models.ForeignKey(Restaurant, verbose_name="oshxona", related_name="sections", on_delete=models.CASCADE)
    title_uz = models.CharField("nomi (o'zbekcha)", max_length=80)
    title_ru = models.CharField("nomi (ruscha)", max_length=80, blank=True)
    title_en = models.CharField("nomi (inglizcha)", max_length=80, blank=True)
    order = models.PositiveIntegerField("tartib", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "menyu bo'limi"
        verbose_name_plural = "menyu bo'limlari"

    def __str__(self):
        return f"{self.restaurant.name} — {self.title_uz}"


class Dish(models.Model):
    section = models.ForeignKey(MenuSection, verbose_name="bo'lim", related_name="dishes", on_delete=models.CASCADE)
    name_uz = models.CharField("nomi (o'zbekcha)", max_length=120)
    name_ru = models.CharField("nomi (ruscha)", max_length=120, blank=True)
    name_en = models.CharField("nomi (inglizcha)", max_length=120, blank=True)
    description_uz = models.CharField("tavsifi (o'zbekcha)", max_length=250, blank=True)
    description_ru = models.CharField("tavsifi (ruscha)", max_length=250, blank=True)
    description_en = models.CharField("tavsifi (inglizcha)", max_length=250, blank=True)
    price = models.PositiveIntegerField("narxi (so'm)")
    old_price = models.PositiveIntegerField(
        "eski narxi (so'm)", null=True, blank=True, help_text="Aksiya taomi uchun: chizib ko'rsatiladi."
    )
    weight = models.CharField("og'irligi / hajmi", max_length=30, blank=True)
    photo = models.CharField("rasm manzili", max_length=300, blank=True)
    is_available = models.BooleanField("sotuvda bor", default=True)
    order = models.PositiveIntegerField("tartib", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "taom"
        verbose_name_plural = "taomlar"

    def __str__(self):
        return self.name_uz

    @property
    def final_price(self):
        """Mijoz to'laydigan narx: oshxona chegirmasi hisobga olingan, 100 so'mgacha yaxlitlangan."""
        percent = self.section.restaurant.discount_percent
        if not percent:
            return self.price
        return math.floor(self.price * (100 - percent) / 10000 + 0.5) * 100

    @property
    def base_price(self):
        """Chizib ko'rsatiladigan narx (chegirma yoki aksiya bo'lmasa, final_price bilan teng)."""
        if self.section.restaurant.discount_percent:
            return self.price
        return self.old_price or self.price


class Order(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Yangi"
        ACCEPTED = "accepted", "Qabul qilindi"
        COOKING = "cooking", "Tayyorlanmoqda"
        DELIVERING = "delivering", "Kuryer yo'lda"
        DELIVERED = "delivered", "Yetkazildi"
        CANCELLED = "cancelled", "Bekor qilindi"

    class Payment(models.TextChoices):
        CASH = "cash", "Naqd pul"
        CARD = "card", "Karta (kuryer terminali)"

    # Mijoz buyurtmasini shu tasodifiy kod orqali kuzatadi — raqamni taxmin qilib bo'lmaydi
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    restaurant = models.ForeignKey(Restaurant, verbose_name="oshxona", related_name="orders", on_delete=models.PROTECT)
    status = models.CharField("holati", max_length=12, choices=Status.choices, default=Status.NEW)
    customer_name = models.CharField("mijoz ismi", max_length=80, blank=True)
    phone = models.CharField("telefon", max_length=24)
    address = models.CharField("manzil", max_length=300)
    # Mijoz xaritadan tanlagan nuqta — kuryer aynan shu joyga boradi
    latitude = models.DecimalField("kenglik", max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField("uzunlik", max_digits=9, decimal_places=6, null=True, blank=True)
    note = models.CharField("kuryerga izoh", max_length=300, blank=True)
    payment = models.CharField("to'lov usuli", max_length=8, choices=Payment.choices, default=Payment.CASH)
    subtotal = models.PositiveIntegerField("taomlar summasi")
    delivery_fee = models.PositiveIntegerField("yetkazib berish")
    service_fee = models.PositiveIntegerField("xizmat haqi")
    total = models.PositiveIntegerField("jami")
    created_at = models.DateTimeField("yaratilgan", auto_now_add=True)
    updated_at = models.DateTimeField("o'zgartirilgan", auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "buyurtma"
        verbose_name_plural = "buyurtmalar"

    def __str__(self):
        return f"№ {self.number} — {self.restaurant.name}"

    @property
    def number(self):
        return 1000 + self.pk if self.pk else None

    @property
    def map_url(self):
        """Tanlangan nuqtani xaritada ochadigan havola (nuqta tanlanmagan bo'lsa — bo'sh)."""
        if self.latitude is None or self.longitude is None:
            return ""
        return f"https://www.google.com/maps?q={self.latitude},{self.longitude}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    dish = models.ForeignKey(Dish, verbose_name="taom", null=True, on_delete=models.SET_NULL)
    # Nom va narx buyurtma paytidagi holatda saqlanadi — keyin menyu o'zgarsa ham buyurtma o'zgarmaydi
    name = models.CharField("nomi", max_length=120)
    price = models.PositiveIntegerField("narxi (so'm)")
    quantity = models.PositiveIntegerField("soni", validators=[MinValueValidator(1)])

    class Meta:
        verbose_name = "buyurtma qatori"
        verbose_name_plural = "buyurtma qatorlari"

    def __str__(self):
        return f"{self.quantity} × {self.name}"

    @property
    def line_total(self):
        return self.price * self.quantity
