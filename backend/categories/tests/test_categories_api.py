import pytest
from categories.models import Category


@pytest.mark.django_db
def test_categories_requires_authentication(api_client):
    res = api_client.get("/api/categories/")
    assert res.status_code == 401


@pytest.mark.django_db
def test_user_can_create_and_list_own_categories(auth_client_a, user_a):
    create = auth_client_a.post("/api/categories/", {"name": "Trabalho"}, format="json")
    assert create.status_code == 201
    cat_id = create.data["id"]

    lst = auth_client_a.get("/api/categories/")
    assert lst.status_code == 200
    ids = [c["id"] for c in lst.data["results"]] if "results" in lst.data else [c["id"] for c in lst.data]
    assert cat_id in ids

    cat = Category.objects.get(id=cat_id)
    assert cat.owner_id == user_a.id


@pytest.mark.django_db
def test_user_cannot_see_other_users_categories(auth_client_a, auth_client_b, user_a):
    create = auth_client_a.post("/api/categories/", {"name": "Privada"}, format="json")
    assert create.status_code == 201
    cat_id = create.data["id"]

    lst_b = auth_client_b.get("/api/categories/")
    assert lst_b.status_code == 200
    ids_b = [c["id"] for c in lst_b.data["results"]] if "results" in lst_b.data else [c["id"] for c in lst_b.data]
    assert cat_id not in ids_b