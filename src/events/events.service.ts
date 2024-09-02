import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from './event.model';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Op } from 'sequelize';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const eventDto = {
      ...createEventDto,
      date: new Date(createEventDto.date),
    };

    return this.eventModel.create(eventDto);
  }

  async findAll(filters: {
    category?: string;
    location?: string;
    date?: string;
    price?: number;
    limit: number;
    offset: number;
  }): Promise<Event[]> {
    const { category, location, date, price, limit, offset } = filters;

    const whereConditions = {
      ...(category && { category: { [Op.iLike]: `%${category}%` } }),
      ...(location && { location: { [Op.iLike]: `%${location}%` } }),
      ...(date && { date: { [Op.eq]: new Date(date) } }),
      ...(price && { price: { [Op.eq]: price } }),
    };

    return this.eventModel.findAll({
      where: whereConditions,
      limit,
      offset,
      order: [['date', 'ASC']],
    });
  }

  async findOne(id: number): Promise<any> {
    const event = await this.eventModel.findByPk(id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const similarEvents = await this.findSimilarEvents(event);

    return {
      ...event.toJSON(),
      similar: similarEvents,
    };
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventModel.findByPk(id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updatedData = {
      ...updateEventDto,
      ...(updateEventDto.date && { date: new Date(updateEventDto.date) }),
    };

    await event.update(updatedData);
    return event;
  }

  async remove(id: number): Promise<void> {
    const event = await this.eventModel.findByPk(id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    await event.destroy();
  }

  private async findSimilarEvents(event: Event): Promise<Event[]> {
    const { category, date, location } = event;

    return this.eventModel.findAll({
      where: {
        id: {
          [Op.ne]: event.id,
        },
        category,
        location,
        date: {
          [Op.between]: [
            new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
            new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000),
          ],
        },
      },
    });
  }
}
