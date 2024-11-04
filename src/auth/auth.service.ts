import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');
  }

  async signup(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.createUser({ email: email, password: hashedPassword });
    const token = this.generateToken(user.id);
    return {
      user: {
        id: user.id,
        email: user.email
    },
      token: token
    };
  }

  async signin(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    // console.log(user);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.generateToken(user.id);
    return {
        user:{
            id: user.id,
            email: user.email
        },
        token: token
    };
  }

  private generateToken(userId: number) {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: '1h' });
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
