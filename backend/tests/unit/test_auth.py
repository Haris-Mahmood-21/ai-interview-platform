def test_register_success(client):
    res = client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert res.status_code == 201
    assert res.json()["email"] == "test@example.com"


def test_register_duplicate_email(client):
    client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    res = client.post("/auth/register", json={
        "name": "Test User 2",
        "email": "test@example.com",
        "password": "password456"
    })
    assert res.status_code == 400


def test_login_success(client):
    client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    res = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password(client):
    client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    res = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401


def test_get_me(client):
    client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    login_res = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "test@example.com"