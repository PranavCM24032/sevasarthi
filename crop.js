// crop.js - Complete Crop Management Application

// Application Configuration
const CONFIG = {
    PEST_SOLUTIONS: {
        "किडी": {
            title: "किडी नियंत्रण उपाय",
            description: "नीम तेलाचा 5% द्राव तयार करून फवारणी करा. जैविक कीटकनाशक म्हणून गोमूत्र वापरा. पिकाभोवती मिरचीची लागवड करा."
        },
        "बुरशी": {
            title: "बुरशी नियंत्रण उपाय",
            description: "बुरशीसाठी बेकिंग सोडा (1 चमचा प्रति लिटर पाणी) फवारा. पाण्याचा सांड नको आहे याची काळजी घ्या. पिकांमध्ये योग्य अंतर ठेवा."
        },
        "विहीर": {
            title: "विहीर नियंत्रण उपाय",
            description: "नीमची पूड मातीत मिसळा. पिकांभोवती तुळशीची लागवड करा. जैविक कीटकनाशक म्हणून लसण-मिरचीचा काढा वापरा."
        },
        "जंत": {
            title: "जंत नियंत्रण उपाय",
            description: "मातीत नीमची पूड मिसळा. पाण्याच्या सांडण्याची व्यवस्था करा. पिकांची फेरबदल करा."
        },
        "दीमक": {
            title: "दीमक नियंत्रण उपाय",
            description: "पिकांच्या मुळांजवळ नीमची पूड टाका. लाकडी कोळशाचा पावडर वापरा. पाण्याची निचरा व्यवस्था करा."
        }
    }
};

// Application state
let currentUser = null;
let crops = [];
let updateInterval = null;
let isRendering = false;

// DOM Elements
let cropsContainer, cropForm, cancelFormBtn, notification, sowingDateInput;
let totalCropsEl, activeCropsEl, harvestReadyCropsEl, pestIssuesCountEl, cropsCountEl;
let newCropBtn, cropFilter, pestTypeSelect, pestSolutionContainer;
let pestAlertsContainer, cropFormContainer, closeFormBtn;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("🌱 Initializing Crop Management App...");
    initCropApp();
});

// Load header, background and footer components
async function loadComponents() {
    try {
        // Load background
        const bgResponse = await fetch('background.html');
        if (bgResponse.ok) {
            const bgHTML = await bgResponse.text();
            document.getElementById('background-container').innerHTML = bgHTML;
            
            // Execute background scripts
            const bgScripts = document.getElementById('background-container').getElementsByTagName('script');
            for (let script of bgScripts) {
                try {
                    if (script.innerHTML.trim()) {
                        eval(script.innerHTML);
                    }
                } catch (e) {
                    console.log('Background script executed');
                }
            }
        } else {
            createFallbackBackground();
        }

        // Load header
        const headerResponse = await fetch('header.html');
        if (headerResponse.ok) {
            const headerHTML = await headerResponse.text();
            document.getElementById('header-container').innerHTML = headerHTML;
        const headerScripts = document.getElementById('header-container').getElementsByTagName('script');
        for (let script of headerScripts) {
            try { eval(script.innerHTML); } catch (e) { console.error('Header script error', e); }
        }
        }

        // Load footer
        const footerResponse = await fetch('footer.html');
        if (footerResponse.ok) {
            const footerHTML = await footerResponse.text();
            document.getElementById('footer-container').innerHTML = footerHTML;
        }

        console.log('✅ All components loaded');
        
    } catch (error) {
        console.error('❌ Error loading components:', error);
        createFallbackBackground();
    }
}

// Fallback background creation
function createFallbackBackground() {
    console.log('🔄 Creating fallback background...');
    
    const container = document.getElementById('background-container');
    container.innerHTML = `
        <div class="fixed inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 z-0"></div>
        <div class="bubble-container fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div class="bubble absolute w-32 h-32 rounded-full bg-white bg-opacity-10 backdrop-blur-lg top-1/4 left-1/4 animate-pulse"></div>
            <div class="bubble absolute w-24 h-24 rounded-full bg-white bg-opacity-10 backdrop-blur-lg top-3/4 left-3/4 animate-pulse delay-1000"></div>
            <div class="bubble absolute w-40 h-40 rounded-full bg-white bg-opacity-10 backdrop-blur-lg top-1/2 left-1/2 animate-pulse delay-500"></div>
        </div>
    `;
}

