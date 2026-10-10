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

## Login va parollar

> **Diqqat:** bu parollar faqat shu kompyuterdagi sinov bazasi uchun. Saytni internetga chiqarishdan oldin
> hammasini almashtiring va bu bo'limni o'chirib tashlang — README GitHub'ga yuklanadi va uni boshqalar ko'rishi mumkin.

Kirish manzili: http://localhost:8000/admin

| Login | Parol | Panel | Nimani ko'radi |
|---|---|---|---|
| `admin` | `agry-qgcf-uah2` | Bosh admin | hammasi |
| `fayz_xodim` | `nf9t-v2uh-hdau` | Oshxona paneli | Fayz choyxona |
| `chinor_xodim` | `6krg-uc27-fevd` | Oshxona paneli | Chinor choyxona |
| `forish_xodim` | `7ttx-rx97-bdu9` | Oshxona paneli | Forish choyxona |

Parolni almashtirish: panelga kirib, yuqori o'ngdagi «Parolni o'zgartirish» havolasini bosing.

## Foydali buyruqlar

| Buyruq | Qayerda | Nima qiladi |
|---|---|---|
| `.venv\Scripts\python manage.py test shop` | `backend/` | Backend testlari |
| `npm run build` | `frontend/` | Saytni serverga chiqarish uchun yig'adi |
| `node scripts/check-i18n.mjs` | `frontend/` | Rus va ingliz tarjimalari to'liqligini tekshiradi |

Telegram xabarlari uchun `backend/.env.example` faylini `.env` nomi bilan nusxalab, bot tokeni va guruh ID sini yozing.
