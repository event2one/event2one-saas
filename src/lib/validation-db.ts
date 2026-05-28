import mysql from 'mysql'
import { promisify } from 'util'
export type { ValidationStatus } from '@/lib/validation-constants'

const CREATE_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS e2o_validation (
        id_event   VARCHAR(20)  NOT NULL,
        id_contact VARCHAR(20)  NOT NULL,
        cf_etat    ENUM('en_attente','retenu','liste_attente','non_retenu')
                   NOT NULL DEFAULT 'en_attente',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id_event, id_contact)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`

async function withDb<T>(
    fn: (query: (...args: unknown[]) => Promise<unknown>) => Promise<T>
): Promise<T> {
    const conn = mysql.createConnection(process.env.DATABASE_URL!)
    const query = promisify(conn.query.bind(conn)) as (...args: unknown[]) => Promise<unknown>
    await new Promise<void>((resolve, reject) =>
        conn.connect(err => (err ? reject(err) : resolve()))
    )
    try {
        await query(CREATE_TABLE_SQL)
        return await fn(query)
    } finally {
        conn.end()
    }
}

export async function getValidations(
    eventId: string
): Promise<Record<string, ValidationStatus>> {
    return withDb(async query => {
        const rows = (await query(
            'SELECT id_contact, cf_etat FROM e2o_validation WHERE id_event = ?',
            [eventId]
        )) as Array<{ id_contact: string; cf_etat: ValidationStatus }>
        return Object.fromEntries(rows.map(r => [r.id_contact, r.cf_etat]))
    })
}

export async function setValidation(
    eventId: string,
    idContact: string,
    status: ValidationStatus
): Promise<void> {
    return withDb(async query => {
        await query(
            `INSERT INTO e2o_validation (id_event, id_contact, cf_etat)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE cf_etat = VALUES(cf_etat), updated_at = CURRENT_TIMESTAMP`,
            [eventId, idContact, status]
        )
    })
}
