import { randomBytes } from "crypto";

import { decrypt, encrypt } from "..";

describe("encrypt and decrypt", () => {
  it("should encrypt and decrypt successfully", () => {
    const key = randomBytes(32);
    const encrypted = encrypt("test", key);
    const decrypted = decrypt(encrypted, key);
    expect(decrypted).toBe("test");
  });
});
