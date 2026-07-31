import asyncio
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from core.config import get_settings
from core.security import hash_password


TOPICS = [
    "Supply and Demand",
    "Price Elasticity",
    "Consumer Theory",
    "Production and Costs",
    "Perfect Competition",
    "Monopoly",
    "Market Failure and Externalities",
    "International Trade",
]

BLOOM_LABELS = {
    1: "Remember",
    2: "Understand",
    3: "Apply",
    4: "Analyze",
    5: "Evaluate",
    6: "Create",
}


async def main() -> None:
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.mongodb_db_name]

    await clear_demo_data(database)

    now = datetime.now(timezone.utc)
    user_id = ObjectId()
    course_id = ObjectId()
    exam_date = now + timedelta(days=14)

    await database["users"].insert_one(
        {
            "_id": user_id,
            "email": "demo@example.com",
            "display_name": "Demo Student",
            "hashed_password": hash_password("demo1234"),
            "location_country": "United States",
            "language": "en",
            "created_at": now,
        }
    )
    await database["courses"].insert_one(
        {
            "_id": course_id,
            "user_id": str(user_id),
            "name": "ECON 201 — Microeconomics",
            "university": "Demo University",
            "language": "en",
            "exam_date": exam_date,
            "created_at": now,
        }
    )

    topic_ids = await insert_topics(database, user_id, course_id, now)
    question_ids = await insert_questions(database, user_id, course_id, topic_ids, now)
    diagnostic_id = await insert_diagnostic(database, user_id, course_id, question_ids[:20], now)
    await insert_study_guide(database, user_id, course_id, exam_date, 1, "diagnostic", now)
    mock_1_id = await insert_mock(database, user_id, course_id, question_ids[20:30], 1, 0.62, now)
    mock_2_id = await insert_mock(database, user_id, course_id, question_ids[30:40], 2, 0.76, now)

    await insert_score_history(database, user_id, course_id, diagnostic_id, mock_1_id, mock_2_id, now)

    print("Demo data ready: demo@example.com / demo1234")


async def clear_demo_data(database) -> None:
    user = await database["users"].find_one({"email": "demo@example.com"})
    if user is None:
        return

    user_id = str(user["_id"])
    for collection in [
        "attempts",
        "courses",
        "mock_exam_attempts",
        "mock_exams",
        "questions",
        "quizzes",
        "score_history",
        "study_guides",
        "topics",
        "users",
        "uploaded_files",
    ]:
        await database[collection].delete_many({"user_id": user_id})


async def insert_topics(database, user_id, course_id, now):
    topic_ids = {}
    for topic in TOPICS:
        topic_id = ObjectId()
        topic_ids[topic] = topic_id
        await database["topics"].insert_one(
            {
                "_id": topic_id,
                "course_id": str(course_id),
                "user_id": str(user_id),
                "name": topic,
                "description": f"Core exam material for {topic}.",
                "bloom_skills": ["identify", "explain", "calculate", "analyze"],
                "source_evidence": "Demo source evidence",
                "is_custom": False,
                "is_approved": True,
                "created_at": now,
            }
        )
    return topic_ids


async def insert_questions(database, user_id, course_id, topic_ids, now):
    question_ids = []
    for index in range(40):
        topic = TOPICS[index % len(TOPICS)]
        bloom_level = (index % 6) + 1
        question_id = ObjectId()
        question_ids.append(question_id)
        await database["questions"].insert_one(
            {
                "_id": question_id,
                "course_id": str(course_id),
                "user_id": str(user_id),
                "topic_id": str(topic_ids[topic]),
                "topic_name": topic,
                "skill": f"practice {topic}",
                "bloom_level": bloom_level,
                "bloom_label": BLOOM_LABELS[bloom_level],
                "question_type": "mcq",
                "question_text": f"Demo Q{index + 1}: Which answer best fits {topic}?",
                "options": ["A. Correct", "B. Distractor", "C. Distractor", "D. Distractor"],
                "correct_answer": "A",
                "explanation": f"A is correct because it matches the key idea in {topic}.",
                "source_ref": "Demo page 1",
                "difficulty": "medium",
                "created_at": now,
            }
        )
    return question_ids


async def insert_diagnostic(database, user_id, course_id, question_ids, now):
    quiz_id = ObjectId()
    await database["quizzes"].insert_one(
        {
            "_id": quiz_id,
            "course_id": str(course_id),
            "user_id": str(user_id),
            "quiz_type": "diagnostic",
            "question_ids": [str(question_id) for question_id in question_ids],
            "bloom_distribution": {"1": 4, "2": 4, "3": 3, "4": 3, "5": 3, "6": 3},
            "status": "submitted",
            "created_at": now,
            "submitted_at": now,
            "weakness_report": {
                "topic_scores": {},
                "bloom_scores": {},
                "skill_scores": {},
                "weak_topics": [
                    {"topic_name": "Monopoly", "accuracy": 0.35, "avg_time": 110, "question_count": 3, "weakness_score": 0.55},
                    {"topic_name": "Price Elasticity", "accuracy": 0.45, "avg_time": 95, "question_count": 4, "weakness_score": 0.48},
                ],
                "weak_bloom_levels": [
                    {"bloom_level": 3, "bloom_label": "Apply", "accuracy": 0.42, "question_count": 3},
                    {"bloom_level": 4, "bloom_label": "Analyze", "accuracy": 0.38, "question_count": 3},
                ],
                "weakest_skills": [],
                "weakness_summary": "Focus on elasticity calculations and monopoly diagrams.",
                "computed_at": now,
            },
        }
    )
    return quiz_id


