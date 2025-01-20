import axios from "axios";
import { SignUpRequest } from "@/app/interface/SignUpInterface"
export async function verifyEmail(email: string, lang: string) {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-email`, {
            email: email,
            lang : lang,
        });
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function register(signUpRequest: SignUpRequest) {
    try{
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
            token: signUpRequest.token,
            email : signUpRequest.email,
            username : signUpRequest.username,
            password : signUpRequest.password,
            gender : signUpRequest.gender,
            phoneNumber : signUpRequest.phoneNumber,

        });
        return response;
    } catch (error) {
        throw error;
    }
}

