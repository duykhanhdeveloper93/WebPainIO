import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatSocketService, ChatSession, ChatMsg } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { WebRtcService } from '../../../core/services/webrtc.service';
import { CallModalComponent } from '../../../components/call-modal/call-modal.component';
import { EMOJI_LIST, STICKERS } from '../../../components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, CallModalComponent],
  templateUrl: './admin-chat.component.html',
  styleUrls: ['./admin-chat.component.scss']
})
export class AdminChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('msgContainer') msgContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  activeSession = signal<ChatSession | null>(null);
  showEmoji     = signal(false);
  showSticker   = signal(false);
  uploading     = signal(false);
  input = '';
  emojis    = EMOJI_LIST;
  stickers  = STICKERS;
  private shouldScroll = false;

  constructor(
    public chat: ChatSocketService,
    public auth: AuthService,
    public rtc: WebRtcService,
  ) {}

  ngOnInit()    { this.chat.connectAsAdmin(); setTimeout(() => this.rtc.ensureEventsAttached(), 1000); }
  ngOnDestroy() { this.chat.disconnect(); }
  ngAfterViewChecked() {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  adminName(): string { return this.auth.currentUser()?.name || 'Admin'; }

  selectSession(s: ChatSession) {
    this.activeSession.set(s);
    this.chat.adminJoinSession(s.sessionId);
    this.showEmoji.set(false); this.showSticker.set(false);
    this.shouldScroll = true;
  }

  startVideoCall() {
    const s = this.activeSession(); if (!s) return;
    this.rtc.startCall(s.sessionId, 'video', this.adminName());
  }

  startAudioCall() {
    const s = this.activeSession(); if (!s) return;
    this.rtc.startCall(s.sessionId, 'audio', this.adminName());
  }

  send() {
    const msg = this.input.trim(); const s = this.activeSession();
    if (!msg || !s) return;
    this.chat.sendMessage({ sessionId: s.sessionId, message: msg, senderType: 'admin', senderName: this.adminName(), msgType: 'text' });
    this.input = ''; this.shouldScroll = true;
  }

  sendEmoji(e: string) {
    const s = this.activeSession(); if (!s) return;
    this.chat.sendMessage({ sessionId: s.sessionId, message: e, senderType: 'admin', senderName: this.adminName(), msgType: 'emoji' });
    this.showEmoji.set(false); this.shouldScroll = true;
  }

  sendSticker(sticker: any) {
    const s = this.activeSession(); if (!s) return;
    this.chat.sendMessage({ sessionId: s.sessionId, message: sticker.label, senderType: 'admin', senderName: this.adminName(), msgType: 'sticker', fileUrl: sticker.url });
    this.showSticker.set(false); this.shouldScroll = true;
  }

  triggerFile() { this.fileInput?.nativeElement?.click(); }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    const s = this.activeSession();
    if (!file || !s) return;
    this.uploading.set(true);
    this.chat.uploadFile(file).subscribe({
      next: res => {
        const isImage = file.type.startsWith('image/');
        this.chat.sendMessage({ sessionId: s.sessionId, senderType: 'admin', senderName: this.adminName(), msgType: isImage ? 'image' : 'file', message: file.name, fileUrl: res.fileUrl, fileName: res.fileName, fileSize: res.fileSize, mimeType: res.mimeType });
        this.uploading.set(false); this.shouldScroll = true;
      },
      error: () => this.uploading.set(false),
    });
    (event.target as HTMLInputElement).value = '';
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); return; }
    this.chat.sendTyping(this.activeSession()?.sessionId || '', 'admin');
  }

  togglePanel(p: 'emoji' | 'sticker') {
    if (p === 'emoji')   { this.showEmoji.update(v => !v);   this.showSticker.set(false); }
    else                 { this.showSticker.update(v => !v); this.showEmoji.set(false);   }
  }

  closeSession(s: ChatSession) {
    if (confirm('Đóng phiên chat này?')) { this.chat.closeSession(s.sessionId); this.activeSession.set(null); }
  }

  isMe(msg: ChatMsg)     { return msg.senderType === 'admin'; }
  getInitial(n?: string) { return (n || '?')[0].toUpperCase(); }
  formatSize(bytes?: number) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1024/1024).toFixed(1) + ' MB';
  }

  private scrollToBottom() {
    try { this.msgContainer?.nativeElement?.scrollTo({ top: 99999 }); } catch {}
  }
}
