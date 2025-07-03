// n8n API utilities for AI quiz generation

export interface N8nQuizRequest {
  urls: string[];
  quiz_count: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface N8nQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  weight: number;
}

export interface N8nQuizResponse {
  success: boolean;
  quizzes: N8nQuizQuestion[];
  source_files: string[];
  error?: string;
}

export interface N8nTestResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  error?: string;
}

/**
 * Generate AI quiz using n8n webhook
 */
export const generateAIQuiz = async (request: N8nQuizRequest): Promise<N8nQuizResponse> => {
  try {
    const response = await fetch('/api/n8n-proxy/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: N8nQuizResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'AI quiz generation failed');
    }

    return result;
  } catch (error) {
    console.error('❌ AI Quiz Generation Error:', error);
    throw error;
  }
};

/**
 * Validate quiz request before sending to n8n
 */
export const validateQuizRequest = (request: N8nQuizRequest): string | null => {
  if (!request.urls || !Array.isArray(request.urls) || request.urls.length === 0) {
    return 'At least one content URL is required (content_urls field)';
  }

  if (!request.quiz_count || request.quiz_count < 1 || request.quiz_count > 20) {
    return 'Quiz count must be between 1 and 20';
  }

  // Validate difficulty
  if (request.difficulty && !['easy', 'medium', 'hard'].includes(request.difficulty)) {
    return 'Difficulty must be easy, medium, or hard';
  }

  // Validate URLs format (basic check)
  const invalidUrls = request.urls.filter(url => {
    if (typeof url !== 'string' || url.trim().length === 0) {
      return true;
    }
    // Basic URL validation - allow both http/https and relative URLs
    return !url.includes('://') && !url.startsWith('/') && !url.startsWith('.');
  });

  if (invalidUrls.length > 0) {
    return `Invalid URLs found: ${invalidUrls.slice(0, 3).join(', ')}${invalidUrls.length > 3 ? '...' : ''}`;
  }

  return null;
};

/**
 * Get default weight based on difficulty
 */
export const getDefaultWeight = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  switch (difficulty) {
    case 'easy': return 2;
    case 'medium': return 5;
    case 'hard': return 8;
    default: return 5;
  }
};

/**
 * Test n8n webhook connection
 */
export const testN8nConnection = async (): Promise<N8nTestResponse> => {
  try {
    const response = await fetch('/api/n8n-proxy/test', {
      method: 'GET',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ n8n Connection Test Error:', error);
    throw error;
  }
};