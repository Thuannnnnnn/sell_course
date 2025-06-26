from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any
import os
import random
from dotenv import load_dotenv

from app.services.file_processor import FileProcessor
from app.services.quiz_generator import QuizGenerator

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Quiz Generator API",
    description="API to generate quizzes from DOCX and JSON files using Google Gemini",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
file_processor = FileProcessor()
quiz_generator = QuizGenerator()

class URLRequest(BaseModel):
    urls: List[HttpUrl]
    quiz_count: int = 5
    difficulty: str = "medium"

class ContentRequest(BaseModel):
    content_id: str
    quiz_count: int = 5

class QuizResponse(BaseModel):
    success: bool
    quizzes: List[Dict[str, Any]]
    source_files: List[str]
    error: str = None

@app.get("/")
async def root():
    return {"message": "Quiz Generator API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Quiz Generator API"}

@app.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: URLRequest):
    """
    Generate quizzes from multiple URLs containing DOCX or JSON files
    """
    try:
        # Process all URLs and extract text
        all_text = ""
        processed_files = []
        
        for url in request.urls:
            try:
                text_content, filename = await file_processor.process_url(str(url))
                all_text += f"\n\n--- Content from {filename} ---\n\n{text_content}"
                processed_files.append(filename)
            except Exception as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Error processing URL {url}: {str(e)}"
                )
        
        if not all_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text content could be extracted from the provided URLs"
            )
        
        # Generate quizzes using Gemini
        quizzes = await quiz_generator.generate_quiz(
            text_content=all_text,
            quiz_count=request.quiz_count,
            difficulty=request.difficulty
        )
        
        return QuizResponse(
            success=True,
            quizzes=quizzes,
            source_files=processed_files
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return QuizResponse(
            success=False,
            quizzes=[],
            source_files=[],
            error=str(e)
        )

@app.post("/generate-quiz-from-content", response_model=QuizResponse)
async def generate_quiz_from_content(request: ContentRequest):
    """
    Generate quizzes from content ID by fetching docs and video scripts from database
    """
    try:
        # TODO: Fetch content from database using content_id
        # For now, we'll use mock data
        
        # Mock content - in real implementation, fetch from your database
        mock_content = {
            "docs": "This is sample document content about programming concepts...",
            "video_script": "Welcome to this lesson about variables and functions..."
        }
        
        # Combine all content
        all_text = f"""
        Document Content:
        {mock_content.get('docs', '')}
        
        Video Script Content:
        {mock_content.get('video_script', '')}
        """
        
        if not all_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No content found for the provided content ID"
            )
        
        # AI will automatically determine difficulty and weight
        difficulties = ['easy', 'medium', 'hard']
        generated_quizzes = []
        
        # Generate questions with mixed difficulties
        for i, difficulty in enumerate(difficulties * (request.quiz_count // 3 + 1)):
            if len(generated_quizzes) >= request.quiz_count:
                break
                
            quiz_batch = await quiz_generator.generate_quiz(
                text_content=all_text,
                quiz_count=1,
                difficulty=difficulty
            )
            
            # Add weight based on difficulty
            for quiz in quiz_batch:
                quiz['difficulty'] = difficulty
                if difficulty == 'easy':
                    quiz['weight'] = random.randint(1, 4)
                elif difficulty == 'medium':
                    quiz['weight'] = random.randint(5, 7)
                else:  # hard
                    quiz['weight'] = random.randint(8, 10)
                generated_quizzes.append(quiz)
        
        # Limit to requested count
        generated_quizzes = generated_quizzes[:request.quiz_count]
        
        return QuizResponse(
            success=True,
            quizzes=generated_quizzes,
            source_files=[f"content_{request.content_id}"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return QuizResponse(
            success=False,
            quizzes=[],
            source_files=[],
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )

