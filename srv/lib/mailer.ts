import nodemailer, { Transporter } from "nodemailer";

let transposterPromise: Promise<Transporter> | null = null;

export interface WelcomeEmailRecipient {
  name?: string | null;
  originPlanet?: string | null;
}

export async function sendWelcomeEmail(
  recipient: WelcomeEmailRecipient,
): Promise<string> {
  const transporter = await getTransporter();
  const name = recipient.name ?? "Spacefarer";
  const to = getSpacefarerEmail(name, recipient.originPlanet ?? "Earth");

  const info = await transporter.sendMail({
    from: '"Galactic Spacefarer Adventure" <no-reply@spacefarer.sap>',
    to,
    subject: "Welcome aboard, Spacefarer!",
    text: `Congratulations, ${name}! Your journey among the stars has begun.`,
    html: `<p>Congratulations, <strong>${name}</strong>!</p><p>Your journey among the stars has begun.</p>`,
  });

  return nodemailer.getTestMessageUrl(info) || info.messageId;
}

async function getTransporter(): Promise<Transporter> {
  if (!transposterPromise) {
    transposterPromise = nodemailer.createTestAccount().then((account) => {
      return nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
    });
  }
  return transposterPromise;
}

function getSpacefarerEmail(name: string, originPlanet: string): string {
  const nameParts = toAsciiSlug(name)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.replace(/[^a-z0-9]/g, ""));

  const localPart = nameParts.join(".");
  const domain =
    toAsciiSlug(originPlanet)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "earth";

  return `${localPart}@${domain}.space`;
}

function toAsciiSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
