const UserModel = require('../models/user.model');
const AnnouncementModel = require('../models/announcement.model');
const AlumniModel = require('../models/alumni.model');
const JobPostingModel = require('../models/job-posting.model');

/**
 * NestedController
 *
 * RESTful API Controller handling hierarchical parent-child relationships:
 * 1. USERS -> ANNOUNCEMENTS (/api/users/:userId/announcements)
 * 2. USERS -> ALUMNI        (/api/users/:userId/alumni)
 * 3. USERS -> JOB_POSTINGS  (/api/users/:userId/jobs)
 * 4. ALUMNI -> USERS        (/api/alumni/:alumniId/user)
 * 5. ALUMNI -> JOB_POSTINGS (/api/alumni/:alumniId/jobs)
 * 6. JOBS -> USER           (/api/jobs/:jobId/user)
 * 7. JOBS -> ALUMNI         (/api/jobs/:jobId/alumni)
 */
class NestedController {
  constructor({
    userModel = UserModel,
    announcementModel = AnnouncementModel,
    alumniModel = AlumniModel,
    jobModel = JobPostingModel
  } = {}) {
    this.userModel = userModel;
    this.announcementModel = announcementModel;
    this.alumniModel = alumniModel;
    this.jobModel = jobModel;

    this.getUserAnnouncements = this.getUserAnnouncements.bind(this);
    this.createUserAnnouncement = this.createUserAnnouncement.bind(this);
    this.getUserAlumni = this.getUserAlumni.bind(this);
    this.createUserAlumni = this.createUserAlumni.bind(this);
    this.getUserJobs = this.getUserJobs.bind(this);
    this.createUserJob = this.createUserJob.bind(this);
    this.getAlumniUser = this.getAlumniUser.bind(this);
    this.getAlumniJobs = this.getAlumniJobs.bind(this);
    this.createAlumniJob = this.createAlumniJob.bind(this);
    this.getJobUser = this.getJobUser.bind(this);
    this.getJobAlumni = this.getJobAlumni.bind(this);
  }

  // ==========================================================================
  // 1. USERS <---> ANNOUNCEMENTS
  // ==========================================================================

