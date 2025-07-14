import axios from "axios";
import type { AxiosInstance } from "axios";
import type { FormData, Publication } from "./types";
const apiUrl = "https://6874d3e3dd06792b9c9568ec.mockapi.io";

const api: AxiosInstance = axios.create({
  baseURL: apiUrl,
});

export const selector_api = async () => {
  try {
    const response = await api.get(`/api/v1/politeh/name`);

    return response.data;
  } catch (error) {
    console.error("Error get for selector:", error);
    throw error;
  }
};

export const getPublications = async (): Promise<Publication[]> => {
  try {
    const response = await api.get(`/api/v1/politeh/all`);
    return response.data;
  } catch (error) {
    console.error("Error getting publications:", error);
    throw error;
  }
};

export const createPublication = async (
  formData: FormData
): Promise<Publication> => {
  try {
    const publicationData = {
      title: formData.title,
      type: formData.type,
      isCollectiveAuthors: formData.isCollectiveAuthors,
      authors: formData.authors,
      coauthors: formData.coauthors.join(", "),
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      status: "pending" as const,
      noStateSecret: formData.noStateSecret,
      expertNumber: formData.expertNumber,
      expertDate: formData.expertDate,
      expertStart: formData.expertStart,
      expertEnd: formData.expertEnd,
      createdAt: new Date().toLocaleString("ru-RU", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
    };

    const response = await api.post(`/api/v1/politeh/all`, publicationData);
    return response.data;
  } catch (error) {
    console.error("Error creating publication:", error);
    throw error;
  }
};

export const updatePublicationStatus = async (
  id: string,
  status: "pending" | "approved" | "rejected"
): Promise<Publication> => {
  try {
    const response = await api.put(`/api/v1/politeh/all/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating publication status:", error);
    throw error;
  }
};
