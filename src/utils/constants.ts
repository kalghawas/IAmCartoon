import { ArtStyle, PoseOption, WardrobeOption, ExpressionOption } from '../types';

export const ART_STYLES: ArtStyle[] = [
  {
    id: 'pixar-3d',
    name: '3D Animation / Pixar',
    tagline: 'Subsurface glow & big expressive eyes',
    category: '3D Cinematic',
    badgeColor: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
    iconName: 'Sparkles',
    previewGradient: 'bg-gradient-to-br from-amber-600 via-orange-500 to-rose-600',
    sampleImageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    promptDescription: 'High-end 3D character animation render, Pixar and Disney animated feature film aesthetic. Vibrant cinematic studio lighting, smooth subsurface skin scattering, large expressive stylized eyes, charming proportions, soft hair highlights, Octane render depth of field.'
  },
  {
    id: 'modern-vector',
    name: 'Modern Vector Flat',
    tagline: 'Clean geometry & crisp bold silhouettes',
    category: 'Illustration',
    badgeColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    iconName: 'Layers',
    previewGradient: 'bg-gradient-to-br from-teal-600 via-emerald-500 to-cyan-600',
    sampleImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    promptDescription: 'Modern editorial vector illustration, sleek planar shapes, clean bold outlines, minimalist duotone highlights, contemporary tech lifestyle graphic design, crisp geometric silhouette, flat color palette with subtle grain texture.'
  },
  {
    id: 'classic-anime',
    name: 'Classic Anime / Manga',
    tagline: 'Cel-shaded keyframes & dynamic linework',
    category: 'Anime',
    badgeColor: 'from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/30',
    iconName: 'Zap',
    previewGradient: 'bg-gradient-to-br from-rose-600 via-pink-500 to-indigo-600',
    sampleImageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    promptDescription: 'Studio Ghibli and Makoto Shinkai inspired classic anime keyframe illustration. Beautifully defined cel-shading, vibrant multi-layered hair highlights, detailed soulful anime eyes, clean inked contours, soft chromatic atmospheric lighting.'
  },
  {
    id: 'comic-novel',
    name: 'Comic Graphic Novel',
    tagline: 'Ben-Day dots, ink hatching & pop-art grit',
    category: 'Comic',
    badgeColor: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30',
    iconName: 'Palette',
    previewGradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800',
    sampleImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    promptDescription: 'American graphic novel and vintage comic book illustration. Heavy India ink crosshatching, visible halftone Ben-Day dots, dramatic high-contrast noir shadows, bold comic lettering aesthetics, vintage printed pulp paper texture.'
  },
  {
    id: 'cyberpunk-toon',
    name: 'Cyberpunk Toon',
    tagline: 'Neon edge glows & augmented tech chic',
    category: 'Sci-Fi',
    badgeColor: 'from-cyan-500/20 to-fuchsia-500/20 text-cyan-300 border-cyan-500/30',
    iconName: 'Cpu',
    previewGradient: 'bg-gradient-to-br from-cyan-600 via-purple-600 to-pink-600',
    sampleImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    promptDescription: 'Stylized futuristic cyberpunk cartoon character. Neon rim light reflections, holographic tint, cybernetic face accent lines, high-tech dystopian city glow, bold vibrant neon pink and electric cyan lighting.'
  },
  {
    id: 'claymation-3d',
    name: 'Claymation 3D',
    tagline: 'Tactile stop-motion plasticine charm',
    category: 'Stop-Motion',
    badgeColor: 'from-yellow-500/20 to-amber-600/20 text-yellow-300 border-yellow-500/30',
    iconName: 'Smile',
    previewGradient: 'bg-gradient-to-br from-amber-700 via-yellow-600 to-stone-700',
    sampleImageUrl: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&auto=format&fit=crop&q=80',
    promptDescription: 'Handcrafted stop-motion claymation plasticine character, Aardman and Laika animation aesthetic. Tactile clay thumbprint textures, soft studio tabletop miniature lighting, physical clay seams, warm nostalgic tactile feel.'
  }
];

