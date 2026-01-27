import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'fallback-key-change-me'

/**
 * Encrypt sensitive data using AES-256
 * Use this for fields like notes, solutions, etc.
 */
export function encrypt(text: string | null | undefined): string | null {
    if (!text) return null
    try {
        const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
        return encrypted
    } catch (error) {
        console.error('Encryption error:', error)
        return null
    }
}

/**
 * Decrypt data that was encrypted with encrypt()
 */
export function decrypt(encryptedText: string | null | undefined): string | null {
    if (!encryptedText) return null
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        return decrypted || null
    } catch (error) {
        console.error('Decryption error:', error)
        return null
    }
}

/**
 * Check if a string appears to be encrypted (base64 format from CryptoJS)
 */
export function isEncrypted(text: string | null | undefined): boolean {
    if (!text) return false
    // CryptoJS AES encrypted strings start with "U2FsdGVkX1" (base64 for "Salted__")
    return text.startsWith('U2FsdGVkX1')
}

/**
 * Safely decrypt - returns original if not encrypted or decryption fails
 * Useful during migration period
 */
export function safeDecrypt(text: string | null | undefined): string | null {
    if (!text) return null
    if (!isEncrypted(text)) return text
    return decrypt(text) || text
}

/**
 * Encrypt only if not already encrypted
 */
export function safeEncrypt(text: string | null | undefined): string | null {
    if (!text) return null
    if (isEncrypted(text)) return text
    return encrypt(text)
}
