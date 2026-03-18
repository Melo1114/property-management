# Tenant Management System — Backend (Django + DRF)

This is the backend for the **Tenant & Lease Management System**, built with **Python**, **Django**, and **Django REST Framework (DRF)**. It serves as the API layer for managing tenants, leases, properties, payments, maintenance requests, notifications, and reporting.

> **Note:** The original system specification targeted ASP.NET Web API + SQL Server. This implementation uses Django + DRF + PostgreSQL as a fully equivalent alternative. All core modules and features from the specification are supported.

---

## Tech Stack

| Layer             | Original Spec              | This Implementation         |
|------------------|----------------------------|-----------------------------|
| Language          | C#                         | Python                      |
| Framework         | ASP.NET Web API            | Django + Django REST Framework |
| ORM               | Entity Framework (EF Core) | Django ORM                  |
| Database          | SQL Server                 | PostgreSQL                  |
| Authentication    | ASP.NET Identity + OAuth2  | djangorestframework-simplejwt |
| Role-Based Access | ASP.NET Roles              | Django Groups & Permissions |
| Audit Logging     | Custom Middleware           | django-auditlog              |
| Notifications     | Twilio / SendGrid          | Twilio / SendGrid (via celery tasks) |
| Payment Gateway   | Stripe / PayFast / Ozow    | Stripe / PayFast / Ozow     |
| Reporting         | RDLC / Power BI            | ReportLab (PDF) / openpyxl (Excel) |
| Hosting           | Azure / AWS                | Azure / AWS / Railway        |

---

## Key Modules & Features

### 1. Authentication & User Management
- JWT-based login and registration
- Role-based access control: `Admin`, `PropertyManager`, `Tenant`, `Vendor`, `Accountant`
- Password hashing and secure token refresh
- Audit logs for key user operations

### 2. Tenant & Lease Management
- Tenant onboarding with document uploads
- Lease creation, renewal, and expiry tracking
- Automated lease expiry notifications
- Lease agreement document repository

### 3. Property & Unit Management
- Multi-property portfolio support (commercial & residential)
- Multi-unit building management
- Unit availability tracking

### 4. Financial Management
- Rent payment tracking (paid, due, overdue)
- Monthly invoice generation
- Payment reconciliation
- Exportable financial reports (PDF, Excel)

### 5. Maintenance & Work Order Management
- Tenant-submitted maintenance requests via portal
- Vendor assignment and work order routing
- Status tracking: `Open`, `In Progress`, `Resolved`
- Service history per unit/property

### 6. Online Payments
- Payment gateway integration (Stripe / PayFast / Ozow)
- Transaction history and digital receipts

### 7. Communication & Notifications
- Bulk SMS/email notifications (Twilio + SendGrid)
- Automated reminders: rent due, lease expiry, ticket updates
- Per-tenant communication logs

### 8. Document Management
- Secure upload and storage (Azure Blob / AWS S3 / local)
- Role-based document access
- Document expiry alerts

### 9. Reporting & Analytics
- Dashboards: occupancy rate, rent collection, maintenance status
- Exportable reports: PDF (ReportLab), Excel (openpyxl)

---

## User Roles & Access

| Role             | Access                                                            |
|-----------------|-------------------------------------------------------------------|
| Admin            | Full access to all modules and user management                   |
| Property Manager | Manage tenants, leases, maintenance, reports                     |
| Tenant           | View lease, make payments, submit maintenance requests           |
| Vendor           | View and update assigned maintenance tasks                       |
| Accountant       | View financial reports, reconcile payments                       |

---

## Entity Overview

The system is built around these core entities and their relationships:

- **User** — base auth entity with role assignment
- **Tenant** — linked to User; has many Leases
- **Property** — has many Units
- **Unit** — belongs to Property; linked to Lease; has many MaintenanceRequests
- **Lease** — links Tenant to Unit; has many Payments and Documents
- **Payment** — tracks rent payments per Lease
- **MaintenanceRequest** — submitted by Tenant, assigned to Vendor
- **Vendor** — assigned to many MaintenanceRequests
- **Document** — linked to Tenant or Lease
- **Notification** — sent to Users

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/Tenant-Management-Full-Stack-System.git
cd Tenant-Management-Full-Stack-System/Tenant_Management_System_RESTAPI
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# Windows (PowerShell)
.\\venv\\Scripts\\Activate.ps1

# Windows (cmd)
venv\\Scripts\\activate.bat

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/tenant_management_db

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
DEFAULT_FROM_EMAIL=no-reply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateway
STRIPE_SECRET_KEY=your-stripe-key
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key

# File Storage (Azure Blob or AWS S3)
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
# or
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket
```

### 5. Run database migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a superuser (Admin)

```bash
python manage.py createsuperuser
```

### 7. Run the development server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`

---

## Sample API Endpoints

