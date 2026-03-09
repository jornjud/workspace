export interface Slip {
  id: string;
  amount: number;
  date: string;
  time: string;
  bank: string;
  senderName: string;
  senderAccount?: string;
  receiverName: string;
  receiverPhone?: string;
  reference: string;
  imageUrl?: string;
  category?: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
