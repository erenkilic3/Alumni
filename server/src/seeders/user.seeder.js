/**
 * User Seeder
 *
 * Populates PostgreSQL users table with baseline admin/student/alumni accounts
 * plus additional factory-generated users.
 */

const db = require('../db');
const { UserFactory } = require('../factories');

const CORE_USERS = [
  { id: "1", name: "Eren Kılıç", email: "eren@alumni.edu", role: "ADMIN", department: "Software Engineering" },
  { id: "2", name: "Ayşe Yılmaz", email: "ayse.yilmaz@google.com", role: "ALUMNI", department: "Computer Engineering" },
  { id: "3", name: "Burak Demir", email: "burak.demir@peak.com", role: "STUDENT", department: "Industrial Engineering" },
  { id: "4", name: "Mehmet Öz", email: "mehmet@tesla.com", role: "ALUMNI", department: "Electrical Engineering" },
  { id: "5", name: "Fatma Kaya", email: "fatma@alumni.edu", role: "STUDENT", department: "Architecture" },
  { id: "6", name: "Hakan Tosun", email: "hakan.tosun@google.com", role: "ALUMNI", department: "Computer Engineering" },
  { id: "7", name: "Mehmet Raşit FamousHand", email: "memetk3@student.com", role: "STUDENT", department: "Industrial Engineering" }
];

class UserSeeder {
  /**
   * Run user seeder
   * @param {number} [factoryCount=10] Additional users to create using UserFactory
   * @returns {Promise<{ coreCount: number, factoryCount: number, totalInserted: number }>}
   */
  async run(factoryCount = 10) {
    console.log('  ▶ [UserSeeder] Seeding core users...');
    let coreInserted = 0;

    for (const u of CORE_USERS) {
      if (db.isDbConnected) {
        await db.query(
          `INSERT INTO users (id, name, email, role, department, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name,
               email = EXCLUDED.email,
               role = EXCLUDED.role,
               department = EXCLUDED.department,
               updated_at = NOW()`,
          [u.id, u.name, u.email, u.role, u.department]
        );
        coreInserted++;
      }
    }

    let generatedCount = 0;
    if (factoryCount > 0) {
      console.log(`  ▶ [UserSeeder] Generating ${factoryCount} dynamic users via UserFactory...`);
      const generated = await UserFactory.create(factoryCount);
      generatedCount = generated.length;
    }

    console.log(`  ✅ [UserSeeder] Done. (Core: ${coreInserted}, Factory: ${generatedCount})`);
    return {
      coreCount: coreInserted,
      factoryCount: generatedCount,
      totalInserted: coreInserted + generatedCount
    };
  }
}

module.exports = new UserSeeder();
