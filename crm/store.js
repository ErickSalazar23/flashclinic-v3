/**
 * Enterprise CRM Flash Clinic - Store Manager
 * Cyber-Medicine Edition
 * 
 * State management with localStorage persistence
 * This is the single source of truth for all application data
 */

class Store {
  constructor() {
    this.storageKey = 'flashclinic_crm_data';
    this.config = typeof window !== 'undefined' && window.FLASH_CONFIG ? window.FLASH_CONFIG : { USE_SUPABASE: false };
    this.state = this.loadState();
    this.listeners = [];
    
    // Initialize diagnostic engine
    this.diagnosticEngine = new DiagnosticEngine(this.state.settings);

    // Initialize Supabase if enabled
    this.supabase = null;
    if (this.config.USE_SUPABASE && typeof supabase !== 'undefined') {
      this.supabase = supabase.createClient(this.config.SUPABASE_URL, this.config.SUPABASE_ANON_KEY);
      this.initSupabaseSync();
    }
  }

  /**
   * Initialize Supabase Synchronization and Real-time
   */
  async initSupabaseSync() {
    if (!this.supabase) return;
    
    console.log('🚀 Supabase mode ACTIVE. Syncing with live database...');
    
    // 1. Initial Sync
    await this.syncFromSupabase();
    
    // 2. Setup Real-time
    this.supabase
      .channel('crm_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_prospects' }, (payload) => {
        console.log('🔄 Real-time change received:', payload);
        this.handleRemoteChange(payload);
      })
      .subscribe();
  }
  
  /**
   * Sync complete state from Supabase
   */
  async syncFromSupabase() {
    if (!this.supabase) return;
    
    try {
      const { data: prospects, error } = await this.supabase
        .from('crm_prospects')
        .select(`
          *,
          crm_diagnostics(
            perdida_anual,
            perdida_no_show,
            costo_oportunidad,
            silla_vacia_percentage,
            rentabilidad_percentage,
            severity_score,
            severity,
            diagnostic_text,
            headline,
            recommendations
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (prospects) {
        this.state.prospects = prospects.map(p => {
          const prospect = new Prospect({
            id: p.id,
            doctorName: p.doctor_name,
            clinicName: p.clinic_name,
            specialty: p.specialty,
            email: p.email,
            phone: p.phone,
            citasSemanales: p.citas_semanales,
            ticketPromedio: p.ticket_promedio,
            noShowPercentage: p.no_show_percentage,
            slotsDisponibles: p.slots_disponibles,
            stage: p.stage,
            dealValue: p.deal_value,
            ltv: p.ltv,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          });
          
          if (p.crm_diagnostics && p.crm_diagnostics[0]) {
            const d = p.crm_diagnostics[0];
            prospect.diagnostic = {
              perdidaAnual: d.perdida_anual,
              perdidaNoShow: d.perdida_no_show,
              costoOportunidad: d.costo_oportunidad,
              sillaVaciaPercentage: d.silla_vacia_percentage,
              rentabilidadPercentage: d.rentabilidad_percentage,
              severityScore: d.severity_score,
              severity: d.severity,
              diagnosticText: d.diagnostic_text,
              headline: d.headline,
              recommendations: d.recommendations
            };
          }
          
          return prospect;
        });
        
        this.updateMetadata();
        this.saveState(); // Save to local cache
        console.log(`✅ Synced ${prospects.length} prospects from live database.`);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('❌ Error syncing from Supabase:', error);
    }
  }

  /**
   * Handle remote changes from realtime channel
   */
  async handleRemoteChange(payload) {
    await this.syncFromSupabase();
  }
  
  /**
   * Load state from localStorage or initialize with defaults
   */
  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          prospects: parsed.prospects.map(p => Prospect.fromJSON(p)),
          settings: Settings.fromJSON(parsed.settings),
          metadata: parsed.metadata || this.getDefaultMetadata()
        };
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
    
    // Return default state
    return {
      prospects: [],
      settings: new Settings(),
      metadata: this.getDefaultMetadata()
    };
  }
  
  /**
   * Get default metadata
   */
  getDefaultMetadata() {
    return {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      totalProspects: 0,
      totalDeals: 0,
      totalLTV: 0
    };
  }
  
  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      const serialized = {
        prospects: this.state.prospects.map(p => p.toJSON()),
        settings: this.state.settings.toJSON(),
        metadata: {
          ...this.state.metadata,
          lastModified: new Date().toISOString()
        }
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(serialized));
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
      return false;
    }
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }
  
  // ============================================================================
  // PROSPECT MANAGEMENT
  // ============================================================================
  
  /**
   * Create a new prospect
   */
  createProspect(data) {
    const prospect = new Prospect(data);
    
    // Run diagnostic analysis if metrics are provided
    if (data.citasSemanales && data.ticketPromedio) {
      prospect.diagnostic = this.diagnosticEngine.analyze({
        prospectId: prospect.id,
        citasSemanales: data.citasSemanales,
        ticketPromedio: data.ticketPromedio,
        noShowPercentage: data.noShowPercentage || 0,
        slotsDisponibles: data.slotsDisponibles || 0,
        horasConsulta: data.horasConsulta || 0
      });
    }
    
    this.state.prospects.push(prospect);
    this.updateMetadata();
    this.saveState();

    // Sync to Supabase if enabled
    this.syncProspectToRemote(prospect);
    
    return prospect;
  }
  
  /**
   * Get prospect by ID
   */
  getProspect(id) {
    return this.state.prospects.find(p => p.id === id);
  }
  
  /**
   * Get all prospects
   */
  getAllProspects() {
    return [...this.state.prospects];
  }
  
  /**
   * Get prospects by stage
   */
  getProspectsByStage(stage) {
    return this.state.prospects.filter(p => p.stage === stage);
  }
  
  /**
   * Update prospect
   */
  updateProspect(id, updates) {
    const prospect = this.getProspect(id);
    if (!prospect) {
      throw new Error(`Prospect not found: ${id}`);
    }
    
    prospect.update(updates);
    
    // Recalculate diagnostic if metrics changed
    const metricsChanged = [
      'citasSemanales',
      'ticketPromedio',
      'noShowPercentage',
      'slotsDisponibles',
      'horasConsulta'
    ].some(key => key in updates);
    
    if (metricsChanged) {
      prospect.diagnostic = this.diagnosticEngine.analyze({
        prospectId: prospect.id,
        citasSemanales: prospect.citasSemanales,
        ticketPromedio: prospect.ticketPromedio,
        noShowPercentage: prospect.noShowPercentage,
        slotsDisponibles: prospect.slotsDisponibles,
        horasConsulta: prospect.horasConsulta
      });
    }
    
    this.updateMetadata();
    this.saveState();

    // Sync to Supabase
    this.syncProspectToRemote(prospect);
    
    return prospect;
  }
  
  /**
   * Delete prospect
   */
  async deleteProspect(id) {
    const index = this.state.prospects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Prospect not found: ${id}`);
    }
    
    const deleted = this.state.prospects.splice(index, 1)[0];
    this.updateMetadata();
    this.saveState();

    // Delete from Supabase
    if (this.supabase) {
      const { error } = await this.supabase.from('crm_prospects').delete().eq('id', id);
      if (error) console.error('Error deleting from remote:', error);
    }
    
    return deleted;
  }
  
  /**
   * Move prospect to different stage
   */
  moveProspectToStage(id, newStage) {
    const prospect = this.getProspect(id);
    if (!prospect) {
      throw new Error(`Prospect not found: ${id}`);
    }
    
    prospect.moveToStage(newStage);
    this.updateMetadata();
    this.saveState();

    // Sync to Supabase
    this.syncProspectToRemote(prospect);
    
    return prospect;
  }
  
  /**
   * Add activity to prospect
   */
  addProspectActivity(id, activity) {
    const prospect = this.getProspect(id);
    if (!prospect) {
      throw new Error(`Prospect not found: ${id}`);
    }
    
    prospect.addActivity(activity);
    this.saveState();
    
    return prospect;
  }
  
  /**
   * Run diagnostic analysis for a prospect
   */
  runDiagnostic(id) {
    const prospect = this.getProspect(id);
    if (!prospect) {
      throw new Error(`Prospect not found: ${id}`);
    }
    
    prospect.diagnostic = this.diagnosticEngine.analyze({
      prospectId: prospect.id,
      citasSemanales: prospect.citasSemanales,
      ticketPromedio: prospect.ticketPromedio,
      noShowPercentage: prospect.noShowPercentage,
      slotsDisponibles: prospect.slotsDisponibles,
      horasConsulta: prospect.horasConsulta
    });
    
    this.saveState();
    
    return prospect.diagnostic;
  }
  
  // ============================================================================
  // ANALYTICS & AGGREGATIONS
  // ============================================================================
  
  /**
   * Get pipeline statistics
   */
  getPipelineStats() {
    const stats = {
      total: this.state.prospects.length,
      byStage: {
        agenda_detenida: 0,
        diagnostico_proceso: 0,
        tratamiento_aplicado: 0,
        recuperacion_exitosa: 0
      },
      bySeverity: {
        critical: 0,
        severe: 0,
        moderate: 0,
        stable: 0,
        unknown: 0
      },
      totalPerdidaAnual: 0,
      totalLTV: 0,
      averageSillaVacia: 0,
      averageRentabilidad: 0
    };
    
    let sillaVaciaSum = 0;
    let rentabilidadSum = 0;
    let diagnosticCount = 0;
    
    this.state.prospects.forEach(prospect => {
      // Count by stage
      stats.byStage[prospect.stage]++;
      
      // Count by severity
      if (prospect.diagnostic) {
        stats.bySeverity[prospect.diagnostic.severity]++;
        stats.totalPerdidaAnual += prospect.diagnostic.perdidaAnual;
        sillaVaciaSum += prospect.diagnostic.sillaVaciaPercentage;
        rentabilidadSum += prospect.diagnostic.rentabilidadPercentage;
        diagnosticCount++;
      } else {
        stats.bySeverity.unknown++;
      }
      
      // Sum LTV
      stats.totalLTV += prospect.ltv;
    });
    
    // Calculate averages
    if (diagnosticCount > 0) {
      stats.averageSillaVacia = sillaVaciaSum / diagnosticCount;
      stats.averageRentabilidad = rentabilidadSum / diagnosticCount;
    }
    
    return stats;
  }
  
  /**
   * Get prospects with critical hemorrhage
   */
  getCriticalProspects() {
    return this.state.prospects.filter(p => 
      p.diagnostic && p.diagnostic.severity === 'critical'
    );
  }
  
  /**
   * Get top opportunities by potential recovery
   */
  getTopOpportunities(limit = 10) {
    return this.state.prospects
      .filter(p => p.diagnostic)
      .sort((a, b) => b.diagnostic.perdidaAnual - a.diagnostic.perdidaAnual)
      .slice(0, limit);
  }
  
  /**
   * Get conversion funnel metrics
   */
  getFunnelMetrics() {
    const stages = ['agenda_detenida', 'diagnostico_proceso', 'tratamiento_aplicado', 'recuperacion_exitosa'];
    const metrics = {};
    
    stages.forEach(stage => {
      const prospects = this.getProspectsByStage(stage);
      metrics[stage] = {
        count: prospects.length,
        totalValue: prospects.reduce((sum, p) => sum + (p.dealValue || 0), 0),
        avgDaysInStage: this.calculateAvgDaysInStage(prospects)
      };
    });
    
    return metrics;
  }
  
  /**
   * Calculate average days prospects spend in current stage
   */
  calculateAvgDaysInStage(prospects) {
    if (prospects.length === 0) return 0;
    
    const now = new Date();
    const totalDays = prospects.reduce((sum, p) => {
      const stageDate = new Date(p.stageUpdatedAt);
      const days = (now - stageDate) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    
    return totalDays / prospects.length;
  }
  
  // ============================================================================
  // SETTINGS MANAGEMENT
  // ============================================================================
  
  /**
   * Update settings
   */
  updateSettings(updates) {
    Object.assign(this.state.settings, updates);
    this.diagnosticEngine = new DiagnosticEngine(this.state.settings);
    this.saveState();
    
    return this.state.settings;
  }
  
  /**
   * Get current settings
   */
  getSettings() {
    return this.state.settings;
  }
  
  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================
  
  /**
   * Update metadata counters
   */
  updateMetadata() {
    this.state.metadata.totalProspects = this.state.prospects.length;
    this.state.metadata.totalDeals = this.state.prospects.filter(
      p => p.stage === 'recuperacion_exitosa'
    ).length;
    this.state.metadata.totalLTV = this.state.prospects.reduce(
      (sum, p) => sum + p.ltv, 0
    );
  }
  
  /**
   * Export all data as JSON
   */
  exportData() {
    return {
      prospects: this.state.prospects.map(p => p.toJSON()),
      settings: this.state.settings.toJSON(),
      metadata: this.state.metadata,
      exportedAt: new Date().toISOString()
    };
  }
  
  /**
   * Import data from JSON
   */
  importData(data) {
    try {
      this.state.prospects = data.prospects.map(p => Prospect.fromJSON(p));
      this.state.settings = Settings.fromJSON(data.settings);
      this.state.metadata = data.metadata || this.getDefaultMetadata();
      
      this.updateMetadata();
      this.saveState();
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
  
  /**
   * Clear all data (DANGEROUS)
   */
  clearAllData() {
    this.state = {
      prospects: [],
      settings: new Settings(),
      metadata: this.getDefaultMetadata()
    };
    
    this.saveState();
  }
  
  /**
   * Get metadata
   */
  getMetadata() {
    return { ...this.state.metadata };
  }

  /**
   * Sync prospect to Supabase
   */
  async syncProspectToRemote(prospect) {
    if (!this.supabase) return;
    
    try {
      const dbProspect = {
        doctor_name: prospect.doctorName,
        clinic_name: prospect.clinicName,
        specialty: prospect.specialty,
        email: prospect.email,
        phone: prospect.phone,
        citas_semanales: prospect.citasSemanales,
        ticket_promedio: prospect.ticketPromedio,
        no_show_percentage: prospect.noShowPercentage,
        slots_disponibles: prospect.slotsDisponibles,
        stage: prospect.stage,
        deal_value: prospect.dealValue,
        ltv: prospect.ltv,
        updated_at: new Date().toISOString()
      };

      // Upsert prospect
      const { error: prospectError } = await this.supabase
        .from('crm_prospects')
        .upsert({ id: prospect.id, ...dbProspect });

      if (prospectError) throw prospectError;

      // Sync diagnostic if exists
      if (prospect.diagnostic) {
        const dbDiagnostic = {
          prospect_id: prospect.id,
          perdida_anual: prospect.diagnostic.perdidaAnual,
          perdida_no_show: prospect.diagnostic.perdidaNoShow,
          costo_oportunidad: prospect.diagnostic.costoOportunidad,
          silla_vacia_percentage: prospect.diagnostic.sillaVaciaPercentage,
          rentabilidad_percentage: prospect.diagnostic.rentabilidadPercentage,
          severity_score: prospect.diagnostic.severityScore,
          severity: prospect.diagnostic.severity,
          diagnostic_text: prospect.diagnostic.diagnosticText,
          headline: prospect.diagnostic.headline,
          recommendations: prospect.diagnostic.recommendations
        };

        await this.supabase.from('crm_diagnostics').upsert(dbDiagnostic, { onConflict: 'prospect_id' });
      }

      console.log('✅ Synchronized to remote database');
    } catch (error) {
      console.error('❌ Error syncing to remote database:', error);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Create global store instance
const store = new Store();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Store, store };
}
