export type Difficulty = "A1" | "A2" | "B1" | "B2" | "C1";
export type Track = "professionals" | "college" | "adults";

export const DIFFICULTIES: Difficulty[] = ["A1", "A2", "B1", "B2", "C1"];

export const TRACKS: { id: Track; label: string; emoji: string; tagline: string }[] = [
  { id: "professionals", label: "Professionals", emoji: "💼", tagline: "Workplace English: meetings, emails, negotiation." },
  { id: "college", label: "College Students", emoji: "🎓", tagline: "Academic English: essays, presentations, discussion." },
  { id: "adults", label: "General Adults", emoji: "🌍", tagline: "Everyday fluency: travel, social, media." },
];

export const TRACK_LABEL: Record<Track, string> = {
  professionals: "Professionals",
  college: "College Students",
  adults: "General Adults",
};

// ---------- Warm-up prompts ----------
export const WARMUP: Record<Track, string[]> = {
  professionals: [
    "Tell me about your role and what a typical week looks like.",
    "What's a recent project you're proud of, and why?",
    "Which work skill would you most like to sharpen this year?",
  ],
  college: [
    "What are you studying, and what drew you to it?",
    "Describe a class or topic that genuinely excites you.",
    "What's a goal you have for this semester?",
  ],
  adults: [
    "Where are you from, and what do you love about living there?",
    "How do you usually spend your weekends?",
    "What's something new you've tried recently?",
  ],
};

// ---------- Vocabulary: term ↔ definition ----------
type VocabItem = { term: string; def: string };
export const VOCAB: Record<Track, Record<Difficulty, VocabItem[]>> = {
  professionals: {
    A1: [
      { term: "meeting", def: "A time when people talk together about work." },
      { term: "deadline", def: "The last day to finish something." },
      { term: "client", def: "A person who pays for your service." },
      { term: "team", def: "A group of people who work together." },
    ],
    A2: [
      { term: "schedule", def: "A plan of times for things to happen." },
      { term: "report", def: "A written description of work or results." },
      { term: "feedback", def: "Comments about how someone is doing." },
      { term: "task", def: "A small piece of work to do." },
    ],
    B1: [
      { term: "agenda", def: "A list of topics to discuss in a meeting." },
      { term: "stakeholder", def: "A person with an interest in a project." },
      { term: "milestone", def: "An important point reached in a project." },
      { term: "follow-up", def: "Further action after a first contact." },
    ],
    B2: [
      { term: "leverage", def: "To use something to maximum advantage." },
      { term: "scope", def: "The extent of what a project covers." },
      { term: "bandwidth", def: "The capacity to take on more work." },
      { term: "align", def: "To agree on a direction or approach." },
    ],
    C1: [
      { term: "synergy", def: "Combined effort that exceeds the sum of parts." },
      { term: "mitigate", def: "To make a risk less serious." },
      { term: "onboarding", def: "Bringing a new person into an organisation." },
      { term: "deliverable", def: "A concrete output produced for a client." },
    ],
  },
  college: {
    A1: [
      { term: "lecture", def: "A long talk by a teacher to students." },
      { term: "essay", def: "A short piece of writing on a topic." },
      { term: "exam", def: "A test of what you have learned." },
      { term: "library", def: "A place full of books to study in." },
    ],
    A2: [
      { term: "deadline", def: "The last day to hand work in." },
      { term: "campus", def: "The grounds of a college or university." },
      { term: "syllabus", def: "A list of topics in a course." },
      { term: "tutor", def: "A teacher who helps small groups." },
    ],
    B1: [
      { term: "thesis", def: "The main idea you argue in an essay." },
      { term: "citation", def: "A reference to a source you used." },
      { term: "seminar", def: "A small class for discussion." },
      { term: "draft", def: "An early version of a piece of writing." },
    ],
    B2: [
      { term: "argument", def: "A reasoned line of thinking with evidence." },
      { term: "peer-reviewed", def: "Checked by other experts before publication." },
      { term: "abstract", def: "A short summary at the start of a paper." },
      { term: "methodology", def: "The methods used to do research." },
    ],
    C1: [
      { term: "empirical", def: "Based on observation or experiment." },
      { term: "discourse", def: "Serious discussion or writing on a topic." },
      { term: "paradigm", def: "A standard model of thinking in a field." },
      { term: "corroborate", def: "To confirm or support with evidence." },
    ],
  },
  adults: {
    A1: [
      { term: "ticket", def: "A paper that lets you travel or enter." },
      { term: "menu", def: "A list of food in a restaurant." },
      { term: "hotel", def: "A place where you pay to sleep." },
      { term: "map", def: "A drawing that shows where places are." },
    ],
    A2: [
      { term: "neighbour", def: "A person who lives near you." },
      { term: "errand", def: "A short trip to do a small job." },
      { term: "receipt", def: "A paper showing what you paid." },
      { term: "appointment", def: "An agreed time to meet someone." },
    ],
    B1: [
      { term: "commute", def: "The trip from home to work or school." },
      { term: "budget", def: "A plan for how to spend money." },
      { term: "lease", def: "A contract to rent a home." },
      { term: "mortgage", def: "A loan to buy a house." },
    ],
    B2: [
      { term: "itinerary", def: "A planned route for a trip." },
      { term: "reimburse", def: "To pay someone back for money spent." },
      { term: "household", def: "All the people who live in one home." },
      { term: "subscription", def: "A regular payment for a service." },
    ],
    C1: [
      { term: "frugal", def: "Careful with money, not wasteful." },
      { term: "gripe", def: "A small complaint." },
      { term: "vicinity", def: "The area near a place." },
      { term: "dwell on", def: "To keep thinking about something." },
    ],
  },
};

