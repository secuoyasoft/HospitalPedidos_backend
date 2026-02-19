import { Test, TestingModule } from '@nestjs/testing';
import { UserHospitalController } from './user-hospital.controller';
import { UserHospitalService } from './user-hospital.service';

describe('UserHospitalController', () => {
  let controller: UserHospitalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserHospitalController],
      providers: [UserHospitalService],
    }).compile();

    controller = module.get<UserHospitalController>(UserHospitalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
