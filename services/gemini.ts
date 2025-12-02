import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

// Initialize the client. API Key is assumed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a friendly public reply to a user's comment.
 */
export const generateCommentReply = async (
  postContext: string,
  userComment: string,
  userName: string,
  userProfile: UserProfile,
  customInstruction?: string
): Promise<string> => {
  try {
    const prompt = `
      You are mimicking a specific human on LinkedIn. Do NOT sound like an AI assistant.
      
      YOUR PERSONA:
      Name: ${userProfile.name}
      Job Title: ${userProfile.title}
      Bio/Background: ${userProfile.bio}
      Writing Style: ${userProfile.writingStyle}
      
      CONTEXT:
      Post Content: "${postContext}"
      User Commenting: "${userName}"
      Comment Text: "${userComment}"
      
      TASK:
      Write a reply to the comment.
      
      GUIDELINES:
      - Adopt the writing style defined above strictly.
      - If the style is casual, use lowercase or abbreviations if appropriate.
      - If they asked for a resource, confirm you sent it.
      - Keep it very short (under 20 words).
      - Do NOT use robotic phrases like "I'm thrilled to share" or "Thank you for your engagement".
      - Sound like a busy but friendly human replying on their phone.
      ${customInstruction ? `- Specific Instruction: ${customInstruction}` : ''}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Sent!";
  } catch (error) {
    console.error("Error generating comment reply:", error);
    return "Check your DMs!";
  }
};

/**
 * Generates the DM message content to accompany the file.
 */
export const generateDMMessage = async (
  userName: string,
  assetName: string,
  assetUrl: string,
  userProfile: UserProfile
): Promise<string> => {
  try {
    const prompt = `
      You are ${userProfile.name}. Send a DM to ${userName}.
      
      Context: They commented on your post asking for "${assetName}".
      Resource Link: ${assetUrl}
      
      Style: ${userProfile.writingStyle}
      
      Task: Write the DM. 
      - Keep it personal. 
      - Don't be too salesy. 
      - Just say "Here is that thing you asked for" in your own voice.
      - Include the link.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || `Hey ${userName}, here is the ${assetName}: ${assetUrl}`;
  } catch (error) {
    console.error("Error generating DM:", error);
    return `Hey ${userName}, here is the ${assetName}: ${assetUrl}`;
  }
};