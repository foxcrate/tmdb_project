import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
  ) {}

  async createUser(userData: Partial<UserEntity>) {
    // console.log(userData);
    
    let sameEmail = await this.findByEmail(userData.email);
    if (sameEmail) {
        // throw exception
        throw new BadRequestException('email already exists');
    }
    let newUser = await this.userRepository.save(userData);
    // console.log(newUser);
    return newUser;
    
  }

  async save(userData: Partial<UserEntity>):Promise<void> {
    await this.userRepository.save(userData);
  }
  
  async update(userId: number,userData: Partial<UserEntity>):Promise<void> {
    let theUser = await this.findByid(userId);

    let sameEmail = await this.findByEmail(userData.email);
    if (sameEmail) {
        if (sameEmail.id != theUser.id){
            throw new BadRequestException('email already exists');
        }
    }
    await this.userRepository.update(userId,userData);
  }

  async findByEmail(email: string) {
    // console.log(email);
    
    return this.userRepository.findOneBy({ email: email });
  }

  async findByid(id: number) {
    return this.userRepository.findOneBy({ id:id });
  }

  async findWithMovies(id: number) {
    return await this.userRepository.findOne({ where:{ id:id },select:["id","email"],relations: ['movies'] });
  }
}
