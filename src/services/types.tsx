export type PublicationStatus = "pending" | "approved" | "rejected";

export interface Publication {
  id: string;
  title: string;
  type: string;
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
  type: string;
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

interface Option {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  name: string;
  value: string;
  options: Option[];
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface PublicationType {
  id: number;
  name: string;
}

export interface StringDatePickerProps {
  selected: string;
  onChange: (dateString: string) => void;
  [key: string]: any;
}
