import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobOfferModule } from './job_offer/job-offer.module';
import { ConfigModule } from '@nestjs/config';
import { JobOfferService } from './job_offer/job-offer.service';
import { PrismaService } from './prisma.service';
import { VecService } from './sqlite-vec.service';
import { AIModule } from './external/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JobOfferModule,
    AIModule
  ],
  controllers: [AppController],
  providers: [AppService, JobOfferService, PrismaService, VecService],
})
export class AppModule {}
