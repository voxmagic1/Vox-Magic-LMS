import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'node:crypto'
import { Resend } from 'resend'
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// ---------------------------------------------------------------------------
// MongoDB connection (reused across invocations)
// ---------------------------------------------------------------------------
let client
let dbInstance

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    dbInstance = client.db(process.env.DB_NAME)
  }
  return dbInstance
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

function json(data, status = 200) {
  return handleCORS(NextResponse.json(data, { status }))
}

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL

// Server owns the prices. Client only sends a plan id.
const PLANS = Object.freeze({
  registration:        { amount: 20000,  label: 'Vocal Transformation Program — Registration Fee', kind: 'registration' },
  tuition_online_full: { amount: 80000,  label: 'Online Tuition — Full Payment',        kind: 'tuition', track: 'online', part: 'full' },
  tuition_online_half: { amount: 40000,  label: 'Online Tuition — 50% Instalment',      kind: 'tuition', track: 'online', part: 'half' },
  tuition_hybrid_full: { amount: 130000, label: 'Hybrid Tuition — Full Payment',        kind: 'tuition', track: 'hybrid', part: 'full' },
  tuition_hybrid_half: { amount: 65000,  label: 'Hybrid Tuition — 50% Instalment',      kind: 'tuition', track: 'hybrid', part: 'half' },
})

const TRACK_TOTAL = { online: 80000, hybrid: 130000 }

// ---------------------------------------------------------------------------
// Website content model (CMS) — defaults used until an admin saves overrides
// ---------------------------------------------------------------------------
const DEFAULT_CONTENT = {
  brand: {
    tagline: 'Cast The Spell With The Rhythm',
    email: 'hello@voxmagic-dsml.com',
    phone: '+234 800 000 0000',
    location: 'Damichromes School of Music, Nigeria',
    socials: { instagram: '#', facebook: '#', youtube: '#', twitter: '#' },
  },
  media: {
    hero: 'https://images.pexels.com/photos/7715781/pexels-photo-7715781.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    about: 'https://images.pexels.com/photos/5070067/pexels-photo-5070067.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    assessment: 'https://images.pexels.com/photos/17722680/pexels-photo-17722680.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    events: 'https://images.unsplash.com/photo-1655395699875-860857fe75ed?crop=entropy&cs=srgb&fm=jpg&q=85',
    testimonials: 'https://images.pexels.com/photos/6193849/pexels-photo-6193849.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    founder: '/assets/founder.png',
  },
  hero: {
    badge: 'The Vocal Music Department of DSML',
    titleTop: 'Cast The Spell',
    titleHighlight: 'Rhythm',
    subtitle: 'Vox Magic transforms voices through world-class vocal coaching. Discover the singer within you with our signature three-month Vocal Transformation Program.',
    ctaPrimary: 'Enrol Now',
    ctaSecondary: 'Explore Programmes',
  },
  about: {
    eyebrow: 'About Vox Magic',
    title: 'Where Voices Become Magic',
    subtitle: 'Vox Magic is the premium Vocal Music Department of Damichromes School of Music Limited (DSML). We exist to unlock, refine and celebrate the human voice.',
    body1: 'Combining proven vocal science with soulful artistry, our coaches nurture singers of every level — from first-time vocalists to touring recording artists. Through structured curriculum, live masterclasses and personal mentorship, we help you sing with freedom, power and confidence.',
    missionTitle: 'Our Mission', mission: 'To develop confident, technically excellent and expressive singers.',
    visionTitle: 'Our Vision', vision: 'To be Africa\u2019s most respected home of transformative vocal training.',
  },
  values: [
    { title: 'Excellence', text: 'We pursue mastery in every note, breath and performance.' },
    { title: 'Integrity', text: 'Honest, nurturing coaching rooted in respect for every voice.' },
    { title: 'Artistry', text: 'We celebrate individuality and the magic of authentic expression.' },
    { title: 'Community', text: 'A supportive family of singers growing together.' },
  ],
  programmes: {
    registration: 20000, onlinePrice: 80000, hybridPrice: 130000,
    onlineFeatures: ['Live virtual classes', 'Class recordings & resources', 'Weekly assignments & feedback', 'Community access', 'Certificate on completion'],
    hybridFeatures: ['Everything in Online', 'In-person coaching sessions', 'Live performance labs', 'Priority masterclass seats', 'One-on-one mentorship'],
  },
  curriculum: [
    { m: 'Month 1', t: 'Foundations', items: ['Breath support & posture', 'Pitch & ear training', 'Vocal health & warm-ups'] },
    { m: 'Month 2', t: 'Technique & Range', items: ['Resonance & tone', 'Range extension', 'Belting & mixed voice'] },
    { m: 'Month 3', t: 'Performance', items: ['Song interpretation', 'Stagecraft & mic technique', 'Final performance & assessment'] },
  ],
  founder: {
    name: 'Damian Nworgu', role: 'Vocal Coach / Music Director',
    bio1: 'Damian Nworgu is a passionate vocal coach and music director with a heart for developing extraordinary singers. As the founder of Vox Magic, he has designed a transformative methodology that blends rigorous vocal technique with soulful, authentic expression.',
    bio2: 'His mission is simple yet profound: to help every student sing with freedom, power and undeniable confidence. Under his direction, Vox Magic has become a home where voices are refined and artistry flourishes.',
  },
  faculty: [
    { name: 'Damian Nworgu', role: 'Vocal Coach / Music Director', tag: 'Founder', img: '/assets/founder.png' },
    { name: 'Vox Magic Faculty', role: 'Vocal Technique Specialist', tag: 'Instructor', img: '' },
    { name: 'Vox Magic Faculty', role: 'Performance & Stagecraft Coach', tag: 'Instructor', img: '' },
    { name: 'Vox Magic Faculty', role: 'Music Theory & Ear Training', tag: 'Instructor', img: '' },
  ],
  events: [
    { title: 'Vocal Masterclass: Breath & Belting', date: 'Monthly', mode: 'Online + In-person', desc: 'A high-energy masterclass on breath support and safe belting technique.' },
    { title: 'Live Performance Lab', date: 'Bi-weekly', mode: 'In-person', desc: 'Stage time with live feedback to build unshakeable performance confidence.' },
    { title: 'Guest Artist Session', date: 'Quarterly', mode: 'Hybrid', desc: 'Learn directly from industry professionals and recording artists.' },
  ],
  testimonials: [
    { name: 'Chiamaka O.', role: 'Gospel Vocalist', text: 'Vox Magic transformed my voice and my confidence. Within weeks I was hitting notes I never imagined. The coaching is world-class.' },
    { name: 'Tunde A.', role: 'Recording Artist', text: 'The Vocal Transformation Program is the real deal. The method is structured, kind and incredibly effective. Worth every naira.' },
    { name: 'Grace E.', role: 'Worship Leader', text: 'I finally understand my instrument. Breath, tone, range — everything improved. The hybrid track fit perfectly around my schedule.' },
  ],
  blog: [
    { title: '5 Daily Warm-Ups Every Singer Needs', tag: 'Technique', read: '4 min', excerpt: 'Simple routines to prepare your voice safely every day.' },
    { title: 'How to Protect Your Voice on Tour', tag: 'Vocal Health', read: '6 min', excerpt: 'Keep your instrument healthy through demanding schedules.' },
    { title: 'Finding Your Authentic Vocal Tone', tag: 'Artistry', read: '5 min', excerpt: 'Discover and embrace the sound that is uniquely yours.' },
  ],
  faq: [
    { q: 'What is the Vocal Transformation Program?', a: 'A structured three-month intensive that develops your breath support, tone, range, pitch accuracy, stagecraft and performance confidence — whether you are a beginner or an experienced singer.' },
    { q: 'How much does it cost?', a: 'A one-time registration fee of \u20A620,000 confirms your place. Tuition is \u20A680,000 for the Online track or \u20A6130,000 for the Hybrid track. Tuition can be paid in full or in two 50/50 instalments.' },
    { q: 'What happens after I pay the registration fee?', a: 'Your registration is confirmed automatically, your admission letter is generated and your student portal is created instantly. You then choose to pay tuition in full or in two instalments.' },
    { q: 'Do I need prior experience?', a: 'No. Our vocal assessment helps us place you correctly, and the curriculum meets you where you are.' },
    { q: 'Will I get a certificate?', a: 'Yes. Students who complete the programme and assessments receive a Vox Magic \u2013 DSML certificate of completion.' },
  ],
}

async function getSiteContent(db) {
  const doc = await db.collection('content').findOne({ id: 'site' })
  return doc?.data || DEFAULT_CONTENT
}

