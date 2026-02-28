from django.contrib import admin
from django.urls import path, include
from .api import health

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/tasks/", include("tasks.urls")),
    path("api/categories/", include("categories.urls")),
]
