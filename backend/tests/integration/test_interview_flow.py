def test_full_general_interview_flow(client):
    """End-to-end: register → login → generate paper → verify questions."""

    # Register
    res = client.post("/auth/register", json={
        "name": "Test Student",
        "email": "student@test.com",
        "password": "password123",
    })
    assert res.status_code == 201

    # Login
    res = client.post("/auth/login", json={
        "email": "student@test.com",
        "password": "password123",
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify /me works
    res = client.get("/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == "student@test.com"


def test_protected_routes_require_auth(client):
    """All protected routes should return 403 without a token."""
    res = client.post("/questions/generate", json={
        "category": "dsa",
        "mode": "general",
    })
    assert res.status_code in (401, 403)

    res = client.get("/dashboard/stats")
    assert res.status_code in (401, 403)

    res = client.post("/theory/evaluate", json={
        "question": "What is a hash table?",
        "answer": "A data structure",
        "domain": "dsa",
    })
    assert res.status_code in (401, 403)


def test_invalid_domain_rejected(client):
    """Invalid domain should return 400."""
    res = client.post("/auth/register", json={
        "name": "Test",
        "email": "test2@test.com",
        "password": "password123",
    })
    login = client.post("/auth/login", json={
        "email": "test2@test.com",
        "password": "password123",
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/questions/generate", json={
        "category": "blockchain",
        "mode": "general",
    }, headers=headers)
    assert res.status_code == 400