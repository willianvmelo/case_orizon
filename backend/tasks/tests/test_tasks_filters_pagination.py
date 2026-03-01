import pytest
from tasks.models import Task


@pytest.mark.django_db
def test_tasks_list_is_paginated_by_default(auth_client_a, user_a):
    # cria 15 tasks para user A
    Task.objects.bulk_create([Task(title=f"T{i}", owner=user_a) for i in range(15)])

    res = auth_client_a.get("/api/tasks/")
    assert res.status_code == 200

    assert "count" in res.data
    assert "results" in res.data
    assert res.data["count"] == 15
    assert len(res.data["results"]) == 10  # default page size


@pytest.mark.django_db
def test_tasks_pagination_page_2(auth_client_a, user_a):
    Task.objects.bulk_create([Task(title=f"T{i}", owner=user_a) for i in range(15)])

    res = auth_client_a.get("/api/tasks/?page=2")
    assert res.status_code == 200
    assert len(res.data["results"]) == 5


@pytest.mark.django_db
def test_filter_by_completed(auth_client_a, user_a):
    Task.objects.create(title="done", owner=user_a, completed=True)
    Task.objects.create(title="todo", owner=user_a, completed=False)

    res = auth_client_a.get("/api/tasks/?completed=true")
    assert res.status_code == 200
    titles = [t["title"] for t in res.data["results"]]
    assert "done" in titles
    assert "todo" not in titles


@pytest.mark.django_db
def test_search_filters_title_and_description(auth_client_a, user_a):
    Task.objects.create(title="Buy milk", description="supermarket", owner=user_a)
    Task.objects.create(title="Pay bills", description="electricity", owner=user_a)

    res = auth_client_a.get("/api/tasks/?search=milk")
    assert res.status_code == 200
    titles = [t["title"] for t in res.data["results"]]
    assert titles == ["Buy milk"]


@pytest.mark.django_db
def test_ordering_by_title(auth_client_a, user_a):
    Task.objects.create(title="B", owner=user_a)
    Task.objects.create(title="A", owner=user_a)

    res = auth_client_a.get("/api/tasks/?ordering=title")
    assert res.status_code == 200
    titles = [t["title"] for t in res.data["results"]]
    assert titles[:2] == ["A", "B"]