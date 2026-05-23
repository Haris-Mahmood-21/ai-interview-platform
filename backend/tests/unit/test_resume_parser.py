from app.services.resume_parser import clean_text, detect_sections


def test_clean_text_removes_noise():
    dirty = "Hello   World\n\n\n\nThis is a test"
    result = clean_text(dirty)
    assert "  " not in result
    assert result.count("\n\n\n") == 0


def test_detect_sections_finds_skills():
    text = """
John Doe

Skills
Python, FastAPI, Docker, React

Experience
Software Engineer at XYZ
"""
    sections = detect_sections(text)
    assert "python" in sections["skills"].lower() or \
           "fastapi" in sections["skills"].lower()


def test_detect_sections_finds_projects():
    text = """
Projects
AI Interview Platform
Built a web app using FastAPI and Next.js for interview preparation.
"""
    sections = detect_sections(text)
    assert "interview" in sections["projects"].lower()


def test_detect_sections_empty_resume():
    sections = detect_sections("")
    assert sections["skills"] == ""
    assert sections["projects"] == ""