"""Yangi buyurtma haqida Telegram'ga xabar yuborish."""
import json
import logging
import urllib.error
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)


def money(amount):
    return f"{amount:,}".replace(",", " ") + " so'm"


def order_text(order):
    lines = [
        f"🆕 Yangi buyurtma № {order.number}",
        f"🏠 {order.restaurant.name}",
        "",
    ]
    lines += [f"• {item.quantity} × {item.name} — {money(item.line_total)}" for item in order.items.all()]
    lines += [
        "",
        f"Taomlar: {money(order.subtotal)}",
        f"Yetkazish: {money(order.delivery_fee) if order.delivery_fee else 'bepul'}",
        f"Xizmat haqi: {money(order.service_fee)}",
        f"💰 Jami: {money(order.total)} ({order.get_payment_display()})",
        "",
        f"📍 {order.address}",
        *([f"🗺 {order.map_url}"] if order.map_url else []),
        f"📞 {order.phone}" + (f" ({order.customer_name})" if order.customer_name else ""),
    ]
    if order.note:
        lines.append(f"💬 {order.note}")
    return "\n".join(lines)


def notify_new_order(order):
    """Xabar yuborishga harakat qiladi. Xato bo'lsa buyurtmaga ta'sir qilmaydi — faqat jurnalga yoziladi."""
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = order.restaurant.telegram_chat_id or settings.TELEGRAM_CHAT_ID
    if not token or not chat_id:
        return False

    request = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=json.dumps({"chat_id": chat_id, "text": order_text(order)}).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=5):
            return True
    except (urllib.error.URLError, TimeoutError) as error:
        logger.warning("Telegram xabari yuborilmadi (buyurtma %s): %s", order.number, error)
        return False
