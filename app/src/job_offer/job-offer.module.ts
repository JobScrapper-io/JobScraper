import { Module } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { JobOfferController } from './job-offer.controller';
import { PrismaService } from '../prisma.service';
import { VecService } from 'src/sqlite-vec.service';
import { AIModule } from 'src/external/ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [JobOfferController],
  providers: [JobOfferService, PrismaService, VecService],
})
export class JobOfferModule {}
