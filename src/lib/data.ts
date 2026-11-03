export type EventCategory =
  | 'All Events'
  | 'Corporate'
  | 'Award Nights'
  | 'Conferences'
  | 'Panel Discussions'
  | 'Live Shows'
  | 'Product Launches';

export type GalleryCategory =
  | 'All Moments'
  | 'On Stage'
  | 'Audience'
  | 'Awards'
  | 'Panel Discussions'
  | 'Product Launches'
  | 'Corporate'
  | 'College Fest';

export const siteConfig = {
  brand: 'SIDD.WHIZZ',
  hostName: 'Siddharth “Sid” Maurya',
  title: 'Event Host • Emcee • Moderator • Public Speaker',
  tagline: 'Professional Hosting & Engagement Solutions for Every Kind of Event',
  email: 'bookings@siddwhizz.com',
  phoneDisplay: '+91 98765 43210',
  phoneRaw: '919876543210',
  whatsappRaw: '919876543210',
  location: 'Mumbai & Delhi NCR, India (Available Worldwide)',
  socials: {
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    linkedin: 'https://linkedin.com',
  },
};

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
] as const;

export const stats = [
  { value: '500+', label: 'Events Hosted', icon: 'mic' },
  { value: '8+', label: 'Years on Stage', icon: 'calendar' },
  { value: '100k+', label: 'Audience Engaged', icon: 'users' },
  { value: '99%', label: 'Client Retention', icon: 'trending' },
];

export const services = [
  {
    id: 'concerts',
    title: 'Music Concert Hosting',
    description: 'High-energy, crowd-driven hosting for concerts, artist nights, EDM festivals and live gigs.',
    image: '/images/concert.webp',
    icon: 'mic',
    tag: 'HIGH VOLTAGE',
  },
  {
    id: 'college-fests',
    title: 'College Fest & Campus Events',
    description: 'Youthful, relatable, electrifying hosting for college annual festivals and youth conclaves.',
    image: '/images/college-fest.webp',
    icon: 'graduation',
    tag: 'CAMPUS HIT',
  },
  {
    id: 'corporate',
    title: 'Corporate Events & Summits',
    description: 'Professional, impactful hosting for annual meets, business leadership summits and brand conferences.',
    image: '/images/corporate.webp',
    icon: 'building',
    tag: 'EXECUTIVE',
  },
  {
    id: 'weddings',
    title: 'Wedding & Sangeet Hosting',
    description: 'Warm, fun, emotional and well-orchestrated hosting for sangeet celebrations and private galas.',
    image: '/images/wedding.webp',
    icon: 'gem',
    tag: 'CELEBRATION',
  },
  {
    id: 'awards',
    title: 'Award Ceremonies',
    description: 'Graceful and captivating hosting for award nights, gala felicitations and honour ceremonies.',
    image: '/images/awards.webp',
    icon: 'star',
    tag: 'PRESTIGE',
  },
  {
    id: 'launches',
    title: 'Product Launches & Reveals',
    description: 'Energetic, brand-focused stage presentation for new product reveals and flagship activations.',
    image: '/images/product-launch.webp',
    icon: 'rocket',
    tag: 'BRAND FOCUS',
  },
  {
    id: 'panels',
    title: 'Panel Hosting & Live Moderation',
    description: 'Thoughtful moderating for fireside chats, CEO roundtables and live on-stage interviews.',
    image: '/images/panel.webp',
    icon: 'message',
    tag: 'INTELLECTUAL',
  },
  {
    id: 'speaking',
    title: 'Public Speaking & Keynotes',
    description: 'Motivational, thematic and custom storytelling sessions for special gatherings and conventions.',
    image: '/images/public-speaking.webp',
    icon: 'users',
    tag: 'INSPIRATIONAL',
  },
];

export const benefits = [
  { label: 'High Energy & Magnetic Charisma', icon: 'zap' },
  { label: 'Deep Audience Engagement', icon: 'users' },
  { label: 'Tailored Event Flow & Scripting', icon: 'target' },
  { label: 'Clear & Impactful Communication', icon: 'mic' },
  { label: 'Flawless Brand Alignment', icon: 'handshake' },
  { label: 'Unforgettable Stage Experience', icon: 'gem' },
];

