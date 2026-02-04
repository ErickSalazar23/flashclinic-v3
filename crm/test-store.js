/**
 * Enterprise CRM Flash Clinic - Store Test Suite
 * Cyber-Medicine Edition
 * 
 * Comprehensive tests for state management and data persistence
 * Run this in Node.js or browser console to validate the store
 */

// ============================================================================
// TEST UTILITIES
// ============================================================================

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }
  
  test(name, fn) {
    this.tests.push({ name, fn });
  }
  
  async run() {
    console.log('\n🧪 FLASH CLINIC CRM - STORE TEST SUITE\n');
    console.log('='.repeat(60));
    
    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.error(`❌ ${test.name}`);
        console.error(`   Error: ${error.message}`);
      }
    }
    
    console.log('='.repeat(60));
    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed\n`);
    
    return this.failed === 0;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${expected}, got ${actual}`
    );
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

const runner = new TestRunner();

// Test 1: Store Initialization
runner.test('Store initializes with default state', () => {
  const testStore = new Store();
  assert(Array.isArray(testStore.state.prospects), 'Prospects should be an array');
  assert(testStore.state.settings instanceof Settings, 'Settings should be Settings instance');
  assert(testStore.state.metadata, 'Metadata should exist');
});

// Test 2: Create Prospect
runner.test('Create prospect without diagnostic', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  const prospect = testStore.createProspect({
    doctorName: 'Dr. Juan Pérez',
    specialty: 'Cardiología',
    clinicName: 'Clínica del Corazón',
    email: 'juan.perez@example.com',
    phone: '+57 300 123 4567'
  });
  
  assert(prospect.id, 'Prospect should have ID');
  assertEquals(prospect.doctorName, 'Dr. Juan Pérez', 'Doctor name should match');
  assertEquals(testStore.getAllProspects().length, 1, 'Should have 1 prospect');
});

// Test 3: Create Prospect with Diagnostic
runner.test('Create prospect with automatic diagnostic', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  const prospect = testStore.createProspect({
    doctorName: 'Dr. María García',
    specialty: 'Dermatología',
    citasSemanales: 20,
    ticketPromedio: 150000,
    noShowPercentage: 25,
    slotsDisponibles: 40,
    horasConsulta: 30
  });
  
  assert(prospect.diagnostic, 'Diagnostic should be generated');
  assert(prospect.diagnostic.perdidaAnual > 0, 'Should calculate annual loss');
  assert(prospect.diagnostic.severity, 'Should have severity classification');
  assert(prospect.diagnostic.diagnosticText, 'Should have diagnostic text');
});

// Test 4: Update Prospect
runner.test('Update prospect and recalculate diagnostic', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  const prospect = testStore.createProspect({
    doctorName: 'Dr. Carlos López',
    citasSemanales: 20,
    ticketPromedio: 150000,
    noShowPercentage: 25,
    slotsDisponibles: 40
  });
  
  const originalLoss = prospect.diagnostic.perdidaAnual;
  
  // Update no-show percentage
  testStore.updateProspect(prospect.id, {
    noShowPercentage: 10  // Reduce no-shows
  });
  
  const updated = testStore.getProspect(prospect.id);
  assert(updated.diagnostic.perdidaAnual < originalLoss, 'Loss should decrease');
  assertEquals(updated.noShowPercentage, 10, 'No-show should be updated');
});

// Test 5: Move Prospect Through Pipeline
runner.test('Move prospect through pipeline stages', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  const prospect = testStore.createProspect({
    doctorName: 'Dr. Ana Martínez',
    citasSemanales: 30,
    ticketPromedio: 200000
  });
  
  assertEquals(prospect.stage, 'agenda_detenida', 'Should start in agenda_detenida');
  
  testStore.moveProspectToStage(prospect.id, 'diagnostico_proceso');
  assertEquals(prospect.stage, 'diagnostico_proceso', 'Should move to diagnostico_proceso');
  
  testStore.moveProspectToStage(prospect.id, 'tratamiento_aplicado');
  assertEquals(prospect.stage, 'tratamiento_aplicado', 'Should move to tratamiento_aplicado');
  
  testStore.moveProspectToStage(prospect.id, 'recuperacion_exitosa');
  assertEquals(prospect.stage, 'recuperacion_exitosa', 'Should move to recuperacion_exitosa');
  
  assert(prospect.activities.length >= 3, 'Should have activity logs');
});

