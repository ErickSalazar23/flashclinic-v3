/**
 * Flash Clinic CRM - Dashboard Logic
 * Connects UI with store.js for real-time data visualization
 */

// Initialize store
const store = new Store();

// Chart instances
let pipelineChart = null;
let severityChart = null;

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    
    // Subscribe to store changes (including Supabase syncs)
    store.subscribe(() => {
        console.log('🔔 Store state changed. Re-rendering dashboard...');
        refreshDashboard(true);
    });
});

/**
 * Main initialization function
 */
function initializeDashboard() {
    updateConnectionStatus();
    renderKPIs();
    renderCharts();
    renderPipeline();
    
    // Auto-refresh every 30 seconds for safety
    setInterval(() => {
        refreshDashboard(false);
    }, 30000);
}

/**
 * Update Connection Status UI
 */
function updateConnectionStatus() {
    const statusEl = document.getElementById('connectionStatus');
    const dotEl = statusEl.querySelector('.status-dot');
    const textEl = statusEl.querySelector('.status-text');
    
    if (store.supabase) {
        statusEl.classList.add('online');
        statusEl.classList.remove('offline');
        textEl.textContent = 'ENTERPRISE LIVE';
    } else {
        statusEl.classList.remove('online');
        statusEl.classList.add('offline');
        textEl.textContent = 'LOCAL MODE';
    }
}

/**
 * Render KPI Cards
 */
function renderKPIs() {
    const stats = store.getPipelineStats();
    const prospects = store.getAllProspects();
    
    // Calculate additional metrics
    const totalProspects = prospects.length;
    const criticalProspects = store.getCriticalProspects().length;
    const topOpportunities = store.getTopOpportunities(5);
    const totalLTV = topOpportunities.reduce((sum, p) => sum + (p.ltv || 0), 0);
    
    // Calculate conversion rate
    const closedDeals = prospects.filter(p => p.stage === 'recuperacion_exitosa').length;
    const conversionRate = totalProspects > 0 ? ((closedDeals / totalProspects) * 100).toFixed(1) : 0;
    
    const kpis = [
        {
            title: 'Clínicas Sangrando Dinero',
            value: totalProspects,
            icon: '🩸',
            iconBg: 'rgba(255, 71, 87, 0.2)',
            change: '+12% este mes',
            changeType: 'positive'
        },
        {
            title: 'Emergencias Financieras',
            value: criticalProspects,
            icon: '🚨',
            iconBg: 'rgba(255, 71, 87, 0.3)',
            change: 'Requieren acción YA',
            changeType: 'negative'
        },
        {
            title: 'Dinero Perdido (Anual)',
            value: formatCurrency(stats.totalPerdidaAnual),
            icon: '💸',
            iconBg: 'rgba(255, 193, 7, 0.2)',
            change: stats.totalPerdidaAnual > 0 ? 'Recuperable' : 'N/A',
            changeType: 'neutral'
        },
        {
            title: 'Clínicas Recuperadas',
            value: `${conversionRate}%`,
            icon: '💊',
            iconBg: 'rgba(0, 255, 136, 0.2)',
            change: '+3.2% vs mes anterior',
            changeType: 'positive'
        },
        {
            title: 'Valor Total en Juego',
            value: formatCurrency(totalLTV),
            icon: '💎',
            iconBg: 'rgba(138, 43, 226, 0.2)',
            change: '+18% crecimiento',
            changeType: 'positive'
        },
        {
            title: 'Clínicas Salvadas',
            value: closedDeals,
            icon: '✅',
            iconBg: 'rgba(0, 255, 136, 0.2)',
            change: `${conversionRate}% de éxito`,
            changeType: 'neutral'
        }
    ];
    
    const kpiGrid = document.getElementById('kpiGrid');
    kpiGrid.innerHTML = kpis.map(kpi => `
        <div class="kpi-card">
            <div class="kpi-header">
                <div class="kpi-title">${kpi.title}</div>
                <div class="kpi-icon" style="background: ${kpi.iconBg}">
                    ${kpi.icon}
                </div>
            </div>
            <div class="kpi-value">${kpi.value}</div>
            <div class="kpi-change ${kpi.changeType}">
                ${kpi.changeType === 'positive' ? '↗' : kpi.changeType === 'negative' ? '↘' : '→'} 
                ${kpi.change}
            </div>
        </div>
    `).join('');
}

/**
 * Render Charts
 */
function renderCharts() {
    renderPipelineChart();
    renderSeverityChart();
}

