import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaMariaDb({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'english_cards_admin',
        password: process.env.DB_PASSWORD || 'kurdgeli4',
        database: process.env.DB_NAME || 'english_cards_learning_db',
        allowPublicKeyRetrieval: true,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
