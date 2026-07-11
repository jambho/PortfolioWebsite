export type Metric = { value: string; label: string };

export type Project = {
  id: number;
  slug: string;
  file: string;
  title: string;
  description: string;
  longDescription: string;
  tech: string[];
  status: "In Progress" | "Completed";
  date: string;
  role: string;
  features: string[];
  challenges: string;
  results: string;
  metrics?: Metric[];
  github?: string;
};

export type SkillGroup = { label: string; skills: string[] };

export type Experience = {
  role: string;
  org: string;
  date: string;
  bullets: string[];
};

export const content = {
  identity: {
    name: "Jamal Bhola",
    first: "JAMAL",
    last: "BHOLA",
    tagline: "Software Engineer & Web Developer",
    school: "San Diego State University",
    schoolLine: "Computer Engineering Graduate from San Diego State University",
    specialization:
      "Specializing in software development, web technologies, and system architecture",
    location: "Los Angeles, CA",
  },
  about: {
    education: [
      {
        degree: "Bachelor of Science in Computer Engineering",
        school: "San Diego State University",
      },
    ],
    specialization: "Software Development, Web Technologies, System Design",
    focusAreas: "Full-stack web, mobile applications, embedded systems & FPGA design",
  },
  skills: [
    { label: "Languages", skills: ["TypeScript", "Python", "C/C++", "Java"] },
    { label: "Web", skills: ["React", "Next.js", "Node.js", "Django"] },
    { label: "Hardware", skills: ["Verilog / FPGA", "Arduino", "PCB Design"] },
    { label: "Tools", skills: ["Git", "Docker", "AWS", "Linux"] },
  ] satisfies SkillGroup[],
  experience: [
    {
      role: "Full Stack Developer",
      org: "Client Project (Contract)",
      date: "December 2024 - Present",
      bullets: [
        "Work directly with the client to track feature requests and bugs, prioritizing client satisfaction",
        "Facilitated the transfer to a monetized structure, refactoring the codebase for security",
        "Fixed 50+ high-priority bugs using a testing and integration pipeline",
      ],
    },
    {
      role: "IT Services Help Desk Student Analyst",
      org: "San Diego State University",
      date: "January 2024 - December 2024",
      bullets: [
        "Provided in-person and remote technical support for students, faculty, and staff, handling ServiceNow tickets",
        "Assisted with network troubleshooting, account management, software issues, and two-factor authentication setup",
      ],
    },
    {
      role: "Electrical Engineering Team",
      org: "SDSU Mechatronics",
      date: "August 2022 - December 2023",
      bullets: [
        "Collaborated within a 50+ member cross-functional team, synchronizing efforts among electrical, mechanical, and software engineering sub-teams",
        "Spearheaded hardware integration initiatives, taking charge of integrating the submarine's headlights into the system",
        "Optimized the optical design of the headlights to achieve superior illumination, enhancing overall performance",
      ],
    },
  ] satisfies Experience[],
  projects: [
    {
      id: 1,
      slug: "voice_bot",
      file: "voice_bot.py",
      title: "Discord AI Voice Cloning Bot",
      description:
        "A Discord bot capable of streaming, recording, and cloning voices in real-time with AI-powered conversational capabilities.",
      longDescription:
        "Developed an innovative Discord bot that combines real-time voice processing with AI voice cloning technology. The bot can stream, record, and clone voices instantly, providing users with celebrity and video game character voices. Integrated advanced audio processing with AI conversation capabilities using fine-tuned language models.",
      tech: ["Python", "Discord.py", "FFmpeg", "Chatterbox.ai", "Mistral 7B", "LoRA", "Machine Learning"],
      status: "In Progress",
      date: "August 2025 - Present",
      role: "AI/ML Engineer & Full Stack Developer",
      features: [
        "Real-time voice streaming and recording using FFmpeg and discord.ext.recv",
        "Zero-shot voice cloning with 15 preset celebrity and video game character voices",
        "Evaluated 4 voice cloning libraries before selecting Chatterbox.ai's zero-shot model",
        "Fine-tuned Mistral 7B model using Low-Rank Adaptation (LoRA)",
        "GPU-accelerated AI inference for smooth real-time audio generation and playback",
      ],
      challenges:
        "Resolving synchronization challenges between Discord's data streams and implementing efficient voice cloning with minimal latency for real-time interaction.",
      results:
        "Successfully deployed for testing with a group of 10 users, achieving real-time voice cloning with instant response times.",
      metrics: [
        { value: "15", label: "PRESET VOICES" },
        { value: "10", label: "LIVE TESTERS" },
        { value: "0-SHOT", label: "VOICE CLONING" },
        { value: "GPU", label: "REAL-TIME INFERENCE" },
      ],
    },
    {
      id: 2,
      slug: "rhythm_game",
      file: "rhythm_game.v",
      title: "FPGA Rhythm Game",
      description:
        "A playable rhythm game running on bare silicon — Verilog on an Artix-7 FPGA with a soft-core CPU, VGA video, and audio output.",
      longDescription:
        "Built a complete rhythm game at the hardware level on an Artix-7 FPGA. Programmed the FPGA fabric, volatile and non-volatile memory, a soft IP core CPU, and a VGA video pipeline in Verilog, and designed a custom memory map so the CPU, video timing logic, and game state could share memory cleanly. The result is a game with synchronized video and audio output that runs with no operating system underneath — every layer of the stack, from pixels to game logic, is custom digital design.",
      tech: ["Verilog", "FPGA", "Artix-7", "VGA", "Digital Design", "Computer Architecture"],
      status: "Completed",
      date: "August 2024 - December 2025",
      role: "Digital Design Engineer",
      features: [
        "Artix-7 FPGA programming spanning fabric, volatile, and non-volatile memory",
        "Soft IP core CPU integrated alongside custom game logic",
        "VGA video output pipeline with synchronized audio",
        "Custom memory map coordinating CPU, video, and game state",
        "Comprehensive technical report and top-level block diagram",
      ],
      challenges:
        "Designing a memory map that lets a soft IP core CPU, VGA timing logic, and live game state share volatile and non-volatile memory without contention — all while keeping video and audio output synchronized.",
      results:
        "A working rhythm game with synchronized video and audio running entirely on the FPGA, documented with a comprehensive technical report and top-level block diagram.",
      metrics: [
        { value: "ARTIX-7", label: "FPGA TARGET" },
        { value: "VGA", label: "VIDEO PIPELINE" },
        { value: "SOFT-CORE", label: "CPU" },
        { value: "0", label: "OS UNDERNEATH" },
      ],
    },
    {
      id: 3,
      slug: "dnd_app",
      file: "dnd_app.rs",
      title: "Dungeons and Dragons Desktop App",
      description:
        "A comprehensive desktop application built in Rust and TypeScript for playing Dungeons and Dragons with advanced token management.",
      longDescription:
        "Developed a full-featured desktop application for Dungeons and Dragons gameplay using Tauri framework. The app provides an extensible system for managing campaigns, players, and game entities with high-performance graphics rendering and data management.",
      tech: ["Rust", "TypeScript", "Tauri", "React", "SQLite", "Desktop Development"],
      status: "In Progress",
      date: "January 2024 - Present",
      role: "Full Stack Desktop Developer",
      features: [
        "Tauri backend with SQLite database for campaign and player data storage",
        "React frontend for graphics rendering and user interface",
        "Extensible system supporting 100+ entity tokens across 30+ maps",
        "Sub-50ms latency for real-time gameplay interactions",
      ],
      challenges:
        "Designing an extensible architecture that can handle large numbers of game entities while maintaining low latency for real-time gameplay.",
      results:
        "Achieved sub-50ms latency with support for 100+ tokens across 30+ maps, providing smooth gameplay experience.",
      metrics: [
        { value: "<50ms", label: "INPUT LATENCY" },
        { value: "100+", label: "ENTITY TOKENS" },
        { value: "30+", label: "MAPS" },
      ],
    },
    {
      id: 4,
      slug: "sdsu_thrift",
      file: "sdsu_thrift.tsx",
      title: "SDSU Thrift Website",
      description:
        "An e-commerce platform facilitating sales between SDSU students with scalable architecture and optimized performance.",
      longDescription:
        "Led the development of a student marketplace platform in a team of four. Spearheaded top-level design decisions, framework selection, and backend implementation. The platform connects SDSU students for buying and selling items with a focus on performance and scalability.",
      tech: ["React", "Vite", "Material UI", "Django", "PostgreSQL", "Full Stack Web Development"],
      status: "Completed",
      date: "January 2024 - June 2024",
      role: "Lead Full Stack Developer",
      features: [
        "Responsive e-commerce platform with Material UI design system",
        "Django backend with PostgreSQL database for data management",
        "Vite build system for optimized frontend performance",
        "Scalable architecture supporting 1000+ user accounts",
      ],
      challenges:
        "Optimizing page load times and designing a scalable architecture that could handle growing user base with minimal hardware resources.",
      results:
        "Reduced page load time by 50% and implemented 40% of webpages, creating a scalable system handling 1000+ user accounts efficiently.",
      metrics: [
        { value: "-50%", label: "PAGE LOAD TIME" },
        { value: "1000+", label: "USER ACCOUNTS" },
        { value: "40%", label: "OF PAGES SHIPPED" },
        { value: "4", label: "PERSON TEAM (LEAD)" },
      ],
      github: "https://github.com/leanneallen/sdsuthrift",
    },
    {
      id: 5,
      slug: "music_box",
      file: "music_box.cpp",
      title: "Music Box Cyberphysical System",
      description:
        "An intelligent music box that automatically adjusts volume based on ambient noise using embedded systems and feedback control.",
      longDescription:
        "Designed and implemented a cyberphysical system combining hardware and software to create an intelligent music box. The system uses sensors to detect ambient noise and automatically adjusts volume accordingly, demonstrating principles of embedded systems, control theory, and hardware-software integration.",
      tech: ["C++", "Arduino", "Embedded Systems", "PCB Design", "Finite State Machine", "Control Systems"],
      status: "Completed",
      date: "January 2024 - June 2024",
      role: "Embedded Systems Engineer",
      features: [
        "PCB schematics design and breadboard proof of concept",
        "Finite state machine model for volume control feedback loop",
        "Arduino-based embedded system with SD card audio storage",
        "Volume adjustment proportional to ambient noise detection",
      ],
      challenges:
        "Implementing a reliable feedback control system that accurately responds to ambient noise while maintaining smooth audio playback.",
      results:
        "Successfully created a working prototype with automatic volume adjustment based on environmental conditions, documented with comprehensive LaTeX documentation.",
      metrics: [
        { value: "PCB", label: "CUSTOM SCHEMATIC" },
        { value: "FSM", label: "FEEDBACK CONTROL" },
        { value: "C++", label: "BARE-METAL" },
      ],
    },
    {
      id: 6,
      slug: "headcount",
      file: "headcount.tsx",
      title: "Headcount",
      description:
        "A cross-platform mobile app that helps groups coordinate and get out the door on time — no chaos, no stragglers.",
      longDescription:
        "Designed and built a mobile app for group departure coordination — whether you're a parent wrangling kids for school or a group of friends heading out for the night, Headcount keeps everyone's readiness visible so the whole group leaves on time. Built solo from product concept to working app on Expo and React Native, with a fully typed TypeScript codebase and file-based routing via Expo Router, targeting iOS and Android from a single codebase.",
      tech: ["React Native", "Expo", "TypeScript", "Expo Router", "Mobile Development"],
      status: "In Progress",
      date: "2025",
      role: "Product Designer & Mobile Developer",
      features: [
        "Single TypeScript codebase targeting both iOS and Android",
        "Built on Expo with file-based routing via Expo Router",
        "Group readiness at a glance — designed around on-time departures",
        "Solo-built end to end: product concept, UX, and implementation",
      ],
      challenges:
        "Designing a coordination UX that people can actually use while getting ready to leave — the app has seconds, not minutes, of user attention to communicate who is ready and who is holding the group up.",
      results:
        "A working Expo app in active development, taking one everyday problem from product idea to running code on both major mobile platforms.",
      metrics: [
        { value: "iOS+ANDROID", label: "ONE CODEBASE" },
        { value: "SOLO", label: "CONCEPT TO APP" },
      ],
      github: "https://github.com/jambho/Headcount",
    },
    {
      id: 7,
      slug: "jb_os",
      file: "jb_os.tsx",
      title: "JB-OS Portfolio Terminal",
      description:
        "The site you are looking at — a fullscreen sci-fi terminal cockpit built from scratch in Next.js with zero animation libraries.",
      longDescription:
        "Rebuilt this portfolio as JB-OS: a fullscreen, eDEX-UI-inspired terminal cockpit with a cinematic boot sequence, a tabbed terminal with a working shell, and live canvas instrument panels — all hand-rolled. Every widget draws on a single shared requestAnimationFrame ticker that pauses when the tab is hidden; five switchable color themes run through split-channel CSS custom properties; every sound effect is synthesized at runtime with the Web Audio API, so the site ships zero audio files and zero animation libraries. Panels are server-rendered for SEO, hydration-safe, and guarded by a Vitest suite that includes content-preservation tests.",
      tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Canvas API", "Web Audio API", "Vitest"],
      status: "Completed",
      date: "December 2024 - Present",
      role: "Design Engineer & Full Stack Developer",
      features: [
        "Cinematic boot sequence with session gating and a pre-hydration splash",
        "Working terminal shell — try `help`, `theme matrix`, `neofetch`, or `open 2`",
        "Five switchable themes driven by split-channel CSS custom properties",
        "Canvas instrument panels on one shared rAF ticker that pauses on hidden tabs",
        "All SFX synthesized live with the Web Audio API — zero audio files shipped",
        "Accessible: reduced-motion support, sr-only fallbacks, keyboard-navigable tabs",
      ],
      challenges:
        "Recreating the feel of an animation-heavy native app (eDEX-UI) on the open web without any animation, canvas, or audio libraries — while keeping server rendering, hydration safety, and accessibility intact.",
      results:
        "Live on Vercel with every instrument hand-built, a Vitest suite guarding content and behavior, and a single added UI dependency (augmented-ui) for the panel chamfers.",
      metrics: [
        { value: "5", label: "SWITCHABLE THEMES" },
        { value: "0", label: "ANIMATION LIBS" },
        { value: "0", label: "AUDIO FILES" },
        { value: "1", label: "SHARED rAF TICKER" },
      ],
      github: "https://github.com/jambho/PortfolioWebsite",
    },
  ] satisfies Project[],
  contact: {
    email: "jamal.bhola@gmail.com",
    cta: "Ready to collaborate on your next project? Let's build something amazing together.",
    location: "Los Angeles, CA",
    links: [
      { label: "GITHUB", href: "https://github.com/jambho" },
      { label: "LINKEDIN", href: "https://linkedin.com/in/jamalbhola" },
      { label: "TWITTER", href: "https://twitter.com/jambho" },
    ],
  },
  resumeUrl: "/Jamal_Bhola_resume.pdf",
  footer: "Built with Next.js & Tailwind CSS",
};
