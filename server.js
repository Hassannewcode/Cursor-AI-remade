const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Agent simulation engine
class EnhancedAgentEngine {
  constructor() {
    this.activeAgents = new Map();
    this.taskQueue = [];
    this.codebaseAnalysis = new Map();
  }

  async createAgent(type, config) {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const agent = {
      id: agentId,
      type,
      config,
      status: 'initializing',
      capabilities: this.getAgentCapabilities(type),
      createdAt: new Date(),
      completedTasks: 0,
      activeTask: null
    };
    
    this.activeAgents.set(agentId, agent);
    return agent;
  }

  getAgentCapabilities(type) {
    const baseCapabilities = [
      'code_generation',
      'file_manipulation',
      'terminal_commands',
      'debugging',
      'testing'
    ];

    const typeSpecificCapabilities = {
      'autonomous': [...baseCapabilities, 'task_planning', 'multi_file_refactoring', 'architecture_design'],
      'collaborative': [...baseCapabilities, 'code_review', 'pair_programming', 'knowledge_sharing'],
      'specialized': [...baseCapabilities, 'domain_expertise', 'performance_optimization', 'security_analysis'],
      'multimodal': [...baseCapabilities, 'image_analysis', 'voice_processing', 'diagram_generation']
    };

    return typeSpecificCapabilities[type] || baseCapabilities;
  }

  async executeTask(agentId, task) {
    const agent = this.activeAgents.get(agentId);
    if (!agent) throw new Error('Agent not found');

    agent.status = 'working';
    agent.activeTask = task;

    // Simulate realistic agent work with progress updates
    const steps = this.planTaskExecution(task);
    const results = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      await this.simulateStep(step, agentId);
      results.push(step.result);
      
      // Emit progress update
      io.emit('agent_progress', {
        agentId,
        step: i + 1,
        totalSteps: steps.length,
        currentStep: step.name,
        result: step.result
      });

      // Realistic delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }

    agent.status = 'idle';
    agent.completedTasks++;
    agent.activeTask = null;

    return {
      success: true,
      results,
      agent: agent
    };
  }

  planTaskExecution(task) {
    const steps = [];
    
    switch (task.type) {
      case 'create_component':
        steps.push(
          { name: 'Analyze Requirements', type: 'analysis' },
          { name: 'Design Component Structure', type: 'planning' },
          { name: 'Generate Component Code', type: 'coding' },
          { name: 'Create Tests', type: 'testing' },
          { name: 'Integrate with Codebase', type: 'integration' }
        );
        break;
      case 'refactor_codebase':
        steps.push(
          { name: 'Scan Codebase', type: 'analysis' },
          { name: 'Identify Refactoring Opportunities', type: 'analysis' },
          { name: 'Plan Refactoring Strategy', type: 'planning' },
          { name: 'Execute Refactoring', type: 'coding' },
          { name: 'Run Tests and Verify', type: 'testing' }
        );
        break;
      default:
        steps.push(
          { name: 'Initialize Task', type: 'setup' },
          { name: 'Execute Core Logic', type: 'coding' },
          { name: 'Verify Results', type: 'testing' }
        );
    }

    return steps.map(step => ({
      ...step,
      result: null
    }));
  }

  async simulateStep(step, agentId) {
    // Simulate realistic step execution with appropriate results
    const mockResults = {
      'analysis': () => ({
        type: 'analysis_result',
        data: {
          filesAnalyzed: Math.floor(Math.random() * 50) + 10,
          issuesFound: Math.floor(Math.random() * 5),
          recommendations: ['Optimize imports', 'Reduce complexity', 'Add error handling']
        }
      }),
      'planning': () => ({
        type: 'plan',
        data: {
          strategy: 'Component-based architecture',
          estimatedTime: '15 minutes',
          dependencies: ['React', 'TypeScript', 'Styled Components']
        }
      }),
      'coding': () => ({
        type: 'code_generated',
        data: {
          filesCreated: Math.floor(Math.random() * 3) + 1,
          linesOfCode: Math.floor(Math.random() * 200) + 50,
          language: 'TypeScript'
        }
      }),
      'testing': () => ({
        type: 'test_results',
        data: {
          testsCreated: Math.floor(Math.random() * 10) + 5,
          coverage: Math.floor(Math.random() * 30) + 70,
          passed: true
        }
      }),
      'integration': () => ({
        type: 'integration_result',
        data: {
          success: true,
          conflictsResolved: Math.floor(Math.random() * 3),
          buildStatus: 'passing'
        }
      })
    };

    const resultGenerator = mockResults[step.type] || mockResults['coding'];
    step.result = resultGenerator();
  }
}

const agentEngine = new EnhancedAgentEngine();

