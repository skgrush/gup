import { KeyStoreCredentials } from './key-store-credentials';
import { KeyStore } from './key-store';

describe('KeyStoreCredentials', () => {
  let keystore: KeyStore;

  beforeEach(() => {
    //
  });
  it('should create an instance', () => {
    expect(new KeyStoreCredentials(keystore)).toBeTruthy();
  });
});
