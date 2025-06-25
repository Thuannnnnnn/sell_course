import os
import json
from typing import List, Dict, Any
import google.generativeai as genai
import asyncio

class QuizGenerator:
    """Service to generate quizzes using Google Gemini API"""
    
    def __init__(self):
        # Configure Gemini API
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
        
        self.model_name = os.getenv('GEMINI_MODEL', 'gemini-pro')
        self.max_tokens = int(os.getenv('GEMINI_MAX_TOKENS', '2000'))
        self.temperature = float(os.getenv('GEMINI_TEMPERATURE', '0.7'))
        
        # Initialize the model
        self.model = genai.GenerativeModel(self.model_name)
    
    async def generate_quiz(self, text_content: str, quiz_count: int = 5, difficulty: str = "medium") -> List[Dict[str, Any]]:
        """
        Generate quiz questions from text content using Google Gemini
        
        Args:
            text_content: The text content to generate quizzes from
            quiz_count: Number of quiz questions to generate
            difficulty: Difficulty level (easy, medium, hard)
            
        Returns:
            List of quiz questions with answers
        """
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise Exception("Gemini API key not configured. Please set GEMINI_API_KEY environment variable.")
        
        # Create the prompt for quiz generation
        prompt = self._create_quiz_prompt(text_content, quiz_count, difficulty)
        
        try:
            # Configure generation parameters
            generation_config = genai.types.GenerationConfig(
                max_output_tokens=self.max_tokens,
                temperature=self.temperature,
            )
            
            # Generate content using Gemini
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                generation_config=generation_config
            )
            
            # Parse the response
            quiz_content = response.text.strip()
            
            # Try to parse as JSON
            try:
                quiz_data = json.loads(quiz_content)
                return self._validate_and_format_quiz(quiz_data)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the response
                return self._extract_json_from_response(quiz_content)
                
        except Exception as e:
            raise Exception(f"Error generating quiz with Gemini: {str(e)}")
    
    def _create_quiz_prompt(self, text_content: str, quiz_count: int, difficulty: str) -> str:
        """Create a prompt for quiz generation"""
        
        difficulty_instructions = {
            "easy": "Create simple, straightforward questions that test basic understanding and recall of key facts.",
            "medium": "Create moderately challenging questions that test comprehension and application of concepts.",
            "hard": "Create challenging questions that test analysis, synthesis, and critical thinking skills."
        }
        
        prompt = f"""
Based on the following text content, generate {quiz_count} quiz questions with the difficulty level: {difficulty}.

{difficulty_instructions.get(difficulty, difficulty_instructions["medium"])}

Text Content:
{text_content[:8000]}  # Limit content to avoid token limits

Requirements:
1. Generate exactly {quiz_count} questions
2. Each question should have:
   - A clear, well-formed question
   - 4 multiple choice options (A, B, C, D)
   - The correct answer (A, B, C, or D)
   - A brief explanation of why the answer is correct
3. Questions should be diverse and cover different aspects of the content
4. Avoid questions that are too obvious or too obscure
5. Make sure all questions are answerable based on the provided content

Please respond with a JSON object in the following format:
{{
    "quizzes": [
        {{
            "question": "Your question here?",
            "options": {{
                "A": "Option A",
                "B": "Option B", 
                "C": "Option C",
                "D": "Option D"
            }},
            "correct_answer": "A",
            "explanation": "Explanation of why this answer is correct",
            "difficulty": "{difficulty}",
            "topic": "Main topic this question covers"
        }}
    ]
}}

IMPORTANT: Respond ONLY with valid JSON. Do not include any other text or formatting.
"""
        return prompt
    
    def _validate_and_format_quiz(self, quiz_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Validate and format quiz data"""
        if not isinstance(quiz_data, dict) or 'quizzes' not in quiz_data:
            raise Exception("Invalid quiz format: missing 'quizzes' key")
        
        quizzes = quiz_data['quizzes']
        if not isinstance(quizzes, list):
            raise Exception("Invalid quiz format: 'quizzes' should be a list")
        
        formatted_quizzes = []
        for i, quiz in enumerate(quizzes):
            try:
                formatted_quiz = {
                    "id": i + 1,
                    "question": quiz.get("question", "").strip(),
                    "options": quiz.get("options", {}),
                    "correct_answer": quiz.get("correct_answer", "").strip().upper(),
                    "explanation": quiz.get("explanation", "").strip(),
                    "difficulty": quiz.get("difficulty", "medium"),
                    "topic": quiz.get("topic", "General").strip()
                }
                
                # Validate required fields
                if not formatted_quiz["question"]:
                    continue
                if not isinstance(formatted_quiz["options"], dict) or len(formatted_quiz["options"]) != 4:
                    continue
                if formatted_quiz["correct_answer"] not in ["A", "B", "C", "D"]:
                    continue
                
                formatted_quizzes.append(formatted_quiz)
                
            except Exception as e:
                print(f"Warning: Skipping invalid quiz item {i}: {str(e)}")
                continue
        
        if not formatted_quizzes:
            raise Exception("No valid quiz questions could be generated")
        
        return formatted_quizzes
    
    def _extract_json_from_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Try to extract JSON from response text if direct parsing fails"""
        try:
            # Look for JSON content between ```json and ``` or { and }
            import re
            
            # Try to find JSON block
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                json_content = json_match.group(1)
            else:
                # Try to find content between first { and last }
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}')
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    json_content = response_text[start_idx:end_idx+1]
                else:
                    raise Exception("Could not extract JSON from response")
            
            quiz_data = json.loads(json_content)
            return self._validate_and_format_quiz(quiz_data)
            
        except Exception as e:
            # If all parsing attempts fail, create a fallback response
            return [{
                "id": 1,
                "question": "Based on the provided content, what is the main topic discussed?",
                "options": {
                    "A": "Unable to generate specific options",
                    "B": "Please check the content format",
                    "C": "API response parsing failed",
                    "D": "Contact support for assistance"
                },
                "correct_answer": "A",
                "explanation": f"Quiz generation failed due to parsing error: {str(e)}",
                "difficulty": "medium",
                "topic": "Error"
            }]

