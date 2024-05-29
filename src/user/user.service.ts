import { HttpException, Injectable, Logger } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import * as crypto from 'crypto'
import { EntityManager, Repository } from 'typeorm'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { User } from './entities/user.entity'

export function md5(str) {
  const hash = crypto.createHash('md5')
  hash.update(str)
  return hash.digest('hex')
}

@Injectable()
export class UserService {
  private logger = new Logger()

  @InjectRepository(User)
  private userRepository: Repository<User>

  @InjectEntityManager()
  private entityManager: EntityManager

  async findByName(username: string) {
    const foundUser = await this.userRepository.findOneBy({
      username,
    })

    if (!foundUser) {
      throw new HttpException('用户不存在', 200)
    }
    return foundUser
  }

  async findUserById(userId: number) {
    return await this.entityManager.findOne(User, {
      where: {
        id: userId,
      },
    })
  }

  async findById(id: number) {
    const foundUser = await this.userRepository.findOneBy({
      id,
    })

    if (!foundUser) {
      throw new HttpException('用户不存在', 200)
    }
    return foundUser
  }

  async login(user: LoginDto) {
    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    })

    if (!foundUser) {
      throw new HttpException('用户名不存在', 200)
    }
    if (foundUser.password !== md5(user.password)) {
      throw new HttpException('密码错误', 200)
    }
    return foundUser
  }

  async register(user: RegisterDto) {
    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    })

    if (foundUser) {
      throw new HttpException('用户已存在', 200)
    }

    const newUser = new User()
    newUser.username = user.username
    newUser.password = md5(user.password)

    try {
      await this.userRepository.save(newUser)
      return '注册成功'
    } catch (e) {
      this.logger.error(e, UserService)
      return '注册失败'
    }
  }
}
