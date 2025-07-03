import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = 'https://n8n.coursemaster.io.vn/webhook-test/generate-quiz';

export async function GET() {
  try {
    console.log('🧪 Testing n8n webhook connection...');
    
    // Test payload
    const testPayload = {
      content_urls: ['https://example.com/test-doc.pdf'],
      quiz_count: 1,
      difficulty: 'medium'
    };

    console.log('📤 Sending test request:', testPayload);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📥 Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      url: N8N_WEBHOOK_URL,
      testPayload
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: N8N_WEBHOOK_URL
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🧪 Testing n8n webhook with custom payload...');
    console.log('📤 Custom payload:', body);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📥 Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      url: N8N_WEBHOOK_URL,
      sentPayload: body
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: N8N_WEBHOOK_URL
    }, { status: 500 });
  }
}