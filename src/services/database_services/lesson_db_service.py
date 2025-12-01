import logging
from datetime import datetime
from src.services.database_services.base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class LessonDBService(BaseRelationalDB):
    def __init__(self):
        super().__init__()
        self.create_lesson_table()

    # ----------------------------------------------------
    # CREATE LESSON TABLE
    # ----------------------------------------------------
    def create_lesson_table(self):
        sql = """
        CREATE TABLE IF NOT EXISTS "Lesson" (
            lesson_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            module_id VARCHAR(255) NOT NULL,
            title TEXT,
            created_by VARCHAR(255),
            created_on TIMESTAMPTZ DEFAULT NOW(),
            updated_on TIMESTAMPTZ DEFAULT NOW(),

            CONSTRAINT fk_module
                FOREIGN KEY (module_id)
                REFERENCES "Module"(module_id),

            CONSTRAINT fk_educator
                FOREIGN KEY (created_by)
                REFERENCES "Educator"(user_id)
        );
        """

        try:
            self.cursor.execute(sql)
            self.commit()
        except Exception as e:
            logger.error(f"Failed creating Lesson table: {e}")
            raise

    # ----------------------------------------------------
    # GET LESSON IDS (module_id REQUIRED, lecturer_id OPTIONAL)
    # ----------------------------------------------------
    def get_lesson_ids(self, module_id: str, lecturer_id: str = None):
        """
        Returns lesson_id list filtered by:
            - module_id (required)
            - if lecturer_id provided → include:
                  • lessons created by that lecturer
                  • lessons where created_by IS NULL
        """

        # Base query (module_id is always required)
        sql = """
        SELECT lesson_id
        FROM "Lesson"
        WHERE module_id = %s
        """

        params = [module_id]

        if lecturer_id:
            # Return:
            #   - created_by = lecturer_id
            #   - created_by IS NULL (global/anyone)
            sql += """
                AND (
                    created_by = %s
                    OR created_by IS NULL
                )
            """
            params.append(lecturer_id)

        sql += " ORDER BY created_on ASC;"

        try:
            self.cursor.execute(sql, tuple(params))
            rows = self.cursor.fetchall()

            lesson_ids = [row[0] for row in rows]

            logger.info(
                f"Fetched {len(lesson_ids)} lessons for module={module_id}, lecturer={lecturer_id}"
            )

            return lesson_ids

        except Exception as e:
            logger.error(
                f"Error fetching lesson IDs for module={module_id}, lecturer={lecturer_id}: {e}"
            )
            raise

    # ----------------------------------------------------
    # GET FULL LESSON DATA (OPTIONAL)
    # ----------------------------------------------------
    def get_lesson_details(self, module_id: str):
        """
        Returns complete lesson records for a module.
        """

        sql = """
        SELECT lesson_id, module_id, title, created_by, created_on, updated_on
        FROM "Lesson"
        WHERE module_id = %s
        ORDER BY created_on ASC;
        """

        try:
            self.cursor.execute(sql, (module_id,))
            return self.cursor.fetchall()

        except Exception as e:
            logger.error(f"Error fetching lesson details for module={module_id}: {e}")
            raise
