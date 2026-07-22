import { ContentTemplateService } from './contentTemplateService';

// Neuroscientific principles for enhanced learning
export interface NeuroscopicPrinciple {
  name: string;
  trigger: string;
  implementation: string;
  memoryBoost: number; // 1-5 multiplier
}

export interface NeuroEnhancedLesson {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  weekNumber: number;
  dayNumber: number;
  theme: string;
  pages: LessonPage[];
  neuroscientificTriggers: NeuroscopicPrinciple[];
  sentenceConstructionGoals: string[];
  conversationTargets: string[];
  memoryConsolidationTasks: string[];
  attentionSpanOptimization: AttentionSegment[];
}

export interface LessonPage {
  pageNumber: number;
  section: 'introduction' | 'vocabulary' | 'grammar' | 'practice' | 'conversation' | 'assessment';
  content: string;
  neurotrigger?: string;
  interactionType: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  cognitiveLoad: 'low' | 'medium' | 'high';
  estimatedTime: number; // in minutes
}

export interface AttentionSegment {
  minute: number;
  activity: string;
  focus: 'sustained' | 'selective' | 'divided';
  engagement: 'active' | 'passive' | 'interactive';
}

export class NeuroscientificContentService extends ContentTemplateService {
  
  // Neuroscientific principles database
  private neuroscientificPrinciples: NeuroscopicPrinciple[] = [
    {
      name: "Novelty Bias",
      trigger: "Unexpected information or format change",
      implementation: "Start with surprising facts, unusual examples, or story hooks",
      memoryBoost: 4
    },
    {
      name: "Primacy Effect", 
      trigger: "First 3 minutes of learning",
      implementation: "Present key vocabulary and main grammar point immediately",
      memoryBoost: 5
    },
    {
      name: "Recency Effect",
      trigger: "Last 3 minutes of lesson",
      implementation: "Summarize and create conversation using all new elements", 
      memoryBoost: 4
    },
    {
      name: "Emotional Resonance",
      trigger: "Personal connection or strong emotion",
      implementation: "Connect grammar to personal experiences, goals, dreams",
      memoryBoost: 5
    },
    {
      name: "Pattern Recognition",
      trigger: "Repetitive structure with variations",
      implementation: "Same sentence pattern with different vocabulary",
      memoryBoost: 3
    },
    {
      name: "Motor Cortex Activation",
      trigger: "Physical movement during learning",
      implementation: "Gesture-based vocabulary, physical sentence building",
      memoryBoost: 4
    },
    {
      name: "Spaced Repetition",
      trigger: "Timed intervals (1min, 5min, 15min, end)",
      implementation: "Same word/structure appears 4 times in lesson with gaps",
      memoryBoost: 5
    },
    {
      name: "Social Learning",
      trigger: "Peer interaction and validation",
      implementation: "Partner exercises, group conversation practice",
      memoryBoost: 4
    }
  ];

  // Weekly themes for systematic progression
  private weeklyThemes = {
    A1: [
      "Self & Family", "Home & Environment", "Daily Activities", "Food & Meals",
      "Shopping & Money", "Health & Body", "Time & Dates", "Transport",
      "Weather & Seasons", "Hobbies & Free Time", "Work & School", "Travel Basics"
    ],
    A2: [
      "Personal History", "Education & Learning", "Technology & Internet", "Entertainment",
      "Relationships", "Lifestyle & Habits", "Environment & Nature", "Culture & Traditions",
      "Plans & Dreams", "Problems & Solutions", "Opinions & Preferences", "Future Goals"
    ],
    B1: [
      "Career & Ambitions", "Social Issues", "Media & Information", "Innovation & Change",
      "Global Awareness", "Personal Development", "Community & Society", "Ethics & Values",
      "Communication Styles", "Conflict Resolution", "Leadership & Teamwork", "Cultural Exchange"
    ],
    B2: [
      "Professional Skills", "Economic Issues", "Scientific Progress", "Political Systems",
      "Environmental Challenges", "Psychological Insights", "Historical Perspectives", "Artistic Expression",
      "Philosophical Questions", "Social Movements", "Technological Impact", "Global Citizenship"
    ],
    C1: [
      "Strategic Thinking", "Complex Analysis", "Research Methods", "Academic Writing",
      "Critical Evaluation", "Theoretical Frameworks", "Policy Development", "Innovation Management",
      "Cross-cultural Competence", "Ethical Leadership", "Systems Thinking", "Future Planning"
    ],
    C2: [
      "Mastery & Expertise", "Thought Leadership", "Complex Negotiations", "Advanced Discourse",
      "Sophisticated Analysis", "Cultural Nuance", "Intellectual Debate", "Strategic Communication",
      "Philosophical Discourse", "Academic Excellence", "Professional Mastery", "Global Leadership"
    ]
  };

