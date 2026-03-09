// Firebase Admin for server-side operations
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Use Firebase Admin for server-side
const serviceAccount = {
  type: 'service_account',
  project_id: 'secondphone-fe9a9',
  private_key_id: 'e0cc6cea8620124da60f46b0048b844c174bf162',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxA0KWHWSae1LJ\nyL3Q6PGHZwXedfHjeMfWdxnCYDSqmwtAhzKVbRcGE9gvsWIEuUGLEXTcNUfY90La\nE6CldrU/CL4ZiC9+k0zG9hiz3JKbCownsIf6sVahwXmk0Aa+qxHcDNaJ9rx3iHDw\nvbkKd+g6DzbHZuveSJguWxl4jU9zg3XVh9IpciYcZii21cG4QjDlZAVdVhxbsMLw\nIIYjgs6u8AN6/GKxzVH0MlrGoT6V/C4auCRfhcYRTo9+um86WIWg65lMjZQYes/c\nliVMN1v/TVZLzEkn7Ll9ROzZF7+RPy3woFDtaAm8w+/qFO7HL4HUm8OtTnJsBmy6\neP+NsfrhAgMBAAECggEACa3spUQnUxv7JIP2zrqdMf72AwKasvpQ3asyuDZ97MYY\nhvtZnpKJ/bPmOIHr8ueNNClExVGfy5dGQ2HrQP8JNVChYgiolbSg8DiG9GdjaClb\nDYTNg72wp7zaXbL/KmwU+H4meWH5z3TBXcW3HZGd3BZmw7++1j9snGzQe09JXN7o\nLdFuq6Nl94bewl2rofxH5S0c0LZeWBAWwRJNekW+VWgLXe/JBsMvUKWOoawRwP4h\nv6Nrq2L4+6CJa49WjH1ygQy8PBUy14fJKVCIjxb7L07K15s6G/+8u+ttOpDZX8vb\nWmbqUNy9SEdERvLZVBha0qA0CvXsL2s7++ssUOMmsQKBgQDcvW0SpCkBy3HilyLs\nUTjKYT0r4oE6YpFLEVRlR7DtfI/+M9VgliuesL8Tlbiwekvmz2I1lpcX3yb3genC\n+k/jiMtpc1OwddoKH4QhfogNTn8ILikuOzdDVY631sZnktothdRuppML1CrPgd1N\nHtR2vuIZI/ymlgDUBDwOKPkQsQKBgQDNSbnSI0SNuBqy5KrNP26q9VJgUi94rb3e\nwHJpYuxH2MhAUfWb91Yrlu5V/jBSNKU2EEvOpOIillvBbkHpXIp79QsGvxA9OZU8\nQnO3J29vGfWkQETmBRw9VLezeLTZBp2IFs4+WGIWafaLwz9bnqwMG9FTaPLZVcsQ\nCYh/7syZMQKBgQC9Z+SxfB6bpZ/g1+JleAQM04cTotVT7cPR79rE1NEh1iIP8xYC\nPJjNH8e03GGPPEDomcYhSUf4ecgL1HNqlDH8gSJZJ1YGMfmXehd8TgAbuuERedpo\nCvOOWVmOsUGpGb8QFKeFEnVWTwU07K+hPvT7typ2fASMRGYNhlypocqk4QKBgC4b\nE9flQd1ObviksNO+Hl3ZETI+4xiIdO9Va5zNseGFB5yii7YGu9y4XjkECNg9qKlW\nyZ/UmlFIUb1ExRrjRNsIMvzF5qDJkQHirtiAy985BllocdDzbt87arKtNnjTqofJ\nD3MjKIx+KfhD1rP+FAf4K3A/TuOPCDdG3NhWyq7RAoGAWlf/wznBcmVwIYnMp7LR\n5xbUCkgPViqgBOZW/ljeo+By4zw4a1ovkZ5AcF+KAiI4m+XnzaC8Nke5/WXZSTqV\n2yPezw2sASp1UUhjtKdNqHJOvqERg4GQgrSHZKhn5z8cnLUdI0enYxWyTXzKv7je\nMmhhFdL4lEgze5Sd7yIM5s8=\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-fbsvc@secondphone-fe9a9.iam.gserviceaccount.com',
  client_id: '107760948572610290767',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
};

let db: Firestore;

export function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount as any),
    });
  }
  if (!db) {
    db = getFirestore();
  }
  return db;
}
