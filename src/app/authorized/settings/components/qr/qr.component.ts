import {
  Component,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import * as QRCode from 'qrcode';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

@Component({
  selector: 'gup-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss'],
})
export class QrComponent implements OnChanges, AfterViewInit {
  @ViewChild('qrCanvas')
  qrCanvas!: ElementRef<HTMLCanvasElement>;

  @Input()
  code?: string;

  loading = false;
  error?: string;

  constructor(private readonly _logger: LoggerService) {
    this._logger.initialize('Qr', 'component', this);
  }

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
        this._logger.error('QR ERROR:', [err]);
        this.error = err.toString();
      } finally {
        this.loading = false;
      }
    } else {
      this._logger.warn('Call to generateQR while already generating');
    }
  }
}
