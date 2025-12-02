import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a context-aware reply to a public comment.
 */
export const generateCommentReply = async (
  postContent: string,
  userComment: string,
  userName: string,
  userProfile: UserProfile,
  customContext?: string
): Promise<string> => {
  try {
    const prompt = `
      You are ${userProfile.name}, a ${userProfile.title}.
      
      YOUR PROFILE:
      Bio: ${userProfile.bio}
      Writing Style: ${userProfile.writingStyle}
      
      TASK:
      Write a reply to a comment on your LinkedIn post.
      
      CONTEXT:
      My Post: "${postContent}"
      User Comment (${userName}): "${userComment}"
      
      INSTRUCTIONS:
      1. Be helpful, authentic, and concise (under 30 words).
      2. Strictly follow the "Writing Style" defined above.
      3. Do NOT sound robotic or like a customer support bot.
      4. ${customContext ? `Additional Goal: ${customContext}` : ''}
      
      Reply text only:
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Thanks for the comment!";
  } catch (error) {
    console.error("AI Error:", error);
    return "Thanks for the comment! (AI Error)";
  }
};

/**
 * Generates a private DM message to deliver an asset.
 * Crucial: We ask the AI to include the URL so our UI can detect it,
 * but the UI will strip it visually to show a Rich Card instead.
 */
export const generateDMMessage = async (
  userName: string,
  assetName: string,
  assetUrl: string,
  userProfile: UserProfile
): Promise<string> => {
  try {
    const prompt = `
      You are ${userProfile.name}.
      
      TASK:
      Write a direct message (DM) to ${userName} sending them a file they requested.
      
      FILE DETAILS:
      Name: ${assetName}
      URL: ${assetUrl}
      
      INSTRUCTIONS:
      1. Keep it super short and friendly (1-2 sentences).
      2. Mention that here is the ${assetName} they asked for.
      3. IMPORTANT: You MUST include the exact URL (${assetUrl}) at the very end of the message.
      4. Style: ${userProfile.writingStyle}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || `Hey ${userName}, here is the link you asked for: ${assetUrl}`;
  } catch (error) {
    console.error("AI Error:", error);
    return `Hey ${userName}, here is the link you asked for: ${assetUrl}`;
  }
};