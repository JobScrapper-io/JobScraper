import { Injectable } from '@nestjs/common';

@Injectable()
export class AIClient {
  constructor() {}

  async getEmbedding(text: string): Promise<{embedding: number[]}> {
    const response = await fetch(process.env.AI_SERVICE_URL + "/embed", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    
    return await response.json()
  }
}