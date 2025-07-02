// Enhanced AI Agents Platform - Advanced Analytics & Performance Monitoring
class AgentAnalytics {
    constructor() {
        this.metrics = {
            agents: new Map(),
            performance: {
                responseTime: [],
                throughput: [],
                errorRate: [],
                memoryUsage: [],
                cpuUsage: []
            },
            codeQuality: {
                linesGenerated: 0,
                bugsFound: 0,
                testCoverage: [],
                complexity: [],
                maintainabilityIndex: []
            },
            userInteraction: {
                clickEvents: [],
                sessionDuration: 0,
                featureUsage: new Map(),
                errorEncounters: []
            }
        };
        
        this.startTime = Date.now();
        this.charts = new Map();
        this.realTimeInterval = null;
        
        this.init();
    }

    init() {
        this.setupRealTimeMonitoring();
        this.setupPerformanceObserver();
        this.setupUserInteractionTracking();
        this.createAnalyticsDashboard();
        this.startMetricsCollection();
    }

    setupRealTimeMonitoring() {
        // Monitor Socket.IO connection performance
        if (window.enhancedAgentsApp && window.enhancedAgentsApp.socket) {
            const socket = window.enhancedAgentsApp.socket;
            
            socket.on('connect', () => {
                this.recordMetric('connection', { 
                    event: 'connect', 
                    timestamp: Date.now(),
                    latency: socket.ping || 0
                });
            });

            socket.on('disconnect', () => {
                this.recordMetric('connection', { 
                    event: 'disconnect', 
                    timestamp: Date.now()
                });
            });

            // Monitor message round-trip time
            const originalEmit = socket.emit;
            socket.emit = (...args) => {
                const startTime = performance.now();
                const eventName = args[0];
                
                // Add callback to measure response time if not present
                if (typeof args[args.length - 1] !== 'function') {
                    args.push(() => {
                        const endTime = performance.now();
                        this.recordPerformanceMetric('socketLatency', endTime - startTime);
                    });
                }
                
                return originalEmit.apply(socket, args);
            };
        }
    }

