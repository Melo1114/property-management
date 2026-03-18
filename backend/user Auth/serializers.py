from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


# ── JWT Claims ──────────────────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default JWT payload to include role, full name, and user id.
    The frontend can read these from the decoded token without an extra API call.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"]       = user.role
        token["full_name"]  = user.get_full_name()
        token["email"]      = user.email
        return token


# ── Registration ─────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model  = User
        fields = [
            "username", "email", "first_name", "last_name",
            "phone_number", "address", "role",
            "password", "password2",
        ]
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name":  {"required": True},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


# ── User Profile ─────────────────────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    """Read-only profile returned after login or on /me/ endpoint."""
    class Meta:
        model  = User
        fields = [
            "id", "username", "email",
            "first_name", "last_name",
            "phone_number", "address", "role",
            "date_joined",
        ]
        read_only_fields = fields


# ── User List (Admin only) ────────────────────────────────────────────────────

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = [
            "id", "username", "email",
            "first_name", "last_name",
            "role", "is_active", "date_joined",
        ]
