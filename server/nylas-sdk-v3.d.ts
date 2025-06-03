export interface EmailData {
  to: string
  subject: string
  body: string
  replyTo?: string
}

export function generateNylasAuthUrl(email: string, callbackUrl: string): string
export function exchangeCodeForToken(code: string, redirectUri: string): Promise<string>
export function checkNylasConnection(grantId: string): Promise<boolean>
export function createFolderStructure(grantId: string): Promise<{ success: boolean; folderIds?: Record<string, string>; error?: string }>
export function sendEmailWithNylas(grantId: string, emailData: EmailData, category: string): Promise<{ success: boolean; messageId?: string | null; error?: any }>
export function getMessagesFromCategory(grantId: string, category: string, limit?: number): Promise<any[]>
