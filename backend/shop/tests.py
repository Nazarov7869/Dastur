from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings

from .models import Category, Dish, MenuSection, Order, Restaurant
from .roles import ensure_manager_group


class PanelTests(TestCase):
    """Boshqaruv panellari: bosh admin hammasini, oshxona xodimi faqat o'z oshxonasini ko'radi."""

    def setUp(self):
        User = get_user_model()
        self.fayz = Restaurant.objects.create(slug="fayz", name="Fayz choyxona")
        self.chinor = Restaurant.objects.create(slug="chinor", name="Chinor choyxona")
        self.dishes = {}
        self.orders = {}
        for restaurant in (self.fayz, self.chinor):
            section = MenuSection.objects.create(restaurant=restaurant, title_uz="Asosiy")
            self.dishes[restaurant.slug] = Dish.objects.create(section=section, name_uz=f"Osh {restaurant.slug}", price=40000)
            self.orders[restaurant.slug] = Order.objects.create(
                restaurant=restaurant, phone="+998 90 123 45 67", address="Do'stlik",
                subtotal=40000, delivery_fee=9000, service_fee=2000, total=51000,
            )
        self.boss = User.objects.create_superuser("boss", password="x-Secret-123")
        self.manager = User.objects.create_user("fayz_xodim", password="x-Secret-123", is_staff=True)
        self.manager.groups.add(ensure_manager_group())
        self.fayz.managers.add(self.manager)

    def test_panel_requires_login(self):
        self.assertEqual(self.client.get("/admin/").status_code, 302)

    def test_owner_dashboard_counts_everything(self):
        self.client.force_login(self.boss)
        response = self.client.get("/admin/")
        self.assertEqual(response.status_code, 200)
        dashboard = response.context["dashboard"]
        self.assertFalse(dashboard["is_manager"])
        self.assertEqual((dashboard["new_count"], dashboard["today_count"], dashboard["today_revenue"]), (2, 2, 102000))
        self.assertEqual(dashboard["restaurant_count"], 2)

    def test_cancelled_orders_do_not_count_as_revenue(self):
        Order.objects.filter(pk=self.orders["chinor"].pk).update(status=Order.Status.CANCELLED)
        self.client.force_login(self.boss)
        dashboard = self.client.get("/admin/").context["dashboard"]
        self.assertEqual((dashboard["today_count"], dashboard["today_revenue"], dashboard["new_count"]), (2, 51000, 1))

    def test_manager_dashboard_shows_only_own_restaurant(self):
        self.client.force_login(self.manager)
        response = self.client.get("/admin/")
        dashboard = response.context["dashboard"]
        self.assertTrue(dashboard["is_manager"])
        self.assertEqual(dashboard["restaurants"], ["Fayz choyxona"])
        self.assertEqual((dashboard["new_count"], dashboard["today_revenue"]), (1, 51000))
        self.assertContains(response, "Fayz choyxona")
        self.assertNotContains(response, "Chinor choyxona")

    def test_manager_sees_only_own_orders_and_menu(self):
        self.client.force_login(self.manager)
        orders = self.client.get("/admin/shop/order/")
        self.assertContains(orders, "Fayz choyxona")
        self.assertNotContains(orders, "Chinor choyxona")
        dishes = self.client.get("/admin/shop/dish/")
        self.assertContains(dishes, "Osh fayz")
        self.assertNotContains(dishes, "Osh chinor")
        # Boshqa oshxona yozuvini manzilini bilsa ham ocholmaydi
        self.assertNotEqual(self.client.get(f"/admin/shop/order/{self.orders['chinor'].pk}/change/").status_code, 200)
        self.assertNotEqual(self.client.get(f"/admin/shop/dish/{self.dishes['chinor'].pk}/change/").status_code, 200)
        self.assertEqual(self.client.get(f"/admin/shop/order/{self.orders['fayz'].pk}/change/").status_code, 200)

    def test_manager_cannot_manage_categories_or_add_restaurants(self):
        self.client.force_login(self.manager)
        self.assertEqual(self.client.get("/admin/shop/category/").status_code, 403)
        self.assertEqual(self.client.get("/admin/shop/restaurant/add/").status_code, 403)
        self.assertEqual(self.client.get("/admin/auth/user/").status_code, 403)

    def test_manager_can_change_order_status(self):
        self.client.force_login(self.manager)
        order = self.orders["fayz"]
        response = self.client.post("/admin/shop/order/", {
            "action": "mark_cooking", "_selected_action": [order.pk, self.orders["chinor"].pk],
        })
        self.assertEqual(response.status_code, 302)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.COOKING)
        # Boshqa oshxona buyurtmasi tanlangan bo'lsa ham o'zgarmaydi
        self.orders["chinor"].refresh_from_db()
        self.assertEqual(self.orders["chinor"].status, Order.Status.NEW)

    def test_staff_without_restaurant_sees_nothing(self):
        User = get_user_model()
        stray = User.objects.create_user("yangi", password="x-Secret-123", is_staff=True)
        stray.groups.add(ensure_manager_group())
        self.client.force_login(stray)
        self.assertEqual(self.client.get("/admin/").context["dashboard"]["today_count"], 0)
        self.assertNotContains(self.client.get("/admin/shop/order/"), "choyxona")


