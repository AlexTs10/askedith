
export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface EmailData {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
    organization: string;
  };
  recipient: string;
  content: string;
  date: string;
  read: boolean;
  replied: boolean;
  responseReceived: boolean;
  private: boolean;
  category: string; // Changed from union type to string to allow custom categories
  attachments?: EmailAttachment[];
  cc?: string[];
  bcc?: string[];
}
