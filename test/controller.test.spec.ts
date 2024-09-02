import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from '../src/events/events.controller';
import { EventsService } from '../src/events/events.service';

const mockEventsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should create an event', async () => {
    const eventDto = { name: 'Concert' };
    const event = { id: 1, ...eventDto };
    mockEventsService.create.mockReturnValue(event);

    const result = await controller.create(eventDto as any);
    expect(result).toEqual(event);
    expect(mockEventsService.create).toHaveBeenCalledWith(eventDto);
  });

  it('should return a list of events', async () => {
    const events = [{ id: 1, name: 'Concert' }];
    mockEventsService.findAll.mockReturnValue(events);

    const result = await controller.findAll();
    expect(result).toEqual(events);
  });

  it('should return a single event by id', async () => {
    const event = { id: 1, name: 'Concert' };
    mockEventsService.findOne.mockReturnValue(event);

    const result = await controller.findOne(1);
    expect(result).toEqual(event);
    expect(mockEventsService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update an event', async () => {
    const event = { id: 1, name: 'Updated Concert' };
    mockEventsService.update.mockReturnValue(event);

    const result = await controller.update(1, event as any);
    expect(result).toEqual(event);
    expect(mockEventsService.update).toHaveBeenCalledWith(1, event);
  });

  it('should remove an event', async () => {
    mockEventsService.remove.mockReturnValue(null);

    await controller.remove(1);
    expect(mockEventsService.remove).toHaveBeenCalledWith(1);
  });
});
