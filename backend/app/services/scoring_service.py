def calculate_coding_score(test_results: list[dict]) -> float:
    """
    Score = percentage of test cases passed.
    Returns a value between 0.0 and 100.0
    """
    if not test_results:
        return 0.0

    passed = sum(1 for r in test_results if r.get("passed", False))
    return round((passed / len(test_results)) * 100, 2)


def calculate_theory_score(evaluation: dict) -> float:
    """
    Extract total score from RAG evaluation.
    Already out of 100 (4 criteria × 25 points each).
    """
    return float(evaluation.get("total_score", 0))


def calculate_total_score(coding_score: float, theory_score: float) -> float:
    """
    Final score = 40% coding + 60% theory
    as per FYP documentation TABLE 3.4
    """
    return round((coding_score * 0.4) + (theory_score * 0.6), 2)