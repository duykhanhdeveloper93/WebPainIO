import { Controller, Get, Post, Param, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const chatStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'chat'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getSessions() { return this.chatService.getAllSessions(); }

  @Get('sessions/:sessionId/messages')
  getMessages(@Param('sessionId') sessionId: string) {
    return this.chatService.getMessages(sessionId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getStats() { return this.chatService.getStats(); }

  // File upload endpoint — public (customer doesn't need token)
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: chatStorage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (_req, file, cb) => {
      // Allow images, pdf, office docs, common files
      const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|mp4|mp3/;
      const ok = allowed.test(extname(file.originalname).toLowerCase()) || allowed.test(file.mimetype);
      cb(ok ? null : new Error('File type not allowed'), ok);
    },
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) return { error: 'No file uploaded' };
    const host = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${host}/uploads/chat/${file.filename}`;
    return {
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }
}