export const POSES: PoseOption[] = [
  {
    id: 'neutral-portrait',
    label: 'Neutral / Portrait',
    description: 'Classic head & shoulders, direct engaging eye contact',
    promptText: 'Front-facing portrait pose, centered framing, relaxed shoulders, upright posture with direct eye contact toward the viewer.',
    icon: 'User',
    cultureTag: 'Universal'
  },
  {
    id: 'salam-hand-on-heart',
    label: 'Taqdeer & Salam (Hand on Heart)',
    description: 'Respectful KSA & Bahrain greeting with right hand over heart',
    promptText: 'Traditional warm Saudi and Bahraini cultural greeting pose: right hand placed over chest / heart in respectful greeting (Taqdeer & Salam), warm hospitable expression and welcoming posture.',
    icon: 'Heart',
    cultureTag: 'Gulf'
  },
  {
    id: 'saudi-ardah-sword',
    label: 'Saudi Ardah Sword Stance',
    description: 'Traditional Ardah sword dance celebratory pose',
    promptText: 'Proud traditional Saudi Ardah ceremonial pose: standing tall, holding a ceremonial sword gently raised upward in one hand with poise, celebrating Saudi cultural heritage and national pride.',
    icon: 'Shield',
    cultureTag: 'KSA'
  },
  {
    id: 'gahwa-dallah-pour',
    label: 'Gahwa & Dallah Hospitality',
    description: 'Pouring Arabic coffee from traditional Dallah into finjan',
    promptText: 'Traditional Gulf and Saudi hospitality pose: holding a traditional golden Arabic coffee pot (Dallah) in one hand and offering a small finjan cup with the other, radiating warm Arabian generosity (Karam).',
    icon: 'Coffee',
    cultureTag: 'Gulf'
  },
  {
    id: 'falconry-arm',
    label: 'Royal Falconry Stance',
    description: 'Gloved arm forward with noble hunting falcon perched',
    promptText: 'Prestigious Arabian falconry pose: leather falconer glove on forearm raised forward, noble hunting falcon perched proudly, showcasing Gulf heritage and outdoor nobility.',
    icon: 'Feather',
    cultureTag: 'Gulf'
  },
  {
    id: 'shemagh-adjust',
    label: 'Shemagh & Agal Adjustment',
    description: 'Styling crisp Ghutra / Shemagh and headpiece',
    promptText: 'Elegant cultural gesture: one hand raised adjusting the crisp fold of the Shemagh / Ghutra and the black Agal headband with polished charisma and poise.',
    icon: 'Sliders',
    cultureTag: 'Gulf'
  },
  {
    id: 'karak-chai-toast',
    label: 'Bahraini Karak Tea Toast',
    description: 'Holding warm glass of spiced Karak chai',
    promptText: 'Casual friendly Bahraini café cultural pose: holding a clear glass cup of steaming aromatic Karak chai with a relaxed warm smile.',
    icon: 'CupSoda',
    cultureTag: 'Bahrain'
  },
  {
    id: 'arms-crossed',
    label: 'Arms Crossed Confident',
    description: 'Self-assured power stance, slight head tilt',
    promptText: 'Confident stance with arms folded across chest, shoulders angled slightly, slight head tilt with self-assured demeanor.',
    icon: 'Shield',
    cultureTag: 'Universal'
  },
  {
    id: 'waving-friendly',
    label: 'Marhaban / Welcoming Wave',
    description: 'Energetic greeting wave, open warm smile',
    promptText: 'Friendly greeting pose with one hand raised waving enthusiastically toward the viewer, welcoming open body posture (Ahlan wa Sahlan).',
    icon: 'Hand',
    cultureTag: 'Universal'
  },
  {
    id: 'dynamic-pointing',
    label: 'Dynamic Action / Pointing',
    description: 'Engaging forward gesture with foreshortening',
    promptText: 'Dynamic perspective gesture with one index finger pointing boldly toward the viewer with energetic comic foreshortening.',
    icon: 'Navigation',
    cultureTag: 'Universal'
  },
  {
    id: 'thinking-chin',
    label: 'Thinking / Hand on Chin',
    description: 'Pensive intellectual pose, arched brow',
    promptText: 'Thoughtful intellectual pose with hand resting beneath chin in deep contemplation, slight gaze upward, curious eyebrow arch.',
    icon: 'Lightbulb',
    cultureTag: 'Universal'
  }
];

