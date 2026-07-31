from services.auth_service import language_from_country


def test_language_from_country_detects_vietnam() -> None:
    assert language_from_country("Vietnam") == "vi"
    assert language_from_country("Viet Nam") == "vi"
    assert language_from_country("Việt Nam") == "vi"
    assert language_from_country("VN") == "vi"


def test_language_from_country_uses_english_for_us_and_other_locations() -> None:
    assert language_from_country("United States") == "en"
    assert language_from_country("USA") == "en"
    assert language_from_country("Canada") == "en"
