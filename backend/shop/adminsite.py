from django.contrib import admin
from django.db.models import Count, Sum
from django.utils import timezone


class UlfatlarAdminSite(admin.AdminSite):
    site_header = "Ulfatlar — boshqaruv"
    site_title = "Ulfatlar"
    index_title = "Bosh sahifa"

    def index(self, request, extra_context=None):
        """Bosh sahifa: bugungi ko'rsatkichlar va kutilayotgan buyurtmalar."""
        from .models import Order, Restaurant
        from .roles import managed_restaurants

        orders = Order.objects.select_related("restaurant")
        restaurants = Restaurant.objects.all()
        mine = managed_restaurants(request.user)
        if mine is not None:
            orders = orders.filter(restaurant__in=mine)
            restaurants = mine

        today = orders.filter(created_at__date=timezone.localdate())
        completed_today = today.exclude(status=Order.Status.CANCELLED)
        in_progress = [Order.Status.ACCEPTED, Order.Status.COOKING, Order.Status.DELIVERING]

        dashboard = {
            "is_manager": mine is not None,
            "restaurants": list(restaurants.values_list("name", flat=True)) if mine is not None else [],
            "new_count": orders.filter(status=Order.Status.NEW).count(),
            "active_count": orders.filter(status__in=in_progress).count(),
            "today_count": today.count(),
            "today_revenue": completed_today.aggregate(total=Sum("total"))["total"] or 0,
            "restaurant_count": restaurants.filter(is_active=True).count(),
            "waiting": orders.filter(status__in=[Order.Status.NEW, *in_progress]).prefetch_related("items")[:10],
            "top_today": (
                completed_today.values("restaurant__name")
                .annotate(count=Count("id"), revenue=Sum("total"))
                .order_by("-revenue")[:5]
                if mine is None
                else []
            ),
        }
        return super().index(request, {**(extra_context or {}), "dashboard": dashboard})
