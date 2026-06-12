// Billet d'entrée (e-badge) — email HTML partagé entre /events/[eventId]/confirm et le kiosque onsite.

import type { EventConfig } from '@/config/events'

export const FONT = 'Verdana,Tahoma,Arial,sans-serif'

export type TicketContact = {
    prenom: string
    nom: string
}

export function buildTicketEmailHtml(cfg: EventConfig, contact: TicketContact, badgeUrl: string | null, introParagraphs?: string[]): string {
    const color = cfg.primaryColor ?? '#000000'
    const headerImageUrl = cfg.headerImageUrl
    const footerImageUrl = cfg.footerImageUrl
    const eventName = cfg.email?.eventName ?? 'l\'événement'
    const contactEmail = cfg.email?.contactEmail
    const signatureName = cfg.email?.signatureName
    const closingText = cfg.email?.closingText || 'Bien cordialement,'

    const defaultIntro = [
        `Merci pour votre réponse — votre présence à <strong>${eventName}</strong> est désormais définitivement confirmée.`,
        `<strong style="color:#dc2626">Places limitées dans l'Atrium principal</strong> — L'accès à la salle principale est réservé aux premiers arrivés sur place, dans la limite des capacités d'accueil. Des espaces de retransmission en direct seront disponibles pour les autres participants.`,
        `Voici votre billet d'entrée définitif avec QR Code : imprimez-le ou présentez-le directement depuis votre téléphone à l'accueil le jour J.`,
    ]

    const introHtml = (introParagraphs ?? defaultIntro)
        .map(p => `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;font-family:${FONT}">${p}</p>`)
        .join('')

    const badgeBlock = badgeUrl ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0">
        <tr><td style="text-align:center">
          <a href="${badgeUrl}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 32px;border-radius:8px;font-family:${FONT}">Imprimer mon billet d'entrée →</a>
          <p style="font-size:12px;color:#6b7280;margin:12px 0 0;font-family:${FONT}">ou présentez le QR Code sur votre téléphone à l'accueil</p>
        </td></tr>
      </table>` : ''

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:${FONT}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" align="center" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        ${headerImageUrl ? `<tr><td style="padding:0;line-height:0"><img src="${headerImageUrl}" alt="" width="600" style="width:100%;max-width:600px;display:block"></td></tr>` : ''}
        <tr><td style="padding:40px;font-family:${FONT}">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;font-family:${FONT}">Bonjour <strong>${contact.prenom} ${contact.nom}</strong>,</p>
          ${introHtml}
          ${badgeBlock}
          <p style="margin:8px 0 0;font-size:14px;color:#6b7280;line-height:1.6;font-family:${FONT}">
            ${closingText}${signatureName ? `<br><strong>${signatureName}</strong>` : ''}${contactEmail ? `${signatureName ? '<br>' : ''}<a href="mailto:${contactEmail}" style="color:${color};font-family:${FONT}">${contactEmail}</a>` : ''}
          </p>
        </td></tr>
        ${footerImageUrl ? `<tr><td style="padding:0;line-height:0"><img src="${footerImageUrl}" alt="" width="600" style="width:100%;max-width:600px;display:block"></td></tr>` : ''}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