// Initialize the application
function initCropApp() {
    loadComponents();
    console.log("🌱 Initializing Crop Management App...");
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Set minimum date to today
    const today = new Date();
    if (sowingDateInput) {
        sowingDateInput.min = today.toISOString().split('T')[0];
        sowingDateInput.value = today.toISOString().split('T')[0];
    }
    
    // Set default harvest date (90 days from today)
    const harvestDate = new Date();
    harvestDate.setDate(harvestDate.getDate() + 90);
    const expectedHarvestInput = document.getElementById('expected_harvest_date');
    if (expectedHarvestInput) {
        expectedHarvestInput.min = today.toISOString().split('T')[0];
        expectedHarvestInput.value = harvestDate.toISOString().split('T')[0];
    }
    
    // Load user and data
    loadUser();
    loadCrops();
    setupEventListeners();
    startAutomaticUpdates();
    
    console.log("✅ Crop Management App Initialized");
}

function initializeDOMElements() {
    cropsContainer = document.getElementById('crops-container');
    cropForm = document.getElementById('crop-form');
    cancelFormBtn = document.getElementById('cancel-form-btn');
    closeFormBtn = document.getElementById('close-form-btn');
    notification = document.getElementById('notification');
    sowingDateInput = document.getElementById('sowing_date');
    newCropBtn = document.getElementById('newCropBtn');
    cropFilter = document.getElementById('cropFilter');
    pestTypeSelect = document.getElementById('pest-type-select');
    pestSolutionContainer = document.getElementById('pest-solution');
    pestAlertsContainer = document.getElementById('pest-alerts-container');
    cropFormContainer = document.getElementById('crop-form-container');
    
    totalCropsEl = document.getElementById('total-crops');
    activeCropsEl = document.getElementById('active-crops');
    harvestReadyCropsEl = document.getElementById('harvest-ready-crops');
    pestIssuesCountEl = document.getElementById('pest-issues-count');
    cropsCountEl = document.getElementById('crops-count');
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // New crop button
    if (newCropBtn) {
        newCropBtn.addEventListener('click', () => {
            showCropForm();
        });
    }
    
    // Form submission
    if (cropForm) {
        cropForm.addEventListener('submit', (e) => {
            handleCropSubmit(e);
        });
    }
    
    // Cancel button
    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', () => {
            hideCropForm();
        });
    }
    
    // Close form button
    if (closeFormBtn) {
        closeFormBtn.addEventListener('click', () => {
            hideCropForm();
        });
    }
    
    // Crop filter
    if (cropFilter) {
        cropFilter.addEventListener('change', () => {
            renderCrops();
        });
    }
    
    // Pest type selection
    if (pestTypeSelect) {
        pestTypeSelect.addEventListener('change', (e) => {
            handlePestTypeChange(e.target.value);
        });
    }
}

// User management
function loadUser() {
    let sessionId = sessionStorage.getItem('cropSessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('cropSessionId', sessionId);
    }
    
    currentUser = {
        id: sessionId,
        name: 'शेतकरी',
        phone: '',
        created: new Date().toISOString()
    };
}

function switchTab(tabId) {
    // Update active tab button
    document.querySelectorAll('[data-tab]').forEach(button => {
        button.classList.remove('active-tab');
        button.classList.remove('text-green-400');
        button.classList.add('text-gray-400');
    });
    
    const activeButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active-tab');
        activeButton.classList.add('text-green-400');
        activeButton.classList.remove('text-gray-400');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabId}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    if (tabId === 'crops') {
        renderCrops();
    } else if (tabId === 'pests') {
        renderPestAlerts();
    }
}