  // Sentence construction progression by level
  private sentenceConstructionGoals = {
    A1: [
      "Subject + Verb (I am, You have)",
      "Subject + Verb + Object (I like apples)",
      "Subject + Verb + Adjective (It is big)",
      "Subject + Verb + Adverb (He walks slowly)"
    ],
    A2: [
      "Present Perfect (I have done)",
      "Past Simple vs Present Perfect",
      "Future with 'going to' and 'will'",
      "Conditional Type 1 (If I have time, I will...)"
    ],
    B1: [
      "Complex past tenses (Past Perfect, Past Continuous)",
      "Reported Speech (He said that...)",
      "Passive Voice (The book was written...)",
      "Conditional Type 2 (If I were rich, I would...)"
    ],
    B2: [
      "Advanced conditionals (mixed, Type 3)",
      "Subjunctive mood (I suggest that he go...)",
      "Complex relative clauses",
      "Advanced passive constructions"
    ],
    C1: [
      "Sophisticated clause combining",
      "Advanced discourse markers",
      "Nuanced modal expressions",
      "Complex hypothetical structures"
    ],
    C2: [
      "Native-like fluency patterns",
      "Idiomatic sophistication",
      "Rhetorical devices",
      "Academic register mastery"
    ]
  };

  generateNeuroEnhancedLesson(
    level: keyof typeof this.weeklyThemes,
    weekNumber: number, 
    dayNumber: number,
    customTheme?: string
  ): NeuroEnhancedLesson {
    
    const themes = this.weeklyThemes[level];
    const theme = customTheme || themes[weekNumber - 1] || themes[0];
    const sentenceGoals = this.sentenceConstructionGoals[level];
    
    // Generate 20 pages with neuroscientific optimization
    const pages: LessonPage[] = this.generate20Pages(level, theme, dayNumber);
    
    return {
      id: `${level}_W${weekNumber}_D${dayNumber}_${Date.now()}`,
      title: `${theme} - Day ${dayNumber}`,
      level,
      weekNumber,
      dayNumber,
      theme,
      pages,
      neuroscientificTriggers: this.selectOptimalTriggers(),
      sentenceConstructionGoals: sentenceGoals,
      conversationTargets: this.generateConversationTargets(level, theme),
      memoryConsolidationTasks: this.generateMemoryTasks(level, theme),
      attentionSpanOptimization: this.generateAttentionSegments()
    };
  }

  private generate20Pages(level: string, theme: string, dayNumber: number): LessonPage[] {
    const pages: LessonPage[] = [];
    
    // Page distribution for optimal 30-minute lesson
    const pageStructure = [
      // Pages 1-3: Hook & Introduction (3 min) - PRIMACY EFFECT
      { section: 'introduction' as const, count: 3, cognitiveLoad: 'low' as const },
      
      // Pages 4-8: Vocabulary Building (7 min) - NOVELTY + MOTOR ACTIVATION  
      { section: 'vocabulary' as const, count: 5, cognitiveLoad: 'medium' as const },
      
      // Pages 9-12: Grammar in Context (6 min) - PATTERN RECOGNITION
      { section: 'grammar' as const, count: 4, cognitiveLoad: 'high' as const },
      
      // Pages 13-16: Practice & Application (8 min) - SOCIAL LEARNING
      { section: 'practice' as const, count: 4, cognitiveLoad: 'medium' as const },
      
      // Pages 17-19: Conversation Focus (4 min) - EMOTIONAL RESONANCE
      { section: 'conversation' as const, count: 3, cognitiveLoad: 'medium' as const },
      
      // Page 20: Assessment & Consolidation (2 min) - RECENCY EFFECT
      { section: 'assessment' as const, count: 1, cognitiveLoad: 'low' as const }
    ];

    let pageNumber = 1;
    
    pageStructure.forEach(({ section, count, cognitiveLoad }) => {
      for (let i = 0; i < count; i++) {
        pages.push({
          pageNumber,
          section,
          content: this.generatePageContent(section, level, theme, pageNumber, dayNumber),
          neurotrigger: this.assignNeurotrigger(section, pageNumber),
          interactionType: this.selectInteractionType(section, pageNumber),
          cognitiveLoad,
          estimatedTime: this.calculatePageTime(section, cognitiveLoad)
        });
        pageNumber++;
      }
    });

    return pages;
  }

