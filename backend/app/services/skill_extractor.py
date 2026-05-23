import re
import spacy

nlp = spacy.load("en_core_web_sm")

# Master list of known tech keywords — expand this as needed
TECH_KEYWORDS = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go",
    "rust", "swift", "kotlin", "php", "ruby", "scala", "r",
    # Frontend
    "react", "next.js", "nextjs", "vue", "angular", "tailwind",
    "html", "css", "sass", "redux", "zustand",
    # Backend
    "fastapi", "django", "flask", "express", "node.js", "nodejs",
    "spring", "laravel", "rails",
    # Databases
    "postgresql", "mysql", "sqlite", "mongodb", "redis",
    "chromadb", "supabase", "firebase",
    # AI/ML
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "huggingface", "langchain", "openai", "gemini",
    # DevOps/Tools
    "docker", "kubernetes", "git", "github", "linux",
    "aws", "gcp", "azure", "vercel", "railway",
    # APIs/Protocols
    "rest", "graphql", "websocket", "jwt", "oauth",
}


def extract_skills(sections: dict) -> list[str]:
    """
    Extract skills from the skills section using keyword matching,
    plus spaCy NER on the full resume for anything we missed.
    """
    found = set()

    # 1. Keyword match on the skills section text
    skills_text = sections.get("skills", "").lower()
    for keyword in TECH_KEYWORDS:
        if keyword in skills_text:
            found.add(keyword)

    # 2. Keyword match on experience and projects too
    for section in ["experience", "projects"]:
        text = sections.get(section, "").lower()
        for keyword in TECH_KEYWORDS:
            if keyword in text:
                found.add(keyword)

    # 3. spaCy NER — catch proper nouns that look like tech tools
    full_text = " ".join(sections.values())
    doc = nlp(full_text[:10000])  # limit for performance
    for ent in doc.ents:
        if ent.label_ in ("ORG", "PRODUCT"):
            candidate = ent.text.lower().strip()
            if candidate in TECH_KEYWORDS:
                found.add(candidate)

    return sorted(list(found))


def extract_projects(sections: dict) -> list[dict]:
    """
    Extract project summaries from the projects section.
    Returns a list of dicts with 'title' and 'description'.
    """
    projects_text = sections.get("projects", "")
    if not projects_text:
        return []

    projects = []
    # Split on lines that look like project titles
    # (short lines, possibly followed by a dash or colon)
    lines = projects_text.splitlines()
    current_title = None
    current_desc = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Heuristic: short lines (< 60 chars) with no period = likely a title
        if len(line) < 60 and not line.endswith(".") and not line.startswith("-"):
            if current_title:
                projects.append({
                    "title": current_title,
                    "description": " ".join(current_desc).strip()
                })
            current_title = line.rstrip(":-")
            current_desc = []
        else:
            current_desc.append(line.lstrip("-•·").strip())

    # Don't forget the last project
    if current_title:
        projects.append({
            "title": current_title,
            "description": " ".join(current_desc).strip()
        })

    return projects[:10]  # cap at 10 projects