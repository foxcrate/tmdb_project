// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'), // Optional: keep other jwt functions if needed
  verify: jest.fn(), // Mock the verify function
}));

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'), // Optionally keep other bcrypt functions if needed
  compare: jest.fn(), // Mock the compare function
}));


describe('AuthService', () => {
  let authService: AuthService;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  let configService: Partial<Record<keyof ConfigService, jest.Mock>>;
  const jwtSecret = 'test_jwt_secret';

  beforeEach(async () => {
    userService = {
      createUser: jest.fn(),
      findByEmail: jest.fn(),
    };
    configService = {
      get: jest.fn().mockReturnValue(jwtSecret),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a new user and return user data with token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const user = { id: 1, email: email, password: hashedPassword };

      // Directly set the mock implementation for bcrypt.hash
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedPassword); // mock bcrypt.hash as a promise

      userService.createUser.mockResolvedValueOnce(user);
      jest.spyOn(jwt, 'sign').mockReturnValueOnce('mocked_token');

      const result = await authService.signup(email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(userService.createUser).toHaveBeenCalledWith({ email, password: hashedPassword });
      expect(jwt.sign).toHaveBeenCalledWith({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
      expect(result).toEqual({
        user: { id: user.id, email: user.email },
        token: 'mocked_token',
      });
    });
  });

  describe('signin', () => {
    it('should return user data with token if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const user = { id: 1, email: email, password: hashedPassword };
  
      userService.findByEmail.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true); // Set mock response for compare
      jest.spyOn(jwt, 'sign').mockReturnValueOnce('mocked_token');
  
      const result = await authService.signin(email, password);
  
      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwt.sign).toHaveBeenCalledWith({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
      expect(result).toEqual({
        user: { id: user.id, email: user.email },
        token: 'mocked_token',
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      userService.findByEmail.mockResolvedValueOnce(null);

      await expect(authService.signin('test@example.com', 'wrong_password'))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('verifyToken', () => {
    it('should return the payload if token is valid', () => {
      const token = 'valid_token';
      const payload = { userId: 1 };

      jest.spyOn(jwt, 'verify').mockReturnValueOnce(payload);

      const result = authService.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, jwtSecret);
      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException if token is invalid', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
  
      expect(() => authService.verifyToken('invalid_token')).toThrow(UnauthorizedException);
    });
  });
});
