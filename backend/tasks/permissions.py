from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrSharedReadOnly(BasePermission):
    """
    Owner: pode tudo
    Shared: somente leitura (GET/HEAD/OPTIONS)
    """
    def has_object_permission(self, request, view, obj) -> bool:
        if obj.owner_id == request.user.id:
            return True
        if request.method in SAFE_METHODS:
            return obj.shared_with.filter(id=request.user.id).exists()
        return False