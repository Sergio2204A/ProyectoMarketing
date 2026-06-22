const dotenv = require("dotenv");
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function callGroq(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error("Clave de API de Groq no configurada. Agrégala en el archivo .env como GROQ_API_KEY.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error de API Groq: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const generatedText = data.choices?.[0]?.message?.content;

  if (!generatedText) {
    throw new Error("La respuesta de la IA no contiene texto válido.");
  }

  return generatedText.trim();
}

async function generateCampaignAI(product, goal, audience, channel) {
  const prompt = `
Eres un experto en marketing digital y redactor publicitario estrella.
Genera una campaña publicitaria de alta conversión y estructurada profesionalmente con la siguiente información:

- Producto: ${product}
- Objetivo de la Campaña: ${goal}
- Público Objetivo: ${audience}
- Canal de Distribución: ${channel}

Por favor, estructura tu respuesta utilizando Markdown con emojis atractivos. La estructura debe incluir:
1. **Título de la Campaña** (debe ser llamativo)
2. **Concepto Creativo**: La idea central detrás de la campaña.
3. **Estrategia por Fases**: Breve explicación paso a paso de cómo ejecutarla en el canal ${channel}.
4. **Copy Persuasivo**: Un par de variaciones de textos listos para usar (uno emocional, uno directo a la acción).
5. **Hashtags Clave**: Una lista de 5-7 hashtags estratégicos.
  `;
  return await callGroq(prompt);
}

async function generateCopyAI(product, audience) {
  const prompt = `
Eres un copywriter profesional experto en neuro-ventas.
Crea 3 variaciones de copys publicitarios persuasivos, atractivos y listos para publicar en redes sociales para promocionar el producto/servicio: "${product}".
El público objetivo al que te diriges es: "${audience}".

Usa una de las siguientes fórmulas clásicas de copywriting para cada variación y nómbrala antes de presentarla (ej: "Variación 1 (Fórmula AIDA)"):
- Variación 1: Fórmula AIDA (Atención, Interés, Deseo, Acción)
- Variación 2: Fórmula PAS (Problema, Agitación, Solución)
- Variación 3: Fórmula del Beneficio Principal (Directo al grano, muy visual)

Usa emojis, espaciados limpios y llamadas a la acción (CTA) súper atractivas.
  `;
  return await callGroq(prompt);
}

async function generateHashtagsAI(product) {
  const prompt = `
Genera una lista de hashtags relevantes, populares y estratégicos en redes sociales para promocionar el siguiente producto o tema: "${product}".
Incluye una mezcla de hashtags de gran alcance (genéricos) y hashtags de nicho (específicos).

IMPORTANTE: Devuelve ÚNICAMENTE los hashtags separados por espacios en una sola línea (por ejemplo: #Marketing #Publicidad #Ventas). No agregues introducciones, numeraciones, explicaciones ni comentarios de ningún tipo.
  `;
  return await callGroq(prompt);
}

async function generateCalendarAI(product, platform, goal) {
  const prompt = `
Eres un estratega de contenido de redes sociales experto.
Genera un calendario de contenidos semanal (de lunes a domingo, exactamente 7 días) para promocionar el producto/servicio: "${product}".
La plataforma para la que se creará es: "${platform}".
El objetivo principal del calendario es: "${goal}".

Debes devolver obligatoriamente un array JSON con exactamente 7 objetos (uno para cada día de lunes a domingo), siguiendo estrictamente este esquema de propiedades:
[
  {
    "day": "Lunes",
    "topic": "Tema de hoy",
    "caption": "Copy persuasivo listo para publicar con emojis y hashtags integrados",
    "visualIdea": "Descripción detallada de la imagen, gráfico o video corto a usar",
    "bestTime": "Hora recomendada de publicación"
  }
]

IMPORTANTE: Devuelve ÚNICAMENTE el array JSON válido. No incluyas explicaciones previas ni posteriores, ni bloques de código de markdown como \`\`\`json. Solo el texto crudo del JSON.
  `;
  return await callGroq(prompt);
}

async function generateTrendsAI(topic) {
  const prompt = `
Eres un experto en marketing digital y tendencias en redes sociales.
Analiza el siguiente nicho o tema: "${topic}" y genera exactamente 6 tendencias actuales y relevantes de marketing digital para ese sector.

Devuelve ÚNICAMENTE un array JSON válido con exactamente 6 objetos, sin explicaciones previas ni bloques de código markdown. Sigue estrictamente este esquema:
[
  {
    "title": "Título corto y llamativo de la tendencia",
    "description": "Descripción de 2-3 oraciones explicando la tendencia, su impacto y cómo aplicarla.",
    "color": "#a5b4fc"
  }
]

Usa colores variados y atractivos en hexadecimal para el campo color. Ejemplos: #a5b4fc, #38bdf8, #34d399, #fb923c, #f472b6, #facc15.
  `;
  const raw = await callGroq(prompt);
  const clean = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(clean);
}

module.exports = {
  generateCampaignAI,
  generateCopyAI,
  generateHashtagsAI,
  generateCalendarAI,
  generateTrendsAI,
};