| ID | Role        | Auth Required | Method | Endpoint                                  | Description                  |
|----|-------------|--------------|--------|-------------------------------------------|------------------------------|
| 1  | All         | No           | POST   | `/api/auth/register/`                     | Register a new user          |
| 2  | All         | No           | POST   | `/api/auth/login/`                        | Login and receive JWT tokens |
| 3  | All         | Yes          | POST   | `/api/auth/token/refresh/`                | Refresh JWT access token     |
| 4  | Admin/PM    | Yes          | GET    | `/api/tenants/`                           | List all tenants             |
| 5  | Admin/PM    | Yes          | POST   | `/api/tenants/`                           | Create a new tenant          |
| 6  | Admin/PM    | Yes          | GET    | `/api/properties/`                        | List all properties          |
| 7  | Admin/PM    | Yes          | POST   | `/api/properties/`                        | Add a property               |
| 8  | Admin/PM    | Yes          | GET    | `/api/units/`                             | List all units               |
| 9  | Admin/PM    | Yes          | POST   | `/api/leases/`                            | Create a lease               |
| 10 | Tenant      | Yes          | GET    | `/api/leases/my/`                         | View own lease details       |
| 11 | Admin/PM    | Yes          | GET    | `/api/payments/`                          | List all payments            |
| 12 | Tenant      | Yes          | POST   | `/api/payments/`                          | Make a payment               |
| 13 | Tenant      | Yes          | GET    | `/api/payments/my/`                       | View own payment history     |
| 14 | Tenant      | Yes          | POST   | `/api/maintenance/`                       | Submit a maintenance request |
| 15 | Admin/PM    | Yes          | GET    | `/api/maintenance/`                       | List all maintenance requests|
| 16 | Vendor      | Yes          | PATCH  | `/api/maintenance/{id}/status/`           | Update maintenance status    |
| 17 | Admin/PM    | Yes          | POST   | `/api/maintenance/{id}/assign-vendor/`    | Assign vendor to request     |
| 18 | Admin/PM    | Yes          | POST   | `/api/notifications/send-bulk/`           | Send bulk notifications      |
| 19 | All         | Yes          | GET    | `/api/notifications/my/`                  | View own notifications       |
| 20 | Admin/Acct  | Yes          | GET    | `/api/reports/rent-roll/`                 | Generate rent roll report    |
| 21 | Admin/Acct  | Yes          | GET    | `/api/reports/financial/`                 | Generate financial report    |
| 22 | All         | Yes          | POST   | `/api/documents/upload/`                  | Upload a document            |
| 23 | All         | Yes          | GET    | `/api/documents/`                         | List own documents           |

---

## Sample Registration Data

```json
{
  "username": "HaalandS2Admin",
  "email": "HaalandS@gmail.com",
  "address": "43 Big Street, 4302",
  "phone_number": "0743929000",
  "password": "Haaland@1234",
  "first_name": "Sergio",
  "last_name": "Haaland",
  "role": "Administrator"
}
```

```json
{
  "username": "Havertz02",
  "email": "Harvertzj@gmail.com",
  "address": "43 Arsenal Road, 3453",
  "phone_number": "0743232223",
  "password": "Harvetz@1234",
  "first_name": "Julian",
  "last_name": "Harvetz",
  "role": "Tenant"
}
```

---

## Sample Login Data

| Username       | Password         | Role          |
|----------------|------------------|---------------|
| Efronz         | Efron@123456     | Tenant        |
| cfarquarson0   | corlissF@123     | Vendor        |
| ZzimelaAdmin   | zimelaZ@1234     | Administrator |

---

## System Logging

| Setting       | Value                                                   |
|--------------|---------------------------------------------------------|
| Framework     | Python `logging` module + `django-auditlog`            |
| Log file name | `tenant_management_api.log`                            |
| Log file path | `/logs/tenant_management_api.log` (project root)       |
| Log levels    | DEBUG (dev), INFO / WARNING / ERROR (production)       |

---

## Directory Structure

```
Tenant-Management-Full-Stack-System/
├── Tenant_Management_System_EFCODE1ST/   # Django project (models, migrations)
├── Tenant_Management_System_RESTAPI/     # DRF API (views, serializers, urls)
│   ├── apps/
│   │   ├── users/
│   │   ├── tenants/
│   │   ├── properties/
│   │   ├── leases/
│   │   ├── payments/
│   │   ├── maintenance/
│   │   ├── notifications/
│   │   ├── documents/
│   │   └── reports/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── logs/
│   ├── manage.py
│   └── requirements.txt
└── Tenant_Management_System_NextJS/      # Frontend (Next.js)
```

---

## Dependencies (requirements.txt)

```
django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt
django-auditlog
django-environ
psycopg2-binary
celery
redis
twilio
sendgrid
stripe
reportlab
openpyxl
django-storages[azure]
boto3
Pillow
```

---

## Development Methodology

The project follows **Agile/Scrum** with 3 monthly milestones:

| Milestone      | Deliverables                                                       |
|---------------|---------------------------------------------------------------------|
| End of Month 1 | System architecture, auth, ERD/UML diagrams, Admin module         |
| End of Month 2 | Functional lease, tenant, finance, maintenance, and communication  |
| End of Month 3 | Reporting, dashboards, payment integration, UAT, deployment        |

---

## Next Steps

- Implement JWT authentication and role-based permissions per endpoint
- Build out CRUD for: Tenants, Properties, Units, Leases, Payments
- Add Maintenance Request workflow (submit → assign → resolve)
- Integrate Celery + Redis for async notifications and scheduled tasks
- Connect payment gateway (Stripe or PayFast)
- Build reporting endpoints (PDF/Excel export)
- Connect Next.js frontend to this API
