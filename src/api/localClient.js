/**
 * localClient.js
 * ─────────────────────────────────────────────
 * Drop-in replacement for @base44/sdk that stores
 * all data in localStorage.  Exposes the same shape:
 *   localClient.auth.me()
 *   localClient.auth.login()
 *   localClient.auth.logout()
 *   localClient.auth.redirectToLogin()         (no-op / navigate to /login)
 *   localClient.entities.<EntityName>.list()
 *   localClient.entities.<EntityName>.filter()
 *   localClient.entities.<EntityName>.get(id)
 *   localClient.entities.<EntityName>.create()
 *   localClient.entities.<EntityName>.update()
 *   localClient.entities.<EntityName>.delete()
 *   localClient.functions.invoke()             (no-op stubs)
 *   localClient.integrations.Core.UploadFile() (stub returns placeholder URL)
 *
 * ─────────────────────────────────────────────
 * All methods return Promises to match the async
 * shape of the real SDK.
 * ─────────────────────────────────────────────
 */

// ─── Storage helpers ──────────────────────────

const PREFIX = 'talentsphere_';

function storeGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function storeSet(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

// ─── ID generation ────────────────────────────

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Generic Entity Store ─────────────────────

function makeEntityStore(entityName) {
  const key = `entity_${entityName}`;

  function getAll() {
    return storeGet(key) || [];
  }

  function saveAll(items) {
    storeSet(key, items);
  }

  return {
    /** List all records */
    list() {
      return Promise.resolve([...getAll()]);
    },

    /**
     * Filter records by an object of field→value pairs.
     * Supports simple equality only.
     * @param {object} filters
     * @param {string} [sort]   field name, prefix '-' for desc
     * @param {number} [limit]
     */
    filter(filters = {}, sort = '', limit = 1000) {
      let items = getAll().filter(item =>
        Object.entries(filters).every(([k, v]) => item[k] === v)
      );

      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        items.sort((a, b) => {
          const av = a[field] ?? '';
          const bv = b[field] ?? '';
          return desc
            ? String(bv).localeCompare(String(av))
            : String(av).localeCompare(String(bv));
        });
      }

      return Promise.resolve(items.slice(0, limit));
    },

    /** Get single record by id */
    get(id) {
      const item = getAll().find(i => i.id === id) ?? null;
      return Promise.resolve(item);
    },

    /** Create a new record */
    create(data) {
      const items = getAll();
      const newItem = {
        ...data,
        id: genId(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };
      items.push(newItem);
      saveAll(items);
      return Promise.resolve({ ...newItem });
    },

    /** Update an existing record by id */
    update(id, data) {
      const items = getAll();
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) return Promise.reject(new Error(`${entityName} ${id} not found`));
      items[idx] = { ...items[idx], ...data, updated_date: new Date().toISOString() };
      saveAll(items);
      return Promise.resolve({ ...items[idx] });
    },

    /** Delete a record by id */
    delete(id) {
      const items = getAll().filter(i => i.id !== id);
      saveAll(items);
      return Promise.resolve({ id });
    },
  };
}

// ─── Auth Module ──────────────────────────────

const AUTH_KEY = 'auth_session';

