import { Module } from '@nestjs/common';
import { AIClient } from './ai.client';

@Module({
  imports: [],
  providers: [AIClient],
  exports: [AIClient],
})
export class AIModule {}