import { Injectable } from '@nestjs/common';
import * as sqliteVec from 'sqlite-vec';
import Database from 'better-sqlite3';
import { JobOffer } from 'prisma/generated/client';

@Injectable()
export class VecService {
  private db;

  constructor() {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '');
    this.db = new Database(dbPath);
    sqliteVec.load(this.db);
  }

  searchBySimilarity(
    embedding: number[], 
    ids: string[],
    take: number,
    skip: number,
    similarity: number,
    sortOrder: 'ASC' | 'DESC' = 'ASC'
  ): {data: JobOffer[], total: number} {
    const floatArray = new Float32Array(embedding);
    const buffer = Buffer.from(floatArray.buffer);

    const placeholders = ids.map(() => '?').join(',');

    const stmtTotal = this.db.prepare(`
      SELECT
        count(*) AS total
      FROM job_offers
      WHERE id IN (${placeholders}) AND
        vec_distance_cosine(?, embedding) <= ?;
    `);

    const stmtData = this.db.prepare(`
      SELECT
        id, title, company, location, description, url, source, published_at,
        skills, salary_employment, salary_b2b, salary_contract
      FROM job_offers
      WHERE id IN (${placeholders}) AND 
        vec_distance_cosine(?, embedding) <= ?
      ORDER BY vec_distance_cosine(?, embedding) ${sortOrder}
      LIMIT ? OFFSET ?;
    `);

    return this.db.transaction(() => {
      const totalRow = stmtTotal.get(
        ...ids,
        buffer,
        1 - similarity
      ) as { total: number };

      const data = stmtData.all(
        ...ids,
        buffer,
        1 - similarity,
        buffer,
        take ?? 10,
        skip ?? 0
      ) as JobOffer[];

      return {
        total: totalRow.total,
        data,
      };
    })();
  }
}