"""add_indexes

Revision ID: cbba4a6a40b6
Revises: 7a41137ed3b9
Create Date: 2026-05-24 20:43:36.483608

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cbba4a6a40b6'
down_revision: Union[str, Sequence[str], None] = '7a41137ed3b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_attempts_user_id", "attempts", ["user_id"])
    op.create_index("ix_attempts_date", "attempts", ["date"])
    op.create_index("ix_responses_attempt_id", "responses", ["attempt_id"])
    op.create_index("ix_generated_papers_user_id", "generated_papers", ["user_id"])
    op.create_index("ix_resume_profiles_user_id", "resume_profiles", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_attempts_user_id", "attempts")
    op.drop_index("ix_attempts_date", "attempts")
    op.drop_index("ix_responses_attempt_id", "responses")
    op.drop_index("ix_generated_papers_user_id", "generated_papers")
    op.drop_index("ix_resume_profiles_user_id", "resume_profiles")