function showCropForm() {
    if (cropFormContainer) {
        cropFormContainer.classList.remove('hidden');
        
        // Reset form
        if (cropForm) {
            cropForm.reset();
            
            // Set default dates
            const today = new Date();
            if (sowingDateInput) {
                sowingDateInput.value = today.toISOString().split('T')[0];
            }
            
            const harvestDate = new Date();
            harvestDate.setDate(harvestDate.getDate() + 90);
            const expectedHarvestInput = document.getElementById('expected_harvest_date');
            if (expectedHarvestInput) {
                expectedHarvestInput.value = harvestDate.toISOString().split('T')[0];
            }
        }
    }
}

function hideCropForm() {
    if (cropFormContainer) {
        cropFormContainer.classList.add('hidden');
    }
    switchTab('crops');
}

function showNotification(message, type = 'success') {
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => { 
        if (notification) {
            notification.classList.remove('show'); 
        }
    }, 3000);
}

function updateStats() {
    if (!totalCropsEl) return;
    
    const totalCrops = crops.length;
    const activeCrops = crops.filter(crop => 
        crop.growth_stage !== 'कापणी'
    ).length;
    const harvestReadyCrops = crops.filter(crop => 
        crop.growth_stage === 'कापणी'
    ).length;
    const pestIssuesCount = crops.filter(crop => 
        crop.pest_issues && crop.pest_issues.trim() !== ''
    ).length;
    
    if (totalCropsEl) totalCropsEl.textContent = formatNumber(totalCrops);
    if (activeCropsEl) activeCropsEl.textContent = formatNumber(activeCrops);
    if (harvestReadyCropsEl) harvestReadyCropsEl.textContent = formatNumber(harvestReadyCrops);
    if (pestIssuesCountEl) pestIssuesCountEl.textContent = formatNumber(pestIssuesCount);
    if (cropsCountEl) cropsCountEl.textContent = formatNumber(totalCrops);
}

function loadCrops() {
    if (currentUser) {
        const sessionData = sessionStorage.getItem(`crops_${currentUser.id}`);
        crops = sessionData ? JSON.parse(sessionData) : [];
    } else {
        crops = [];
    }
    updateStats();
    renderCrops();
}

function saveCrops() {
    if (currentUser) {
        sessionStorage.setItem(`crops_${currentUser.id}`, JSON.stringify(crops));
    }
}

