import { Injectable, signal } from '@angular/core';
import { ChatSocketService } from './chat.service';

export type CallState = 'idle' | 'calling' | 'incoming' | 'connecting' | 'connected' | 'ended';

export interface IncomingCall {
  sessionId: string;
  callType: 'video' | 'audio';
  callerName: string;
  callerId: string;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

@Injectable({ providedIn: 'root' })
export class WebRtcService {
  callState       = signal<CallState>('idle');
  callType        = signal<'video' | 'audio'>('video');
  callDuration    = signal(0);
  incomingCall    = signal<IncomingCall | null>(null);
  isMuted         = signal(false);
  isCamOff        = signal(false);
  isScreenSharing = signal(false);
  networkQuality  = signal<'good' | 'medium' | 'poor'>('good');

  localStream:  MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  screenStream: MediaStream | null = null;

  private pc:             RTCPeerConnection | null = null;
  private currentSession = '';
  private durationTimer: any;
  private statsTimer: any;
  private eventsAttached = false;

  constructor(private socket: ChatSocketService) {
    // Attach on first load
    this.waitAndAttach();
  }

  /** Call this from component after socket is known to be ready */
  ensureEventsAttached() {
    const s = this.getSocket();
    if (s) {
      this.attachSignalingEvents(s);
      this.eventsAttached = true;
    }
  }

  // ── Wait for socket then attach events ──────────────────────────
  private waitAndAttach() {
    const check = () => {
      const s = this.getSocket();
      if (s && !this.eventsAttached) {
        this.attachSignalingEvents(s);
        this.eventsAttached = true;
      } else if (!s) {
        setTimeout(check, 500);
      }
    };
    setTimeout(check, 800);
  }

  private getSocket(): import('socket.io-client').Socket | null {
    return (this.socket as any).socket || null;
  }

  private emitToSocket(event: string, data: any) {
    const s = this.getSocket();
    if (s) {
      s.emit(event, data);
    } else {
      console.warn('[WebRTC] Socket not ready for emit:', event);
    }
  }

