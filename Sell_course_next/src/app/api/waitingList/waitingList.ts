import axios from "axios";

export const creatWaitingList = async (token: string, userId: string, courseId: string) => {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/waitlist/create_waitlist`,
            { userId, courseId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("❌ API Error:", error.response.status, error.response.data);
        } else {
            console.error("❌ Unknown error:", error);
        }
        throw error;
    }
};

export const fetchWaitingList = async (token: string, userId: string) => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/waitlist/get_waitlist/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.data;
        console.log("📩 API Response:", data);
        return data;
    } catch (error) {
        console.error("❌ Error fetching waiting list:", error);
        return [];
    }
};

export const deleteWaitingList = async (token: string, waitlistId: string) => {
    try {
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/waitlist/delete_waitlist/${waitlistId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error("❌ API Error:", error.response.status, error.response.data);
        } else {
            console.error("❌ Unknown error:", error);
        }
        throw error;
    }
};
