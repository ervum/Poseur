import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, ValidationPipe, BadRequestException } from '@nestjs/common';

import { AppModule } from './app.module';
import { ValidationError } from 'class-validator';

import { ServerConfiguration } from '@ervum/shared';
import { ServerConfigurationType, Undefinable } from '@ervum/types';



/**
 * Initializes and starts the NestJS server application, applying global configuration such as port and proxy prefixes.
 */
async function bootstrap(): Promise<void> {
  const Application: INestApplication = await NestFactory.create(AppModule);
  
  const Configuration: ServerConfigurationType = await ServerConfiguration;
  const Port: number = (Configuration.Port);

  Application.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (Errors: ValidationError[]): BadRequestException => {
      const Messages: string[] = Errors.flatMap((ErrorItem: ValidationError): string[] => {
        const Constraints: Undefinable<Record<string, string>> = ErrorItem.constraints;

        if (Constraints && (Object.values(Constraints).length > 0)) {
          return Object.values(Constraints).map((ConstraintMessage: string): string => {
            if (ConstraintMessage.includes(':')) {
              return ConstraintMessage;
            }
            
            return `${ErrorItem.property}:${ConstraintMessage}`;
          });
        }

        return [`${ErrorItem.property}:00_000`];
      });

      return new BadRequestException(Messages);
    }
  }));

  Application.setGlobalPrefix(Configuration.ProxyURL);
  /* Application.enableCors({
    origin: (Configuration.ClientURL),
    credentials: true,
  }); */

  await Application.listen(Port, '0.0.0.0');

  Logger.log(`🚀 Application is running on: ${await Application.getUrl()}`);
}

bootstrap();
