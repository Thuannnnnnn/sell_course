# Quick Start Guide - Quiz Generator API

## 🚀 Getting Started in 3 Steps

### Step 1: Set up the environment
```bash
# Navigate to the project directory
cd quiz-generator-api

# Install dependencies
pip install -r requirements.txt

# Set up your Google Gemini API key
cp .env.example .env
# Edit .env file and replace 'your_gemini_api_key_here' with your actual Google Gemini API key
```

### Step 2: Start the API server
```bash
python main.py
```

The server will start on `http://localhost:8000`

### Step 3: Test the API

#### Option A: Use the example client
```bash
python example_client.py
```

#### Option B: Use curl
```bash
curl -X POST "http://localhost:8000/generate-quiz" \
     -H "Content-Type: application/json" \
     -d '{
       "urls": ["https://jsonplaceholder.typicode.com/posts/1"],
       "quiz_count": 3,
       "difficulty": "medium"
     }'
```

#### Option C: Visit the interactive docs
Open your browser and go to: `http://localhost:8000/docs`

## 📁 Supported File Types

- **DOCX files**: Word documents (extracts text from paragraphs and tables)
- **JSON files**: JSON data (recursively extracts all text content)

## 🔧 API Parameters

- `urls`: List of URLs pointing to DOCX or JSON files
- `quiz_count`: Number of questions to generate (default: 5)
- `difficulty`: "easy", "medium", or "hard" (default: "medium")

## 🔑 Google Gemini API Key

You need a Google Gemini API key to use this service:
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it to your `.env` file

## 📖 Full Documentation

See `README.md` for complete documentation and advanced usage examples.

## ❓ Troubleshooting

- **"Gemini API key not configured"**: Make sure you've set up your `.env` file correctly
- **Connection errors**: Ensure the URLs are accessible and point to valid DOCX/JSON files
- **Import errors**: Make sure all dependencies are installed with `pip install -r requirements.txt`

