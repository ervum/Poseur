import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from './authentication/authentication.module';

import { ServerConfiguration } from '@ervum/shared';
import { ServerConfigurationType } from '@ervum/types';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const Configuration: ServerConfigurationType = await ServerConfiguration;

        return {
          type: 'postgres',

          host: (Configuration.Database.Host),
          port: (Configuration.Database.Port),

          username: (Configuration.Database.User),
          password: (Configuration.Database.Password),

          database: (Configuration.Database.Name),

          autoLoadEntities: true,
          synchronize: true,
          dropSchema: false,
        };
      },
    }),

    UsersModule,
    AuthenticationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}