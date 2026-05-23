import re
import fitz  # PyMuPDF


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using PyMuPDF."""
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text


def clean_text(text: str) -> str:
    """Remove noise artifacts common in PDF extraction."""
    # Remove non-printable characters
    text = re.sub(r"[^\x20-\x7E\n]", " ", text)

    # Collapse multiple spaces
    text = re.sub(r" {2,}", " ", text)

    # Collapse more than 2 consecutive newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Strip leading/trailing whitespace per line
    lines = [line.strip() for line in text.splitlines()]
    text = "\n".join(lines)

    return text.strip()


def detect_sections(text: str) -> dict:
    """
    Split resume text into labelled sections.
    Returns a dict like:
    {
        "skills": "Python, FastAPI, ...",
        "projects": "Built a web app ...",
        "education": "BS Computer Science ...",
        "experience": "Intern at XYZ ...",
    }
    """
    section_headers = {
        "skills": [
            "skills", "technical skills", "technologies",
            "tools", "competencies", "tech stack"
        ],
        "projects": [
            "projects", "personal projects", "academic projects",
            "side projects", "portfolio"
        ],
        "education": [
            "education", "academic background",
            "qualifications", "degrees"
        ],
        "experience": [
            "experience", "work experience", "employment",
            "internships", "professional experience"
        ],
    }

    # Build a flat header → section_key map
    header_map = {}
    for section_key, headers in section_headers.items():
        for h in headers:
            header_map[h.lower()] = section_key

    lines = text.splitlines()
    sections = {k: [] for k in section_headers}
    current_section = None

    for line in lines:
        stripped = line.strip().lower().rstrip(":")
        if stripped in header_map:
            current_section = header_map[stripped]
        elif current_section:
            sections[current_section].append(line)

    # Join each section's lines into a single string
    return {k: "\n".join(v).strip() for k, v in sections.items()}