import { Controller, Post, Param, Body } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('analyze/:documentId')
  async analyze(@Param('documentId') documentId: string) {
    const result = await this.agentsService.analyzeDocument(documentId);
    return { success: true, result };
  }

  @Post('chat/:documentId')
  async chat(
    @Param('documentId') documentId: string,
    @Body() body: { query: string },
  ) {
    const result = await this.agentsService.chat(documentId, body.query);
    return { success: true, result };
  }
}
