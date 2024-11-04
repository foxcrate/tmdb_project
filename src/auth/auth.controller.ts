import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthReturnDto } from './dtos/auth-return.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiBody({
      type: AuthCredentialsDto,
    })
    @ApiCreatedResponse({
      type: AuthReturnDto,
    })
    @Post('signup')
    async signup(@Body() authCredentialsDto: AuthCredentialsDto) {
      return this.authService.signup(authCredentialsDto.email, authCredentialsDto.password);
    }
  
    @ApiBody({
      type: AuthCredentialsDto,
    })
    @ApiCreatedResponse({
      type: AuthReturnDto,
    })
    @Post('signin')
    async signin(@Body() authCredentialsDto: AuthCredentialsDto) {
      return this.authService.signin(authCredentialsDto.email, authCredentialsDto.password);
    }
}
