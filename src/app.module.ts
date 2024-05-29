import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { User } from './user/entities/user.entity'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'guang',
      database: 'login_test',
      synchronize: true,
      entities: [User],
      poolSize: 10,
      connectorPackage: 'mysql2',
    }),

    JwtModule.register({
      global: true,
      secret: 'guang',
      signOptions: {
        // expiresIn: '7d',
        expiresIn: '30m',
      },
    }),

    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
