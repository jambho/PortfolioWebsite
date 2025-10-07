'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProjectsPage() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  // Actual projects from resume
  type Project = {
    id: number;
    title: string;
    description: string;
    longDescription: string;
    tech: string[];
    status: string;
    date: string;
    role: string;
    features: string[];
    challenges: string;
    results: string;
    codeUrl?: string;
    demoUrl?: string;
  };

  const projects: Project[] = [
    {
      id: 1,
      title: "Discord AI Voice Cloning Bot",
      description: "A Discord bot capable of streaming, recording, and cloning voices in real-time with AI-powered conversational capabilities.",
      longDescription: "Developed an innovative Discord bot that combines real-time voice processing with AI voice cloning technology. The bot can stream, record, and clone voices instantly, providing users with celebrity and video game character voices. Integrated advanced audio processing with AI conversation capabilities using fine-tuned language models.",
      tech: ["Python", "Discord.py", "FFmpeg", "Chatterbox.ai", "Mistral 7B", "LoRA", "Machine Learning"],
      status: "In Progress",
      date: "August 2024 - Present",
      role: "AI/ML Engineer & Full Stack Developer",
      features: [
        "Real-time voice streaming and recording using FFmpeg and discord.ext.recv",
        "Zero-shot voice cloning with 15 preset celebrity and video game character voices",
        "Fine-tuned Mistral 7B model using Low-Rank Adaptation (LoRA)",
        "Synchronized Discord data streams for seamless audio processing"
      ],
      challenges: "Resolving synchronization challenges between Discord's data streams and implementing efficient voice cloning with minimal latency for real-time interaction.",
      results: "Successfully deployed for testing with a group of 10 users, achieving real-time voice cloning with instant response times.",
      // Optional links
      // codeUrl: "",
      // demoUrl: "",
    },
    {
      id: 2,
      title: "Dungeons and Dragons Desktop App",
      description: "A comprehensive desktop application built in Rust and TypeScript for playing Dungeons and Dragons with advanced token management.",
      longDescription: "Developed a full-featured desktop application for Dungeons and Dragons gameplay using Tauri framework. The app provides an extensible system for managing campaigns, players, and game entities with high-performance graphics rendering and data management.",
      tech: ["Rust", "TypeScript", "Tauri", "React", "SQLite", "Desktop Development"],
      status: "In Progress",
      date: "January 2024 - Present",
      role: "Full Stack Desktop Developer",
      features: [
        "Tauri backend with SQLite database for campaign and player data storage",
        "React frontend for graphics rendering and user interface",
        "Extensible system supporting 100+ entity tokens across 30+ maps",
        "Sub-50ms latency for real-time gameplay interactions"
      ],
      challenges: "Designing an extensible architecture that can handle large numbers of game entities while maintaining low latency for real-time gameplay.",
      results: "Achieved sub-50ms latency with support for 100+ tokens across 30+ maps, providing smooth gameplay experience.",
      // demoUrl: "", // Example placeholder
    },
    {
      id: 3,
      title: "SDSU Thrift Website",
      description: "An e-commerce platform facilitating sales between SDSU students with scalable architecture and optimized performance.",
      longDescription: "Led the development of a student marketplace platform in a team of four. Spearheaded top-level design decisions, framework selection, and backend implementation. The platform connects SDSU students for buying and selling items with a focus on performance and scalability.",
      tech: ["React", "Vite", "Material UI", "Django", "PostgreSQL", "Full Stack Web Development"],
      status: "Completed",
      date: "January 2024 - June 2024",
      role: "Lead Full Stack Developer",
      features: [
        "Responsive e-commerce platform with Material UI design system",
        "Django backend with PostgreSQL database for data management",
        "Vite build system for optimized frontend performance",
        "Scalable architecture supporting 1000+ user accounts"
      ],
      challenges: "Optimizing page load times and designing a scalable architecture that could handle growing user base with minimal hardware resources.",
      results: "Reduced page load time by 50% and implemented 40% of webpages, creating a scalable system handling 1000+ user accounts efficiently.",
      codeUrl: "https://github.com/leanneallen/sdsuthrift",
      // demoUrl: "",
    },
    {
      id: 4,
      title: "Music Box Cyberphysical System",
      description: "An intelligent music box that automatically adjusts volume based on ambient noise using embedded systems and feedback control.",
      longDescription: "Designed and implemented a cyberphysical system combining hardware and software to create an intelligent music box. The system uses sensors to detect ambient noise and automatically adjusts volume accordingly, demonstrating principles of embedded systems, control theory, and hardware-software integration.",
      tech: ["C++", "Arduino", "Embedded Systems", "PCB Design", "Finite State Machine", "Control Systems"],
      status: "Completed",
      date: "January 2024 - June 2024",
      role: "Embedded Systems Engineer",
      features: [
        "PCB schematics design and breadboard proof of concept",
        "Finite state machine model for volume control feedback loop",
        "Arduino-based embedded system with SD card audio storage",
        "Volume adjustment proportional to ambient noise detection"
      ],
      challenges: "Implementing a reliable feedback control system that accurately responds to ambient noise while maintaining smooth audio playback.",
      results: "Successfully created a working prototype with automatic volume adjustment based on environmental conditions, documented with comprehensive LaTeX documentation.",
      // codeUrl: "",
    },
    {
      id: 5,
      title: "Portfolio Website",
      description: "Personal portfolio website showcasing projects and skills with retro terminal aesthetic",
      longDescription: "A modern portfolio website built with Next.js and TypeScript, featuring a unique retro terminal aesthetic. The site includes responsive design, interactive animations, and a dedicated projects page. Built to showcase software engineering projects and provide contact information in a visually striking format that reflects both technical skills and design sensibility.",
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
        "Accessible design with proper semantic HTML"
      ],
      challenges: "Creating a cohesive retro design system while maintaining modern web performance and accessibility standards.",
      results: "A fully responsive portfolio website that effectively showcases technical projects and provides an engaging user experience.",
      // demoUrl: "https://your-live-portfolio-url.com", // Optional example
    }
  ];

  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  return (
    <div className="min-h-screen retro-grid">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold terminal-glow hover:text-accent transition-colors">
            ← JAMAL_BHOLA.exe
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link href="/#about" className="hover:text-accent transition-colors">About</Link>
            <Link href="/#contact" className="hover:text-accent transition-colors">Contact</Link>
          </div>
          <div className="text-sm font-mono text-accent">
            {currentTime}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black terminal-glow mb-6">
            PROJECTS
          </h1>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            A showcase of my software engineering and web development projects. 
            Each project represents a unique challenge and learning experience.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <button 
                key={project.id} 
                className="retro-card cursor-pointer group w-full text-left"
                onClick={() => setSelectedProject(project.id)}
              >
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-accent group-hover:glow-accent transition-all">
                      {project.title}
                    </h3>
                    <span className="text-xs font-mono text-accent bg-border px-2 py-1 rounded">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-secondary text-sm mb-4">
                    {project.description}
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span 
                        key={tech}
                        className="px-2 py-1 bg-border text-foreground text-xs font-mono rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs font-mono text-secondary">
                  <span>{project.date}</span>
                  <span className="text-accent hover:text-foreground transition-colors">
                    VIEW_DETAILS →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-card-bg border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {(() => {
                const project = projects.find(p => p.id === selectedProject);
                if (!project) return null;
                
                return (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-accent mb-2">
                          {project.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm font-mono text-secondary">
                          <span>STATUS: {project.status}</span>
                          <span>DATE: {project.date}</span>
                          <span>ROLE: {project.role}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedProject(null)}
                        className="text-foreground hover:text-accent transition-colors text-2xl font-bold"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Description</h3>
                        <p className="text-secondary leading-relaxed">
                          {project.longDescription}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Technologies Used</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech) => (
                            <span 
                              key={tech}
                              className="px-3 py-2 bg-border text-foreground text-sm font-mono rounded border border-foreground/20"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Key Features</h3>
                        <ul className="space-y-2">
                          {project.features.map((feature) => (
                            <li key={feature} className="text-secondary flex items-start gap-2">
                              <span className="text-accent font-mono">→</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Challenges</h3>
                        <p className="text-secondary leading-relaxed">
                          {project.challenges}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Results</h3>
                        <p className="text-secondary leading-relaxed">
                          {project.results}
                        </p>
                      </div>

                      <div className="flex gap-4 pt-6 border-t border-border">
                        {project.codeUrl && (
                          <a 
                            href={project.codeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="retro-btn px-6 py-3"
                          >
                            VIEW CODE
                          </a>
                        )}
                        {project.demoUrl && (
                          <a 
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-2 border-foreground text-foreground px-6 py-3 font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-all duration-300"
                          >
                            LIVE DEMO
                          </a>
                        )}
                        {!project.codeUrl && !project.demoUrl && (
                          <span className="text-secondary text-sm font-mono">
                            No public links available.
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-sm text-secondary font-mono">
            © 2024 Jamal Bhola. All rights reserved. | Built with Next.js & Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}
