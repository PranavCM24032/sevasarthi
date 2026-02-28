// chatbot.js - Working Version with Orange/Blue Theme

// Load components when page loads
document.addEventListener('DOMContentLoaded', function () {
    loadComponents();
    initializeChatbot();
});

// Load header, background and footer components
async function loadComponents() {
    try {
        console.log('🚀 Loading components for chatbot...');

        // Load background FIRST for immediate display
        try {
            const bgResponse = await fetch('background.html');
            if (bgResponse.ok) {
                const bgHTML = await bgResponse.text();
                document.getElementById('background-container').innerHTML = bgHTML;
                const bgScripts = document.getElementById('background-container').getElementsByTagName('script');
                for (let script of bgScripts) {
                    try { eval(script.innerHTML); } catch (e) { console.log('Bubble script executed'); }
                }
            } else {
                createFallbackBackground();
            }
        } catch (e) {
            createFallbackBackground();
        }

        // Then load header
        try {
            const headerResponse = await fetch('header.html');
            if (headerResponse.ok) {
                const headerHTML = await headerResponse.text();
                document.getElementById('header-container').innerHTML = headerHTML;
                const headerScripts = document.getElementById('header-container').getElementsByTagName('script');
                for (let script of headerScripts) {
                    try { eval(script.innerHTML); } catch (e) { console.error('Header script error', e); }
                }
            } else {
                document.getElementById('header-container').innerHTML = '<div class="bg-green-900 text-white p-4">Header (Fallback)</div>';
            }
        } catch (e) {
            document.getElementById('header-container').innerHTML = '<div class="bg-green-900 text-white p-4">Header (Fallback)</div>';
        }

        // Then load footer
        try {
            const footerResponse = await fetch('footer.html');
            if (footerResponse.ok) {
                const footerHTML = await footerResponse.text();
                document.getElementById('footer-container').innerHTML = footerHTML;
            } else {
                document.getElementById('footer-container').innerHTML = '<div class="bg-gray-900 text-white p-4 text-center">Footer (Fallback)</div>';
            }
        } catch (e) {
            document.getElementById('footer-container').innerHTML = '<div class="bg-gray-900 text-white p-4 text-center">Footer (Fallback)</div>';
        }

        console.log('✅ All components loaded for chatbot');
    } catch (error) {
        console.error('❌ Error loading components:', error);
        createFallbackBackground();
    }
}

function createFallbackBackground() {
    const bgContainer = document.getElementById('background-container');
    if (bgContainer) {
        bgContainer.innerHTML = `
            <div class="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 -z-10"></div>
            <div class="fixed inset-0 bg-black bg-opacity-30 -z-10"></div>
        `;
    }
}

// Initialize navigation active states
function initializeNavigation() {
    setTimeout(() => {
        const currentPage = window.location.pathname.split('/').pop() || 'chatbot.html';
        const navLinks = document.querySelectorAll('.nav-link');

        console.log('Current page:', currentPage);
        console.log('Found nav links:', navLinks.length);

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            console.log('Link href:', linkHref);

            if (linkHref === currentPage) {
                link.classList.add('active');
                console.log('Active class added to:', linkHref);
            } else {
                link.classList.remove('active');
            }
        });
    }, 100);
}

// ShretiSahayyak Class - WORKING Marathi Chatbot with Orange/Blue Theme
class ShretiSahayyak {
    constructor() {
        // Load API key from config.js if it exists, otherwise use placeholder
        this.API_KEY = typeof ENV !== 'undefined' && ENV.GEMINI_API_KEY ? ENV.GEMINI_API_KEY : 'YOUR_GEMINI_API_KEY_HERE';
        this.API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=';
        this.state = {
            messages: [],
            isLoading: false,
            consentGiven: localStorage.getItem('agri_consent') === 'true',
            ttsSupported: 'speechSynthesis' in window
        };
        this.elements = {
            messagesContainer: document.getElementById('messages-container'),
            messagesList: document.getElementById('messages-list'),
            messageInput: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            loadingIndicator: document.getElementById('loading-indicator'),
            consentBanner: document.getElementById('consent-banner'),
            welcomeSection: document.getElementById('welcome-section'),
            status: document.getElementById('status')
        };
        this.init();
    }

    init() {
        console.log('🚀 Initializing Shreti Sahayyak with Orange/Blue theme...');
        this.bindEvents();
        this.testConnection();
        this.updateUI();

        if (!this.state.consentGiven) {
            this.elements.consentBanner.classList.remove('hidden');
        }


    }

