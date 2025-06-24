#!/usr/bin/env python3
"""
Example client for Quiz Generator API
"""
import requests
import json

def test_quiz_generation():
    """Test the quiz generation API"""
    
    # API endpoint
    api_url = "http://localhost:8000/generate-quiz"
    
    # Example request data
    request_data = {
        "urls": [
            # Example JSON API endpoint (publicly available)
            "https://jsonplaceholder.typicode.com/posts/1",
            # You can add more URLs here, including DOCX files
        ],
        "quiz_count": 3,
        "difficulty": "medium"
    }
    
    try:
        print("Sending request to Quiz Generator API...")
        print(f"URLs: {request_data['urls']}")
        print(f"Quiz count: {request_data['quiz_count']}")
        print(f"Difficulty: {request_data['difficulty']}")
        print("-" * 50)
        
        # Make the API request
        response = requests.post(api_url, json=request_data, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            
            if result["success"]:
                print(f"✓ Successfully generated {len(result['quizzes'])} quiz questions!")
                print(f"Source files: {', '.join(result['source_files'])}")
                print("\nGenerated Quizzes:")
                print("=" * 60)
                
                for i, quiz in enumerate(result["quizzes"], 1):
                    print(f"\nQuiz {i}:")
                    print(f"Topic: {quiz['topic']}")
                    print(f"Difficulty: {quiz['difficulty']}")
                    print(f"Question: {quiz['question']}")
                    print("Options:")
                    for option, text in quiz['options'].items():
                        marker = "→" if option == quiz['correct_answer'] else " "
                        print(f"  {marker} {option}: {text}")
                    print(f"Explanation: {quiz['explanation']}")
                    print("-" * 40)
                
            else:
                print(f"✗ API returned error: {result.get('error', 'Unknown error')}")
                
        else:
            print(f"✗ HTTP Error {response.status_code}: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to the API. Make sure the server is running on http://localhost:8000")
    except requests.exceptions.Timeout:
        print("✗ Request timed out. The API might be processing large files.")
    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")

def check_api_health():
    """Check if the API is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✓ API is {result['status']}: {result['service']}")
            return True
        else:
            print(f"✗ API health check failed: {response.status_code}")
            return False
    except:
        print("✗ API is not accessible. Make sure it's running on http://localhost:8000")
        return False

if __name__ == "__main__":
    print("Quiz Generator API - Example Client")
    print("=" * 40)
    
    # Check API health first
    if check_api_health():
        print("\nTesting quiz generation...")
        test_quiz_generation()
    else:
        print("\nTo start the API server, run:")
        print("python main.py")

