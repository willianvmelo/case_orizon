import django_filters
from .models import Task

class TaskFilter(django_filters.FilterSet):
    completed = django_filters.BooleanFilter(field_name="completed")
    category = django_filters.NumberFilter(field_name="category_id")

    class Meta:
        model = Task
        fields = ["completed", "category"]