import PyPDF2
import docx
import os
import logging

logger = logging.getLogger(__name__)

class FileHandler:
    @staticmethod
    def read_pdf(file_path):
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text.strip()
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
            raise
    
    @staticmethod
    def read_docx(file_path):
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            logger.error(f"Error reading DOCX {file_path}: {e}")
            raise
    
    @staticmethod
    def read_txt(file_path):
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
        except Exception as e:
            logger.error(f"Error reading TXT {file_path}: {e}")
            raise
    
    @staticmethod
    def read_file(file_path):
        """Auto-detect file type and extract text"""
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        
        if ext == '.pdf':
            return FileHandler.read_pdf(file_path)
        elif ext == '.docx':
            return FileHandler.read_docx(file_path)
        elif ext == '.txt':
            return FileHandler.read_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
        