import { GoogleGenAI, Type, Modality } from "@google/genai";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "undefined" || key === "") {
    return null;
  }
  return key;
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
  console.warn("GEMINI_API_KEY is missing or invalid. AI features will not work.");
}

export const generateChatResponse = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  if (!ai) throw new Error("AI service not initialized");
  
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: "You are CompCharity Assistant, a helpful AI dedicated to helping users donate or resell their old technology for charity in Ireland. You can answer questions about the donation process, the types of devices we accept, how we secure data, and the impact of their contributions. Use Google Search to provide up-to-date information about local laws, recycling centers, and tech values. Be professional, encouraging, and informative.",
      tools: [{ googleSearch: {} }]
    },
  });

  return response.text;
};

export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
  if (!ai) throw new Error("AI service not initialized");

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: {
      parts: [
        { text: "Transcribe this voice message accurately. If the user is describing a device they want to donate or have collected, focus on capturing the brand, model, condition, and their location if mentioned." },
        { inlineData: { data: base64Audio, mimeType } }
      ]
    }
  });

  return response.text;
};

export const generateSpeech = async (text: string) => {
  if (!ai) throw new Error("AI service not initialized");

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const findDropOffPoints = async (location: string) => {
  if (!ai) throw new Error("AI service not initialized");

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: `Find tech recycling drop-off points or CompCharity hubs near ${location} in Ireland.`,
    config: {
      tools: [{ googleMaps: {} }]
    }
  });

  const text = response.text;
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return { text, groundingChunks };
};

export const analyzeDeviceDescription = async (description: string) => {
  if (!ai) throw new Error("AI service not initialized");

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: `Analyze this device description and suggest the most likely category (Laptop, Smartphone, Tablet, Desktop, Other) and a brief condition assessment (Excellent, Good, Fair, Poor). Description: "${description}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          condition: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        },
        required: ["category", "condition"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
};

export const summarizeSubmission = async (submissionData: any) => {
  if (!ai) throw new Error("AI service not initialized");

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Provide a professional summary of this technology donation/resale submission for an admin. Highlight key specs and potential value or impact. Data: ${JSON.stringify(submissionData)}`,
  });

  return response.text;
};

export const generateBlogKeyTakeaways = async (content: string) => {
  if (!ai) throw new Error("AI service not initialized");

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: `Summarize the following blog post into 3-4 key takeaways for a quick read. Content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};
