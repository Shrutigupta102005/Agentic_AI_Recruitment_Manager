import logging
from jd_processor import JDProcessor
from resume_processor import ResumeProcessor
import sys

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/person1.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def main():
    """
    Main orchestrator for Person 1 tasks
    """
    logger.info("=" * 50)
    logger.info("Person 1: Data Ingestion Pipeline Started")
    logger.info("=" * 50)
    
    jd_processor = JDProcessor()
    resume_processor = ResumeProcessor()
    
    # Get input from user
    print("\n=== Person 1: Data Ingestion System ===")
    print("1. Process single JD file")
    print("2. Process JD folder")
    print("3. Process single Resume file")
    print("4. Process Resume folder")
    print("5. Process both JD and Resume folders")
    
    choice = input("\nEnter your choice (1-5): ")
    
    if choice == '1':
        file_path = input("Enter JD file path: ")
        result = jd_processor.process_jd_file(file_path)
        print(f"\nResult: {result}")
    
    elif choice == '2':
        folder_path = input("Enter JD folder path: ")
        results = jd_processor.process_jd_folder(folder_path)
        print(f"\nProcessed {len(results)} JD files")
        for r in results:
            status = 'Success' if r['success'] else f"Failed: {r.get('error', 'Unknown error')}"
            print(f"  - {r['filename']}: {status}")
    
    elif choice == '3':
        file_path = input("Enter Resume file path: ")
        result = resume_processor.process_resume_file(file_path)
        print(f"\nResult: {result}")
    
    elif choice == '4':
        folder_path = input("Enter Resume folder path: ")
        results = resume_processor.process_resume_folder(folder_path)
        print(f"\nProcessed {len(results)} Resume files")
        for r in results:
            status = 'Success' if r['success'] else f"Failed: {r.get('error', 'Unknown error')}"
            print(f"  - {r['filename']}: {status}")
    
    elif choice == '5':
        jd_folder = input("Enter JD folder path: ")
        resume_folder = input("Enter Resume folder path: ")
        
        print("\nProcessing JDs...")
        jd_results = jd_processor.process_jd_folder(jd_folder)
        print(f"Processed {len(jd_results)} JD files")
        
        print("\nProcessing Resumes...")
        resume_results = resume_processor.process_resume_folder(resume_folder)
        print(f"Processed {len(resume_results)} Resume files")
        
        print("\n=== Summary ===")
        jd_success = sum(1 for r in jd_results if r['success'])
        jd_failed = sum(1 for r in jd_results if not r['success'])
        resume_success = sum(1 for r in resume_results if r['success'])
        resume_failed = sum(1 for r in resume_results if not r['success'])
        
        print(f"JDs: {jd_success} successful, {jd_failed} failed")
        print(f"Resumes: {resume_success} successful, {resume_failed} failed")
        
        if jd_failed > 0:
            print("\nFailed JDs:")
            for r in jd_results:
                if not r['success']:
                    print(f"  - {r['filename']}: {r.get('error', 'Unknown error')}")
        
        if resume_failed > 0:
            print("\nFailed Resumes:")
            for r in resume_results:
                if not r['success']:
                    print(f"  - {r['filename']}: {r.get('error', 'Unknown error')}")
    
    else:
        print("Invalid choice!")
    
    logger.info("=" * 50)
    logger.info("Person 1: Pipeline Completed")
    logger.info("=" * 50)

if __name__ == "__main__":
    main()