// Performance and Analytics Tracking
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: [],
      responseTime: [],
      memory: [],
      agents: new Map(),
      errors: []
    };
    this.startTime = Date.now();
    this.startMonitoring();
  }

  startMonitoring() {
    // Collect memory metrics every 30 seconds
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memory.push({
        timestamp: Date.now(),
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      });
      
      // Keep only last 100 entries
      if (this.metrics.memory.length > 100) {
        this.metrics.memory = this.metrics.memory.slice(-100);
      }
    }, 30000);
  }

  recordRequest(req, res, responseTime) {
    this.metrics.requests.push({
      timestamp: Date.now(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    this.metrics.responseTime.push({
      timestamp: Date.now(),
      value: responseTime
    });

    // Keep only last 1000 requests
    if (this.metrics.requests.length > 1000) {
      this.metrics.requests = this.metrics.requests.slice(-1000);
    }

    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
    }
  }

  recordError(error, req) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      url: req?.url,
      method: req?.method
    });

    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }
  }

  getMetrics() {
    const now = Date.now();
    const uptime = now - this.startTime;
    
    return {
      uptime,
      startTime: this.startTime,
      requests: {
        total: this.metrics.requests.length,
        recent: this.metrics.requests.slice(-100),
        avgResponseTime: this.calculateAverage(this.metrics.responseTime.slice(-100).map(r => r.value)),
        requestsPerMinute: this.calculateRequestsPerMinute()
      },
      memory: {
        current: process.memoryUsage(),
        history: this.metrics.memory.slice(-20)
      },
      agents: {
        active: agentEngine.activeAgents.size,
        totalCreated: Array.from(agentEngine.activeAgents.values()).length,
        totalTasksCompleted: Array.from(agentEngine.activeAgents.values())
          .reduce((sum, agent) => sum + agent.completedTasks, 0)
      },
      errors: {
        total: this.metrics.errors.length,
        recent: this.metrics.errors.slice(-10)
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuUsage: process.cpuUsage()
      }
    };
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateRequestsPerMinute() {
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = this.metrics.requests.filter(req => req.timestamp > oneMinuteAgo);
    return recentRequests.length;
  }
}

const performanceMonitor = new PerformanceMonitor();

// Middleware to track response time
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    performanceMonitor.recordRequest(req, res, responseTime);
  });
  
  next();
});

