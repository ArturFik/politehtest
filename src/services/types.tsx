export type PublicationStatus = "pending" | "approved" | "rejected";

export interface Publication {
  id: number;
  title: string;
  type: "scientific" | "thesis";
  isCollectiveAuthors: boolean;
  authors: string;
  coauthors: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  status: PublicationStatus;
}

export interface FormData {
  title: string;
  type: "scientific" | "thesis";
  isCollectiveAuthors: boolean;
  authors: string;
  coauthors: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  noStateSecret: boolean;
  expertNumber: string;
  expertDate: string;
  expertStart: string;
  expertEnd: string;
  createdAt: string;
}
