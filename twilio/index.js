const twilio = require('twilio');
const environment = require('../environment');

class TwilioPlugin {
  constructor () {
    this.client = twilio(environment.TWILIO_ACCOUNT_SID, environment.TWILIO_AUTH_TOKEN);
  }

  async sendMessage (body, to) {
    // get the twilio number
    const from = await environment.TWILIO_NUMBER;

    console.warn('from', from);

    // send the message
    const message = await this.client.messages.create({
      body,
      from,
      to
    });

    return message.sid;
  }
};

module.exports = {
  twilio: new TwilioPlugin()
};