// ---------------------------------------------------------------------------
// LMS content for the Vocal Transformation Program
// ---------------------------------------------------------------------------
const LMS_MODULES = [
  {
    id: 'm1', title: 'Month 1 — Foundations', weeks: 'Weeks 1–4',
    lessons: [
      { id: 'l1-1', title: 'Breath Support & Diaphragmatic Control', duration: '28 min', recordingUrl: 'https://www.youtube.com/watch?v=_C9pyJoBphE', resources: [{ name: 'Breathing Exercises (PDF)', url: '#' }] },
      { id: 'l1-2', title: 'Posture & Vocal Alignment', duration: '22 min', recordingUrl: '#', resources: [{ name: 'Posture Checklist', url: '#' }] },
      { id: 'l1-3', title: 'Pitch Accuracy & Ear Training I', duration: '30 min', recordingUrl: '#', resources: [{ name: 'Ear Training Audio Pack', url: '#' }] },
      { id: 'l1-4', title: 'Daily Warm-Ups & Vocal Health', duration: '18 min', recordingUrl: '#', resources: [{ name: 'Warm-Up Routine', url: '#' }] },
    ],
  },
  {
    id: 'm2', title: 'Month 2 — Technique & Range', weeks: 'Weeks 5–8',
    lessons: [
      { id: 'l2-1', title: 'Resonance & Tone Placement', duration: '26 min', recordingUrl: '#', resources: [{ name: 'Resonance Drills', url: '#' }] },
      { id: 'l2-2', title: 'Extending Your Range Safely', duration: '32 min', recordingUrl: '#', resources: [{ name: 'Range Ladder Exercises', url: '#' }] },
      { id: 'l2-3', title: 'Mixed Voice & Belting', duration: '29 min', recordingUrl: '#', resources: [{ name: 'Belting Safely Guide', url: '#' }] },
      { id: 'l2-4', title: 'Dynamics & Vocal Agility', duration: '24 min', recordingUrl: '#', resources: [{ name: 'Agility Runs', url: '#' }] },
    ],
  },
  {
    id: 'm3', title: 'Month 3 — Performance', weeks: 'Weeks 9–12',
    lessons: [
      { id: 'l3-1', title: 'Song Interpretation & Storytelling', duration: '27 min', recordingUrl: '#', resources: [{ name: 'Interpretation Worksheet', url: '#' }] },
      { id: 'l3-2', title: 'Microphone Technique', duration: '20 min', recordingUrl: '#', resources: [{ name: 'Mic Technique Notes', url: '#' }] },
      { id: 'l3-3', title: 'Stagecraft & Performance Confidence', duration: '31 min', recordingUrl: '#', resources: [{ name: 'Stage Presence Guide', url: '#' }] },
      { id: 'l3-4', title: 'Final Performance & Assessment', duration: '35 min', recordingUrl: '#', resources: [{ name: 'Final Assessment Rubric', url: '#' }] },
    ],
  },
]
const ALL_LESSON_IDS = LMS_MODULES.flatMap((m) => m.lessons.map((l) => l.id))

async function getLmsConfig(db) {
  const doc = await db.collection('lms_content').findOne({ id: 'lms' })
  const d = { modules: LMS_MODULES, schedule: LMS_SCHEDULE, assignments: LMS_ASSIGNMENTS, resources: LMS_RESOURCES }
  const x = doc?.data
  if (!x) return d
  return {
    modules: x.modules?.length ? x.modules : d.modules,
    schedule: x.schedule?.length ? x.schedule : d.schedule,
    assignments: x.assignments?.length ? x.assignments : d.assignments,
    resources: x.resources?.length ? x.resources : d.resources,
  }
}
const lessonIdsOf = (cfg) => cfg.modules.flatMap((m) => (m.lessons || []).map((l) => l.id))

const LMS_SCHEDULE = [
  { id: 's1', title: 'Live Class: Breath & Belting', date: 'Every Monday', time: '6:00 PM WAT', mode: 'Online', joinUrl: 'https://meet.google.com/lookup/voxmagic-live' },
  { id: 's2', title: 'Performance Lab (In-person + Online)', date: 'Every Thursday', time: '5:00 PM WAT', mode: 'Hybrid', joinUrl: 'https://meet.google.com/lookup/voxmagic-lab' },
  { id: 's3', title: 'Guest Artist Masterclass', date: 'Last Saturday monthly', time: '4:00 PM WAT', mode: 'Hybrid', joinUrl: 'https://meet.google.com/lookup/voxmagic-master' },
]

const LMS_ASSIGNMENTS = [
  { id: 'a1', title: 'Record your daily warm-up routine', module: 'Month 1', due: 'End of Week 4', instructions: 'Submit a link (Google Drive/YouTube unlisted) to a 3-minute recording of your daily warm-up.' },
  { id: 'a2', title: 'Range extension check-in', module: 'Month 2', due: 'End of Week 8', instructions: 'Record yourself performing the range ladder and share the link.' },
  { id: 'a3', title: 'Final performance piece', module: 'Month 3', due: 'End of Week 12', instructions: 'Submit a link to your full song performance for final assessment.' },
]

const LMS_ANNOUNCEMENTS = [
  { id: 'an1', title: 'Welcome to Vox Magic!', date: 'This week', body: 'We are thrilled to have you. Complete your Month 1 lessons and join Monday\u2019s live class to get started.' },
  { id: 'an2', title: 'New masterclass added', date: 'This week', body: 'A guest artist masterclass on stage presence has been scheduled for the last Saturday of the month.' },
]

const LMS_RESOURCES = [
  { id: 'r1', name: 'Vox Magic Vocal Warm-Up Pack (Audio)', type: 'Audio', url: '#' },
  { id: 'r2', name: 'Breathing & Posture Handbook (PDF)', type: 'PDF', url: '#' },
  { id: 'r3', name: 'Ear Training Companion App Guide', type: 'Guide', url: '#' },
  { id: 'r4', name: 'Song Interpretation Worksheet', type: 'Worksheet', url: '#' },
]

async function buildLms(db, student) {
  const cfg = await getLmsConfig(db)
  const allIds = lessonIdsOf(cfg)
  const completed = student.lmsProgress || []
  const total = allIds.length
  const done = completed.filter((id) => allIds.includes(id)).length
  const percent = total ? Math.round((done / total) * 100) : 0

  const modules = cfg.modules.map((m) => ({
    ...m,
    lessons: (m.lessons || []).map((l) => ({ ...l, video: l.videoUrl || l.recordingUrl || SAMPLE_VIDEO, completed: completed.includes(l.id) })),
  }))

  const subs = await db.collection('submissions').find({ studentId: student.id }).toArray()
  const assignments = cfg.assignments.map((a) => {
    const s = subs.find((x) => x.assignmentId === a.id)
    return { ...a, submission: s ? { content: s.content, submittedAt: s.createdAt, grade: s.grade || null, feedback: s.feedback || null } : null }
  })

  const att = await db.collection('attendance').find({ studentId: student.id }).toArray()
  const attendedIds = att.map((x) => x.sessionId)
  const schedule = cfg.schedule.map((s) => ({ ...s, attended: attendedIds.includes(s.id) }))

  const certificateEligible = percent === 100 && (student.tuitionStatus === 'paid')

  const dbAnns = await db.collection('announcements').find({}).sort({ createdAt: -1 }).toArray()
  const announcements = dbAnns.length
    ? dbAnns.map((a) => ({ id: a.id, title: a.title, date: a.date || new Date(a.createdAt).toLocaleDateString('en-GB'), body: a.body }))
    : LMS_ANNOUNCEMENTS

  return {
    progress: { done, total, percent },
    modules,
    schedule,
    assignments,
    announcements,
    resources: cfg.resources,
    attendanceCount: attendedIds.length,
    certificateEligible,
  }
}

const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'

function sha256(v) {
  return crypto.createHash('sha256').update(v).digest('hex')
}

function genPassword() {
  // human-friendly temporary password
  return 'VM-' + crypto.randomBytes(3).toString('hex').toUpperCase()
}

function genRef(prefix) {
  const y = new Date().getFullYear()
  return `${prefix}-${y}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

async function getFlwConfig(db) {
  let doc = null
  try { doc = await db.collection('settings').findOne({ id: 'payments' }) } catch {}
  const envSecret = process.env.FLW_SECRET_KEY
  const secret = (doc && doc.secretKey) ? doc.secretKey : envSecret
  const publicKey = (doc && doc.publicKey) ? doc.publicKey : process.env.FLW_PUBLIC_KEY
  const mode = (doc && doc.mode) ? doc.mode : ((secret || '').includes('LIVE') ? 'live' : 'test')
  const source = (doc && doc.secretKey) ? 'admin' : 'env'
  return { secret, publicKey, mode, source }
}

async function flutterwave(secret, path, options = {}) {
  if (!secret || secret.includes('REPLACE_ME')) {
    const err = new Error('PAYMENT_NOT_CONFIGURED')
    err.code = 'PAYMENT_NOT_CONFIGURED'
    throw err
  }
  const response = await fetch(`https://api.flutterwave.com/v3${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body?.message || 'Flutterwave request failed')
  return body
}

async function getStudentFromAuth(request, db) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const session = await db.collection('sessions').findOne({ token })
  if (!session) return null
  const student = await db.collection('students').findOne({ id: session.studentId })
  return student || null
}

