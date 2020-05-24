import {
  Component,
  OnInit,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
} from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'gup-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss'],
})
export class QrComponent implements OnInit, OnChanges {
  @ViewChild('qrCanvas')
  qrCanvas!: ElementRef<HTMLCanvasElement>;

  @Input()
  code?: string;

  loading = false;
  error?: string;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    if (this.code) {
      this.generateQR(this.code);
    } else {
      this.error = 'Waiting on code';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.qrCanvas && changes.code && this.code) {
      this.generateQR(this.code);
    }
  }

  async generateQR(value: string) {
    if (!this.loading) {
      try {
        this.error = undefined;
        this.loading = true;
        await QRCode.toCanvas(this.qrCanvas.nativeElement, value);
      } catch (err) {
        console.warn('QR ERROR:', [err]);
        this.error = err.toString();
      } finally {
        this.loading = false;
      }
    } else {
      console.warn('Call to generateQR while already generating');
    }
  }
}
