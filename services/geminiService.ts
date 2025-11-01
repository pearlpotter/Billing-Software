
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const getAi = () => {
  if (!API_KEY) return null;
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateProductDescription = async (productName: string): Promise<string> => {
  const ai = getAi();
  if (!ai) return "AI service is not available.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, catchy, and professional product description for: "${productName}". Keep it under 15 words.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating product description:", error);
    return "Failed to generate description.";
  }
};

export const getSalesInsights = async (salesData: string): Promise<string> => {
    const ai = getAi();
    if (!ai) return "AI service is not available.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Analyze the following sales data and provide 3 actionable insights to improve sales. Be concise. Data: ${salesData}`,
            config: {
              systemInstruction: "You are a business analyst expert in retail and wholesale markets."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating sales insights:", error);
        return "Failed to generate insights.";
    }
};
