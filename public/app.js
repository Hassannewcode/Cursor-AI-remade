// Enhanced AI Agents Platform - Frontend JavaScript
class EnhancedAgentsApp {
    constructor() {
        this.socket = io();
        this.currentDemo = null;
        this.sessionId = this.generateSessionId();
        this.agentTypes = {};
        this.isConnected = false;
        this.progressTimer = null;
        
        this.init();
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    init() {
        this.setupSocketListeners();
        this.setupEventListeners();
        this.setupAnimations();
        this.loadCapabilities();
        this.initializeTerminalAnimation();
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('🔗 Connected to Enhanced Agents Platform');
            this.isConnected = true;
            this.updateConnectionStatus(true);
            this.socket.emit('join_session', this.sessionId);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from platform');
            this.isConnected = false;
            this.updateConnectionStatus(false);
        });

        this.socket.on('session_joined', (data) => {
            console.log(`✅ Joined session: ${data.sessionId}`);
        });

        this.socket.on('agent_created', (agent) => {
            this.onAgentCreated(agent);
        });

        this.socket.on('demo_agent_created', (agent) => {
            this.onDemoAgentCreated(agent);
        });

        this.socket.on('agent_progress', (progress) => {
            this.updateAgentProgress(progress);
        });

        this.socket.on('task_completed', (result) => {
            this.onTaskCompleted(result);
        });

