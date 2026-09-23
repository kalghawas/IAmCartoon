import { AIProviderInfo } from '../types';

export const AI_PROVIDERS: AIProviderInfo[] = [
  {
    id: 'google',
    name: 'Google Gemini & Imagen (Recommended)',
    tagline: 'Google AI Studio — Free tier available, top-tier cartoon styling',
    keyPrefix: 'AIzaSy...',
    placeholder: 'AIzaSy... (Paste your Google AI Studio API key here)',
    isFreeAvailable: true,
    requiresKey: true,
    dashboardUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      {
        id: 'gemini-3.1-flash-image',
        name: 'Gemini 3.1 Flash Image (gemini-3.1-flash-image)',
        qualityDescription: 'Highest fidelity 3D studio lighting, rich subsurface skin textures, Pixar & anime stylization, and identity preservation.',
        badge: 'Recommended'
      },
      {
        id: 'gemini-3.1-flash-lite-image',
        name: 'Gemini 3.1 Flash Lite Image (gemini-3.1-flash-lite-image)',
        qualityDescription: 'Ultra-fast multimodal vision rendering with high responsiveness and low token overhead.',
        badge: 'Fastest'
      },
      {
        id: 'gemini-3-pro-image',
        name: 'Gemini 3 Pro Image (gemini-3-pro-image)',
        qualityDescription: 'Deep contextual visual reasoning and complex multi-subject stylized character transformations.',
        badge: 'Pro Grade'
      }
    ],
    stepByStepGuide: {
      title: 'How to Get Your Free Google Gemini API Key',
      targetAudience: 'Designed for everyone — clear, simple, step-by-step.',
      warningNote: '⚠️ Warning: Treat your API key like a private house key or password. Never post it in public chat groups or share it with strangers.',
      steps: [
        {
          number: 1,
          instruction: 'Click the link below to open the official Google AI Studio website in a new tab:',
          actionUrl: 'https://aistudio.google.com/app/apikey',
          actionUrlLabel: 'Open Google AI Studio Key Page (Click Here)',
          whatHappens: 'A webpage created by Google will open. You will see a clean page with a "Sign In" button or your Google profile.'
        },
        {
          number: 2,
          instruction: 'Sign in using your regular Google email address (the same account you use for Gmail or YouTube).',
          whatHappens: 'If you are already logged into Google in your browser, it might sign you in automatically.'
        },
        {
          number: 3,
          instruction: 'Click on the prominent blue button on the screen that says "Create API key".',
          whatHappens: 'A small popup window will appear asking which project to use.'
        },
        {
          number: 4,
          instruction: 'In that popup, choose "Create API key in new project" (or choose an existing project if you have one).',
          whatHappens: 'Google will instantly generate a unique key code starting with the letters "AIzaSy...".'
        },
        {
          number: 5,
          instruction: 'Click the "Copy" button next to that code to copy it to your computer clipboard.',
          whatHappens: 'The key is now copied to your clipboard.'
        },
        {
          number: 6,
          instruction: 'Come back to this page, click inside the API Key input box below, and paste your key (Right-click and select Paste, or press Ctrl+V on Windows / Cmd+V on Mac).',
          whatHappens: 'The box will fill with your key and show a green "Stored locally" badge.'
        }
      ]
    }
  },
  {
    id: 'pollinations',
    name: 'Pollinations.AI (100% Free — No API Key Required)',
    tagline: 'Public open-source neural cluster — Generates AI art freely with zero setup or API keys',
    keyPrefix: 'None required',
    placeholder: 'No API key required — ready to generate out of the box!',
    isFreeAvailable: true,
    requiresKey: false,
    dashboardUrl: 'https://pollinations.ai',
    models: [
      {
        id: 'flux',
        name: 'FLUX Open Model (flux)',
        qualityDescription: '100% free open-weights diffusion model with clean cartoon composition and vivid colors.',
        badge: 'Free & Instant'
      },
      {
        id: 'turbo',
        name: 'Turbo Open Model (turbo)',
        qualityDescription: 'Ultra-fast open neural model optimized for quick cartoon sketches.',
        badge: 'Fast Free'
      }
    ],
    stepByStepGuide: {
      title: 'Pollinations.AI — Completely Free AI Generation',
      targetAudience: 'For users wanting to generate AI cartoon portraits immediately without creating accounts or entering keys.',
      warningNote: '🎉 Good news: Pollinations.ai is a public open AI project that requires no credit card, no sign-up, and no API key.',
      steps: [
        {
          number: 1,
          instruction: 'Select "Pollinations.AI" from the AI Service Provider dropdown above.',
          whatHappens: 'The app immediately switches to the free public AI cluster.'
        },
        {
          number: 2,
          instruction: 'No key is needed! You can leave the API key field empty or click "Test API Key Connection" to verify.',
          whatHappens: 'The app confirms that the open neural cluster is online and reachable.'
        },
        {
          number: 3,
          instruction: 'Click "Save Settings" and upload your portrait to generate cartoon art instantly.',
          whatHappens: 'Your cartoon character will be generated using open-source models.'
        }
      ]
    }
  },
  {
    id: 'openai',
    name: 'OpenAI (DALL-E & GPT-4o)',
    tagline: 'Creators of DALL-E 3 and ChatGPT — Premium artistic visual generation',
    keyPrefix: 'sk-...',
    placeholder: 'sk-... (Paste your OpenAI secret API key here)',
    isFreeAvailable: false,
    requiresKey: true,
    dashboardUrl: 'https://platform.openai.com/api-keys',
    models: [
      {
        id: 'dall-e-3',
        name: 'DALL-E 3 (dall-e-3)',
        qualityDescription: 'Industry-leading prompt fidelity, dramatic color depth, and highly creative stylized characters.',
        badge: 'Premium'
      },
      {
        id: 'dall-e-2',
        name: 'DALL-E 2 (dall-e-2)',
        qualityDescription: 'Standard digital cartoon rendering with fast response and lower token consumption.',
        badge: 'Standard'
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o Vision (gpt-4o)',
        qualityDescription: 'Advanced facial analysis and smart multi-stage cartoon rendering.',
        badge: 'Smart'
      }
    ],
    stepByStepGuide: {
      title: 'How to Get Your OpenAI API Key',
      targetAudience: 'For users with an OpenAI Developer account.',
      warningNote: '⚠️ Warning: OpenAI API keys require an account with active credit balance. Once created, OpenAI only shows the full key once, so copy it immediately.',
      steps: [
        {
          number: 1,
          instruction: 'Click the link below to visit the official OpenAI Developer API Keys page:',
          actionUrl: 'https://platform.openai.com/api-keys',
          actionUrlLabel: 'Open OpenAI API Keys Dashboard (Click Here)',
          whatHappens: 'The OpenAI developer login page will open in a new browser tab.'
        },
        {
          number: 2,
          instruction: 'Log in with your OpenAI / ChatGPT account, or click "Sign Up" if you are new.',
          whatHappens: 'You will enter the OpenAI Platform Dashboard.'
        },
        {
          number: 3,
          instruction: 'Click the button labeled "+ Create new secret key".',
          whatHappens: 'A prompt will appear asking for an optional name (you can type "Cartoon Studio").'
        },
        {
          number: 4,
          instruction: 'Click "Create secret key". A window will show your new key starting with "sk-...".',
          whatHappens: 'This key is secret and allows access to OpenAI image models.'
        },
        {
          number: 5,
          instruction: 'Click the green "Copy" icon, then return to this page and paste it into the box below.',
          whatHappens: 'Your OpenAI key is saved safely in your browser storage.'
        }
      ]
    }
  },
  {
    id: 'stability',
    name: 'Stability AI (Stable Diffusion)',
    tagline: 'Stable Diffusion 3.5 & SDXL — Cutting-edge open-weights character generation',
    keyPrefix: 'sk-...',
    placeholder: 'sk-... (Paste your Stability AI API key here)',
    isFreeAvailable: true,
    requiresKey: true,
    dashboardUrl: 'https://platform.stability.ai/account/keys',
    models: [
      {
        id: 'sd3.5-large',
        name: 'Stable Diffusion 3.5 Large (sd3.5-large)',
        qualityDescription: 'Superb character geometry, custom anime shading, and detailed photographic cartoon lighting.',
        badge: 'Next-Gen'
      },
      {
        id: 'sd3-medium',
        name: 'Stable Diffusion 3 Medium (sd3-medium)',
        qualityDescription: 'Balanced speed and detail, suitable for quick cartoon portrait turnarounds.',
        badge: 'Balanced'
      },
      {
        id: 'stable-diffusion-xl-1024-v1-0',
        name: 'SDXL 1.0 (stable-diffusion-xl-1024-v1-0)',
        qualityDescription: 'High resolution digital vector and graphic novel style linework.',
        badge: 'Artistic'
      }
    ],
    stepByStepGuide: {
      title: 'How to Get Your Stability AI API Key',
      targetAudience: 'For users using Stable Diffusion character engines.',
      warningNote: '⚠️ Warning: Stability AI provides free starter credits to new accounts. Ensure you save your key in a safe place.',
      steps: [
        {
          number: 1,
          instruction: 'Click the link below to open the Stability AI developer platform:',
          actionUrl: 'https://platform.stability.ai/account/keys',
          actionUrlLabel: 'Open Stability AI Key Manager (Click Here)',
          whatHappens: 'The Stability AI platform website will open in a new tab.'
        },
        {
          number: 2,
          instruction: 'Sign in or create a free account using your email or Google account.',
          whatHappens: 'You will be taken to your API Keys dashboard.'
        },
        {
          number: 3,
          instruction: 'Click the "+ Create API Key" button.',
          whatHappens: 'Stability AI generates a new API secret key.'
        },
        {
          number: 4,
          instruction: 'Copy the secret key and paste it into the API key field in this app.',
          whatHappens: 'The app is now configured to use Stable Diffusion models.'
        }
      ]
    }
  },
  {
    id: 'huggingface',
    name: 'Hugging Face (Free Access Tokens)',
    tagline: 'Open-source AI community — Free user access tokens with thousands of models',
    keyPrefix: 'hf_...',
    placeholder: 'hf_... (Paste your Hugging Face User Access Token here)',
    isFreeAvailable: true,
    requiresKey: true,
    dashboardUrl: 'https://huggingface.co/settings/tokens',
    models: [
      {
        id: 'black-forest-labs/FLUX.1-schnell',
        name: 'FLUX.1 Schnell (black-forest-labs/FLUX.1-schnell)',
        qualityDescription: 'State-of-the-art fast open generative model with exceptional cartoon composition.',
        badge: 'Community Favorite'
      },
      {
        id: 'stabilityai/stable-diffusion-2-1',
        name: 'Stable Diffusion 2.1 (stabilityai/stable-diffusion-2-1)',
        qualityDescription: 'Classic digital anime, comic, and stylized character rendering.',
        badge: 'Classic'
      }
    ],
    stepByStepGuide: {
      title: 'How to Get Your Free Hugging Face Access Token',
      targetAudience: 'Great for free open-source model access.',
      warningNote: '⚠️ Warning: Choose "Read" role permissions when creating your token. Never select "Write" unless you are publishing models.',
      steps: [
        {
          number: 1,
          instruction: 'Click the link below to go to the Hugging Face token settings page:',
          actionUrl: 'https://huggingface.co/settings/tokens',
          actionUrlLabel: 'Open Hugging Face Tokens Page (Click Here)',
          whatHappens: 'The Hugging Face security settings page opens in a new tab.'
        },
        {
          number: 2,
          instruction: 'If you do not have an account, click "Sign Up" to create a free account with your email.',
          whatHappens: 'You will receive a confirmation email to verify your free account.'
        },
        {
          number: 3,
          instruction: 'On the Access Tokens page, click the button that says "Create new token" or "New token".',
          whatHappens: 'A form will appear asking for a token name and role.'
        },
        {
          number: 4,
          instruction: 'Type "Cartoon-App" in the Name box, and select the "Read" option for the token type.',
          whatHappens: 'This gives the app permission to run free inference models.'
        },
        {
          number: 5,
          instruction: 'Click "Generate a token". Copy the code starting with "hf_..." and paste it into the box below.',
          whatHappens: 'Your token is stored safely in your browser.'
        }
      ]
    }
  }
];
