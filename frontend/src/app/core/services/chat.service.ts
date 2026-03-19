import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ChatMsg {
  id?: number;
  sessionId: string;
  senderType: 'customer' | 'admin';
  senderName?: string;
  message?: string;
  msgType: 'text' | 'emoji' | 'sticker' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt?: Date | string;
  isRead?: boolean;
}

export interface ChatSession {
  id?: number;
  sessionId: string;
  customerName?: string;
  customerEmail?: string;
  status: string;
  unreadCount: number;
  lastMessage?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  socket: Socket | null = null;
  private wsUrl = environment.apiUrl.replace('/api/v1', '');

  messages    = signal<ChatMsg[]>([]);
  socketReady    = signal(0);
  sessionClosed  = signal(false);
  sessions    = signal<ChatSession[]>([]);
  isConnected = signal(false);
  isTyping    = signal(false);
  private typingTimeout: any;

  constructor(private http: HttpClient, private auth: AuthService) {}

  connectAsCustomer(sessionId: string, name?: string, email?: string) {
    if (this.socket?.connected) return;
    this.socket = io(`${this.wsUrl}/chat`, { transports: ['websocket', 'polling'] });
    this.socket.on('connect', () => {
      this.isConnected.set(true);
      this.socketReady.update(v => v + 1);
      this.sessionClosed.set(false);
      this.socket!.emit('join_session', { sessionId, name, email });
    });
    this.socket.on('session_joined', ({ history }: any) => this.messages.set(history));
    this.socket.on('new_message', (msg: ChatMsg) => this.messages.update(arr => [...arr, msg]));
    this.socket.on('typing', () => {
      this.isTyping.set(true);
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => this.isTyping.set(false), 2500);
    });
    this.socket.on('session_closed', () => { this.isConnected.set(false); this.sessionClosed.set(true); });
    this.socket.on('disconnect', () => this.isConnected.set(false));
  }

  connectAsAdmin() {
    if (this.socket?.connected) return;
    const token = this.auth.getToken();
    this.socket = io(`${this.wsUrl}/chat`, {
      transports: ['websocket', 'polling'],
      query: { role: 'admin', token },
    });
    this.socket.on('connect', () => { this.isConnected.set(true); this.socketReady.update(v => v + 1); this.socket!.emit('get_sessions'); });
    this.socket.on('sessions_list', (s: ChatSession[]) => this.sessions.set(s));
    this.socket.on('session_update', (s: ChatSession) => {
      this.sessions.update(arr => {
        const i = arr.findIndex(x => x.sessionId === s.sessionId);
        if (i >= 0) { const c = [...arr]; c[i] = s; return c; }
        return [s, ...arr];
      });
    });
    this.socket.on('new_message', (msg: ChatMsg) => this.messages.update(arr => [...arr, msg]));
    this.socket.on('typing', () => {
      this.isTyping.set(true);
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => this.isTyping.set(false), 2500);
    });
    this.socket.on('disconnect', () => this.isConnected.set(false));
  }

  adminJoinSession(sessionId: string) {
    this.messages.set([]);
    this.socket?.emit('admin_join_session', { sessionId });
    this.socket?.once('session_history', (h: ChatMsg[]) => this.messages.set(h));
  }

  sendMessage(data: Partial<ChatMsg>) {
    this.socket?.emit('send_message', data);
  }

  sendTyping(sessionId: string, senderType: string) {
    this.socket?.emit('typing', { sessionId, senderType });
  }

  closeSession(sessionId: string) { this.socket?.emit('close_session', { sessionId }); }

  disconnect() {
    this.socket?.disconnect(); this.socket = null;
    this.isConnected.set(false); this.messages.set([]);
  }

  totalUnread(): number { return this.sessions().reduce((s, x) => s + (x.unreadCount || 0), 0); }

  uploadFile(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<any>(`${environment.apiUrl}/chat/upload`, fd);
  }
}
