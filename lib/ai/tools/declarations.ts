import { Type } from "@google/genai";

export const getMarketPriceDeclaration = {
  name: "get_market_price",
  description:
    "Get the latest market price for a supported financial instrument. Use this whenever the user asks for the current price, latest price, today's price, bid, ask, or market quote for gold, crypto, or forex.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      symbol: {
        type: Type.STRING,
        description:
          "Trading symbol. Examples: XAU/USD for gold, EUR/USD, EUR/JPY, BTC/USD, ETH/USD.",
      },
    },
    required: ["symbol"],
  },
};

export const getLatestMarketNewsDeclaration = {
  name: "get_latest_market_news",
  description:
    "Get the latest financial market news from Marketaux. Use this whenever the user asks for market news, latest news, today's financial news, forex news, currency news, or recent market updates. For a general market-news request, call this tool immediately without asking the user to choose an asset class.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const getTradeProKnowledgeDeclaration = {
  name: "get_tradepro_knowledge",
  description:
    "Get verified, controlled information about TradePro products and operations. Always use this for TradePro-specific questions about account types, registration, deposits, withdrawals, fees, supported platforms, security, support, policies, or platform features. Never answer those questions from general model knowledge.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: {
        type: Type.STRING,
        description:
          "The TradePro product or support topic from the user's question, such as account types, deposits, fees, or security.",
      },
    },
    required: ["topic"],
  },
};

export const getTradingSummaryDeclaration = {
  name: "get_trading_summary",
  description:
    "Get the authenticated user's current TradePro trading balance, currency, total profit, total lots, total swaps, and total open positions. Always use this for questions about the user's own trading balance or trading summary.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};
