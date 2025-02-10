import { ResponseQaDto } from "@/app/type/qa/Qa";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getAllQa(courseId: string): Promise<ResponseQaDto[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/qa/${courseId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching QA data:", error);
    throw error;
  }
}
