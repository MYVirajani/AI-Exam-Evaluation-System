import logging
from datetime import datetime

from src.services.database_services.base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class LectureMaterialDBService(BaseRelationalDB):
    def __init__(self):
        super().__init__()
        self.create_tables()

    # ----------------------------------------------------
    # TABLE CREATION
    # ----------------------------------------------------
    def create_tables(self):
        # MAIN LECTURE MATERIAL TABLE (Corrected name: Lecture_Material)
        lecture_material_table = """
        CREATE TABLE IF NOT EXISTS "Lecture_Material" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            lesson_id VARCHAR(255) NOT NULL,
            file_name TEXT,
            file_url TEXT NOT NULL,
            media_extracted_file_url TEXT,
            created_on TIMESTAMPTZ DEFAULT NOW(),
            updated_on TIMESTAMPTZ DEFAULT NOW(),
            description TEXT
        );
        """

        # MEDIA TABLE (Correct FK Reference)
        lecture_material_media_table = """
        CREATE TABLE IF NOT EXISTS lecture_material_media (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            model_id VARCHAR(255) NOT NULL,
            lecture_material_id UUID NOT NULL,
            media_url TEXT NOT NULL,
            media_summary TEXT,
            created_on TIMESTAMPTZ DEFAULT NOW(),
            updated_on TIMESTAMPTZ DEFAULT NOW(),

            CONSTRAINT fk_lecture_material
                FOREIGN KEY (lecture_material_id)
                REFERENCES "Lecture_Material"(id)
                ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_lmm_lecture_material_id 
            ON lecture_material_media(lecture_material_id);

        CREATE INDEX IF NOT EXISTS idx_lmm_model_id 
            ON lecture_material_media(model_id);
        """

        try:
            self.cursor.execute(lecture_material_table)
            self.cursor.execute(lecture_material_media_table)
            self.commit()
            logger.info("Lecture_Material tables verified/created.")
        except Exception as e:
            logger.error(f"Failed creating Lecture_Material tables: {e}")
            raise

    # ----------------------------------------------------
    # INSERT LECTURE MATERIAL
    # ----------------------------------------------------
    def insert_lecture_material(self, lesson_id, file_name, file_url, media_extracted_file_url=None, description=None):
        sql = """
        INSERT INTO "Lecture_Material"
        (lesson_id, file_name, file_url, media_extracted_file_url, description)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id;
        """

        try:
            self.cursor.execute(sql, (lesson_id, file_name, file_url, media_extracted_file_url, description))
            lecture_material_id = self.cursor.fetchone()[0]
            self.commit()
            return lecture_material_id
        except Exception as e:
            logger.error(f"Error inserting lecture material: {e}")
            raise

    # ----------------------------------------------------
    # INSERT MEDIA
    # ----------------------------------------------------
    def insert_media(self, model_id, lecture_material_id, media_url):
        sql = """
        INSERT INTO lecture_material_media
        (model_id, lecture_material_id, media_url)
        VALUES (%s, %s, %s)
        RETURNING id;
        """
        try:
            self.cursor.execute(sql, (model_id, lecture_material_id, media_url))
            media_id = self.cursor.fetchone()[0]
            self.commit()
            return media_id
        except Exception as e:
            logger.error(f"Error inserting lecture material media: {e}")
            raise

    # ----------------------------------------------------
    # UPDATE MEDIA SUMMARY
    # ----------------------------------------------------
    def update_media_summary(self, media_id, media_summary):
        sql = """
        UPDATE lecture_material_media
        SET media_summary = %s,
            updated_on = NOW()
        WHERE id = %s;
        """
        try:
            self.cursor.execute(sql, (media_summary, media_id))
            self.commit()
        except Exception as e:
            logger.error(f"Error updating media summary: {e}")
            raise

    # ----------------------------------------------------
    # FETCH MEDIA FOR A LECTURE MATERIAL
    # ----------------------------------------------------
    def fetch_media_by_lecture_material(self, lecture_material_id):
        sql = """
        SELECT id, media_url, media_summary
        FROM lecture_material_media
        WHERE lecture_material_id = %s;
        """

        try:
            self.cursor.execute(sql, (lecture_material_id,))
            return self.cursor.fetchall()
        except Exception as e:
            logger.error(f"Error fetching media: {e}")
            raise

    # ----------------------------------------------------
    # FETCH LECTURE MATERIALS BY LESSON ID
    # ----------------------------------------------------
    def fetch_lecture_materials_by_lesson(self, lesson_id):
        sql = """
        SELECT 
            id,
            lesson_id,
            file_name,
            file_url,
            media_extracted_file_url,
            created_on,
            updated_on,
            description
        FROM "Lecture_Material"
        WHERE lesson_id = %s
        ORDER BY created_on DESC;
        """

        try:
            self.cursor.execute(sql, (lesson_id,))
            return self.cursor.fetchall()
        except Exception as e:
            logger.error(f"Error fetching lecture materials for lesson {lesson_id}: {e}")
            raise

    # ----------------------------------------------------
    # UPDATE EXTRACTED FILE PATH
    # ----------------------------------------------------
    def update_extracted_file_path(self, lecture_material_id: str, extracted_path: str):
        sql = """
        UPDATE "Lecture_Material"
        SET
            media_extracted_file_url = %s,
            updated_on = NOW()
        WHERE id = %s;
        """
        try:
            self.cursor.execute(sql, (extracted_path, lecture_material_id))
            self.commit()
            logger.info(f"Updated extracted file path for {lecture_material_id}")
        except Exception as e:
            logger.error(f"Error updating extracted file URL for {lecture_material_id}: {e}")
            raise
