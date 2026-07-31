from services.score_history_service import overall_trend, readiness_status, trend_from_change


def test_readiness_status_rules() -> None:
    assert readiness_status(75, 10) == "on_track"
    assert readiness_status(55, 10) == "at_risk"
    assert readiness_status(35, 10) == "critical"
    assert readiness_status(45, 2) == "critical"


def test_score_history_trend_rules() -> None:
    assert trend_from_change(0.08) == "improving"
    assert trend_from_change(-0.08) == "declining"
    assert trend_from_change(0.02) == "stagnant"
    assert trend_from_change(None) == "insufficient_data"


def test_overall_trend_uses_last_two_events() -> None:
    rows = [
        {"total_score": 0.4},
        {"total_score": 0.5},
        {"total_score": 0.62},
    ]

    assert overall_trend(rows) == "improving"