  private attachSignalingEvents(s: import('socket.io-client').Socket) {
    // Remove old listeners first to prevent duplicates
    s.off('rtc:incoming_call');
    s.off('rtc:call_accepted');
    s.off('rtc:offer');
    s.off('rtc:answer');
    s.off('rtc:ice_candidate');
    s.off('rtc:hangup');
    s.off('rtc:call_cancelled');
    s.off('rtc:call_rejected');

    s.on('rtc:incoming_call', (data: IncomingCall) => {
      console.log('[WebRTC] Incoming call from', data.callerName);
      this.incomingCall.set(data);
      this.callType.set(data.callType as any);
      this.currentSession = data.sessionId;
      this.callState.set('incoming');
      this.playRingtone(true);
    });

    s.on('rtc:call_accepted', async () => {
      console.log('[WebRTC] Call accepted, creating offer...');
      this.callState.set('connecting');
      this.playRingtone(false);
      await this.createAndSendOffer();
    });

    s.on('rtc:offer', async (data: { sdp: any }) => {
      console.log('[WebRTC] Received offer');
      await this.handleRemoteOffer(data.sdp);
    });

    s.on('rtc:answer', async (data: { sdp: any }) => {
      console.log('[WebRTC] Received answer');
      if (this.pc && this.pc.signalingState !== 'closed') {
        await this.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        this.callState.set('connected');
        this.startTimer();
      }
    });

    s.on('rtc:ice_candidate', async (data: { candidate: any }) => {
      if (this.pc && data.candidate) {
        try { await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch {}
      }
    });

    // ── Hangup — BOTH sides must handle this ──
    s.on('rtc:hangup', () => {
      console.log('[WebRTC] Remote hangup received');
      this.forceCleanup();
    });

    s.on('rtc:call_cancelled', () => {
      console.log('[WebRTC] Call cancelled');
      this.playRingtone(false);
      this.incomingCall.set(null);
      this.callState.set('idle');
    });

    s.on('rtc:call_rejected', () => {
      console.log('[WebRTC] Call rejected');
      this.playRingtone(false);
      this.forceCleanup();
      // Show brief "ended" state then idle
      this.callState.set('ended');
      setTimeout(() => this.callState.set('idle'), 2500);
    });

    console.log('[WebRTC] Signaling events attached');
  }

  // Re-attach when socket reconnects (important!)
  reattachEvents() {
    this.eventsAttached = false;
    this.waitAndAttach();
  }

  // ── Public API ──────────────────────────────────────────────────

  async startCall(sessionId: string, callType: 'video' | 'audio', myName: string) {
    this.currentSession = sessionId;
    this.callType.set(callType);
    this.callState.set('calling');

    await this.getLocalMedia(callType);
    this.initPeerConnection();

    this.emitToSocket('rtc:call_request', { sessionId, callType, callerName: myName });
    this.playRingtone(true);
  }

  async acceptCall() {
    const call = this.incomingCall();
    if (!call) return;

    this.playRingtone(false);
    this.callState.set('connecting');
    this.currentSession = call.sessionId;

    await this.getLocalMedia(call.callType as any);
    this.initPeerConnection();

    this.emitToSocket('rtc:call_accepted', { sessionId: call.sessionId });
    this.incomingCall.set(null);
  }

  rejectCall() {
    const call = this.incomingCall();
    if (!call) return;
    this.playRingtone(false);
    this.emitToSocket('rtc:call_rejected', { sessionId: call.sessionId });
    this.incomingCall.set(null);
    this.callState.set('idle');
  }

  hangup() {
    console.log('[WebRTC] Hanging up session:', this.currentSession);
    if (this.currentSession) {
      this.emitToSocket('rtc:hangup', { sessionId: this.currentSession });
    }
    this.forceCleanup();
  }

  cancelCall() {
    this.emitToSocket('rtc:call_cancelled', { sessionId: this.currentSession });
    this.playRingtone(false);
    this.forceCleanup();
  }

  toggleMute() {
    this.localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    this.isMuted.update(v => !v);
  }

  toggleCamera() {
    this.localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    this.isCamOff.update(v => !v);
  }

  async toggleScreenShare() {
    if (this.isScreenSharing()) { this.stopScreenShare(); return; }
    try {
      this.screenStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const track  = this.screenStream!.getVideoTracks()[0];
      const sender = this.pc?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(track);
      this.isScreenSharing.set(true);
      track.onended = () => this.stopScreenShare();
    } catch (e) { console.warn('[WebRTC] Screen share failed', e); }
  }

  private stopScreenShare() {
    const camTrack = this.localStream?.getVideoTracks()[0];
    const sender   = this.pc?.getSenders().find(s => s.track?.kind === 'video');
    if (sender && camTrack) sender.replaceTrack(camTrack);
    this.screenStream?.getTracks().forEach(t => t.stop());
    this.screenStream = null;
    this.isScreenSharing.set(false);
  }

  // ── Private helpers ─────────────────────────────────────────────

  private async getLocalMedia(callType: 'video' | 'audio') {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: callType === 'video' ? { width: 1280, height: 720, frameRate: 30 } : false,
      });
    } catch {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.callType.set('audio');
      } catch (e) {
        console.error('[WebRTC] Cannot access media devices', e);
      }
    }
  }

  private initPeerConnection() {
    if (this.pc) { this.pc.close(); }
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.remoteStream = new MediaStream();

    this.localStream?.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));

    this.pc.ontrack = e => {
      e.streams[0]?.getTracks().forEach(t => this.remoteStream!.addTrack(t));
    };

    this.pc.onicecandidate = e => {
      if (e.candidate) {
        this.emitToSocket('rtc:ice_candidate', {
          sessionId: this.currentSession,
          candidate: e.candidate.toJSON(),
        });
      }
    };

    this.pc.onconnectionstatechange = () => {
      const state = this.pc?.connectionState;
      console.log('[WebRTC] Connection state:', state);
      if (state === 'connected') { this.callState.set('connected'); this.startTimer(); this.monitorStats(); }
      if (state === 'failed' || state === 'disconnected') {
        console.warn('[WebRTC] Connection lost, cleaning up');
        this.forceCleanup();
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      if (this.pc?.iceConnectionState === 'failed') this.pc.restartIce();
    };
  }

  private async createAndSendOffer() {
    if (!this.pc) return;
    const offer = await this.pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: this.callType() === 'video',
    });
    await this.pc.setLocalDescription(offer);
    this.emitToSocket('rtc:offer', { sessionId: this.currentSession, sdp: offer });
  }

  private async handleRemoteOffer(sdp: any) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.emitToSocket('rtc:answer', { sessionId: this.currentSession, sdp: answer });
    this.callState.set('connected');
    this.startTimer();
  }

  /** Hard reset — called by both local hangup and remote hangup event */
  private forceCleanup() {
    clearInterval(this.durationTimer);
    clearInterval(this.statsTimer);

    this.localStream?.getTracks().forEach(t => t.stop());
    this.screenStream?.getTracks().forEach(t => t.stop());
    this.pc?.close();

    this.pc           = null;
    this.localStream  = null;
    this.screenStream = null;
    this.remoteStream = null;

    this.isMuted.set(false);
    this.isCamOff.set(false);
    this.isScreenSharing.set(false);
    this.callDuration.set(0);
    this.incomingCall.set(null);
    this.callState.set('idle');
    this.currentSession = '';
  }

  private startTimer() {
    clearInterval(this.durationTimer);
    this.callDuration.set(0);
    this.durationTimer = setInterval(() => this.callDuration.update(v => v + 1), 1000);
  }

  private monitorStats() {
    clearInterval(this.statsTimer);
    this.statsTimer = setInterval(async () => {
      if (!this.pc) return;
      const stats = await this.pc.getStats();
      stats.forEach((r: any) => {
        if (r.type === 'candidate-pair' && r.state === 'succeeded') {
          const rtt = (r.currentRoundTripTime || 0) * 1000;
          this.networkQuality.set(rtt < 100 ? 'good' : rtt < 300 ? 'medium' : 'poor');
        }
      });
    }, 3000);
  }

  private ringtoneCtx: AudioContext | null = null;
  private ringtoneInterval: any = null;

  private playRingtone(play: boolean) {
    if (!play) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneCtx?.close().catch(() => {});
      this.ringtoneCtx = null;
      return;
    }
    // Use Web Audio API beep (no external file needed)
    const beep = () => {
      try {
        if (!this.ringtoneCtx) this.ringtoneCtx = new AudioContext();
        const osc  = this.ringtoneCtx.createOscillator();
        const gain = this.ringtoneCtx.createGain();
        osc.connect(gain); gain.connect(this.ringtoneCtx.destination);
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.3, this.ringtoneCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ringtoneCtx.currentTime + 0.4);
        osc.start(); osc.stop(this.ringtoneCtx.currentTime + 0.4);
      } catch {}
    };
    beep();
    this.ringtoneInterval = setInterval(beep, 1500);
  }

  formatDuration(secs: number): string {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
