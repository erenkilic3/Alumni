-- ==============================================================================
-- Migration 004: Seed Initial Data
-- Conforms to Data Definition Document (ddd.md)
-- ==============================================================================

-- UP
INSERT INTO users (id, name, email, role, department, created_at, updated_at)
VALUES
  ('1', 'Eren Kılıç', 'eren@alumni.edu', 'ADMIN', 'Software Engineering', NOW(), NOW()),
  ('2', 'Ayşe Yılmaz', 'ayse.yilmaz@google.com', 'ALUMNI', 'Computer Engineering', NOW(), NOW()),
  ('3', 'Burak Demir', 'burak.demir@peak.com', 'STUDENT', 'Industrial Engineering', NOW(), NOW()),
  ('4', 'Mehmet Öz', 'mehmet@tesla.com', 'ALUMNI', 'Electrical Engineering', NOW(), NOW()),
  ('5', 'Fatma Kaya', 'fatma@alumni.edu', 'STUDENT', 'Architecture', NOW(), NOW()),
  ('6', 'hakan tosun', 'hakatosun@student.com', 'STUDENT', 'doctor', NOW(), NOW()),
  ('7', 'memet raşit famoushand', 'memetk3@student.com', 'STUDENT', 'barber', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO announcements (id, title, content, category, priority, author, user_id, is_pinned, status, created_at, updated_at)
VALUES
  (
    '1',
    'Annual Alumni Homecoming Weekend 2026',
    'Join us this October for the annual Homecoming Reunion! Connect with fellow graduates, network with university faculty, and celebrate campus milestones. Registration is free for all registered alumni members.',
    'EVENT',
    'HIGH',
    'Alumni Relations Office',
    '1',
    TRUE,
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    '2',
    'Global Tech Mentorship Program Applications Open',
    'We are recruiting senior engineering and product alumni to mentor graduating students. The 6-month program pairs industry leaders with ambitious undergraduates.',
    'CAREER',
    'URGENT',
    'Career Development Center',
    '1',
    TRUE,
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    '3',
    '2026 Research Fellowship & Grant Opportunities',
    'Applications are now invited for international postgraduate research grants in Sustainable Energy and Artificial Intelligence. Early submission deadline is November 15.',
    'ACADEMIC',
    'NORMAL',
    'Office of Academic Affairs',
    '1',
    FALSE,
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    '4',
    'New Digital Alumni Card & Campus Library Access',
    'Alumni Sphere members can now generate digital alumni IDs to access university research libraries and athletic facilities worldwide.',
    'GENERAL',
    'NORMAL',
    'Alumni Relations Office',
    '1',
    FALSE,
    'ACTIVE',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO alumni (id, name, graduation_year, department, company, role, location, industry, skills, avatar, is_mentor, bio, user_id, created_at)
VALUES
  (
    '1',
    'Hakan Tosun',
    2021,
    'Computer Engineering',
    'Google',
    'Senior Software Engineer',
    'Zurich, Switzerland',
    'Technology',
    ARRAY['Go', 'Kubernetes', 'Distributed Systems', 'Cloud'],
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    TRUE,
    'Graduated with honors in 2021. Open for student mentorship in cloud infrastructure.',
    '6',
    NOW()
  ),
  (
    '2',
    'Mehmet Raşid FamousHand',
    2019,
    'Industrial Engineering',
    'Amazon',
    'Lead Product Manager',
    'Çorum',
    'E-Commerce',
    ARRAY['Product Strategy', 'Agile', 'Data Analytics', 'UX'],
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    TRUE,
    'Passionate about building customer-centric products. Mentor for tech career transitions.',
    '7',
    NOW()
  ),
  (
    '3',
    'Erenk3',
    2023,
    'Software Engineering',
    'Spotify',
    'Full Stack Engineer',
    'Stockholm, Sweden',
    'Streaming & Media',
    ARRAY['TypeScript', 'Node.js', 'React', 'PostgreSQL'],
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    FALSE,
    'Building audio discovery features. Alumni representative for Nordic region.',
    '1',
    NOW()
  ),
  (
    '4',
    'Emre Çelik',
    2018,
    'Electrical & Electronics Engineering',
    'Tesla',
    'Autopilot Firmware Engineer',
    'Berlin, Germany',
    'Automotive & AI',
    ARRAY['C++', 'Embedded Systems', 'Robotics', 'Computer Vision'],
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    TRUE,
    'Working on automotive autonomy. Happy to connect with junior engineers.',
    '4',
    NOW()
  ),
  (
    '5',
    'Selin Öztürk',
    2022,
    'Business Administration',
    'McKinsey & Company',
    'Associate Consultant',
    'Istanbul, Turkey',
    'Management Consulting',
    ARRAY['Financial Modeling', 'Corporate Strategy', 'Market Research'],
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    FALSE,
    'Consulting for energy and sustainability sectors.',
    '2',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- DOWN
DELETE FROM alumni WHERE id IN ('1', '2', '3', '4', '5');
DELETE FROM announcements WHERE id IN ('1', '2', '3', '4');
DELETE FROM users WHERE id IN ('1', '2', '3', '4', '5', '6', '7');
