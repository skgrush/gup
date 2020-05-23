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
 */
export abstract class Readyable {
  protected abstract readonly ReadyConditions: ReadyCondition[];

  #ready = new BehaviorSubject(ReadyState.Init);

  get currentState() {
    return this.#ready.value;
  }

  get isReady() {
    return this.currentState === ReadyState.Ready;
  }

  /**
   * Wait until the ReadyCondition objects are in a final state,
   * then return `Ready` if all area ready, or `Failed` if any failed.
   */
  static observeMultiple(...readyables: ReadyCondition[]) {
    const observables = readyables.map((r) =>
      r instanceof Readyable
        ? r.observeReadyFinalize()
        : r.pipe(filter(readyStateFinalized))
    );
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
   * point when `this.ReadyConditions` is initialized.
   */
  readyInit() {
    this.observeReadyFinalize().subscribe((state) => {
      if (!this.#ready.closed) {
        this.#ready.next(state);
        this.#ready.complete();
      }
    });
  }

  /**
   * Returns an observable which emits only when in a finalized state.
   * Still make sure to check that it's actually ready!
   */
  observeReadyFinalize(): Observable<ReadyState.Failed | ReadyState.Ready> {
    if (readyStateFinalized(this.currentState)) {
      return of(this.currentState);
    }
    return Readyable.observeMultiple(...this.ReadyConditions);
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
