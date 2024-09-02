import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './event.model';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [SequelizeModule.forFeature([Event])],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
