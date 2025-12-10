import { GoogleGenAI, Type } from "@google/genai";
import { StockData, FinancialHealthData, ValuationData, UploadedFile, ComparisonAnalysis } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to handle Rate Limits (429) with exponential backoff
async function generateContentWithRetry(model: string, contents: any, config?: any, retries: number = 3) {
  const ai = getClient();
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config
      });
    } catch (error: any) {
      lastError = error;
      // Check for 429 (Rate Limit) or 503 (Service Unavailable) or quota messages
      const isTransient = error.status === 429 || error.code === 429 || error.status === 503 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isTransient && i < retries - 1) {
        const delay = 2000 * Math.pow(2, i); // Exponential backoff: 2s, 4s, 8s
        console.warn(`Gemini API busy (Attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

export const fetchStockData = async (tickerInput: string): Promise<StockData[]> => {
  // Use Gemini 2.5 Flash for fast, real-time data retrieval
  try {
    const response = await generateContentWithRetry(
      'gemini-2.5-flash',
      `Find the latest real-time stock price, daily change (absolute and percentage), and market cap for: ${tickerInput}.
      If multiple tickers are provided, return an array of objects.
      Return the data in a strict JSON format (array of objects) with keys: symbol (string), price (number), change (number), changePercent (number), marketCap (string), currency (string).
      
      IMPORTANT: For 'marketCap', return a short string using abbreviations like '3.2T', '150B', '800M' instead of writing out 'Trillion' or 'Billion'.
      
      Do not include markdown formatting.`,
      {
        tools: [{ googleSearch: {} }],
      }
    );

    const text = response.text || '';
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(jsonStr);
    const dataArray = Array.isArray(parsed) ? parsed : [parsed];
    
    return dataArray.map((item: any) => ({
      symbol: item.symbol || tickerInput.toUpperCase(),
      price: item.price || 0,
      change: item.change || 0,
      changePercent: item.changePercent || 0,
      marketCap: item.marketCap || 'N/A',
      currency: item.currency || 'USD',
      lastUpdated: new Date().toLocaleTimeString(),
    }));

  } catch (e) {
    console.error("Failed to parse stock data", e);
    // Fallback data if API fails completely
    return [{
      symbol: tickerInput.toUpperCase(),
      price: 0,
      change: 0,
      changePercent: 0,
      marketCap: 'Unknown',
      currency: 'USD',
      lastUpdated: new Date().toLocaleTimeString(),
    }];
  }
};

export const fetchFinancialAnalysis = async (ticker: string, files: UploadedFile[] = []): Promise<{health: FinancialHealthData, valuation: ValuationData}> => {
  let prompt = `
    Act as a senior investment banker. Analyze the company ${ticker}.
    
    1. Financial Health: Provide key metrics for the Balance Sheet (Assets, Liabilities, Equity) and Income Statement (Revenue, Net Income, EBITDA).
    2. Valuation: Estimate a Fair Value price based on a P/E multiple approach. Assume a standard industry P/E or use the actual if known. Compare it to the current market context.
    
    Return the result as a strict JSON object with this schema:
    {
      "health": {
        "balanceSheet": [{"label": "string", "value": "string or number", "trend": "up|down|neutral"}],
        "incomeStatement": [{"label": "string", "value": "string or number", "trend": "up|down|neutral"}],
        "summary": "string (max 2 sentences)"
      },
      "valuation": {
        "peRatio": number,
        "industryAveragePe": number,
        "estimatedFairValue": number,
        "recommendation": "BUY|SELL|HOLD",
        "reasoning": "string (short explanation)"
      }
    }
  `;

  if (files.length > 0) {
    prompt += `\n\nAdditionally, review the attached document(s) labeled "${files.map(f => f.name).join(', ')}" and incorporate any relevant financial insights found within them into your analysis logic.`;
  }

  const parts: any[] = [{ text: prompt }];
  
  files.forEach(file => {
      parts.push({
          inlineData: {
              mimeType: file.mimeType,
              data: file.data
          }
      });
  });

  const response = await generateContentWithRetry(
    'gemini-2.5-flash',
    { parts },
    {
      thinkingConfig: { thinkingBudget: 2048 },
      responseMimeType: 'application/json',
    }
  );

  const text = response.text || '{}';
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse analysis", e);
    throw new Error("Could not generate analysis.");
  }
};

export const fetchComparisonAnalysis = async (tickers: string[]): Promise<ComparisonAnalysis> => {
  const prompt = `
    Act as a senior investment banker. Compare the following companies: ${tickers.join(', ')}.
    
    Provide a comparative table of key financial metrics (Price, Market Cap, P/E Ratio, Dividend Yield, Revenue Growth, Net Profit Margin).
    
    Crucially, provide an 'executiveSummary' array containing 3-5 concise, high-impact bullet points summarizing the market comparison trends, relative performance, and key takeaways from the chart data you would expect to see.
    
    Return the result as a strict JSON format. Do not include extra text outside the JSON.
    Schema:
    {
      "table": [
        { "metric": "Price", "${tickers[0]}": "...", "${tickers[1]}": "..." } 
        // ... (repeat for other metrics and dynamic ticker keys)
      ],
      "summary": "Comparative summary (max 3 sentences)",
      "executiveSummary": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
      "winner": "Name of the preferred investment choice"
    }
    Ensure the JSON structure uses the exact ticker symbols provided as keys in the table objects.
  `;

  // Note: responseMimeType is NOT supported when tools are present.
  const response = await generateContentWithRetry(
    'gemini-2.5-flash',
    prompt,
    {
        thinkingConfig: { thinkingBudget: 2048 },
        tools: [{ googleSearch: {} }],
    }
  );

  const text = response.text || '{}';
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse comparison", e);
    throw new Error("Could not generate comparison.");
  }
};

export const askAiBanker = async (ticker: string, prompt: string, context?: any): Promise<string> => {
  const fullPrompt = `
    You are a Senior AI Investment Banker specializing in ${ticker}.
    
    Context from previous analysis: ${JSON.stringify(context || {})}
    
    User Question: ${prompt}
    
    Instructions:
    1. If asked for Competitor Analysis or Industry Benchmarks, use Google Search to find current data and compare key metrics (P/E, Revenue Growth, Margins).
    2. If asked for an Investment Recommendation (Buy/Sell/Hold), provide a clear verdict followed by a "Top 5 Insights" list justifying your stance.
    3. Keep responses professional, data-driven, and institutional in tone.
    4. Format output with clear headers and bullet points where appropriate.
  `;

  const response = await generateContentWithRetry(
    'gemini-2.5-flash',
    fullPrompt,
    {
      tools: [{ googleSearch: {} }], 
    }
  );

  return response.text || "I apologize, I couldn't process that request at the moment.";
};