    setupPerformanceObserver() {
        // Monitor page performance
        if ('PerformanceObserver' in window) {
            // Monitor paint metrics
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordPerformanceMetric(entry.name, entry.startTime);
                }
            });
            paintObserver.observe({ entryTypes: ['paint'] });

            // Monitor navigation metrics
            const navigationObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordPerformanceMetric('pageLoad', {
                        domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
                        loadComplete: entry.loadEventEnd - entry.navigationStart,
                        firstByte: entry.responseStart - entry.navigationStart
                    });
                }
            });
            navigationObserver.observe({ entryTypes: ['navigation'] });

            // Monitor resource loading
            const resourceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
                        this.recordPerformanceMetric('resourceLoad', {
                            name: entry.name,
                            duration: entry.duration,
                            size: entry.transferSize || 0
                        });
                    }
                }
            });
            resourceObserver.observe({ entryTypes: ['resource'] });
        }

        // Monitor memory usage if available
        if (performance.memory) {
            setInterval(() => {
                this.recordPerformanceMetric('memory', {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                });
            }, 5000);
        }
    }

    setupUserInteractionTracking() {
        // Track user interactions
        document.addEventListener('click', (event) => {
            this.recordInteraction('click', {
                element: event.target.tagName,
                id: event.target.id,
                className: event.target.className,
                timestamp: Date.now()
            });
        });

        // Track feature usage
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            const url = args[0];
            const startTime = performance.now();
            
            return originalFetch(...args).then(response => {
                const endTime = performance.now();
                this.recordAPICall(url, endTime - startTime, response.status);
                return response;
            }).catch(error => {
                const endTime = performance.now();
                this.recordAPICall(url, endTime - startTime, 'error');
                throw error;
            });
        };

        // Track errors
        window.addEventListener('error', (event) => {
            this.recordError({
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                timestamp: Date.now()
            });
        });

        // Track session duration
        this.sessionStartTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const sessionDuration = Date.now() - this.sessionStartTime;
            localStorage.setItem('lastSessionDuration', sessionDuration);
        });
    }

    createAnalyticsDashboard() {
        // Create analytics dashboard overlay
        const dashboard = document.createElement('div');
        dashboard.id = 'analytics-dashboard';
        dashboard.innerHTML = `
            <div class="analytics-header">
                <h3>🔬 Real-Time Analytics</h3>
                <div class="analytics-controls">
                    <button id="analytics-toggle" class="analytics-btn">📊 Show</button>
                    <button id="analytics-export" class="analytics-btn">💾 Export</button>
                    <button id="analytics-reset" class="analytics-btn">🔄 Reset</button>
                </div>
            </div>
            <div class="analytics-content" style="display: none;">
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h4>Performance Metrics</h4>
                        <canvas id="performance-chart" width="300" height="200"></canvas>
                        <div class="metrics-summary">
                            <div class="metric">
                                <span class="metric-label">Avg Response Time:</span>
                                <span class="metric-value" id="avg-response-time">0ms</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Memory Usage:</span>
                                <span class="metric-value" id="memory-usage">0MB</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h4>Agent Activity</h4>
                        <canvas id="agent-chart" width="300" height="200"></canvas>
                        <div class="agent-stats">
                            <div class="stat">Active Agents: <span id="active-agents">0</span></div>
                            <div class="stat">Completed Tasks: <span id="completed-tasks">0</span></div>
                            <div class="stat">Success Rate: <span id="success-rate">100%</span></div>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h4>Code Quality</h4>
                        <div class="quality-metrics">
                            <div class="quality-item">
                                <div class="quality-label">Lines Generated</div>
                                <div class="quality-bar">
                                    <div class="quality-fill" id="lines-fill"></div>
                                </div>
                                <div class="quality-value" id="lines-generated">0</div>
                            </div>
                            <div class="quality-item">
                                <div class="quality-label">Test Coverage</div>
                                <div class="quality-bar">
                                    <div class="quality-fill" id="coverage-fill"></div>
                                </div>
                                <div class="quality-value" id="test-coverage">0%</div>
                            </div>
                            <div class="quality-item">
                                <div class="quality-label">Maintainability</div>
                                <div class="quality-bar">
                                    <div class="quality-fill" id="maintainability-fill"></div>
                                </div>
                                <div class="quality-value" id="maintainability">100</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-card">
                        <h4>System Health</h4>
                        <div class="health-indicators">
                            <div class="health-item">
                                <div class="health-icon" id="server-status">🟢</div>
                                <div class="health-label">Server</div>
                            </div>
                            <div class="health-item">
                                <div class="health-icon" id="websocket-status">🟢</div>
                                <div class="health-label">WebSocket</div>
                            </div>
                            <div class="health-item">
                                <div class="health-icon" id="performance-status">🟢</div>
                                <div class="health-label">Performance</div>
                            </div>
                        </div>
                        <div class="error-log" id="error-log">
                            <div class="log-header">Recent Errors:</div>
                            <div class="log-content">No errors detected</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add dashboard styles
        const style = document.createElement('style');
        style.textContent = `
            #analytics-dashboard {
                position: fixed;
                top: 80px;
                right: 20px;
                width: 400px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                font-family: 'Inter', sans-serif;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .analytics-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }
            
            .analytics-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #374151;
            }
            
            .analytics-controls {
                display: flex;
                gap: 8px;
            }
            
            .analytics-btn {
                padding: 6px 12px;
                border: none;
                border-radius: 8px;
                background: #6366f1;
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .analytics-btn:hover {
                background: #4f46e5;
                transform: translateY(-1px);
            }
            
            .analytics-content {
                max-height: 600px;
                overflow-y: auto;
                padding: 20px;
            }
            
            .analytics-grid {
                display: grid;
                gap: 20px;
            }
            
            .analytics-card {
                background: white;
                border-radius: 12px;
                padding: 15px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .analytics-card h4 {
                margin: 0 0 15px 0;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }
            
            .metrics-summary {
                margin-top: 15px;
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 12px;
            }
            
            .metric-label {
                color: #6b7280;
            }
            
            .metric-value {
                font-weight: 600;
                color: #374151;
            }
            
            .agent-stats {
                margin-top: 15px;
            }
            
            .stat {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 12px;
                color: #6b7280;
            }
            
            .stat span {
                font-weight: 600;
                color: #374151;
            }
            
            .quality-metrics {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .quality-item {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 12px;
            }
            
            .quality-label {
                min-width: 80px;
                color: #6b7280;
            }
            
            .quality-bar {
                flex: 1;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .quality-fill {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #34d399);
                transition: width 0.3s ease;
            }
            
            .quality-value {
                min-width: 40px;
                text-align: right;
                font-weight: 600;
                color: #374151;
            }
            
            .health-indicators {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .health-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            
            .health-icon {
                font-size: 20px;
            }
            
            .health-label {
                font-size: 10px;
                color: #6b7280;
                text-align: center;
            }
            
            .error-log {
                font-size: 12px;
            }
            
            .log-header {
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
            }
            
            .log-content {
                background: #f9fafb;
                padding: 8px;
                border-radius: 6px;
                color: #6b7280;
                max-height: 100px;
                overflow-y: auto;
            }
            
            @media (max-width: 768px) {
                #analytics-dashboard {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(dashboard);

        this.setupDashboardControls();
    }

    setupDashboardControls() {
        const toggleBtn = document.getElementById('analytics-toggle');
        const exportBtn = document.getElementById('analytics-export');
        const resetBtn = document.getElementById('analytics-reset');
        const content = document.querySelector('.analytics-content');

        toggleBtn.addEventListener('click', () => {
            const isVisible = content.style.display !== 'none';
            content.style.display = isVisible ? 'none' : 'block';
            toggleBtn.textContent = isVisible ? '📊 Show' : '📊 Hide';
            
            if (!isVisible) {
                this.updateDashboard();
            }
        });

        exportBtn.addEventListener('click', () => {
            this.exportMetrics();
        });

        resetBtn.addEventListener('click', () => {
            this.resetMetrics();
        });
    }

    startMetricsCollection() {
        // Update dashboard every 2 seconds
        this.realTimeInterval = setInterval(() => {
            this.updateDashboard();
            this.generateSyntheticMetrics(); // For demo purposes
        }, 2000);
    }

    recordMetric(category, data) {
        if (!this.metrics[category]) {
            this.metrics[category] = [];
        }
        this.metrics[category].push({
            ...data,
            timestamp: Date.now()
        });
    }

    recordPerformanceMetric(name, value) {
        this.metrics.performance[name] = this.metrics.performance[name] || [];
        this.metrics.performance[name].push({
            value,
            timestamp: Date.now()
        });
        
        // Keep only last 100 entries
        if (this.metrics.performance[name].length > 100) {
            this.metrics.performance[name] = this.metrics.performance[name].slice(-100);
        }
    }

    recordInteraction(type, data) {
        this.metrics.userInteraction[type] = this.metrics.userInteraction[type] || [];
        this.metrics.userInteraction[type].push(data);
    }

    recordAPICall(url, duration, status) {
        this.recordPerformanceMetric('apiCall', {
            url,
            duration,
            status,
            timestamp: Date.now()
        });
    }

    recordError(error) {
        this.metrics.userInteraction.errorEncounters.push(error);
        
        // Update error log in dashboard
        const errorLog = document.querySelector('.log-content');
        if (errorLog) {
            errorLog.innerHTML = this.metrics.userInteraction.errorEncounters
                .slice(-5)
                .map(err => `<div>[${new Date(err.timestamp).toLocaleTimeString()}] ${err.message}</div>`)
                .join('');
        }
    }

    generateSyntheticMetrics() {
        // Generate realistic synthetic data for demo
        const now = Date.now();
        
        // Simulate response times
        const responseTime = 50 + Math.random() * 100;
        this.recordPerformanceMetric('responseTime', responseTime);
        
        // Simulate throughput
        const throughput = 10 + Math.random() * 20;
        this.recordPerformanceMetric('throughput', throughput);
        
        // Simulate code metrics
        this.metrics.codeQuality.linesGenerated += Math.floor(Math.random() * 10);
        this.metrics.codeQuality.testCoverage.push(85 + Math.random() * 10);
        this.metrics.codeQuality.maintainabilityIndex.push(85 + Math.random() * 15);
    }

    updateDashboard() {
        this.updatePerformanceMetrics();
        this.updateAgentStats();
        this.updateCodeQuality();
        this.updateSystemHealth();
        this.drawCharts();
    }

    updatePerformanceMetrics() {
        const avgResponseTime = this.calculateAverage(this.metrics.performance.responseTime?.slice(-10) || []);
        const memoryUsage = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
        
        const avgElement = document.getElementById('avg-response-time');
        const memoryElement = document.getElementById('memory-usage');
        
        if (avgElement) avgElement.textContent = `${avgResponseTime.toFixed(1)}ms`;
        if (memoryElement) memoryElement.textContent = `${memoryUsage}MB`;
    }

    updateAgentStats() {
        const activeAgents = window.enhancedAgentsApp?.activeAgents?.size || 0;
        const completedTasks = Array.from(window.enhancedAgentsApp?.activeAgents?.values() || [])
            .reduce((sum, agent) => sum + (agent.completedTasks || 0), 0);
        const successRate = completedTasks > 0 ? Math.round((completedTasks / (completedTasks + 1)) * 100) : 100;
        
        const activeElement = document.getElementById('active-agents');
        const completedElement = document.getElementById('completed-tasks');
        const successElement = document.getElementById('success-rate');
        
        if (activeElement) activeElement.textContent = activeAgents;
        if (completedElement) completedElement.textContent = completedTasks;
        if (successElement) successElement.textContent = `${successRate}%`;
    }

    updateCodeQuality() {
        const linesGenerated = this.metrics.codeQuality.linesGenerated;
        const avgCoverage = this.calculateAverage(this.metrics.codeQuality.testCoverage.slice(-10));
        const avgMaintainability = this.calculateAverage(this.metrics.codeQuality.maintainabilityIndex.slice(-10));
        
        const linesElement = document.getElementById('lines-generated');
        const linesFill = document.getElementById('lines-fill');
        const coverageElement = document.getElementById('test-coverage');
        const coverageFill = document.getElementById('coverage-fill');
        const maintainabilityElement = document.getElementById('maintainability');
        const maintainabilityFill = document.getElementById('maintainability-fill');
        
        if (linesElement) linesElement.textContent = linesGenerated;
        if (linesFill) linesFill.style.width = `${Math.min(linesGenerated / 1000 * 100, 100)}%`;
        
        if (coverageElement) coverageElement.textContent = `${avgCoverage.toFixed(1)}%`;
        if (coverageFill) coverageFill.style.width = `${avgCoverage}%`;
        
        if (maintainabilityElement) maintainabilityElement.textContent = avgMaintainability.toFixed(0);
        if (maintainabilityFill) maintainabilityFill.style.width = `${avgMaintainability}%`;
    }

    updateSystemHealth() {
        const serverStatus = document.getElementById('server-status');
        const websocketStatus = document.getElementById('websocket-status');
        const performanceStatus = document.getElementById('performance-status');
        
        // Check server health
        const isServerHealthy = this.checkServerHealth();
        if (serverStatus) serverStatus.textContent = isServerHealthy ? '🟢' : '🔴';
        
        // Check WebSocket health
        const isWebSocketHealthy = window.enhancedAgentsApp?.socket?.connected || false;
        if (websocketStatus) websocketStatus.textContent = isWebSocketHealthy ? '🟢' : '🔴';
        
        // Check performance health
        const avgResponseTime = this.calculateAverage(this.metrics.performance.responseTime?.slice(-5) || []);
        const isPerformanceHealthy = avgResponseTime < 200;
        if (performanceStatus) performanceStatus.textContent = isPerformanceHealthy ? '🟢' : '🟡';
    }

    drawCharts() {
        this.drawPerformanceChart();
        this.drawAgentChart();
    }

    drawPerformanceChart() {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw response time trend
        const responseData = this.metrics.performance.responseTime?.slice(-20) || [];
        if (responseData.length > 1) {
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            responseData.forEach((point, index) => {
                const x = (index / (responseData.length - 1)) * width;
                const y = height - (point.value / 200 * height);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, height);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height);
        ctx.stroke();
    }

    drawAgentChart() {
        const canvas = document.getElementById('agent-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw pie chart of agent types
        const agentCounts = { autonomous: 0, collaborative: 0, specialized: 0, multimodal: 0 };
        
        // Count agents by type
        if (window.enhancedAgentsApp?.activeAgents) {
            Array.from(window.enhancedAgentsApp.activeAgents.values()).forEach(agent => {
                agentCounts[agent.type] = (agentCounts[agent.type] || 0) + 1;
            });
        }
        
        // Add some demo data if no agents
        if (Object.values(agentCounts).every(count => count === 0)) {
            agentCounts.autonomous = 3;
            agentCounts.collaborative = 2;
            agentCounts.specialized = 1;
            agentCounts.multimodal = 1;
        }
        
        const total = Object.values(agentCounts).reduce((sum, count) => sum + count, 0);
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        let currentAngle = 0;
        Object.values(agentCounts).forEach((count, index) => {
            if (count > 0) {
                const sliceAngle = (count / total) * 2 * Math.PI;
                
                ctx.fillStyle = colors[index];
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fill();
                
                currentAngle += sliceAngle;
            }
        });
    }

    calculateAverage(data) {
        if (!data || data.length === 0) return 0;
        const values = data.map(item => typeof item === 'object' ? item.value : item);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    checkServerHealth() {
        // Simple health check based on recent API responses
        const recentAPICalls = this.metrics.performance.apiCall?.slice(-5) || [];
        return recentAPICalls.every(call => call.status !== 'error');
    }

    exportMetrics() {
        const exportData = {
            timestamp: new Date().toISOString(),
            sessionDuration: Date.now() - this.startTime,
            metrics: this.metrics,
            summary: {
                avgResponseTime: this.calculateAverage(this.metrics.performance.responseTime?.slice(-10) || []),
                totalErrors: this.metrics.userInteraction.errorEncounters.length,
                linesGenerated: this.metrics.codeQuality.linesGenerated,
                avgTestCoverage: this.calculateAverage(this.metrics.codeQuality.testCoverage.slice(-10))
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enhanced-agents-analytics-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    resetMetrics() {
        this.metrics = {
            agents: new Map(),
            performance: {
                responseTime: [],
                throughput: [],
                errorRate: [],
                memoryUsage: [],
                cpuUsage: []
            },
            codeQuality: {
                linesGenerated: 0,
                bugsFound: 0,
                testCoverage: [],
                complexity: [],
                maintainabilityIndex: []
            },
            userInteraction: {
                clickEvents: [],
                sessionDuration: 0,
                featureUsage: new Map(),
                errorEncounters: []
            }
        };
        
        this.updateDashboard();
    }

    destroy() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        
        const dashboard = document.getElementById('analytics-dashboard');
        if (dashboard) {
            dashboard.remove();
        }
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main app to initialize
    setTimeout(() => {
        window.agentAnalytics = new AgentAnalytics();
    }, 1000);
});

// Keyboard shortcut to toggle analytics
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        const toggleBtn = document.getElementById('analytics-toggle');
        if (toggleBtn) {
            toggleBtn.click();
        }
    }
});