export const WARDROBES: WardrobeOption[] = [
  {
    id: 'saudi-thobe-shemagh',
    label: 'Saudi Thobe & Red Shemagh',
    description: 'Crisp Saudi white thobe, red checked Shemagh & Agal',
    promptText: 'Wearing authentic Saudi traditional attire: crisp pristine white Saudi thobe with structured mandarin collar, vibrant red-and-white checkered Shemagh (Ghutra) neatly styled with black Agal headband, and elegant cufflinks.',
    icon: 'Shirt',
    cultureTag: 'KSA'
  },
  {
    id: 'bahraini-thobe-ghutra',
    label: 'Bahraini Thobe & White Ghutra',
    description: 'Tailored Bahraini thobe, pure white Ghutra & black Agal',
    promptText: 'Wearing traditional Bahraini attire: tailored lightweight white Bahraini thobe with distinctive soft collar, snow-white flowing Ghutra, and crisp double black Agal headband.',
    icon: 'Shirt',
    cultureTag: 'Bahrain'
  },
  {
    id: 'royal-bisht-mishlah',
    label: 'Royal Bisht (Mishlah)',
    description: 'Luxurious ceremonial Bisht with shimmering gold zari trim',
    promptText: 'Dressed in a majestic ceremonial Arabian Bisht (Mishlah) in deep royal black or camel wool, richly bordered with shimmering gold metallic Zari thread embroidery, layered over a pristine white thobe.',
    icon: 'Crown',
    cultureTag: 'Gulf'
  },
  {
    id: 'gulf-luxury-abaya',
    label: 'Gulf Luxury Abaya & Sheila',
    description: 'Elegant modern black satin Abaya with fine gold embroidery',
    promptText: 'Wearing an elegant luxury Gulf designer Abaya in deep midnight black silk-satin with subtle gold geometric embroidery on cuffs, paired with a matching draped Sheila scarf.',
    icon: 'Sparkles',
    cultureTag: 'Gulf'
  },
  {
    id: 'bahrain-pearl-heritage',
    label: 'Bahraini Pearl Diver Heritage',
    description: 'Historic sea heritage cotton wizar, vest & sailor sash',
    promptText: 'Outfitted in historic Bahraini pearl diving seafaring heritage costume: natural unbleached cotton vest, traditional linen Wizar wrap, nautical sash belt, and pearl merchant pouch.',
    icon: 'Anchor',
    cultureTag: 'Bahrain'
  },
  {
    id: 'saudi-founding-dagla',
    label: 'Saudi Founding Day Dagla',
    description: 'Richly embroidered heritage floor-length ceremonial Dagla coat',
    promptText: 'Wearing an authentic Saudi Founding Day ceremonial Dagla / Sayah: full-length tailored heritage coat adorned with traditional Najdi geometric patterns and rich gold embroidery over white thobe.',
    icon: 'Feather',
    cultureTag: 'KSA'
  },
  {
    id: 'ardah-ceremonial',
    label: 'Ardah Bandolier & Janbiya Dagger',
    description: 'Ceremonial leather Mujannad ammo belts with ornate Janbiya',
    promptText: 'Wearing traditional Saudi Ardah ceremonial attire: crisp thobe with crossed leather Mujannad bandolier straps across chest and an ornate curved ceremonial Janbiya dagger with golden hilt tucked into the waist sash.',
    icon: 'Shield',
    cultureTag: 'KSA'
  },
  {
    id: 'modern-gulf-formal',
    label: 'Modern Gulf Executive (Thobe + Blazer)',
    description: 'Designer thobe paired with tailored Italian blazer',
    promptText: 'Wearing sophisticated modern Gulf executive fashion: tailored designer white thobe paired with a sharp navy or charcoal wool blazer jacket, minimalist white Ghutra, and luxury watch.',
    icon: 'Briefcase',
    cultureTag: 'Gulf'
  },
  {
    id: 'casual-hoodie',
    label: 'Casual (Hoodie & Jeans)',
    description: 'Cozy modern streetwear pullover hoodie',
    promptText: 'Wearing a cozy relaxed-fit streetwear pullover hoodie with cord drawstrings and comfortable denim jeans, relaxed collar.',
    icon: 'Shirt',
    cultureTag: 'Universal'
  },
  {
    id: 'professional-suit',
    label: 'Professional (Suit & Tie)',
    description: 'Tailored sharp suit jacket, crisp white collar',
    promptText: 'Dressed in a sharp tailored executive suit jacket with crisp peaked lapels, structured dress shirt, and sleek modern necktie.',
    icon: 'Briefcase',
    cultureTag: 'Universal'
  },
  {
    id: 'streetwear-tech',
    label: 'Streetwear / Techwear',
    description: 'Modular tactical utility vest & cargo jacket',
    promptText: 'Outfitted in futuristic cyberpunk techwear: high-collar tactical jacket, modular utility straps, chest buckles, and weather-resistant fabrics.',
    icon: 'Pocket',
    cultureTag: 'Universal'
  },
  {
    id: 'traditional-robes',
    label: 'Traditional / Minimalist Robes',
    description: 'Zen flowing kimono robes with clean drape',
    promptText: 'Wearing elegant flowing minimalist traditional crossover robes, natural linen textures, clean zen drape, and tailored sash belt.',
    icon: 'Feather',
    cultureTag: 'Universal'
  },
  {
    id: 'custom-override',
    label: 'Custom Text Override',
    description: 'Define your own bespoke costume or wardrobe',
    promptText: 'Custom wardrobe specified by the user.',
    icon: 'Edit3',
    cultureTag: 'Universal'
  }
];

export const EXPRESSIONS: ExpressionOption[] = [
  {
    id: 'confident-smile',
    label: 'Confident Smile',
    promptText: 'Warm, confident smile with bright engaging eyes and friendly demeanor.'
  },
  {
    id: 'playful-wink',
    label: 'Playful Wink',
    promptText: 'Playful expression with one eye winking cheekily and an amused smirk.'
  },
  {
    id: 'serious-stoic',
    label: 'Serious / Stoic',
    promptText: 'Calm, collected, stoic expression with steady gaze and focused intensity.'
  },
  {
    id: 'cheerful-laugh',
    label: 'Cheerful Laugh',
    promptText: 'Joyful open laughter with crescent eyes and genuine happiness.'
  },
  {
    id: 'intense-focus',
    label: 'Heroic Focus',
    promptText: 'Determined heroic expression with sharp focused eyebrows and fierce energy.'
  }
];

export const DEFAULT_SYSTEM_PROMPT =
  'Analyze the facial geometry, hair color/style, and distinct features of this portrait, then re-render the subject as a stylized character matching the selected art style, pose, and outfit while preserving the subject\'s distinct identity.';

