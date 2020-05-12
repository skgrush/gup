import {
  Directive,
  HostListener,
  Output,
  EventEmitter,
  Input,
  HostBinding,
} from '@angular/core';
import { FEMovableKeyType } from '../enums/file-entity-headers.enum';

const HEADER_CONTENT_TYPE = 'gup/is-a-header';
const KEY_CONTENT_TYPE = 'gup/key';

/**
 * Adds the `draggable` attribute and drag-related event listeners to the
 * attached header, and implements `HeaderDndManager` functionality.
 * Emits `moveHeaderFromTo` when a header is successfully dragged.
 * @see HeaderDndManager
 *
 * @example
 * ```
 * <th gupDraggableHeader [draggable]="true" dragKey="size" ... />
 * ```
 */
@Directive({
  selector: '[gupDraggableHeader]',
})
export class DraggableHeaderDirective {
  @Input()
  draggable?: boolean;

  @Input()
  dragKey?: FEMovableKeyType;

  @Output()
  moveHeaderFromTo = new EventEmitter<[FEMovableKeyType, FEMovableKeyType]>();

  @HostBinding('draggable')
  get attrDraggable() {
    return !!this.draggable;
  }

  // @HostListener('drag')
  // onDrag(e: DragEvent) {
  //   if (this.draggable && this.dragKey) {
  //   }
  // }

  @HostListener('dragstart', ['$event'])
  onDragStart(e: DragEvent) {
    // console.debug('onDragStart', e);
    if (this.draggable && this.dragKey && e?.dataTransfer) {
      e.dataTransfer.setData(HEADER_CONTENT_TYPE, 'true');
      e.dataTransfer.setData(KEY_CONTENT_TYPE, this.dragKey);
      e.dataTransfer.dropEffect = 'move';
    }
    e.stopPropagation();
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(e: DragEvent) {
    // console.debug('onDragEnter', e);
    if (this.draggable && this.dragKey && e.dataTransfer) {
      const isAHeader = this._eventIsAHeaderDrag(e);
      if (isAHeader) {
        const src = e.relatedTarget as HTMLElement | null;
        const dest = e.target;
        if (src !== dest && src) {
          this._toggleHoverStyle(true, dest);
        }
        // this confirms that we're an acceptable dropzone
        console.info('good enter');
        e.preventDefault();
      }
    }
    e.stopPropagation();
  }

  @HostListener('dragover', ['$event'])
  onDragOver(e: DragEvent) {
    if (this.draggable && this.dragKey && e?.dataTransfer) {
      const isAHeader = this._eventIsAHeaderDrag(e);
      if (isAHeader) {
        // this confirms that we're an acceptable dropzone
        e.preventDefault();
      }
    }
    e.stopPropagation();
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(e: DragEvent) {
    // console.debug('onDragLeave', e);
    if (this.draggable && this.dragKey && e.dataTransfer) {
      const isAHeader = this._eventIsAHeaderDrag(e);
      if (isAHeader) {
        this._toggleHoverStyle(false, e.target);
      }
    }
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(e: DragEvent) {
    // console.debug('onDragEnd', e);
    if (this.draggable && this.dragKey) {
      this._toggleHoverStyle(false, e.target);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    // console.debug('onDrop', e);
    if (this.draggable && this.dragKey) {
      const isAHeader = this._eventIsAHeaderDrag(e);
      const startKey = this._eventGetStartKey(e);
      if (isAHeader && startKey) {
        if (startKey !== this.dragKey) {
          e.preventDefault();
          this.moveHeaderFromTo.emit([startKey, this.dragKey]);
          // console.warn('GOOD DROP!');
        }
      } // else {
      // console.warn('BAD DROP??');
      // }
    }
  }

  private _eventIsAHeaderDrag(e: DragEvent) {
    const { dataTransfer } = e;
    if (dataTransfer) {
      return [HEADER_CONTENT_TYPE, KEY_CONTENT_TYPE].every((ct) =>
        dataTransfer.types.includes(ct)
      );
    }
    return false;
  }
  private _eventGetStartKey(e: DragEvent): FEMovableKeyType | null {
    // console.debug('_eventGetStartKey');
    return (
      (e.dataTransfer?.getData(KEY_CONTENT_TYPE) as FEMovableKeyType) ?? null
    );
  }

  private _toggleHoverStyle(on: boolean, target: EventTarget | null) {
    if (target instanceof HTMLElement) {
      target.classList.toggle('drag-hover', on);
    }
  }
}
