from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsAdmin
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserListSerializer,
    UserProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Public endpoint — no authentication required.
    Returns the created user's profile on success.
    """
    queryset         = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "Registration successful.",
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Returns access + refresh tokens with role and user info embedded in the JWT.
    Email is used as the login credential (set via USERNAME_FIELD on the model).
    """
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the currently authenticated user's profile.
    Requires a valid JWT in the Authorization header.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)


class UserListView(generics.ListAPIView):
    """
    GET /api/auth/users/
    Returns a list of all users. Admin only.
    """
    queryset           = User.objects.all()
    serializer_class   = UserListSerializer
    permission_classes = [IsAdmin]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/auth/users/<id>/
    Admin only — retrieve, update, or deactivate any user.
    """
    queryset           = User.objects.all()
    serializer_class   = UserProfileSerializer
    permission_classes = [IsAdmin]