const auth = {
  /** Returns the currently logged-in user object or throws */
  me() {
    const session = storeGet(AUTH_KEY);
    if (!session) return Promise.reject({ status: 401, message: 'Not authenticated' });
    return Promise.resolve({ ...session });
  },

  /**
   * Log in with email + password.
   * Looks up the user in the 'User' entity store.
   * Returns the user object on success.
   */
  async login({ email, password }) {
    const users = storeGet('entity_User') || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return Promise.reject(new Error('Invalid email or password'));
    const session = { ...user };
    delete session.password; // never store password in session
    storeSet(AUTH_KEY, session);
    return Promise.resolve(session);
  },

  /** Log out the current user */
  logout() {
    localStorage.removeItem(PREFIX + AUTH_KEY);
    return Promise.resolve();
  },

  /**
   * No-op – in the real SDK this redirects to an external login page.
   * Locally we just navigate to /login via a browser event so that
   * React Router can pick it up.
   */
  redirectToLogin(returnUrl) {
    window.dispatchEvent(new CustomEvent('localAuth:redirectToLogin', { detail: { returnUrl } }));
  },

  /** Update the currently logged-in user's profile */
  async updateMe(data) {
    const session = storeGet(AUTH_KEY);
    if (!session) return Promise.reject({ status: 401, message: 'Not authenticated' });

    // Update in User entity store too
    const users = storeGet('entity_User') || [];
    const idx = users.findIndex(u => u.id === session.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      storeSet('entity_User', users);
    }

    const updated = { ...session, ...data };
    storeSet(AUTH_KEY, updated);
    return Promise.resolve(updated);
  },

  /** Register a new user (used by CandidateRegistration / CompanyRegistration) */
  async register(userData) {
    const users = storeGet('entity_User') || [];
    if (users.find(u => u.email === userData.email)) {
      return Promise.reject(new Error('Email already registered'));
    }
    const newUser = {
      ...userData,
      id: genId(),
      created_date: new Date().toISOString(),
    };
    users.push(newUser);
    storeSet('entity_User', users);
    return Promise.resolve({ success: true, user: newUser });
  },
};

// ─── Functions (stubs) ────────────────────────

const functions = {
  invoke(name, payload) {
    console.info(`[localClient] functions.invoke("${name}", `, payload, ')');
    return Promise.resolve({ success: true });
  },
};

// ─── Integrations (stubs) ─────────────────────

const integrations = {
  Core: {
    async UploadFile({ file }) {
      // Return a local object URL so the UI doesn't break
      const url = URL.createObjectURL(file);
      return { file_url: url };
    },
  },
};

// ─── Entity registry ──────────────────────────
//  Add any entity name you need here.

const ENTITY_NAMES = [
  'User',
  'CandidateProfile',
  'CompanyProfile',
  'Job',
  'Application',
  'SavedItem',
  'Message',
  'Notification',
];

const entities = Object.fromEntries(
  ENTITY_NAMES.map(name => [name, makeEntityStore(name)])
);

// ─── Seed demo data on first load ─────────────

