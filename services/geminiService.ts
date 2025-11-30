import { GoogleGenAI, Type } from "@google/genai";
import { StockData, ChartPoint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract basic numbers from text if structured data isn't perfect
const extractPrice = (text: string): number | null => {
  const match = text.match(/\$\s?([0-9,]+\.[0-9]{2})/);
  if (match) return parseFloat(match[1].replace(/,/g, ''));
  return null;
};

const extractChange = (text: string): number | null => {
  // Looks for patterns like +1.23 or -0.50 associated with change
  const match = text.match(/([+-][0-9,]+\.[0-9]{2})/);
  if (match) return parseFloat(match[1].replace(/,/g, ''));
  return null;
};

export const fetchStockOverview = async (symbol: string): Promise<StockData> => {
  try {
    // 1. Use Google Search Grounding to get real-time info
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the current real-time stock price for ${symbol}. 
      Provide a response that includes:
      1. The current price (in USD if applicable).
      2. The change in price today (value and percentage).
      3. The market cap.
      4. A brief 2-3 sentence summary of why it is moving today (news/sentiment).
      
      Ensure the numbers are clearly stated.`,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType is NOT allowed with googleSearch
      },
    });

    const text = response.text || "No data available.";
    
    // Extract Grounding Metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = groundingChunks
      .map((chunk: any) => {
        if (chunk.web) {
          return { title: chunk.web.title, url: chunk.web.uri };
        }
        return null;
      })
      .filter((source: any) => source !== null) as Array<{title: string, url: string}>;

    // Best-effort parsing (Production apps would use a dedicated financial API for numbers, Gemini for insights)
    // We default to 0 if parsing fails, but the summary will be accurate.
    const price = extractPrice(text) || 0;
    const change = extractChange(text) || 0;
    
    // Simple logic to guess percent if not easily regexable, or just mock strictly for the 'changePercent' visual if missing
    // In a real scenario, we'd prompt Gemini to output a specific structure in a second pass, but for speed:
    const changePercent = price !== 0 ? (change / (price - change)) * 100 : 0;

    return {
      symbol: symbol.toUpperCase(),
      price,
      change,
      changePercent,
      currency: 'USD',
      marketCap: 'N/A', // Hard to regex reliably without structured output, usually in text
      summary: text,
      groundingSources,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw new Error("Failed to fetch stock data.");
  }
};

export const generateIntradayChart = async (symbol: string, currentPrice: number): Promise<ChartPoint[]> => {
  try {
    // 2. Generate simulated chart data that looks realistic based on the current price
    // We use a separate call with JSON schema to get clean data for Recharts
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a JSON array of 30 data points representing the intraday stock price movement for ${symbol} leading up to the current price of ${currentPrice}.
      The data should simulate a realistic trading pattern (volatility, trends) for the last few hours.
      Return ONLY the JSON array.
      Format: { "time": "HH:MM", "price": number }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              price: { type: Type.NUMBER },
            },
            required: ["time", "price"],
          },
        },
      },
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as ChartPoint[];
  } catch (error) {
    console.error("Chart Generation Error:", error);
    // Fallback data
    return Array.from({ length: 30 }, (_, i) => ({
      time: `${10 + Math.floor(i / 6)}:${(i % 6) * 10}`.replace(/:0$/, ':00'),
      price: currentPrice + (Math.random() - 0.5) * 5,
    }));
  }
};