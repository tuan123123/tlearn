from services.upload_service import get_file_type_from_filename


def test_upload_file_type_detection_allows_pdf_and_pptx() -> None:
    assert get_file_type_from_filename("lecture.pdf") == "pdf"
    assert get_file_type_from_filename("slides.PPTX") == "pptx"


def test_upload_file_type_detection_rejects_docx_for_phase_2() -> None:
    assert get_file_type_from_filename("notes.docx") is None
