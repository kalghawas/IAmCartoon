import { ARABIC_AVATARS, CARTOON_AVATARS, ALL_AVATARS } from './avatarLibrary';

export interface SampleTranscriptOption {
  id: string;
  title: string;
  category: string;
  personAName: string;
  personBName: string;
  prefixA: string;
  prefixB: string;
  avatarUrl: string;
  senderAvatarUrl?: string;
  rawText: string;
}

export const AVATAR_PRESETS = ALL_AVATARS;

export const SAMPLE_TRANSCRIPTS: SampleTranscriptOption[] = [
  {
    id: 'arabic-majlis',
    title: '☕️ سهرة المجلس والقهوة (Arabic Majlis)',
    category: 'Arabic Culture 🇸🇦',
    personAName: 'أبو فهد',
    personBName: 'سلطان',
    prefixA: 'أبو فهد:',
    prefixB: 'سلطان:',
    avatarUrl: ARABIC_AVATARS[0].url, // Gulf Youth
    senderAvatarUrl: ARABIC_AVATARS[1].url, // Shemagh Red
    rawText: `سلطان: يا هلا أبو فهد! عسى القهوة جاهزة؟ ☕️✨
أبو فهد: <image: arabic-majlis> أرحب يا سلطان! الدلة على الجمر والتمر السكري في انتظارك 🔥
سلطان: ما شاء الله تبارك الله! جاي في الطريق 🚗💨
أبو فهد: كلهم هنا في المجلس ويسألون عنك، حياك الله ❤️`,
  },
  {
    id: 'funny-cat-banter',
    title: '😼 Meme Cat & The 3 AM Zoomies',
    category: 'Cartoony & Funny 🎭',
    personAName: 'Me',
    personBName: 'Mr. Whiskers',
    prefixA: 'Me:',
    prefixB: 'Whiskers:',
    avatarUrl: CARTOON_AVATARS[0].url, // Cool cat
    senderAvatarUrl: CARTOON_AVATARS[1].url, // Cheeky monkey
    rawText: `Me: Dude, why are you sprint-jumping off the walls at 3:17 AM?! 😭
Whiskers: The invisible red laser dot commanded it. 😼
Me: There is literally nothing there!! Go to sleep!
Whiskers: Sleep is for the weak. Now open the tuna can. 🥫
Me: I gave you gourmet salmon 2 hours ago!!
Whiskers: That was 2 hours ago. I have suffered greatly since.
Me: Fine, one snack spoon. Then SILENCE.
Whiskers: Deal. Now shake a leg, human. 😂`,
  },
  {
    id: 'startup-launch',
    title: '🚀 Product Launch & Analytics Screenshot',
    category: 'Work & Tech',
    personAName: 'Me',
    personBName: 'Alex Rivers',
    prefixA: 'Me:',
    prefixB: 'Alex:',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces&auto=format',
    rawText: `Me: Alex! Check Product Hunt right now...
Alex: Wait did we go live already?? 😱
Me: <image attachment> YES!! Look at the live traffic spike!! 🔥🚀
Alex: NO WAY!! 2,840 active users right now?! 🏃‍♂️💨
Me: Holy cow!! 🤯 The server isn't even breaking a sweat!
Alex: Drinks on me tonight! 🥂
Me: ❤️`,
  },
  {
    id: 'dinner-debate',
    title: '🍕 The Infinite Dinner Debate',
    category: 'Casual & Comedy',
    personAName: 'Me',
    personBName: 'Sarah Jenkins',
    prefixA: 'Me:',
    prefixB: 'Sarah:',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces&auto=format',
    rawText: `Sarah: What do you want for dinner tonight?
Me: Literally anything. I'm not picky at all!
Sarah: Tacos? 🌮
Me: Ehhh had Mexican yesterday.
Sarah: Italian? That new pasta spot? 🍝
Me: Too heavy, feeling light today.
Sarah: Sushi then? 🍣
Me: Too cold outside for raw fish haha
Sarah: "I'm not picky at all" they said... 😂🤦‍♀️
Me: 💀`,
  },
  {
    id: 'job-offer',
    title: '🎉 The Dream Job Offer',
    category: 'Milestone',
    personAName: 'Me',
    personBName: 'Elena Rostova',
    prefixA: 'Me:',
    prefixB: 'Elena:',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces&auto=format',
    rawText: `Elena: Did they call you back yet?! 🤞
Me: My phone literally just rang 5 minutes ago...
Elena: AND??? TELL ME!! 🥺
Me: I GOT THE JOB!! Senior Staff Engineer! 🥳✨
Elena: OMG AHHHHHH CONGRATULATIONS!! 🍾🎉
Elena: I knew you were going to crush that interview!!
Me: Thank you for doing mock interviews with me all week! 😭
Elena: ❤️`,
  },
  {
    id: 'mystery-clue',
    title: '🕵️‍♂️ The Suspicious Package',
    category: 'Drama & Mystery',
    personAName: 'Me',
    personBName: 'Marcus Vance',
    prefixA: 'Me:',
    prefixB: 'Marcus:',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces&auto=format',
    rawText: `Marcus: Are you home right now?
Me: Yeah just made coffee. Why?
Marcus: Look outside your front porch. Don't touch anything yet.
Me: Wait... there's a black wooden box with wax seal?? 😳
Marcus: Whatever you do, DO NOT open the seal until I get there.
Me: Marcus what did you get us into??
Marcus: 2 minutes away. Lock the door.
Me: ⏳`,
  },
];