async def insert_study_guide(database, user_id, course_id, exam_date, version, trigger, now):
    await database["study_guides"].insert_one(
        {
            "course_id": str(course_id),
            "user_id": str(user_id),
            "version": version,
            "trigger": trigger,
            "exam_date": exam_date,
            "days_until_exam": 14,
            "time_band": "14+",
            "weak_topics_input": [{"topic_name": "Monopoly", "accuracy": 0.35, "weakness_score": 0.55}],
            "bloom_gaps_input": [{"bloom_level": 3, "bloom_label": "Apply", "accuracy": 0.42}],
            "plan": [
                {
                    "day_number": day,
                    "date_label": f"Day {day}",
                    "focus_topics": ["Monopoly", "Price Elasticity"],
                    "bloom_focus": ["Apply", "Analyze"],
                    "activities": ["Review notes", "Solve 8 practice questions", "Explain one mistake"],
                    "estimated_hours": 2.0,
                    "practice_question_count": 8,
                }
                for day in range(1, 8)
            ],
            "generated_at": now,
        }
    )


async def insert_mock(database, user_id, course_id, question_ids, mock_number, score, now):
    mock_id = ObjectId()
    correct_count = round(score * len(question_ids))
    await database["mock_exams"].insert_one(
        {
            "_id": mock_id,
            "course_id": str(course_id),
            "user_id": str(user_id),
            "mock_number": mock_number,
            "time_band": "14+",
            "days_until_exam": 14 - mock_number,
            "question_count": len(question_ids),
            "duration_minutes": 80,
            "question_ids": [str(question_id) for question_id in question_ids],
            "weak_topic_boost": {"Monopoly": 2.0},
            "bloom_distribution": {"1": 2, "2": 2, "3": 2, "4": 2, "5": 1, "6": 1},
            "status": "submitted",
            "created_at": now + timedelta(days=mock_number),
            "submitted_at": now + timedelta(days=mock_number),
        }
    )
    await database["mock_exam_attempts"].insert_one(
        {
            "mock_exam_id": str(mock_id),
            "course_id": str(course_id),
            "user_id": str(user_id),
            "mock_number": mock_number,
            "total_score": score,
            "correct_count": correct_count,
            "topic_scores": {"Monopoly": {"accuracy": score, "question_count": 3}},
            "bloom_scores": {"1": score, "2": score, "3": score - 0.1, "4": score - 0.1},
            "vs_diagnostic": score - 0.48,
            "vs_previous_mock": None if mock_number == 1 else 0.14,
            "answers": [],
            "trend": "first_mock" if mock_number == 1 else "improving",
            "study_guide_id": None,
            "study_guide_version": version_for_mock(mock_number),
            "created_at": now + timedelta(days=mock_number),
        }
    )
    await insert_study_guide(database, user_id, course_id, now + timedelta(days=14), version_for_mock(mock_number), f"mock_{mock_number}", now + timedelta(days=mock_number))
    return mock_id


async def insert_score_history(database, user_id, course_id, diagnostic_id, mock_1_id, mock_2_id, now):
    rows = [
        ("diagnostic", diagnostic_id, 0, 0.48, {"Monopoly": 0.35, "Price Elasticity": 0.45}, {"1": 0.7, "2": 0.6, "3": 0.42, "4": 0.38}, 14),
        ("mock", mock_1_id, 1, 0.62, {"Monopoly": 0.55, "Price Elasticity": 0.6}, {"1": 0.7, "2": 0.68, "3": 0.55, "4": 0.52}, 13),
        ("mock", mock_2_id, 2, 0.76, {"Monopoly": 0.72, "Price Elasticity": 0.75}, {"1": 0.82, "2": 0.78, "3": 0.72, "4": 0.7}, 12),
    ]
    for event_type, event_id, event_number, total_score, topic_scores, bloom_scores, days_until_exam in rows:
        await database["score_history"].insert_one(
            {
                "course_id": str(course_id),
                "user_id": str(user_id),
                "event_type": event_type,
                "event_id": str(event_id),
                "event_number": event_number,
                "total_score": total_score,
                "topic_scores": topic_scores,
                "bloom_scores": bloom_scores,
                "days_until_exam": days_until_exam,
                "recorded_at": now + timedelta(days=event_number),
            }
        )


def version_for_mock(mock_number: int) -> int:
    return mock_number + 1


if __name__ == "__main__":
    asyncio.run(main())
