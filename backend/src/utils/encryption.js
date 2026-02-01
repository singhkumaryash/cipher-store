import crypto from "crypto";

const algorithm = "aes-256-cbc";

const encrypt = (text) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY);

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf-8");

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  };
};

const decrypt = (text) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY);

  const iv = Buffer.from(text.iv, "hex");

  const encryptedText = Buffer.from(text.encryptedData, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

export { encrypt, decrypt };
