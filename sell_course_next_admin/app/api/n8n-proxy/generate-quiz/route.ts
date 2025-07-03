import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://n8n.coursemaster.io.vn/webhook-test/generate-quiz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'URLs array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (!body.quiz_count || body.quiz_count < 1 || body.quiz_count > 20) {
      return NextResponse.json(
        { success: false, error: 'quiz_count must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Prepare data for n8n webhook (map to expected field names)
    const n8nPayload = {
      content_urls: body.urls, // n8n expects 'content_urls' not 'urls'
      quiz_count: body.quiz_count,
      difficulty: body.difficulty || 'medium'
    };

    console.log('🚀 Sending request to n8n webhook:', {
      url: N8N_WEBHOOK_URL,
      payload: n8nPayload,
      originalBody: body
    });

    // Call n8n webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('❌ n8n webhook error:', {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        error: errorText,
        url: N8N_WEBHOOK_URL,
        payload: n8nPayload
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `n8n webhook failed: ${n8nResponse.status} ${n8nResponse.statusText}. ${errorText ? 'Details: ' + errorText.substring(0, 200) : ''}` 
        },
        { status: 500 }
      );
    }

    const n8nResult = await n8nResponse.json();
    console.log('✅ n8n webhook response:', JSON.stringify(n8nResult, null, 2));

    // Transform n8n response to match expected format
    // Handle different possible response structures from n8n
    let quizzes = [];
    let sourceFiles = [];
    
    // Try different possible paths for quiz data
    if (n8nResult.quizzes) {
      quizzes = n8nResult.quizzes;
    } else if (n8nResult.questions) {
      quizzes = n8nResult.questions;
    } else if (n8nResult.data?.quizzes) {
      quizzes = n8nResult.data.quizzes;
    } else if (n8nResult.data?.questions) {
      quizzes = n8nResult.data.questions;
    } else if (Array.isArray(n8nResult)) {
      quizzes = n8nResult;
    } else if (n8nResult.result?.quizzes) {
      quizzes = n8nResult.result.quizzes;
    }
    
    // Try different possible paths for source files
    if (n8nResult.source_files) {
      sourceFiles = n8nResult.source_files;
    } else if (n8nResult.sources) {
      sourceFiles = n8nResult.sources;
    } else if (n8nResult.data?.sources) {
      sourceFiles = n8nResult.data.sources;
    } else if (n8nResult.data?.source_files) {
      sourceFiles = n8nResult.data.source_files;
    }
    
    const transformedResponse = {
      success: true,
      quizzes: quizzes,
      source_files: sourceFiles
    };
    
    console.log('🔄 Transformation result:', {
      originalKeys: Object.keys(n8nResult),
      foundQuizzes: quizzes.length,
      foundSources: sourceFiles.length,
      quizzesType: Array.isArray(quizzes) ? 'array' : typeof quizzes,
      sourcesType: Array.isArray(sourceFiles) ? 'array' : typeof sourceFiles
    });

    // Validate response structure
    if (!Array.isArray(transformedResponse.quizzes)) {
      console.error('❌ Invalid n8n response structure:', n8nResult);
      return NextResponse.json(
        { success: false, error: 'Invalid response format from AI service' },
        { status: 500 }
      );
    }

    if (transformedResponse.quizzes.length === 0) {
      console.warn('⚠️ n8n returned empty quiz array');
      return NextResponse.json(
        { success: false, error: 'No quiz questions were generated. Please check your content and try again.' },
        { status: 400 }
      );
    }

    // Ensure each quiz has required fields and validate structure
    transformedResponse.quizzes = transformedResponse.quizzes.map((quiz: any, index: number) => {
      // Validate required fields
      if (!quiz.question || typeof quiz.question !== 'string') {
        console.warn(`⚠️ Quiz ${index} missing or invalid question:`, quiz);
      }
      
      if (!Array.isArray(quiz.options) || quiz.options.length < 2) {
        console.warn(`⚠️ Quiz ${index} missing or invalid options:`, quiz);
      }

      return {
        id: quiz.id || `ai-${Date.now()}-${index}`,
        question: quiz.question || `Generated Question ${index + 1}`,
        options: Array.isArray(quiz.options) && quiz.options.length >= 2 
          ? quiz.options.slice(0, 4) // Limit to 4 options max
          : [`Option A`, `Option B`, `Option C`, `Option D`], // Fallback options
        correctAnswer: typeof quiz.correctAnswer === 'number' && 
                      quiz.correctAnswer >= 0 && 
                      quiz.correctAnswer < (quiz.options?.length || 4) 
          ? quiz.correctAnswer 
          : 0,
        difficulty: ['easy', 'medium', 'hard'].includes(quiz.difficulty) 
          ? quiz.difficulty 
          : 'medium',
        weight: typeof quiz.weight === 'number' && quiz.weight > 0 
          ? quiz.weight 
          : (quiz.difficulty === 'easy' ? 2 : quiz.difficulty === 'hard' ? 8 : 5)
      };
    });

    console.log('✅ Transformed response:', transformedResponse);
    return NextResponse.json(transformedResponse);

  } catch (error) {
    console.error('❌ API Error:', error);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - AI service took too long to respond';
        statusCode = 408;
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}