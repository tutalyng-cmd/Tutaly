import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as crypto from 'crypto';

dotenv.config({ path: join(__dirname, '../../../../.env') });

const categoriesData = {
  "Career Services": [
    "CV & Applications",
    "Interview Preparation",
    "Career Coaching",
    "Profile Optimization",
    "Job Search Support",
    "Other Career Services"
  ],
  "Professional Services": [
    "Human Resources Services",
    "Customer Support Services",
    "Virtual Assistance",
    "Office & Administrative Support",
    "Bookkeeping",
    "Financial Advisory",
    "Tax Support",
    "Payroll Services",
    "Contract Drafting",
    "Legal Advisory",
    "Graphic Design",
    "Branding",
    "Video Editing",
    "Copywriting",
    "Technical Writing",
    "Editing & Proofreading",
    "Other Professional Services"
  ],
  "Health & Wellness": [
    "Therapy / Counselling",
    "Workplace Wellness",
    "Other Health & Wellness"
  ],
  "Technology & Digital Services": [
    "Web Development",
    "Software Development",
    "UI/UX Design",
    "Data Analysis",
    "Cybersecurity",
    "IT Support",
    "CCTV & Security Installation",
    "Other Technology Services"
  ],
  "Workplace & Facility Services": [
    "Cleaning & Maintenance",
    "Facility Management",
    "Office Setup & Installation",
    "Construction & Fittings",
    "Technical Installations",
    "Interior Office Setup",
    "Other Workplace Services"
  ],
  "Food & Office Meals": [
    "Office Catering Services",
    "Bulk Meals",
    "Snacks & Pastries (Bulk)",
    "Beverages & Drinks",
    "Tea, Coffee & Supplies",
    "Disposable Dining Supplies",
    "Other Food Listings"
  ],
  "Courses & Training": [
    "Career Development",
    "Tech & Digital Skills",
    "Business & Finance",
    "Creative Skills",
    "Professional Certifications",
    "HSE / Safety Training",
    "Other Training Programs"
  ],
  "Digital Resources": [
    "CV Templates",
    "Business Templates",
    "Design Templates",
    "Policies",
    "SOPs",
    "Contracts",
    "Career Guides",
    "Business Guides",
    "Industry Guides",
    "HR Toolkits",
    "Business Startup Packs",
    "Marketing Kits",
    "Career Toolkits",
    "90-Day Career Plans",
    "Business Launch Plans",
    "Skill Development Plans",
    "Other Digital Resources"
  ],
  "Office Supplies & Stationery": [
    "Paper Products",
    "Writing Tools",
    "Files & Folders",
    "Desk Tools",
    "Desk Organizers"
  ],
  "Office Equipment & Machines": [
    "Printers",
    "Scanners",
    "Photocopiers",
    "Shredders",
    "Laminating Machines",
    "Binding Machines",
    "Projectors",
    "Office Telephones"
  ],
  "IT, Security & Connectivity": [
    "Routers",
    "Networking Devices",
    "CCTV Systems",
    "Biometric Systems",
    "Computer Accessories"
  ],
  "Office Furniture": [
    "Desks",
    "Chairs",
    "Workstations",
    "Cabinets",
    "Shelves"
  ],
  "Interior, Décor & Setup": [
    "Curtains & Blinds",
    "Partitions",
    "Glass Fittings",
    "Wall Art",
    "Plants & Aquariums"
  ],
  "Lighting & Electrical": [
    "Lights & Bulbs",
    "Electrical Fittings",
    "Extension Boxes"
  ],
  "Workplace Appliances": [
    "Air Conditioners",
    "Fans",
    "Refrigerators",
    "Microwaves",
    "Water Dispensers",
    "Coffee Machines"
  ],
  "Cleaning & Janitorial": [
    "Tissue Paper",
    "Sanitizers & Hand Wash",
    "Cleaning Tools & Chemicals",
    "Air Fresheners"
  ],
  "Safety, Medical & Emergency": [
    "First Aid Kits",
    "Fire Extinguishers",
    "PPE"
  ],
  "Professional Wear & Uniforms": [
    "Corporate Wear",
    "Industry Uniforms",
    "Safety Wear"
  ],
  "Business Security & Storage": [
    "Office Safes",
    "Lock Boxes"
  ],
  "Learning Materials": [
    "Books",
    "Study Guides",
    "Training Manuals"
  ],
  "Professional Bags": [
    "Laptop Bags",
    "Briefcases",
    "Backpacks"
  ],
  "Starter Kits & Bundles": [
    "Job Seeker Kits",
    "Office Setup Kits",
    "Remote Work Kits"
  ],
  "Industrial & Oil/Gas": [
    "PPE & Safety Gear",
    "Drilling Chemicals",
    "Mud Engineering Tools",
    "Solids Control Equipment",
    "Industrial Measuring Tools"
  ],
  "Other / Uncategorized": [
    "Miscellaneous Services",
    "Miscellaneous Products"
  ]
};

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database via pg...');
    await client.connect();

    // Begin transaction
    await client.query('BEGIN');

    // Soft delete strategy for old categories not in the new list (or you could just ignore them)
    // We'll just upsert and merge here.
    
    // In production, we'd want to be careful with deleting categories that have products.
    // For this seed script, we just ensure all new categories/subcategories exist.
    
    for (const [categoryName, subcategories] of Object.entries(categoriesData)) {
      let categoryRes = await client.query(
        'SELECT id FROM shop_categories WHERE name = $1',
        [categoryName]
      );
      
      let categoryId;
      if (categoryRes.rowCount === 0) {
        categoryId = crypto.randomUUID();
        await client.query(
          'INSERT INTO shop_categories (id, name, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
          [categoryId, categoryName]
        );
        console.log(`Created category: ${categoryName}`);
      } else {
        categoryId = categoryRes.rows[0].id;
      }

      for (const subName of subcategories) {
        let subRes = await client.query(
          'SELECT id FROM shop_subcategories WHERE name = $1 AND "categoryId" = $2',
          [subName, categoryId]
        );

        if (subRes.rowCount === 0) {
          const subId = crypto.randomUUID();
          await client.query(
            'INSERT INTO shop_subcategories (id, name, "categoryId", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
            [subId, subName, categoryId]
          );
          console.log(`  Created subcategory: ${subName}`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('Successfully seeded shop categories with refined structure!');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
