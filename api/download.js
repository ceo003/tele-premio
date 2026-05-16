export default function handler(req, res) {
  const pdfLink = 'https://drive.google.com/file/d/1Vzbxp6dd6gERugcoKrnNdieGS-YPJzu7/view?usp=sharing';
  res.redirect(302, pdfLink);
}
