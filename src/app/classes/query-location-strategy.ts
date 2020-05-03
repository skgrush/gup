// tslint:disable:no-redundant-jsdoc
/**
 * Heavily based on (if not just copied-from and modified)
 * https://gist.github.com/bergwerf/966ccd3ad851a70c4a56ebeb571adb77
 */

import { Injectable, Optional, Inject } from '@angular/core';
import {
  PlatformLocation,
  LocationStrategy,
  LocationChangeListener,
  APP_BASE_HREF,
} from '@angular/common';

@Injectable()
export class QueryLocationStrategy extends LocationStrategy {
  static readonly pathQuery = 'path';
  readonly _baseHref: string;

  constructor(
    private readonly _platformLoc: PlatformLocation,
    @Optional() @Inject(APP_BASE_HREF) baseHref?: string
  ) {
    super();
    this._baseHref = baseHref ?? '';
  }

  /**
   * @override
   */
  hash() {
    return this._getHash();
  }

  /**
   * @override
   * Get the current internal path from the browser's query param.
   *
   * @param includeHash - ignored, not relevant to query strat.
   */
  path(includeHash: boolean = false): string {
    return this._getSearchParams().get(QueryLocationStrategy.pathQuery) ?? '';
  }

  /**
   * @override
   *
   * @param internalPath
   */
  prepareExternalUrl(internalPath: string): string {
    return this.externalUrl(internalPath);
  }

  externalUrl(str: string, queryParams = ''): string {
    const internalParams = new URLSearchParams(queryParams);
    const externalParams = this._getSearchParams();
    internalParams.forEach((value, key) => {
      externalParams.set(key, value);
    });

    const path = (!str ? '' : str.substring(1)).replace(/\//g, '_');
    externalParams.set(QueryLocationStrategy.pathQuery, path);
    return `?${externalParams}${this.hash()}`;
  }

  /**
   * @override
   *
   * @param state
   * @param title
   * @param url
   * @param queryParams
   */
  pushState(state: any, title: string, url: string, queryParams: string): void {
    this._platformLoc.pushState(
      state,
      title,
      this.externalUrl(url, queryParams)
    );
  }

  /**
   * @override
   *
   * @param state
   * @param title
   * @param url
   * @param queryParams
   */
  replaceState(
    state: any,
    title: string,
    url: string,
    queryParams: string
  ): void {
    this._platformLoc.replaceState(
      state,
      title,
      this.externalUrl(url, queryParams)
    );
  }

  /**
   * @override
   */
  forward(): void {
    this._platformLoc.forward();
  }

  /**
   * @override
   */
  back(): void {
    this._platformLoc.back();
  }

  /**
   * @override
   * @param fn - pass-thru listener for LocationChange events.
   */
  onPopState(fn: LocationChangeListener): void {
    this._platformLoc.onPopState(fn);
  }

  /**
   * @override
   */
  getBaseHref(): string {
    return this._baseHref;
  }

  /**
   * Gets the browser's URL hash string (# prefixed).
   */
  private _getHash(): string {
    return this._platformLoc.hash;
  }

  /**
   * Gets the browser's URL query parameters.
   */
  private _getSearchParams(): URLSearchParams {
    return new URLSearchParams(this._platformLoc.search);
  }
}
