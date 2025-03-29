import {
  Interaction,
  InteractionResponseDTO,
} from "@/app/type/Interaction/Interaction";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const interactionApi = {
  createOrUpdateInteraction: async (
    data: Interaction
  ): Promise<InteractionResponseDTO> => {
    const response = await axios.post(`${API_URL}/interaction`, data);
    return response.data;
  },
};