// ---------------------------------------------------------------------------
// Transactional email (Resend)
// ---------------------------------------------------------------------------
const esc = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

async function getEmailConfig(db) {
  let doc = null
  try { doc = await db.collection('settings').findOne({ id: 'email' }) } catch {}
  const apiKey = (doc && doc.resendApiKey) ? doc.resendApiKey : process.env.RESEND_API_KEY
  const from = (doc && doc.mailFrom) ? doc.mailFrom : (process.env.MAIL_FROM || 'Vox Magic <onboarding@resend.dev>')
  const admissions = (doc && doc.admissionsEmail) ? doc.admissionsEmail : process.env.ADMISSIONS_EMAIL
  const source = (doc && doc.resendApiKey) ? 'admin' : 'env'
  return { apiKey, from, admissions, source }
}

async function getBlobToken(db) {
  let doc = null
  try { doc = await db.collection('settings').findOne({ id: 'storage' }) } catch {}
  const token = (doc && doc.blobToken) ? doc.blobToken : process.env.BLOB_READ_WRITE_TOKEN
  const source = (doc && doc.blobToken) ? 'admin' : 'env'
  return { token, source }
}

async function audit(db, staff, action, meta = {}) {
  try {
    await db.collection('audit_logs').insertOne({
      id: uuidv4(), action, by: staff?.name || 'system', byId: staff?.id || null,
      meta, createdAt: new Date(),
    })
  } catch {}
}

async function sendMail({ to, subject, html, text, replyTo }, cfg) {
  const key = cfg?.apiKey || process.env.RESEND_API_KEY
  const from = cfg?.from || process.env.MAIL_FROM || 'Vox Magic <onboarding@resend.dev>'
  if (!key || key.includes('REPLACE_ME')) return { ok: false, error: 'EMAIL_NOT_CONFIGURED' }
  try {
    const resend = new Resend(key)
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject, html, text,
      ...(replyTo ? { replyTo } : {}),
    })
    if (error) return { ok: false, error: error.message || 'send failed' }
    return { ok: true, id: data?.id || null }
  } catch (e) {
    return { ok: false, error: e.message || 'send failed' }
  }
}

function admissionEmailHtml({ name, email, tempPassword, admissionNo, cohortStart }) {
  const loginUrl = `${APP_URL}/?view=login`
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0A1F44">
    <div style="background:linear-gradient(120deg,#3B0F73,#1E40E0);padding:24px;border-radius:16px 16px 0 0;color:#fff">
      <h1 style="margin:0;font-size:22px">Welcome to Vox Magic 🎵</h1>
      <p style="margin:6px 0 0;opacity:.85">Damichromes School of Music Limited (DSML)</p>
    </div>
    <div style="border:1px solid #eee;border-top:0;padding:24px;border-radius:0 0 16px 16px">
      <p>Dear ${esc(name)},</p>
      <p>Congratulations! Your registration for the <b>Vocal Transformation Program</b> is confirmed. Your admission letter has been generated and your student portal is ready.</p>
      <p><b>Admission No:</b> ${esc(admissionNo)}<br/><b>Cohort start:</b> ${esc(cohortStart)}</p>
      <div style="background:#FBF9F4;border:1px solid #eee;border-radius:12px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px"><b>Your portal login</b></p>
        <p style="margin:0">Email: <b>${esc(email)}</b></p>
        <p style="margin:0">Temporary password: <b style="color:#E11D2A">${esc(tempPassword)}</b></p>
      </div>
      <p>Next step: log in to your portal to view your admission letter and pay your tuition — you can pay in full or in two 50/50 instalments, and the right payment link will be provided in your portal.</p>
      <p><a href="${esc(loginUrl)}" style="display:inline-block;background:#1E40E0;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">Open Student Portal</a></p>
      <p style="color:#666;font-size:13px;margin-top:24px">Cast The Spell With The Rhythm · Vox Magic (DSML)</p>
    </div>
  </div>`
}

function passwordResetEmailHtml({ name, resetUrl }) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#0A1F44">
    <div style="background:linear-gradient(120deg,#3B0F73,#1E40E0);padding:24px;border-radius:16px 16px 0 0;color:#fff">
      <h1 style="margin:0;font-size:22px">Reset your password 🔑</h1>
      <p style="margin:6px 0 0;opacity:.85">Vox Magic · Damichromes School of Music (DSML)</p>
    </div>
    <div style="border:1px solid #eee;border-top:0;padding:24px;border-radius:0 0 16px 16px">
      <p>Dear ${esc(name || 'Student')},</p>
      <p>We received a request to reset the password for your Vox Magic student portal. Click the button below to choose a new password. This link is valid for <b>60 minutes</b>.</p>
      <p><a href="${esc(resetUrl)}" style="display:inline-block;background:#1E40E0;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">Reset my password</a></p>
      <p style="color:#666;font-size:13px">If the button doesn't work, copy and paste this link into your browser:<br/><span style="color:#1E40E0;word-break:break-all">${esc(resetUrl)}</span></p>
      <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email — your password will not change.</p>
      <p style="color:#666;font-size:13px;margin-top:24px">Cast The Spell With The Rhythm · Vox Magic (DSML)</p>
    </div>
  </div>`
}

async function getStaffFromAuth(request, db) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const session = await db.collection('sessions').findOne({ token })
  // Any valid staff session (student sessions carry studentId, not staffId)
  if (!session || !session.staffId) return null
  const staff = await db.collection('staff').findOne({ id: session.staffId })
  return staff || null
}

// A staff member with the 'admin' role (legacy accounts without a role are treated as admins)
const isAdmin = (staff) => !!staff && (staff.role === 'admin' || !staff.role)

function publicStaff(s) {
  if (!s) return null
  const { _id, passwordHash, salt, ...rest } = s
  return rest
}

function clean(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return rest
}

function publicStudent(s) {
  if (!s) return null
  const { _id, passwordHash, salt, ...rest } = s
  return rest
}

// ---------------------------------------------------------------------------
// Business logic: build admission letter + create student on registration paid
// ---------------------------------------------------------------------------
async function buildAdmissionLetter(db, application) {
  const admissionNo = genRef('DSML/VM')
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now); end.setMonth(end.getMonth() + 3)
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return {
    admissionNo,
    issuedAt: now.toISOString(),
    studentName: application.name,
    program: 'Vocal Transformation Program',
    duration: '3 Months',
    cohortStart: fmt(start),
    cohortEnd: fmt(end),
    body: `We are delighted to offer you provisional admission into the Vocal Transformation Program at Vox Magic — the Vocal Music Department of Damichromes School of Music Limited (DSML). Your registration has been confirmed and your student portal has been created. To complete your enrolment, kindly proceed with your tuition payment (full payment or two 50/50 instalments) via your student portal.`,
    signatory: 'Damian Nworgu',
    signatoryTitle: 'Vocal Coach / Music Director, Vox Magic',
  }
}

async function fulfilRegistration(db, payment) {
  // idempotent: only run once per application
  const application = await db.collection('applications').findOne({ id: payment.applicationId })
  if (!application) return null

  let student = await db.collection('students').findOne({ email: application.email.toLowerCase() })
  let tempPassword = null

  const admissionLetter = application.admissionLetter || await buildAdmissionLetter(db, application)

  if (!student) {
    tempPassword = genPassword()
    const salt = crypto.randomBytes(8).toString('hex')
    student = {
      id: uuidv4(),
      role: 'student',
      name: application.name,
      email: application.email.toLowerCase(),
      phone: application.phone || '',
      salt,
      passwordHash: sha256(tempPassword + salt),
      mustResetPassword: true,
      applicationId: application.id,
      admissionNo: admissionLetter.admissionNo,
      admissionLetter,
      program: 'Vocal Transformation Program',
      cohort: admissionLetter.cohortStart,
      tuitionTrack: null,
      tuitionStatus: 'unpaid',
      tuitionPaid: 0,
      status: 'registered',
      createdAt: new Date(),
      tempPasswordPlain: tempPassword, // MOCK email: shown once on-screen/portal
    }
    await db.collection('students').insertOne(student)
    // Send admission email (Resend). Graceful fallback: on-screen credentials remain the backup.
    const emailCfg = await getEmailConfig(db)
    const mail = await sendMail({
      to: student.email,
      subject: 'Your Vox Magic Admission Letter & Portal Access',
      html: admissionEmailHtml({ name: student.name, email: student.email, tempPassword, admissionNo: admissionLetter.admissionNo, cohortStart: admissionLetter.cohortStart }),
      text: `Dear ${student.name}, your registration is confirmed. Admission No: ${admissionLetter.admissionNo}. Portal login: ${student.email} / temporary password: ${tempPassword}. Log in at ${APP_URL}/?view=login to view your admission letter and pay tuition.`,
    }, emailCfg)
    await db.collection('notifications').insertOne({
      id: uuidv4(), type: 'admission_letter', to: student.email,
      subject: 'Your Vox Magic Admission Letter & Portal Access',
      createdAt: new Date(), emailStatus: mail.ok ? 'sent' : 'failed', emailError: mail.ok ? null : mail.error,
      emailId: mail.id || null, meta: { admissionNo: admissionLetter.admissionNo },
    })
  }

  await db.collection('applications').updateOne(
    { id: application.id },
    { $set: { status: 'registered', admissionLetter, studentId: student.id, updatedAt: new Date() } }
  )

  return { student, tempPassword, admissionLetter }
}

