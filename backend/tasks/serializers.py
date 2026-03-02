from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    shared_with_emails = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "completed", "category","category_name",
            "shared_with_emails",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "shared_with_emails"]

    def get_shared_with_emails(self, obj):
        return list(obj.shared_with.values_list("email", flat=True))

class ShareSerializer(serializers.Serializer):
    emails = serializers.ListField(
        child=serializers.EmailField(),
        allow_empty=False
    )

    def validate_emails(self, emails):
        emails = list(dict.fromkeys([e.strip().lower() for e in emails]))
        users = User.objects.filter(email__in=emails)

        if users.count() != len(emails):
            found = set(users.values_list("email", flat=True))
            missing = [e for e in emails if e not in found]
            raise serializers.ValidationError({"missing_emails": missing})

        return emails