export const processSteps = [
  { step: '1', title: 'Connect', text: 'Share your event concept, date, venue, and vision.', icon: 'calendar' },
  { step: '2', title: 'Plan', text: 'We align on overall tone, audience demographics, and key cues.', icon: 'clipboard' },
  { step: '3', title: 'Prepare', text: 'Script drafting, stage games, and AV coordination.', icon: 'settings' },
  { step: '4', title: 'Host', text: 'Electrifying, seamless, live on-stage execution.', icon: 'mic' },
  { step: '5', title: 'Deliver', text: 'An indelible, magical memory for guests and organizers alike.', icon: 'trophy' },
];

export const packages = [
  {
    name: 'Essential Host',
    icon: 'rocket',
    tagline: 'Ideal for single-session events & compact gatherings',
    features: [
      'Event hosting & timeline flow management',
      'Audience crowd engagement & warmups',
      'Standard on-stage speaker announcements',
      'Pre-event coordination call',
    ],
    buttonText: 'Book Essential',
    popular: false,
  },
  {
    name: 'Signature Host',
    icon: 'gem',
    tagline: 'Our most sought-after full-event hosting package',
    features: [
      'Everything included in Essential Host',
      'Customized scripting & bespoke event flow',
      'Interactive stage games & spontaneous crowd interaction',
      'Dedicated rehearsals & stage team synchronization',
      'Social media event tag & shoutout',
    ],
    buttonText: 'Book Signature Host',
    popular: true,
  },
  {
    name: 'Premium Experience',
    icon: 'crown',
    tagline: 'For marquee festivals, summits & multi-segment galas',
    features: [
      'Everything included in Signature Host',
      'End-to-end event consultation & creative planning support',
      'Multi-segment hosting (keynotes, fireside panels, awards)',
      'Brand integration & VIP celebrity moderation',
      'Post-event highlight voiceovers & host wrap-up',
    ],
    buttonText: 'Book Premium Experience',
    popular: false,
  },
];

export const portfolioEvents = [
  {
    id: 1,
    category: 'Corporate' as EventCategory,
    title: 'Annual Global Leadership Summit',
    role: 'HOST • EMCEE',
    description: 'High-impact executive leadership summit connecting 1,200+ global delegates with dynamic keynotes.',
    image: '/images/corporate-conference.webp',
  },
  {
    id: 2,
    category: 'Award Nights' as EventCategory,
    title: 'National Excellence Awards Gala',
    role: 'HOST • EMCEE',
    description: 'Glittering red-carpet awards night celebrating top achievers and industry pioneers.',
    image: '/images/award-trophy.webp',
  },
  {
    id: 3,
    category: 'Panel Discussions' as EventCategory,
    title: 'C-Suite Future Trends Forum',
    role: 'MODERATOR',
    description: 'Deep-dive moderated panel with leading industry CEOs discussing disruptive innovation and AI.',
    image: '/images/panel-discussion.webp',
  },
  {
    id: 4,
    category: 'Product Launches' as EventCategory,
    title: 'Next-Gen Flagship Product Reveal',
    role: 'HOST • EMCEE',
    description: 'Thrilling tech product launch featuring immersive visual reveals and media demonstrations.',
    image: '/images/product-launch.webp',
  },
  {
    id: 5,
    category: 'Live Shows' as EventCategory,
    title: 'Campus Mega Fest & Live Artist Night',
    role: 'HOST • EMCEE',
    description: 'Over 15,000 students singing and cheering in a high-octane concert night experience.',
    image: '/images/concert-stage.webp',
  },
  {
    id: 6,
    category: 'Conferences' as EventCategory,
    title: 'National Tech & Innovation Conclave',
    role: 'MODERATOR',
    description: 'Two-day convention with multi-track sessions, keynote moderation, and delegate Q&A.',
    image: '/images/auditorium-event.webp',
  },
];

export const videoReels = [
  {
    title: 'Corporate Summit Reel',
    subtitle: 'Executive stage presence & keynote pacing',
    image: '/images/corporate-conference.webp',
    duration: '2:15',
  },
  {
    title: 'Concert & Arena Crowd Energy',
    subtitle: 'Over 15,000 attendees screaming in sync',
    image: '/images/concert-stage.webp',
    duration: '1:45',
  },
  {
    title: 'Awards Night Moderation',
    subtitle: 'Sophistication, humor & emotional highs',
    image: '/images/award-trophy.webp',
    duration: '3:10',
  },
];

