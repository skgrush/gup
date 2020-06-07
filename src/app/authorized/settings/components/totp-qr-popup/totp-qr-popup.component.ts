import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

export interface IConfirmGood {
  deviceName: string;
  confirmCode: string;
}

export class TOTPError extends Error {
  readonly name = 'TOTPError';

  constructor(...params: any[]) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TOTPError);
    }
  }
}

@Component({
  selector: 'gup-totp-qr-popup',
  templateUrl: './totp-qr-popup.component.html',
  styleUrls: ['./totp-qr-popup.component.scss'],
})
export class TotpQrPopupComponent implements OnChanges {
  /**
   * Raw, unecoded secret auth key, to be base32 encoded.
   */
  @Input()
  secret?: string;

  @Input()
  issuer?: string;

  @Input()
  accountName?: string;

  @Input()
  show?: boolean;

  @Output()
  confirm = new EventEmitter<IConfirmGood | null>();

  @ViewChild('popup')
  popup?: ElementRef<HTMLDialogElement>;

  keyUri?: string;

  get isOpen() {
    return this.#isOpen ? true : null;
  }

  #isOpen = false;

  formGroup = new FormGroup({
    deviceName: new FormControl(''),
    confirmCode: new FormControl(''),
  });

  constructor(private readonly _logger: LoggerService) {
    this._logger.initialize('TotpQrPopup', 'component', this);
  }

  open() {
    this.keyUri = this.generateKeyUri();
    this.formGroup.reset();
    this.formGroup.enable();
    this.#isOpen = true;
  }

  close() {
    this.#isOpen = false;
  }

  cancel() {
    this.confirm.emit(null);
    this.close();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.show) {
      if (this.show) {
        this.open();
      } else if (changes.show.previousValue) {
        this.close();
      }
    }
  }

  onSubmit(event: Event) {
    this._logger.debug('onSubmit', event, this.formGroup);
    const control = this.formGroup.controls.confirmCode;
    if (this.formGroup.valid && control.value) {
      this.formGroup.disable();
      this.confirm.emit({
        deviceName: this.formGroup.value.deviceName,
        confirmCode: this.formGroup.value.confirmCode,
      });
    }
  }

  /**
   * Based on Google Authenticator's documentation for *OTP Key Uri Format.
   * @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format
   */
  generateKeyUri() {
    for (const prop of ['issuer', 'accountName'] as const) {
      const val = this[prop];
      if (!val) {
        throw new TOTPError(`TOTP ${prop} is required`);
      }
      if (val.includes(':')) {
        throw new TOTPError(`TOTP ${prop} cannot include a colon`);
      }
    }
    if (!this.secret) {
      throw new TOTPError(`TOTP secret is required`);
    }

    const encodedIssuer = encodeURIComponent(this.issuer as string);
    const encodedAccountName = encodeURI(this.accountName as string);
    const encodedSecret = this.secret; // base32(this.secret);

    const result = `otpauth://totp/${encodedIssuer}:${encodedAccountName}?secret=${encodedSecret}&issuer=${encodedIssuer}`;
    this._logger.debug('KEY-URI', result);
    return result;
  }
}
