from services.mock_exam_service import (
    compute_trend,
    select_mock_questions,
    target_bloom_distribution,
    time_band_from_days,
)


def test_mock_time_band_rules() -> None:
    assert time_band_from_days(20) == "14+"
    assert time_band_from_days(10) == "7-13"
    assert time_band_from_days(5) == "3-6"
    assert time_band_from_days(1) == "1-2"
    assert time_band_from_days(0) == "exam_day"


def test_mock_trend_rules() -> None:
    assert compute_trend(0.8, None) == "first_mock"
    assert compute_trend(0.8, 0.7) == "improving"
    assert compute_trend(0.7, 0.8) == "declining"
    assert compute_trend(0.72, 0.7) == "stagnant"


def test_target_bloom_distribution_covers_all_levels() -> None:
    distribution = target_bloom_distribution(10)

    assert sum(distribution.values()) == 10
    assert set(distribution.keys()) == {1, 2, 3, 4, 5, 6}


def test_select_mock_questions_boosts_weak_topics_without_repeats() -> None:
    questions = [
        {
            "_id": f"q-{index}",
            "bloom_level": (index % 6) + 1,
            "topic_name": "Monopoly" if index % 2 == 0 else "Supply and Demand",
        }
        for index in range(12)
    ]

    selected = select_mock_questions(questions, 6, {"Monopoly": 2.0})

    assert len(selected) == 6
    assert len({question["_id"] for question in selected}) == 6
    assert selected[0]["topic_name"] == "Monopoly"
