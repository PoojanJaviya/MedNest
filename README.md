# 🪺 MedNest

> WhatsApp-based medicine reminder app for elderly patients. Caregivers manage medicines & schedules via a web dashboard; reminders are sent directly to patients on WhatsApp in their preferred language.

---

## 📌 Problem

Elderly patients often forget to take multiple medicines throughout the day. MedNest lets their children/caregivers set up schedules once — and the patient receives timely reminders on WhatsApp without needing to use any app themselves.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL + SQLAlchemy ORM |
| Migrations | Alembic |
| Scheduler | APScheduler |
| WhatsApp | Twilio WhatsApp API |
| Frontend | React + Vite |
| UI Library | shadcn/ui or Chakra UI |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| i18n | react-i18next |
| Deployment | Docker + Docker Compose + Nginx |

---

## 📁 Project Structure

```
mednest/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment variables
│   │   ├── database.py          # DB connection & session
│   │   ├── dependencies.py      # Shared deps (get_db, get_current_user)
│   │   ├── models/
│   │   │   ├── user.py          # Caregiver (child) model
│   │   │   ├── patient.py       # Elderly parent model
│   │   │   ├── medicine.py      # Medicine model
│   │   │   └── schedule.py      # Reminder schedule model
│   │   ├── schemas/
│   │   │   ├── user.py          # Pydantic schemas
│   │   │   ├── patient.py
│   │   │   ├── medicine.py
│   │   │   └── schedule.py
│   │   ├── routers/
│   │   │   ├── auth.py          # Login, register
│   │   │   ├── patients.py      # CRUD patients
│   │   │   ├── medicines.py     # CRUD medicines
│   │   │   └── schedules.py     # CRUD schedules
│   │   └── services/
│   │       ├── auth.py          # JWT logic
│   │       ├── whatsapp.py      # Twilio sender
│   │       └── scheduler.py     # APScheduler jobs
│   ├── alembic/                 # DB migrations
│   ├── .env                     # Environment variables (never commit)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Patients.jsx
│   │   │   ├── Medicines.jsx
│   │   │   └── Schedules.jsx
│   │   ├── components/
│   │   ├── api/                 # Axios API calls
│   │   └── i18n/                # Language files
│   ├── index.html
│   └── vite.config.js
└── docker-compose.yml
```

---

## 🗃️ Database Schema

### `users` — Caregiver (the child)
- id, name, email, hashed_password, created_at

### `patients` — Elderly parent
- id, user_id (FK), name, whatsapp_number, language, created_at

### `medicines` — Medicine details
- id, patient_id (FK), name, dosage, instructions, created_at

### `schedules` — Reminder schedule
- id, medicine_id (FK), times_of_day (array), days_of_week, start_date, end_date, is_active

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- PostgreSQL
- Node.js 18+
- Twilio account (WhatsApp sandbox for dev)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your values
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker (full stack)

```bash
docker-compose up --build
```

---

## 🔑 Environment Variables (`.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mednest
SECRET_KEY=your-jwt-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 🌍 Supported Languages

- English
- Hindi (हिन्दी)
- Gujarati (ગુજરાતી)
- Marathi (मराठी)
- *(easily extendable via message templates)*

---

## 🔄 How Reminders Work

1. Caregiver adds patient → adds medicines → sets schedule
2. APScheduler checks every minute for due reminders
3. Reminder message is built in patient's chosen language
4. Twilio sends the message to patient's WhatsApp number
5. Patient receives message — no app needed on their end

---

## 📦 Backend Dependencies

```
fastapi
uvicorn
sqlalchemy
alembic
psycopg2-binary
apscheduler
twilio
python-jose[cryptography]
passlib[bcrypt]
python-dotenv
pydantic[email]
```

---

## 🗺️ Execution Plan

| Phase | Task | Days |
|---|---|---|
| 1 | Project setup & Docker | 1–2 |
| 2 | Database schema & models | 2–3 |
| 3 | Backend API (auth, CRUD) | 3–6 |
| 4 | Scheduler & WhatsApp integration | 6–7 |
| 5 | Frontend dashboard | 7–11 |
| 6 | Testing & polish | 11–14 |

---

## 📄 License

MIT
