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

async function generateCampaignAI(product, goal, audience, channel, country, region) {
  const locationContext = country
    ? `- País objetivo: ${country}${region ? `\n- Región específica: ${region}` : ""}`
    : "";

  const locationInstruction = region
    ? `IMPORTANTE: Adapta completamente el tono, los modismos, las referencias culturales y el lenguaje al estilo propio de la región "${region}" dentro de ${country || "ese país"}. El contenido debe sentirse 100% local y auténtico para esa región.`
    : country
    ? `IMPORTANTE: Adapta el tono y las referencias culturales para resonar con el público de ${country}.`
    : "";

  const prompt = `
Eres un experto en marketing digital y redactor publicitario estrella.
Genera una campaña publicitaria de alta conversión y estructurada profesionalmente con la siguiente información:

- Producto: ${product}
- Objetivo de la Campaña: ${goal}
- Público Objetivo: ${audience}
- Canal de Distribución: ${channel}
${locationContext}

${locationInstruction}

Por favor, estructura tu respuesta utilizando Markdown con emojis atractivos. La estructura debe incluir:
1. **Título de la Campaña** (debe ser llamativo)
2. **Concepto Creativo**: La idea central detrás de la campaña.
3. **Estrategia por Fases**: Breve explicación paso a paso de cómo ejecutarla en el canal ${channel}.
4. **Copy Persuasivo**: Un par de variaciones de textos listos para usar (uno emocional, uno directo a la acción).
5. **Hashtags Clave**: Una lista de 5-7 hashtags estratégicos.
  `;
  return await callGroq(prompt);
}

async function generateCopyAI(product, audience, country, region) {
  const locationContext = country
    ? `- País objetivo: ${country}${region ? `\n- Región específica: ${region}` : ""}`
    : "";

  const locationInstruction = region
    ? `IMPORTANTE: Escribe en el tono, jerga y estilo cultural propio de la región "${region}"${country ? ` en ${country}` : ""}. Usa expresiones, modismos y referencias que resuenen específicamente con esa región.`
    : country
    ? `IMPORTANTE: Adapta el lenguaje y tono para conectar culturalmente con el público de ${country}.`
    : "";

  const prompt = `
Eres un copywriter profesional experto en neuro-ventas.
Crea 3 variaciones de copys publicitarios persuasivos, atractivos y listos para publicar en redes sociales para promocionar el producto/servicio: "${product}".
El público objetivo al que te diriges es: "${audience}".
${locationContext}

${locationInstruction}

Usa una de las siguientes fórmulas clásicas de copywriting para cada variación y nómbrala antes de presentarla (ej: "Variación 1 (Fórmula AIDA)"):
- Variación 1: Fórmula AIDA (Atención, Interés, Deseo, Acción)
- Variación 2: Fórmula PAS (Problema, Agitación, Solución)
- Variación 3: Fórmula del Beneficio Principal (Directo al grano, muy visual)

Usa emojis, espaciados limpios y llamadas a la acción (CTA) súper atractivas.
  `;
  return await callGroq(prompt);
}

