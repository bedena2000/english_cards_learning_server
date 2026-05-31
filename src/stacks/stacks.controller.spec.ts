import { Test, TestingModule } from '@nestjs/testing';
import { StacksController } from './stacks.controller';

describe('StacksController', () => {
  let controller: StacksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StacksController],
    }).compile();

    controller = module.get<StacksController>(StacksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