// ---------- Grammar: cloze with one correct option ----------
type GrammarItem = { sentence: string; options: string[]; answer: string };
export const GRAMMAR: Record<Difficulty, GrammarItem[]> = {
  A1: [
    { sentence: "She ___ coffee every morning.", options: ["drink", "drinks", "drinking"], answer: "drinks" },
    { sentence: "They ___ from Spain.", options: ["is", "are", "am"], answer: "are" },
    { sentence: "I ___ a sister.", options: ["have", "has", "haves"], answer: "have" },
  ],
  A2: [
    { sentence: "We ___ to Paris last summer.", options: ["go", "went", "gone"], answer: "went" },
    { sentence: "He is ___ than his brother.", options: ["tall", "taller", "tallest"], answer: "taller" },
    { sentence: "There ___ many people at the event.", options: ["was", "were", "is"], answer: "were" },
  ],
  B1: [
    { sentence: "If I had time, I ___ help you.", options: ["will", "would", "would have"], answer: "would" },
    { sentence: "I've ___ in this city for five years.", options: ["live", "lived", "living"], answer: "lived" },
    { sentence: "The report ___ by Friday.", options: ["must finish", "must be finished", "must finishing"], answer: "must be finished" },
  ],
  B2: [
    { sentence: "Had I known earlier, I ___ acted differently.", options: ["would", "would have", "had"], answer: "would have" },
    { sentence: "She suggested ___ a new approach.", options: ["to try", "trying", "try"], answer: "trying" },
    { sentence: "By next year, we ___ the new system.", options: ["will launch", "will have launched", "are launching"], answer: "will have launched" },
  ],
  C1: [
    { sentence: "Rarely ___ such a compelling argument.", options: ["I have heard", "have I heard", "I heard"], answer: "have I heard" },
    { sentence: "The proposal, ___ controversial, was approved.", options: ["being it", "though", "albeit"], answer: "albeit" },
    { sentence: "Were the funding ___, the project would proceed.", options: ["secured", "to be secured", "securing"], answer: "to be secured" },
  ],
};

// ---------- Reading passages ----------
type ReadingItem = {
  passage: string;
  question: string;
  options: string[];
  answer: string;
};
export const READING: Record<Track, ReadingItem> = {
  professionals: {
    passage:
      "Remote-first companies are shifting how teams measure performance. Instead of counting hours online, managers track concrete outcomes — shipped features, closed deals, resolved tickets. Critics argue this favours visible, easy-to-measure work over deep thinking. Supporters say it frees employees from busywork and rewards real impact.",
    question: "What do critics worry about?",
    options: [
      "That outcome tracking ignores deep, less visible work.",
      "That managers don't track outcomes at all.",
      "That remote work is too expensive for companies.",
    ],
    answer: "That outcome tracking ignores deep, less visible work.",
  },
  college: {
    passage:
      "A study of student note-taking compared typing on laptops with handwriting. Students who handwrote their notes recalled key concepts more accurately a week later. Researchers suggested that the slower pace of handwriting forces students to summarise ideas in their own words rather than transcribe lectures verbatim.",
    question: "Why might handwriting help recall, according to the researchers?",
    options: [
      "Because handwriting is faster than typing.",
      "Because students are forced to summarise rather than transcribe.",
      "Because laptops break down more often than pens.",
    ],
    answer: "Because students are forced to summarise rather than transcribe.",
  },
  adults: {
    passage:
      "Many city dwellers are joining community gardens. Beyond the fresh vegetables, members report something they didn't expect: stronger connections with neighbours they'd lived beside for years without speaking. Sharing tools, swapping seeds, and weeding side by side seems to do what small talk on the street never quite did.",
    question: "What surprising benefit do gardeners report?",
    options: [
      "Cheaper rent in their neighbourhood.",
      "Stronger relationships with their neighbours.",
      "Better weather in the city.",
    ],
    answer: "Stronger relationships with their neighbours.",
  },
};

// ---------- Listening: short script + question ----------
type ListeningItem = {
  script: string;
  question: string;
  options: string[];
  answer: string;
};
export const LISTENING: Record<Track, ListeningItem> = {
  professionals: {
    script:
      "Quick update on the launch. We've moved the release from Tuesday to Thursday to give QA more time. Marketing is briefed and the customer email will go out Thursday morning. Let me know if anything blocks you.",
    question: "What changed about the launch?",
    options: [
      "It was cancelled.",
      "It was moved from Tuesday to Thursday.",
      "It was moved from Thursday to Tuesday.",
    ],
    answer: "It was moved from Tuesday to Thursday.",
  },
  college: {
    script:
      "Reminder: the deadline for your research proposal is next Monday at five p.m. Submit through the portal, not by email. If you need an extension, request it before Friday so we can review it in time.",
    question: "How should students request an extension?",
    options: [
      "By email any time.",
      "Through the portal before Friday.",
      "In person on Monday.",
    ],
    answer: "Through the portal before Friday.",
  },
  adults: {
    script:
      "Hi, this is Dr. Park's office. We're moving your appointment from Wednesday at three to Friday at ten. Please call us back to confirm, or reply yes to this message. Thanks!",
    question: "When is the new appointment?",
    options: [
      "Wednesday at three.",
      "Friday at ten.",
      "Friday at three.",
    ],
    answer: "Friday at ten.",
  },
};

// ---------- Speaking prompts ----------
export const SPEAKING: Record<Track, string[]> = {
  professionals: [
    "In one minute, describe a challenge you faced at work and how you handled it.",
    "Pitch a project you'd love to lead in the next six months.",
  ],
  college: [
    "Describe the most interesting thing you've learned this term.",
    "Explain a topic from your major as if to a curious friend.",
  ],
  adults: [
    "Tell me about a place you'd love to visit and why.",
    "Describe a small habit that has improved your daily life.",
  ],
};