async function generateHashtagsAI(product, country, region) {
  const locationInstruction = region
    ? `Incluye hashtags locales y populares específicos de la región "${region}"${country ? ` en ${country}` : ""}, además de los genéricos. Los hashtags regionales deben reflejar la cultura y terminología propia de esa zona.`
    : country
    ? `Incluye hashtags populares y relevantes usados en ${country}, además de los internacionales.`
    : "Incluye una mezcla de hashtags de gran alcance (genéricos) y hashtags de nicho (específicos).";

  const prompt = `
Genera una lista de hashtags relevantes, populares y estratégicos en redes sociales para promocionar el siguiente producto o tema: "${product}".
${locationInstruction}

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

async function generateVideoScriptAI(product, format, duration, goal, audience, country, region) {
  const locationContext = country
    ? `- País objetivo: ${country}${region ? `\n- Región específica: ${region}` : ""}`
    : "";

  const locationInstruction = region
    ? `Adapta el tono, expresiones y referencias culturales al estilo propio de "${region}"${country ? ` en ${country}` : ""}.`
    : country
    ? `Adapta el lenguaje y referencias para conectar con el público de ${country}.`
    : "";

  const prompt = `
Eres un director creativo y guionista de video viral especializado en redes sociales.
Crea un script de video completo y listo para grabar con esta información:

- Producto/Servicio: ${product}
- Formato: ${format}
- Duración objetivo: ${duration}
- Objetivo del video: ${goal}
- Público objetivo: ${audience}
${locationContext}

${locationInstruction}

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta, sin explicaciones ni bloques markdown:
{
  "hook": "Frase de apertura que engancha en los primeros 3 segundos (impactante e intrigante)",
  "scenes": [
    {
      "time": "0-5s",
      "visual": "Descripción detallada de lo que se ve en cámara",
      "narration": "Lo que dice el locutor o el texto en pantalla",
      "transition": "Tipo de corte o transición (ej: corte seco, zoom rápido, fade)"
    }
  ],
  "caption": "Caption completo listo para publicar con emojis y hashtags integrados",
  "cta": "Llamada a la acción final para mostrar en pantalla o decir al cierre",
  "musicTip": "Tipo de música o sonido recomendado (ej: beat energético, música lo-fi, trending audio)",
  "productionTips": "3 consejos rápidos de producción separados por punto y coma"
}

Genera entre 4 y 7 escenas según la duración. Que sea viral, profesional y que enganche desde el primer segundo.
`;
  const raw = await callGroq(prompt);
  const clean = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(clean);
}

async function generateVideoScriptChatAI(messages, context) {
  const { product, format, duration, goal, audience, country, region } = context;
  const locationCtx = country ? `- País: ${country}${region ? `, región: ${region}` : ""}` : "";

  const systemPrompt = `Eres un director creativo y guionista de video viral especializado en marketing. Estás ayudando a un equipo de marketing a crear y refinar scripts de video.

Contexto del proyecto:
- Producto/Servicio: ${product || "por definir"}
- Formato: ${format || "Reel de Instagram"}
- Duración: ${duration || "30 segundos"}
- Objetivo: ${goal || "generar engagement"}
- Audiencia: ${audience || "público general"}
${locationCtx}

REGLAS:
1. Si el usuario pide crear un script nuevo O refinarlo/modificarlo, responde ÚNICAMENTE con el JSON válido del script (sin texto antes ni después, sin bloques markdown).
2. Si el usuario hace una pregunta general, pide consejo o saluda, responde como texto normal.
3. Cuando respondas con JSON, aplica TODOS los cambios solicitados y devuelve el script COMPLETO actualizado.

Estructura JSON obligatoria para scripts:
{"hook":"...","scenes":[{"time":"0-5s","visual":"...","narration":"...","transition":"..."}],"caption":"...","cta":"...","musicTip":"...","productionTips":"tip1; tip2; tip3"}

Genera entre 4 y 7 escenas según la duración.`;

  if (!GROQ_API_KEY) throw new Error("Clave de API de Groq no configurada.");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Error Groq: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("La IA no devolvió contenido.");

  try {
    const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
    const script = JSON.parse(clean);
    return { type: "script", script };
  } catch {
    return { type: "text", text };
  }
}

async function refineContentAI(type, input, originalOutput) {
  const typeLabels = { campaign: "campaña publicitaria", copy: "copy publicitario", hashtag: "set de hashtags" };
  const typeLabel = typeLabels[type] || "contenido de marketing";

  const outputText = Array.isArray(originalOutput)
    ? originalOutput.join(" ")
    : typeof originalOutput === "object"
    ? JSON.stringify(originalOutput)
    : originalOutput;

  const inputContext = Object.entries(input || {})
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const prompt = `
Eres un director creativo de marketing con 20 años de experiencia en marcas globales.
Se te entrega una ${typeLabel} que fue generada previamente. Tu misión es PERFECCIONARLA:
hazla más persuasiva, más profesional, con mejor estructura, más memorable y de mayor impacto.

CONTEXTO DEL PROYECTO:
${inputContext}

VERSIÓN ORIGINAL (mejora esto):
${outputText}

INSTRUCCIONES:
- Mantén el mismo producto, objetivo y audiencia
- Eleva el nivel creativo y la persuasión significativamente
- Mejora el flujo, la estructura y el impacto emocional
- Si es un copy, hazlo más directo y con mejor CTA
- Si es una campaña, dale más profundidad estratégica
- Si son hashtags, hazlos más virales y con mejor mezcla de alcance
- Devuelve SOLO el contenido mejorado, sin explicaciones ni comentarios
`;

  return await callGroq(prompt);
}

module.exports = {
  generateCampaignAI,
  generateCopyAI,
  generateHashtagsAI,
  generateCalendarAI,
  generateTrendsAI,
  refineContentAI,
  generateVideoScriptAI,
  generateVideoScriptChatAI,
};
