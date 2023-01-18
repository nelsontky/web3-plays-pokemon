import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
import type { Database } from "firebase-admin/lib/database/database";

@Injectable()
export class RealtimeDatabaseService {
  private readonly db: Database;

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }

    this.db = admin.database();
  }

  push(ref: string, value: any) {
    const participantRef = this.db.ref(ref);

    return new Promise((resolve, reject) => {
      participantRef.push(value, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }
}
