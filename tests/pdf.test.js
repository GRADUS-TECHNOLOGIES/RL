import test from 'node:test';
import assert from 'node:assert/strict';
import { getDocument } from '../client/node_modules/pdfjs-dist/legacy/build/pdf.mjs';

function fixturePdf() {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length 42 >>\nstream\nBT /F1 12 Tf 20 100 Td (Revista) Tj ET\nendstream',
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  for (const [i, object] of objects.entries()) { offsets.push(pdf.length); pdf += `${i+1} 0 obj\n${object}\nendobj\n`; }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

test('PDF.js abre un PDF de muestra y extrae su contenido', async () => {
  const document = await getDocument({ data: fixturePdf(), useSystemFonts: true }).promise;
  assert.equal(document.numPages, 1);
  const page = await document.getPage(1);
  assert.ok((await page.getTextContent()).items.some(item => item.str.includes('Revista')));
  await document.destroy();
});
