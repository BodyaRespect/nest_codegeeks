import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../src/events/events.service';
import { getModelToken } from '@nestjs/sequelize';
import { Event } from '../src/events/event.model';
import { NotFoundException } from '@nestjs/common';

const mockEventModel = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
};

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should create an event', async () => {
    const eventDto = {
      name: 'Concert',
      date: '2024-09-10',
      location: 'Lviv',
      category: 'Music',
      price: 50,
    };
    mockEventModel.create.mockReturnValue(eventDto);

    const result = await service.create(eventDto as any);
    expect(result).toEqual(eventDto);
    expect(mockEventModel.create).toHaveBeenCalledWith({
      ...eventDto,
      date: new Date(eventDto.date),
    });
  });

  it('should return a list of events with filters', async () => {
    const events = [{ id: 1, name: 'Concert' }];
    mockEventModel.findAll.mockReturnValue(events);

    const result = await service.findAll({
      category: 'Music',
      limit: 10,
      offset: 0,
    });
    expect(result).toEqual(events);
    expect(mockEventModel.findAll).toHaveBeenCalled();
  });

  it('should throw an error if event not found', async () => {
    mockEventModel.findByPk.mockReturnValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update an event', async () => {
    const event = { id: 1, name: 'Concert', update: jest.fn() };
    mockEventModel.findByPk.mockReturnValue(event);

    const updatedDto = { name: 'Updated Concert' };
    await service.update(1, updatedDto as any);

    expect(event.update).toHaveBeenCalledWith(updatedDto);
  });

  it('should remove an event', async () => {
    const event = { id: 1, destroy: jest.fn() };
    mockEventModel.findByPk.mockReturnValue(event);

    await service.remove(1);

    expect(event.destroy).toHaveBeenCalled();
  });
});
