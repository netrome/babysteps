export class KeyStore {
  constructor(keyName) {
    this.keyName = keyName;
  }

  getKey() {
    const keyHex = localStorage.getItem(this.keyName);
    if (keyHex) {
      return new Uint8Array(
        keyHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
      );
    }
    return null;
  }

  setKey(key) {
    const keyHex = Array.from(key).map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    localStorage.setItem(this.keyName, keyHex);
  }

  generateKey() {
    const key = new Uint8Array(32);
    crypto.getRandomValues(key);
    this.setKey(key);
    return key;
  }

  getOrCreateKey() {
    let key = this.getKey();
    if (!key) {
      key = this.generateKey();
    }
    return key;
  }
}
