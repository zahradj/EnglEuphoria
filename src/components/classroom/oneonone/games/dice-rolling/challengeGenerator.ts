
import { DiceResult, DiceConfig } from "./types";

export const generateAIChallenge = (results: DiceResult[], diceConfig: DiceConfig): string => {
  const prompts = results.map(r => r.content);
  
  const challengeTemplates = {
    vocabulary: [
      `Create a sentence using these words: ${prompts.join(', ')}`,
      `Tell a story about something that is ${prompts.join(' and ')}`,
      `Describe ${prompts[0]} using the word ${prompts[1]}`,
      `What's the opposite of ${prompts[0]}? Use ${prompts[1]} in your answer`
    ],
    grammar: [
      `Create a ${prompts[1]} tense ${prompts[0]} about ${prompts[2] || 'your day'}`,
      `Make a ${prompts[2]} using a ${prompts[0]} in ${prompts[1]} tense`,
      `Transform this ${prompts[0]} into ${prompts[1]} form: "I eat breakfast"`,
      `Give an example of a ${prompts[0]} that shows ${prompts[1]} action`
    ],
    story: [
      `Tell a story about a ${prompts[1]} in a ${prompts[0]} who discovers ${prompts[2]}`,
      `Create an adventure where ${prompts[2]} happens in a ${prompts[0]} with a ${prompts[1]}`,
      `What would happen if a ${prompts[1]} brought ${prompts[2]} to a ${prompts[0]}?`,
      `Describe a day when ${prompts[2]} changed everything in the ${prompts[0]} for the ${prompts[1]}`
    ],
    conversation: [
      `Talk about your ${prompts[1]} ${prompts[0]}`,
      `Describe the ${prompts[1]} thing about ${prompts[0]}`,
      `Share a memory about ${prompts[0]} that was ${prompts[1]}`,
      `What makes ${prompts[0]} ${prompts[1]} for you?`
    ]
  };

  const templates = challengeTemplates[diceConfig.type] || challengeTemplates.vocabulary;
  return templates[Math.floor(Math.random() * templates.length)];
};