// Enhanced error handling middleware
app.use((error, req, res, next) => {
  performanceMonitor.recordError(error, req);
  console.error('Error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/agents', (req, res) => {
  const agents = Array.from(agentEngine.activeAgents.values());
  res.json({ agents });
});

app.post('/api/agents', async (req, res) => {
  try {
    const { type, config } = req.body;
    const agent = await agentEngine.createAgent(type, config);
    
    io.emit('agent_created', agent);
    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/agents/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { task } = req.body;
    
    const result = await agentEngine.executeTask(id, task);
    
    io.emit('task_completed', { agentId: id, result });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/capabilities', (req, res) => {
  res.json({
    agentTypes: {
      autonomous: {
        name: 'Autonomous Agent',
        description: 'Self-directing agents that can plan and execute complex multi-step tasks',
        capabilities: agentEngine.getAgentCapabilities('autonomous')
      },
      collaborative: {
        name: 'Collaborative Agent',
        description: 'Agents designed to work alongside human developers in real-time',
        capabilities: agentEngine.getAgentCapabilities('collaborative')
      },
      specialized: {
        name: 'Specialized Agent',
        description: 'Domain-specific agents with deep expertise in particular areas',
        capabilities: agentEngine.getAgentCapabilities('specialized')
      },
      multimodal: {
        name: 'Multimodal Agent',
        description: 'Advanced agents that can process text, images, voice, and diagrams',
        capabilities: agentEngine.getAgentCapabilities('multimodal')
      }
    }
  });
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);
    socket.emit('session_joined', { sessionId });
  });

  socket.on('request_agent_demo', async (data) => {
    try {
      const agent = await agentEngine.createAgent(data.type, data.config);
      socket.emit('demo_agent_created', agent);
      
      // Auto-start a demo task
      setTimeout(async () => {
        const demoTask = {
          type: data.demoTask || 'create_component',
          description: data.description || 'Create a sample React component',
          complexity: data.complexity || 'medium'
        };
        
        await agentEngine.executeTask(agent.id, demoTask);
      }, 1000);
    } catch (error) {
      socket.emit('demo_error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve the main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Advanced Metrics and Monitoring APIs

// Get comprehensive system metrics
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get real-time performance data
app.get('/api/metrics/performance', (req, res) => {
  try {
    const recentResponseTimes = performanceMonitor.metrics.responseTime.slice(-50);
    const recentMemory = performanceMonitor.metrics.memory.slice(-10);
    
    res.json({
      responseTime: {
        current: recentResponseTimes[recentResponseTimes.length - 1]?.value || 0,
        average: performanceMonitor.calculateAverage(recentResponseTimes.map(r => r.value)),
        history: recentResponseTimes
      },
      memory: {
        current: process.memoryUsage(),
        history: recentMemory
      },
      requests: {
        perMinute: performanceMonitor.calculateRequestsPerMinute(),
        total: performanceMonitor.metrics.requests.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get agent analytics
app.get('/api/metrics/agents', (req, res) => {
  try {
    const agents = Array.from(agentEngine.activeAgents.values());
    const agentsByType = agents.reduce((acc, agent) => {
      acc[agent.type] = (acc[agent.type] || 0) + 1;
      return acc;
    }, {});

    const totalTasks = agents.reduce((sum, agent) => sum + agent.completedTasks, 0);
    const activeAgents = agents.filter(agent => agent.status === 'working').length;

    res.json({
      total: agents.length,
      active: activeAgents,
      byType: agentsByType,
      totalTasksCompleted: totalTasks,
      averageTasksPerAgent: agents.length > 0 ? totalTasks / agents.length : 0,
      agents: agents.map(agent => ({
        id: agent.id,
        type: agent.type,
        status: agent.status,
        completedTasks: agent.completedTasks,
        createdAt: agent.createdAt,
        capabilities: agent.capabilities.length
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stress test endpoint for performance testing
app.post('/api/stress-test', async (req, res) => {
  try {
    const { 
      agentCount = 5, 
      taskCount = 10, 
      concurrency = 3 
    } = req.body;

    const startTime = Date.now();
    const results = {
      agentsCreated: 0,
      tasksCompleted: 0,
      errors: [],
      duration: 0,
      averageTaskTime: 0
    };

    // Create multiple agents concurrently
    const agentPromises = [];
    for (let i = 0; i < agentCount; i++) {
      agentPromises.push(
        agentEngine.createAgent('autonomous', { 
          stressTest: true,
          testId: `stress_${Date.now()}_${i}`
        })
      );
    }

    const agents = await Promise.all(agentPromises);
    results.agentsCreated = agents.length;

    // Execute tasks concurrently
    const taskPromises = [];
    for (let i = 0; i < taskCount; i++) {
      const agent = agents[i % agents.length];
      const task = {
        type: 'stress_test',
        description: `Stress test task ${i + 1}`,
        complexity: 'low'
      };

      taskPromises.push(
        agentEngine.executeTask(agent.id, task)
          .then(() => {
            results.tasksCompleted++;
          })
          .catch(error => {
            results.errors.push(error.message);
          })
      );

      // Limit concurrency
      if (taskPromises.length >= concurrency) {
        await Promise.all(taskPromises.splice(0, concurrency));
      }
    }

    // Wait for remaining tasks
    await Promise.all(taskPromises);

    results.duration = Date.now() - startTime;
    results.averageTaskTime = results.tasksCompleted > 0 ? 
      results.duration / results.tasksCompleted : 0;

    res.json({
      success: true,
      results,
      performance: {
        agentsPerSecond: (results.agentsCreated / results.duration) * 1000,
        tasksPerSecond: (results.tasksCompleted / results.duration) * 1000,
        successRate: (results.tasksCompleted / taskCount) * 100
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Code quality analysis endpoint
app.post('/api/analyze-code', async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code is required' 
      });
    }

    // Simulate code analysis (in real implementation, use actual analysis tools)
    const analysis = {
      lines: code.split('\n').length,
      complexity: Math.floor(Math.random() * 10) + 1,
      maintainabilityIndex: Math.floor(Math.random() * 40) + 60,
      testCoverage: Math.floor(Math.random() * 30) + 70,
      issues: [],
      suggestions: [
        'Consider adding more descriptive variable names',
        'Extract complex logic into separate functions',
        'Add error handling for edge cases'
      ],
      metrics: {
        functionsCount: (code.match(/function|=>/g) || []).length,
        variablesCount: (code.match(/let|const|var/g) || []).length,
        commentsCount: (code.match(/\/\/|\/\*|\*\//g) || []).length
      }
    };

    // Add some random issues for demo
    if (Math.random() > 0.7) {
      analysis.issues.push({
        type: 'warning',
        line: Math.floor(Math.random() * analysis.lines) + 1,
        message: 'Potential optimization opportunity',
        severity: 'medium'
      });
    }

    res.json({
      success: true,
      language,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WebSocket connection health check
app.get('/api/websocket/health', (req, res) => {
  const connectedClients = io.engine.clientsCount;
  
  res.json({
    success: true,
    websocket: {
      connected: connectedClients,
      healthy: connectedClients >= 0,
      uptime: Date.now() - performanceMonitor.startTime
    }
  });
});

// System health endpoint
app.get('/api/health', (req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime,
    memory: memUsage,
    agents: {
      active: agentEngine.activeAgents.size,
      total: Array.from(agentEngine.activeAgents.values()).length
    },
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Enhanced Agents Platform running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to explore the demo`);
});