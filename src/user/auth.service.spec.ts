import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const userModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'SECRET_KEY') return 'test-secret';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: userModel },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should signup and return access token', async () => {
    userModel.findOne.mockResolvedValue(null);
    userModel.create.mockResolvedValue({
      _id: 'u1',
      email: 'new@example.com',
      username: 'new',
      isAdmin: false,
      isSigned: true,
    });

    const result = await service.signup({ email: 'new@example.com', password: '123456' });

    expect(result.accessToken).toBeDefined();
    expect(result.user.email).toBe('new@example.com');
  });

  it('should login and return access token', async () => {
    const user = {
      _id: 'u2',
      email: 'login@example.com',
      username: 'login',
      password: 'salt:hash',
      isAdmin: false,
      isSigned: false,
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findOne.mockResolvedValue(user);
    jest.spyOn<any, any>(service as any, 'verifyPassword').mockReturnValue(true);

    const result = await service.login({ email: 'login@example.com', password: '123456' });

    expect(user.isSigned).toBe(true);
    expect(user.save).toHaveBeenCalled();
    expect(result.accessToken).toBeDefined();
  });

  it('should logout and set isSigned false', async () => {
    const user = {
      email: 'logout@example.com',
      isSigned: true,
      save: jest.fn().mockResolvedValue(true),
    };

    userModel.findOne.mockResolvedValue(user);

    const result = await service.logout('logout@example.com');

    expect(result).toBe(true);
    expect(user.isSigned).toBe(false);
    expect(user.save).toHaveBeenCalled();
  });


});