  private generatePageContent(
    section: string, 
    level: string, 
    theme: string, 
    pageNumber: number, 
    dayNumber: number
  ): string {
    
    const templates = {
      introduction: {
        1: `🌟 **DAY ${dayNumber}: DISCOVER ${theme.toUpperCase()}!**\n\n**BRAIN TEASER:** Did you know that ${this.generateSurprisingFact(theme)}?\n\n**TODAY'S MISSION:** Build 5 perfect sentences about ${theme} and have 2 real conversations!\n\n**NEUROTIP:** Your brain learns 40% faster when emotionally engaged. Let's make this personal!`,
        
        2: `🎯 **YOUR PERSONAL CONNECTION**\n\nThink about YOUR life and ${theme}:\n• How does ${theme} affect YOUR daily routine?\n• What's YOUR biggest challenge with ${theme}?\n• What's YOUR dream related to ${theme}?\n\n**SHARE:** Turn to someone and explain in 30 seconds why ${theme} matters to YOU.`,
        
        3: `📋 **LESSON ROADMAP**\n\n**VOCABULARY JOURNEY (5 min):**\n5 power words + body movements\n\n**GRAMMAR CONSTRUCTION (6 min):**\nBuild sentences step-by-step\n\n**PRACTICE ZONE (8 min):**\nReal-life scenarios\n\n**CONVERSATION LAB (8 min):**\nSpeak with confidence\n\n**MEMORY LOCK (3 min):**\nSeal it in your brain!`
      },

      vocabulary: {
        1: `📚 **VOCABULARY POWERHOUSE**\n\n**METHOD:** See it ➜ Say it ➜ Move it ➜ Use it\n\n**WORD 1:** ${this.generateContextualWord(theme, level, 1)}\n**GESTURE:** [Specific movement]\n**MEMORY HOOK:** [Personal connection]\n**USE IT:** "In my life, _____ because _____"\n\n**BRAIN RULE:** Repeat each word 3 times with the gesture!`,
        
        2: `🎯 **WORD 2 + SENTENCE BUILDING**\n\n**WORD 2:** ${this.generateContextualWord(theme, level, 2)}\n**PATTERN:** Subject + Verb + This Word\n**EXAMPLES:**\n• I _____ [word] every day\n• My family _____ [word] together\n• People _____ [word] because ____\n\n**YOUR TURN:** Create YOUR sentence using this word!`,
        
        3: `🚀 **VOCABULARY EXPANSION**\n\n**WORDS 3-5:**\n${this.generateContextualWord(theme, level, 3)}\n${this.generateContextualWord(theme, level, 4)}\n${this.generateContextualWord(theme, level, 5)}\n\n**CHALLENGE:** Use ALL 5 words in ONE story about your life!\n\n**TIME:** 2 minutes to create your story\n**SHARE:** Tell someone your story`,
        
        4: `🔄 **SPACED REPETITION ROUND 1**\n\n**QUICK REVIEW:** (No looking back!)\n1. What was Word 1? Show the gesture!\n2. Use Word 2 in a sentence about tomorrow\n3. What's YOUR personal example of Word 3?\n\n**NEUROSCIENCE:** Your brain just strengthened these memories by 300%!\n\n**BONUS:** Teach these 3 words to someone else RIGHT NOW!`,
        
        5: `🎨 **VOCABULARY IN ACTION**\n\n**SCENARIO:** You're explaining ${theme} to a friend from another country.\n\n**MISSION:** Use all 5 new words in your explanation.\n\n**STRUCTURE:**\n"In my country, ${theme} is important because..."\n[Use Word 1 and 2]\n"For example, people..."\n[Use Word 3, 4, and 5]\n\n**PRACTICE:** 90 seconds to perfect your explanation!`
      },

      grammar: {
        1: `⚡ **GRAMMAR CONSTRUCTION LAB**\n\n**TODAY'S BUILDING BLOCK:** ${this.getGrammarFocus(level, dayNumber)}\n\n**VISUAL PATTERN:**\n[Subject] + [${this.getGrammarFocus(level, dayNumber)}] + [Object/Complement]\n\n**EXAMPLE CONSTRUCTION:**\nI + am interested in + ${theme.toLowerCase()}\nYou + have experience with + ${theme.toLowerCase()}\n\n**BUILD IT:** Create 3 sentences using this pattern!`,
        
        2: `🔧 **PATTERN PRACTICE**\n\n**MASTER PATTERN:** ${this.getGrammarFocus(level, dayNumber)}\n\n**GUIDED PRACTICE:**\n1. Complete: "Every day, I _____ ${theme.toLowerCase()} because _____"\n2. Transform: "Yesterday, I _____ ${theme.toLowerCase()}..."\n3. Future: "Next week, I will _____ ${theme.toLowerCase()}..."\n\n**BRAIN TIP:** Say each sentence aloud 3 times for motor memory activation!`,
        
        3: `🎯 **GRAMMAR IN CONTEXT**\n\n**REAL SITUATION:** Describing your relationship with ${theme}\n\n**SENTENCE STARTERS:**\n• "I have been _____ ${theme.toLowerCase()} since..."\n• "My experience with ${theme.toLowerCase()} has been..."\n• "When it comes to ${theme.toLowerCase()}, I usually..."\n\n**COMPLETE:** Finish each sentence with YOUR truth!\n**TIME:** 3 minutes`,
        
        4: `🚀 **ADVANCED CONSTRUCTION**\n\n**COMBINE PATTERNS:**\nGrammar + New Vocabulary + Personal Experience\n\n**CHALLENGE:** Create ONE complex sentence that includes:\n✓ Today's grammar pattern\n✓ At least 3 new vocabulary words  \n✓ Something true about YOUR life\n\n**EXAMPLE STARTER:** "Although I ${this.getGrammarFocus(level, dayNumber).toLowerCase()} ${theme.toLowerCase()}, I believe that..."\n\n**SHARE:** Read your sentence to a partner!`
      },

      practice: {
        1: `🎮 **PRACTICE SCENARIO 1**\n\n**SITUATION:** You're at a [${theme}-related location]\n**ROLE:** You need to [${theme}-related action]\n**PARTNER:** Another student\n\n**MUST USE:**\n✓ Today's grammar pattern (3 times)\n✓ At least 4 new vocabulary words\n✓ Ask 2 questions\n✓ Give 1 personal opinion\n\n**TIME:** 3 minutes\n**SWITCH:** Change roles!`,
        
        2: `💡 **PROBLEM-SOLVING PRACTICE**\n\n**CHALLENGE:** Your friend has a problem related to ${theme}\n\n**YOUR MISSION:**\n1. Listen to their problem (1 min)\n2. Ask clarifying questions (1 min)  \n3. Give advice using today's patterns (2 min)\n\n**LANGUAGE FOCUS:**\n• "If I were you, I would..."\n• "Have you considered..."\n• "In my experience with ${theme.toLowerCase()}..."\n\n**EMOTIONAL CONNECTION:** Make them feel understood!`,
        
        3: `🎭 **ROLE-PLAY THEATER**\n\n**CHARACTERS:**\nPerson A: Expert in ${theme}\nPerson B: Complete beginner\n\n**SCENARIO:** Person B wants to learn everything about ${theme} from Person A\n\n**EXPERT MUST:**\n• Explain using all new vocabulary\n• Use today's grammar patterns\n• Give examples from real life\n\n**BEGINNER MUST:**\n• Ask good questions\n• Repeat key information\n• Share their own related experiences`,
        
        4: `🔥 **SPACED REPETITION ROUND 2**\n\n**MEMORY CHALLENGE:** (No notes allowed!)\n\n**RAPID FIRE:** 30 seconds each\n1. List all 5 vocabulary words with gestures\n2. Create 3 sentences using today's grammar\n3. Explain why ${theme} is important (use new language)\n\n**BRAIN BOOST:** You just activated long-term memory storage!\n\n**PEER CHECK:** Partner confirms you got everything right!`
      },

      conversation: {
        1: `🗣️ **CONVERSATION CONFIDENCE BUILDER**\n\n**WARM-UP:** "Tell me about your experience with ${theme}"\n\n**CONVERSATION STRATEGY:**\n1. Start with personal experience\n2. Ask follow-up questions\n3. Share opinions\n4. Find common ground\n\n**MUST INCLUDE:**\n• All new vocabulary naturally\n• Today's grammar structures\n• At least 3 questions to your partner\n• One surprising fact or story\n\n**TIME:** 4 minutes continuous conversation`,
        
        2: `💬 **DEBATE & DISCUSSION**\n\n**TOPIC:** "The future of ${theme}"\n\n**POSITIONS:**\nOptimist: ${theme} will improve dramatically\nRealist: ${theme} will change slowly\n\n**DEBATE STRUCTURE:**\n1. Opening statements (1 min each)\n2. Questions & challenges (2 min)\n3. Final arguments (30 sec each)\n\n**LANGUAGE ARSENAL:**\n• "I believe that..." / "In my opinion..."\n• "What do you think about...?"\n• "However..." / "On the other hand..."`,
        
        3: `🌟 **STORYTELLING MASTERY**\n\n**CHALLENGE:** Tell a 2-minute story about ${theme} that includes:\n\n**STORY ELEMENTS:**\n✓ A problem or challenge\n✓ What you did about it\n✓ What you learned\n✓ How it changed you\n\n**LANGUAGE GOALS:**\n✓ Use all 5 new vocabulary words\n✓ Include today's grammar patterns  \n✓ Show emotions and opinions\n✓ Engage your listener with questions\n\n**AUDIENCE:** Tell your story to 2 different people!`
      },

      assessment: {
        1: `🎯 **MASTERY CHECK & BRAIN LOCK**\n\n**SELF-ASSESSMENT:**\n\n**VOCABULARY MASTERY:** (Rate 1-5)\n□ I can use all 5 words naturally\n□ I remember the word meanings\n□ I can teach them to someone else\n\n**GRAMMAR CONFIDENCE:** (Rate 1-5)\n□ I understand today's pattern\n□ I can create original sentences\n□ I can use it in conversation\n\n**CONVERSATION SUCCESS:** (Rate 1-5)\n□ I spoke for the full time\n□ I felt confident and natural\n□ I understood everything\n\n**FINAL MISSION:** Create one perfect sentence combining everything from today's lesson.\n\n**MEMORY LOCK:** Close your eyes and visualize using today's language tomorrow!\n\n**TOMORROW'S PREVIEW:** We'll use today's foundations to explore [next topic]!`
      }
    };

    const sectionTemplates = templates[section as keyof typeof templates];
    if (!sectionTemplates) return `Content for ${section} page ${pageNumber}`;
    
    const template = sectionTemplates[pageNumber as keyof typeof sectionTemplates] || 
                    sectionTemplates[1 as keyof typeof sectionTemplates];
    
    return template;
  }

