import time
import httpx

from app.config import settings

# Judge0 language IDs
LANGUAGE_IDS = {
    "python": 71,
    "javascript": 63,
    "java": 62,
    "cpp": 54,
}

HEADERS = {
    "X-RapidAPI-Key": settings.JUDGE0_API_KEY,
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    "Content-Type": "application/json",
}

MAX_POLL_ATTEMPTS = 10
POLL_INTERVAL = 1.5  # seconds between polls


def submit_code(source_code: str, language: str, stdin: str = "") -> dict:
    """
    Submit code to Judge0 and wait for the result.
    Returns a dict with status, stdout, stderr, and compile_output.
    """
    language_id = LANGUAGE_IDS.get(language.lower())
    if not language_id:
        return {
            "status": "error",
            "error": f"Unsupported language: {language}. Supported: {list(LANGUAGE_IDS.keys())}",
            "stdout": "",
            "stderr": "",
        }

    # Step 1: Submit the code
    token = _create_submission(source_code, language_id, stdin)
    if not token:
        return {
            "status": "error",
            "error": "Failed to submit code to Judge0",
            "stdout": "",
            "stderr": "",
        }

    # Step 2: Poll for result
    return _poll_result(token)


def _create_submission(source_code: str, language_id: int, stdin: str) -> str | None:
    """Create a submission and return the token."""
    url = f"{settings.JUDGE0_BASE_URL}/submissions"
    payload = {
        "source_code": source_code,
        "language_id": language_id,
        "stdin": stdin,
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.post(url, json=payload, headers=HEADERS)
            response.raise_for_status()
            return response.json().get("token")
    except httpx.HTTPError as e:
        print(f"Judge0 submission error: {e}")
        return None


def _poll_result(token: str) -> dict:
    """Poll Judge0 until execution is complete."""
    url = f"{settings.JUDGE0_BASE_URL}/submissions/{token}"
    params = {"base64_encoded": "false", "fields": "*"}

    for attempt in range(MAX_POLL_ATTEMPTS):
        try:
            with httpx.Client(timeout=15.0) as client:
                response = client.get(url, headers=HEADERS, params=params)
                response.raise_for_status()
                data = response.json()

            status_id = data.get("status", {}).get("id", 0)

            # Status IDs: 1=queued, 2=processing, 3=accepted, 4+=error
            if status_id <= 2:
                # Still processing — wait and retry
                time.sleep(POLL_INTERVAL)
                continue

            return _parse_result(data)

        except httpx.HTTPError as e:
            print(f"Judge0 polling error (attempt {attempt + 1}): {e}")
            time.sleep(POLL_INTERVAL)

    return {
        "status": "timeout",
        "error": "Code execution timed out",
        "stdout": "",
        "stderr": "",
    }


def _parse_result(data: dict) -> dict:
    """Parse Judge0 response into a clean result dict."""
    status = data.get("status", {})
    status_id = status.get("id", 0)
    status_desc = status.get("description", "Unknown")

    stdout = data.get("stdout") or ""
    stderr = data.get("stderr") or ""
    compile_output = data.get("compile_output") or ""
    time_taken = data.get("time")
    memory_used = data.get("memory")

    # Status 3 = Accepted (successful execution)
    is_accepted = status_id == 3

    return {
        "status": "accepted" if is_accepted else "error",
        "status_description": status_desc,
        "stdout": stdout.strip(),
        "stderr": stderr.strip(),
        "compile_output": compile_output.strip(),
        "time": time_taken,
        "memory": memory_used,
        "passed": is_accepted,
    }