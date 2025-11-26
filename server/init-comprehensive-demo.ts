import { createComprehensiveDemoData } from './comprehensive-demo-data';

// Initialize comprehensive demo dataset
export async function initializeDemoDataset() {
  try {
    console.log('🔄 Initializing comprehensive demo dataset...');
    
    const result = await createComprehensiveDemoData();
    
    console.log('✅ Demo dataset initialized successfully:');
    console.log(`   📊 Patients created: ${result.patients}`);
    console.log(`   🏥 Encounters created: ${result.encounters}`);
    console.log(`   👶 Pediatric patients: ${result.demographics.pediatric}`);
    console.log(`   👨‍💼 Adult patients: ${result.demographics.adult}`);
    console.log(`   👴 Elderly patients: ${result.demographics.elderly}`);
    console.log(`   🩺 Specialties covered: ${result.specialties.length}`);
    console.log(`   📋 Medical conditions: Primary Care, Cardiology, Mental Health, Pediatrics, Geriatrics, and more`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Failed to initialize demo dataset:', error);
    throw error;
  }
}

// Optional: Clear existing demo data first
export async function clearDemoData() {
  try {
    const { db } = await import('./db');
    const { patients, encounters } = await import('@shared/schema');
    
    console.log('🗑️ Clearing existing demo data...');
    
    // Clear encounters first (foreign key constraint)
    await db.delete(encounters);
    await db.delete(patients);
    
    console.log('✅ Demo data cleared successfully');
    
  } catch (error) {
    console.error('❌ Failed to clear demo data:', error);
    throw error;
  }
}

// Full reset and initialization
export async function resetDemoDataset() {
  await clearDemoData();
  return await initializeDemoDataset();
}