import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateChatResponse = async (history: { role: string; parts: { text: string }[] }[], message: string) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are CompCharity Assistant, a helpful AI dedicated to helping users donate or resell their old technology for charity. You can answer questions about the donation process, the types of devices we accept, how we secure data, and the impact of their contributions. Be professional, encouraging, and informative.",
    },
  });

  // The SDK expects history in a specific format if we were using it directly, 
  // but for simplicity with the current sendMessage call, we'll just send the message.
  // Actually, the SDK's chat.sendMessage handles the history if we use the same chat instance.
  // Since we are likely recreating it or passing history, let's use generateContent for a more stateless approach if needed, 
  // or manage the chat instance.
  
  // For a stateless React component, we can pass the full conversation as contents.
  const contents = [
    ...history,
    { role: "user", parts: [{ text: message }] }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents,
  });

  return response.text;
};

export const analyzeDeviceDescription = async (description: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Provide a professional summary of this technology donation/resale submission for an admin. Highlight key specs and potential value or impact. Data: ${JSON.stringify(submissionData)}`,
  });

  return response.text;
};

export const generateBlogKeyTakeaways = async (content: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
