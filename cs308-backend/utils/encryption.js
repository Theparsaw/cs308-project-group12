const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const getEncryptionKey = () => {
  const secret = process.env.SENSITIVE_DATA_KEY || process.env.JWT_SECRET || "development-fallback-key";
  return crypto.createHash("sha256").update(String(secret)).digest();
};

const encryptValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return value ?? "";
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
};

const decryptValue = (value) => {
  if (!value) {
    return "";
  }

  try {
    const payload = Buffer.from(String(value), "base64");

    if (payload.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
      return value;
    }

    const iv = payload.subarray(0, IV_LENGTH);
    const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch (error) {
    return value;
  }
};

module.exports = {
  encryptValue,
  decryptValue,
};
