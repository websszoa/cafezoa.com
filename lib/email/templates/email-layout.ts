import { APP_SITE_URL } from "@/lib/constants";

export function emailLayout({
  eyebrow,
  title,
  description,
  accent = "#ff5b20",
  content,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  accent?: string;
  content: string;
  footer: string;
}): string {
  return `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f4f4f5"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td align="center" style="padding-bottom:20px"><a href="${APP_SITE_URL}" style="text-decoration:none"><strong style="font-size:26px;color:#ff5b20">카페조아</strong><span style="display:block;margin-top:3px;font-size:13px;color:#9ca3af">CAFEZOA · 카페 큐레이션 가이드</span></a></td></tr>
<tr><td style="overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 8px 28px rgba(15,23,42,.08)">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:30px 28px;background:#3a241c;border-bottom:4px solid ${accent}"><p style="margin:0 0 7px;font-size:12px;font-weight:700;letter-spacing:1.2px;color:#c9b8ab">${escapeHtml(eyebrow)}</p><h1 style="margin:0;font-size:23px;line-height:1.4;color:#fff">${escapeHtml(title)}</h1><p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#e8dcd0">${escapeHtml(description)}</p></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px">${content}</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:20px 8px 8px;font-size:12px;line-height:1.7;color:#9ca3af">${footer}<br>© ${new Date().getFullYear()} CAFEZOA</td></tr>
</table></td></tr></table></body></html>`;
}

export function infoTable(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="overflow:hidden;border:1px solid #e5e7eb;border-radius:12px">${rows
    .map(
      ([label, value], index) =>
        `<tr><td style="width:88px;padding:11px 14px;background:#f9fafb;font-size:13px;font-weight:600;color:#6b7280;${index < rows.length - 1 ? "border-bottom:1px solid #e5e7eb" : ""}">${escapeHtml(label)}</td><td style="padding:11px 14px;font-size:13px;line-height:1.6;color:#111827;${index < rows.length - 1 ? "border-bottom:1px solid #e5e7eb" : ""}">${escapeHtml(value)}</td></tr>`,
    )
    .join("")}</table>`;
}

export function messageBox(message: string): string {
  return `<div style="margin-top:20px;padding:16px;border-left:4px solid #ff5b20;border-radius:10px;background:#fff3ec;font-size:14px;line-height:1.8;color:#374151;white-space:pre-wrap">${escapeHtml(message)}</div>`;
}

export function emailButton(label: string, href: string): string {
  return `<p style="margin:24px 0 0;text-align:center"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 26px;border-radius:999px;background:#ff5b20;color:#fff;font-size:14px;font-weight:700;text-decoration:none">${escapeHtml(label)} →</a></p>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
