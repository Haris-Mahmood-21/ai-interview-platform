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


def test_save_attempt_with_full_details_and_retrieve_session(client):
    """Verify full attempt persistence, question extraction, response unpacked feedback, and dashboard retrieval."""
    client.post("/auth/register", json={
        "name": "Session Tester",
        "email": "session_tester@test.com",
        "password": "password123",
    })
    login = client.post("/auth/login", json={
        "email": "session_tester@test.com",
        "password": "password123",
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    save_payload = {
        "category": "dsa",
        "mode": "general",
        "coding_score": 100.0,
        "theory_score": 88.0,
        "time_taken": 180,
        "results": [
            {
                "question_id": "llm_0",
                "type": "coding",
                "answer": "def twoSum(nums, target):\n    return [0, 1]",
                "language": "python",
                "score": 100.0,
                "completed": True,
                "question_text": "Given an array of integers, return indices of the two numbers such that they add up to target.",
                "difficulty": "medium",
                "source": "ai_generated",
                "code_result": {
                    "score": 100,
                    "passed_count": 3,
                    "total_count": 3,
                    "results": [
                        {
                            "test_case": 1,
                            "passed": True,
                            "expected": "[0, 1]",
                            "actual": "[0, 1]",
                            "status": "Passed",
                            "error": "",
                            "time": "0.012",
                        }
                    ],
                },
            },
            {
                "question_id": "llm_1",
                "type": "theory",
                "answer": "A binary search tree maintains sorted order where left child is less and right child is greater.",
                "score": 88.0,
                "completed": True,
                "question_text": "Explain the properties and time complexity of a Binary Search Tree.",
                "difficulty": "medium",
                "source": "ai_generated",
                "evaluation": {
                    "correctness": {"score": 23, "explanation": "Accurate properties."},
                    "clarity": {"score": 22, "explanation": "Clear definitions."},
                    "depth": {"score": 21, "explanation": "Good technical depth."},
                    "conceptual_understanding": {"score": 22, "explanation": "Strong conceptual grasp."},
                    "total_score": 88,
                    "overall_feedback": "Excellent explanation of BST.",
                    "improvement_suggestions": "Mention self-balancing BST variants.",
                },
                "followup_answers": [
                    {
                        "question": "What happens when a BST becomes degenerate (unbalanced)?",
                        "answer": "It degrades to a linked list with O(n) lookup time.",
                        "evaluation": {
                            "total_score": 95,
                            "overall_feedback": "Spot on regarding tree degradation.",
                        },
                    }
                ],
            },
        ],
    }

    save_res = client.post("/questions/attempts/save", json=save_payload, headers=headers)
    assert save_res.status_code == 200
    attempt_id = save_res.json()["attempt_id"]
    assert attempt_id > 0

    # Retrieve detailed session debrief
    detail_res = client.get(f"/dashboard/attempts/{attempt_id}", headers=headers)
    assert detail_res.status_code == 200
    data = detail_res.json()

    assert data["id"] == attempt_id
    assert data["category"] == "dsa"
    assert data["coding_score"] == 100.0
    assert data["theory_score"] == 88.0
    assert round(data["total_score"], 1) == 92.8
    assert len(data["responses"]) == 2

    # Verify coding response details
    coding_resp = next(r for r in data["responses"] if r["type"] == "coding")
    assert coding_resp["language"] == "python"
    assert coding_resp["score"] == 100.0
    assert coding_resp["code_result"]["passed_count"] == 3
    assert len(coding_resp["code_result"]["results"]) == 1
    assert coding_resp["code_result"]["results"][0]["passed"] is True
    assert "indices of the two numbers" in coding_resp["question_text"]

    # Verify theory response details
    theory_resp = next(r for r in data["responses"] if r["type"] == "theory")
    assert theory_resp["score"] == 88.0
    assert "Binary Search Tree" in theory_resp["question_text"]
    assert theory_resp["evaluation"]["correctness"]["score"] == 23
    assert theory_resp["evaluation"]["overall_feedback"] == "Excellent explanation of BST."
    assert len(theory_resp["followup_answers"]) == 1
    assert "degenerate" in theory_resp["followup_answers"][0]["question"]
    assert theory_resp["followup_answers"][0]["evaluation"]["total_score"] == 95

    # Verify dashboard stats and score trend
    stats_res = client.get("/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_sessions"] >= 1
    assert len(stats["score_trend"]) >= 1
    assert stats["score_trend"][-1]["score"] == 92.8