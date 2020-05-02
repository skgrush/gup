// tslint:disable:no-redundant-jsdoc

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
   * Get the current internal path from the browser's query param.
   *
   * @param includeHash - ignored, not relevant to query strat.
   */
  path(includeHash: boolean = false): string {
    let p = this._getSearchParams().get(QueryLocationStrategy.pathQuery) ?? '';
    if (includeHash) {
      p += this._getHash();
    }
    console.debug('path', p);
    return p;
  }

  /**
   * @override
   *
   * @param internalUrl
   */
  prepareExternalUrl(internalPath: string, queryParams: string = ''): string {
    const extParams = this._getSearchParams();

    // merge internal and external params
    new URLSearchParams(queryParams).forEach((val, key) =>
      extParams.set(key, val)
    );

    if (internalPath.length) {
      extParams.set(QueryLocationStrategy.pathQuery, internalPath);
    }

    const stringParams = extParams.toString();
    return stringParams.length > 0
      ? `?${stringParams}${this._getHash()}`
      : this._getHash();
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
      this.prepareExternalUrl(url, queryParams)
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
      this.prepareExternalUrl(url, queryParams)
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
    // console.debug('getBaseHref', this._baseHref);
    return this._baseHref;
  }

  /**
   * Gets the browser's URL hash string (# prefixed).
   */
  private _getHash(): string {
    // console.debug('_getHash', this._platformLoc.hash);
    return this._platformLoc.hash;
  }

  /**
   * Gets the browser's URL query parameters.
   */
  private _getSearchParams(): URLSearchParams {
    // console.debug('_getSearchParams', this._platformLoc.search);
    return new URLSearchParams(this._platformLoc.search);
  }
}
