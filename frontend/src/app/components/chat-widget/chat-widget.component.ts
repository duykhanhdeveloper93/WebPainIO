import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatSocketService, ChatMsg } from '../../core/services/chat.service';
import { WebRtcService } from '../../core/services/webrtc.service';
import { CallModalComponent } from '../call-modal/call-modal.component';

export const EMOJI_LIST = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊',
  '😍','🥰','😘','😎','🤩','😏','😒','😔','😢','😭',
  '😡','🤬','😱','😨','😰','🤗','🤔','🤫','🤭','😶',
  '👍','👎','👏','🙌','🤝','🤜','✊','👋','🤚','🖐',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕',
  '🎉','🎊','🎁','🏆','⭐','🌟','💫','✨','🔥','💯',
  '🏠','🎨','🖌️','🪣','✅','❌','💬','📞','📧','🔔',
];

export const STICKERS = [
  { id:'wave', url:'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', label:'Chào!' },
  { id:'thumbsup', url:'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif', label:'Tuyệt!' },
  { id:'clap', url:'https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif', label:'Hay đó!' },
  { id:'happy', url:'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif', label:'Vui lắm!' },
  { id:'thanks', url:'https://media.giphy.com/media/l0MYxr0b87IwpBXra/giphy.gif', label:'Cảm ơn!' },
  { id:'think', url:'https://media.giphy.com/media/A5NKlVCEFVfKkC2W7v/giphy.gif', label:'Để xem...' },
  { id:'ok', url:'https://media.giphy.com/media/4JVTF9zR9BicshFAb7/giphy.gif', label:'OK!' },
  { id:'paint', url:'https://media.giphy.com/media/l0HlFZfztZedyNmKA/giphy.gif', label:'Sơn nhà!' },
  { id:'rainbow', url:'https://media.giphy.com/media/26tknCqiJrBQG6bxC/giphy.gif', label:'Màu sắc!' },
];

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, CallModalComponent],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('msgContainer') msgContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  isOpen      = signal(false);
  showForm    = signal(true);
  showEmoji   = signal(false);
  showSticker = signal(false);
  uploading   = signal(false);
  uploadPct   = signal(0);

  name = ''; email = ''; input = ''; sessionId = '';
  emojis = EMOJI_LIST;
  stickers = STICKERS;
  private shouldScroll = false;

  constructor(public chat: ChatSocketService, public rtc: WebRtcService) {}

  ngOnInit() {
    const saved = localStorage.getItem('paintco_chat_session');
    if (saved) {
      const p = JSON.parse(saved);
      this.sessionId = p.sessionId; this.name = p.name; this.email = p.email;
      this.showForm.set(false);
      this.chat.connectAsCustomer(this.sessionId, this.name, this.email);
      setTimeout(() => this.rtc.ensureEventsAttached(), 1000);
    }
  }

  ngAfterViewChecked() { if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; } }
  ngOnDestroy() { this.chat.disconnect(); }

  toggleChat() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) { this.showEmoji.set(false); this.showSticker.set(false); }
  }

  startChat() {
    if (!this.name.trim()) return;
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    localStorage.setItem('paintco_chat_session', JSON.stringify({ sessionId: this.sessionId, name: this.name, email: this.email }));
    this.showForm.set(false);
    this.chat.connectAsCustomer(this.sessionId, this.name, this.email);
    setTimeout(() => this.rtc.ensureEventsAttached(), 1000);
  }

  send() {
    const msg = this.input.trim();
    if (!msg || !this.sessionId) return;
    this.chat.sendMessage({ sessionId: this.sessionId, message: msg, senderType: 'customer', senderName: this.name, msgType: 'text' });
    this.input = ''; this.shouldScroll = true;
  }

  sendEmoji(emoji: string) {
    this.chat.sendMessage({ sessionId: this.sessionId, message: emoji, senderType: 'customer', senderName: this.name, msgType: 'emoji' });
    this.showEmoji.set(false); this.shouldScroll = true;
  }

  sendSticker(sticker: any) {
    this.chat.sendMessage({ sessionId: this.sessionId, message: sticker.label, senderType: 'customer', senderName: this.name, msgType: 'sticker', fileUrl: sticker.url });
    this.showSticker.set(false); this.shouldScroll = true;
  }

  triggerFileInput() { this.fileInput?.nativeElement?.click(); }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.uploadPct.set(0);
    this.chat.uploadFile(file).subscribe({
      next: (res) => {
        const isImage = file.type.startsWith('image/');
        this.chat.sendMessage({
          sessionId: this.sessionId, senderType: 'customer', senderName: this.name,
          msgType: isImage ? 'image' : 'file',
          message: file.name, fileUrl: res.fileUrl,
          fileName: res.fileName, fileSize: res.fileSize, mimeType: res.mimeType,
        });
        this.uploading.set(false); this.shouldScroll = true;
      },
      error: () => this.uploading.set(false),
    });
    (event.target as HTMLInputElement).value = '';
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); return; }
    this.chat.sendTyping(this.sessionId, 'customer');
  }

  closePanel(panel: 'emoji' | 'sticker') {
    if (panel === 'emoji')   { this.showEmoji.set(!this.showEmoji());   this.showSticker.set(false); }
    if (panel === 'sticker') { this.showSticker.set(!this.showSticker()); this.showEmoji.set(false); }
  }

  endChat() {
    localStorage.removeItem('paintco_chat_session');
    this.chat.disconnect(); this.showForm.set(true);
    this.name = ''; this.email = ''; this.input = '';
  }

  isMe(msg: ChatMsg) { return msg.senderType === 'customer'; }
  isImage(msg: ChatMsg) { return msg.msgType === 'image' || msg.mimeType?.startsWith('image/'); }
  formatSize(bytes?: number) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1024/1024).toFixed(1) + ' MB';
  }

  startVideoCall() { if (this.sessionId) this.rtc.startCall(this.sessionId, 'video', this.name); }
  startAudioCall() { if (this.sessionId) this.rtc.startCall(this.sessionId, 'audio', this.name); }

  startNewChat() {
    localStorage.removeItem('paintco_chat_session');
    this.chat.disconnect();
    this.chat.sessionClosed.set(false);
    this.showForm.set(true);
    this.name = ''; this.email = ''; this.input = '';
  }

  private scrollToBottom() {
    try { this.msgContainer?.nativeElement?.scrollTo({ top: 99999 }); } catch {}
  }
}
