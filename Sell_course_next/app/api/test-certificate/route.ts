import { NextRequest, NextResponse } from 'next/server';
import { certificateApi } from '../../api/certificates/certificate';

export async function POST(request: NextRequest) {
  try {
    const { certificateId } = await request.json();
    
    if (!certificateId) {
      return NextResponse.json(
        { success: false, error: 'Certificate ID is required' },
        { status: 400 }
      );
    }
    
    console.log('🧪 Test API called with certificate ID:', certificateId);
    
    // Call our certificate API
    const result = await certificateApi.verifyCertificate(certificateId);
    
    console.log('📋 API Result:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Test API Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Certificate Test API',
    endpoints: [
      'POST /api/test-certificate - Test certificate verification'
    ],
    testIds: [
      'CERT-123456 - Valid certificate (Advanced React Development)',
      'CERT-789012 - Valid certificate (Node.js Fundamentals)', 
      'CERT-345678 - Revoked certificate (Python Web Development)',
      'CERT-INVALID - Invalid certificate ID'
    ]
  });
}
