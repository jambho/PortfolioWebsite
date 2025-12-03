'use client';

import { useState, useEffect, useRef } from 'react';

interface TerminalHackProps {
  onComplete: () => void;
}

interface OutputLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'success';
}

export default function TerminalHack({ onComplete }: TerminalHackProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([
    { text: 'SYSTEM BREACH DETECTED...', type: 'error' },
    { text: 'Establishing secure connection...', type: 'output' },
    { text: 'Connection established. Welcome to THE MATRIX.', type: 'success' },
    { text: '', type: 'output' },
    { text: 'Type "help" for available commands.', type: 'output' },
  ]);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [secretsDecrypted, setSecretsDecrypted] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (text: string, type: OutputLine['type'] = 'output') => {
    setOutput(prev => [...prev, { text, type }]);
  };

  const handleCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    addOutput(`$ ${cmd}`, 'command');

    switch (command) {
      case 'help':
        addOutput('Available commands:', 'output');
        addOutput('  whoami      - Display current user information', 'output');
        addOutput('  ls -la      - List files in current directory', 'output');
        addOutput('  decrypt     - Decrypt encrypted files', 'output');
        addOutput('  run         - Execute programs', 'output');
        addOutput('  clear       - Clear terminal', 'output');
        addOutput('  neo         - ???', 'output');
        addOutput('  trinity     - ???', 'output');
        addOutput('  morpheus    - ???', 'output');
        break;

      case 'whoami':
        addOutput('User: Potential_Recruit', 'success');
        addOutput('Clearance: Level 0', 'output');
        addOutput('Status: Under Evaluation', 'output');
        addOutput('Location: The Matrix', 'output');
        break;

      case 'ls -la':
      case 'ls':
        addOutput('total 42', 'output');
        addOutput('drwxr-xr-x  2 root root  4096 Dec  2 23:59 .', 'output');
        addOutput('drwxr-xr-x  3 root root  4096 Dec  2 23:58 ..', 'output');
        addOutput('-rw-------  1 root root  2048 Dec  2 23:59 secrets.enc', 'output');
        addOutput('-rw-r--r--  1 root root  1024 Dec  2 23:59 reality.matrix', 'output');
        addOutput('-rwxr-xr-x  1 root root  8192 Dec  2 23:59 architect.exe', 'output');
        break;

      case 'decrypt secrets.enc':
      case 'decrypt':
        if (!encryptionKey) {
          addOutput('Access Denied. Prove yourself worthy.', 'error');
          addOutput('Hint: Complete the Light Cycle challenge to obtain the encryption key.', 'output');
        } else {
          addOutput('Decrypting secrets.enc...', 'output');
          setTimeout(() => {
            addOutput('Decryption successful!', 'success');
            addOutput('Contents of secrets.enc:', 'output');
            addOutput('  "The Matrix is everywhere. It is all around us."', 'output');
            addOutput('  "You have proven yourself worthy."', 'output');
            addOutput('  "Now run architect.exe to continue your journey."', 'output');
            setSecretsDecrypted(true);
          }, 1500);
        }
        break;

      case 'run architect.exe':
      case 'run architect':
      case './architect.exe':
      case 'architect.exe':
        addOutput('Launching architect.exe...', 'output');
        addOutput('Initializing system protocols...', 'output');
        addOutput('Loading simulation parameters...', 'output');
        setTimeout(() => {
          addOutput('Launch successful. Entering the Grid...', 'success');
          setTimeout(() => {
            onComplete();
          }, 1000);
        }, 1500);
        break;

      case 'neo':
        addOutput('You are not the one. Not yet, anyway.', 'success');
        addOutput('But you could be...', 'output');
        break;

      case 'trinity':
        addOutput('Trinity: "Neo, I know you can hear me."', 'success');
        addOutput('Trinity: "I\'m not afraid anymore."', 'output');
        addOutput('Trinity: "The Oracle told me I would fall in love, and that man... the man I loved would be the One."', 'output');
        break;

      case 'morpheus':
        addOutput('Morpheus: "What is real? How do you define real?"', 'success');
        addOutput('Morpheus: "If you\'re talking about what you can feel, what you can smell, taste and see..."', 'output');
        addOutput('Morpheus: "Then real is simply electrical signals interpreted by your brain."', 'output');
        break;

      case 'there is no spoon':
        addOutput('Spoon Boy: "Do not try and bend the spoon. That\'s impossible."', 'success');
        addOutput('Spoon Boy: "Instead, only try to realize the truth."', 'output');
        addOutput('Spoon Boy: "There is no spoon."', 'output');
        addOutput('Encryption key unlocked: MATRIX_2025', 'success');
        setEncryptionKey('MATRIX_2025');
        break;

      case 'clear':
        setOutput([]);
        break;

      case 'exit':
      case 'quit':
        addOutput('There is no escape from the Matrix.', 'error');
        break;

      case '':
        break;

      default:
        addOutput(`Command not found: ${cmd}`, 'error');
        addOutput('Type "help" for available commands.', 'output');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div className="terminal-overlay">
      <div className="terminal-container">
        <div className="terminal-header">
          <div className="terminal-buttons">
            <span className="terminal-button close"></span>
            <span className="terminal-button minimize"></span>
            <span className="terminal-button maximize"></span>
          </div>
          <div className="terminal-title">
            MATRIX_TERMINAL v2.0 - SECURE CONNECTION ESTABLISHED
          </div>
        </div>

        <div className="terminal-body" ref={terminalRef}>
          {output.map((line, index) => (
            <div
              key={index}
              className={`terminal-line ${line.type}`}
            >
              {line.text}
            </div>
          ))}

          <form onSubmit={handleSubmit} className="terminal-input-line">
            <span className="terminal-prompt">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="terminal-input"
              autoFocus
              spellCheck={false}
            />
          </form>
        </div>

        <div className="terminal-footer">
          <div className="text-xs text-secondary">
            Press ESC to close | Current directory: /matrix/system
          </div>
        </div>
      </div>

      {/* Tron Grid Background */}
      <div className="tron-grid-background"></div>
    </div>
  );
}
