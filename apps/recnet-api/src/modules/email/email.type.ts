import EmailDevTransporter from "./transporters/email.dev.transporters";
import EmailTransporter from "./transporters/email.transporters";

export type Transporter = EmailTransporter | EmailDevTransporter;
export type SendMailResult = {
  success: boolean;
  skip?: boolean;
  userId?: string;
};