  /**
   * GET /api/users/:userId/announcements
   * Retrieve all announcements authored/published by a specific user
   */
  async getUserAnnouncements(req, res) {
    try {
      const { userId } = req.params;
      const user = await this.userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${userId})`
        });
      }

      const announcements = await this.announcementModel.findByUserId(userId);
      return res.status(200).json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        count: announcements.length,
        announcements
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve user announcements: ' + err.message
      });
    }
  }

  /**
   * POST /api/users/:userId/announcements
   * Create a new announcement under a specific user
   */
  async createUserAnnouncement(req, res) {
    try {
      const { userId } = req.params;
      const user = await this.userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${userId})`
        });
      }

      const { title, content, category, priority, isPinned, status } = req.body;
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required.'
        });
      }

      const created = await this.announcementModel.create({
        title,
        content,
        category,
        priority,
        author: req.body.author || user.name,
        userId: user.id,
        isPinned,
        status
      });

      return res.status(201).json({
        success: true,
        message: `Announcement created under user "${user.name}".`,
        announcement: created
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create announcement: ' + err.message
      });
    }
  }

  // ==========================================================================
  // 2. USERS <---> ALUMNI
  // ==========================================================================

  /**
   * GET /api/users/:userId/alumni
   * Retrieve alumni profile linked to user account
   */
  async getUserAlumni(req, res) {
    try {
      const { userId } = req.params;
      const user = await this.userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${userId})`
        });
      }

      const alumni = await this.alumniModel.findByUserId(userId);
      if (!alumni) {
        return res.status(404).json({
          success: false,
          error: `No alumni profile linked to user ID ${userId}.`
        });
      }

      return res.status(200).json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
        alumni
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve alumni profile: ' + err.message
      });
    }
  }

  /**
   * POST /api/users/:userId/alumni
   * Create and link an alumni profile for a user
   */
  async createUserAlumni(req, res) {
    try {
      const { userId } = req.params;
      const user = await this.userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${userId})`
        });
      }

      const existingAlumni = await this.alumniModel.findByUserId(userId);
      if (existingAlumni) {
        return res.status(409).json({
          success: false,
          error: `User already has an alumni profile (ID: ${existingAlumni.id}).`,
          alumni: existingAlumni
        });
      }

      const {
        graduationYear,
        department,
        company,
        role,
        location,
        industry,
        skills,
        avatar,
        isMentor,
        bio
      } = req.body;

      const created = await this.alumniModel.create({
        name: req.body.name || user.name,
        graduationYear: graduationYear || 2024,
        department: department || user.department,
        company,
        role,
        location,
        industry,
        skills,
        avatar,
        isMentor,
        bio,
        userId: user.id
      });

      return res.status(201).json({
        success: true,
        message: `Alumni profile created and linked to user "${user.name}".`,
        alumni: created
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create alumni profile: ' + err.message
      });
    }
  }

  // ==========================================================================
  // 3. USERS <---> JOB POSTINGS
  // ==========================================================================

  /**
   * GET /api/users/:userId/jobs
   * Retrieve all job postings created by a specific user
   */
  async getUserJobs(req, res) {
    try {
      const { userId } = req.params;
      const user = await this.userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${userId})`
        });
      }

      const jobs = await this.jobModel.findByUserId(userId);
      return res.status(200).json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
        count: jobs.length,
        jobs
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve user jobs: ' + err.message
      });
    }
  }

  /**
   * POST /api/users/:userId/jobs
   * Create a job posting under a specific user
   */
  async createUserJob(req, res) {
    try {
      const { userId } = req.params;
      const user = await this.userModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User not found (ID: ${userId})`
        });
      }

      const { title, company, location, type, description, requirements, salaryRange, contactEmail, deadline, status, alumniId } = req.body;
      if (!title || !company) {
        return res.status(400).json({
          success: false,
          error: 'Title and company are required.'
        });
      }

      const created = await this.jobModel.create({
        title,
        company,
        location,
        type,
        description,
        requirements,
        salaryRange,
        contactEmail,
        postedBy: req.body.postedBy || user.name,
        userId: user.id,
        alumniId: alumniId || null,
        deadline,
        status
      });

      return res.status(201).json({
        success: true,
        message: `Job posting created under user "${user.name}".`,
        job: created
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create job posting: ' + err.message
      });
    }
  }

  // ==========================================================================
  // 4. ALUMNI <---> USER
  // ==========================================================================

  /**
   * GET /api/alumni/:alumniId/user
   * Retrieve the user account associated with this alumni profile
   */
  async getAlumniUser(req, res) {
    try {
      const { alumniId } = req.params;
      const alumni = await this.alumniModel.findById(alumniId);

      if (!alumni) {
        return res.status(404).json({
          success: false,
          error: `Alumni profile not found (ID: ${alumniId})`
        });
      }

      if (!alumni.userId) {
        return res.status(404).json({
          success: false,
          error: `Alumni profile #${alumniId} is not linked to any user account.`
        });
      }

      const user = await this.userModel.findById(alumni.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: `Linked user account (ID: ${alumni.userId}) not found.`
        });
      }

      return res.status(200).json({
        success: true,
        alumni: { id: alumni.id, name: alumni.name, department: alumni.department },
        user
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve alumni user: ' + err.message
      });
    }
  }

  // ==========================================================================
  // 5. ALUMNI <---> JOB POSTINGS
  // ==========================================================================

  /**
   * GET /api/alumni/:alumniId/jobs
   * Retrieve all job postings referred/recommended by this alumnus
   */
  async getAlumniJobs(req, res) {
    try {
      const { alumniId } = req.params;
      const alumni = await this.alumniModel.findById(alumniId);

      if (!alumni) {
        return res.status(404).json({
          success: false,
          error: `Alumni profile not found (ID: ${alumniId})`
        });
      }

      const jobs = await this.jobModel.findByAlumniId(alumniId);
      return res.status(200).json({
        success: true,
        alumni: { id: alumni.id, name: alumni.name, company: alumni.company },
        count: jobs.length,
        jobs
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve alumni jobs: ' + err.message
      });
    }
  }

  /**
   * POST /api/alumni/:alumniId/jobs
   * Create a job posting referred by this alumnus
   */
  async createAlumniJob(req, res) {
    try {
      const { alumniId } = req.params;
      const alumni = await this.alumniModel.findById(alumniId);

      if (!alumni) {
        return res.status(404).json({
          success: false,
          error: `Alumni profile not found (ID: ${alumniId})`
        });
      }

      const { title, company, location, type, description, requirements, salaryRange, contactEmail, deadline, status } = req.body;
      if (!title || !company) {
        return res.status(400).json({
          success: false,
          error: 'Title and company are required.'
        });
      }

      const created = await this.jobModel.create({
        title,
        company,
        location,
        type,
        description,
        requirements,
        salaryRange,
        contactEmail,
        postedBy: req.body.postedBy || alumni.name,
        alumniId: alumni.id,
        userId: alumni.userId || null,
        deadline,
        status
      });

      return res.status(201).json({
        success: true,
        message: `Job posting referred by alumni "${alumni.name}".`,
        job: created
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create alumni job: ' + err.message
      });
    }
  }

  // ==========================================================================
  // 6. JOBS <---> USER / ALUMNI
  // ==========================================================================

  /**
   * GET /api/jobs/:jobId/user
   * Retrieve the user account who posted this job
   */
  async getJobUser(req, res) {
    try {
      const { jobId } = req.params;
      const job = await this.jobModel.findById(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: `Job posting not found (ID: ${jobId})`
        });
      }

      if (!job.userId) {
        return res.status(404).json({
          success: false,
          error: `Job posting #${jobId} is not associated with a specific user account.`
        });
      }

      const user = await this.userModel.findById(job.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: `User account #${job.userId} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        job: { id: job.id, title: job.title, company: job.company },
        user
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve job user: ' + err.message
      });
    }
  }

  /**
   * GET /api/jobs/:jobId/alumni
   * Retrieve the alumni profile who referred/recommended this job
   */
  async getJobAlumni(req, res) {
    try {
      const { jobId } = req.params;
      const job = await this.jobModel.findById(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: `Job posting not found (ID: ${jobId})`
        });
      }

      if (!job.alumniId) {
        return res.status(404).json({
          success: false,
          error: `Job posting #${jobId} is not associated with an alumni referral.`
        });
      }

      const alumni = await this.alumniModel.findById(job.alumniId);
      if (!alumni) {
        return res.status(404).json({
          success: false,
          error: `Alumni profile #${job.alumniId} not found.`
        });
      }

      return res.status(200).json({
        success: true,
        job: { id: job.id, title: job.title, company: job.company },
        alumni
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve job alumni: ' + err.message
      });
    }
  }
}

module.exports = new NestedController();
