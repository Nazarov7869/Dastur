import getpass

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError

from shop.models import Restaurant
from shop.roles import ensure_manager_group


class Command(BaseCommand):
    help = "Oshxona xodimi uchun panelga kirish yaratadi: u faqat o'z oshxonasi menyusi va buyurtmalarini ko'radi."

    def add_arguments(self, parser):
        parser.add_argument("username", help="Xodimning logini, masalan: fayz")
        parser.add_argument("restaurant", help="Oshxona kodi (slug), masalan: fayz")

    def handle(self, *args, **options):
        restaurant = Restaurant.objects.filter(slug=options["restaurant"]).first()
        if not restaurant:
            codes = ", ".join(Restaurant.objects.values_list("slug", flat=True))
            raise CommandError(f"Bunday oshxona yo'q. Mavjud kodlar: {codes}")

        User = get_user_model()
        user = User.objects.filter(username=options["username"]).first()
        if user is None:
            password = getpass.getpass("Yangi xodim uchun parol: ")
            if password != getpass.getpass("Parolni takrorlang: "):
                raise CommandError("Parollar bir xil emas.")
            try:
                validate_password(password)
            except ValidationError as error:
                raise CommandError("Parol yaroqsiz: " + " ".join(error.messages))
            user = User.objects.create_user(options["username"], password=password)

        user.is_staff = True  # panelga kira oladi
        user.save()
        user.groups.add(ensure_manager_group())
        restaurant.managers.add(user)
        self.stdout.write(self.style.SUCCESS(
            f"Tayyor: «{user.username}» endi «{restaurant.name}» paneliga kira oladi (/admin)."
        ))