export const galleryMoments = [
  {
    id: 1,
    title: 'Behind the Mic',
    category: 'On Stage' as GalleryCategory,
    image: '/images/on-stage.webp',
    caption: 'Setting the mood under the stage spotlight',
  },
  {
    id: 2,
    title: 'A Room Full of Energy',
    category: 'Audience' as GalleryCategory,
    image: '/images/audience.webp',
    caption: 'Connecting with over 2,000 attendees',
  },
  {
    id: 3,
    title: 'Leadership Dialogues',
    category: 'Panel Discussions' as GalleryCategory,
    image: '/images/panel-discussion.webp',
    caption: 'Moderating a fireside conversation with industry titans',
  },
  {
    id: 4,
    title: 'A Moment Worth Celebrating',
    category: 'Awards' as GalleryCategory,
    image: '/images/award-moment.webp',
    caption: 'Honouring excellence and unforgettable achievements',
  },
  {
    id: 5,
    title: 'Ideas on the Main Stage',
    category: 'Corporate' as GalleryCategory,
    image: '/images/conference.webp',
    caption: 'Keynote delivery and audience facilitation',
  },
  {
    id: 6,
    title: 'Front Row Electric Energy',
    category: 'College Fest' as GalleryCategory,
    image: '/images/audience-engagement.webp',
    caption: 'Unmatched energy at university festival night',
  },
  {
    id: 7,
    title: 'The Craft of Hosting',
    category: 'On Stage' as GalleryCategory,
    image: '/images/black-and-white-host.webp',
    caption: 'Focus, rhythm and spontaneity in action',
  },
  {
    id: 8,
    title: 'The People Behind the Moment',
    category: 'Corporate' as GalleryCategory,
    image: '/images/team-moment.webp',
    caption: 'Celebrating with event organizers and crew',
  },
  {
    id: 9,
    title: 'A Big-Stage Reveal',
    category: 'Product Launches' as GalleryCategory,
    image: '/images/corporate-stage.webp',
    caption: 'Spectacular LED backdrop and brand launch',
  },
];

export const hostingPhilosophy = [
  {
    title: 'High Energy & Command',
    text: 'Owning the stage with charismatic presence, magnetic voice modulation, and infectious enthusiasm.',
    icon: 'zap',
  },
  {
    title: 'Audience-First Connection',
    text: 'Reading the room instinctively, turning passive spectators into active, energized participants.',
    icon: 'users',
  },
  {
    title: 'Seamless Flow & Rhythm',
    text: 'Punctual timing, graceful transitions between speakers, and unflappable handling of live surprises.',
    icon: 'target',
  },
  {
    title: 'Lasting Brand Impact',
    text: 'Ensuring your event’s core theme and identity shine brightly in every announcement and segment.',
    icon: 'gem',
  },
];

export const milestones = [
  {
    year: '2018',
    title: 'First Live Stage',
    text: 'Took the mic at premier university festivals, discovering the thrill of connecting with thousands of youth.',
  },
  {
    year: '2020',
    title: 'Corporate Breakthrough',
    text: 'Transitioned into high-stakes executive conferences, product launches, and virtual global summits.',
  },
  {
    year: '2022',
    title: 'Arena & Concert Stages',
    text: 'Anchored headliner concerts, celebrity nights, and stadium-level entertainment festivals.',
  },
  {
    year: '2024',
    title: 'National Conclaves & Galas',
    text: 'Became the preferred anchor for top Fortune 500 summits, government forums, and red-carpet award nights.',
  },
  {
    year: '2026',
    title: '500+ Stage Milestone',
    text: 'Celebrated over 500 successful stage productions across India and international destinations.',
  },
];

export const interests = [
  { label: 'Fitness & Boxing', icon: 'dumbbell' },
  { label: 'Live Music & Production', icon: 'music' },
  { label: 'Travel & Cultures', icon: 'plane' },
  { label: 'Storytelling & Books', icon: 'book' },
  { label: 'Cinematography', icon: 'camera' },
];

export const testimonials = [
  {
    quote: 'Sid brought an electrifying presence to our annual summit. His ability to keep 1,500 delegates engaged across a 6-hour marathon was simply masterclass.',
    author: 'Rajesh Varma',
    designation: 'Head of Brand & Events, TechCorp India',
  },
  {
    quote: 'From our opening video reveal to the final awards handover, Sid commanded the stage with unmatched charisma and impeccable comedic timing.',
    author: 'Ananya Deshmukh',
    designation: 'Festival Director, Zenith Cultural Conclave',
  },
  {
    quote: 'Reliable, extraordinarily well-prepared, and effortless under live pressure. Siddharth is our permanent first choice for all flagship launches.',
    author: 'Vikramaditya Roy',
    designation: 'Chief Marketing Officer, Apex Innovations',
  },
];
