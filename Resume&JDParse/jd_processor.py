import os
import shutil
from file_handler import FileHandler
from llm_parser import LLMParser
from db_connection import db
from config import Config
import logging

logger = logging.getLogger(__name__)

class JDProcessor:
    def __init__(self):
        self.file_handler = FileHandler()
        self.llm_parser = LLMParser()
    
    def process_jd_file(self, source_file_path):
        """
        Complete JD processing pipeline:
        1. Copy file to uploads folder (if needed)
        2. Read and extract text
        3. Parse using LLM
        4. Store in database
        """
        try:
            # Step 1: Handle file path
            filename = os.path.basename(source_file_path)
            dest_path = os.path.join(Config.UPLOAD_FOLDER_JD, filename)
            
            # Only copy if source and destination are different
            if os.path.abspath(source_file_path) != os.path.abspath(dest_path):
                shutil.copy2(source_file_path, dest_path)
                logger.info(f"Copied JD file: {filename}")
            else:
                dest_path = source_file_path  # Use the file where it is
                logger.info(f"Using existing JD file: {filename}")
            
            # Step 2: Insert into jd_raw table
            jd_raw_id = db.insert_jd_raw(filename, dest_path)
            
            # Step 3: Read file content
            jd_text = self.file_handler.read_file(dest_path)
            logger.info(f"Extracted text from JD (length: {len(jd_text)} chars)")
            
            # Step 4: Parse using LLM
            parsed_data = self.llm_parser.parse_jd(jd_text)
            logger.info("JD parsed successfully by LLM")
            
            # Step 5: Store parsed data
            parsed_id = db.insert_jd_parsed(jd_raw_id, parsed_data)
            
            return {
                'success': True,
                'jd_raw_id': jd_raw_id,
                'jd_parsed_id': parsed_id,
                'parsed_data': parsed_data
            }
        
        except Exception as e:
            logger.error(f"Error processing JD: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_jd_folder(self, folder_path):
        """Process all JD files in a folder"""
        results = []
        for filename in os.listdir(folder_path):
            if filename.endswith(('.pdf', '.docx', '.txt')):
                file_path = os.path.join(folder_path, filename)
                logger.info(f"Processing JD: {filename}")
                result = self.process_jd_file(file_path)
                results.append({
                    'filename': filename,
                    **result
                })
        return results