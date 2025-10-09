export type EntityType =
  | "health-users"
  | "health-workers"
  | "clinics"
  | "clinical-documents";

export interface SearchHistory {
  id: string;
  entity: EntityType;
  term: string;
  timestamp: Date;
}

export type DocumentType = "ID" | "PASSPORT";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface HealthUser {
  id: string;
  document?: string;
  documentType?: DocumentType;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  imageUrl?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  clinicalHistoryId?: string;
  clinicIds?: string[];
}

export interface HealthWorker {
  id: string;
  document?: string;
  documentType?: DocumentType;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  imageUrl?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  licenseNumber?: string;
  clinicIds?: string[];
  specialtyIds?: string[];
  clinicalHistoryIds?: string[];
  clinicalDocumentIds?: string[];
}

export interface Clinic {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  domain?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalDocument {
  id: string;
  title?: string;
  contentUrl?: string;
  createdAt: string;
  updatedAt: string;
  clinicalHistoryId?: string;
  healthWorkerIds?: string[];
}
