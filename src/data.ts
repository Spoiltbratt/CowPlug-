import { Investment, BlogArticle, AppNotification } from './types';

export const INVESTMENTS: Investment[] = [
  {
    id: 'inv-1',
    title: 'Calf',
    type: 'Cow',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800',
    price: 350000, // in NGN
    expectedReturn: 28, // 28% expected return
    durationMonths: 9,
    availableSlots: 45,
    totalSlots: 100,
    description: 'Purchase a young premium calf and let CowPlugNG manage every aspect of its growth. The animal belongs entirely to you from the day of purchase, professionally raised in our managed pastures.',
    location: 'Iseyin Farm, Oyo State',
    category: 'High-Yield Ranches',
    breed: 'Bunaji (White Fulani)',
    age: '6 Months',
    currentWeight: '120 kg',
    healthStatus: 'Excellent (Fully Vaccinated)',
    expectedValueAtMaturity: 448000
  },
  {
    id: 'inv-2',
    title: 'Goat Kid',
    type: 'Goat',
    image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&q=80&w=800',
    price: 85000, // NGN
    expectedReturn: 18, // 18% expected return
    durationMonths: 6,
    availableSlots: 124,
    totalSlots: 200,
    description: 'Purchase a complete young Red Sokoto goat kid. Known for rapid maturation and high demand in urban premium meat supply networks.',
    location: 'Wudil Feedlot, Kano State',
    category: 'Fast-Track Feedlot',
    breed: 'Red Sokoto',
    age: '4 Months',
    currentWeight: '12 kg',
    healthStatus: 'Excellent (Fully Vaccinated)',
    expectedValueAtMaturity: 100300
  },
  {
    id: 'inv-3',
    title: 'Ram Lamb',
    type: 'Ram',
    image: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800',
    price: 150000, // NGN
    expectedReturn: 22, // 22% expected return
    durationMonths: 6,
    availableSlots: 18,
    totalSlots: 80,
    description: 'Purchase a healthy young Balami ram lamb. Raised under standard feedlots with scientific nutrition plans to maximize health and growth weight.',
    location: 'Shagamu Ranches, Ogun State',
    category: 'Seasonal Festive Plan',
    breed: 'Balami Premium',
    age: '5 Months',
    currentWeight: '22 kg',
    healthStatus: 'Excellent (Fully Vaccinated)',
    expectedValueAtMaturity: 183000
  }
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'blog-1',
    title: 'Understanding Livestock Ownership in Nigeria: A Beginner’s Guide',
    category: 'Livestock Ownership',
    excerpt: 'How CowPlugNG uses professional management and dedicated pastures to simplify livestock ownership and maximize value for everyday customers.',
    date: 'June 28, 2026',
    author: 'Engr. Kabir Yusuf',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=800',
    content: 'The agricultural sector remains one of Nigeria’s largest contributors to GDP, and livestock is a major cornerstone. Yet, high operational complexity, animal disease risks, and lack of farmland have historically kept people away. This guide explains how professional cattle management, comprehensive veterinary logs, and state-of-the-art ranching infrastructure are democratizing complete livestock ownership across Sub-Saharan Africa...'
  },
  {
    id: 'blog-2',
    title: 'The Essentials of Professional Ranching & Biosecurity in Cattle Management',
    category: 'Livestock Care',
    excerpt: 'Exploring how strict veterinary registers, professional care, and physical records prevent disease and monitor livestock health.',
    date: 'June 15, 2026',
    author: 'Dr. Amina Bello (DVM)',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800',
    content: 'Traditional nomadic herding is rapidly giving way to structured, professional ranches in Nigeria. In this article, Dr. Amina Bello explains the exact management protocols behind CowPlugNG’s Oyo ranch, from scheduled veterinary checks to professional feeding plans that protect owners\' assets and keep local livestock incredibly healthy...'
  },
  {
    id: 'blog-3',
    title: 'Meat Supply Chain Dynamics: Solving Abuja & Lagos Bulk Demands',
    category: 'Meat Supply',
    excerpt: 'Why cold-chain logistics, certified slaughterhouses, and direct farmer-to-business agreements are reducing meat costs for premium hotels.',
    date: 'May 30, 2026',
    author: 'Chief Olumide Adebayo',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=800',
    content: 'Supermarkets, upscale hotels, and fast-growing restaurants in Lagos require tons of high-grade, premium beef daily. Historically, middle-men inflated prices by up to 150%. CowPlugNG is removing these friction points by directly sourcing from managed livestock lots, packing in refrigerated vans, and offering traceable, high-quality bulk meat supply at unparalleled local wholesale prices...'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'vaccination',
    title: 'Vaccination Alert: Calf Register',
    message: 'The scheduled Foot-and-Mouth Disease (FMD) booster vaccinations for your Calf are due in 48 hours.',
    date: '2026-07-01T10:00:00',
    read: false
  },
  {
    id: 'notif-2',
    type: 'feed',
    title: 'Fodder Plan Updated',
    message: 'Your Goat Kid\'s daily feeding plan has been optimized with high-protein alfalfa silage levels to enhance growth.',
    date: '2026-06-30T14:30:00',
    read: false
  },
  {
    id: 'notif-3',
    type: 'payout',
    title: 'Livestock Sale Proceeds Distributed',
    message: 'Success! Your matured Red Sokoto Goat has been successfully sold. The full purchase price plus growth profit has been credited to your account.',
    date: '2026-06-29T09:00:00',
    read: true
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Weekly Vet Report Ready',
    message: 'Chief Veterinary Officer Dr. Amina Bello has signed off on the weekly physical health inspection logs for your calf.',
    date: '2026-06-28T16:00:00',
    read: true
  }
];

export const FAQS = [
  {
    question: 'How does CowPlugNG secure my livestock?',
    answer: 'We secure your livestock through robust daily management protocols. We tag all animals with RFID chips and house them in gated, secure farms with round-the-clock physical security and professional veterinary personnel.'
  },
  {
    question: 'What is the price of an animal and its growth duration?',
    answer: 'You can purchase a Goat Kid for ₦85,000, a Ram Lamb for ₦150,000, or a Calf for ₦350,000. Growth and professional farm management durations range from 6 to 9 months, depending on the animal type, market cycle, and festive windows.'
  },
  {
    question: 'Can I physically visit the ranch where my livestock is kept?',
    answer: 'Absolutely! We believe in 100% transparency. Registered owners can book ranch tours via our dashboard. Tours occur on the last Saturday of every month in Oyo and Ogun Ranches.'
  },
  {
    question: 'How do I receive my funds if I decide to sell my animal?',
    answer: 'Upon maturity, you can choose to sell the animal through CowPlugNG. The full sales proceeds are paid directly into your CowPlugNG secure digital account. You can instantly withdraw directly to any verified Nigerian bank account (processed within 1-2 hours).'
  },
  {
    question: 'How do customers benefit from the platform?',
    answer: 'Customers get 100% complete ownership of a physical animal without needing farmland, feed supply networks, or herding experience. CowPlugNG handles the complex daily management while giving you regular digital updates.'
  },
  {
    question: 'Can businesses order customized bulk meat?',
    answer: 'Yes, we have a dedicated Meat Supply B2B wing. Hotels, schools, restaurants, and catering services can request quotes, specify custom cuts, and enjoy premium cold-chain delivery of hygienic beef, goat, or ram meat.'
  }
];
