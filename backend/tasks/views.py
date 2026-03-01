from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .filters import TaskFilter
from .models import Task
from .permissions import IsOwnerOrSharedReadOnly
from .serializers import TaskSerializer, ShareSerializer

User = get_user_model()

class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrSharedReadOnly]

    filterset_class = TaskFilter
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "title", "completed"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(Q(owner=user) | Q(shared_with=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        task = self.get_object()

        # Só owner pode compartilhar
        if task.owner_id != request.user.id:
            return Response({"detail": "Only the owner can share tasks."}, status=status.HTTP_403_FORBIDDEN)

        ser = ShareSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        users = list(User.objects.filter(email__in=ser.validated_data["emails"]).exclude(id=task.owner_id))
        task.shared_with.add(*users)

        return Response({"shared_added": len(users)})

    @action(detail=True, methods=["post"])
    def unshare(self, request, pk=None):
        task = self.get_object()

        if task.owner_id != request.user.id:
            return Response({"detail": "Only the owner can unshare tasks."}, status=status.HTTP_403_FORBIDDEN)

        ser = ShareSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        users = list(User.objects.filter(email__in=ser.validated_data["emails"]))
        task.shared_with.remove(*users)

        return Response({
        "shared_removed": len(users),
        "shared_with_emails": list(task.shared_with.values_list("email", flat=True)),
        }
)   