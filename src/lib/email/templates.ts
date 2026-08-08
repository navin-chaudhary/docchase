const baseStyles = `
  font-family: Inter, Segoe UI, Arial, sans-serif;
  color: #0f172a;
  line-height: 1.5;
`;

function wrap(content: string) {
  return `
  <div style="${baseStyles} max-width:560px;margin:0 auto;padding:24px;">
    <div style="font-weight:700;font-size:18px;color:#0f766e;margin-bottom:16px;">DocChase</div>
    ${content}
    <p style="margin-top:32px;font-size:12px;color:#64748b;">
      Stop chasing clients for documents.
    </p>
  </div>`;
}

export function requestCreatedEmail(params: {
  clientName: string;
  requestTitle: string;
  link: string;
  professionalName: string;
  message?: string;
}) {
  return wrap(`
    <h1 style="font-size:20px;margin:0 0 12px;">Document request from ${params.professionalName}</h1>
    <p>Hi ${params.clientName},</p>
    <p>Please upload the required documents for <strong>${params.requestTitle}</strong>.</p>
    ${params.message ? `<p>${params.message}</p>` : ""}
    <p style="margin:24px 0;">
      <a href="${params.link}" style="background:#0f766e;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block;">
        Upload Documents
      </a>
    </p>
    <p style="font-size:13px;color:#64748b;">Or open this link: ${params.link}</p>
  `);
}

export function documentUploadedEmail(params: {
  professionalName: string;
  clientName: string;
  documentName: string;
  requestTitle: string;
  dashboardLink: string;
}) {
  return wrap(`
    <h1 style="font-size:20px;margin:0 0 12px;">New document uploaded</h1>
    <p>Hi ${params.professionalName},</p>
    <p><strong>${params.clientName}</strong> uploaded <strong>${params.documentName}</strong> for ${params.requestTitle}.</p>
    <p><a href="${params.dashboardLink}" style="color:#0f766e;">Review in DocChase</a></p>
  `);
}

export function documentRejectedEmail(params: {
  clientName: string;
  documentName: string;
  reason: string;
  link: string;
}) {
  return wrap(`
    <h1 style="font-size:20px;margin:0 0 12px;">Document needs re-upload</h1>
    <p>Hi ${params.clientName},</p>
    <p>Your <strong>${params.documentName}</strong> was rejected.</p>
    <p><strong>Reason:</strong> ${params.reason}</p>
    <p style="margin:24px 0;">
      <a href="${params.link}" style="background:#0f766e;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block;">
        Upload Again
      </a>
    </p>
  `);
}

export function documentApprovedEmail(params: {
  clientName: string;
  documentName: string;
  requestTitle: string;
}) {
  return wrap(`
    <h1 style="font-size:20px;margin:0 0 12px;">Document approved</h1>
    <p>Hi ${params.clientName},</p>
    <p>Your <strong>${params.documentName}</strong> for ${params.requestTitle} has been approved.</p>
  `);
}

export function requestCompletedEmail(params: {
  clientName: string;
  requestTitle: string;
  professionalName: string;
}) {
  return wrap(`
    <h1 style="font-size:20px;margin:0 0 12px;">All documents complete</h1>
    <p>Hi ${params.clientName},</p>
    <p>All required documents for <strong>${params.requestTitle}</strong> have been successfully submitted and approved by ${params.professionalName}.</p>
  `);
}

export function reminderEmail(params: {
  clientName: string;
  message: string;
  link: string;
}) {
  return wrap(`
    <h1 style="font-size:20px;margin:0 0 12px;">Reminder: pending documents</h1>
    <p>Hi ${params.clientName},</p>
    <p style="white-space:pre-wrap;">${params.message}</p>
    <p style="margin:24px 0;">
      <a href="${params.link}" style="background:#0f766e;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block;">
        Upload Documents
      </a>
    </p>
  `);
}

export function passwordResetEmail(params: { name: string; link: string }) {
  return wrap(`
    <h1 style="font-size:20px;margin:0 0 12px;">Reset your password</h1>
    <p>Hi ${params.name},</p>
    <p>Click the button below to reset your DocChase password. This link expires in 1 hour.</p>
    <p style="margin:24px 0;">
      <a href="${params.link}" style="background:#0f766e;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block;">
        Reset Password
      </a>
    </p>
  `);
}
