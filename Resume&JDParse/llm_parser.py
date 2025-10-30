import json
import logging
from config import Config

logger = logging.getLogger(__name__)

class LLMParser:
    def __init__(self):
        self.provider = Config.LLM_PROVIDER
        if self.provider == 'openai':
            from openai import OpenAI
            self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
            self.model = Config.LLM_MODEL
        elif self.provider == 'anthropic':
            import anthropic
            self.client = anthropic.Anthropic(api_key=Config.ANTHROPIC_API_KEY)
            self.model = "claude-3-sonnet-20240229"
    
    def parse_jd(self, jd_text):
        """Parse Job Description using LLM"""
        prompt = f"""You are an expert HR assistant. Extract structured information from the following Job Description.

Job Description:
{jd_text}

Extract and return ONLY a valid JSON object with the following structure:
{{
    "job_title": "exact job title",
    "company_name": "company name if mentioned",
    "required_skills": ["skill1", "skill2", "skill3"],
    "experience_required": "X years or X-Y years",
    "education_required": "degree requirements",
    "job_description": "brief summary of the role",
    "responsibilities": ["responsibility1", "responsibility2"],
    "nice_to_have_skills": ["skill1", "skill2"],
    "location": "job location",
    "salary_range": "salary if mentioned"
}}

Important:
- Extract all skills mentioned (technical and soft skills)
- Be specific with experience requirements
- List responsibilities separately
- Return ONLY the JSON, no additional text
"""
        
        try:
            if self.provider == 'openai':
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a precise data extraction assistant. Always return valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1
                )
                content = response.choices[0].message.content
            
            elif self.provider == 'anthropic':
                message = self.client.messages.create(
                    model=self.model,
                    max_tokens=2000,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                content = message.content[0].text
            
            # Clean and parse JSON
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.startswith('```'):
                content = content[3:]
            if content.endswith('```'):
                content = content[:-3]
            
            parsed_data = json.loads(content.strip())
            logger.info("JD parsed successfully")
            return parsed_data
        
        except Exception as e:
            logger.error(f"Error parsing JD: {e}")
            raise
    
    def parse_resume(self, resume_text):
        """Parse Resume using LLM"""
        prompt = f"""You are an expert HR assistant. Extract structured information from the following Resume.

Resume:
{resume_text}

Extract and return ONLY a valid JSON object with the following structure:
{{
    "candidate_name": "full name",
    "email": "email address",
    "phone": "phone number",
    "skills": ["skill1", "skill2", "skill3"],
    "total_experience": "X years",
    "work_experience": [
        {{
            "company": "company name",
            "position": "job title",
            "duration": "start - end",
            "responsibilities": ["resp1", "resp2"]
        }}
    ],
    "education": [
        {{
            "degree": "degree name",
            "institution": "college/university",
            "year": "graduation year"
        }}
    ],
    "certifications": ["cert1", "cert2"],
    "summary": "brief professional summary"
}}

Important:
- Extract ALL skills mentioned
- Calculate total experience from work history
- List all jobs in reverse chronological order
- Return ONLY the JSON, no additional text
"""
        
        try:
            if self.provider == 'openai':
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a precise data extraction assistant. Always return valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1
                )
                content = response.choices[0].message.content
            
            elif self.provider == 'anthropic':
                message = self.client.messages.create(
                    model=self.model,
                    max_tokens=2000,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                content = message.content[0].text
            
            # Clean and parse JSON
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.startswith('```'):
                content = content[3:]
            if content.endswith('```'):
                content = content[:-3]
            
            parsed_data = json.loads(content.strip())
            logger.info("Resume parsed successfully")
            return parsed_data
        
        except Exception as e:
            logger.error(f"Error parsing Resume: {e}")
            raise