// Test 6: Add Activity
runner.test('Add activity to prospect', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  const prospect = testStore.createProspect({
    doctorName: 'Dr. Pedro Ramírez'
  });
  
  testStore.addProspectActivity(prospect.id, {
    type: 'call',
    description: 'Llamada inicial - Interesado en demo'
  });
  
  const updated = testStore.getProspect(prospect.id);
  assert(updated.activities.length > 0, 'Should have activities');
  assertEquals(updated.activities[updated.activities.length - 1].type, 'call', 'Activity type should match');
});

// Test 7: Delete Prospect
runner.test('Delete prospect', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  const prospect = testStore.createProspect({
    doctorName: 'Dr. Test Delete'
  });
  
  assertEquals(testStore.getAllProspects().length, 1, 'Should have 1 prospect');
  
  testStore.deleteProspect(prospect.id);
  
  assertEquals(testStore.getAllProspects().length, 0, 'Should have 0 prospects');
  assert(!testStore.getProspect(prospect.id), 'Prospect should not exist');
});

// Test 8: Pipeline Statistics
runner.test('Calculate pipeline statistics', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  // Create prospects in different stages
  testStore.createProspect({
    doctorName: 'Dr. Stage 1',
    stage: 'agenda_detenida',
    citasSemanales: 20,
    ticketPromedio: 150000,
    slotsDisponibles: 40
  });
  
  const p2 = testStore.createProspect({
    doctorName: 'Dr. Stage 2',
    citasSemanales: 30,
    ticketPromedio: 200000,
    slotsDisponibles: 45
  });
  testStore.moveProspectToStage(p2.id, 'diagnostico_proceso');
  
  const p3 = testStore.createProspect({
    doctorName: 'Dr. Stage 3',
    citasSemanales: 35,
    ticketPromedio: 180000,
    slotsDisponibles: 40
  });
  testStore.moveProspectToStage(p3.id, 'recuperacion_exitosa');
  
  const stats = testStore.getPipelineStats();
  
  assertEquals(stats.total, 3, 'Should have 3 total prospects');
  assertEquals(stats.byStage.agenda_detenida, 1, 'Should have 1 in agenda_detenida');
  assertEquals(stats.byStage.diagnostico_proceso, 1, 'Should have 1 in diagnostico_proceso');
  assertEquals(stats.byStage.recuperacion_exitosa, 1, 'Should have 1 in recuperacion_exitosa');
  assert(stats.totalPerdidaAnual > 0, 'Should calculate total annual loss');
});

// Test 9: Critical Prospects
runner.test('Get critical prospects', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  // Create critical prospect (high no-show, many empty slots)
  testStore.createProspect({
    doctorName: 'Dr. Critical Case',
    citasSemanales: 15,
    ticketPromedio: 200000,
    noShowPercentage: 40,
    slotsDisponibles: 50
  });
  
  // Create stable prospect
  testStore.createProspect({
    doctorName: 'Dr. Stable Case',
    citasSemanales: 38,
    ticketPromedio: 150000,
    noShowPercentage: 5,
    slotsDisponibles: 40
  });
  
  const critical = testStore.getCriticalProspects();
  assert(critical.length >= 1, 'Should have at least 1 critical prospect');
  assertEquals(critical[0].diagnostic.severity, 'critical', 'Should be critical severity');
});

// Test 10: Top Opportunities
runner.test('Get top opportunities by recovery potential', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  testStore.createProspect({
    doctorName: 'Dr. Small Loss',
    citasSemanales: 35,
    ticketPromedio: 100000,
    slotsDisponibles: 40
  });
  
  testStore.createProspect({
    doctorName: 'Dr. Big Loss',
    citasSemanales: 20,
    ticketPromedio: 300000,
    slotsDisponibles: 50
  });
  
  const opportunities = testStore.getTopOpportunities(5);
  assert(opportunities.length === 2, 'Should have 2 opportunities');
  assert(
    opportunities[0].diagnostic.perdidaAnual > opportunities[1].diagnostic.perdidaAnual,
    'Should be sorted by loss (highest first)'
  );
});

