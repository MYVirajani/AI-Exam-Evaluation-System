import logging
from datetime import datetime
import uuid

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
        lecture_material_table = """
        CREATE TABLE IF NOT EXISTS "Lecture_Material" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            lesson_id VARCHAR(255) NOT NULL,
            file_name TEXT,
            file_url TEXT NOT NULL,
            media_extracted_file_url TEXT,
            created_by VARCHAR(255),
            created_on TIMESTAMPTZ DEFAULT NOW(),
            updated_on TIMESTAMPTZ DEFAULT NOW(),
            description TEXT,

            CONSTRAINT fk_lesson
                FOREIGN KEY (lesson_id)
                REFERENCES "Lesson"(lesson_id),

            CONSTRAINT fk_educator
                FOREIGN KEY (created_by)
                REFERENCES "Educator"(user_id)
        );
        """

        lecture_material_media_table = """
        CREATE TABLE IF NOT EXISTS "Lecture_Material_Media" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            model_id UUID,
            lecture_material_id UUID NOT NULL,
            media_url TEXT NOT NULL,
            media_summary TEXT,
            created_on TIMESTAMPTZ DEFAULT NOW(),
            updated_on TIMESTAMPTZ DEFAULT NOW(),

            CONSTRAINT fk_lecture_material
                FOREIGN KEY (lecture_material_id)
                REFERENCES "Lecture_Material"(id)
                ON DELETE CASCADE,

            CONSTRAINT fk_evaluation_model
                FOREIGN KEY (model_id)
                REFERENCES "Evaluation_Model"(id)
        );

        CREATE INDEX IF NOT EXISTS idx_lmm_lecture_material_id 
            ON "Lecture_Material_Media"(lecture_material_id);

        CREATE INDEX IF NOT EXISTS idx_lmm_model_id 
            ON "Lecture_Material_Media"(model_id);
        """

        try:
            self.cursor.execute(lecture_material_table)
            self.cursor.execute(lecture_material_media_table)
            self.commit()
        except Exception as e:
            logger.error(f"Failed creating Lecture_Material tables: {e}")
            raise

    # ----------------------------------------------------
    # INSERT LECTURE MATERIAL
    # ----------------------------------------------------
    def insert_lecture_material(self, lesson_id, file_name, file_url,
                                media_extracted_file_url=None, description=None, created_by=None):
        sql = """
        INSERT INTO "Lecture_Material"
        (lesson_id, file_name, file_url, media_extracted_file_url, description, created_by)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id;
        """

        try:
            self.cursor.execute(
                sql,
                (
                    lesson_id,
                    file_name,
                    file_url,
                    media_extracted_file_url,
                    description,
                    created_by
                )
            )
            lecture_material_id = self.cursor.fetchone()[0]
            self.commit()
            return lecture_material_id

        except Exception as e:
            logger.error(f"Error inserting lecture material: {e}")
            raise

    # ----------------------------------------------------
    # INSERT OR UPDATE MEDIA
    # ----------------------------------------------------
    def insert_media(self, model_id, lecture_material_id, media_url, media_summary):
        try:
            check_sql = """
                SELECT id FROM "Lecture_Material_Media"
                WHERE model_id = %s
                  AND lecture_material_id = %s
                  AND media_url = %s
                LIMIT 1;
            """

            self.cursor.execute(check_sql, (model_id, lecture_material_id, media_url))
            result = self.cursor.fetchone()

            # Update existing
            if result:
                media_id = result[0]
                update_sql = """
                    UPDATE "Lecture_Material_Media"
                    SET media_summary = %s,
                        updated_on = NOW()
                    WHERE id = %s;
                """

                self.cursor.execute(update_sql, (media_summary, media_id))
                self.conn.commit()

                logger.info(f"Updated existing media summary for media_id={media_id}")
                return media_id

            # Insert new
            media_id = str(uuid.uuid4())

            insert_sql = """
                INSERT INTO "Lecture_Material_Media" (
                    id,
                    model_id,
                    lecture_material_id,
                    media_url,
                    media_summary,
                    created_on,
                    updated_on
                ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW());
            """

            self.cursor.execute(
                insert_sql,
                (media_id, model_id, lecture_material_id, media_url, media_summary)
            )
            self.conn.commit()

            logger.info(f"Inserted new media entry id={media_id}")
            return media_id

        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error inserting/updating lecture material media: {e}")
            raise

    # ----------------------------------------------------
    # UPDATE MEDIA SUMMARY
    # ----------------------------------------------------
    def update_media_summary(self, media_id, media_summary):
        sql = """
        UPDATE "Lecture_Material_Media"
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
    # FETCH MEDIA FOR ONE LECTURE MATERIAL
    # ----------------------------------------------------
    def fetch_media_by_lecture_material(self, lecture_material_id):
        sql = """
        SELECT media_url, media_summary
        FROM "Lecture_Material_Media"
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
        SET media_extracted_file_url = %s,
            updated_on = NOW()
        WHERE id = %s;
        """
        try:
            self.cursor.execute(sql, (extracted_path, lecture_material_id))
            self.commit()
        except Exception as e:
            logger.error(f"Error updating extracted file URL for {lecture_material_id}: {e}")
            raise

    # ----------------------------------------------------
    # FETCH FULL DATA FOR MULTIPLE LESSON IDs
    # ----------------------------------------------------
    def get_full_material_data_by_lesson_ids(self, lesson_ids: list, media_ids: list = None):
        sql = """
        SELECT 
            lm.id AS lecture_material_id,
            lm.lesson_id,
            lm.file_url,
            lm.media_extracted_file_url,
            m.media_url,
            m.media_summary,
            m.id AS media_id
        FROM "Lecture_Material" lm
        LEFT JOIN "Lecture_Material_Media" m 
            ON lm.id = m.lecture_material_id
        WHERE lm.lesson_id = ANY(%s)
        """

        params = [lesson_ids]

        if media_ids:
            sql += ' AND m.id = ANY(%s)'
            params.append(media_ids)

        sql += " ORDER BY lm.created_on DESC;"

        try:
            self.cursor.execute(sql, tuple(params))
            rows = self.cursor.fetchall()

            result = {}
            for row in rows:
                lm_id = row[0]

                if lm_id not in result:
                    result[lm_id] = {
                        "lecture_material_id": lm_id,
                        "lesson_id": row[1],
                        "file_url": row[2],
                        "extracted_file_url": row[3],
                        "media": []
                    }

                if row[4] is not None:
                    result[lm_id]["media"].append({
                        "media_id": row[6],
                        "media_url": row[4],
                        "media_summary": row[5],
                    })

            return list(result.values())

        except Exception as e:
            logger.error(f"Error fetching full material data: {e}")
            raise

    # ----------------------------------------------------
    # FETCH MATERIAL IDs BY LESSON LIST
    # ----------------------------------------------------
    def get_lecture_material_ids_by_lessons(self, lesson_ids: list):
        try:
            if not lesson_ids:
                return []
            lesson_ids = [str(lid) for lid in lesson_ids]
            sql = """
            SELECT id
            FROM "Lecture_Material"
            WHERE lesson_id = ANY(%s)
            ORDER BY created_on DESC;
        """
            self.cursor.execute(sql, (lesson_ids,))
            rows = self.cursor.fetchall()

            return [row[0] for row in rows]

        except Exception as e:
            logger.error(f"Error fetching lecture material IDs by lesson list: {e}")
            raise