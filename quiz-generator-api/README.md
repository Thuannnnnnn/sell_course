# Quiz Generator API

A FastAPI-based service that generates quizzes from DOCX and JSON files using OpenAI GPT.

## Features

- Accept multiple URLs containing DOCX or JSON files
- Extract text content from uploaded files
- Generate customizable quizzes using OpenAI GPT
- Support for different difficulty levels (easy, medium, hard)
- RESTful API with comprehensive error handling

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

## Configuration

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

## Usage

### Start the API server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### API Endpoints

#### POST /generate-quiz

Generate quizzes from multiple file URLs.

**Request Body:**
```json
{
  "urls": [
    "https://example.com/document.docx",
    "https://example.com/data.json"
  ],
  "quiz_count": 5,
  "difficulty": "medium"
}
```

**Parameters:**
- `urls`: List of URLs pointing to DOCX or JSON files
- `quiz_count`: Number of quiz questions to generate (default: 5)
- `difficulty`: Difficulty level - "easy", "medium", or "hard" (default: "medium")

**Response:**
```json
{
  "success": true,
  "quizzes": [
    {
      "id": 1,
      "question": "What is the main topic discussed?",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correct_answer": "A",
      "explanation": "Explanation of the correct answer",
      "difficulty": "medium",
      "topic": "Main Topic"
    }
  ],
  "source_files": ["document.docx", "data.json"],
  "error": null
}
```

#### GET /health

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "Quiz Generator API"
}
```

## Supported File Types

### DOCX Files
- Extracts text from paragraphs
- Extracts text from tables
- Handles complex document structures

### JSON Files
- Recursively extracts text content
- Handles nested objects and arrays
- Preserves key-value relationships in extracted text

## Example Usage with curl

```bash
# Generate quiz from URLs
curl -X POST "http://localhost:8000/generate-quiz" \
     -H "Content-Type: application/json" \
     -d '{
       "urls": [
         "https://example.com/document.docx"
       ],
       "quiz_count": 3,
       "difficulty": "medium"
     }'
```

## Example Usage with Python

```python
import requests

# API endpoint
url = "http://localhost:8000/generate-quiz"

# Request data
data = {
    "urls": [
        "https://example.com/document.docx",
        "https://example.com/data.json"
    ],
    "quiz_count": 5,
    "difficulty": "medium"
}

# Make request
response = requests.post(url, json=data)
result = response.json()

if result["success"]:
    print(f"Generated {len(result['quizzes'])} quiz questions")
    for quiz in result["quizzes"]:
        print(f"Q: {quiz['question']}")
        print(f"Answer: {quiz['correct_answer']}")
else:
    print(f"Error: {result['error']}")
```

## Error Handling

The API provides comprehensive error handling:

- Invalid URLs or unreachable files
- Unsupported file formats
- OpenAI API errors
- Network connectivity issues
- Invalid request parameters

All errors are returned in a consistent format with descriptive messages.

## Development

### Project Structure

```
quiz-generator-api/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── app/
│   ├── __init__.py
│   └── services/
│       ├── __init__.py
│       ├── file_processor.py    # File processing service
│       └── quiz_generator.py    # OpenAI quiz generation service
├── tests/                 # Test files
└── docs/                  # Documentation
```

### Running Tests

```bash
python test_api.py
```

## Deployment

The API is designed to run on `0.0.0.0:8000` and supports CORS for frontend integration.

For production deployment:
1. Set up proper environment variables
2. Use a production WSGI server like Gunicorn
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

## License

This project is provided as-is for educational and development purposes.

