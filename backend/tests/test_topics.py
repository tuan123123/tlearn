from pydantic import ValidationError

from schemas.topic_schemas import TOPIC_TRANSLATIONS, TopicAiItem
from services.topic_ai_service import truncate_text


def test_topic_validation_allows_template_topic() -> None:
    topic = TopicAiItem.model_validate(
        {
            "name": "Supply and Demand",
            "description": "Covers demand curves and market equilibrium.",
            "bloom_skills": ["identify"],
            "source_evidence": "Demand curve shifts are discussed.",
        }
    )

    assert topic.name == "Supply and Demand"


def test_topic_validation_rejects_non_template_topic() -> None:
    try:
        TopicAiItem.model_validate(
            {
                "name": "Macroeconomic Growth",
                "description": "Wrong course area.",
                "bloom_skills": ["explain"],
                "source_evidence": "GDP growth",
            }
        )
    except ValidationError:
        return

    raise AssertionError("Expected validation to reject non-template topic")


def test_truncate_text_limits_words() -> None:
    text = " ".join(str(index) for index in range(10))

    assert truncate_text(text, max_words=3) == "0 1 2"


def test_vietnamese_aliases_cover_core_topics() -> None:
    assert "cung và cầu" in TOPIC_TRANSLATIONS["Supply and Demand"]
    assert "độ co giãn theo giá" in TOPIC_TRANSLATIONS["Price Elasticity"]
    assert "ngoại tác" in TOPIC_TRANSLATIONS["Market Failure and Externalities"]
