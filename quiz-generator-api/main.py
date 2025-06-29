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

@app.post("/test-quiz", response_model=QuizResponse)
async def test_quiz_generation():
    """
    Test endpoint to generate quizzes with sample text content
    """
    print("DEBUG: Test quiz generation endpoint called")
    
    try:
        # Sample text content for testing
        sample_text = """
        Python is a high-level, interpreted programming language with dynamic semantics. 
        Its high-level built-in data structures, combined with dynamic typing and dynamic binding, 
        make it very attractive for Rapid Application Development, as well as for use as a scripting 
        or glue language to connect existing components together.
        
        Python's simple, easy to learn syntax emphasizes readability and therefore reduces the cost 
        of program maintenance. Python supports modules and packages, which encourages program 
        modularity and code reuse.
        """
        
        # Generate quizzes using AI
        quizzes = await quiz_generator.generate_quiz(
            text_content=sample_text,
            quiz_count=3,
            difficulty="medium"
        )
        
        return QuizResponse(
            success=True,
            quizzes=quizzes,
            source_files=["sample_text.txt"]
        )
        
    except Exception as e:
        print(f"DEBUG: Error in test endpoint: {str(e)}")
        return QuizResponse(
            success=False,
            quizzes=[],
            source_files=[],
            error=str(e)
        )

@app.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(request: URLRequest):
    """
    Generate quizzes from multiple URLs containing DOCX or JSON files
    """
    print(f"DEBUG: Received request: {request}")
    
    try:
        # Process all URLs and extract text
        all_text = ""
        processed_files = []
        
        for url in request.urls:
            print(f"DEBUG: Processing URL: {url}")
            try:
                text_content, filename = await file_processor.process_url(str(url))
                print(f"DEBUG: Successfully processed {filename}, content length: {len(text_content)}")
                all_text += f"\n\n--- Content from {filename} ---\n\n{text_content}"
                processed_files.append(filename)
            except Exception as e:
                print(f"DEBUG: Error processing URL {url}: {str(e)}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Error processing URL {url}: {str(e)}"
                )
        
        if not all_text.strip():
            print("DEBUG: No text content extracted")
            raise HTTPException(
                status_code=400,
                detail="No text content could be extracted from the provided URLs"
            )
        
        print(f"DEBUG: All text length: {len(all_text)}")
        
        # Generate quizzes using AI
        print(f"DEBUG: Generating {request.quiz_count} quizzes with difficulty {request.difficulty}")
        quizzes = await quiz_generator.generate_quiz(
            text_content=all_text,
            quiz_count=request.quiz_count,
            difficulty=request.difficulty
        )
        
        print(f"DEBUG: Generated {len(quizzes)} quizzes")
        
        return QuizResponse(
            success=True,
            quizzes=quizzes,
            source_files=processed_files
        )
        
    except HTTPException:
        print("DEBUG: HTTPException caught, re-raising")
        raise
    except Exception as e:
        print(f"DEBUG: Unexpected error: {str(e)}")
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

