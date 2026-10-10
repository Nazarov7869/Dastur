# Ulfatlar

Taom yetkazib berish platformasi (Jizzax viloyati, Do'stlik tumani).

## Tuzilishi

| Papka | Nima |
|---|---|
| `frontend/` | Sayt — React + Vite |
| `backend/` | Server va ma'lumotlar bazasi — Python, Django |
| `logo-tongi/`, `logo-tungi/` | Logotipning asl fayllari |

## Ishga tushirish

Ikkita terminal kerak.

**1. Backend** (http://localhost:8000, boshqaruv paneli: `/admin`)

```
cd backend
.venv\Scripts\python manage.py runserver
```

**2. Frontend** (http://localhost:5173)

```
cd frontend
npm run dev
```

Backend o'chiq bo'lsa, sayt namuna rejimida ochiladi: menyu ko'rinadi, lekin buyurtmalar saqlanmaydi.

## Birinchi marta o'rnatish

```
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py seed
.venv\Scripts\python manage.py createsuperuser
```

```
cd frontend
npm install
```

## Boshqaruv panellari

Ikkalasi ham http://localhost:8000/admin manzilida, login bo'yicha farqlanadi.

| Panel | Kim uchun | Nima ko'radi | Login yaratish (`backend/` ichida) |
|---|---|---|---|
| Bosh admin | Platforma egasi | Hamma oshxona, menyu, buyurtma, toifa, xodimlar, kunlik tushum | `.venv\Scripts\python manage.py createsuperuser` |
| Oshxona paneli | Choyxona xodimi | Faqat o'z oshxonasining menyusi va buyurtmalari | `.venv\Scripts\python manage.py add_manager <login> <oshxona-kodi>` |

Masalan, Fayz choyxona uchun: `.venv\Scripts\python manage.py add_manager fayz_xodim fayz`.
Oshxona kodlari bosh admin panelidagi «Oshxonalar» ro'yxatida ko'rinadi (`fayz`, `chinor`, `forish`, …).

## Foydali buyruqlar

| Buyruq | Qayerda | Nima qiladi |
|---|---|---|
| `.venv\Scripts\python manage.py test shop` | `backend/` | Backend testlari |
| `npm run build` | `frontend/` | Saytni serverga chiqarish uchun yig'adi |
| `node scripts/check-i18n.mjs` | `frontend/` | Rus va ingliz tarjimalari to'liqligini tekshiradi |

Telegram xabarlari uchun `backend/.env.example` faylini `.env` nomi bilan nusxalab, bot tokeni va guruh ID sini yozing.
