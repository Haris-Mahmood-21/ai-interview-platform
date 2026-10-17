from unittest.mock import patch
from app.services.judge0_client import submit_code


def test_submit_code_injects_future_annotations_for_python():
    """Verify that Python code automatically receives __future__ annotations for PEP 585 support."""
    user_code = "def process_shapes(shapes: list[Shape]) -> list[Shape]:\n    return shapes"

    with patch("app.services.judge0_client._create_submission") as mock_create, \
         patch("app.services.judge0_client._poll_result") as mock_poll:
        mock_create.return_value = "fake_token"
        mock_poll.return_value = {"status": "accepted"}

        submit_code(source_code=user_code, language="python")

        assert mock_create.called
        called_source = mock_create.call_args[0][0]
        assert called_source.startswith("from __future__ import annotations\n")
        assert "def process_shapes(shapes: list[Shape]) -> list[Shape]:" in called_source


def test_submit_code_does_not_duplicate_future_annotations():
    """Verify that existing __future__ annotations are not duplicated."""
    user_code = "from __future__ import annotations\ndef test(x: list[int]): pass"

    with patch("app.services.judge0_client._create_submission") as mock_create, \
         patch("app.services.judge0_client._poll_result") as mock_poll:
        mock_create.return_value = "fake_token"
        mock_poll.return_value = {"status": "accepted"}

        submit_code(source_code=user_code, language="python")

        assert mock_create.called
        called_source = mock_create.call_args[0][0]
        assert called_source.count("from __future__ import annotations") == 1


def test_submit_code_does_not_inject_for_other_languages():
    """Verify that non-Python languages are unmodified."""
    js_code = "console.log('hello');"

    with patch("app.services.judge0_client._create_submission") as mock_create, \
         patch("app.services.judge0_client._poll_result") as mock_poll:
        mock_create.return_value = "fake_token"
        mock_poll.return_value = {"status": "accepted"}

        submit_code(source_code=js_code, language="javascript")

        assert mock_create.called
        called_source = mock_create.call_args[0][0]
        assert "from __future__ import annotations" not in called_source

