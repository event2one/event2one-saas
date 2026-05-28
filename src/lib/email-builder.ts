const FONT = 'Verdana,Tahoma,Arial,sans-serif'

export interface EmailBuildOptions {
    primaryColor: string
    headerImageUrl?: string
    footerImageUrl?: string
    prenom: string
    nom: string
    introText: string
    signatureName: string
    contactEmail?: string
    closingText?: string
    ctaUrl?: string
    ctaLabel?: string
}

export function buildEmailHtml(opts: EmailBuildOptions): string {
    const {
        primaryColor,
        headerImageUrl,
        footerImageUrl,
        prenom,
        nom,
        introText,
        signatureName,
        contactEmail,
        closingText = 'Bien cordialement,',
        ctaUrl,
        ctaLabel,
    } = opts

    const introParagraphs = introText
        .split('\n\n')
        .map(p => `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;font-family:${FONT}">${p.replace(/\n/g, '<br>')}</p>`)
        .join('')

    const ctaBlock = ctaUrl && ctaLabel ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr><td style="text-align:center;font-family:${FONT}">
                <a href="${ctaUrl}" style="display:inline-block;background:${primaryColor};color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;font-family:${FONT}">${ctaLabel}</a>
            </td></tr>
        </table>` : ''

    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:${FONT}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" align="center" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <!-- Header -->
        ${headerImageUrl
            ? `<tr><td style="padding:0;line-height:0"><img src="${headerImageUrl}" alt="" width="600" style="width:100%;max-width:600px;display:block"></td></tr>`
            : `<tr><td style="background:${primaryColor};padding:32px 40px;text-align:center;font-family:${FONT}">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;font-family:${FONT}">Sommet « L'IA avec NOUS »</h1>
              </td></tr>`}
        <!-- Body -->
        <tr><td style="padding:40px;font-family:${FONT}">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;font-family:${FONT}">Bonjour <strong>${prenom} ${nom}</strong>,</p>
          ${introParagraphs}
          ${ctaBlock}
          <p style="margin:28px 0 0;font-size:14px;color:#6b7280;line-height:1.6;font-family:${FONT}">
            ${closingText}<br><strong>${signatureName}</strong>${contactEmail ? `<br><a href="mailto:${contactEmail}" style="color:${primaryColor};font-family:${FONT}">${contactEmail}</a>` : ''}
          </p>
        </td></tr>
        <!-- Footer -->
        ${footerImageUrl
            ? `<tr><td style="padding:0;line-height:0"><img src="${footerImageUrl}" alt="" width="600" style="width:100%;max-width:600px;display:block"></td></tr>`
            : `<tr><td style="padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;font-family:${FONT}">
                <p style="margin:0;font-size:11px;color:#9ca3af;font-family:${FONT}">Powered by <strong>event2one</strong></p>
              </td></tr>`}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