async function recomputeTuition(db, student) {
  const payments = await db.collection('payments')
    .find({ email: student.email, kind: 'tuition', status: 'paid' }).toArray()
  const track = student.tuitionTrack || (payments[0] ? payments[0].track : null)
  const total = track ? TRACK_TOTAL[track] : 0
  const paid = payments.reduce((s, p) => s + (p.amount || 0), 0)
  let status = 'unpaid'
  if (paid > 0 && paid < total) status = 'partial'
  if (total > 0 && paid >= total) status = 'paid'
  await db.collection('students').updateOne(
    { id: student.id },
    { $set: { tuitionTrack: track, tuitionPaid: paid, tuitionStatus: status, updatedAt: new Date() } }
  )
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Health
    if (route === '/' || route === '/health') {
      return json({ ok: true, service: 'Vox Magic API' })
    }

    // ---------------- Applications ----------------
    if (route === '/applications' && method === 'POST') {
      const b = await request.json()
      if (!b.name || !b.email) return json({ error: 'Name and email are required' }, 400)
      const app = {
        id: uuidv4(),
        name: b.name,
        email: String(b.email).toLowerCase(),
        phone: b.phone || '',
        gender: b.gender || '',
        location: b.location || '',
        track: b.track || 'online',
        experience: b.experience || '',
        goals: b.goals || '',
        hearAbout: b.hearAbout || '',
        program: 'Vocal Transformation Program',
        status: 'submitted',
        createdAt: new Date(),
      }
      await db.collection('applications').insertOne(app)
      return json({ application: clean(app) })
    }

    if (route.startsWith('/applications/') && method === 'GET') {
      const id = path[1]
      const app = await db.collection('applications').findOne({ id })
      if (!app) return json({ error: 'Application not found' }, 404)
      return json({ application: clean(app) })
    }

    // ---------------- Payments: initialize ----------------
    if (route === '/payments/initialize' && method === 'POST') {
      const b = await request.json()
      const { plan, applicationId } = b
      const selected = PLANS[plan]
      if (!selected) return json({ error: 'Invalid plan' }, 400)

      let email = b.email ? String(b.email).toLowerCase() : null
      let name = b.name || ''
      let phone = b.phone || ''

      if (selected.kind === 'registration') {
        if (!applicationId) return json({ error: 'applicationId is required for registration' }, 400)
        const app = await db.collection('applications').findOne({ id: applicationId })
        if (!app) return json({ error: 'Application not found' }, 404)
        email = app.email; name = app.name; phone = app.phone
      } else {
        // tuition requires a logged-in student
        const student = await getStudentFromAuth(request, db)
        if (!student) return json({ error: 'Login required for tuition payment' }, 401)
        email = student.email; name = student.name; phone = student.phone
      }

      const tx_ref = genRef(plan === 'registration' ? 'REG' : 'TUI')
      const record = {
        id: uuidv4(),
        tx_ref,
        plan,
        kind: selected.kind,
        track: selected.track || null,
        part: selected.part || null,
        applicationId: applicationId || null,
        email, name, phone,
        amount: selected.amount,
        currency: 'NGN',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await db.collection('payments').insertOne(record)

      try {
        const flw = await getFlwConfig(db)
        const result = await flutterwave(flw.secret, '/payments', {
          method: 'POST',
          body: JSON.stringify({
            tx_ref,
            amount: selected.amount,
            currency: 'NGN',
            redirect_url: `${APP_URL}/payment/callback`,
            customer: { email, name, phonenumber: phone },
            meta: { plan, tx_ref },
            customizations: {
              title: 'Vox Magic — DSML',
              description: selected.label,
              logo: `${APP_URL}/assets/logo.png`,
            },
          }),
        })
        await db.collection('payments').updateOne(
          { tx_ref }, { $set: { checkoutLink: result.data.link, updatedAt: new Date() } }
        )
        return json({ tx_ref, link: result.data.link, amount: selected.amount, label: selected.label })
      } catch (error) {
        if (error.code === 'PAYMENT_NOT_CONFIGURED') {
          return json({ error: 'PAYMENT_NOT_CONFIGURED', message: 'Payment gateway is not configured yet. Please add your Flutterwave Test Secret Key.' }, 503)
        }
        await db.collection('payments').updateOne(
          { tx_ref }, { $set: { status: 'initialization_failed', updatedAt: new Date() } }
        )
        return json({ error: error.message }, 502)
      }
    }

    // ---------------- Payments: verify ----------------
    if (route === '/payments/verify' && method === 'POST') {
      const { transaction_id, tx_ref } = await request.json()
      if (!transaction_id || !tx_ref) return json({ error: 'transaction_id and tx_ref are required' }, 400)

      const payment = await db.collection('payments').findOne({ tx_ref })
      if (!payment) return json({ error: 'Unknown transaction reference' }, 404)

      // Already fulfilled — return existing result (idempotent)
      let result
      try {
        const flw = await getFlwConfig(db)
        result = await flutterwave(flw.secret, `/transactions/${encodeURIComponent(transaction_id)}/verify`)
      } catch (error) {
        if (error.code === 'PAYMENT_NOT_CONFIGURED') {
          return json({ error: 'PAYMENT_NOT_CONFIGURED' }, 503)
        }
        return json({ error: error.message }, 502)
      }

      const t = result.data
      const valid = t.status === 'successful' && t.currency === 'NGN' &&
        t.tx_ref === tx_ref && Number(t.amount) >= Number(payment.amount)

      await db.collection('payments').updateOne(
        { tx_ref },
        { $set: {
          status: valid ? 'paid' : 'failed',
          flutterwave_id: Number(t.id),
          flutterwaveStatus: t.status,
          chargedAmount: t.charged_amount,
          verifiedAt: new Date(), updatedAt: new Date(),
        }}
      )

      if (!valid) return json({ ok: false, status: 'failed', tx_ref })

      const fresh = await db.collection('payments').findOne({ tx_ref })
      let out = { ok: true, status: 'paid', tx_ref, kind: payment.kind, amount: payment.amount }

      if (payment.kind === 'registration') {
        const r = await fulfilRegistration(db, fresh)
        if (r) {
          out.student = publicStudent(r.student)
          out.tempPassword = r.tempPassword || null
          out.admissionLetter = r.admissionLetter
        }
      } else if (payment.kind === 'tuition') {
        const student = await db.collection('students').findOne({ email: payment.email })
        if (student) {
          if (payment.track) {
            await db.collection('students').updateOne({ id: student.id }, { $set: { tuitionTrack: payment.track } })
          }
          const s2 = await db.collection('students').findOne({ id: student.id })
          await recomputeTuition(db, s2)
          const s3 = await db.collection('students').findOne({ id: student.id })
          out.student = publicStudent(s3)
        }
      }
      return json(out)
    }

    // ---------------- Payments: webhook ----------------
    if (route === '/payments/webhook' && method === 'POST') {
      const raw = await request.text()
      const signature = request.headers.get('flutterwave-signature') || request.headers.get('verif-hash')
      const secretHash = process.env.FLW_SECRET_HASH || ''
      let ok = false
      if (signature) {
        try {
          const hmac = crypto.createHmac('sha256', secretHash).update(raw).digest('base64')
          const a = Buffer.from(hmac); const b = Buffer.from(signature)
          const hmacOk = a.length === b.length && crypto.timingSafeEqual(a, b)
          ok = hmacOk || signature === secretHash
        } catch { ok = signature === secretHash }
      }
      if (!ok) return json({ error: 'Invalid webhook signature' }, 401)

      const payload = JSON.parse(raw)
      const event = payload.data || {}
      const id = Number(event.id)
      const tx_ref = event.tx_ref || event.reference || event.meta?.tx_ref
      const payment = tx_ref
        ? await db.collection('payments').findOne({ tx_ref })
        : await db.collection('payments').findOne({ flutterwave_id: id })
      if (payment && id) {
        try {
          const flw = await getFlwConfig(db)
          const result = await flutterwave(flw.secret, `/transactions/${id}/verify`)
          const t = result.data
          const valid = t.status === 'successful' && t.currency === payment.currency &&
            t.tx_ref === payment.tx_ref && Number(t.amount) >= Number(payment.amount)
          if (valid && payment.status !== 'paid') {
            await db.collection('payments').updateOne(
              { id: payment.id }, { $set: { status: 'paid', flutterwave_id: Number(t.id), verifiedAt: new Date(), updatedAt: new Date() } }
            )
            const fresh = await db.collection('payments').findOne({ id: payment.id })
            if (payment.kind === 'registration') await fulfilRegistration(db, fresh)
            else if (payment.kind === 'tuition') {
              const student = await db.collection('students').findOne({ email: payment.email })
              if (student) { if (payment.track) await db.collection('students').updateOne({ id: student.id }, { $set: { tuitionTrack: payment.track } }); const s2 = await db.collection('students').findOne({ id: student.id }); await recomputeTuition(db, s2) }
            }
          }
        } catch (e) { /* ignore */ }
      }
      return json({ received: true })
    }

    // ---------------- Auth ----------------
    if (route === '/auth/login' && method === 'POST') {
      const { email, password } = await request.json()
      if (!email || !password) return json({ error: 'Email and password are required' }, 400)
      const student = await db.collection('students').findOne({ email: String(email).toLowerCase() })
      if (!student) return json({ error: 'Invalid credentials' }, 401)
      const hash = sha256(password + student.salt)
      if (hash !== student.passwordHash) return json({ error: 'Invalid credentials' }, 401)
      const token = uuidv4()
      await db.collection('sessions').insertOne({ token, studentId: student.id, createdAt: new Date() })
      return json({ token, student: publicStudent(student) })
    }

    if (route === '/auth/logout' && method === 'POST') {
      const auth = request.headers.get('authorization') || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
      if (token) await db.collection('sessions').deleteOne({ token })
      return json({ ok: true })
    }

    // Student: change own password (requires current password)
    if (route === '/students/change-password' && method === 'POST') {
      const student = await getStudentFromAuth(request, db)
      if (!student) return json({ error: 'Unauthorized' }, 401)
      const { currentPassword, newPassword } = await request.json()
      if (!currentPassword || !newPassword) return json({ error: 'Current and new password are required' }, 400)
      if (sha256(currentPassword + student.salt) !== student.passwordHash) return json({ error: 'Current password is incorrect' }, 401)
      if (String(newPassword).length < 8) return json({ error: 'New password must be at least 8 characters' }, 400)
      const salt = crypto.randomBytes(8).toString('hex')
      await db.collection('students').updateOne({ id: student.id }, { $set: { salt, passwordHash: sha256(newPassword + salt), mustResetPassword: false, tempPasswordPlain: null, updatedAt: new Date() } })
      return json({ ok: true, message: 'Password changed successfully' })
    }

    // Student: forced first-login password change (only while flagged)
    if (route === '/students/first-password' && method === 'POST') {
      const student = await getStudentFromAuth(request, db)
      if (!student) return json({ error: 'Unauthorized' }, 401)
      const { newPassword } = await request.json()
      if (!newPassword || String(newPassword).length < 8) return json({ error: 'New password must be at least 8 characters' }, 400)
      if (!student.mustResetPassword) return json({ error: 'Use the change-password screen instead' }, 400)
      const salt = crypto.randomBytes(8).toString('hex')
      await db.collection('students').updateOne({ id: student.id }, { $set: { salt, passwordHash: sha256(newPassword + salt), mustResetPassword: false, tempPasswordPlain: null, updatedAt: new Date() } })
      const fresh = await db.collection('students').findOne({ id: student.id })
      return json({ ok: true, message: 'Password set — welcome!', student: publicStudent(fresh) })
    }

    // Student: forgot password — send reset link (generic response to avoid email enumeration)
    if (route === '/auth/forgot-password' && method === 'POST') {
      const { email } = await request.json()
      if (!email) return json({ error: 'Email is required' }, 400)
      const generic = { ok: true, message: 'If an account exists for that email, a reset link has been sent.' }
      const student = await db.collection('students').findOne({ email: String(email).toLowerCase() })
      if (!student) return json(generic)
      const token = crypto.randomBytes(24).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      await db.collection('password_resets').insertOne({ id: uuidv4(), token, studentId: student.id, email: student.email, used: false, expiresAt, createdAt: new Date() })
      const resetUrl = `${APP_URL}/?view=reset&token=${token}`
      const emailCfg = await getEmailConfig(db)
      const mail = await sendMail({
        to: student.email,
        subject: 'Reset your Vox Magic portal password',
        html: passwordResetEmailHtml({ name: student.name, resetUrl }),
        text: `Reset your Vox Magic password using this link (valid 60 minutes): ${resetUrl}`,
      }, emailCfg)
      await db.collection('notifications').insertOne({ id: uuidv4(), type: 'password_reset', to: student.email, subject: 'Reset your Vox Magic portal password', createdAt: new Date(), emailStatus: mail.ok ? 'sent' : 'failed', emailError: mail.ok ? null : mail.error })
      return json(generic)
    }

    // Student: reset password via token
    if (route === '/auth/reset-password' && method === 'POST') {
      const { token, newPassword } = await request.json()
      if (!token || !newPassword) return json({ error: 'Token and new password are required' }, 400)
      if (String(newPassword).length < 8) return json({ error: 'New password must be at least 8 characters' }, 400)
      const rec = await db.collection('password_resets').findOne({ token })
      if (!rec || rec.used || new Date(rec.expiresAt) < new Date()) return json({ error: 'This reset link is invalid or has expired. Please request a new one.' }, 400)
      const student = await db.collection('students').findOne({ id: rec.studentId })
      if (!student) return json({ error: 'Account not found' }, 404)
      const salt = crypto.randomBytes(8).toString('hex')
      await db.collection('students').updateOne({ id: student.id }, { $set: { salt, passwordHash: sha256(newPassword + salt), mustResetPassword: false, tempPasswordPlain: null, updatedAt: new Date() } })
      await db.collection('password_resets').updateOne({ token }, { $set: { used: true, usedAt: new Date() } })
      await db.collection('sessions').deleteMany({ studentId: student.id })
      return json({ ok: true, message: 'Password reset successfully. You can now log in with your new password.' })
    }

    // ---------------- Student portal ----------------
    if (route === '/students/me' && method === 'GET') {
      const student = await getStudentFromAuth(request, db)
      if (!student) return json({ error: 'Unauthorized' }, 401)
      const payments = await db.collection('payments')
        .find({ email: student.email, status: 'paid' }).sort({ createdAt: -1 }).toArray()
      const total = student.tuitionTrack ? TRACK_TOTAL[student.tuitionTrack] : null
      return json({
        student: publicStudent(student),
        payments: payments.map(clean),
        tuition: {
          track: student.tuitionTrack,
          total,
          paid: student.tuitionPaid || 0,
          balance: total ? Math.max(0, total - (student.tuitionPaid || 0)) : null,
          status: student.tuitionStatus || 'unpaid',
        },
      })
    }

    // ---------------- Contact ----------------
    if (route === '/contact' && method === 'POST') {
      const b = await request.json()
      if (!b.email || !b.message) return json({ error: 'Email and message are required' }, 400)
      const msg = { id: uuidv4(), name: b.name || '', email: String(b.email).toLowerCase(), subject: b.subject || 'General enquiry', message: b.message, createdAt: new Date() }
      await db.collection('contacts').insertOne(msg)
      const emailCfg = await getEmailConfig(db)
      const mail = await sendMail({
        to: emailCfg.admissions || emailCfg.from,
        replyTo: msg.email,
        subject: `Vox Magic enquiry: ${esc(msg.subject)}`,
        html: `<div style="font-family:Inter,Arial,sans-serif"><p><b>From:</b> ${esc(msg.name || 'Website visitor')} (${esc(msg.email)})</p><p><b>Subject:</b> ${esc(msg.subject)}</p><p>${esc(msg.message).replace(/\n/g, '<br>')}</p></div>`,
        text: `From: ${msg.name} (${msg.email})\nSubject: ${msg.subject}\n\n${msg.message}`,
      }, emailCfg)
      await db.collection('contacts').updateOne({ id: msg.id }, { $set: { emailStatus: mail.ok ? 'sent' : 'failed', emailError: mail.ok ? null : mail.error } })
      return json({ ok: true, message: 'Thank you — we will be in touch shortly.' })
    }

    // ---------------- Vocal assessment booking ----------------
    if (route === '/assessment' && method === 'POST') {
      const b = await request.json()
      if (!b.email || !b.name) return json({ error: 'Name and email are required' }, 400)
      const rec = { id: uuidv4(), name: b.name, email: String(b.email).toLowerCase(), phone: b.phone || '', voiceType: b.voiceType || '', notes: b.notes || '', createdAt: new Date() }
      await db.collection('assessments').insertOne(rec)
      return json({ ok: true, message: 'Your vocal assessment request has been received.' })
    }

    // ---------------- LMS ----------------
    if (route === '/lms' && method === 'GET') {
      const student = await getStudentFromAuth(request, db)
      if (!student) return json({ error: 'Unauthorized' }, 401)
      const lms = await buildLms(db, student)
      return json(lms)
    }

    if (route === '/lms/lesson/complete' && method === 'POST') {
      const student = await getStudentFromAuth(request, db)
      if (!student) return json({ error: 'Unauthorized' }, 401)
      const { lessonId, done } = await request.json()
      const cfg0 = await getLmsConfig(db)
      if (!lessonId || !lessonIdsOf(cfg0).includes(lessonId)) return json({ error: 'Invalid lessonId' }, 400)
      const op = done === false ? { $pull: { lmsProgress: lessonId } } : { $addToSet: { lmsProgress: lessonId } }
      await db.collection('students').updateOne({ id: student.id }, op)
      const fresh = await db.collection('students').findOne({ id: student.id })
      const lms = await buildLms(db, fresh)
      return json({ ok: true, progress: lms.progress, certificateEligible: lms.certificateEligible })
    }

    if (route === '/lms/assignment/submit' && method === 'POST') {
      const student = await getStudentFromAuth(request, db)
      if (!student) return json({ error: 'Unauthorized' }, 401)
      const { assignmentId, content } = await request.json()
      const cfgA = await getLmsConfig(db)
      if (!assignmentId || !cfgA.assignments.find((a) => a.id === assignmentId)) return json({ error: 'Invalid assignmentId' }, 400)
      if (!content) return json({ error: 'Submission content is required' }, 400)
      await db.collection('submissions').updateOne(
        { studentId: student.id, assignmentId },
        { $set: { studentId: student.id, assignmentId, content, createdAt: new Date() } },
        { upsert: true }
      )
      return json({ ok: true, message: 'Assignment submitted successfully.' })
    }

    if (route === '/lms/session/attend' && method === 'POST') {
      const student = await getStudentFromAuth(request, db)
      if (!student) return json({ error: 'Unauthorized' }, 401)
      const { sessionId } = await request.json()
      const cfgS = await getLmsConfig(db)
      if (!sessionId || !cfgS.schedule.find((s) => s.id === sessionId)) return json({ error: 'Invalid sessionId' }, 400)
      await db.collection('attendance').updateOne(
        { studentId: student.id, sessionId },
        { $set: { studentId: student.id, sessionId, markedAt: new Date() } },
        { upsert: true }
      )
      return json({ ok: true })
    }

    // ---------------- Public site content (CMS) ----------------
    if (route === '/content' && method === 'GET') {
      const content = await getSiteContent(db)
      return json({ content })
    }

    // ---------------- Authenticated file proxy (serves private Vercel Blob files) ----------------
    if (route === '/file' && method === 'GET') {
      const u = new URL(request.url)
      const fileUrl = u.searchParams.get('u')
      const t = u.searchParams.get('t') || (request.headers.get('authorization') || '').replace('Bearer ', '')
      if (!fileUrl) return json({ error: 'Missing file url' }, 400)
      // must be logged in (student or staff)
      const session = t ? await db.collection('sessions').findOne({ token: t }) : null
      if (!session) return json({ error: 'Unauthorized' }, 401)
      let host
      try { host = new URL(fileUrl).host } catch { return json({ error: 'Bad url' }, 400) }
      if (!host.endsWith('blob.vercel-storage.com')) return json({ error: 'Forbidden host' }, 403)
      const upstream = await fetch(fileUrl, { headers: { authorization: `Bearer ${(await getBlobToken(db)).token}` } })
      if (!upstream.ok) return json({ error: 'File not found' }, upstream.status)
      const headers = new Headers()
      headers.set('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream')
      const len = upstream.headers.get('content-length'); if (len) headers.set('Content-Length', len)
      headers.set('Cache-Control', 'private, max-age=3600')
      headers.set('Access-Control-Allow-Origin', '*')
      return new NextResponse(upstream.body, { status: 200, headers })
    }

    // ---------------- Admin / Staff ----------------
    if (route === '/admin/login' && method === 'POST') {
      const { email, password } = await request.json()
      if (!email || !password) return json({ error: 'Email and password are required' }, 400)
      const staff = await db.collection('staff').findOne({ email: String(email).toLowerCase() })
      if (!staff) return json({ error: 'Invalid credentials' }, 401)
      if (sha256(password + staff.salt) !== staff.passwordHash) return json({ error: 'Invalid credentials' }, 401)
      const token = uuidv4()
      await db.collection('sessions').insertOne({ token, staffId: staff.id, role: staff.role || 'admin', createdAt: new Date() })
      return json({ token, staff: publicStaff(staff) })
    }

    if (route === '/admin/me' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      return json({ staff: publicStaff(staff) })
    }

    // ---------------- Admin: own profile (name / email / password) ----------------
    if (route === '/admin/profile' && method === 'PUT') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const b = await request.json()
      const set = { updatedAt: new Date() }
      if (typeof b.name === 'string' && b.name.trim()) set.name = b.name.trim()
      if (typeof b.title === 'string') set.title = b.title.trim()
      if (typeof b.email === 'string' && b.email.trim()) {
        const em = b.email.toLowerCase().trim()
        if (em !== staff.email) {
          const dup = await db.collection('staff').findOne({ email: em, id: { $ne: staff.id } })
          if (dup) return json({ error: 'That email is already in use by another account' }, 409)
          set.email = em
        }
      }
      const changed = []
      if (b.newPassword) {
        if (!b.currentPassword) return json({ error: 'Current password is required to set a new one' }, 400)
        if (sha256(b.currentPassword + staff.salt) !== staff.passwordHash) return json({ error: 'Current password is incorrect' }, 401)
        if (String(b.newPassword).length < 8) return json({ error: 'New password must be at least 8 characters' }, 400)
        const salt = crypto.randomBytes(8).toString('hex')
        set.salt = salt
        set.passwordHash = sha256(b.newPassword + salt)
        set.mustResetPassword = false
        changed.push('password')
      }
      await db.collection('staff').updateOne({ id: staff.id }, { $set: set })
      changed.push(...Object.keys(set).filter((k) => !['updatedAt', 'salt', 'passwordHash', 'mustResetPassword'].includes(k)))
      await audit(db, staff, 'admin_profile_updated', { changed })
      const fresh = await db.collection('staff').findOne({ id: staff.id })
      return json({ ok: true, message: 'Profile updated', staff: publicStaff(fresh) })
    }

    // Forced first-login password change (no current password if flagged mustResetPassword)
    if (route === '/admin/profile/first-password' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const b = await request.json()
      if (!b.newPassword || String(b.newPassword).length < 8) return json({ error: 'New password must be at least 8 characters' }, 400)
      // Only allowed while a reset is pending; otherwise require the standard flow
      if (!staff.mustResetPassword) return json({ error: 'Use the profile screen to change your password' }, 400)
      const salt = crypto.randomBytes(8).toString('hex')
      await db.collection('staff').updateOne({ id: staff.id }, { $set: { salt, passwordHash: sha256(b.newPassword + salt), mustResetPassword: false, updatedAt: new Date() } })
      await audit(db, staff, 'admin_first_password_set', {})
      const fresh = await db.collection('staff').findOne({ id: staff.id })
      return json({ ok: true, message: 'Password set — welcome!', staff: publicStaff(fresh) })
    }

    // ---------------- Admin: team / staff account management (admin role only) ----------------
    if (route === '/admin/staff' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      if (!isAdmin(staff)) return json({ error: 'Admin access required' }, 403)
      const items = await db.collection('staff').find({}).sort({ createdAt: 1 }).toArray()
      return json({ staff: items.map((s) => ({ ...publicStaff(s), you: s.id === staff.id })) })
    }

    if (route === '/admin/staff' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      if (!isAdmin(staff)) return json({ error: 'Admin access required' }, 403)
      const b = await request.json()
      const name = (b.name || '').trim()
      const email = (b.email || '').toLowerCase().trim()
      const password = b.password || ''
      const role = (b.role === 'admin' || b.role === 'staff') ? b.role : 'staff'
      if (!name || !email || !password) return json({ error: 'Name, email and password are required' }, 400)
      if (String(password).length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)
      const dup = await db.collection('staff').findOne({ email })
      if (dup) return json({ error: 'A staff account with that email already exists' }, 409)
      const salt = crypto.randomBytes(8).toString('hex')
      const rec = {
        id: uuidv4(), role, name, email, title: (b.title || '').trim(),
        salt, passwordHash: sha256(password + salt), mustResetPassword: true,
        createdAt: new Date(), createdBy: staff.name,
      }
      await db.collection('staff').insertOne(rec)
      await audit(db, staff, 'staff_created', { email, role })
      return json({ ok: true, message: `${role === 'admin' ? 'Admin' : 'Staff'} account created`, staff: publicStaff(rec) })
    }

    if (route.startsWith('/admin/staff/') && method === 'PUT') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      if (!isAdmin(staff)) return json({ error: 'Admin access required' }, 403)
      const id = path[2]
      const target = await db.collection('staff').findOne({ id })
      if (!target) return json({ error: 'Staff account not found' }, 404)
      const b = await request.json()
      const set = { updatedAt: new Date() }
      if (typeof b.name === 'string' && b.name.trim()) set.name = b.name.trim()
      if (typeof b.title === 'string') set.title = b.title.trim()
      if (b.role === 'admin' || b.role === 'staff') {
        if (target.id === staff.id && b.role !== 'admin') return json({ error: 'You cannot change your own role' }, 400)
        set.role = b.role
      }
      if (b.newPassword) {
        if (String(b.newPassword).length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)
        const salt = crypto.randomBytes(8).toString('hex')
        set.salt = salt
        set.passwordHash = sha256(b.newPassword + salt)
        set.mustResetPassword = true
        // force re-login for the affected account
        await db.collection('sessions').deleteMany({ staffId: id })
      }
      await db.collection('staff').updateOne({ id }, { $set: set })
      await audit(db, staff, 'staff_updated', { targetEmail: target.email, changed: Object.keys(set).filter((k) => !['updatedAt', 'salt', 'passwordHash'].includes(k)).concat(b.newPassword ? ['password'] : []) })
      return json({ ok: true, message: 'Staff account updated' })
    }

    if (route.startsWith('/admin/staff/') && method === 'DELETE') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      if (!isAdmin(staff)) return json({ error: 'Admin access required' }, 403)
      const id = path[2]
      if (id === staff.id) return json({ error: 'You cannot delete your own account' }, 400)
      const target = await db.collection('staff').findOne({ id })
      if (!target) return json({ error: 'Staff account not found' }, 404)
      if (isAdmin(target)) {
        const adminCount = await db.collection('staff').countDocuments({ $or: [{ role: 'admin' }, { role: { $exists: false } }] })
        if (adminCount <= 1) return json({ error: 'Cannot delete the last remaining admin account' }, 400)
      }
      await db.collection('staff').deleteOne({ id })
      await db.collection('sessions').deleteMany({ staffId: id })
      await audit(db, staff, 'staff_deleted', { email: target.email })
      return json({ ok: true, message: 'Staff account removed' })
    }

    if (route === '/admin/content' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const content = await getSiteContent(db)
      return json({ content, defaults: DEFAULT_CONTENT })
    }

    if (route === '/admin/content' && method === 'PUT') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const body = await request.json()
      const data = body.content
      if (!data || typeof data !== 'object') return json({ error: 'content object is required' }, 400)
      await db.collection('content').updateOne(
        { id: 'site' },
        { $set: { id: 'site', data, updatedAt: new Date(), updatedBy: staff.name } },
        { upsert: true }
      )
      return json({ ok: true, message: 'Website content saved', content: data })
    }

    if (route === '/admin/content/reset' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      await db.collection('content').deleteOne({ id: 'site' })
      return json({ ok: true, content: DEFAULT_CONTENT })
    }

    // ---------------- Admin: LMS Manager ----------------
    if (route === '/admin/lms' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const config = await getLmsConfig(db)
      return json({ config })
    }

    if (route === '/admin/lms' && method === 'PUT') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const body = await request.json()
      const cfg = body.config
      if (!cfg || typeof cfg !== 'object') return json({ error: 'config object is required' }, 400)
      // ensure ids exist on modules/lessons/schedule/assignments/resources
      const ensureId = (x, prefix) => ({ ...x, id: x.id || `${prefix}-${uuidv4().slice(0, 8)}` })
      const data = {
        modules: (cfg.modules || []).map((m) => ({ ...ensureId(m, 'm'), lessons: (m.lessons || []).map((l) => ensureId(l, 'l')) })),
        schedule: (cfg.schedule || []).map((s) => ensureId(s, 's')),
        assignments: (cfg.assignments || []).map((a) => ensureId(a, 'a')),
        resources: (cfg.resources || []).map((r) => ensureId(r, 'r')),
      }
      await db.collection('lms_content').updateOne(
        { id: 'lms' },
        { $set: { id: 'lms', data, updatedAt: new Date(), updatedBy: staff.name } },
        { upsert: true }
      )
      return json({ ok: true, message: 'LMS content saved', config: data })
    }

    if (route === '/admin/lms/reset' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      await db.collection('lms_content').deleteOne({ id: 'lms' })
      return json({ ok: true, config: await getLmsConfig(db) })
    }

    // ---------------- Admin: Payment Settings (Flutterwave keys) ----------------
    if (route === '/admin/payment-settings' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const flw = await getFlwConfig(db)
      const mask = (k) => k ? `${k.slice(0, 10)}\u2026${k.slice(-4)}` : ''
      const configured = !!(flw.secret && !flw.secret.includes('REPLACE_ME'))
      return json({
        settings: {
          mode: flw.mode,
          source: flw.source,
          configured,
          secretMasked: configured ? mask(flw.secret) : '',
          publicKey: flw.publicKey && !flw.publicKey.includes('REPLACE_ME') ? flw.publicKey : '',
        },
      })
    }

    if (route === '/admin/payment-settings' && method === 'PUT') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      if (!isAdmin(staff)) return json({ error: 'Admin access required' }, 403)
      const b = await request.json()
      const set = { id: 'payments', updatedAt: new Date(), updatedBy: staff.name }
      if (typeof b.secretKey === 'string' && b.secretKey.trim() && !b.secretKey.includes('\u2026')) set.secretKey = b.secretKey.trim()
      if (typeof b.publicKey === 'string') set.publicKey = b.publicKey.trim()
      if (b.mode === 'test' || b.mode === 'live') set.mode = b.mode
      await db.collection('settings').updateOne({ id: 'payments' }, { $set: set }, { upsert: true })
      await audit(db, staff, 'payment_settings_updated', { changed: Object.keys(set).filter((k) => !['id', 'updatedAt', 'updatedBy'].includes(k)), mode: set.mode })
      return json({ ok: true, message: 'Payment settings saved' })
    }

    if (route === '/admin/payment-settings/test' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const b = await request.json().catch(() => ({}))
      let secret
      if (b.secretKey && !b.secretKey.includes('\u2026')) secret = b.secretKey.trim()
      else secret = (await getFlwConfig(db)).secret
      try {
        await flutterwave(secret, '/balances')
        return json({ ok: true, message: 'Connection successful \u2014 your Flutterwave key is valid.' })
      } catch (e) {
        if (e.code === 'PAYMENT_NOT_CONFIGURED') return json({ ok: false, error: 'No key provided.' }, 400)
        return json({ ok: false, error: e.message || 'Key appears invalid.' }, 400)
      }
    }

    // ---------------- Admin: Email settings + test send ----------------
    if (route === '/admin/email-settings' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const cfg = await getEmailConfig(db)
      const configured = !!(cfg.apiKey && !cfg.apiKey.includes('REPLACE_ME'))
      return json({ settings: { source: cfg.source, configured, apiKeyMasked: configured ? `${cfg.apiKey.slice(0, 6)}\u2026${cfg.apiKey.slice(-4)}` : '', mailFrom: cfg.from || '', admissionsEmail: cfg.admissions || '' } })
    }

    if (route === '/admin/email-settings' && method === 'PUT') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      if (!isAdmin(staff)) return json({ error: 'Admin access required' }, 403)
      const b = await request.json()
      const set = { id: 'email', updatedAt: new Date(), updatedBy: staff.name }
      if (typeof b.resendApiKey === 'string' && b.resendApiKey.trim() && !b.resendApiKey.includes('\u2026')) set.resendApiKey = b.resendApiKey.trim()
      if (typeof b.mailFrom === 'string') set.mailFrom = b.mailFrom.trim()
      if (typeof b.admissionsEmail === 'string') set.admissionsEmail = b.admissionsEmail.trim()
      await db.collection('settings').updateOne({ id: 'email' }, { $set: set }, { upsert: true })
      await audit(db, staff, 'email_settings_updated', { changed: Object.keys(set).filter((k) => !['id', 'updatedAt', 'updatedBy'].includes(k)) })
      return json({ ok: true, message: 'Email settings saved' })
    }

    if (route === '/admin/email-settings/test' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const b = await request.json().catch(() => ({}))
      const to = (b.to || '').trim()
      if (!to) return json({ ok: false, error: 'Recipient email is required' }, 400)
      const cfg = await getEmailConfig(db)
      const mail = await sendMail({
        to,
        subject: 'Vox Magic — Test Email',
        html: admissionEmailHtml({ name: 'Test Recipient', email: to, tempPassword: 'VM-TEST01', admissionNo: 'DSML/VM-TEST', cohortStart: 'Soon' }),
        text: 'This is a Vox Magic test email confirming your Resend configuration works.',
      }, cfg)
      await audit(db, staff, 'test_email_sent', { to, ok: mail.ok, error: mail.ok ? null : mail.error })
      if (mail.ok) return json({ ok: true, message: `Test email sent to ${to} (id: ${mail.id || 'n/a'})` })
      return json({ ok: false, error: mail.error || 'Send failed' }, 400)
    }

    // ---------------- Admin: Storage settings ----------------
    if (route === '/admin/storage-settings' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const cfg = await getBlobToken(db)
      const configured = !!(cfg.token && !cfg.token.includes('REPLACE_ME'))
      return json({ settings: { source: cfg.source, configured, tokenMasked: configured ? `${cfg.token.slice(0, 12)}\u2026${cfg.token.slice(-4)}` : '' } })
    }

    if (route === '/admin/storage-settings' && method === 'PUT') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      if (!isAdmin(staff)) return json({ error: 'Admin access required' }, 403)
      const b = await request.json()
      const set = { id: 'storage', updatedAt: new Date(), updatedBy: staff.name }
      if (typeof b.blobToken === 'string' && b.blobToken.trim() && !b.blobToken.includes('\u2026')) set.blobToken = b.blobToken.trim()
      await db.collection('settings').updateOne({ id: 'storage' }, { $set: set }, { upsert: true })
      await audit(db, staff, 'storage_settings_updated', {})
      return json({ ok: true, message: 'Storage settings saved' })
    }

    // ---------------- Admin: Audit log ----------------
    if (route === '/admin/audit-logs' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const logs = await db.collection('audit_logs').find({}).sort({ createdAt: -1 }).limit(200).toArray()
      return json({ logs: logs.map(clean) })
    }

    // ---------------- Admin: secure file upload (Vercel Blob private, server-side) ----------------
    if (route === '/admin/upload' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const { token: blobToken } = await getBlobToken(db)
      if (!blobToken) return json({ error: 'UPLOAD_NOT_CONFIGURED' }, 503)
      const url = new URL(request.url)
      const filename = (url.searchParams.get('filename') || 'file').replace(/[^\w.\-]/g, '_')
      const contentType = request.headers.get('content-type') || 'application/octet-stream'
      try {
        const buf = Buffer.from(await request.arrayBuffer())
        if (!buf.length) return json({ error: 'Empty file' }, 400)
        const blob = await put(`voxmagic/${Date.now()}-${filename}`, buf, {
          access: 'private', contentType, token: blobToken, addRandomSuffix: true,
        })
        await db.collection('uploads').insertOne({ id: uuidv4(), url: blob.url, pathname: blob.pathname, filename, contentType, size: buf.length, by: staff.id, createdAt: new Date() })
        return json({ ok: true, url: blob.url, pathname: blob.pathname, filename, contentType })
      } catch (e) {
        return json({ error: e.message || 'Upload failed' }, 502)
      }
    }

    if (route === '/admin/overview' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const [applications, students, paidPayments, pendingApps, submissions] = await Promise.all([
        db.collection('applications').countDocuments({}),
        db.collection('students').countDocuments({}),
        db.collection('payments').find({ status: 'paid' }).toArray(),
        db.collection('applications').countDocuments({ status: 'submitted' }),
        db.collection('submissions').countDocuments({ grade: { $in: [null, undefined] } }),
      ])
      const revenue = paidPayments.reduce((s, p) => s + (p.amount || 0), 0)
      return json({
        stats: {
          applications, students, revenue,
          pendingApplications: pendingApps,
          paidPayments: paidPayments.length,
          ungradedSubmissions: submissions,
        },
      })
    }

    if (route === '/admin/applications' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const items = await db.collection('applications').find({}).sort({ createdAt: -1 }).limit(500).toArray()
      return json({ applications: items.map(clean) })
    }

    if (route === '/admin/students' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const items = await db.collection('students').find({}).sort({ createdAt: -1 }).limit(500).toArray()
      const cfgSt = await getLmsConfig(db)
      const allIds = lessonIdsOf(cfgSt)
      const out = items.map((s) => {
        const completed = (s.lmsProgress || []).filter((id) => allIds.includes(id)).length
        const percent = allIds.length ? Math.round((completed / allIds.length) * 100) : 0
        return { id: s.id, name: s.name, email: s.email, admissionNo: s.admissionNo, cohortId: s.cohortId || null, cohortName: s.cohortName || null, tuitionTrack: s.tuitionTrack, tuitionStatus: s.tuitionStatus, tuitionPaid: s.tuitionPaid || 0, status: s.status, progress: percent }
      })
      return json({ students: out })
    }

    if (route === '/admin/students/reset-password' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const { studentId, newPassword } = await request.json()
      if (!studentId || !newPassword) return json({ error: 'studentId and newPassword are required' }, 400)
      if (String(newPassword).length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)
      const student = await db.collection('students').findOne({ id: studentId })
      if (!student) return json({ error: 'Student not found' }, 404)
      const salt = crypto.randomBytes(8).toString('hex')
      await db.collection('students').updateOne({ id: studentId }, { $set: { salt, passwordHash: sha256(newPassword + salt), mustResetPassword: true, tempPasswordPlain: null, updatedAt: new Date() } })
      await db.collection('sessions').deleteMany({ studentId })
      await audit(db, staff, 'student_password_reset', { studentEmail: student.email })
      return json({ ok: true, message: `Password reset for ${student.name}. They must set a new password on next login.` })
    }

    if (route === '/admin/students/assign-cohort' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const { studentId, cohortId } = await request.json()
      if (!studentId) return json({ error: 'studentId is required' }, 400)
      const student = await db.collection('students').findOne({ id: studentId })
      if (!student) return json({ error: 'Student not found' }, 404)
      let cohortName = null
      if (cohortId) {
        const cohort = await db.collection('cohorts').findOne({ id: cohortId })
        if (!cohort) return json({ error: 'Cohort not found' }, 404)
        cohortName = cohort.name
      }
      await db.collection('students').updateOne({ id: studentId }, { $set: { cohortId: cohortId || null, cohortName, updatedAt: new Date() } })
      return json({ ok: true, message: cohortId ? `Assigned to ${cohortName}` : 'Removed from cohort' })
    }

    if (route === '/admin/payments' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const items = await db.collection('payments').find({}).sort({ createdAt: -1 }).limit(500).toArray()
      return json({ payments: items.map(clean) })
    }

    if (route === '/admin/submissions' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const subs = await db.collection('submissions').find({}).sort({ createdAt: -1 }).limit(500).toArray()
      const cfgSub = await getLmsConfig(db)
      const out = []
      for (const s of subs) {
        const student = await db.collection('students').findOne({ id: s.studentId })
        const assignment = cfgSub.assignments.find((a) => a.id === s.assignmentId)
        out.push({
          id: s._id.toString(), studentId: s.studentId, assignmentId: s.assignmentId,
          studentName: student ? student.name : 'Unknown', studentEmail: student ? student.email : '',
          assignmentTitle: assignment ? assignment.title : s.assignmentId,
          content: s.content, grade: s.grade || null, feedback: s.feedback || null, submittedAt: s.createdAt,
        })
      }
      return json({ submissions: out })
    }

    if (route === '/admin/submissions/grade' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const { studentId, assignmentId, grade, feedback } = await request.json()
      if (!studentId || !assignmentId || !grade) return json({ error: 'studentId, assignmentId and grade are required' }, 400)
      const res = await db.collection('submissions').updateOne(
        { studentId, assignmentId },
        { $set: { grade, feedback: feedback || '', gradedAt: new Date(), gradedBy: staff.name } }
      )
      if (res.matchedCount === 0) return json({ error: 'Submission not found' }, 404)
      return json({ ok: true, message: 'Grade saved' })
    }

    if (route === '/admin/attendance' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const { studentId, sessionId } = await request.json()
      if (!studentId || !sessionId) return json({ error: 'studentId and sessionId are required' }, 400)
      const cfgAtt = await getLmsConfig(db)
      if (!cfgAtt.schedule.find((s) => s.id === sessionId)) return json({ error: 'Invalid sessionId' }, 400)
      await db.collection('attendance').updateOne(
        { studentId, sessionId },
        { $set: { studentId, sessionId, markedAt: new Date(), markedBy: staff.name } },
        { upsert: true }
      )
      return json({ ok: true, message: 'Attendance marked' })
    }

    if (route === '/admin/cohorts' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const items = await db.collection('cohorts').find({}).sort({ createdAt: -1 }).toArray()
      return json({ cohorts: items.map(clean) })
    }

    if (route === '/admin/cohorts' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const { name, track, startDate, capacity } = await request.json()
      if (!name) return json({ error: 'Cohort name is required' }, 400)
      const cohort = { id: uuidv4(), name, track: track || 'online', startDate: startDate || '', capacity: capacity || 20, createdAt: new Date(), createdBy: staff.name }
      await db.collection('cohorts').insertOne(cohort)
      return json({ ok: true, cohort: clean(cohort) })
    }

    if (route === '/admin/announcements' && method === 'GET') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const items = await db.collection('announcements').find({}).sort({ createdAt: -1 }).toArray()
      return json({ announcements: items.map(clean) })
    }

    if (route === '/admin/announcements' && method === 'POST') {
      const staff = await getStaffFromAuth(request, db)
      if (!staff) return json({ error: 'Unauthorized' }, 401)
      const { title, body } = await request.json()
      if (!title || !body) return json({ error: 'Title and body are required' }, 400)
      const ann = { id: uuidv4(), title, body, date: new Date().toLocaleDateString('en-GB'), createdAt: new Date(), createdBy: staff.name }
      await db.collection('announcements').insertOne(ann)
      return json({ ok: true, announcement: clean(ann) })
    }

    return json({ error: `Route ${route} not found` }, 404)
  } catch (error) {
    console.error('API Error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
