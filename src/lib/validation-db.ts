import type { ValidationStatus } from '@/lib/validation-constants'
export type { ValidationStatus } from '@/lib/validation-constants'

const E2O_VALIDATION_API_URL = 'https://www.mlg-consulting.com/smart_territory/form/e2o_validation_api.php'

export async function getValidations(
    eventId: string
): Promise<Record<string, ValidationStatus>> {
    const res = await fetch(`${E2O_VALIDATION_API_URL}?action=getE2oValidation&id_event=${eventId}`)
    const rows = (await res.json()) as Array<{ id_contact: string; cf_etat: ValidationStatus }>
    if (!Array.isArray(rows)) return {}
    return Object.fromEntries(rows.map(r => [r.id_contact, r.cf_etat]))
}

export async function setValidation(
    eventId: string,
    idContact: string,
    status: ValidationStatus
): Promise<void> {
    await fetch(`${E2O_VALIDATION_API_URL}?action=createE2oValidation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_event: eventId, id_contact: idContact, cf_etat: status }),
    })
}
