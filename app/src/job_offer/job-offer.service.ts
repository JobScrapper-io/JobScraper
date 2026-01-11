import { Injectable } from '@nestjs/common';
import { JobOffer, Prisma } from 'prisma/generated/client';
import { AIClient } from 'src/external/ai/ai.client';
import { PrismaService } from 'src/prisma.service';
import { VecService } from 'src/sqlite-vec.service';

@Injectable()
export class JobOfferService {
  constructor(
    private prisma: PrismaService,
    private vecService: VecService,
    private aiClient: AIClient,
  ) {}

  async jobOffersBySimilarity(
    search: string, 
    ids: string[],
    skip: number,
    take: number, 
    similarity = 0.4,
    sortOrder: 'ASC' | 'DESC' = 'ASC'
  ): Promise<{data: JobOffer[], total: number}> {
    const { embedding } = await this.aiClient.getEmbedding(search);
    return this.vecService.searchBySimilarity(embedding, ids, take, skip, similarity, sortOrder);
  }

  async jobOffer(
    jobOfferWhereUniqueInput: Prisma.JobOfferWhereUniqueInput,
  ): Promise<Omit<JobOffer, "embedding"> | null> {
    return this.prisma.jobOffer.findUnique({
      omit: {
        embedding: true,
      },
      where: jobOfferWhereUniqueInput,
    });
  }

  async jobOffersCount(params: {
    where?: Prisma.JobOfferWhereInput
  }): Promise<number> {
    const { where } = params;
    return this.prisma.jobOffer.count({
      where,
    });
  }

  async jobOffersID(
    jobOfferWhereInput: Prisma.JobOfferWhereInput,
    orderBy?: Prisma.JobOfferOrderByWithRelationInput,
  ): Promise<string[]> {
    const filteredOffers = await this.prisma.jobOffer.findMany({
      where: jobOfferWhereInput,
      select: { id: true },
      orderBy
    });

    const ids = filteredOffers.map((f) => f.id);

    return ids
  }

  async jobOffers(params: {
    skip?: number;
    take?: number;
    where?: Prisma.JobOfferWhereInput;
    orderBy?: Prisma.JobOfferOrderByWithRelationInput;
  }): Promise<{data: Omit<JobOffer, "embedding">[], total: number}> {
    const { skip, take, where, orderBy } = params;
    const [data, total] = await this.prisma.$transaction([
        this.prisma.jobOffer.findMany({
          omit: {
            embedding: true,
          },
          skip,
          take,
          where,
          orderBy,
        }),
        this.prisma.jobOffer.count({ where })
    ])

    return { data, total }
  }
}
