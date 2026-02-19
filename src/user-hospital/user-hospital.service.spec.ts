//user-hospital.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserHospitalService } from './user-hospital.service';

describe('UserHospitalService', () => {
  let service: UserHospitalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserHospitalService],
    }).compile();

    service = module.get<UserHospitalService>(UserHospitalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
