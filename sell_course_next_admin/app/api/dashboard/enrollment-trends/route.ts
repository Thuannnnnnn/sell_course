import { createDashboardApi } from "@/lib/dashboard-api";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dashboardApi = await createDashboardApi();
    const data = await dashboardApi.getEnrollmentTrends();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Enrollment trends API error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
