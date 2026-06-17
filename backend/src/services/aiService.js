const dotenv = require("dotenv");
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Llama a la API de Gemini para generar contenido basado en un prompt.
 * @param {string} prompt - El prompt detallado para el modelo.
 * @returns {Promise<string>} - El texto generado.
 */
async function callGemini(prompt, responseType) {
  if (!GEMINI_API_KEY) {
    console.error("API Key de Gemini no encontrada. Por favor configúrala en el archivo .env");
    throw new Error("Clave de API de Gemini no configurada.");
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: responseType ? { responseMimeType: responseType } : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de API Gemini: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("La respuesta de la IA no contiene texto válido.");
    }

    return generatedText.trim();
  } catch (error) {
    console.error("Error en callGemini:", error);
    throw error;
  }
}

/**
 * Genera una campaña estructurada.
 */
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
  return await callGemini(prompt);
}

/**
 * Genera copys persuasivos.
 */
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
  return await callGemini(prompt);
}

/**
 * Genera hashtags limpios.
 */
async function generateHashtagsAI(product) {
  const prompt = `
Genera una lista de hashtags relevantes, populares y estratégicos en redes sociales para promocionar el siguiente producto o tema: "${product}".
Incluye una mezcla de hashtags de gran alcance (genéricos) y hashtags de nicho (específicos).

IMPORTANTE: Devuelve ÚNICAMENTE los hashtags separados por espacios en una sola línea (por ejemplo: #Marketing #Publicidad #Ventas). No agregues introducciones, numeraciones, explicaciones ni comentarios de ningún tipo.
  `;
  return await callGemini(prompt);
}

/**
 * Genera un calendario semanal de contenidos en formato JSON.
 */
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
  },
  ...
]

IMPORTANTE: Devuelve ÚNICAMENTE el array JSON válido. No incluyas explicaciones previas ni posteriores, ni bloques de código de markdown como \`\`\`json. Solo el texto crudo del JSON.
  `;
  return await callGemini(prompt, "application/json");
}

module.exports = {
  generateCampaignAI,
  generateCopyAI,
  generateHashtagsAI,
  generateCalendarAI,
};
