import pytest
from app.services.scoring_service import (
    calculate_coding_score,
    calculate_theory_score,
    calculate_total_score,
)


def test_coding_score_all_passed():
    results = [{"passed": True}, {"passed": True}, {"passed": True}]
    assert calculate_coding_score(results) == 100.0


def test_coding_score_partial():
    results = [{"passed": True}, {"passed": False}, {"passed": True}]
    assert calculate_coding_score(results) == pytest.approx(66.67, rel=1e-2)


def test_coding_score_none_passed():
    results = [{"passed": False}, {"passed": False}]
    assert calculate_coding_score(results) == 0.0


def test_coding_score_empty():
    assert calculate_coding_score([]) == 0.0


def test_theory_score():
    evaluation = {"total_score": 78}
    assert calculate_theory_score(evaluation) == 78.0


def test_total_score_weighting():
    # 40% coding + 60% theory
    total = calculate_total_score(coding_score=100.0, theory_score=100.0)
    assert total == 100.0

    total = calculate_total_score(coding_score=100.0, theory_score=0.0)
    assert total == 40.0

    total = calculate_total_score(coding_score=0.0, theory_score=100.0)
    assert total == 60.0


def test_total_score_mixed():
    total = calculate_total_score(coding_score=80.0, theory_score=70.0)
    assert total == pytest.approx(74.0)