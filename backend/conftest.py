import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user_a(db):
    return User.objects.create_user(username="alice", email="alice@a.com", password="pass12345")

@pytest.fixture
def user_b(db):
    return User.objects.create_user(username="bob", email="bob@b.com", password="pass12345")

@pytest.fixture
def auth_client_a(api_client, user_a):
    api_client.force_authenticate(user=user_a)
    return api_client

@pytest.fixture
def auth_client_b(user_b):
    client = APIClient()
    client.force_authenticate(user=user_b)
    return client