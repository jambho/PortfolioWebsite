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
  github?: string;
};

export type SkillGroup = { label: string; skills: string[] };

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
    focusAreas: "Full-stack development, Mobile applications, IoT systems",
  },
  skills: [
    { label: "Frontend", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
    { label: "Backend", skills: ["Node.js", "Python", "Express.js", "Django"] },
    { label: "Database", skills: ["MongoDB", "PostgreSQL", "MySQL"] },
    { label: "Tools", skills: ["Git", "Docker", "AWS", "Linux"] },
  ] satisfies SkillGroup[],
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
      date: "August 2024 - Present",
      role: "AI/ML Engineer & Full Stack Developer",
      features: [
        "Real-time voice streaming and recording using FFmpeg and discord.ext.recv",
        "Zero-shot voice cloning with 15 preset celebrity and video game character voices",
        "Fine-tuned Mistral 7B model using Low-Rank Adaptation (LoRA)",
        "Synchronized Discord data streams for seamless audio processing",
      ],
      challenges:
        "Resolving synchronization challenges between Discord's data streams and implementing efficient voice cloning with minimal latency for real-time interaction.",
      results:
        "Successfully deployed for testing with a group of 10 users, achieving real-time voice cloning with instant response times.",
    },
    {
      id: 2,
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
    },
    {
      id: 3,
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
      github: "https://github.com/leanneallen/sdsuthrift",
    },
    {
      id: 4,
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
    },
    {
      id: 5,
      slug: "portfolio",
      file: "portfolio.tsx",
      title: "Portfolio Website",
      description:
        "Personal portfolio website showcasing projects and skills with retro terminal aesthetic",
      longDescription:
        "A modern portfolio website built with Next.js and TypeScript, featuring a unique retro terminal aesthetic. The site includes responsive design, interactive animations, and a dedicated projects page. Built to showcase software engineering projects and provide contact information in a visually striking format that reflects both technical skills and design sensibility.",
      tech: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Web Development"],
      status: "Completed",
      date: "December 2024 - Present",
      role: "Full Stack Developer",
      features: [
        "Retro terminal design aesthetic with glowing text effects",
        "Responsive mobile-first layout with Tailwind CSS",
        "Interactive typewriter animations and smooth transitions",
        "Dedicated projects showcase page with modal details",
        "Real-time clock display and live navigation",
        "Accessible design with proper semantic HTML",
      ],
      challenges:
        "Creating a cohesive retro design system while maintaining modern web performance and accessibility standards.",
      results:
        "A fully responsive portfolio website that effectively showcases technical projects and provides an engaging user experience.",
    },
  ] satisfies Project[],
  contact: {
    email: "jamal.bhola@gmail.com",
    cta: "Ready to collaborate on your next project? Let's build something amazing together.",
    location: "Los Angeles, CA",
    links: [
      { label: "GITHUB", href: "https://github.com/jamalbhola" },
      { label: "LINKEDIN", href: "https://linkedin.com/in/jamalbhola" },
      { label: "TWITTER", href: "https://twitter.com/jambho" },
    ],
  },
  resumeUrl: "/Jamal_Bhola_resume.pdf",
  footer: "Built with Next.js & Tailwind CSS",
};
