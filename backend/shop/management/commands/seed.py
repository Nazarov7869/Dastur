import json

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from shop.models import Category, Dish, MenuSection, Order, Restaurant


class Command(BaseCommand):
    help = "seed/catalog.json dagi namuna oshxonalar va menyularni bazaga yuklaydi."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Mavjud oshxona va menyularni o'chirib, qaytadan yuklaydi.")

    @transaction.atomic
    def handle(self, *args, **options):
        if Restaurant.objects.exists():
            if not options["reset"]:
                self.stdout.write("Bazada oshxonalar bor — hech narsa o'zgartirilmadi. Qayta yuklash uchun: --reset")
                return
            if Order.objects.exists():
                raise CommandError("Bazada buyurtmalar bor, --reset ularni buzadi. Avval buyurtmalarni o'zingiz ko'rib chiqing.")
            Restaurant.objects.all().delete()
            Category.objects.all().delete()

        data = json.loads((settings.BASE_DIR / "seed" / "catalog.json").read_text(encoding="utf-8"))

        categories = {}
        for item in data["categories"]:
            categories[item["slug"]] = Category.objects.create(
                slug=item["slug"], photo=item["photo"], order=item["order"],
                name_uz=item["name"]["uz"], name_ru=item["name"]["ru"], name_en=item["name"]["en"],
            )

        dish_count = 0
        for item in data["restaurants"]:
            restaurant = Restaurant.objects.create(
                slug=item["slug"], name=item["name"], rating=item["rating"], reviews=item["reviews"],
                delivery_minutes=item["delivery_minutes"], distance_km=item["distance_km"],
                discount_percent=item["discount_percent"], address=item["address"], hours=item["hours"],
                cover=item["cover"], order=item["order"],
            )
            restaurant.categories.set(categories[slug] for slug in item["categories"])
            for section_item in item["sections"]:
                section = MenuSection.objects.create(
                    restaurant=restaurant, order=section_item["order"], title_uz=section_item["title"]["uz"],
                    title_ru=section_item["title"]["ru"], title_en=section_item["title"]["en"],
                )
                dishes = [
                    Dish(
                        section=section, order=d["order"], price=d["price"], old_price=d["old_price"],
                        weight=d["weight"], photo=d["photo"],
                        name_uz=d["name"]["uz"], name_ru=d["name"]["ru"], name_en=d["name"]["en"],
                        description_uz=d["description"]["uz"], description_ru=d["description"]["ru"],
                        description_en=d["description"]["en"],
                    )
                    for d in section_item["dishes"]
                ]
                Dish.objects.bulk_create(dishes)
                dish_count += len(dishes)

        self.stdout.write(self.style.SUCCESS(
            f"Yuklandi: {len(categories)} ta toifa, {len(data['restaurants'])} ta oshxona, {dish_count} ta taom."
        ))
