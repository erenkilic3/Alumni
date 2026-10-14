/**
 * User Factory
 *
 * Generates realistic user records for tests, development, and seeding.
 * Supports trait chaining: .admin(), .alumni(), .student(), .department()
 */

const BaseFactory = require('./base.factory');
const db = require('../db');

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Can', 'Burak', 'Emre', 'Barış', 'Deniz', 'Kerem', 'Ozan', 'Tolga',
  'Ayşe', 'Fatma', 'Zeynep', 'Elif', 'Selin', 'Gamze', 'Derya', 'Büşra', 'Ece', 'Yasemin',
  'Alexandre', 'Elena', 'Lucas', 'Sophie', 'Oliver', 'Emma', 'Daniel', 'Liam', 'Maya', 'Noah'
];

const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan',
  'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat',
  'Martin', 'Schmidt', 'Bernard', 'Dubois', 'Müller', 'Larsen', 'Taylor', 'Anderson', 'Wilson', 'Novak'
];

const DEPARTMENTS = [
  'Software Engineering',
  'Computer Engineering',
  'Industrial Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science & AI',
  'Architecture',
  'Business Administration',
  'Bioengineering',
  'Cybersecurity & Networks'
];

const ROLES = ['STUDENT', 'ALUMNI', 'ADMIN'];

class UserFactory extends BaseFactory {
  definition(sequence = 1) {
    const firstName = BaseFactory.randomItem(FIRST_NAMES);
    const lastName = BaseFactory.randomItem(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const cleanFirst = BaseFactory.slugify(firstName);
    const cleanLast = BaseFactory.slugify(lastName);
    const uniqueEmail = `${cleanFirst}.${cleanLast}${sequence}_${Date.now().toString(36)}@alumni.edu`;
    const department = BaseFactory.randomItem(DEPARTMENTS);
    const role = BaseFactory.randomItem(ROLES);
    const createdAt = BaseFactory.randomDate(60, 5);

    return {
      id: `usr_${Date.now()}_${sequence}_${Math.random().toString(36).substr(2, 6)}`,
      name: fullName,
      email: uniqueEmail,
      role: role,
      department: department,
      createdAt: createdAt,
      updatedAt: createdAt
    };
  }

  // Trait states
  admin() {
    return this.state({ role: 'ADMIN' });
  }

  alumni() {
    return this.state({ role: 'ALUMNI' });
  }

  student() {
    return this.state({ role: 'STUDENT' });
  }

  department(deptName) {
    return this.state({ department: deptName });
  }

  /**
   * Persist user record to PostgreSQL database
   */
  async insert(record) {
    if (!db.isDbConnected) {
      return record;
    }

    const res = await db.query(
      `INSERT INTO users (id, name, email, role, department, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           role = EXCLUDED.role,
           department = EXCLUDED.department,
           updated_at = NOW()
       RETURNING id, name, email, role, department, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        record.id,
        record.name,
        record.email,
        record.role,
        record.department,
        record.createdAt || new Date().toISOString(),
        record.updatedAt || new Date().toISOString()
      ]
    );

    return res.rows[0] || record;
  }
}

module.exports = new UserFactory();
