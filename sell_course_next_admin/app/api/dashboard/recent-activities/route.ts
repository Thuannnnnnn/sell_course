import { NextRequest, NextResponse } from 'next/server';
import { dashboardApi } from '../../../../lib/dashboard-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    
    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          error: 'Invalid limit parameter. Must be between 1 and 100.',
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      );
    }
    
    const data = await dashboardApi.getRecentActivities(limit);
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Recent activities API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: error.message,
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}