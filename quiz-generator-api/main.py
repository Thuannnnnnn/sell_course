from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

from app.services.file_processor import FileProcessor
from app.services.quiz_generator import QuizGenerator

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Quiz Generator API",
    description="API to generate quizzes from DOCX and JSON files using OpenAI",
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
        
        # Generate quizzes using OpenAI
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )

