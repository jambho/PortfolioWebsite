'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MatrixAdventure from './components/easter-egg/MatrixAdventure';

export default function Home() {
  const [currentTime, setCurrentTime] = useState('');
  const [typedText, setTypedText] = useState('');
  const fullText = "Software Engineer & Web Developer";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Typewriter effect
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);

    return () => {
      clearInterval(timeInterval);
      clearInterval(typeInterval);
    };
  }, []);

  const projects = [
    {
      id: 1,
      title: "Discord AI Voice Cloning Bot",
      description: "Developed a Discord bot capable of streaming, recording, and cloning voices in real-time for a group of 10 testers",
      tech: ["Python", "Discord.py", "FFmpeg", "Chatterbox.ai", "Mistral 7B", "LoRA"],
      status: "In Progress"
    },
    {
      id: 2,
      title: "Dungeons and Dragons Desktop App",
      description: "Developed a desktop application in Rust and TypeScript used to play Dungeons and Dragons",
      tech: ["Rust", "TypeScript", "Tauri", "React", "SQLite"],
      status: "In Progress"
    },
    {
      id: 3,
      title: "SDSU Thrift Website",
      description: "In a team of four, created an e-commerce website that facilitates sales between SDSU students",
      tech: ["Vite", "React", "Material UI", "Django", "PostgreSQL"],
      status: "Completed"
    },
    {
      id: 4,
      title: "Music Box Cyberphysical System",
      description: "Built a cyberphysical system using Arduino and C++ that plays music from an SD card",
      tech: ["C++", "Arduino", "SD Card", "Hardware"],
      status: "Completed"
    },
    {
      id: 5,
      title: "Portfolio Website",
      description: "Personal portfolio website showcasing projects and skills with retro terminal aesthetic",
      tech: ["Next.js", "TypeScript", "Tailwind CSS", "React"],
      status: "Completed"
    }
  ];

  return (
    <div className="min-h-screen retro-grid">
      {/* Matrix Adventure Easter Egg */}
      <MatrixAdventure />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold terminal-glow">
            JAMAL_BHOLA.exe
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#about" className="hover:text-accent transition-colors">About</a>
            <a href="#projects" className="hover:text-accent transition-colors">Projects</a>
            <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
          </div>
          <div className="text-sm font-mono text-accent">
            {currentTime}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black terminal-glow mb-4">
              JAMAL
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold glow-accent mb-6">
              BHOLA
            </h2>
            <div className="text-xl md:text-2xl font-mono text-secondary mb-4">
              <span className="cursor-blink">{typedText}</span>
            </div>
          </div>
          
          <div className="mb-8 text-lg">
            <p className="mb-4">
              Computer Engineering Graduate from{' '}
              <span className="text-accent font-bold">San Diego State University</span>
            </p>
            <p className="text-secondary">
              Specializing in software development, web technologies, and system architecture
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects" className="retro-btn px-8 py-4 rounded-none text-center">
              View Projects
            </Link>
            <a 
              href="/Jamal_Bhola_resume.pdf" 
              target="_blank"
              className="border-2 border-foreground text-foreground px-8 py-4 font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Download Resume
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 terminal-glow">
            ABOUT_ME
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="retro-card">
              <h3 className="text-2xl font-bold mb-6 text-accent">
                Education & Background
              </h3>
              <div className="space-y-4 text-secondary">
                <div>
                  <strong className="text-foreground">Bachelor of Science in Computer Engineering</strong><br />
                  San Diego State University
                </div>
                <div>
                  <strong className="text-foreground">Specialization:</strong> Software Development, Web Technologies, System Design
                </div>
                <div>
                  <strong className="text-foreground">Focus Areas:</strong> Full-stack development, Mobile applications, IoT systems
                </div>
              </div>
            </div>

            <div className="retro-card">
              <h3 className="text-2xl font-bold mb-6 text-accent">
                Skills & Technologies
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-foreground">Frontend:</strong><br />
                  React, Next.js, TypeScript, Tailwind CSS
                </div>
                <div>
                  <strong className="text-foreground">Backend:</strong><br />
                  Node.js, Python, Express.js, Django
                </div>
                <div>
                  <strong className="text-foreground">Database:</strong><br />
                  MongoDB, PostgreSQL, MySQL
                </div>
                <div>
                  <strong className="text-foreground">Tools:</strong><br />
                  Git, Docker, AWS, Linux
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 terminal-glow">
            PROJECTS
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="retro-card">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-accent mb-2">
                    {project.title}
                  </h3>
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
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-accent">
                    STATUS: {project.status}
                  </span>
                  <button className="text-foreground hover:text-accent transition-colors text-sm font-mono">
                    VIEW_CODE →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16 terminal-glow">
            GET_IN_TOUCH
          </h2>
          
          <div className="retro-card max-w-2xl mx-auto">
            <p className="text-lg mb-8 text-secondary">
              Ready to collaborate on your next project? Let's build something amazing together.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-2">EMAIL</div>
                <a href="mailto:jamal.bhola@gmail.com" className="text-foreground hover:text-accent transition-colors font-mono">
                  jamal.bhola@gmail.com
                </a>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-2">LOCATION</div>
                <div className="text-foreground font-mono">
                  Los Angeles, CA
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-6">
              <a href="https://github.com/jamalbhola" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors text-lg">
                GitHub
              </a>
              <a href="https://linkedin.com/in/jamalbhola" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors text-lg">
                LinkedIn
              </a>
              <a href="https://twitter.com/jambho" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors text-lg">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-sm text-secondary font-mono">
            © 2024 Jamal Bhola. All rights reserved. | Built with Next.js & Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}
