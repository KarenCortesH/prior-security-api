const path = require('path');
const fs = require('fs');
const hbs = require('handlebars');
const mjml2html = require('mjml');

const generateHtmlByTemplate = (templateName = '', parameters = {}, helpers = [], isReport = false) => {
  // obtengo ella ruta del template
  const filePath = isReport ? `./reports/${templateName}.hbs` : `./emails/${templateName}.mjml`;
  const templatePath = path.resolve(__dirname, filePath);

  // compile the template
  const template = hbs.compile(fs.readFileSync(templatePath, 'utf8'));

  if (helpers.length) {
    for (const helper of helpers) {
      hbs.registerHelper(helper.name, helper.function);
    }
  }

  // get the result
  const result = template(parameters);

  // get the html
  const html = isReport ? result : mjml2html(result).html;

  return html;
};

module.exports = {
  generateHtmlByTemplate
};