        this.socket.on('demo_error', (error) => {
            this.showError(`Demo Error: ${error.error}`);
        });
    }

    setupEventListeners() {
        // Navigation smooth scrolling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.smoothScrollTo(targetId);
            });
        });

        // Hero action buttons
        const startDemoBtn = document.getElementById('startDemo');
        const tryDemoBtn = document.getElementById('tryDemo');
        const watchVideoBtn = document.getElementById('watchVideo');

        if (startDemoBtn) {
            startDemoBtn.addEventListener('click', () => {
                this.smoothScrollTo('demo');
                this.highlightDemoSection();
            });
        }

        if (tryDemoBtn) {
            tryDemoBtn.addEventListener('click', () => {
                this.smoothScrollTo('demo');
                this.highlightDemoSection();
            });
        }

        if (watchVideoBtn) {
            watchVideoBtn.addEventListener('click', () => {
                this.showVideoModal();
            });
        }

        // Demo controls
        const startAgentDemoBtn = document.getElementById('startAgentDemo');
        if (startAgentDemoBtn) {
            startAgentDemoBtn.addEventListener('click', () => {
                this.startAgentDemo();
            });
        }

        // Feature card interactions
        this.setupFeatureCardAnimations();

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Intersection Observer for animations
        this.setupScrollAnimations();
    }

    setupAnimations() {
        // Terminal typing animation
        this.animateTerminalOutput();
        
        // Feature step animations
        this.animateFeatureSteps();
        
        // Floating animations
        this.initFloatingElements();
    }

    initializeTerminalAnimation() {
        const terminalOutput = document.querySelector('.terminal-output');
        if (!terminalOutput) return;

        const items = terminalOutput.querySelectorAll('.analysis-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 500 + (index * 500));
        });
    }

    animateTerminalOutput() {
        const commands = [
            'analyze --codebase ./src --depth=full',
            'plan --task="implement user auth" --complexity=high',
            'generate --component=Dashboard --tests=true',
            'refactor --pattern="legacy code" --safe-mode=on',
            'optimize --bundle-size --performance'
        ];

        const terminalLine = document.querySelector('.terminal-line .command');
        if (!terminalLine) return;

        let currentIndex = 0;
        setInterval(() => {
            terminalLine.textContent = commands[currentIndex];
            currentIndex = (currentIndex + 1) % commands.length;
        }, 4000);
    }

    animateFeatureSteps() {
        const steps = document.querySelectorAll('.planning-steps .step');
        if (steps.length === 0) return;

        let currentStep = 0;
        setInterval(() => {
            steps.forEach(step => step.classList.remove('active'));
            steps[currentStep].classList.add('active');
            currentStep = (currentStep + 1) % steps.length;
        }, 2000);
    }

    initFloatingElements() {
        // Add subtle floating animation to feature icons
        const featureIcons = document.querySelectorAll('.feature-icon');
        featureIcons.forEach((icon, index) => {
            icon.style.animationDelay = `${index * 0.5}s`;
            icon.classList.add('floating');
        });

        // Add floating animation via CSS
        if (!document.querySelector('#floating-animations')) {
            const style = document.createElement('style');
            style.id = 'floating-animations';
            style.textContent = `
                .floating {
                    animation: gentle-float 4s ease-in-out infinite;
                }
                @keyframes gentle-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupFeatureCardAnimations() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateFeatureDemo(card);
            });
        });
    }

    animateFeatureDemo(card) {
        const demo = card.querySelector('.feature-demo');
        if (!demo) return;

        // Animate collaboration bubbles
        const agentBubbles = demo.querySelectorAll('.agent-bubble');
        agentBubbles.forEach((bubble, index) => {
            setTimeout(() => {
                bubble.style.transform = 'translateX(0)';
                bubble.style.opacity = '1';
            }, index * 200);
        });

        // Animate file changes
        const fileItems = demo.querySelectorAll('.file-item');
        fileItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                setTimeout(() => {
                    item.style.backgroundColor = '';
                }, 1000);
            }, index * 300);
        });

        // Animate performance metrics
        const improvements = demo.querySelectorAll('.improvement');
        improvements.forEach(improvement => {
            improvement.style.color = '#10b981';
            improvement.style.fontWeight = '700';
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe sections and cards
        document.querySelectorAll('section, .feature-card, .comparison-row').forEach(el => {
            observer.observe(el);
        });

        // Add animation styles
        if (!document.querySelector('#scroll-animations')) {
            const style = document.createElement('style');
            style.id = 'scroll-animations';
            style.textContent = `
                section, .feature-card, .comparison-row {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s ease-out;
                }
                .animate-in {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    async loadCapabilities() {
        try {
            const response = await fetch('/api/capabilities');
            const data = await response.json();
            this.agentTypes = data.agentTypes;
            this.updateAgentSelector();
        } catch (error) {
            console.error('Failed to load capabilities:', error);
        }
    }

    updateAgentSelector() {
        const agentSelect = document.getElementById('agentType');
        if (!agentSelect || !this.agentTypes) return;

        agentSelect.innerHTML = '';
        Object.entries(this.agentTypes).forEach(([key, type]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = type.name;
            agentSelect.appendChild(option);
        });
    }

    highlightDemoSection() {
        const demoSection = document.getElementById('demo');
        if (!demoSection) return;

        demoSection.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.3)';
        demoSection.style.borderRadius = '1rem';
        
        setTimeout(() => {
            demoSection.style.boxShadow = '';
            demoSection.style.borderRadius = '';
        }, 3000);
    }

    showVideoModal() {
        // Create modal for video demo
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>🎬 Enhanced AI Agents Demo</h3>
                        <button onclick="this.closest('.video-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="video-placeholder">
                            <div class="play-icon">▶️</div>
                            <p>Interactive Demo Video</p>
                            <small>Watch how AI agents autonomously plan, code, and deploy applications</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        if (!document.querySelector('#modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .video-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease-out;
                }
                .modal-overlay {
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .modal-content {
                    background: white;
                    border-radius: 1rem;
                    max-width: 800px;
                    width: 100%;
                    max-height: 80vh;
                    overflow: auto;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                .modal-header button {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6b7280;
                }
                .modal-body {
                    padding: 2rem;
                }
                .video-placeholder {
                    aspect-ratio: 16/9;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-align: center;
                }
                .play-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
    }

    async startAgentDemo() {
        const agentType = document.getElementById('agentType').value;
        const taskType = document.getElementById('taskType').value;
        const button = document.getElementById('startAgentDemo');
        
        if (!agentType || !taskType) {
            this.showError('Please select both agent type and task');
            return;
        }

        // Update button state
        this.setButtonLoading(button, true);
        this.resetDemoState();

        // Request demo from server
        this.socket.emit('request_agent_demo', {
            type: agentType,
            demoTask: taskType,
            complexity: 'medium',
            description: `Demonstrate ${agentType} agent performing ${taskType}`,
            config: {
                sessionId: this.sessionId,
                realTime: true
            }
        });

        this.addLogEntry('system', 'Initializing agent demo...');
    }

    onDemoAgentCreated(agent) {
        this.currentDemo = agent;
        this.updateAgentStatus('active', `${agent.type} Agent Ready`);
        this.updateAgentInfo(agent);
        this.addLogEntry('agent', `${agent.type} agent created with ID: ${agent.id}`);
        
        // Reset progress
        this.updateProgressBar(0);
        this.clearProgressSteps();
        
        const button = document.getElementById('startAgentDemo');
        this.setButtonLoading(button, false);
    }

    updateAgentProgress(progress) {
        const { agentId, step, totalSteps, currentStep, result } = progress;
        
        if (!this.currentDemo || this.currentDemo.id !== agentId) return;

        const progressPercent = (step / totalSteps) * 100;
        this.updateProgressBar(progressPercent);
        this.updateProgressSteps(progress);
        this.addLogEntry('agent', `Step ${step}/${totalSteps}: ${currentStep}`);

        // Update status
        this.updateAgentStatus('working', `Working: ${currentStep}`);

        // Show result details
        if (result && result.data) {
            this.updateCodeOutput(result);
        }
    }

    onTaskCompleted(result) {
        this.updateAgentStatus('active', 'Task Completed');
        this.updateProgressBar(100);
        this.addLogEntry('system', `Task completed successfully! Agent completed ${result.agent.completedTasks} tasks total.`);
        
        // Show completion animation
        this.showCompletionAnimation();

        const button = document.getElementById('startAgentDemo');
        this.setButtonLoading(button, false);
    }

    updateAgentStatus(status, text) {
        const indicator = document.getElementById('statusIndicator');
        const statusText = indicator.querySelector('.status-text');
        
        if (!indicator || !statusText) return;

        indicator.className = `status-indicator ${status}`;
        statusText.textContent = text;
    }

    updateAgentInfo(agent) {
        const agentInfo = document.getElementById('agentInfo');
        if (!agentInfo) return;

        const agentTypeInfo = this.agentTypes[agent.type];
        agentInfo.innerHTML = `
            <div class="agent-details">
                <h4>${agentTypeInfo?.name || agent.type}</h4>
                <p>${agentTypeInfo?.description || 'Autonomous AI agent'}</p>
                <div class="capabilities">
                    <strong>Capabilities:</strong>
                    <div class="capability-tags">
                        ${agent.capabilities.map(cap => 
                            `<span class="capability-tag">${cap.replace('_', ' ')}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;

        // Add capability styles
        if (!document.querySelector('#capability-styles')) {
            const style = document.createElement('style');
            style.id = 'capability-styles';
            style.textContent = `
                .agent-details h4 {
                    color: #374151;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }
                .capability-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                .capability-tag {
                    background: rgba(99, 102, 241, 0.1);
                    color: #6366f1;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 500;
                    text-transform: capitalize;
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateProgressBar(percent) {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
    }

    updateProgressSteps(progress) {
        const stepsContainer = document.getElementById('progressSteps');
        if (!stepsContainer) return;

        // Create or update progress steps
        if (stepsContainer.children.length === 0) {
            for (let i = 1; i <= progress.totalSteps; i++) {
                const stepElement = document.createElement('div');
                stepElement.className = 'progress-step pending';
                stepElement.innerHTML = `
                    <div class="step-number">${i}</div>
                    <div class="step-content">
                        <div class="step-name">Step ${i}</div>
                        <div class="step-description">Waiting...</div>
                    </div>
                `;
                stepsContainer.appendChild(stepElement);
            }
        }

        // Update current step
        const steps = stepsContainer.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            const stepName = step.querySelector('.step-name');
            const stepDesc = step.querySelector('.step-description');

            if (stepNumber < progress.step) {
                step.className = 'progress-step completed';
                stepDesc.textContent = 'Completed';
            } else if (stepNumber === progress.step) {
                step.className = 'progress-step active';
                stepName.textContent = progress.currentStep;
                stepDesc.textContent = 'In progress...';
            } else {
                step.className = 'progress-step pending';
                stepDesc.textContent = 'Waiting...';
            }
        });
    }

    clearProgressSteps() {
        const stepsContainer = document.getElementById('progressSteps');
        if (stepsContainer) {
            stepsContainer.innerHTML = '';
        }
    }

    updateCodeOutput(result) {
        const codeOutput = document.getElementById('codeOutput');
        if (!codeOutput) return;

        let code = '';
        
        switch (result.type) {
            case 'code_generated':
                code = this.generateSampleCode(result.data);
                break;
            case 'analysis_result':
                code = this.generateAnalysisOutput(result.data);
                break;
            case 'test_results':
                code = this.generateTestOutput(result.data);
                break;
            default:
                code = `// ${result.type}\n${JSON.stringify(result.data, null, 2)}`;
        }

        codeOutput.innerHTML = `<code class="language-typescript">${this.escapeHtml(code)}</code>`;
        
        // Re-highlight syntax if Prism is available
        if (window.Prism) {
            Prism.highlightElement(codeOutput.querySelector('code'));
        }
    }

    generateSampleCode(data) {
        return `// Generated by Enhanced AI Agent
// Files created: ${data.filesCreated} | Lines: ${data.linesOfCode} | Language: ${data.language}

interface ComponentProps {
  title: string;
  subtitle?: string;
  variant: 'primary' | 'secondary';
  onClick?: () => void;
}

export const EnhancedComponent: React.FC<ComponentProps> = ({
  title,
  subtitle,
  variant = 'primary',
  onClick
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={\`component component--\${variant}\`}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="component__button"
      >
        {isLoading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
};`;
    }

    generateAnalysisOutput(data) {
        return `// Codebase Analysis Results
// Files analyzed: ${data.filesAnalyzed}
// Issues found: ${data.issuesFound}

/*
ANALYSIS SUMMARY:
===============
✅ Code structure: Well organized
⚠️  Performance: ${data.issuesFound} optimization opportunities
🔧 Recommendations:
${data.recommendations.map(rec => `   - ${rec}`).join('\n')}

METRICS:
--------
- Maintainability Index: 85/100
- Cyclomatic Complexity: Moderate
- Technical Debt: Low
- Test Coverage: 87%
*/

// Suggested improvements will be implemented automatically`;
    }

    generateTestOutput(data) {
        return `// Automated Test Generation
// Tests created: ${data.testsCreated} | Coverage: ${data.coverage}%

describe('EnhancedComponent', () => {
  it('renders with required props', () => {
    render(<EnhancedComponent title="Test Title" variant="primary" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('handles click events correctly', async () => {
    const mockClick = jest.fn();
    render(<EnhancedComponent title="Test" onClick={mockClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during async operations', async () => {
    const slowClick = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<EnhancedComponent title="Test" onClick={slowClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

// Coverage: ${data.coverage}% | All tests passing ✅`;
    }

    addLogEntry(type, message) {
        const logContainer = document.getElementById('logContainer');
        if (!logContainer) return;

        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="timestamp">${timestamp}</span>
            <span class="message">${this.escapeHtml(message)}</span>
        `;

        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;

        // Limit log entries to prevent memory issues
        while (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }

    showCompletionAnimation() {
        // Create celebration effect
        const celebration = document.createElement('div');
        celebration.className = 'completion-celebration';
        celebration.innerHTML = '🎉';
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            z-index: 10000;
            animation: celebrate 2s ease-out forwards;
            pointer-events: none;
        `;

        // Add celebration animation
        if (!document.querySelector('#celebration-styles')) {
            const style = document.createElement('style');
            style.id = 'celebration-styles';
            style.textContent = `
                @keyframes celebrate {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1) translateY(-100px); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 2000);
    }

    resetDemoState() {
        this.updateAgentStatus('inactive', 'Preparing...');
        this.updateProgressBar(0);
        this.clearProgressSteps();
        
        const codeOutput = document.getElementById('codeOutput');
        if (codeOutput) {
            codeOutput.innerHTML = '<code class="language-typescript">// Waiting for agent to generate code...</code>';
        }
    }

    setButtonLoading(button, isLoading) {
        const spinner = button.querySelector('.spinner');
        const text = button.querySelector('span');
        
        if (isLoading) {
            spinner.classList.remove('hidden');
            text.textContent = 'Agent Working...';
            button.disabled = true;
        } else {
            spinner.classList.add('hidden');
            text.textContent = 'Launch Agent';
            button.disabled = false;
        }
    }

    updateConnectionStatus(isConnected) {
        // Could add a connection indicator to the UI
        console.log(`Connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
    }

    showError(message) {
        this.addLogEntry('error', message);
        
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            z-index: 10000;
            animation: slideInFromRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    smoothScrollTo(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;

        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    handleResize() {
        // Handle responsive adjustments
        const windowWidth = window.innerWidth;
        
        if (windowWidth < 768) {
            // Mobile adjustments
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedAgentsApp = new EnhancedAgentsApp();
});

// Add global styles for toast notifications and other dynamic elements
const globalStyles = document.createElement('style');
globalStyles.textContent = `
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .error-toast {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .mobile-view .demo-workspace {
        grid-template-columns: 1fr !important;
    }
    
    .mobile-view .comparison-table {
        font-size: 0.875rem;
    }
`;
document.head.appendChild(globalStyles);