// CHAMA CONTACT PUSH - Main Application
// Advanced Contact Messaging System

class ChamaContactPush {
    constructor() {
        this.isConnected = false;
        this.groups = new Map();
        this.messageQueue = [];
        this.stats = {
            totalSent: 0,
            successRate: 100,
            activeGroups: 0,
            pendingMessages: 0
        };
        this.settings = {
            autoSaveDrafts: true,
            confirmSending: false,
            sendDelay: 1,
            desktopNotifications: true,
            soundAlerts: false
        };
        
        this.init();
    }

    async init() {
        try {
            await this.showLoadingScreen();
            await this.loadSettings();
            await this.loadStoredGroups();
            this.bindEvents();
            this.initializeUI();
            await this.hideLoadingScreen();
            this.updateStats();
            console.log('🚀 CHAMA CONTACT PUSH initialized successfully');
        } catch (error) {
            console.error('Failed to initialize CHAMA CONTACT PUSH:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    async showLoadingScreen() {
        return new Promise(resolve => {
            const loadingScreen = document.getElementById('loadingScreen');
            const mainContainer = document.getElementById('mainContainer');
            
            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
                mainContainer.style.display = 'none';
            }
            
            // Simulate loading time
            setTimeout(resolve, 2000);
        });
    }

    async hideLoadingScreen() {
        return new Promise(resolve => {
            const loadingScreen = document.getElementById('loadingScreen');
            const mainContainer = document.getElementById('mainContainer');
            
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
                mainContainer.style.display = 'block';
                mainContainer.style.animation = 'fadeIn 0.5s ease';
            }
            
            setTimeout(resolve, 500);
        });
    }

