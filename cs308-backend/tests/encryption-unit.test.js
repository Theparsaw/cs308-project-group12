const { encryptValue, decryptValue } = require("../utils/encryption");

describe("encryption utilities", () => {
  const originalSensitiveDataKey = process.env.SENSITIVE_DATA_KEY;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.SENSITIVE_DATA_KEY = "unit-test-sensitive-key";
    delete process.env.JWT_SECRET;
  });

  afterAll(() => {
    if (originalSensitiveDataKey === undefined) {
      delete process.env.SENSITIVE_DATA_KEY;
    } else {
      process.env.SENSITIVE_DATA_KEY = originalSensitiveDataKey;
    }

    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  test("encrypts a value into a different base64 payload", () => {
    const encrypted = encryptValue("4111111111111111");

    expect(encrypted).not.toBe("4111111111111111");
    expect(Buffer.from(encrypted, "base64").length).toBeGreaterThan(28);
  });

  test("decrypts encrypted values back to the original string", () => {
    const encrypted = encryptValue("Sensitive Value");

    expect(decryptValue(encrypted)).toBe("Sensitive Value");
  });

  test("returns empty-like values without encrypting them", () => {
    expect(encryptValue(null)).toBe("");
    expect(encryptValue(undefined)).toBe("");
    expect(encryptValue("")).toBe("");
    expect(decryptValue("")).toBe("");
  });

  test("returns the original value when decryption payload is invalid", () => {
    expect(decryptValue("not encrypted")).toBe("not encrypted");
  });
});
