"use server";

export interface InquiryState {
  ok: boolean;
  message: string;
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const design = String(formData.get("design") ?? "").trim();

  if (!name || !email || !message) {
    return { ok: false, message: "Please fill in your name, email, and a message." };
  }

  // TODO: deliver the inquiry. The easiest option on Vercel is Resend (resend.com):
  //   npm install resend
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({ from: "site@yourdomain.com", to: "you@yourdomain.com", subject: ..., text: ... });
  // Until then, inquiries are logged to the Vercel function logs.
  console.log("New inquiry", { name, email, message, sku, design });

  return { ok: true, message: "Thank you. We will be in touch within one business day." };
}
