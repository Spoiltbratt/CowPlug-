export type InvoiceStatus = 
  | 'Awaiting Invoice' 
  | 'Awaiting Payment' 
  | 'Awaiting Verification' 
  | 'Approved' 
  | 'Rejected' 
  | 'Livestock Onboarded';

export interface AuditLogEntry {
  date: string;
  status: InvoiceStatus;
  actionBy: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerEmail: string;
  customerFullName: string;
  customerId: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
  
  // Livestock Information
  animalType: 'Cow' | 'Goat' | 'Ram';
  breed: string;
  quantity: number;
  estimatedAge?: string;
  purchasePrice?: number;
  
  // Tag Information
  reservedTag: string; // CPG-CW-0001 etc.
  
  // Management Package
  feedingPackage: {
    name: string;
    monthlyCost: number;
    veterinaryCoverage: string;
    managementServices: string;
    duration: string;
  };

  // Payment Information (Manual)
  bankName?: string; // Displayed to user
  accountName?: string;
  accountNumber?: string;
  paymentDeadline?: string;
  
  // Verification Data
  paymentReference?: string;
  paymentDate?: string;
  bankUsed?: string;
  
  // Receipt Data (Uploaded by user)
  receiptUrl?: string;
  senderBankName?: string;
  amountPaid?: number;
  transactionReference?: string;
  
  internalNotes?: string;
  auditLog: AuditLogEntry[];
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

