from services.study_guide_service import (
    fallback_plan,
    time_band_from_days,
    validate_plan_days,
)
from schemas.study_guide_schemas import StudyGuideAiResponse


def test_time_band_from_days() -> None:
    assert time_band_from_days(20) == "14+"
    assert time_band_from_days(10) == "7-13"
    assert time_band_from_days(5) == "3-6"
    assert time_band_from_days(1) == "1-2"
    assert time_band_from_days(0) == "exam_day"


def test_fallback_plan_respects_days_until_exam() -> None:
    plan = fallback_plan(
        3,
        [{"topic_name": "Price Elasticity"}],
        [{"bloom_label": "Apply"}],
        "en",
    )

    validated_plan = StudyGuideAiResponse.model_validate(plan)
    validate_plan_days(validated_plan, 3, "3-6")

    assert len(validated_plan.plan) == 3
    assert validated_plan.plan[0].day_number == 1
    assert validated_plan.plan[0].focus_topics == ["Price Elasticity"]
