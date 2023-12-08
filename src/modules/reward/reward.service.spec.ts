import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
// import * as request from 'supertest';
// import request from 'supertest';
const request = require('supertest');

import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reward } from 'src/entities/Reward';
import { RewardModule } from './reward.module';

describe('RewardService (e2e)', () => {
  let app: INestApplication;
  let rewardRepository: Repository<Reward>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RewardModule], // Import your module here
    })
      .overrideProvider(getRepositoryToken(Reward))
      .useValue({
        // Mock the repository to return expected data
        find: jest.fn(() => []),
        save: jest.fn((entity) => entity),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    rewardRepository = moduleFixture.get<Repository<Reward>>(
      getRepositoryToken(Reward),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/rewards (POST)', () => {
    it('should create a new reward', async () => {
      const createRewardDto = {
        name: 'Test Reward',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        perDayLimit: 10,
        totalLimit: 100,
      };

      const response = await request(app.getHttpServer())
        .post('/rewards')
        .send(createRewardDto)
        .expect(HttpStatus.CREATED);

      const createdReward = response.body;
      expect(createdReward).toHaveProperty('id');
      expect(createdReward.name).toBe(createRewardDto.name);
      // Add more assertions based on your specific data model
    });

    it('should handle invalid input for creating a reward', async () => {
      const invalidCreateRewardDto = {
        // Missing required properties
      };

      const response = await request(app.getHttpServer())
        .post('/rewards')
        .send(invalidCreateRewardDto)
        .expect(HttpStatus.BAD_REQUEST);

      // Add assertions for the response indicating the validation error
    });
  });

  describe('/rewards (GET)', () => {
    it('should retrieve all rewards', async () => {
      // Mock the repository to return a list of rewards
      jest.spyOn(rewardRepository, 'find').mockImplementationOnce(() =>
        Promise.resolve([
          /* mock reward data */
        ]),
      );

      const response = await request(app.getHttpServer())
        .get('/rewards')
        .expect(HttpStatus.OK);

      const rewards = response.body;
      expect(Array.isArray(rewards)).toBe(true);
      // Add more assertions based on your specific data model
    });

    it('should handle errors when retrieving rewards', async () => {
      // Mock the repository to throw an error
      jest.spyOn(rewardRepository, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app.getHttpServer())
        .get('/rewards')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      // Add assertions for the response indicating the error
    });
  });
});
