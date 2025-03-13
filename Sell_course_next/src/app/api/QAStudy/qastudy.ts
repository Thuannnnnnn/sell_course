import axios from "axios";

export const createQa = async (
  userEmail: string,
  courseId: string,
  text: string,
  parentId: string,
  token: string
) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/qa_study`,
    {
      userEmail,
      courseId,
      text,
      parentId,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updatesQa = async (
  qaId: string,
  courseId: string,
  text: string,
  token: string
) => {
  const response = await axios.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/qa_study/${qaId}`,
    {
      courseId,
      text,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteQa = async (qaId: string, token: string) => {
  const response = await axios.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/qa_study/${qaId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const createReaction = async (
  userId: string,
  qaStudyId: string,
  reactionType: string,
  courseId: string,
  token: string
) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-qa`,
    {
      userId,
      qaStudyId,
      reactionType,
      courseId,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
export const deleteReaction = async (
  userId: string,
  qaStudyId: string,
  courseId: string,
  token: string
) => {
  const response = await axios.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-qa/${qaStudyId}/${userId}/${courseId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