    bindEvents() {
        // Connection Events
        const connectBtn = document.getElementById('connectBtn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.toggleConnection());
        }

        // Group Management Events
        const addGroupBtn = document.getElementById('addGroupBtn');
        const groupNameInput = document.getElementById('groupNameInput');
        
        if (addGroupBtn) {
            addGroupBtn.addEventListener('click', () => this.addGroup());
        }
        
        if (groupNameInput) {
            groupNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addGroup();
                }
            });
        }

        // Message Events
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', () => this.sendMessage());
        }

        // Settings Events
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        const resetSettingsBtn = document.getElementById('resetSettingsBtn');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
        
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', () => this.closeSettings());
        }
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
        
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }

        // Help Events
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        // Log Controls
        const clearLogBtn = document.getElementById('clearLogBtn');
        const exportLogBtn = document.getElementById('exportLogBtn');
        
        if (clearLogBtn) {
            clearLogBtn.addEventListener('click', () => this.clearLog());
        }
        
        if (exportLogBtn) {
            exportLogBtn.addEventListener('click', () => this.exportLog());
        }

        // Stats Refresh
        const refreshStatsBtn = document.getElementById('refreshStatsBtn');
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', () => this.updateStats());
        }

        // Auto-save drafts
        const messageText = document.getElementById('messageText');
        if (messageText && this.settings.autoSaveDrafts) {
            messageText.addEventListener('input', this.debounce(() => {
                this.saveDraft();
            }, 1000));
        }

        // File attachment
        const attachFile = document.getElementById('attachFile');
        if (attachFile) {
            attachFile.addEventListener('change', (e) => this.handleFileAttachment(e));
        }
    }

    initializeUI() {
        this.updateConnectionStatus('disconnected');
        this.renderGroups();
        this.updateStats();
        this.loadDraft();
    }

    async toggleConnection() {
        if (this.isConnected) {
            await this.disconnect();
        } else {
            await this.connect();
        }
    }

    async connect() {
        try {
            this.showLoading(true, 'Connecting to CHAMA CONTACT PUSH...');
            this.updateConnectionStatus('connecting');
            
            // Show QR Code
            this.showQRCode();
            
            // Simulate connection process
            await this.sleep(3000);
            
            // Simulate successful connection
            this.isConnected = true;
            this.updateConnectionStatus('connected');
            this.hideQRCode();
            this.showNotification('Connected to CHAMA CONTACT PUSH successfully!', 'success');
            this.logActivity('success', 'System Connected', 'Successfully connected to CHAMA CONTACT PUSH');
            
        } catch (error) {
            console.error('Connection failed:', error);
            this.showNotification('Connection failed: ' + error.message, 'error');
            this.updateConnectionStatus('disconnected');
            this.logActivity('error', 'Connection Failed', error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async disconnect() {
        try {
            this.isConnected = false;
            this.updateConnectionStatus('disconnected');
            this.hideQRCode();
            this.showNotification('Disconnected from CHAMA CONTACT PUSH', 'info');
            this.logActivity('info', 'System Disconnected', 'Disconnected from CHAMA CONTACT PUSH');
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    }

    updateConnectionStatus(status) {
        const statusLight = document.getElementById('statusLight');
        const statusText = document.getElementById('statusText');
        const connectBtn = document.getElementById('connectBtn');
        
        if (statusLight) {
            statusLight.className = `status-light ${status}`;
        }
        
        if (statusText) {
            switch (status) {
                case 'connected':
                    statusText.textContent = 'Connected';
                    break;
                case 'connecting':
                    statusText.textContent = 'Connecting...';
                    break;
                case 'disconnected':
                default:
                    statusText.textContent = 'Disconnected';
                    break;
            }
        }
        
        if (connectBtn) {
            const icon = connectBtn.querySelector('i');
            const span = connectBtn.querySelector('span');
            
            if (this.isConnected) {
                if (icon) icon.className = 'fas fa-power-off';
                if (span) span.textContent = 'Disconnect';
                connectBtn.className = 'btn btn-secondary';
            } else {
                if (icon) icon.className = 'fas fa-power-off';
                if (span) span.textContent = 'Connect to System';
                connectBtn.className = 'btn btn-primary';
            }
            
            connectBtn.disabled = status === 'connecting';
        }
    }

    showQRCode() {
        const qrSection = document.getElementById('qrSection');
        const canvas = document.getElementById('qrCode');
        
        if (qrSection) {
            qrSection.style.display = 'block';
            qrSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (canvas && window.QRCode) {
            const qrText = 'chama-contact-push://' + this.generateRandomString(32);
            QRCode.toCanvas(canvas, qrText, {
                width: 256,
                height: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        }
    }

    hideQRCode() {
        const qrSection = document.getElementById('qrSection');
        if (qrSection) {
            qrSection.style.display = 'none';
        }
    }

    addGroup() {
        const input = document.getElementById('groupNameInput');
        if (!input) return;
        
        const groupName = input.value.trim();
        
        if (!groupName) {
            this.showNotification('Please enter a group name or contact', 'warning');
            return;
        }
        
        if (this.groups.has(groupName)) {
            this.showNotification('Group already exists', 'warning');
            return;
        }
        
        const groupData = {
            id: this.generateRandomString(16),
            name: groupName,
            status: 'active',
            addedAt: new Date(),
            messagesSent: 0,
            lastActivity: new Date()
        };
        
        this.groups.set(groupName, groupData);
        this.renderGroups();
        this.saveGroups();
        this.updateStats();
        
        input.value = '';
        this.showNotification(`Group "${groupName}" added successfully`, 'success');
        this.logActivity('success', 'Group Added', `Added group: ${groupName}`);
    }

    removeGroup(groupName) {
        if (this.groups.has(groupName)) {
            this.groups.delete(groupName);
            this.renderGroups();
            this.saveGroups();
            this.updateStats();
            this.showNotification(`Group "${groupName}" removed`, 'info');
            this.logActivity('info', 'Group Removed', `Removed group: ${groupName}`);
        }
    }

    renderGroups() {
        const groupsList = document.getElementById('groupsList');
        const groupsCount = document.getElementById('groupsCount');
        
        if (!groupsList) return;
        
        if (groupsCount) {
            groupsCount.textContent = this.groups.size;
        }
        
        if (this.groups.size === 0) {
            groupsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <p>No groups added yet</p>
                    <small>Add your first contact group to get started</small>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.groups.forEach((group, name) => {
            html += `
                <div class="group-item">
                    <div class="group-info">
                        <div class="group-name">${this.escapeHtml(name)}</div>
                        <div class="group-status">Status: ${group.status} • Messages: ${group.messagesSent}</div>
                    </div>
                    <button class="group-remove" onclick="app.removeGroup('${this.escapeHtml(name)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
        
        groupsList.innerHTML = html;
    }

    async sendMessage() {
        if (!this.isConnected) {
            this.showNotification('Please connect to CHAMA CONTACT PUSH first', 'warning');
            return;
        }
        
        const messageText = document.getElementById('messageText');
        const sendToAll = document.getElementById('sendToAll');
        const scheduleTime = document.getElementById('scheduleTime');
        const attachFile = document.getElementById('attachFile');
        
        if (!messageText) return;
        
        const message = messageText.value.trim();
        const isScheduled = scheduleTime && scheduleTime.value && new Date(scheduleTime.value) > new Date();
        const hasAttachment = attachFile && attachFile.files.length > 0;
        
        if (!message && !hasAttachment) {
            this.showNotification('Please enter a message or attach a file', 'warning');
            return;
        }
        
        if (this.groups.size === 0) {
            this.showNotification('Please add at least one group', 'warning');
            return;
        }
        
        if (this.settings.confirmSending) {
            const confirmed = confirm('Are you sure you want to send this message?');
            if (!confirmed) return;
        }
        
        try {
            this.showLoading(true, 'Sending message...');
            
            const targetGroups = sendToAll && sendToAll.checked ? 
                Array.from(this.groups.keys()) : 
                this.getSelectedGroups();
            
            if (targetGroups.length === 0) {
                this.showNotification('Please select at least one group', 'warning');
                return;
            }
            
            const messageData = {
                text: message,
                groups: targetGroups,
                scheduled: isScheduled ? new Date(scheduleTime.value) : null,
                attachment: hasAttachment ? {
                    name: attachFile.files[0].name,
                    type: attachFile.files[0].type,
                    size: attachFile.files[0].size
                } : null,
                timestamp: new Date()
            };
            
            if (isScheduled) {
                await this.scheduleMessage(messageData);
            } else {
                await this.sendImmediateMessage(messageData);
            }
            
            this.clearMessageForm();
            this.updateStats();
            
        } catch (error) {
            console.error('Send message error:', error);
            this.showNotification('Failed to send message: ' + error.message, 'error');
            this.logActivity('error', 'Message Send Failed', error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async sendImmediateMessage(messageData) {
        let successCount = 0;
        let failCount = 0;
        
        for (const groupName of messageData.groups) {
            try {
                // Apply send delay
                if (this.settings.sendDelay > 0) {
                    await this.sleep(this.settings.sendDelay * 1000);
                }
                
                // Simulate API call
                const success = Math.random() > 0.1; // 90% success rate for demo
                
                if (success) {
                    successCount++;
                    const group = this.groups.get(groupName);
                    if (group) {
                        group.messagesSent++;
                        group.lastActivity = new Date();
                    }
                    this.logActivity('success', `Message sent to ${groupName}`, messageData.text);
                } else {
                    failCount++;
                    this.logActivity('error', `Failed to send to ${groupName}`, 'Network error');
                }
                
            } catch (error) {
                failCount++;
                this.logActivity('error', `Error sending to ${groupName}`, error.message);
            }
        }
        
        // Update stats
        this.stats.totalSent += successCount;
        this.stats.successRate = this.stats.totalSent > 0 ? 
            Math.round((successCount / (successCount + failCount)) * 100) : 100;
        
        const totalGroups = messageData.groups.length;
        const message = `Message sent: ${successCount}/${totalGroups} successful, ${failCount} failed`;
        const type = successCount === totalGroups ? 'success' : (successCount > 0 ? 'warning' : 'error');
        
        this.showNotification(message, type);
        this.saveGroups();
    }

    async scheduleMessage(messageData) {
        this.stats.pendingMessages++;
        this.logActivity('info', 'Message Scheduled', `Will be sent at ${messageData.scheduled.toLocaleString()}`);
        this.showNotification(`Message scheduled for ${messageData.scheduled.toLocaleString()}`, 'info');
    }

    getSelectedGroups() {
        // For now, return all groups. In a real implementation, 
        // you'd have checkboxes for individual group selection
        return Array.from(this.groups.keys()).slice(0, 1);
    }

    clearMessageForm() {
        const messageText = document.getElementById('messageText');
        const scheduleTime = document.getElementById('scheduleTime');
        const attachFile = document.getElementById('attachFile');
        const sendToAll = document.getElementById('sendToAll');
        
        if (messageText) messageText.value = '';
        if (scheduleTime) scheduleTime.value = '';
        if (attachFile) attachFile.value = '';
        if (sendToAll) sendToAll.checked = false;
        
        // Clear draft
        localStorage.removeItem('chama_draft');
    }

    handleFileAttachment(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (file.size > maxSize) {
            this.showNotification('File size must be less than 16MB', 'warning');
            event.target.value = '';
            return;
        }
        
        this.showNotification(`File attached: ${file.name}`, 'info');
        this.logActivity('info', 'File Attached', `${file.name} (${this.formatFileSize(file.size)})`);
    }

    updateStats() {
        const totalSentEl = document.getElementById('totalSent');
        const successRateEl = document.getElementById('successRate');
        const activeGroupsEl = document.getElementById('activeGroups');
        const pendingMessagesEl = document.getElementById('pendingMessages');
        
        if (totalSentEl) totalSentEl.textContent = this.stats.totalSent;
        if (successRateEl) successRateEl.textContent = this.stats.successRate + '%';
        if (activeGroupsEl) activeGroupsEl.textContent = this.groups.size;
        if (pendingMessagesEl) pendingMessagesEl.textContent = this.stats.pendingMessages;
        
        this.stats.activeGroups = this.groups.size;
    }

    logActivity(type, message, details) {
        const logContainer = document.getElementById('logContainer');
        if (!logContainer) return;
        
        // Remove empty state if exists
        const emptyState = logContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const timestamp = new Date().toLocaleString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <div class="log-timestamp">${timestamp}</div>
            <div class="log-message">${this.escapeHtml(message)}</div>
            <div class="log-details">${this.escapeHtml(details)}</div>
        `;
        
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // Keep only last 50 entries
        while (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.lastChild);
        }
        
        // Save log to localStorage
        this.saveLogEntry({type, message, details, timestamp});
    }

    saveLogEntry(entry) {
        try {
            const logs = JSON.parse(localStorage.getItem('chama_logs') || '[]');
            logs.unshift(entry);
            
            // Keep only last 100 entries
            if (logs.length > 100) {
                logs.splice(100);
            }
            
            localStorage.setItem('chama_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Failed to save log entry:', error);
        }
    }

    clearLog() {
        const confirmed = confirm('Are you sure you want to clear the activity log?');
        if (!confirmed) return;
        
        const logContainer = document.getElementById('logContainer');
        if (logContainer) {
            logContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No activity yet</p>
                    <small>Your message history will appear here</small>
                </div>
            `;
        }
        
        localStorage.removeItem('chama_logs');
        this.showNotification('Activity log cleared', 'info');
    }

    exportLog() {
        try {
            const logs = JSON.parse(localStorage.getItem('chama_logs') || '[]');
            
            if (logs.length === 0) {
                this.showNotification('No log entries to export', 'warning');
                return;
            }
            
            const csvContent = this.convertLogsToCSV(logs);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `chama-contact-push-log-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('Log exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export log:', error);
            this.showNotification('Failed to export log', 'error');
        }
    }

    convertLogsToCSV(logs) {
        const headers = ['Timestamp', 'Type', 'Message', 'Details'];
        const rows = logs.map(log => [
            log.timestamp,
            log.type,
            log.message.replace(/"/g, '""'),
            log.details.replace(/"/g, '""')
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    saveDraft() {
        const messageText = document.getElementById('messageText');
        if (messageText) {
            localStorage.setItem('chama_draft', messageText.value);
        }
    }

    loadDraft() {
        const messageText = document.getElementById('messageText');
        const draft = localStorage.getItem('chama_draft');
        
        if (messageText && draft) {
            messageText.value = draft;
        }
    }

    openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('show');
            this.loadSettingsUI();
        }
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    loadSettingsUI() {
        const autoSaveDrafts = document.getElementById('autoSaveDrafts');
        const confirmSending = document.getElementById('confirmSending');
        const sendDelay = document.getElementById('sendDelay');
        const desktopNotifications = document.getElementById('desktopNotifications');
        const soundAlerts = document.getElementById('soundAlerts');
        
        if (autoSaveDrafts) autoSaveDrafts.checked = this.settings.autoSaveDrafts;
        if (confirmSending) confirmSending.checked = this.settings.confirmSending;
        if (sendDelay) sendDelay.value = this.settings.sendDelay;
        if (desktopNotifications) desktopNotifications.checked = this.settings.desktopNotifications;
        if (soundAlerts) soundAlerts.checked = this.settings.soundAlerts;
    }

    saveSettings() {
        const autoSaveDrafts = document.getElementById('autoSaveDrafts');
        const confirmSending = document.getElementById('confirmSending');
        const sendDelay = document.getElementById('sendDelay');
        const desktopNotifications = document.getElementById('desktopNotifications');
        const soundAlerts = document.getElementById('soundAlerts');
        
        if (autoSaveDrafts) this.settings.autoSaveDrafts = autoSaveDrafts.checked;
        if (confirmSending) this.settings.confirmSending = confirmSending.checked;
        if (sendDelay) this.settings.sendDelay = parseInt(sendDelay.value) || 1;
        if (desktopNotifications) this.settings.desktopNotifications = desktopNotifications.checked;
        if (soundAlerts) this.settings.soundAlerts = soundAlerts.checked;
        
        localStorage.setItem('chama_settings', JSON.stringify(this.settings));
        this.closeSettings();
        this.showNotification('Settings saved successfully', 'success');
    }

    resetSettings() {
        const confirmed = confirm('Are you sure you want to reset all settings to default?');
        if (!confirmed) return;
        
        this.settings = {
            autoSaveDrafts: true,
            confirmSending: false,
            sendDelay: 1,
            desktopNotifications: true,
            soundAlerts: false
        };
        
        this.loadSettingsUI();
        this.showNotification('Settings reset to default', 'info');
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('chama_settings');
            if (stored) {
                this.settings = { ...this.settings, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    saveGroups() {
        try {
            const groupsArray = Array.from(this.groups.entries());
            localStorage.setItem('chama_groups', JSON.stringify(groupsArray));
        } catch (error) {
            console.error('Failed to save groups:', error);
        }
    }

    loadStoredGroups() {
        try {
            const stored = localStorage.getItem('chama_groups');
            if (stored) {
                const groupsArray = JSON.parse(stored);
                this.groups = new Map(groupsArray);
            }
        } catch (error) {
            console.error('Failed to load stored groups:', error);
        }
    }

    showHelp() {
        const helpContent = `
            <h3>🚀 CHAMA CONTACT PUSH Help</h3>
            <h4>Getting Started:</h4>
            <ol>
                <li>Click "Connect to System" to establish connection</li>
                <li>Scan the QR code with your WhatsApp</li>
                <li>Add contact groups using the input field</li>
                <li>Compose your message and send!</li>
            </ol>
            
            <h4>Features:</h4>
            <ul>
                <li>Multi-group messaging</li>
                <li>Message scheduling</li>
                <li>File attachments</li>
                <li>Activity logging</li>
                <li>Statistics tracking</li>
            </ul>
            
            <h4>Tips:</h4>
            <ul>
                <li>Enable auto-save drafts in settings</li>
                <li>Use send delay to avoid spam detection</li>
                <li>Check message history in the activity log</li>
                <li>Export logs for record keeping</li>
            </ul>
        `;
        
        alert(helpContent.replace(/<[^>]*>/g, ''));
    }

    showLoading(show, text = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
        
        if (loadingText && text) {
            loadingText.textContent = text;
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-title">${this.getNotificationTitle(type)}</div>
            <div class="notification-message">${this.escapeHtml(message)}</div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
        
        // Desktop notification if enabled
        if (this.settings.desktopNotifications && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('CHAMA CONTACT PUSH', {
                    body: message,
                    icon: 'assets/favicon.ico'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('CHAMA CONTACT PUSH', {
                            body: message,
                            icon: 'assets/favicon.ico'
                        });
                    }
                });
            }
        }
    }

    getNotificationTitle(type) {
        switch (type) {
            case 'success': return 'Success';
            case 'error': return 'Error';
            case 'warning': return 'Warning';
            case 'info': return 'Info';
            default: return 'Notification';
        }
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ChamaContactPush();
});

// Export for global access
window.app = app;
