import { Test } from '@nestjs/testing';
import { APIPromise } from 'openai/core';
import { Message, Run } from 'openai/resources/beta/threads';
import { AiModule } from './../ai/ai.module';
import { ChatModule } from './chat.module';
import { ChatService } from './chat.service';
import { ChatHelpers } from './chat.helpers';
import { ChatCallDto } from './chat.model';
import { AssistantStream } from 'openai/lib/AssistantStream';

describe('ChatService', () => {
  let chatService: ChatService;
  let chatbotHelpers: ChatHelpers;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AiModule, ChatModule],
    }).compile();

    chatService = moduleRef.get<ChatService>(ChatService);
    chatbotHelpers = moduleRef.get<ChatHelpers>(ChatHelpers);

    jest
      .spyOn(chatbotHelpers, 'getAnswer')
      .mockReturnValue(Promise.resolve('Hello response') as Promise<string>);


    jest
      .spyOn(chatService.threads.messages, 'create')
      .mockReturnValue({} as APIPromise<Message>);

    jest.spyOn(chatService, 'assistantStream').mockReturnValue({
      finalRun: jest.fn(),
    } as unknown as Promise<AssistantStream>);
  });

  it('should be defined', () => {
    expect(chatService).toBeDefined();
  });

  describe('call', () => {
    it('should create "thread run"', async () => {
      const payload = { content: 'Hello', threadId: '1' } as ChatCallDto;
      const spyOnThreadRunsCreate = jest
        .spyOn(chatService.threads.messages, 'create')
        .mockResolvedValue({} as Message);

      await chatService.call(payload);

      expect(spyOnThreadRunsCreate).toHaveBeenCalled();
    });

    it('should return ChatCallResponse', async () => {
      const payload = { content: 'Hello', threadId: '1' } as ChatCallDto;
      jest
        .spyOn(chatService.threads.runs, 'create')
        .mockResolvedValue({} as Run);

      const result = await chatService.call(payload);

      expect(result).toEqual({ content: 'Hello response', threadId: '1' });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
