const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const hexKey = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
  if (!hexKey) {
    throw new Error("Falta configurar SOCIAL_TOKEN_ENCRYPTION_KEY en el archivo .env del backend.");
  }
  const key = Buffer.from(hexKey, "hex");
  if (key.length !== 32) {
    throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY debe ser una cadena hex de 32 bytes (64 caracteres). Genérala con crypto.randomBytes(32).toString('hex').");
  }
  return key;
}

function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    tag: authTag.toString("hex"),
    data: encrypted.toString("hex"),
  };
}

function decrypt(blob) {
  if (!blob || typeof blob !== "object" || !blob.iv || !blob.tag || !blob.data) {
    return null;
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(blob.iv, "hex"));
  decipher.setAuthTag(Buffer.from(blob.tag, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(blob.data, "hex")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8"));
}

module.exports = { encrypt, decrypt };
