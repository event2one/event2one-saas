/**
 * badge-token.ts
 * Chiffrement AES-256-GCM des paramètres de génération de badge.
 * Utilisé pour transmettre id_contact et les données associées
 * dans l'URL sans les exposer en clair.
 *
 * Env requis : BADGE_TOKEN_SECRET  (64 chars hex = 32 bytes)
 * Génération : openssl rand -hex 32
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALG = 'aes-256-gcm'
const TOKEN_TTL_SECONDS = 2 * 60 * 60 // 2 heures

export type BadgeTokenPayload = {
    id_event: string
    id_contact: string
    autoprint?: boolean
}

function getKey(): Buffer {
    const secret = process.env.BADGE_TOKEN_SECRET
    if (!secret) throw new Error('BADGE_TOKEN_SECRET is not configured')
    if (/^[0-9a-f]{64}$/i.test(secret)) return Buffer.from(secret, 'hex')
    // Accepte aussi base64 (44 chars → 32 bytes)
    const buf = Buffer.from(secret, 'base64')
    if (buf.length < 32) throw new Error('BADGE_TOKEN_SECRET too short (need 32 bytes)')
    return buf.subarray(0, 32)
}

/**
 * Chiffre un payload badge en token base64url.
 * Format binaire : iv(12) || authTag(16) || ciphertext
 */
export function encryptBadgeToken(payload: BadgeTokenPayload): string {
    const key = getKey()
    const iv = randomBytes(12)
    const cipher = createCipheriv(ALG, key, iv)

    const data = JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    })

    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted]).toString('base64url')
}

/**
 * Déchiffre et valide un token badge.
 * Lève une erreur si le token est invalide, altéré ou expiré.
 */
export function decryptBadgeToken(token: string): BadgeTokenPayload {
    let buf: Buffer
    try {
        buf = Buffer.from(token, 'base64url')
    } catch {
        throw new Error('Malformed token')
    }

    if (buf.length < 29) throw new Error('Token too short')

    const iv = buf.subarray(0, 12)
    const authTag = buf.subarray(12, 28)
    const ciphertext = buf.subarray(28)

    const key = getKey()
    const decipher = createDecipheriv(ALG, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted: Buffer
    try {
        decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    } catch {
        throw new Error('Authentication failed — token tampered or wrong key')
    }

    let parsed: BadgeTokenPayload & { exp: number }
    try {
        parsed = JSON.parse(decrypted.toString('utf8'))
    } catch {
        throw new Error('Invalid token payload')
    }

    if (typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exp: _exp, ...payload } = parsed
    return payload
}
