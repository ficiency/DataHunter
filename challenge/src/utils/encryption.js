// AES-256-GCM encryption for protecting PII in database

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Validate encryption key on module load
if (!ENCRYPTION_KEY) {
    console.warn('⚠️  ENCRYPTION_KEY not set. PII will not be encrypted');
} else if (ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

function encrypt(text) {
    if (!text) return null;

    // If no encryption key, return plaintext (for demo)
    if (!ENCRYPTION_KEY) {
        console.warn('⚠️  Encryption key missing. Storing in plaintext.');
        return text;
    }

    try {
        // Generate random IV (Initialization Vector)
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get authentication tag (prevents tampering)
        const authTag = cipher.getAuthTag();

        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('❌ Encryption failed:', error.message);
        return text;
    }
}


function decrypt(encryptedData) {
    if (!encryptedData) return null;
    
    // If no encryption key, assume plaintext
    if (!ENCRYPTION_KEY) {
        return encryptedData;
    }
    
    // If doesn't match encrypted format, assume plaintext
    if (!encryptedData.includes(':')) {
        return encryptedData;
    }
    
    try {
        // Parse the encrypted data
        const [iv, authTag, encrypted] = encryptedData.split(':');
        
        if (!iv || !authTag || !encrypted) {
            console.error('⚠️  Invalid encrypted format');
            return '[DECRYPTION_FAILED]';
        }
        
        // Create decipher
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            Buffer.from(iv, 'hex')
        );
        
        // Set authentication tag
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        
        // Decrypt the data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('❌ Decryption failed:', error.message);
        return '[DECRYPTION_FAILED]';
    }
}

module.exports = { encrypt, decrypt };