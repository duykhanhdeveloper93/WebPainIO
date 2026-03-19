import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface SdpData { sessionId: string; sdp: any; }
interface IceData  { sessionId: string; candidate: any; }
interface CallData { sessionId: string; callType: string; callerName: string; }
interface SessionData { sessionId: string; }
interface ActiveCall  { callerId: string; type: string; }

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private adminSockets = new Set<string>();
  private activeCalls  = new Map<string, ActiveCall>();

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    if (client.handshake.query['role'] === 'admin') {
      this.adminSockets.add(client.id);
      client.join('admins');
    }
  }
  handleDisconnect(client: Socket) { this.adminSockets.delete(client.id); }

  // ── Chat ─────────────────────────────────────────────────────────

  @SubscribeMessage('join_session')
  async handleJoinSession(
    @MessageBody() data: { sessionId: string; name?: string; email?: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`session_${data.sessionId}`);
    const session = await this.chatService.getOrCreateSession(data.sessionId, data.name, data.email);
    const history = await this.chatService.getMessages(data.sessionId);
    client.emit('session_joined', { session, history });
    this.server.to('admins').emit('session_update', session);
  }

  @SubscribeMessage('admin_join_session')
  async handleAdminJoin(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`session_${data.sessionId}`);
    const history = await this.chatService.getMessages(data.sessionId);
    await this.chatService.markAllRead(data.sessionId);
    client.emit('session_history', history);
    this.server.to('admins').emit('sessions_list', await this.chatService.getAllSessions());
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: {
      sessionId: string; message?: string; senderType: string;
      senderName?: string; msgType?: string; fileUrl?: string;
      fileName?: string; fileSize?: number; mimeType?: string;
    },
    @ConnectedSocket() _client: Socket,
  ) {
    const saved = await this.chatService.saveMessage(data);
    this.server.to(`session_${data.sessionId}`).emit('new_message', saved);
    if (data.senderType === 'customer') {
      const preview = data.msgType === 'text' ? data.message : `[${data.msgType}]`;
      const session = await this.chatService.updateLastMessage(data.sessionId, preview);
      this.server.to('admins').emit('session_update', session);
    }
    return saved;
  }

  @SubscribeMessage('get_sessions')
  async handleGetSessions(@ConnectedSocket() client: Socket) {
    client.emit('sessions_list', await this.chatService.getAllSessions());
  }

  @SubscribeMessage('close_session')
  async handleCloseSession(@MessageBody() data: SessionData) {
    await this.chatService.closeSession(data.sessionId);
    this.server.to(`session_${data.sessionId}`).emit('session_closed');
    this.server.to('admins').emit('sessions_list', await this.chatService.getAllSessions());
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { sessionId: string; senderType: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`session_${data.sessionId}`).emit('typing', { senderType: data.senderType });
  }

  // ── WebRTC Signaling ─────────────────────────────────────────────

  @SubscribeMessage('rtc:call_request')
  handleCallRequest(
    @MessageBody() data: CallData,
    @ConnectedSocket() caller: Socket,
  ) {
    this.activeCalls.set(data.sessionId, { callerId: caller.id, type: data.callType });
    caller.to(`session_${data.sessionId}`).emit('rtc:incoming_call', {
      sessionId:  data.sessionId,
      callType:   data.callType,
      callerName: data.callerName,
      callerId:   caller.id,
    });
  }

  @SubscribeMessage('rtc:call_accepted')
  handleCallAccepted(
    @MessageBody() data: SessionData,
    @ConnectedSocket() callee: Socket,
  ) {
    const call = this.activeCalls.get(data.sessionId);
    if (!call) return;
    this.server.to(call.callerId).emit('rtc:call_accepted', { calleeId: callee.id });
  }

  @SubscribeMessage('rtc:offer')
  handleOffer(
    @MessageBody() data: SdpData,
    @ConnectedSocket() sender: Socket,
  ) {
    sender.to(`session_${data.sessionId}`).emit('rtc:offer', { sdp: data.sdp, senderId: sender.id });
  }

  @SubscribeMessage('rtc:answer')
  handleAnswer(
    @MessageBody() data: SdpData,
    @ConnectedSocket() sender: Socket,
  ) {
    sender.to(`session_${data.sessionId}`).emit('rtc:answer', { sdp: data.sdp, senderId: sender.id });
  }

  @SubscribeMessage('rtc:ice_candidate')
  handleIceCandidate(
    @MessageBody() data: IceData,
    @ConnectedSocket() sender: Socket,
  ) {
    sender.to(`session_${data.sessionId}`).emit('rtc:ice_candidate', {
      candidate: data.candidate,
      senderId:  sender.id,
    });
  }

  @SubscribeMessage('rtc:hangup')
  async handleHangup(
    @MessageBody() data: SessionData,
    @ConnectedSocket() sender: Socket,
  ) {
    this.activeCalls.delete(data.sessionId);
    sender.to(`session_${data.sessionId}`).emit('rtc:hangup');
    await this.chatService.saveMessage({
      sessionId:  data.sessionId,
      senderType: 'admin',
      message:    'Cuoc goi da ket thuc',
      msgType:    'text',
    });
  }

  @SubscribeMessage('rtc:call_cancelled')
  handleCallCancelled(
    @MessageBody() data: SessionData,
    @ConnectedSocket() sender: Socket,
  ) {
    this.activeCalls.delete(data.sessionId);
    sender.to(`session_${data.sessionId}`).emit('rtc:call_cancelled');
  }

  @SubscribeMessage('rtc:call_rejected')
  handleCallRejected(
    @MessageBody() data: SessionData,
    @ConnectedSocket() sender: Socket,
  ) {
    const call = this.activeCalls.get(data.sessionId);
    if (call) {
      this.server.to(call.callerId).emit('rtc:call_rejected');
      this.activeCalls.delete(data.sessionId);
    }
    sender.to(`session_${data.sessionId}`).emit('rtc:call_rejected');
  }
}
