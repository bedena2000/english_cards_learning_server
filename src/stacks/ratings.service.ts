import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StacksService } from "./stacks.service";
import { UpsertRatingDto } from "./dto/upsert-rating.dto";

@Injectable()
export class RatingsService {
    constructor(
        private prisma: PrismaService,
        private stacksService: StacksService
    ) {}

    async upsert(userId: bigint, stackId: bigint, dto: UpsertRatingDto) {
        const stack = await this.stacksService.getStackOrThrow(stackId);
        this.stacksService.assertCanView(stack, userId);

        const rating = await this.prisma.stackRating.upsert({
            where: { stackId_userId: { stackId, userId } },
            create: { stackId, userId, rating: dto.rating },
            update: { rating: dto.rating },
        });

        return {
            rating: rating.rating,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
        };
    };

    async remove(userId: bigint, stackId: bigint) {
        const stack = await this.stacksService.getStackOrThrow(stackId);
        this.stacksService.assertCanView(stack, userId);

        await this.prisma.stackRating.deleteMany({
            where: { stackId, userId }
        });

        return { success: true };
    };
}