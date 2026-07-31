from services.weakness_service import build_weakness_report_from_attempts


def test_weakness_report_computes_topic_bloom_and_skill_scores() -> None:
    attempts = [
        {
            "topic_name": "Supply and Demand",
            "bloom_level": 1,
            "bloom_label": "Remember",
            "skill": "identify equilibrium",
            "score": 1.0,
            "time_spent_seconds": 30,
        },
        {
            "topic_name": "Supply and Demand",
            "bloom_level": 2,
            "bloom_label": "Understand",
            "skill": "explain demand shifts",
            "score": 0.0,
            "time_spent_seconds": 180,
        },
        {
            "topic_name": "Monopoly",
            "bloom_level": 3,
            "bloom_label": "Apply",
            "skill": "calculate monopoly profit",
            "score": 0.25,
            "time_spent_seconds": 120,
        },
    ]

    report = build_weakness_report_from_attempts(attempts, "summary")

    assert report["topic_scores"]["Supply and Demand"]["accuracy"] == 0.5
    assert report["topic_scores"]["Supply and Demand"]["avg_time"] == 105
    assert report["topic_scores"]["Monopoly"]["weakness_score"] == 0.6
    assert report["bloom_scores"]["2"]["accuracy"] == 0
    assert report["skill_scores"]["calculate monopoly profit"]["accuracy"] == 0.25
    assert report["weak_topics"][0]["topic_name"] == "Monopoly"
    assert report["weakest_skills"][0]["skill"] == "explain demand shifts"


def test_weakness_report_handles_no_weak_topics() -> None:
    attempts = [
        {
            "topic_name": "Supply and Demand",
            "bloom_level": 1,
            "bloom_label": "Remember",
            "skill": "identify equilibrium",
            "score": 1.0,
            "time_spent_seconds": 10,
        },
    ]

    report = build_weakness_report_from_attempts(attempts, "")

    assert report["weak_topics"] == []
    assert report["weak_bloom_levels"] == []
    assert report["weakest_skills"] == []
    assert "No major weak areas" in report["weakness_summary"]
