const nodemailer = require('nodemailer');
const environment = require('../environment');

class Mailer {
  constructor () {
    this.host = environment.SMTP_HOST;
    this.port = environment.SMTP_PORT;
    this.user = environment.SMTP_USER;
    this.password = environment.SMTP_PW;
  }

  async createAccount () {
    const account = await nodemailer.createTestAccount();
    return account;
  }

  async createTransport (useTest = false) {
    let account;
    if (useTest) {
      account = await this.createAccount();
    }

    const transport = nodemailer.createTransport({
      host: account?.smtp?.host || this.host,
      port: account?.smtp?.port || Number(this.port),
      secure: account?.smtp?.secure || false,
      auth: {
        user: account?.user || this.user,
        pass: account?.pass || this.password
      }
    });

    return transport;
  }

  async sendEmail (
    useTestAccount = false,
    fromEmail = '',
    emails = [],
    htmlString = '',
    subject = '',
    text = '',
    attachments = []
  ) {
    const subjectTo = environment.NODE_ENV === 'production' ? subject : `${environment.NODE_ENV} | ${subject}`;

    const transport = await this.createTransport(useTestAccount);

    const info = await transport.sendMail({
      from: fromEmail,
      to: emails.toString(),
      subject: subjectTo,
      text,
      html: htmlString,
      attachments
    });

    // eslint-disable-next-line no-console
    console.log(`'Message sent: ${info.response}`, 'MailerService');
  }
}

module.exports = {
  mailer: new Mailer()
};
