// Self-hosters send from their own verified Resend domain by setting EMAIL_FROM_DOMAIN.
export const fromAddress = (localPart: string) => `${localPart}@${process.env.EMAIL_FROM_DOMAIN || 'shonin.dev'}`;
