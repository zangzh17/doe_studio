/**
 * Seed script for DOE Templates
 * Run with: node scripts/seed-templates.mjs
 * 
 * This script adds example templates to the database.
 * You can use this as a reference for adding more templates.
 */

import pg from 'pg';
const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Template definitions
const templates = [
  {
    name: "50×50 Spot Array",
    description: "Standard 50×50 spot projector for structured light applications. Suitable for 3D scanning and depth sensing.",
    mode: "2d_spot_projector",
    category: "spot_projector",
    parameters: {
      workingDistance: "inf",
      workingDistanceUnit: "mm",
      wavelength: "850nm",
      deviceDiameter: "12.7mm",
      deviceShape: "circular",
      arrayRows: "50",
      arrayCols: "50",
      targetType: "angle",
      targetAngle: "30deg",
      tolerance: "1",
      fabricationEnabled: false,
    },
    isPublic: true,
  },
  {
    name: "100×100 High-Density Array",
    description: "High-density 100×100 spot array for precision structured light. Ideal for high-resolution 3D reconstruction.",
    mode: "2d_spot_projector",
    category: "spot_projector",
    parameters: {
      workingDistance: "1m",
      workingDistanceUnit: "m",
      wavelength: "940nm",
      deviceDiameter: "25mm",
      deviceShape: "square",
      arrayRows: "100",
      arrayCols: "100",
      targetType: "size",
      targetSize: "500mm",
      tolerance: "2",
      fabricationEnabled: false,
    },
    isPublic: true,
  },
  {
    name: "1D Line Splitter (1×7)",
    description: "One-dimensional beam splitter creating 7 uniform spots in a line. Common for laser line generation.",
    mode: "1d_splitter",
    category: "splitter",
    parameters: {
      workingDistance: "inf",
      workingDistanceUnit: "mm",
      wavelength: "532nm",
      deviceDiameter: "12.7mm",
      deviceShape: "circular",
      arrayRows: "1",
      arrayCols: "7",
      targetType: "angle",
      targetAngle: "20deg",
      tolerance: "1",
      fabricationEnabled: false,
    },
    isPublic: true,
  },
  {
    name: "Gaussian Diffuser (10°)",
    description: "Gaussian beam homogenizer with 10° full divergence angle. Creates uniform circular illumination.",
    mode: "diffuser",
    category: "diffuser",
    parameters: {
      workingDistance: "inf",
      workingDistanceUnit: "mm",
      wavelength: "632.8nm",
      deviceDiameter: "25mm",
      deviceShape: "circular",
      targetType: "angle",
      targetAngle: "10deg",
      tolerance: "5",
      fabricationEnabled: false,
    },
    isPublic: true,
  },
  {
    name: "Square Diffuser (20°×20°)",
    description: "Square-shaped beam homogenizer with 20°×20° divergence. Ideal for rectangular illumination areas.",
    mode: "diffuser",
    category: "diffuser",
    parameters: {
      workingDistance: "inf",
      workingDistanceUnit: "mm",
      wavelength: "450nm",
      deviceDiameter: "12.7mm",
      deviceShape: "square",
      targetType: "angle",
      targetAngle: "20deg",
      tolerance: "5",
      fabricationEnabled: false,
    },
    isPublic: true,
  },
  {
    name: "Diffractive Lens (f=100mm)",
    description: "Diffractive focusing lens with 100mm focal length. Lightweight alternative to refractive optics.",
    mode: "lens",
    category: "lens",
    parameters: {
      workingDistance: "100mm",
      workingDistanceUnit: "mm",
      wavelength: "532nm",
      deviceDiameter: "25mm",
      deviceShape: "circular",
      fabricationEnabled: false,
    },
    isPublic: true,
  },
  {
    name: "5° Beam Deflector",
    description: "Diffractive prism for 5° beam deflection. Useful for beam steering applications.",
    mode: "prism",
    category: "prism",
    parameters: {
      workingDistance: "inf",
      workingDistanceUnit: "mm",
      wavelength: "1064nm",
      deviceDiameter: "12.7mm",
      deviceShape: "circular",
      targetType: "angle",
      targetAngle: "5deg",
      fabricationEnabled: false,
    },
    isPublic: true,
  },
  {
    name: "LiDAR Pattern (31×31)",
    description: "Optimized spot pattern for automotive LiDAR applications. 31×31 array with wide field of view.",
    mode: "2d_spot_projector",
    category: "spot_projector",
    parameters: {
      workingDistance: "inf",
      workingDistanceUnit: "mm",
      wavelength: "905nm",
      deviceDiameter: "6mm",
      deviceShape: "circular",
      arrayRows: "31",
      arrayCols: "31",
      targetType: "angle",
      targetAngle: "60deg",
      tolerance: "3",
      fabricationEnabled: true,
      fabricationRecipe: "multilevel8",
    },
    isPublic: true,
  },
];

async function seedTemplates() {
  const client = await pool.connect();
  
  try {
    console.log('Starting template seeding...');
    
    // Check if templates already exist
    const existingResult = await client.query('SELECT COUNT(*) FROM doe_templates');
    const existingCount = parseInt(existingResult.rows[0].count);
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing templates.`);
      const answer = process.argv.includes('--force') ? 'y' : 'n';
      if (answer !== 'y' && !process.argv.includes('--force')) {
        console.log('Use --force flag to replace existing templates.');
        console.log('Exiting without changes.');
        return;
      }
      
      // Clear existing templates
      await client.query('DELETE FROM doe_templates');
      console.log('Cleared existing templates.');
    }
    
    // Insert templates
    for (const template of templates) {
      await client.query(
        `INSERT INTO doe_templates (name, description, mode, category, parameters, is_public, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [
          template.name,
          template.description,
          template.mode,
          template.category,
          JSON.stringify(template.parameters),
          template.isPublic,
        ]
      );
      console.log(`✓ Added template: ${template.name}`);
    }
    
    console.log(`\nSuccessfully seeded ${templates.length} templates!`);
    
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
seedTemplates().catch(console.error);
