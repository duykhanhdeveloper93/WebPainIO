import {
  Component, Input, OnDestroy, signal,
  ViewChild, ElementRef, AfterViewInit, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRtcService } from '../../core/services/webrtc.service';

@Component({
  selector: 'app-call-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './call-modal.component.html',
  styleUrls: ['./call-modal.component.scss']
})
export class CallModalComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() sessionId  = '';
  @Input() myName     = '';
  @Input() role: 'customer' | 'admin' = 'customer';

  @ViewChild('localVideo')  localVid!:  ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVid!: ElementRef<HTMLVideoElement>;

  showCallBar = signal(false); // minimised floating bar

  constructor(public rtc: WebRtcService) {}

  ngAfterViewInit() { this.attachStreams(); }
  ngOnChanges()     { this.attachStreams(); }
  ngOnDestroy()     { if (this.rtc.callState() !== 'idle') this.rtc.hangup(); }

  private attachStreams() {
    setTimeout(() => {
      if (this.localVid?.nativeElement && this.rtc.localStream) {
        this.localVid.nativeElement.srcObject = this.rtc.localStream;
      }
      if (this.remoteVid?.nativeElement && this.rtc.remoteStream) {
        this.remoteVid.nativeElement.srcObject = this.rtc.remoteStream;
      }
    }, 300);
  }

  // ── Actions ────────────────────────────────────────────────────────
  startVideoCall() { this.rtc.startCall(this.sessionId, 'video', this.myName); this.showCallBar.set(false); }
  startAudioCall() { this.rtc.startCall(this.sessionId, 'audio', this.myName); this.showCallBar.set(false); }
  acceptCall()     { this.rtc.acceptCall().then(() => this.attachStreams()); }
  rejectCall()     { this.rtc.rejectCall(); }
  hangup()         { this.rtc.hangup(); this.showCallBar.set(false); }
  cancelCall()     { this.rtc.cancelCall(); }
  toggleMute()     { this.rtc.toggleMute(); }
  toggleCam()      { this.rtc.toggleCamera(); }
  toggleScreen()   { this.rtc.toggleScreenShare(); }
  minimise()       { this.showCallBar.set(true); }
  maximise()       { this.showCallBar.set(false); }

  isVideoCall()    { return this.rtc.callType() === 'video'; }
  isActive()       { return ['calling','connecting','connected'].includes(this.rtc.callState()); }
  showModal()      { return this.rtc.callState() !== 'idle' && !this.showCallBar(); }

  qualityIcon() {
    const q = this.rtc.networkQuality();
    return q === 'good' ? '📶' : q === 'medium' ? '📶' : '📵';
  }
}