function renderPipelineChart() {
    const stats = store.getPipelineStats();
    const ctx = document.getElementById('pipelineChart').getContext('2d');
    
    // Destroy existing chart
    if (pipelineChart) {
        pipelineChart.destroy();
    }
    
    const stageLabels = {
        'agenda_detenida': 'Hemorragia Activa 🩸',
        'diagnostico_proceso': 'Evaluando Daño 🔬',
        'tratamiento_activo': 'En Recuperación 💊',
        'recuperacion_exitosa': 'Clínica Salvada ✅'
    };
    
    const data = {
        labels: Object.keys(stats.byStage).map(stage => stageLabels[stage] || stage),
        datasets: [{
            label: 'Prospectos',
            data: Object.values(stats.byStage),
            backgroundColor: [
                'rgba(255, 71, 87, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(0, 210, 255, 0.8)',
                'rgba(0, 255, 136, 0.8)'
            ],
            borderColor: [
                'rgba(255, 71, 87, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(0, 210, 255, 1)',
                'rgba(0, 255, 136, 1)'
            ],
            borderWidth: 2
        }]
    };
    
    pipelineChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e0e6ed',
                        font: {
                            family: 'Outfit',
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 26, 0.9)',
                    titleColor: '#00d2ff',
                    bodyColor: '#e0e6ed',
                    borderColor: 'rgba(0, 210, 255, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderSeverityChart() {
    const stats = store.getPipelineStats();
    const ctx = document.getElementById('severityChart').getContext('2d');
    
    // Destroy existing chart
    if (severityChart) {
        severityChart.destroy();
    }
    
    const severityLabels = {
        'critical': 'Emergencia 🚨',
        'severe': 'Crítico 🔥',
        'moderate': 'Estable ⚠️',
        'stable': 'Saludable ✅'
    };
    
    const data = {
        labels: Object.keys(stats.bySeverity).map(sev => severityLabels[sev] || sev),
        datasets: [{
            label: 'Casos',
            data: Object.values(stats.bySeverity),
            backgroundColor: [
                'rgba(255, 71, 87, 0.8)',
                'rgba(255, 165, 0, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(0, 255, 136, 0.8)'
            ],
            borderColor: [
                'rgba(255, 71, 87, 1)',
                'rgba(255, 165, 0, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(0, 255, 136, 1)'
            ],
            borderWidth: 2
        }]
    };
    
    severityChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e0e6ed',
                        font: {
                            family: 'Outfit',
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 14, 26, 0.9)',
                    titleColor: '#00d2ff',
                    bodyColor: '#e0e6ed',
                    borderColor: 'rgba(0, 210, 255, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render Pipeline Grid
 */
function renderPipeline() {
    const prospects = store.getAllProspects();
    const stages = [
        { id: 'agenda_detenida', title: 'Hemorragia Activa', icon: '🩸' },
        { id: 'diagnostico_proceso', title: 'Evaluando Daño', icon: '🔬' },
        { id: 'tratamiento_activo', title: 'En Recuperación', icon: '💊' },
        { id: 'recuperacion_exitosa', title: 'Clínica Salvada', icon: '✅' }
    ];
    
    const pipelineGrid = document.getElementById('pipelineGrid');
    
    pipelineGrid.innerHTML = stages.map(stage => {
        const stageProspects = prospects.filter(p => p.stage === stage.id);
        
        return `
            <div class="pipeline-column">
                <div class="pipeline-column-header">
                    <div class="pipeline-column-title">
                        ${stage.icon} ${stage.title}
                    </div>
                    <div class="pipeline-column-count">${stageProspects.length}</div>
                </div>
                <div class="pipeline-column-content">
                    ${stageProspects.length > 0 
                        ? stageProspects.map(p => renderProspectCard(p)).join('')
                        : `
                            <div class="empty-state">
                                <div class="empty-state-icon">📭</div>
                                <p>Ninguna clínica en esta fase</p>
                            </div>
                        `
                    }
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render individual prospect card
 */
function renderProspectCard(prospect) {
    const diagnostic = prospect.diagnostic || {};
    const severity = diagnostic.severity || 'stable';
    
    return `
        <div class="prospect-card" onclick="viewProspectDetails('${prospect.id}')">
            <div class="prospect-header">
                <div>
                    <div class="prospect-name">${prospect.doctorName}</div>
                    <div class="prospect-specialty">${prospect.specialty || 'Sin especialidad'}</div>
                </div>
                <div class="severity-badge severity-${severity}">
                    ${severity.toUpperCase()}
                </div>
            </div>
            <div class="prospect-metrics">
                <div class="metric-item">
                    <div class="metric-label">💸 Sangrado Anual</div>
                    <div class="metric-value">${formatCurrency(diagnostic.perdidaAnual || 0)}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">👻 Pacientes Fantasma</div>
                    <div class="metric-value">${prospect.noShowPercentage || 0}%</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">📅 Citas/Semana</div>
                    <div class="metric-value">${prospect.citasSemanales || 0}</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">⚡ Capacidad Usada</div>
                    <div class="metric-value">${diagnostic.rentabilidadPercentage || 0}%</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Utility Functions
 */
function formatCurrency(amount) {
    if (!amount || amount === 0) return '$0';
    
    const formatter = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    // Simplify large numbers
    if (amount >= 1000000000) {
        return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
    }
    
    return formatter.format(amount);
}

/**
 * Action Handlers
 */
function refreshDashboard(skipCharts = false) {
    updateConnectionStatus();
    renderKPIs();
    if (!skipCharts) renderCharts();
    renderPipeline();
}

function refreshPipeline() {
    renderPipeline();
}

function exportData() {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashclinic-crm-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Datos exportados exitosamente');
}

function viewProspectDetails(prospectId) {
    const prospect = store.getProspect(prospectId);
    if (!prospect) {
        alert('Prospecto no encontrado');
        return;
    }
    
    // For now, show alert with details
    // TODO: Create modal with full prospect details
    const diagnostic = prospect.diagnostic || {};
    
    const details = `
📋 DETALLES DEL PROSPECTO

👨‍⚕️ Doctor: ${prospect.doctorName}
🏥 Clínica: ${prospect.clinicName || 'N/A'}
🔬 Especialidad: ${prospect.specialty || 'N/A'}

📊 MÉTRICAS OPERATIVAS
• Citas Semanales: ${prospect.citasSemanales || 0}
• Ticket Promedio: ${formatCurrency(prospect.ticketPromedio || 0)}
• No-Show: ${prospect.noShowPercentage || 0}%
• Slots Disponibles: ${prospect.slotsDisponibles || 0}

💰 DIAGNÓSTICO FINANCIERO
• Pérdida Anual: ${formatCurrency(diagnostic.perdidaAnual || 0)}
• Severidad: ${(diagnostic.severity || 'stable').toUpperCase()}
• Rentabilidad: ${diagnostic.rentabilidadPercentage || 0}%
• Sillas Vacías: ${diagnostic.sillaVaciaPercentage || 0}%

📈 PIPELINE
• Etapa: ${prospect.stage}
• Creado: ${new Date(prospect.createdAt).toLocaleDateString('es-CO')}
${prospect.ltv ? `• LTV: ${formatCurrency(prospect.ltv)}` : ''}
    `.trim();
    
    alert(details);
}

function showAddProspectModal() {
    // Simple prompt-based input for now
    // TODO: Create proper modal form
    const doctorName = prompt('Nombre del Doctor:');
    if (!doctorName) return;
    
    const specialty = prompt('Especialidad:');
    const citasSemanales = parseInt(prompt('Citas Semanales:', '20'));
    const ticketPromedio = parseInt(prompt('Ticket Promedio (COP):', '150000'));
    const noShowPercentage = parseInt(prompt('No-Show %:', '25'));
    const slotsDisponibles = parseInt(prompt('Slots Disponibles:', '40'));
    
    try {
        const prospect = store.createProspect({
            doctorName,
            specialty,
            citasSemanales,
            ticketPromedio,
            noShowPercentage,
            slotsDisponibles
        });
        
        alert(`✅ Prospecto creado exitosamente\n\nSeveridad: ${prospect.diagnostic.severity.toUpperCase()}\nPérdida Anual: ${formatCurrency(prospect.diagnostic.perdidaAnual)}`);
        
        refreshDashboard();
    } catch (error) {
        alert(`❌ Error al crear prospecto: ${error.message}`);
    }
}

// Initialize demo data if store is empty
if (store.getAllProspects().length === 0) {
    console.log('📝 Inicializando datos de demostración...');
    
    // Create sample prospects
    const sampleProspects = [
        {
            doctorName: 'Dr. Juan Pérez',
            specialty: 'Cardiología',
            clinicName: 'Clínica del Corazón',
            citasSemanales: 20,
            ticketPromedio: 150000,
            noShowPercentage: 25,
            slotsDisponibles: 40,
            email: 'juan.perez@clinicacorazon.com',
            phone: '+57 300 123 4567'
        },
        {
            doctorName: 'Dra. María González',
            specialty: 'Dermatología',
            clinicName: 'Dermacenter',
            citasSemanales: 35,
            ticketPromedio: 120000,
            noShowPercentage: 15,
            slotsDisponibles: 50,
            email: 'maria.gonzalez@dermacenter.com',
            phone: '+57 301 234 5678'
        },
        {
            doctorName: 'Dr. Carlos Rodríguez',
            specialty: 'Ortopedia',
            clinicName: 'Centro Ortopédico',
            citasSemanales: 15,
            ticketPromedio: 200000,
            noShowPercentage: 30,
            slotsDisponibles: 30,
            email: 'carlos.rodriguez@ortopedia.com',
            phone: '+57 302 345 6789'
        }
    ];
    
    sampleProspects.forEach(data => {
        const prospect = store.createProspect(data);
        console.log(`✅ Creado: ${prospect.doctorName} - Severity: ${prospect.diagnostic.severity}`);
    });
    
    // Move some to different stages
    const allProspects = store.getAllProspects();
    if (allProspects.length >= 2) {
        store.moveProspectToStage(allProspects[1].id, 'diagnostico_proceso');
    }
    if (allProspects.length >= 3) {
        store.moveProspectToStage(allProspects[2].id, 'tratamiento_activo');
    }
    
    console.log('✅ Datos de demostración inicializados');
}