@override_settings(FREE_DELIVERY_FROM=80000, DELIVERY_FEE=9000, SERVICE_FEE=2000, TELEGRAM_BOT_TOKEN="")
class ApiTests(TestCase):
    def setUp(self):
        cache.clear()  # so'rovlar cheklovi testlar orasida yig'ilib qolmasin
        category = Category.objects.create(slug="choyxona", name_uz="Choyxona", name_ru="Чайхана")
        self.fayz = Restaurant.objects.create(slug="fayz", name="Fayz choyxona")
        self.fayz.categories.add(category)
        section = MenuSection.objects.create(restaurant=self.fayz, title_uz="Aksiyalar")
        self.osh = Dish.objects.create(section=section, name_uz="Osh to'plami", price=55000, old_price=67000)
        self.non = Dish.objects.create(section=section, name_uz="Tandir non", price=5000)
        self.hidden = Dish.objects.create(section=section, name_uz="Tugagan taom", price=10000, is_available=False)

        self.bufet = Restaurant.objects.create(slug="bufet", name="Bufet", discount_percent=20)
        bufet_section = MenuSection.objects.create(restaurant=self.bufet, title_uz="Nonushta")
        self.kruassan = Dish.objects.create(section=bufet_section, name_uz="Kruassan", price=18000)

    def order(self, **overrides):
        body = {
            "restaurant": "fayz",
            "items": [{"dish": self.osh.id, "quantity": 1}],
            "address": "Do'stlik sh., Navoiy ko'chasi, 1",
            "phone": "+998 90 123 45 67",
        }
        body.update(overrides)
        return self.client.post("/api/orders/", body, content_type="application/json")

    def test_catalog_lists_restaurants_with_prices(self):
        data = self.client.get("/api/catalog/").json()
        self.assertEqual(data["fees"], {"free_delivery_from": 80000, "delivery": 9000, "service": 2000})
        fayz = next(r for r in data["restaurants"] if r["id"] == "fayz")
        dishes = fayz["sections"][0]["dishes"]
        # Sotuvda yo'q taom chiqmaydi; aksiya taomida eski narx bor
        self.assertEqual([d["name"]["uz"] for d in dishes], ["Osh to'plami", "Tandir non"])
        self.assertEqual((dishes[0]["price"], dishes[0]["base_price"]), (55000, 67000))
        # Tarjima bo'sh bo'lsa, o'zbekchasi qaytadi
        self.assertEqual(data["categories"][0]["name"], {"uz": "Choyxona", "ru": "Чайхана", "en": "Choyxona"})

    def test_restaurant_discount_applies_to_price(self):
        data = self.client.get("/api/catalog/").json()
        bufet = next(r for r in data["restaurants"] if r["id"] == "bufet")
        dish = bufet["sections"][0]["dishes"][0]
        self.assertEqual((dish["price"], dish["base_price"]), (14400, 18000))

    def test_order_totals_are_computed_on_server(self):
        response = self.order(items=[{"dish": self.osh.id, "quantity": 1}, {"dish": self.non.id, "quantity": 2}])
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["subtotal"], 65000)
        self.assertEqual(data["delivery_fee"], 9000)
        self.assertEqual(data["total"], 76000)
        self.assertEqual(data["status"], "new")
        order = Order.objects.get()
        self.assertEqual(order.items.count(), 2)
        self.assertEqual(data["number"], order.number)

    def test_delivery_is_free_from_threshold(self):
        data = self.order(items=[{"dish": self.osh.id, "quantity": 2}]).json()
        self.assertEqual((data["subtotal"], data["delivery_fee"], data["total"]), (110000, 0, 112000))

    def test_client_cannot_set_prices(self):
        data = self.order(items=[{"dish": self.osh.id, "quantity": 1, "price": 1}], total=1).json()
        self.assertEqual(data["total"], 66000)

    def test_rejects_dish_from_another_restaurant(self):
        response = self.order(items=[{"dish": self.kruassan.id, "quantity": 1}])
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Order.objects.exists())

    def test_rejects_unavailable_dish(self):
        self.assertEqual(self.order(items=[{"dish": self.hidden.id, "quantity": 1}]).status_code, 400)

    def test_rejects_bad_input(self):
        self.assertEqual(self.order(phone="+998 90").status_code, 400)
        self.assertEqual(self.order(items=[]).status_code, 400)
        self.assertEqual(self.order(address="").status_code, 400)
        self.assertEqual(self.order(items=[{"dish": self.osh.id, "quantity": 0}]).status_code, 400)
        self.assertEqual(self.order(restaurant="yoq").status_code, 400)

    def test_order_status_can_be_tracked(self):
        public_id = self.order().json()["id"]
        Order.objects.update(status=Order.Status.COOKING)
        data = self.client.get(f"/api/orders/{public_id}/").json()
        self.assertEqual(data["status"], "cooking")
        self.assertEqual(data["items"][0]["name"], "Osh to'plami")

    def test_map_location_is_saved(self):
        data = self.order(latitude=40.524712, longitude=68.035811).json()
        self.assertEqual((data["latitude"], data["longitude"]), (40.524712, 68.035811))
        self.assertEqual(Order.objects.get().map_url, "https://www.google.com/maps?q=40.524712,68.035811")
        # Nuqtasiz buyurtma ham qabul qilinadi (masalan, telefon orqali kiritilgan)
        self.assertIsNone(self.order().json()["latitude"])
        self.assertEqual(self.order(latitude=120, longitude=68).status_code, 400)

    def test_unknown_order_is_not_found(self):
        response = self.client.get("/api/orders/00000000-0000-0000-0000-000000000000/")
        self.assertEqual(response.status_code, 404)
