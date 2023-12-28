const mjml2html = require("mjml");

buildRec = function (title, link, author, description) {
  return ` <mj-divider border-color="#1A2930"></mj-divider>
  <mj-text font-size="20px" color="#1A2930" font-family="helvetica">
    <a href="${link}" target="_blank" rel="noopener" style="color:#1A2930;">${title}</a>
  </mj-text>
  <mj-text font-size="15px" color="grey" font-family="helvetica">${author}</mj-text>
  <mj-text font-size="15px" color="#1A2930" font-family="helvetica">${description}</mj-text> `;
};

exports.formatHTML = function (recommendations) {
  let html = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        `;

  if (recommendations.length === 0) {
    html += `
        <mj-text font-size="20px" color="#1A2930" padding-bottom='20px' font-family="helvetica" align="center">Your recommendation list is empty this week.</mj-text>
        <mj-button font-family="Helvetica" background-color="#F7CE3E" color="white" href="https://www.recnet.io/" target="_self" rel="noopener">
        Explore more on Recnet!
        </mj-button>`;
  } else {
    const paperCount =
      recommendations.length === 1
        ? `1 paper`
        : `${recommendations.length} papers`;
    html += `
      <mj-text font-size="20px" color="#1A2930" padding-bottom='20px' font-family="helvetica" align="center">Your network recommended ${paperCount} this week!</mj-text>
      <mj-button font-family="Helvetica" background-color="#F7CE3E" color="white" href="https://www.recnet.io/" target="_self" rel="noopener">
        Check them out on Recnet!
      </mj-button>`;
  }

  recommendations.forEach(
    (rec) =>
      (html += buildRec(
        rec["title"],
        rec["link"],
        rec["author"],
        rec["description"]
      ))
  );

  html += `
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-divider border-color="#1A2930"></mj-divider>
        <mj-text font-size="12px" color="grey" font-family="helvetica">Note: This is the very first Recnet weekly email digest :) Please reply directly to this email if you see an error. Thank you! </mj-text>
      </mj-column>
    </mj-section>
    </mj-body>
    </mjml>
    `;

  const htmlOutput = mjml2html(html);
  return htmlOutput.html;
};