function renderCrops() {
    if (!cropsContainer || isRendering) return;
    
    isRendering = true;
    
    const filterValue = cropFilter ? cropFilter.value : 'all';
    let filteredCrops = crops;
    
    // Apply filter
    if (filterValue !== 'all') {
        filteredCrops = crops.filter(crop => {
            if (filterValue === 'planting') {
                return crop.growth_stage === 'पेरणी' || crop.growth_stage === 'अंकुरण';
            } else if (filterValue === 'growing') {
                return crop.growth_stage === 'वाढ';
            } else if (filterValue === 'flowering') {
                return crop.growth_stage === 'फुलणे' || crop.growth_stage === 'फळधारण';
            } else if (filterValue === 'harvesting') {
                return crop.growth_stage === 'कापणी';
            }
            return true;
        });
    }
    
    if (filteredCrops.length === 0) {
        if (crops.length === 0) {
            cropsContainer.innerHTML = `
                <div class="text-center py-12">
                    <span class="material-icons text-green-400 text-6xl">eco</span>
                    <h3 class="text-xl font-semibold text-white mb-2 marathi-text">कोणतीही पीक नोंद नाही</h3>
                    <p class="text-gray-400 mb-6 marathi-text">नवीन पीक नोंदवण्यासाठी 'नवीन पीक जोडा' बटणावर क्लिक करा.</p>
          <button class="px-6 py-3 rounded-lg font-medium transition duration-300 marathi-text bg-black bg-opacity-30 backdrop-blur-md border border-gray-600 hover:bg-opacity-40 hover:border-gray-500 text-white shadow-lg" onclick="showCropForm()">
    नवीन पीक जोडा
</button>
                </div>
            `;
        } else {
            cropsContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <span class="material-icons text-gray-400 text-3xl">search_off</span>
                    </div>
                    <h3 class="text-xl font-semibold text-white mb-2 marathi-text">कोणतीही पीक सापडली नाही</h3>
                    <p class="text-gray-400 marathi-text">निवडलेल्या फिल्टरसाठी कोणतीही पीक उपलब्ध नाही.</p>
                </div>
            `;
        }
        isRendering = false;
        return;
    }
    
    let cropCardsHTML = '';
    
    filteredCrops.forEach(crop => {
        let statusClass = {
            'पेरणी': 'status-planting', 
            'अंकुरण': 'status-planting',
            'वाढ': 'status-growing', 
            'फुलणे': 'status-flowering',
            'फळधारण': 'status-flowering',
            'कापणी': 'status-harvesting'
        }[crop.growth_stage] || 'status-planting';
        
        // Days calculation
        const sowingDate = new Date(crop.sowing_date);
        const today = new Date();
        const daysSinceSowing = Math.floor((today - sowingDate) / (1000 * 60 * 60 * 24));
        
        // Expected harvest calculation
        let harvestInfo = '';
        if (crop.expected_harvest_date) {
            const harvestDate = new Date(crop.expected_harvest_date);
            const daysToHarvest = Math.floor((harvestDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysToHarvest > 0) {
                harvestInfo = `
                    <div class="flex items-center text-gray-300">
                        <span class="material-icons mr-2 text-gray-400">schedule</span>
                        <span class="marathi-text">कापणी ${daysToHarvest} दिवसांनी</span>
                    </div>
                `;
            } else if (daysToHarvest <= 0) {
                harvestInfo = `
                    <div class="flex items-center text-yellow-400">
                        <span class="material-icons mr-2 text-yellow-400">warning</span>
                        <span class="marathi-text">कापणीसाठी तयार!</span>
                    </div>
                `;
            }
        }
        
        // Pest issues display
        let pestInfo = '';
        if (crop.pest_issues && crop.pest_issues.trim() !== '') {
            pestInfo = `
                <div class="bg-red-900/30 border-l-4 border-red-500 p-4 rounded mt-4">
                    <div class="flex items-center">
                        <span class="material-icons text-red-400 mr-2">bug_report</span>
                        <h5 class="font-semibold text-red-300 marathi-text">कीड समस्या</h5>
                    </div>
                    <p class="text-red-200 text-sm mt-1 marathi-text">${crop.pest_issues}</p>
                </div>
            `;
        }
        
        let actionButtonsHTML = '';
        if (crop.growth_stage !== 'कापणी') {
            actionButtonsHTML = `
                <button class="update-growth-btn bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition duration-300 flex items-center marathi-text" data-crop-id="${crop.id}">
                    <span class="material-icons mr-1 text-sm">update</span>
                    वाढ अपडेट करा
                </button>
            `;
        }
        
        actionButtonsHTML += `
            <button class="delete-crop-btn bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition duration-300 flex items-center ml-2 marathi-text" data-crop-id="${crop.id}">
                <span class="material-icons mr-1 text-sm">delete</span>
                काढून टाका
            </button>
        `;
        
        cropCardsHTML += `
            <div class="card rounded-2xl p-6 mb-6 scale-in" data-crop-id="${crop.id}">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-white marathi-text">${crop.crop_name}</h3>
                        <p class="text-gray-400 text-sm marathi-text">${crop.farmer_name} - ${crop.crop_type}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass} marathi-text">
                        ${crop.growth_stage}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="flex items-center text-gray-300">
                        <span class="material-icons mr-2 text-white">calendar_today</span>
                        <span class="marathi-text">पेरणी: ${formatDate(crop.sowing_date)}</span>
                    </div>
                    <div class="flex items-center text-gray-300">
                        <span class="material-icons mr-2 text-gray-400">schedule</span>
                        <span class="marathi-text">${daysSinceSowing} दिवस झाले</span>
                    </div>
                    ${harvestInfo}
                    ${crop.land_area ? `
                    <div class="flex items-center text-gray-300">
                        <span class="material-icons mr-2 text-gray-400">square_foot</span>
                        <span class="marathi-text">${crop.land_area} एकर</span>
                    </div>
                    ` : ''}
                    ${crop.irrigation_type ? `
                    <div class="flex items-center text-gray-300">
                        <span class="material-icons mr-2 text-gray-400">water_drop</span>
                        <span class="marathi-text">सिंचन: ${crop.irrigation_type}</span>
                    </div>
                    ` : ''}
                </div>
                
                ${pestInfo}
                
                ${crop.notes ? `
                <div class="bg-gray-800 rounded-xl p-4 mt-4">
                    <p class="text-gray-300 text-sm marathi-text">${crop.notes}</p>
                </div>
                ` : ''}
                
                <div class="flex flex-wrap gap-2 mt-4">
                    ${actionButtonsHTML}
                </div>
            </div>
        `;
    });
    
    // Single DOM update to prevent flickering
    cropsContainer.innerHTML = cropCardsHTML;
    
    // Add event listeners after DOM is updated
    setTimeout(() => {
        document.querySelectorAll('.update-growth-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cropId = e.currentTarget.getAttribute('data-crop-id');
                handleUpdateGrowth(cropId);
            });
        });
        
        document.querySelectorAll('.delete-crop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cropId = e.currentTarget.getAttribute('data-crop-id');
                handleDeleteCrop(cropId);
            });
        });
        
        isRendering = false;
    }, 0);
}

function handleCropSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const farmerName = document.getElementById('farmer_name')?.value || '';
    const cropName = document.getElementById('crop_name')?.value || '';
    const cropType = document.getElementById('crop_type')?.value || '';
    const sowingDate = document.getElementById('sowing_date')?.value || '';
    const growthStage = document.getElementById('growth_stage')?.value || 'पेरणी';
    
    // Validate required fields
    if (!farmerName || !cropName || !cropType || !sowingDate) {
        showNotification('❌ कृपया सर्व आवश्यक माहिती भरा!', 'error');
        return;
    }
    
    const formData = { 
        id: 'CR' + Date.now(), 
        farmer_name: farmerName, 
        crop_name: cropName, 
        crop_type: cropType, 
        sowing_date: sowingDate, 
        expected_harvest_date: document.getElementById('expected_harvest_date')?.value || '', 
        land_area: document.getElementById('land_area')?.value || '', 
        growth_stage: growthStage, 
        irrigation_type: document.getElementById('irrigation_type')?.value || '', 
        fertilizers_used: document.getElementById('fertilizers_used')?.value || '', 
        pest_issues: document.getElementById('pest_issues')?.value || '', 
        notes: document.getElementById('notes')?.value || '',
        user_id: currentUser.id,
        created_at: new Date().toISOString()
    };
    
    crops.unshift(formData);
    saveCrops();
    updateStats();
    
    showNotification(`✅ "${cropName}" पीक यशस्वीरित्या नोंदवले गेले!`);
    
    hideCropForm();
}

function handleUpdateGrowth(cropId) {
    const crop = crops.find(c => c.id == cropId);
    if (!crop) return;
    
    const growthStages = ['पेरणी', 'अंकुरण', 'वाढ', 'फुलणे', 'फळधारण', 'कापणी'];
    const currentIndex = growthStages.indexOf(crop.growth_stage);
    
    if (currentIndex < growthStages.length - 1) {
        const oldStage = crop.growth_stage;
        crop.growth_stage = growthStages[currentIndex + 1];
        saveCrops();
        updateStats();
        renderCrops();
        showNotification(`✅ "${crop.crop_name}" ची वाढीची स्थिती ${oldStage} वरून ${crop.growth_stage} वर अपडेट केली!`, 'success');
    } else {
        showNotification(`ℹ️ "${crop.crop_name}" पीक आधीच कापणीसाठी तयार आहे!`, 'info');
    }
}

function handleDeleteCrop(cropId) {
    const crop = crops.find(c => c.id == cropId);
    if (!crop) return;
    
    if (confirm(`तुम्हाला खरोखर "${crop.crop_name}" पीक काढून टाकायचे आहे?`)) {
        const cropIndex = crops.findIndex(crop => crop.id == cropId);
        if (cropIndex !== -1) {
            const cropName = crops[cropIndex].crop_name;
            crops.splice(cropIndex, 1);
            saveCrops();
            updateStats();
            renderCrops();
            showNotification(`✅ "${cropName}" पीक यशस्वीरित्या काढून टाकले गेले!`, 'success');
        }
    }
}

function handlePestTypeChange(pestType) {
    if (!pestSolutionContainer) return;
    
    if (!pestType) {
        pestSolutionContainer.classList.add('hidden');
        return;
    }
    
    const solution = CONFIG.PEST_SOLUTIONS[pestType];
    if (solution) {
        const solutionTitle = document.getElementById('solution-title');
        const solutionDescription = document.getElementById('solution-description');
        
        if (solutionTitle) solutionTitle.textContent = solution.title;
        if (solutionDescription) solutionDescription.textContent = solution.description;
        
        pestSolutionContainer.classList.remove('hidden');
    } else {
        pestSolutionContainer.classList.add('hidden');
    }
}

function renderPestAlerts() {
    if (!pestAlertsContainer) return;
    
    const cropsWithPests = crops.filter(crop => 
        crop.pest_issues && crop.pest_issues.trim() !== ''
    );
    
    if (cropsWithPests.length === 0) {
        pestAlertsContainer.innerHTML = `
            <div class="text-center py-8">
                <span class="material-icons text-green-400 text-5xl mb-4">check_circle</span>
                <p class="text-gray-400 marathi-text">कोणतीही कीड समस्या नाही</p>
                <p class="text-gray-500 text-sm mt-2 marathi-text">सर्व पिके निरोगी आहेत</p>
            </div>
        `;
        return;
    }
    
    let pestAlertsHTML = '';
    
    cropsWithPests.forEach(crop => {
        pestAlertsHTML += `
            <div class="pest-alert rounded-xl p-4 fade-in bg-black bg-opacity-50 border border-gray-600">
    <div class="flex justify-between items-start mb-2">
        <h4 class="font-semibold text-white marathi-text">${crop.crop_name}</h4>
        <span class="text-sm text-gray-400 marathi-text">${formatDate(crop.created_at)}</span>
    </div>
    <p class="text-gray-300 text-sm mb-3 marathi-text">${crop.pest_issues}</p>
    <div class="flex justify-between items-center">
        <span class="text-gray-400 text-sm marathi-text">${crop.farmer_name}</span>
        <button class="text-green-400 hover:text-green-300 text-sm marathi-text flex items-center resolve-pest-btn" data-crop-id="${crop.id}">
            <span class="material-icons text-sm mr-1">check</span>
            समस्या सोडवली
        </button>
    </div>
</div>
        `;
    });
    
    pestAlertsContainer.innerHTML = pestAlertsHTML;
    
    // Add event listeners for resolve buttons
    document.querySelectorAll('.resolve-pest-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cropId = e.currentTarget.getAttribute('data-crop-id');
            handleResolvePest(cropId);
        });
    });
}

function handleResolvePest(cropId) {
    const cropIndex = crops.findIndex(crop => crop.id == cropId);
    if (cropIndex !== -1) {
        const cropName = crops[cropIndex].crop_name;
        crops[cropIndex].pest_issues = '';
        saveCrops();
        updateStats();
        renderPestAlerts();
        showNotification(`✅ "${cropName}" साठी कीड समस्या सोडवली गेली!`, 'success');
    }
}

function formatDate(dateString) { 
    if (!dateString) return "नोंदवलेले नाही";
    try {
        return new Date(dateString).toLocaleDateString('mr-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    } catch (e) {
        return "अवैध तारीख";
    }
}

function formatNumber(num) {
    const marathiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(digit => {
        const num = parseInt(digit);
        return isNaN(num) ? digit : marathiNumerals[num];
    }).join('');
}

function startAutomaticUpdates() {
    if (updateInterval) clearInterval(updateInterval);
    
    // Update stats every 30 seconds
    updateInterval = setInterval(() => {
        updateStats();
    }, 30000);
}

// Clean up intervals when page is unloaded
window.addEventListener('beforeunload', () => {
    if (updateInterval) clearInterval(updateInterval);
});

// Make functions globally available for onclick events
window.showCropForm = showCropForm;
window.hideCropForm = hideCropForm;