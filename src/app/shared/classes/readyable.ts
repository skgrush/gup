import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export class NotReadyError extends Error {
  readonly name = 'NotReadyError';

  constructor(readonly message: string, ...params: any[]) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotReadyError);
    }
  }
}

export enum ReadyState {
  // Invalid = 0,
  Init = 1,
  Readying = 2,
  Failed = 3,
  Ready = 4,
}

export function readyStateCouldChange(
  rs: ReadyState
): rs is ReadyState.Readying | ReadyState.Init {
  return rs === ReadyState.Readying || rs === ReadyState.Init;
}
export function readyStateFinalized(
  rs: ReadyState
): rs is ReadyState.Failed | ReadyState.Ready {
  return rs === ReadyState.Failed || rs === ReadyState.Ready;
}

type ReadyCondition = Readyable | BehaviorSubject<ReadyState>;

/**
 * Abstract base class for classes that have an asynchronous ready state
 * based on observable conditions, its `ReadyConditions`.
 *
 * Readyable classes **must** call `readyInit()`, preferably in their
 * constructor, once all of their ReadyConditions are established.
 */
export abstract class Readyable {
  /**
   * The conditions which must be satisfied for this to be ready.
   * Each condition is either another Readyable, or a BehaviorSubject
   * of ReadyState.
   */
  protected abstract readonly ReadyConditions: ReadyCondition[];

  #ready = new BehaviorSubject(ReadyState.Init);

  get currentState() {
    return this.#ready.value;
  }

  get isReady() {
    return this.currentState === ReadyState.Ready;
  }

  get readyObservable() {
    if (this.#ready.isStopped) {
      return of(this.currentState);
    }
    return this.#ready.asObservable();
  }

  get finalObservable() {
    return this.readyObservable.pipe(filter(readyStateFinalized));
  }

  /**
   * Wait until the ReadyCondition objects are in a final state then return
   * the overall state.
   * @returns `ReadyState.Ready` if *all* are ready
   * @returns `ReadyState.Failed` if *any* failed
   */
  static observeMultipleFinalized(...readyables: ReadyCondition[]) {
    const observables = readyables.map((r) =>
      (r instanceof Readyable ? r.readyObservable : r).pipe(
        filter(readyStateFinalized)
      )
    );
    // TODO: allow short-circuit on first fail
    return forkJoin(observables).pipe(
      map((states) => {
        return states.every((s) => s === ReadyState.Ready)
          ? ReadyState.Ready
          : ReadyState.Failed;
      })
    );
  }

  /**
   * Initialize the Readyable.
   * This should be called in the constructor, or at the earliest
   * point when `this.ReadyConditions` has all its values.
   */
  readyInit() {
    if (this.currentState === ReadyState.Init) {
      this.#ready.next(ReadyState.Readying);
      Readyable.observeMultipleFinalized(...this.ReadyConditions).subscribe(
        (state) => {
          if (!this.#ready.closed) {
            this.#ready.next(state);
            this.#ready.complete();
          }
        }
      );
    } else {
      // ICK. But at least most classes will use the logger as intended.
      ((this as any)._logger ?? console).warn('Invalid call to readyInit');
    }
  }

  /**
   * Throws if we are not currently ready.
   */
  readyOrThrow() {
    if (!this.isReady) {
      const thisT = Object.getPrototypeOf(this).constructor.name;
      throw new NotReadyError(`${thisT} not ready`);
    }
  }
}
