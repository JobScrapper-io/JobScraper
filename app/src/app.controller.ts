import { Controller, Get, Query, Render } from '@nestjs/common';
import { JobOfferService } from './job_offer/job-offer.service';
import { Prisma } from 'prisma/generated/client';

@Controller()
export class AppController {
  constructor(
    private readonly jobOfferService: JobOfferService,
  ) {}

  @Get()
  @Render('index')
  async root(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sortBy') sortBy: string = 'id',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('search') search?: string,
    @Query('title') title?: string,
    @Query('location') location?: string,
    @Query('type') type?: "praca zdalna" | "praca stacjonarna" | "praca hybrydowa",
    @Query('skills') skills?: string,
  ) {
    const allowedLimits = ["5", "10", "20", "50"];

    const pageInt = Math.max(1, parseInt(page));
    const limitInt = allowedLimits.includes(limit) ? Math.max(1, parseInt(limit)) : 10;

    const skip = (pageInt - 1) * limitInt;

    const whereAND: Prisma.JobOfferWhereInput[] = []

    const where: Prisma.JobOfferWhereInput = {
      AND: whereAND,
    };

    if(title) {
      whereAND.push({title: { contains: title }});
    }

    if(location) {
      whereAND.push({location: { contains: location }});
    }

    if(type) {
      const typeEnglish = {
        "praca zdalna": "remote work",
        "praca stacjonarna": "full office work",
        "praca hybrydowa": "hybrid work"
      }

      whereAND.push(
        {
          OR: [
            {location: { contains: type }},
            {location: { contains: typeEnglish[type] }},
          ]
        }
      );
    }

    if(skills) {
      const skillConditions = skills.split(',').map(skill => ({
        skills: { contains: `"${skill.trim()}"` } 
      }));

      whereAND.push(...skillConditions);
    }

    const jobOffersParams = {
      skip,
      take: limitInt,
      orderBy: { [sortBy]: sortOrder },
      where
    }
    
    const ids = await this.jobOfferService.jobOffersID(where, jobOffersParams.orderBy);

    const rawJobOffers = search ? 
      await this.jobOfferService.jobOffersBySimilarity(search, ids, skip, limitInt, 0.4, sortOrder.toUpperCase() as 'ASC' | 'DESC') :
      await this.jobOfferService.jobOffers(jobOffersParams);

    const jobOffersData = (rawJobOffers.data as any[]).map(offer => {
      offer.skills = offer.skills ? Array.from(new Set(JSON.parse(offer.skills as string))) : [];
      return offer;
    })
    
    return {data: jobOffersData, total: rawJobOffers.total, page: pageInt, limit: limitInt, pages: Math.ceil(rawJobOffers.total / limitInt)};
  }
}
