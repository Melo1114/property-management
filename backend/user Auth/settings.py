from datetime import timedelta
from pathlib import Path
import os


BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "change-me-in-production-very-secret-key-1234567890"
)

DEBUG = os.environ.get("DEBUG", "True") == "True"

ALLOWED_HOSTS: list[str] = ["*"]


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",  # enables logout/token invalidation
    "accounts",
    "properties",
    "leases",
    "payments",
    "maintenance",
    "notifications",
    "documents",
    "reports",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


LANGUAGE_CODE = "en-us"
TIME_ZONE     = "UTC"
USE_I18N      = True
USE_TZ        = True

STATIC_URL  = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL   = "media/"
MEDIA_ROOT  = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── Custom User Model ──────────────────────────────────────────────────────
AUTH_USER_MODEL = "accounts.User"

# ── Django REST Framework ──────────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        # Global default: every endpoint requires a valid JWT
        # Override per-view with permission_classes = [AllowAny] etc.
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.MultiPartParser",  # for file/document uploads
    ],
}

# ── JWT Configuration ──────────────────────────────────────────────────────
SIMPLE_JWT = {
    # Access token: short-lived (60 min). Used in Authorization header.
    "ACCESS_TOKEN_LIFETIME":  timedelta(minutes=60),

    # Refresh token: longer-lived (7 days). Used to get a new access token.
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    # Rotate refresh tokens on each use (new refresh token issued each time)
    "ROTATE_REFRESH_TOKENS": True,

    # Blacklist old refresh token after rotation (requires token_blacklist app)
    "BLACKLIST_AFTER_ROTATION": True,

    # Signing algorithm
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,

    # Header format: Authorization: Bearer <token>
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",

    # What to use as the unique user identifier in the token
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",

    # Use the custom serializer that embeds role + email in the token
    "TOKEN_OBTAIN_SERIALIZER": "accounts.serializers.CustomTokenObtainPairSerializer",

    # Token type claim
    "TOKEN_TYPE_CLAIM": "token_type",
}

# ── Email ──────────────────────────────────────────────────────────────────
EMAIL_BACKEND      = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "noreply@property-management.example.com"

# ── CORS ───────────────────────────────────────────────────────────────────
# Dev: allow all. In production replace with explicit origins:
# CORS_ALLOWED_ORIGINS = ["https://yourfrontend.com"]
CORS_ALLOW_ALL_ORIGINS = True
