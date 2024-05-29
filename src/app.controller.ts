import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Inject,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { randomUUID } from 'crypto'
import { Response } from 'express'
import * as qrcode from 'qrcode'
import { AppService } from './app.service'
import { LoginGuard } from './login.guard'
import { User } from './user/entities/user.entity'
import { UserService, md5 } from './user/user.service'

const map = new Map<string, QrCodeInfo>()

interface QrCodeInfo {
  status:
    | 'noscan'
    | 'scan-wait-confirm'
    | 'scan-confirm'
    | 'scan-cancel'
    | 'expired'
  userInfo?: {
    id: number
    username: string
  }
}
interface Info {
  userId: number
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(JwtService)
  private jwtService: JwtService

  @Inject(UserService)
  private userService: UserService

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('qrcode/generate')
  async generate() {
    const uuid = randomUUID()
    const dataUrl = await qrcode.toDataURL(
      `http://192.168.1.45:3000/pages/confirm.html?id=${uuid}`,
    )

    map.set(`qrcode_${uuid}`, {
      status: 'noscan',
    })

    return {
      qrcode_id: uuid,
      img: dataUrl,
    }
  }

  @Get('qrcode/check')
  async check(
    @Query('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const qrCodeInfo = map.get(`qrcode_${id}`)
    if (qrCodeInfo.status === 'scan-confirm') {
      const user = qrCodeInfo.userInfo
      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
        },
        {
          expiresIn: '30m',
        },
      )

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn: '7d',
        },
      )

      return {
        access_token,
        refresh_token,
        ...qrCodeInfo,
      }
    }
    return qrCodeInfo
  }

  @Get('qrcode/scan')
  async scan(@Query('id') id: string) {
    const qrCodeInfo = map.get(`qrcode_${id}`)
    if (!qrCodeInfo) {
      throw new BadRequestException('二维码已过期')
    }
    qrCodeInfo.status = 'scan-wait-confirm'
    return 'success'
  }

  @Get('qrcode/confirm')
  async confirm(
    @Query('id') id: string,
    @Headers('Authorization') auth: string,
  ) {
    let user: User
    try {
      const [, token] = auth.split(' ')
      const info: Info = await this.jwtService.verify(token)

      user = await this.userService.findById(info.userId)
    } catch (e) {
      throw new UnauthorizedException('token 过期，请重新登录')
    }

    const qrCodeInfo = map.get(`qrcode_${id}`)
    if (!qrCodeInfo) {
      throw new BadRequestException('二维码已过期')
    }
    qrCodeInfo.status = 'scan-confirm'
    qrCodeInfo.userInfo = user
    return 'success'
  }

  @Get('qrcode/cancel')
  async cancel(@Query('id') id: string) {
    const qrCodeInfo = map.get(`qrcode_${id}`)
    if (!qrCodeInfo) {
      throw new BadRequestException('二维码已过期')
    }
    qrCodeInfo.status = 'scan-cancel'
    return 'success'
  }

  @Get('login')
  async login(
    @Query('username') username: string,
    @Query('password') password: string,
  ) {
    const user = await this.userService.findByName(username)

    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }
    if (user.password !== md5(password)) {
      throw new UnauthorizedException('密码错误')
    }

    const token = await this.jwtService.sign({
      userId: user.id,
    })
    return {
      token,
    }
  }

  @Get('userInfo')
  async userInfo(@Headers('Authorization') auth: string) {
    try {
      const [, token] = auth.split(' ')
      const info: Info = await this.jwtService.verify(token)

      const user = this.userService.findById(info.userId)
      return user
    } catch (e) {
      throw new UnauthorizedException('token 过期，请重新登录')
    }
  }

  @Get('aaa')
  @UseGuards()
  aaa() {
    return 'aaa'
  }

  @Get('bbb')
  @UseGuards(LoginGuard)
  bbb() {
    return 'bbb'
  }
}
