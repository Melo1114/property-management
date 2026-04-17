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
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
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
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)


class UserListView(generics.ListAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserListSerializer
    permission_classes = [IsAdmin]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserProfileSerializer
    permission_classes = [IsAdmin]
