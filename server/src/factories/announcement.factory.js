/**
 * Announcement Factory
 *
 * Generates realistic announcements with categories, priorities, and statuses.
 * Supports trait chaining: .pinned(), .urgent(), .event(), .career(), .academic(), etc.
 */

const BaseFactory = require('./base.factory');
const db = require('../db');

const TITLES = [
  'Annual Alumni Homecoming & Networking Gala 2026',
  'Global Mentorship Program: Senior Alumni Applications Open',
  'Postgraduate Research Grants in Artificial Intelligence & Robotics',
  'New Digital Alumni ID Card with Lifetime Library & Facility Access',
  'Tech Career Fair: Meet 40+ International Hiring Partners',
  'Distinguished Alumni Lecture Series: Clean Energy Transitions',
  'Call for Papers: International Alumni Academic Symposium',
  'Startup Pitch Competition: $50K Seed Funding for Graduate Founders',
  'Exclusive Alumni Webinar: Navigating Leadership in Hybrid Work',
  'Alumni Chapter Launch: London, Berlin & Silicon Valley Meetups',
  'Campus Innovation Hub Ribbon Cutting & Lab Tours',
  'Young Alumni Mentorship Circle: Registration for Class of 2024-2025'
];

const CONTENTS = [
  'Join university leadership, faculty members, and fellow graduates for an inspiring weekend on campus. Features networking dinners, department tours, and celebratory awards.',
  'We are recruiting experienced alumni working in software, engineering, product, and finance to guide graduating students through their pivotal first career steps.',
  'The Faculty of Engineering announces competitive grant funding for interdisciplinary research projects focusing on sustainable computing and automation.',
  'Access verified digital credentials directly through your mobile wallet. Enables global campus library entry, athletic facilities, and university bookstore discounts.',
  'Top employers from Europe and North America will be hosting on-campus and virtual hiring booths for software engineering, management consulting, and data science roles.',
  'Join us for an evening keynote with renowned industry leaders discussing emerging trends in scalable cloud infrastructure and clean energy engineering.'
];

const AUTHORS = [
  'Alumni Relations Office',
  'Career Development Center',
  'Faculty of Engineering & Natural Sciences',
  'Office of the Dean of Students',
  'University Innovation & Incubation Center',
  'Academic Senate Communications'
];

const CATEGORIES = ['EVENT', 'CAREER', 'ACADEMIC', 'GENERAL'];
const PRIORITIES = ['NORMAL', 'HIGH', 'URGENT'];
const STATUSES = ['ACTIVE', 'ARCHIVED', 'DRAFT'];

class AnnouncementFactory extends BaseFactory {
  definition(sequence = 1) {
    const title = BaseFactory.randomItem(TITLES);
    const content = BaseFactory.randomItem(CONTENTS);
    const author = BaseFactory.randomItem(AUTHORS);
    const category = BaseFactory.randomItem(CATEGORIES);
    const priority = BaseFactory.randomItem(PRIORITIES);
    const isPinned = BaseFactory.randomBoolean(0.25);
    const status = BaseFactory.randomItem(STATUSES);
    const createdAt = BaseFactory.randomDate(45, 1);

    return {
      id: `ann_${Date.now()}_${sequence}_${Math.random().toString(36).substr(2, 6)}`,
      title: `${title} #${sequence}`,
      content: content,
      category: category,
      priority: priority,
      author: author,
      isPinned: isPinned,
      status: status,
      createdAt: createdAt,
      updatedAt: createdAt
    };
  }

  // Trait states
  pinned(value = true) {
    return this.state({ isPinned: value });
  }

  urgent() {
    return this.state({ priority: 'URGENT' });
  }

  high() {
    return this.state({ priority: 'HIGH' });
  }

  normal() {
    return this.state({ priority: 'NORMAL' });
  }

  event() {
    return this.state({ category: 'EVENT' });
  }

  career() {
    return this.state({ category: 'CAREER' });
  }

  academic() {
    return this.state({ category: 'ACADEMIC' });
  }

  general() {
    return this.state({ category: 'GENERAL' });
  }

  active() {
    return this.state({ status: 'ACTIVE' });
  }

  archived() {
    return this.state({ status: 'ARCHIVED' });
  }

  draft() {
    return this.state({ status: 'DRAFT' });
  }

  /**
   * Persist announcement record to PostgreSQL database
   */
  async insert(record) {
    if (!db.isDbConnected) {
      return record;
    }

    const res = await db.query(
      `INSERT INTO announcements (id, title, content, category, priority, author, is_pinned, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title,
           content = EXCLUDED.content,
           category = EXCLUDED.category,
           priority = EXCLUDED.priority,
           author = EXCLUDED.author,
           is_pinned = EXCLUDED.is_pinned,
           status = EXCLUDED.status,
           updated_at = NOW()
       RETURNING id, title, content, category, priority, author, is_pinned AS "isPinned", status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [
        record.id,
        record.title,
        record.content,
        record.category,
        record.priority,
        record.author,
        record.isPinned !== undefined ? record.isPinned : false,
        record.status || 'ACTIVE',
        record.createdAt || new Date().toISOString(),
        record.updatedAt || new Date().toISOString()
      ]
    );

    return res.rows[0] || record;
  }
}

module.exports = new AnnouncementFactory();
