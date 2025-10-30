from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config import Config
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConnection:
    def __init__(self):
        # Use SQLite
        self.connection_string = f"sqlite:///{Config.SQLITE_DB_PATH}"
        logger.info(f"Using SQLite database: {Config.SQLITE_DB_PATH}")
        
        self.engine = create_engine(self.connection_string)
        self.Session = sessionmaker(bind=self.engine)
        self._create_tables()
    
    def _create_tables(self):
        """Create tables if they don't exist"""
        with self.engine.connect() as conn:
            # Create jd_raw table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS jd_raw (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT,
                    file_path TEXT,
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'pending'
                )
            """))
            
            # Create jd_parsed table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS jd_parsed (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    jd_raw_id INTEGER,
                    job_title TEXT,
                    company_name TEXT,
                    required_skills TEXT,
                    experience_required TEXT,
                    education_required TEXT,
                    job_description TEXT,
                    responsibilities TEXT,
                    nice_to_have_skills TEXT,
                    location TEXT,
                    salary_range TEXT,
                    parsed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    parsed_data TEXT,
                    FOREIGN KEY (jd_raw_id) REFERENCES jd_raw(id)
                )
            """))
            
            # Create resume_raw table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS resume_raw (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT,
                    file_path TEXT,
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'pending'
                )
            """))
            
            # Create resume_parsed table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS resume_parsed (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    resume_raw_id INTEGER,
                    candidate_name TEXT,
                    email TEXT,
                    phone TEXT,
                    skills TEXT,
                    total_experience TEXT,
                    work_experience TEXT,
                    education TEXT,
                    certifications TEXT,
                    summary TEXT,
                    parsed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    parsed_data TEXT,
                    FOREIGN KEY (resume_raw_id) REFERENCES resume_raw(id)
                )
            """))
            
            conn.commit()
            logger.info("Database tables created/verified successfully")
    
    def get_session(self):
        return self.Session()
    
    def insert_jd_raw(self, filename, file_path):
        """Insert raw JD file record"""
        query = text("""
            INSERT INTO jd_raw (filename, file_path, status)
            VALUES (:filename, :file_path, 'pending')
        """)
        session = self.get_session()
        try:
            session.execute(query, {"filename": filename, "file_path": file_path})
            session.commit()
            
            # Get last inserted ID
            result = session.execute(text("SELECT last_insert_rowid()"))
            jd_id = result.fetchone()[0]
            
            logger.info(f"Inserted JD raw record with ID: {jd_id}")
            return jd_id
        except Exception as e:
            session.rollback()
            logger.error(f"Error inserting JD raw: {e}")
            raise
        finally:
            session.close()
    
    def insert_resume_raw(self, filename, file_path):
        """Insert raw Resume file record"""
        query = text("""
            INSERT INTO resume_raw (filename, file_path, status)
            VALUES (:filename, :file_path, 'pending')
        """)
        session = self.get_session()
        try:
            session.execute(query, {"filename": filename, "file_path": file_path})
            session.commit()
            
            # Get last inserted ID
            result = session.execute(text("SELECT last_insert_rowid()"))
            resume_id = result.fetchone()[0]
            
            logger.info(f"Inserted Resume raw record with ID: {resume_id}")
            return resume_id
        except Exception as e:
            session.rollback()
            logger.error(f"Error inserting Resume raw: {e}")
            raise
        finally:
            session.close()
    
    def insert_jd_parsed(self, jd_raw_id, parsed_data):
        """Insert parsed JD data"""
        query = text("""
            INSERT INTO jd_parsed (
                jd_raw_id, job_title, company_name, required_skills,
                experience_required, education_required, job_description,
                responsibilities, nice_to_have_skills, location, salary_range,
                parsed_data
            ) VALUES (
                :jd_raw_id, :job_title, :company_name, :required_skills,
                :experience_required, :education_required, :job_description,
                :responsibilities, :nice_to_have_skills, :location, :salary_range,
                :parsed_data
            )
        """)
        session = self.get_session()
        try:
            session.execute(query, {
                "jd_raw_id": jd_raw_id,
                "job_title": parsed_data.get('job_title'),
                "company_name": parsed_data.get('company_name'),
                "required_skills": json.dumps(parsed_data.get('required_skills', [])),
                "experience_required": parsed_data.get('experience_required'),
                "education_required": parsed_data.get('education_required'),
                "job_description": parsed_data.get('job_description'),
                "responsibilities": json.dumps(parsed_data.get('responsibilities', [])),
                "nice_to_have_skills": json.dumps(parsed_data.get('nice_to_have_skills', [])),
                "location": parsed_data.get('location'),
                "salary_range": parsed_data.get('salary_range'),
                "parsed_data": json.dumps(parsed_data)
            })
            session.commit()
            
            # Get last inserted ID
            result = session.execute(text("SELECT last_insert_rowid()"))
            parsed_id = result.fetchone()[0]
            
            # Update raw status
            update_query = text("UPDATE jd_raw SET status = 'parsed' WHERE id = :id")
            session.execute(update_query, {"id": jd_raw_id})
            session.commit()
            
            logger.info(f"Inserted JD parsed record with ID: {parsed_id}")
            return parsed_id
        except Exception as e:
            session.rollback()
            logger.error(f"Error inserting JD parsed: {e}")
            raise
        finally:
            session.close()
    
    def insert_resume_parsed(self, resume_raw_id, parsed_data):
        """Insert parsed Resume data"""
        query = text("""
            INSERT INTO resume_parsed (
                resume_raw_id, candidate_name, email, phone, skills,
                total_experience, work_experience, education,
                certifications, summary, parsed_data
            ) VALUES (
                :resume_raw_id, :candidate_name, :email, :phone, :skills,
                :total_experience, :work_experience, :education,
                :certifications, :summary, :parsed_data
            )
        """)
        session = self.get_session()
        try:
            session.execute(query, {
                "resume_raw_id": resume_raw_id,
                "candidate_name": parsed_data.get('candidate_name'),
                "email": parsed_data.get('email'),
                "phone": parsed_data.get('phone'),
                "skills": json.dumps(parsed_data.get('skills', [])),
                "total_experience": parsed_data.get('total_experience'),
                "work_experience": json.dumps(parsed_data.get('work_experience', [])),
                "education": json.dumps(parsed_data.get('education', [])),
                "certifications": json.dumps(parsed_data.get('certifications', [])),
                "summary": parsed_data.get('summary'),
                "parsed_data": json.dumps(parsed_data)
            })
            session.commit()
            
            # Get last inserted ID
            result = session.execute(text("SELECT last_insert_rowid()"))
            parsed_id = result.fetchone()[0]
            
            # Update raw status
            update_query = text("UPDATE resume_raw SET status = 'parsed' WHERE id = :id")
            session.execute(update_query, {"id": resume_raw_id})
            session.commit()
            
            logger.info(f"Inserted Resume parsed record with ID: {parsed_id}")
            return parsed_id
        except Exception as e:
            session.rollback()
            logger.error(f"Error inserting Resume parsed: {e}")
            raise
        finally:
            session.close()

db = DatabaseConnection()