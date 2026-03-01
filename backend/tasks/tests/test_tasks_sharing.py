import pytest
from rest_framework.test import APIClient
from tasks.models import Task


@pytest.mark.django_db
def test_owner_can_share_and_shared_user_can_view(user_a, user_b):
    owner_client = APIClient()
    owner_client.force_authenticate(user=user_a)

    shared_client = APIClient()
    shared_client.force_authenticate(user=user_b)

    # owner creates a task
    create = owner_client.post(
        "/api/tasks/",
        {"title": "Shared task", "description": "x", "completed": False},
        format="json",
    )
    assert create.status_code == 201
    task_id = create.data["id"]

    # owner shares with user_b by email
    share = owner_client.post(
        f"/api/tasks/{task_id}/share/",
        {"emails": [user_b.email]},
        format="json",
    )
    assert share.status_code == 200
    assert share.data["shared_added"] == 1

    # shared user can see the task in list
    lst = shared_client.get("/api/tasks/")
    assert lst.status_code == 200
    ids = [t["id"] for t in lst.data["results"]]
    assert task_id in ids


@pytest.mark.django_db
def test_shared_user_cannot_update_or_delete(user_a, user_b):
    task = Task.objects.create(title="T1", owner=user_a)
    task.shared_with.add(user_b)

    shared_client = APIClient()
    shared_client.force_authenticate(user=user_b)

    # cannot patch
    patch = shared_client.patch(
        f"/api/tasks/{task.id}/",
        {"title": "hack"},
        format="json",
    )
    assert patch.status_code == 403

    # cannot delete
    delete = shared_client.delete(f"/api/tasks/{task.id}/")
    assert delete.status_code == 403


@pytest.mark.django_db
def test_only_owner_can_share_and_unshare(user_a, user_b):
    owner_client = APIClient()
    owner_client.force_authenticate(user=user_a)

    other_client = APIClient()
    other_client.force_authenticate(user=user_b)

    task = Task.objects.create(title="T1", owner=user_a)

    # non-owner cannot share
    res = other_client.post(
        f"/api/tasks/{task.id}/share/",
        {"emails": [user_a.email]},
        format="json",
    )
    assert res.status_code in (403, 404)  

    # owner shares
    res2 = owner_client.post(
        f"/api/tasks/{task.id}/share/",
        {"emails": [user_b.email]},
        format="json",
    )
    assert res2.status_code == 200

    # owner unshares
    res3 = owner_client.post(
        f"/api/tasks/{task.id}/unshare/",
        {"emails": [user_b.email]},
        format="json",
    )
    assert res3.status_code == 200
    print(res3.data)
    assert res3.data["shared_removed"] == 1

    # user_b no longer sees it
    lst = other_client.get("/api/tasks/")
    ids = [t["id"] for t in lst.data["results"]]
    assert task.id not in ids