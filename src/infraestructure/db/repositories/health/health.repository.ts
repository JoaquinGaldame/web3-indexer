import { sql } from "drizzle-orm";
import { db } from "../../client";

export class DatabaseHealthRepository {
  async isHealthy(): Promise<boolean> {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }
}