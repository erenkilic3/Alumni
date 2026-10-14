/**
 * Announcement Seeder
 *
 * Populates PostgreSQL announcements table with baseline campus announcements
 * plus additional factory-generated announcements.
 */

const db = require('../db');
const { AnnouncementFactory } = require('../factories');

const CORE_ANNOUNCEMENTS = [
  {
    id: "1",
    title: "Annual Alumni Homecoming Weekend 2026",
    content: "Join us this October for the annual Homecoming Reunion! Connect with fellow graduates, network with university faculty, and celebrate campus milestones. Registration is free for all registered alumni members.",
    category: "EVENT",
    priority: "HIGH",
    author: "Alumni Relations Office",
    isPinned: true,
    status: "ACTIVE"
  },
  {
    id: "2",
    title: "Global Tech Mentorship Program Applications Open",
    content: "We are recruiting senior engineering and product alumni to mentor graduating students. The 6-month program pairs industry leaders with ambitious undergraduates.",
    category: "CAREER",
    priority: "URGENT",
    author: "Career Development Center",
    isPinned: true,
    status: "ACTIVE"
  },
  {
    id: "3",
    title: "2026 Research Fellowship & Grant Opportunities",
    content: "Applications are now invited for international postgraduate research grants in Sustainable Energy and Artificial Intelligence. Early submission deadline is November 15.",
    category: "ACADEMIC",
    priority: "NORMAL",
    author: "Office of Academic Affairs",
    isPinned: false,
    status: "ACTIVE"
  },
  {
    id: "4",
    title: "New Digital Alumni Card & Campus Library Access",
    content: "Alumni Sphere members can now generate digital alumni IDs to access university research libraries and athletic facilities worldwide.",
    category: "GENERAL",
    priority: "NORMAL",
    author: "Alumni Relations Office",
    isPinned: false,
    status: "ACTIVE"
  }
];

class AnnouncementSeeder {
  /**
   * Run announcement seeder
   * @param {number} [factoryCount=8] Additional announcements to generate via AnnouncementFactory
   * @returns {Promise<{ coreCount: number, factoryCount: number, totalInserted: number }>}
   */
  async run(factoryCount = 8) {
    console.log('  ▶ [AnnouncementSeeder] Seeding core announcements...');
    let coreInserted = 0;

    for (const a of CORE_ANNOUNCEMENTS) {
      if (db.isDbConnected) {
        await db.query(
          `INSERT INTO announcements (id, title, content, category, priority, author, is_pinned, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE
           SET title = EXCLUDED.title,
               content = EXCLUDED.content,
               category = EXCLUDED.category,
               priority = EXCLUDED.priority,
               author = EXCLUDED.author,
               is_pinned = EXCLUDED.is_pinned,
               status = EXCLUDED.status,
               updated_at = NOW()`,
          [a.id, a.title, a.content, a.category, a.priority, a.author, a.isPinned, a.status]
        );
        coreInserted++;
      }
    }

    let generatedCount = 0;
    if (factoryCount > 0) {
      console.log(`  ▶ [AnnouncementSeeder] Generating ${factoryCount} dynamic announcements via AnnouncementFactory...`);
      const generated = await AnnouncementFactory.create(factoryCount);
      generatedCount = generated.length;
    }

    console.log(`  ✅ [AnnouncementSeeder] Done. (Core: ${coreInserted}, Factory: ${generatedCount})`);
    return {
      coreCount: coreInserted,
      factoryCount: generatedCount,
      totalInserted: coreInserted + generatedCount
    };
  }
}

module.exports = new AnnouncementSeeder();