  private generateSurprisingFact(theme: string): string {
    const facts = {
      "Self & Family": "the average person has 7.5 conversations per day with family members",
      "Home & Environment": "your brain processes 'home' as the safest word in any language",
      "Daily Activities": "routine activities use only 5% of your brain's attention",
      "Food & Meals": "humans can distinguish over 10,000 different food flavors"
    };
    return facts[theme as keyof typeof facts] || "learning happens 65% faster with personal connection";
  }

  private generateContextualWord(theme: string, level: string, wordNumber: number): string {
    // This would connect to a comprehensive vocabulary database
    const wordBanks = {
      A1: {
        "Self & Family": ["important", "family", "together", "happy", "support"],
        "Food & Meals": ["delicious", "healthy", "favorite", "cooking", "sharing"]
      }
    };
    
    return wordBanks[level as keyof typeof wordBanks]?.[theme]?.[wordNumber - 1] || `word${wordNumber}`;
  }

  private getGrammarFocus(level: string, dayNumber: number): string {
    const grammarProgression = {
      A1: ["am/is/are", "have/has", "like/love", "can/can't"],
      A2: ["present perfect", "going to", "past simple", "comparatives"],
      B1: ["present perfect continuous", "used to", "conditionals", "passive voice"],
      B2: ["mixed conditionals", "reported speech", "advanced passive", "subjunctive"],
      C1: ["sophisticated modals", "complex conditionals", "advanced discourse", "nuanced expressions"],
      C2: ["native-like patterns", "rhetorical devices", "academic register", "idiomatic mastery"]
    };
    
    const patterns = grammarProgression[level as keyof typeof grammarProgression] || grammarProgression.A1;
    return patterns[(dayNumber - 1) % patterns.length];
  }

