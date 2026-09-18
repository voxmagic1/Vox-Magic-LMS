const { MongoClient } = require('mongodb')
const crypto = require('node:crypto')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')

// minimal .env loader
for (const line of fs.readFileSync('/app/.env', 'utf-8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2]
}

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex')

async function main() {
  const client = new MongoClient(process.env.MONGO_URL)
  await client.connect()
  const db = client.db(process.env.DB_NAME)
  const email = 'lms.tester@voxmagic.test'
  const password = 'Test1234'
  const salt = crypto.randomBytes(8).toString('hex')
  await db.collection('students').deleteOne({ email })
  const now = new Date()
  const end = new Date(now); end.setMonth(end.getMonth() + 3)
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const student = {
    id: uuidv4(), role: 'student', name: 'LMS Tester', email,
    salt, passwordHash: sha256(password + salt), mustResetPassword: false,
    admissionNo: 'DSML/VM-2026-TEST01',
    admissionLetter: {
      admissionNo: 'DSML/VM-2026-TEST01', issuedAt: now.toISOString(), studentName: 'LMS Tester',
      program: 'Vocal Transformation Program', duration: '3 Months', cohortStart: fmt(now), cohortEnd: fmt(end),
      body: 'Provisional admission for testing.', signatory: 'Damian Nworgu', signatoryTitle: 'Vocal Coach / Music Director, Vox Magic',
    },
    program: 'Vocal Transformation Program', tuitionTrack: 'online', tuitionStatus: 'partial', tuitionPaid: 40000,
    lmsProgress: [], status: 'registered', createdAt: now,
  }
  await db.collection('students').insertOne(student)
  console.log('Seeded student:', email, '/', password, 'id=', student.id)

  // seed admin/staff
  const adminEmail = 'admin@voxmagic.test'
  const adminPass = 'Admin1234'
  const asalt = crypto.randomBytes(8).toString('hex')
  await db.collection('staff').deleteOne({ email: adminEmail })
  const admin = {
    id: uuidv4(), role: 'admin', name: 'Damian Nworgu', email: adminEmail,
    title: 'Vocal Coach / Music Director',
    salt: asalt, passwordHash: sha256(adminPass + asalt), mustResetPassword: true, createdAt: now,
  }
  await db.collection('staff').insertOne(admin)
  console.log('Seeded admin:', adminEmail, '/', adminPass, 'id=', admin.id)

  await client.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
