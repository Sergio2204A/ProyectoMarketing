import { jsPDF } from "jspdf";

const ACCENT = [201, 105, 43]; // var(--accent-primary) #c9692b
const INK = [28, 26, 23];
const MUTED = [122, 116, 108];
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

// jsPDF con las fuentes por defecto (Helvetica) no soporta emoji: se ven como caracteres corruptos.
// Los quitamos del texto antes de dibujarlo. También limpiamos los ** de negrita de markdown,
// ya que no se pueden mezclar con texto normal en una misma línea sin un renderer más complejo.
const EMOJI_RE = /[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{2022}]/gu;
const VARIATION_SELECTOR_RE = /\u{FE0F}/gu;
const ZERO_WIDTH_JOINER_RE = /\u{200D}/gu;

function clean(text) {
  return String(text ?? "")
    .replace(EMOJI_RE, "")
    .replace(VARIATION_SELECTOR_RE, "")
    .replace(ZERO_WIDTH_JOINER_RE, "")
    .replace(/\*\*/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

const TYPE_LABELS = {
  campaign: "Campaña de Marketing",
  copy: "Copy Publicitario",
  hashtag: "Hashtags",
  calendar: "Calendario de Contenido",
  video: "Guion de Video",
  trend: "Tendencias de Marketing",
};

function newDoc() {
  return new jsPDF({ unit: "mm", format: "a4" });
}

function drawHeader(doc, typeLabel, product) {
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 12, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("MARKETING AI", MARGIN, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(dateStr, PAGE_W - MARGIN, 8, { align: "right" });

  let y = 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ACCENT);
  doc.text((typeLabel || "Documento").toUpperCase(), MARGIN, y);
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(clean(product) || "Sin título", CONTENT_W);
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 8 + 2;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  return y + 10;
}

function drawFooter(doc, pageNum) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Generado con Marketing AI", MARGIN, PAGE_H - 10);
  doc.text(String(pageNum), PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
}

function ensureSpace(doc, y, needed, state) {
  if (y + needed > PAGE_H - 22) {
    drawFooter(doc, state.page);
    doc.addPage();
    state.page += 1;
    return 24;
  }
  return y;
}

function sectionHeading(doc, y, text, state) {
  y = ensureSpace(doc, y, 14, state);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT);
  doc.text(clean(text).toUpperCase(), MARGIN, y);
  return y + 6;
}

function paragraph(doc, y, text, state, opts = {}) {
  const cleaned = clean(text);
  if (!cleaned) return y;
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(opts.size || 10.5);
  doc.setTextColor(...(opts.color || INK));
  const lines = doc.splitTextToSize(cleaned, CONTENT_W - (opts.indent || 0));
  for (const line of lines) {
    y = ensureSpace(doc, y, 6, state);
    doc.text(line, MARGIN + (opts.indent || 0), y);
    y += (opts.lineHeight || 5.6);
  }
  return y + (opts.gap ?? 3);
}

/** Convierte texto tipo markdown (##, -, **) del resultado de la IA en un PDF con jerarquía real */
function renderMarkdownBlock(doc, y, rawText, state) {
  const lines = String(rawText ?? "").split("\n");
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) { y += 2.5; continue; }

    if (/^#{3}\s+/.test(trimmed)) {
      y = ensureSpace(doc, y, 13, state);
      y = paragraph(doc, y + 1, trimmed.replace(/^#{3}\s+/, ""), state, { bold: true, size: 12.5, gap: 2 });
    } else if (/^#{2}\s+/.test(trimmed)) {
      y = ensureSpace(doc, y, 14, state);
      y = paragraph(doc, y + 2, trimmed.replace(/^#{2}\s+/, ""), state, { bold: true, size: 13.5, color: ACCENT, gap: 2 });
    } else if (/^#\s+/.test(trimmed)) {
      y = ensureSpace(doc, y, 15, state);
      y = paragraph(doc, y + 2, trimmed.replace(/^#\s+/, ""), state, { bold: true, size: 15, color: ACCENT, gap: 3 });
    } else if (/^\d+\.\s+/.test(trimmed)) {
      y = paragraph(doc, y, trimmed, state, { indent: 3, gap: 2 });
    } else if (/^[-*]\s+/.test(trimmed)) {
      y = paragraph(doc, y, `•  ${trimmed.replace(/^[-*]\s+/, "")}`, state, { indent: 3, gap: 2 });
    } else {
      y = paragraph(doc, y, trimmed, state, { gap: 3 });
    }
  }
  return y;
}

/**
 * Exporta contenido generado por la IA a un PDF con formato profesional.
 * content puede ser: string con formato markdown, array de strings (hashtags),
 * o array de objetos de calendario ({day, topic, caption, time}).
 */
export function exportResultToPDF({ type, product, content }) {
  const doc = newDoc();
  const state = { page: 1 };
  let y = drawHeader(doc, TYPE_LABELS[type] || type, product);

  if (Array.isArray(content) && content.length && typeof content[0] === "object" && content[0] !== null) {
    // Calendario: [{ day, topic, caption, time }]
    content.forEach((item, i) => {
      y = ensureSpace(doc, y, 20, state);
      y = sectionHeading(doc, y, item.day || `Día ${i + 1}`, state);
      if (item.topic) y = paragraph(doc, y, item.topic, state, { bold: true });
      if (item.caption) y = paragraph(doc, y, item.caption, state);
      if (item.time) y = paragraph(doc, y, `Horario sugerido: ${item.time}`, state, { size: 9, color: MUTED, gap: 6 });
    });
  } else if (Array.isArray(content)) {
    // Hashtags u otra lista simple
    y = paragraph(doc, y, content.map(clean).join("   "), state, { color: ACCENT, bold: true });
  } else {
    y = renderMarkdownBlock(doc, y, content, state);
  }

  drawFooter(doc, state.page);
  doc.save(`${(type || "documento")}-${slug(product)}-${Date.now()}.pdf`);
}

/** Exporta un guion de video estructurado (hook, escenas, caption, cta, música, tips) */
export function exportVideoScriptToPDF({ product, script }) {
  const doc = newDoc();
  const state = { page: 1 };
  let y = drawHeader(doc, "Guion de Video", product);

  y = sectionHeading(doc, y, "Hook", state);
  y = paragraph(doc, y, script.hook, state, { bold: true, size: 12, gap: 6 });

  y = sectionHeading(doc, y, `Escenas (${script.scenes?.length || 0})`, state);
  (script.scenes || []).forEach((s, i) => {
    y = ensureSpace(doc, y, 22, state);
    y = paragraph(doc, y, `Escena ${i + 1} — ${s.time || ""}`, state, { bold: true, size: 9.5, gap: 1.5 });
    y = paragraph(doc, y, `Visual: ${s.visual || ""}`, state, { indent: 4, size: 9.5, gap: 1 });
    y = paragraph(doc, y, `Narración: ${s.narration || ""}`, state, { indent: 4, size: 9.5, gap: 1 });
    if (s.transition) y = paragraph(doc, y, `Transición: ${s.transition}`, state, { indent: 4, size: 9, color: MUTED, gap: 5 });
  });

  y = sectionHeading(doc, y, "Caption", state);
  y = paragraph(doc, y, script.caption, state, { gap: 6 });

  y = sectionHeading(doc, y, "Llamado a la acción", state);
  y = paragraph(doc, y, script.cta, state, { bold: true, gap: 6 });

  if (script.musicTip) {
    y = sectionHeading(doc, y, "Música", state);
    y = paragraph(doc, y, script.musicTip, state, { gap: 6 });
  }

  if (script.productionTips) {
    y = sectionHeading(doc, y, "Tips de producción", state);
    String(script.productionTips).split(";").forEach((tip) => {
      if (tip.trim()) y = paragraph(doc, y, `•  ${tip.trim()}`, state, { size: 9.5, gap: 2 });
    });
  }

  drawFooter(doc, state.page);
  doc.save(`video-script-${slug(product)}-${Date.now()}.pdf`);
}

function slug(text) {
  return String(text || "documento")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "documento";
}