    bindEvents() {
        // Input handling
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Quick questions
        document.querySelectorAll('.quick-question').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sendMessage(e.target.textContent.trim());
            });
        });

        // Consent handling
        const acceptBtn = document.getElementById('consent-accept');
        const declineBtn = document.getElementById('consent-decline');
        const closeBtn = document.getElementById('consent-close');

        if (acceptBtn) acceptBtn.addEventListener('click', () => this.handleConsent(true));
        if (declineBtn) declineBtn.addEventListener('click', () => this.handleConsent(false));
        if (closeBtn) closeBtn.addEventListener('click', () => this.handleConsent(false));

        // Hide consent banner if it exists but buttons don't
        if (!acceptBtn && this.elements.consentBanner) {
            this.elements.consentBanner.classList.add('hidden');
        }
    }

    // Test API connection first
    async testConnection() {
        console.log('🔌 Testing API connection...');
        this.updateStatus('API कनेक्शन तपासत आहे...', 'loading');

        if (this.API_KEY === 'YOUR_GEMINI_API_KEY_HERE' || !this.API_KEY) {
            this.updateStatus('API Key नाही! कृपया Gemini API Key टाका', 'error');
            this.addMessage('नमस्कार! माझा वापर करण्यासाठी कृपया तुमची मोफत Google Gemini API Key टाका. \n\n🔑 ती मिळवण्यासाठी:\n1. https://aistudio.google.com/app/apikey वर जा\n2. Google अकाउंटने लॉग इन करा\n3. "Create API key" दाबा आणि key कॉपी करा\n4. config.js फाईलमध्ये "YOUR_GEMINI_API_KEY_HERE" च्या जागी ती पेस्ट करा.', 'assistant');
            return;
        }

        try {
            const response = await fetch(this.API_URL + this.API_KEY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Say "नमस्कार" in Marathi'
                        }]
                    }]
                })
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ API Connection successful');
                this.updateStatus('API कनेक्शन यशस्वी!', 'success');

                // Add welcome message
                this.addMessage('नमस्कार! मी तुमचा शेती सहाय्यक आहे. तुमचा प्रश्न विचारा.', 'assistant');
            } else {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                this.updateStatus(`API त्रुटी: ${response.status} - ${errorData.error?.message || 'Unknown Error'}`, 'error');
            }
        } catch (error) {
            console.error('❌ Network Error:', error);
            this.updateStatus(`नेटवर्क त्रुटी: ${error.message}`, 'error');
        }
    }

    async sendMessage(customQuestion = null) {
        const question = customQuestion || this.elements.messageInput.value.trim();

        if (!question) {
            this.updateStatus('कृपया प्रश्न टाइप करा', 'error');
            return;
        }

        // Hide welcome section after first message
        this.elements.welcomeSection.classList.add('hidden');
        this.elements.consentBanner.classList.add('hidden');

        // Add user message
        this.addMessage(question, 'user');
        if (!customQuestion) this.elements.messageInput.value = '';

        // Show loading
        this.state.isLoading = true;
        this.elements.loadingIndicator.classList.remove('hidden');
        this.updateStatus('विचार करत आहे...', 'loading');
        this.scrollToBottom();

        try {
            const response = await this.callAPI(question);
            // Clean response by removing ** and other markdown
            const cleanResponse = response.replace(/\*\*/g, '').replace(/\*/g, '');
            this.addMessage(cleanResponse, 'assistant');
            this.updateStatus('तयार', 'success');

            // Save to local storage
            this.saveMessageToHistory({
                user: question,
                assistant: cleanResponse,
                timestamp: new Date(),
                inputType: 'text'
            });

        } catch (error) {
            console.error('API Error:', error);
            this.addMessage(`माफ करा, त्रुटी आली: ${error.message}`, 'assistant');
            this.updateStatus('त्रुटी आली', 'error');
        } finally {
            this.state.isLoading = false;
            this.elements.loadingIndicator.classList.add('hidden');
        }
    }

    async callAPI(question) {
        if (this.API_KEY === 'YOUR_GEMINI_API_KEY_HERE' || !this.API_KEY) {
            throw new Error('API Key missing. Please set your Gemini API key in chatbot.js');
        }

        console.log('📤 Sending question:', question);

        const systemPrompt = `You are a farming expert. Always respond in simple Marathi without using any markdown like **bold** or *. Provide practical farming advice about:
- कीटक नियंत्रण आणि रोग व्यवस्थापन
- मृदा चाचणी आणि खत व्यवस्थापन  
- बीज निवड आणि पीक काळजी
- पाणी व्यवस्थापन आणि सिंचन
- बाजार भाव आणि सरकारी योजना

तुमचे उत्तर असावे:
✓ सोप्या मराठी भाषेत
✓ कोणतेही मार्कडाउन न वापरता
✓ चरण-दर-चरण सूचनांसह
✓ व्यवहारिक आणि लगेच वापरता येण्यासारखे
✓ जर खात्री नसेल तर स्थानिक कृषि तज्ञांकडे पाठवा

महत्वाचे: कोणत्याही वैद्यकीय सल्ला देऊ नका. फक्त कृषि माहिती द्या.

शेतकऱ्याचा प्रश्न: ${question}`;

        const response = await fetch(this.API_URL + this.API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }]
            })
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error response:', errorData);
            throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('📦 Response data:', data);

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from API');
        }
    }

    addMessage(content, sender) {
        const message = {
            role: sender,
            content: content,
            timestamp: new Date()
        };

        const messageElement = this.createMessageElement(message);
        this.elements.messagesList.appendChild(messageElement);
        this.scrollToBottom();

        // Add to state
        this.state.messages.push(message);
    }

    createMessageElement(message) {
        const isUser = message.role === 'user';
        const timeString = message.timestamp.toLocaleTimeString('mr-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} fade-in`;

        messageDiv.innerHTML = `
            <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-green-600' : 'bg-gray-700'
            } shadow-lg">
                ${isUser ?
                '<span class="material-icons text-white">person</span>' :
                '<span class="material-icons text-white">smart_toy</span>'
            }
            </div>
            
            <div class="flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}">
                <div class="rounded-2xl px-4 py-3 shadow-lg ${isUser ?
                'user-message rounded-br-none' :
                'bot-message rounded-bl-none'
            }">
                    <p class="text-base leading-relaxed whitespace-pre-wrap marathi-text">${message.content}</p>
                    
                    ${!isUser && this.state.ttsSupported ? `
                        <div class="flex items-center gap-2 mt-2 pt-2 border-t border-white border-opacity-20">
                            <button onclick="window.chatbot.speakText('${message.content.replace(/'/g, "\\'")}')" class="text-white hover:bg-white hover:bg-opacity-20 h-8 px-3 rounded-lg text-sm flex items-center transition-colors">
                                <span class="material-icons mr-1 text-sm">volume_up</span>
                                सेवा सारथी
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <p class="text-xs text-gray-400 mt-1 px-2">
                    ${timeString}
                </p>
            </div>
        `;

        return messageDiv;
    }

    updateStatus(message, type) {
        const colors = {
            success: 'text-green-300',
            error: 'text-red-300',
            loading: 'text-gray-300'
        };

        this.elements.status.textContent = message;
        this.elements.status.className = `text-sm font-medium ${colors[type] || 'text-gray-300'}`;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }, 100);
    }

    // Text-to-Speech
    speakText(text) {
        if (!this.state.ttsSupported) {
            alert('तुमच्या ब्राउझरमध्ये ऑडिओ प्लेबॅक समर्थित नाही.');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'mr-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    }

    // Consent Management
    handleConsent(consent) {
        this.state.consentGiven = consent;
        localStorage.setItem('agri_consent', consent.toString());
        this.elements.consentBanner.classList.add('hidden');

        if (consent) {
            console.log('User consented to data collection');
        }
    }

    // History Management
    saveMessageToHistory(conversation) {
        const history = this.getHistory();
        history.push(conversation);
        localStorage.setItem('agri_chat_history', JSON.stringify(history));
    }

    getHistory() {
        const history = localStorage.getItem('agri_chat_history');
        return history ? JSON.parse(history) : [];
    }

    updateUI() {
        // Update UI based on current state
        if (this.state.consentGiven) {
            this.elements.consentBanner.classList.add('hidden');
        }
    }
}

// Initialize chatbot when components are loaded
function initializeChatbot() {
    console.log('🤖 Initializing chatbot...');
    window.chatbot = new ShretiSahayyak();
}

// Export for debugging
window.chatbotApp = {
    loadComponents,
    initializeChatbot
};

console.log('📦 chatbot.js loaded successfully');