  private selectOptimalTriggers(): NeuroscopicPrinciple[] {
    // Return the most effective triggers for 30-minute lessons
    return this.neuroscientificPrinciples.filter(p => p.memoryBoost >= 4);
  }

  private generateConversationTargets(level: string, theme: string): string[] {
    return [
      `Have a 3-minute conversation about personal experience with ${theme}`,
      `Ask and answer 5 questions related to ${theme}`,
      `Express opinions and preferences about ${theme}`,
      `Tell a story involving ${theme}`
    ];
  }

  private generateMemoryTasks(level: string, theme: string): string[] {
    return [
      "Spaced repetition at 1min, 5min, 15min, and end of lesson",
      "Physical gestures for all new vocabulary",
      "Emotional connection to personal experiences", 
      "Teach-back to consolidate learning"
    ];
  }

  private generateAttentionSegments(): AttentionSegment[] {
    return [
      { minute: 1, activity: "Hook & Surprise", focus: "selective", engagement: "active" },
      { minute: 5, activity: "Vocabulary Movement", focus: "sustained", engagement: "interactive" },
      { minute: 10, activity: "Grammar Building", focus: "sustained", engagement: "active" },
      { minute: 15, activity: "Brain Break", focus: "divided", engagement: "passive" },
      { minute: 18, activity: "Practice Scenarios", focus: "sustained", engagement: "interactive" },
      { minute: 25, activity: "Conversation Flow", focus: "sustained", engagement: "interactive" },
      { minute: 28, activity: "Memory Consolidation", focus: "selective", engagement: "active" }
    ];
  }