// Test 11: localStorage Persistence
runner.test('Data persists to localStorage', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  testStore.createProspect({
    doctorName: 'Dr. Persistence Test',
    specialty: 'Neurología'
  });
  
  // Create new store instance (simulates page reload)
  const newStore = new Store();
  
  assertEquals(newStore.getAllProspects().length, 1, 'Should load 1 prospect from storage');
  assertEquals(
    newStore.getAllProspects()[0].doctorName,
    'Dr. Persistence Test',
    'Should preserve prospect data'
  );
});

// Test 12: Export/Import Data
runner.test('Export and import data', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  testStore.createProspect({
    doctorName: 'Dr. Export Test',
    citasSemanales: 25,
    ticketPromedio: 175000
  });
  
  const exported = testStore.exportData();
  
  assert(exported.prospects.length === 1, 'Export should have 1 prospect');
  assert(exported.exportedAt, 'Export should have timestamp');
  
  testStore.clearAllData();
  assertEquals(testStore.getAllProspects().length, 0, 'Should be empty after clear');
  
  testStore.importData(exported);
  assertEquals(testStore.getAllProspects().length, 1, 'Should have 1 prospect after import');
  assertEquals(
    testStore.getAllProspects()[0].doctorName,
    'Dr. Export Test',
    'Should preserve data after import'
  );
});

// Test 13: Diagnostic Engine Integration
runner.test('Diagnostic engine calculates correctly', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  const prospect = testStore.createProspect({
    doctorName: 'Dr. Diagnostic Test',
    citasSemanales: 20,
    ticketPromedio: 150000,
    noShowPercentage: 25,
    slotsDisponibles: 40,
    horasConsulta: 30
  });
  
  const diagnostic = prospect.diagnostic;
  
  // Verify calculations
  const expectedPerdidaNoShow = 20 * 0.25 * 150000 * 48; // 36,000,000
  const expectedSillasVacias = 40 - 20; // 20
  const expectedCostoOportunidad = 20 * 150000 * 48; // 144,000,000
  const expectedPerdidaTotal = expectedPerdidaNoShow + expectedCostoOportunidad; // 180,000,000
  
  assertEquals(diagnostic.perdidaNoShow, expectedPerdidaNoShow, 'No-show loss should match');
  assertEquals(diagnostic.costoOportunidad, expectedCostoOportunidad, 'Opportunity cost should match');
  assertEquals(diagnostic.perdidaAnual, expectedPerdidaTotal, 'Total loss should match');
  assertEquals(diagnostic.sillaVaciaPercentage, 50, 'Empty chair % should be 50%');
});

// Test 14: Settings Update
runner.test('Update settings and recalculate', () => {
  const testStore = new Store();
  testStore.clearAllData();
  
  const originalWeeks = testStore.getSettings().semanasAnuales;
  assertEquals(originalWeeks, 48, 'Default should be 48 weeks');
  
  testStore.updateSettings({ semanasAnuales: 52 });
  
  assertEquals(testStore.getSettings().semanasAnuales, 52, 'Should update to 52 weeks');
  
  // Create prospect and verify it uses new settings
  const prospect = testStore.createProspect({
    doctorName: 'Dr. Settings Test',
    citasSemanales: 20,
    ticketPromedio: 100000,
    slotsDisponibles: 40
  });
  
  // Loss should be calculated with 52 weeks
  const expectedLoss = 20 * 100000 * 52; // Using 52 weeks
  assert(
    prospect.diagnostic.costoOportunidad === expectedLoss,
    'Should use updated settings in calculations'
  );
});

// ============================================================================
// RUN TESTS
// ============================================================================

console.log('\n🚀 Starting Flash Clinic CRM Store Tests...\n');

runner.run().then(success => {
  if (success) {
    console.log('✅ All tests passed! Store is fully functional.\n');
  } else {
    console.log('❌ Some tests failed. Check errors above.\n');
  }
});
