export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  if (!digits) {
    return `https://wa.me/?text=${encoded}`;
  }
  return `https://wa.me/${digits}?text=${encoded}`;
}

export function formatReminderMessage(params: {
  template: string;
  clientName: string;
  requestTitle: string;
  pendingCount: number;
  link: string;
}): string {
  const { template, clientName, requestTitle, pendingCount, link } = params;
  return template
    .replaceAll("{clientName}", clientName)
    .replaceAll("{requestTitle}", requestTitle)
    .replaceAll("{pendingCount}", String(pendingCount))
    .replaceAll("{link}", link)
    .trim()
    .concat(template.includes("{link}") ? "" : `\n\n${link}`);
}