  private assignNeurotrigger(section: string, pageNumber: number): string {
    const triggers = {
      introduction: "Novelty Bias",
      vocabulary: "Motor Cortex Activation", 
      grammar: "Pattern Recognition",
      practice: "Social Learning",
      conversation: "Emotional Resonance",
      assessment: "Recency Effect"
    };
    return triggers[section as keyof typeof triggers] || "Pattern Recognition";
  }

  private selectInteractionType(section: string, pageNumber: number): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
    const types = {
      introduction: "visual",
      vocabulary: "kinesthetic", 
      grammar: "visual",
      practice: "mixed",
      conversation: "auditory",
      assessment: "mixed"
    };
    return types[section as keyof typeof types] as any || "mixed";
  }

  private calculatePageTime(section: string, cognitiveLoad: string): number {
    const baseTimes = {
      introduction: 1,
      vocabulary: 1.4,
      grammar: 1.5, 
      practice: 2,
      conversation: 2.5,
      assessment: 2
    };
    
    const loadMultipliers = { low: 0.8, medium: 1, high: 1.2 };
    
    return (baseTimes[section as keyof typeof baseTimes] || 1.5) * 
           (loadMultipliers[cognitiveLoad as keyof typeof loadMultipliers] || 1);
  }
}

export const neuroscientificContentService = new NeuroscientificContentService();