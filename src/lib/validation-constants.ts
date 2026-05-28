export type ValidationStatus = 'en_attente' | 'retenu' | 'liste_attente' | 'non_retenu'

export const VALIDATION_STATUTS: Array<{
    key: ValidationStatus
    label: string
    color: string
    bg: string
}> = [
    { key: 'en_attente',    label: 'En attente',      color: '#d97706', bg: '#fef3c7' },
    { key: 'retenu',        label: 'Retenu(e)',        color: '#059669', bg: '#d1fae5' },
    { key: 'liste_attente', label: "Liste d'attente",  color: '#4f46e5', bg: '#e0e7ff' },
    { key: 'non_retenu',    label: 'Non retenu(e)',    color: '#dc2626', bg: '#fee2e2' },
]
