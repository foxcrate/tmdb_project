import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signup(@Body() authCredentialsDto: AuthCredentialsDto) {
      return this.authService.signup(authCredentialsDto.email, authCredentialsDto.password);
    }
  
    @Post('signin')
    async signin(@Body() authCredentialsDto: AuthCredentialsDto) {
      return this.authService.signin(authCredentialsDto.email, authCredentialsDto.password);
    }
}
