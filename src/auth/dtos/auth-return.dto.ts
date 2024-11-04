import { ApiProperty } from '@nestjs/swagger';

class UserResponseDto {
  @ApiProperty({ example: '12345', description: 'The ID of the user' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  email: string;
}

export class AuthReturnDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'your_jwt_token', description: 'Authentication token for the user' })
  token: string;
}
