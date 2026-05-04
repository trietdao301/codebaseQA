import dotenv from "dotenv";
dotenv.config();

import { OpenAI } from "openai";

import { ChatOpenAI } from "@langchain/openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const model = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});
