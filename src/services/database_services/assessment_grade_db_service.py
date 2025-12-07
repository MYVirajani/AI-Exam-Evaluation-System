import logging
from src.services.database_services.base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class AssessmentGradeDBService(BaseRelationalDB):
    def __init__(self):
        super().__init__()
        self.create_table()

    # ----------------------------------------------------------------------
    def create_table(self):
        """Create Assessment_Grade table matching composite PK Prisma schema."""
        try:
            # Create table using composite primary key
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS "Assessment_Grade" (
                    model_id TEXT NOT NULL,
                    submission_id TEXT NOT NULL,
                    assessment_id TEXT NOT NULL,
                    score DECIMAL(5,2),
                    max_marks DECIMAL(5,2),
                    created_on TIMESTAMPTZ DEFAULT NOW(),
                    updated_on TIMESTAMPTZ DEFAULT NOW(),

                    PRIMARY KEY (model_id, submission_id, assessment_id)
                );
            """)

            # Timestamp update trigger
            self.cursor.execute("""
                CREATE OR REPLACE FUNCTION set_updated_on()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_on = NOW();
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            """)

            self.cursor.execute("""
                DROP TRIGGER IF EXISTS update_timestamp_assessment_grade ON "Assessment_Grade";
            """)

            self.cursor.execute("""
                CREATE TRIGGER update_timestamp_assessment_grade
                BEFORE UPDATE ON "Assessment_Grade"
                FOR EACH ROW
                EXECUTE FUNCTION set_updated_on();
            """)

            self.commit()
            logger.info("Ensured Assessment_Grade table (composite PK) exists.")

        except Exception as e:
            logger.error(f"Failed creating Assessment_Grade table: {e}")
            raise

    # ----------------------------------------------------------------------
    def get_existing_grade(self, submission_id: str, assessment_id: str, model_id: str):
        """Return existing record for composite key."""
        try:
            self.cursor.execute(
                """
                SELECT score, max_marks 
                FROM "Assessment_Grade"
                WHERE model_id=%s AND submission_id=%s AND assessment_id=%s
                """,
                (model_id, submission_id, assessment_id)
            )
            return self.cursor.fetchone()
        except Exception as e:
            logger.error(f"Failed fetching existing Assessment_Grade: {e}")
            raise

    # ----------------------------------------------------------------------
    def upsert_assessment_grade(self, submission_id: str, assessment_id: str,
                                model_id: str, total_score: float, total_max_marks: float):
        """Insert or update row based on composite PK."""

        existing = self.get_existing_grade(submission_id, assessment_id, model_id)

        # ------------------- UPDATE -------------------
        if existing:
            try:
                self.cursor.execute(
                    """
                    UPDATE "Assessment_Grade"
                    SET score=%s, max_marks=%s
                    WHERE model_id=%s AND submission_id=%s AND assessment_id=%s
                    """,
                    (total_score, total_max_marks, model_id, submission_id, assessment_id)
                )
                self.commit()
                logger.info(
                    f"Updated Assessment_Grade ({model_id}, {submission_id}, {assessment_id})"
                )
                return {
                    "model_id": model_id,
                    "submission_id": submission_id,
                    "assessment_id": assessment_id
                }
            except Exception as e:
                logger.error(f"Failed updating Assessment_Grade: {e}")
                raise

        # ------------------- INSERT -------------------
        try:
            self.cursor.execute(
                """
                INSERT INTO "Assessment_Grade"
                (model_id, submission_id, assessment_id, score, max_marks)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (model_id, submission_id, assessment_id, total_score, total_max_marks)
            )
            self.commit()
            logger.info(
                f"Inserted new Assessment_Grade ({model_id}, {submission_id}, {assessment_id})"
            )
            return {
                "model_id": model_id,
                "submission_id": submission_id,
                "assessment_id": assessment_id
            }

        except Exception as e:
            logger.error(f"Failed inserting Assessment_Grade: {e}")
            raise
