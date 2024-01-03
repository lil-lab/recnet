const mjml2html = require("mjml");

buildRec = function (title, link, author, description, year, recommenderName) {
  return `<mj-divider border-color="#1A2930" border-width="1px"></mj-divider>
  <mj-text font-size="15px" color="#1A2930" font-family="helvetica" line-height="1.3">
    <a href="${link}" target="_blank" rel="noopener" style="color:#1A2930;font-weight:bold">${title}.</a>
    <span style="font-size:15px; color:grey">${author}.</span>
    <span style="font-size:15px; color:grey">${year}</span>
  </mj-text>
  
  <mj-text font-size="15px" color="#1A2930" font-family="helvetica">
    <span style="font-size:15px; color:#1A2930; font-style: italic">Rec'd by ${recommenderName}: </span>
    ${description}
  </mj-text>`;
};

exports.formatHTML = function (recommendations) {
  let title = "";
  let additionalText = "";

  const recnetLink =
    '<a href="https://www.recnet.io/" target="_blank" rel="noopener" style="color:#1A2930;">Recnet</a>';

  if (recommendations.length === 0) {
    title = `You have no recommendations from your network on ${recnetLink} this week.`;
    additionalText = `<mj-text font-size="15px" color="grey" font-family="helvetica" align="center">
    How about expanding your network? Follow more users <a href="https://www.recnet.io/allUsers" target="_self" rel="noopener" style="color:#1A2930;">here</a>.
    </mj-text>`;
  } else {
    const paperCount =
      recommendations.length === 1
        ? `1 recommendation`
        : `${recommendations.length} recommendations`;
    title = `You have ${paperCount} from ${recnetLink} this week!`;
  }

  let html = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" color="#1A2930" padding-bottom='10px' font-family="helvetica" align="center">${title}</mj-text>
        ${additionalText}       
          <mj-text font-size="15px" color="grey" font-family="helvetica" align="center">Read an interesting paper?</mj-text>
          <mj-button font-family="Helvetica" background-color="#F7CE3E" color="white" href="https://www.recnet.io/" target="_self" rel="noopener">
            Share it with your network!
          </mj-button>
        `;

  recommendations.forEach(
    (rec) =>
      (html += buildRec(
        rec["title"],
        rec["link"],
        rec["author"],
        rec["description"],
        rec["year"],
        rec["recommenderName"]
      ))
  );

  html += `
      </mj-column>
    </mj-section>
    <mj-section>
      <mj-column>
        <mj-divider border-color="#1A2930"></mj-divider>
        <mj-text font-size="12px" color="grey" font-family="helvetica">*Please reply directly to this email if you see an error. Thank you! </mj-text>
      </mj-column>
    </mj-section>
    </mj-body>
    </mjml>
    `;

  const htmlOutput = mjml2html(html);
  return htmlOutput.html;
};
