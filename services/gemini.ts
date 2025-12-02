import Groq from "groq-sdk";
import { UserProfile } from "../types";

// Initialize Groq client
// dangerouslyAllowBrowser is required for client-side apps. 
// Ideally in a published extension, this logic moves to a background script.
const groq = new Groq({ 
  apiKey: process.env.API_KEY, 
  dangerouslyAllowBrowser: true 
});

/**
 * Generates a context-aware reply to a public comment using Groq (Llama 3).
 */
export const generateCommentReply = async (
  postContent: string,
  userComment: string,
  userName: string,
  userProfile: UserProfile,
  customContext?: string
): Promise<string> => {
  try {
    const systemPrompt = `
      You are ${userProfile.name}, a ${userProfile.title}.
      
      YOUR PROFILE:
      Bio: ${userProfile.bio}
      Writing Style: ${userProfile.writingStyle}
      
      INSTRUCTIONS:
      1. Be helpful, authentic, and concise (under 30 words).
      2. Strictly follow the "Writing Style" defined above.
      3. Do NOT sound robotic or like a customer support bot.
      4. ${customContext ? `Additional Goal: ${customContext}` : ''}
      
      Return ONLY the reply text.
    `;

    const userMessage = `
      CONTEXT:
      My Post: "${postContent}"
      User Comment (${userName}): "${userComment}"
      
      Write a reply to this comment.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "llama3-70b-8192", // High quality, fast, free tier available
      temperature: 0.7,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content?.trim() || "Thanks for the comment!";
  } catch (error) {
    console.error("Groq AI Error:", error);
    return "Thanks for the comment! (AI Error)";
  }
};

/**
 * Generates a private DM message to deliver an asset.
 */
export const generateDMMessage = async (
  userName: string,
  assetName: string,
  assetUrl: string,
  userProfile: UserProfile
): Promise<string> => {
  try {
    const systemPrompt = `You are ${userProfile.name}. Style: ${userProfile.writingStyle}`;
    
    const userMessage = `
      TASK:
      Write a direct message (DM) to ${userName} sending them a file they requested.
      
      FILE DETAILS:
      Name: ${assetName}
      URL: ${assetUrl}
      
      INSTRUCTIONS:
      1. Keep it super short and friendly (1-2 sentences).
      2. Mention that here is the ${assetName} they asked for.
      3. IMPORTANT: You MUST include the exact URL (${assetUrl}) at the very end of the message.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content?.trim() || `Hey ${userName}, here is the link you asked for: ${assetUrl}`;
  } catch (error) {
    console.error("Groq AI Error:", error);
    return `Hey ${userName}, here is the link you asked for: ${assetUrl}`;
  }
};