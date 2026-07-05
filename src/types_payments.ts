export type InvoiceStatus = 'Draft' | 'Pending Payment' | 'Awaiting Verification' | 'Verified' | 'Paid' | 'Rejected' | 'Expired' | 'Cancelled';

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
  paymentReference?: string;
  receiptUrl?: string; // name or dummy url of uploaded file
  bankUsed?: string;
  paymentDate?: string;
  internalNotes?: string;
  auditLog: AuditLogEntry[];
}

