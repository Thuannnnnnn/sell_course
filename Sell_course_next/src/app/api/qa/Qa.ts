import { ResponseQaDto } from "@/app/type/qa/Qa";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export async function getAllQa(courseId: string): Promise<ResponseQaDto[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/qa/${courseId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching QA data:", error);
    throw error;
  }
}


export async function createQa(
  userEmail: string,
  courseId: string,
  text: string,
  parentId: string | null = null
): Promise<ResponseQaDto> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/qa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail,
        courseId,
        text,
        parentId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create QA: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating QA:", error);
    throw error;
  }
}


export async function deleteQa(qaId: string): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/qa/${qaId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete QA: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting QA:", error);
    throw error;
  }
}
