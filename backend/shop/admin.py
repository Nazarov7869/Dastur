from django.contrib import admin
from django.utils.html import format_html

from .models import Category, Dish, MenuSection, Order, OrderItem, Restaurant
from .roles import managed_restaurants


class ScopedAdmin(admin.ModelAdmin):
    """Oshxona xodimi faqat o'z oshxonasiga tegishli yozuvlarni ko'radi; bosh admin — hammasini."""

    restaurant_lookup = None  # yozuvdan oshxonaga olib boradigan yo'l, masalan "section__restaurant"
    owner_only_filters = ("restaurant", "section__restaurant")

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        mine = managed_restaurants(request.user)
        if mine is None:
            return queryset
        return queryset.filter(**{f"{self.restaurant_lookup}__in": mine}).distinct()

    def get_list_filter(self, request):
        # Yon paneldagi "oshxona" filtri boshqa oshxonalar nomini ko'rsatib qo'yadi — xodimga kerak emas
        filters = super().get_list_filter(request)
        if request.user.is_superuser:
            return filters
        return [f for f in filters if f not in self.owner_only_filters]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name_uz", "slug", "order")
    list_editable = ("order",)
    prepopulated_fields = {"slug": ("name_uz",)}


class MenuSectionInline(admin.TabularInline):
    model = MenuSection
    extra = 0
    show_change_link = True


@admin.register(Restaurant)
class RestaurantAdmin(ScopedAdmin):
    restaurant_lookup = "pk"
    list_display = ("name", "rating", "delivery_minutes", "discount_percent", "is_active", "order")
    list_filter = ("is_active", "categories")
    search_fields = ("name", "address")
    filter_horizontal = ("categories", "managers")
    inlines = [MenuSectionInline]
    # Bularni faqat bosh admin o'zgartiradi
    owner_only_fields = ("slug", "categories", "rating", "reviews", "distance_km", "telegram_chat_id", "managers", "is_active", "order")

    def get_prepopulated_fields(self, request, obj=None):
        return {"slug": ("name",)} if request.user.is_superuser else {}

    def get_readonly_fields(self, request, obj=None):
        return () if request.user.is_superuser else self.owner_only_fields


class DishInline(admin.TabularInline):
    model = Dish
    extra = 0
    fields = ("name_uz", "price", "old_price", "weight", "is_available", "order")
    show_change_link = True


@admin.register(MenuSection)
class MenuSectionAdmin(ScopedAdmin):
    restaurant_lookup = "restaurant"
    list_display = ("title_uz", "restaurant", "order")
    list_filter = ("restaurant",)
    inlines = [DishInline]

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        mine = managed_restaurants(request.user)
        if db_field.name == "restaurant" and mine is not None:
            kwargs["queryset"] = mine
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Dish)
class DishAdmin(ScopedAdmin):
    restaurant_lookup = "section__restaurant"
    list_display = ("name_uz", "restaurant", "section", "price", "old_price", "is_available")
    list_editable = ("price", "old_price", "is_available")
    list_filter = ("is_available", "section__restaurant")
    search_fields = ("name_uz", "name_ru", "name_en")
    list_select_related = ("section__restaurant",)

    @admin.display(description="oshxona")
    def restaurant(self, dish):
        return dish.section.restaurant.name

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        mine = managed_restaurants(request.user)
        if db_field.name == "section" and mine is not None:
            kwargs["queryset"] = MenuSection.objects.filter(restaurant__in=mine).select_related("restaurant")
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    can_delete = False
    readonly_fields = ("dish", "name", "price", "quantity")

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(ScopedAdmin):
    restaurant_lookup = "restaurant"
    list_display = ("number", "created_at", "restaurant", "status", "total", "payment", "phone", "address", "map_link")
    list_editable = ("status",)
    list_filter = ("status", "restaurant", "payment", "created_at")
    search_fields = ("phone", "address", "customer_name")
    date_hierarchy = "created_at"
    inlines = [OrderItemInline]
    # Summalar va mijoz ma'lumotlari qo'lda o'zgartirilmaydi — faqat holat
    readonly_fields = (
        "number", "public_id", "restaurant", "customer_name", "phone", "address", "map_link", "latitude", "longitude",
        "note", "payment", "subtotal", "delivery_fee", "service_fee", "total", "created_at", "updated_at",
    )
    actions = ["mark_accepted", "mark_cooking", "mark_delivering", "mark_delivered", "mark_cancelled"]

    def has_add_permission(self, request):
        return False

    @admin.display(description="№", ordering="id")
    def number(self, order):
        return order.number

    @admin.display(description="xaritada")
    def map_link(self, order):
        if not order.map_url:
            return "—"
        return format_html('<a href="{}" target="_blank" rel="noopener">Xaritada ochish</a>', order.map_url)

    def _set_status(self, request, queryset, value):
        updated = queryset.update(status=value)
        self.message_user(request, f"{updated} ta buyurtma holati o'zgartirildi.")

    @admin.action(description="Qabul qilindi deb belgilash")
    def mark_accepted(self, request, queryset):
        self._set_status(request, queryset, Order.Status.ACCEPTED)

    @admin.action(description="Tayyorlanmoqda deb belgilash")
    def mark_cooking(self, request, queryset):
        self._set_status(request, queryset, Order.Status.COOKING)

    @admin.action(description="Kuryer yo'lda deb belgilash")
    def mark_delivering(self, request, queryset):
        self._set_status(request, queryset, Order.Status.DELIVERING)

    @admin.action(description="Yetkazildi deb belgilash")
    def mark_delivered(self, request, queryset):
        self._set_status(request, queryset, Order.Status.DELIVERED)

    @admin.action(description="Bekor qilish")
    def mark_cancelled(self, request, queryset):
        self._set_status(request, queryset, Order.Status.CANCELLED)