function seed() {
  // Only seed once per version
  if (storeGet('seeded_v2')) return;

  // Demo users
  const users = [
    { id: 'admin1', email: 'admin@talentsphere.com', password: 'admin123', role: 'admin', full_name: 'Admin User' },
    { id: 'cand1',  email: 'candidate@example.com',  password: 'pass123',  role: 'candidate', full_name: 'Jane Doe' },
    { id: 'cand2',  email: 'john@example.com',       password: 'pass123',  role: 'candidate', full_name: 'John Smith' },
    { id: 'comp1',  email: 'company@example.com',    password: 'pass123',  role: 'company',   full_name: 'Acme Corp' },
    { id: 'comp2',  email: 'global@example.com',     password: 'pass123',  role: 'company',   full_name: 'Global Tech' },
  ];
  storeSet('entity_User', users);

  // Demo Companies
  const companies = [
    { id: 'c1', user_email: 'company@example.com', company_name: 'Acme Corp', industry: 'Technology', company_size: '100-500', headquarters: 'San Francisco, CA', subscription_plan: 'pro' },
    { id: 'c2', user_email: 'global@example.com', company_name: 'Global Tech', industry: 'Finance', company_size: '50-100', headquarters: 'London, UK', subscription_plan: 'free' },
    { id: 'c3', user_email: 'nextgen@example.com', company_name: 'NextGen Solutions', industry: 'Healthcare', company_size: '500+', headquarters: 'Austin, TX', subscription_plan: 'pro' },
  ];
  storeSet('entity_CompanyProfile', companies);

  // Demo Candidates
  const candidates = [
    { id: 'cand_1', user_email: 'candidate@example.com', full_name: 'Jane Doe', job_title: 'Senior Frontend Developer', location: 'Remote', years_of_experience: 5, open_to_work: true },
    { id: 'cand_2', user_email: 'john@example.com', full_name: 'John Smith', job_title: 'Backend Engineer', location: 'New York, NY', years_of_experience: 3, open_to_work: true },
    { id: 'cand_3', user_email: 'emily@example.com', full_name: 'Emily Davis', job_title: 'Product Manager', location: 'Seattle, WA', years_of_experience: 7, open_to_work: false },
  ];
  storeSet('entity_CandidateProfile', candidates);

  // Date generators for analytics:
  const getRecentDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  // Demo jobs
  const jobs = [
    {
      id: 'job1', title: 'Senior React Developer', company_name: 'Acme Corp',
      company_email: 'company@example.com', location: '', work_mode: 'remote', employment_type: 'full_time',
      department: 'Technology', experience_required: 5,
      salary_min: 80000, salary_max: 120000, description: 'Build amazing React apps.',
      skills: ['React', 'TypeScript', 'Node.js'], skills_required: ['React', 'TypeScript', 'Node.js'],
      status: 'open', approval_status: 'approved',
      created_date: getRecentDate(0.5), // 12 hours ago
    },
    {
      id: 'job2', title: 'Python Backend Engineer', company_name: 'Acme Corp',
      company_email: 'company@example.com', location: 'New York, NY', work_mode: 'hybrid', employment_type: 'full_time',
      department: 'Technology', experience_required: 3,
      salary_min: 90000, salary_max: 130000, description: 'Design scalable Python services.',
      skills: ['Python', 'AWS', 'Docker'], skills_required: ['Python', 'AWS', 'Docker'],
      status: 'open', approval_status: 'approved',
      created_date: getRecentDate(4), // 4 days ago
    },
    {
      id: 'job3', title: 'Mobile App Developer', company_name: 'Global Tech',
      company_email: 'global@example.com', location: 'London, UK', work_mode: 'remote', employment_type: 'contract',
      department: 'Engineering', experience_required: 2,
      salary_min: 70000, salary_max: 100000, description: 'Develop cross-platform apps using React Native.',
      skills: ['React Native', 'iOS', 'Android'], skills_required: ['React Native', 'iOS', 'Android'],
      status: 'open', approval_status: 'approved',
      created_date: getRecentDate(2), // 2 days ago
    },
    {
      id: 'job4', title: 'Junior Data Analyst', company_name: 'NextGen Solutions',
      company_email: 'nextgen@example.com', location: 'Austin, TX', work_mode: 'onsite', employment_type: 'full_time',
      department: 'Finance', experience_required: 0,
      salary_min: 50000, salary_max: 70000, description: 'Analyze healthcare datasets.',
      skills: ['SQL', 'Excel', 'Tableau'], skills_required: ['SQL', 'Excel', 'Tableau'],
      status: 'open', approval_status: 'approved',
      admin_note: 'Job description lacks minimum requirements.',
      created_date: getRecentDate(15), // 15 days ago
    },
  ];
  storeSet('entity_Job', jobs);

  // Demo Applications
  const applications = [
    { id: 'app1', job_id: 'job1', candidate_email: 'candidate@example.com', status: 'hired', created_date: getRecentDate(40) },
    { id: 'app2', job_id: 'job2', candidate_email: 'candidate@example.com', status: 'rejected', created_date: getRecentDate(20) },
    { id: 'app3', job_id: 'job2', candidate_email: 'john@example.com', status: 'hired', created_date: getRecentDate(25) },
    { id: 'app4', job_id: 'job1', candidate_email: 'emily@example.com', status: 'pending', created_date: getRecentDate(5) },
    { id: 'app5', job_id: 'job2', candidate_email: 'emily@example.com', status: 'interviewing', created_date: getRecentDate(10) },
  ];
  storeSet('entity_Application', applications);

  storeSet('seeded_v3', true);
}

seed();

// ─── Export ───────────────────────────────────

export const localClient = { auth, entities, functions, integrations };
