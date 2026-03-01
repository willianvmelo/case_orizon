import pytest
from tasks.models import Task


@pytest.mark.django_db
def test_tasks_requires_authentication(api_client):
    res = api_client.get("/api/tasks/")
    assert res.status_code == 401


@pytest.mark.django_db
def test_user_can_create_and_list_own_tasks(auth_client_a, user_a):
    
    create = auth_client_a.post(
        "/api/tasks/",
        {"title": "T1", "description": "x", "completed": False},
        format="json",
    )
    assert create.status_code == 201
    task_id = create.data["id"]

    
    lst = auth_client_a.get("/api/tasks/")
    assert lst.status_code == 200
    ids = [t["id"] for t in lst.data["results"]]
    assert task_id in ids

    
    task = Task.objects.get(id=task_id)
    assert task.owner_id == user_a.id


@pytest.mark.django_db
def test_user_cannot_see_other_users_tasks(auth_client_a, auth_client_b, user_a, user_b):
    
    res = auth_client_a.post(
        "/api/tasks/",
        {"title": "A-only", "description": "", "completed": False},
        format="json",
    )
    assert res.status_code == 201
    task_id = res.data["id"]

    
    lst_b = auth_client_b.get("/api/tasks/")
    assert lst_b.status_code == 200
    ids_b = [t["id"] for t in lst_b.data["results"]]
    assert task_id not in ids_b


@pytest.mark.django_db
def test_owner_can_update_and_delete_task(auth_client_a):
    
    create = auth_client_a.post(
        "/api/tasks/",
        {"title": "T1", "description": "x", "completed": False},
        format="json",
    )
    assert create.status_code == 201
    task_id = create.data["id"]

   
    patch = auth_client_a.patch(
        f"/api/tasks/{task_id}/",
        {"completed": True},
        format="json",
    )
    assert patch.status_code == 200
    assert patch.data["completed"] is True

    
    delete = auth_client_a.delete(f"/api/tasks/{task_id}/")
    assert delete.status_code == 204

    
    get_after = auth_client_a.get(f"/api/tasks/{task_id}/")
    assert get_after.status_code == 404