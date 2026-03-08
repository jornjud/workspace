import phonesData from "../data/phones.json";

export interface Phone {
  id: string;
  model: string;
  storage: string;
  color: string;
  price: number;
  condition: string;
  conditionNote: string;
  images: string[];
  specs: string;
  year: number;
  addedAt: string;
  status: string;
  hidden: boolean;
}

export const phones: Phone[] = phonesData.phones;

export function getPhoneById(id: string): Phone | undefined {
  return phones.find((p) => p.id === id);
}

export function getVisiblePhones(): Phone[] {
  return phones.filter((p) => !p.hidden);
}
