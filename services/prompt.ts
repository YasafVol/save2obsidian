
const obsidianMarkdownRules = `
---
OBSIDIAN MARKDOWN RULES:
1.  **Tags**: Tags must be single words. For multi-word concepts, use camelCase (e.g., "artificialIntelligence") or kebab-case (e.g., "artificial-intelligence"). Tags must NOT contain spaces.
2.  **Title**: The title will be used as a filename. Do not include characters that are invalid in filenames, such as '/', '\\', ':', '*', '?', '"', '<', '>', '|'.
3.  **Content**: Use standard Markdown for all text fields. For bulleted lists (like in the 'tldr' and 'references' fields), use a hyphen '-' followed by a space.
---
`;

export const createPrompt = (videoUrl: string, channelName:string): string => `
You are an expert assistant for creating knowledge notes in Obsidian.
Based on the content of the YouTube video at this URL: ${videoUrl}, and with the creator being '${channelName}', please generate the note content.

Your response MUST be a structured JSON object that strictly adheres to the provided schema.

You MUST also follow these specific Obsidian formatting rules to ensure compatibility:
${obsidianMarkdownRules}

Now, generate the note for the video.
`;
