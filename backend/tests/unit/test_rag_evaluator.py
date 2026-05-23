from app.services.followup_generator import should_ask_followup, get_weak_criteria


def test_no_followup_for_excellent_answer():
    evaluation = {"total_score": 90}
    should_ask, count = should_ask_followup(evaluation)
    assert should_ask is False
    assert count == 0


def test_one_followup_for_decent_answer():
    evaluation = {"total_score": 72}
    should_ask, count = should_ask_followup(evaluation)
    assert should_ask is True
    assert count == 1


def test_two_followups_for_weak_answer():
    evaluation = {"total_score": 45}
    should_ask, count = should_ask_followup(evaluation)
    assert should_ask is True
    assert count == 2


def test_get_weak_criteria_identifies_low_scores():
    evaluation = {
        "total_score": 50,
        "correctness": {"score": 10, "explanation": "Missed key concepts"},
        "clarity": {"score": 20, "explanation": "Reasonably clear"},
        "depth": {"score": 8, "explanation": "Very surface level"},
        "conceptual_understanding": {"score": 12, "explanation": "Gaps present"},
    }
    weak = get_weak_criteria(evaluation)
    # depth (8) and correctness (10) and conceptual_understanding (12) are below 15
    weak_names = [w["criterion"] for w in weak]
    assert "depth" in weak_names
    assert "correctness" in weak_names
    # clarity (20) should NOT be in weak list
    assert "clarity" not in weak_names


def test_get_weak_criteria_empty_for_strong_answer():
    evaluation = {
        "total_score": 88,
        "correctness": {"score": 23, "explanation": "Excellent"},
        "clarity": {"score": 22, "explanation": "Very clear"},
        "depth": {"score": 20, "explanation": "Good depth"},
        "conceptual_understanding": {"score": 23, "explanation": "Strong"},
    }
    weak = get_weak_criteria(evaluation)
    assert weak == []