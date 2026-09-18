'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Menu, X, Music2, Mic2, Sparkles, GraduationCap, CalendarDays, Star, Quote,
  CheckCircle2, ArrowRight, Play, Award, Users, Target, Eye, HeartHandshake,
  Phone, Mail, MapPin, Instagram, Facebook, Youtube, Twitter, LogOut, FileText,
  Loader2, ChevronRight, BookOpen, Clock, ShieldCheck, Download, Wallet, Crown,
  PlayCircle, ClipboardList, FolderOpen, Send, Lock, Video, Radio, TrendingUp, Megaphone, Upload,
} from 'lucide-react'

const IMG = { logo: '/assets/logo.png', founder: '/assets/founder.png' }

const NAIRA = (n) => '₦' + Number(n).toLocaleString('en-NG')
const VALUE_ICONS = [Crown, HeartHandshake, Sparkles, Users]

const NAV = [
  { label: 'About', id: 'about' },
  { label: 'Programmes', id: 'programmes' },
  { label: 'Assessment', id: 'assessment' },
  { label: 'Founder', id: 'founder' },
  { label: 'Events', id: 'events' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'FAQ', id: 'faq' },
  { label: 'Contact', id: 'contact' },
]

const DEFAULT_CONTENT = {
  brand: { tagline: 'Cast The Spell With The Rhythm', email: 'hello@voxmagic-dsml.com', phone: '+234 800 000 0000', location: 'Damichromes School of Music, Nigeria', socials: { instagram: '#', facebook: '#', youtube: '#', twitter: '#' } },
  media: {
    hero: 'https://images.pexels.com/photos/7715781/pexels-photo-7715781.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    about: 'https://images.pexels.com/photos/5070067/pexels-photo-5070067.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    assessment: 'https://images.pexels.com/photos/17722680/pexels-photo-17722680.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    events: 'https://images.unsplash.com/photo-1655395699875-860857fe75ed?crop=entropy&cs=srgb&fm=jpg&q=85',
    testimonials: 'https://images.pexels.com/photos/6193849/pexels-photo-6193849.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    founder: '/assets/founder.png',
  },
  hero: { badge: 'The Vocal Music Department of DSML', titleTop: 'Cast The Spell', titleHighlight: 'Rhythm', subtitle: 'Vox Magic transforms voices through world-class vocal coaching. Discover the singer within you with our signature three-month Vocal Transformation Program.', ctaPrimary: 'Enrol Now', ctaSecondary: 'Explore Programmes' },
  about: { eyebrow: 'About Vox Magic', title: 'Where Voices Become Magic', subtitle: 'Vox Magic is the premium Vocal Music Department of Damichromes School of Music Limited (DSML). We exist to unlock, refine and celebrate the human voice.', body1: 'Combining proven vocal science with soulful artistry, our coaches nurture singers of every level — from first-time vocalists to touring recording artists. Through structured curriculum, live masterclasses and personal mentorship, we help you sing with freedom, power and confidence.', missionTitle: 'Our Mission', mission: 'To develop confident, technically excellent and expressive singers.', visionTitle: 'Our Vision', vision: 'To be Africa’s most respected home of transformative vocal training.' },
  values: [
    { title: 'Excellence', text: 'We pursue mastery in every note, breath and performance.' },
    { title: 'Integrity', text: 'Honest, nurturing coaching rooted in respect for every voice.' },
    { title: 'Artistry', text: 'We celebrate individuality and the magic of authentic expression.' },
    { title: 'Community', text: 'A supportive family of singers growing together.' },
  ],
  programmes: { registration: 20000, onlinePrice: 80000, hybridPrice: 130000, onlineFeatures: ['Live virtual classes', 'Class recordings & resources', 'Weekly assignments & feedback', 'Community access', 'Certificate on completion'], hybridFeatures: ['Everything in Online', 'In-person coaching sessions', 'Live performance labs', 'Priority masterclass seats', 'One-on-one mentorship'] },
  curriculum: [
    { m: 'Month 1', t: 'Foundations', items: ['Breath support & posture', 'Pitch & ear training', 'Vocal health & warm-ups'] },
    { m: 'Month 2', t: 'Technique & Range', items: ['Resonance & tone', 'Range extension', 'Belting & mixed voice'] },
    { m: 'Month 3', t: 'Performance', items: ['Song interpretation', 'Stagecraft & mic technique', 'Final performance & assessment'] },
  ],
  founder: { name: 'Damian Nworgu', role: 'Vocal Coach / Music Director', bio1: 'Damian Nworgu is a passionate vocal coach and music director with a heart for developing extraordinary singers. As the founder of Vox Magic, he has designed a transformative methodology that blends rigorous vocal technique with soulful, authentic expression.', bio2: 'His mission is simple yet profound: to help every student sing with freedom, power and undeniable confidence. Under his direction, Vox Magic has become a home where voices are refined and artistry flourishes.' },
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
    { q: 'How much does it cost?', a: 'A one-time registration fee of ₦20,000 confirms your place. Tuition is ₦80,000 for the Online track or ₦130,000 for the Hybrid track. Tuition can be paid in full or in two 50/50 instalments.' },
    { q: 'What happens after I pay the registration fee?', a: 'Your registration is confirmed automatically, your admission letter is generated and your student portal is created instantly. You then choose to pay tuition in full or in two instalments.' },
    { q: 'Do I need prior experience?', a: 'No. Our vocal assessment helps us place you correctly, and the curriculum meets you where you are.' },
    { q: 'Will I get a certificate?', a: 'Yes. Students who complete the programme and assessments receive a Vox Magic – DSML certificate of completion.' },
  ],
}

const withDefaults = (c) => {
  const d = DEFAULT_CONTENT
  if (!c) return d
  return {
    brand: { ...d.brand, ...(c.brand || {}), socials: { ...d.brand.socials, ...((c.brand && c.brand.socials) || {}) } },
    media: { ...d.media, ...(c.media || {}) },
    hero: { ...d.hero, ...(c.hero || {}) },
    about: { ...d.about, ...(c.about || {}) },
    values: c.values?.length ? c.values : d.values,
    programmes: { ...d.programmes, ...(c.programmes || {}) },
    curriculum: c.curriculum?.length ? c.curriculum : d.curriculum,
    founder: { ...d.founder, ...(c.founder || {}) },
    faculty: c.faculty?.length ? c.faculty : d.faculty,
    events: c.events?.length ? c.events : d.events,
    testimonials: c.testimonials?.length ? c.testimonials : d.testimonials,
    blog: c.blog?.length ? c.blog : d.blog,
    faq: c.faq?.length ? c.faq : d.faq,
  }
}

// --------------------------------------------------------------------------
function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Logo({ className = 'h-11' }) {
  return <img src={IMG.logo} alt="Vox Magic — DSML" className={className} />
}

function SectionTitle({ eyebrow, title, sub, light }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className={`text-sm font-semibold tracking-[0.25em] uppercase ${light ? 'text-brand-gold-light' : 'text-brand-red'}`}>{eyebrow}</p>}
      <div className="gold-rule my-4" />
      <h2 className={`font-display text-3xl md:text-5xl font-bold leading-tight ${light ? 'text-white' : 'text-brand-navy'}`}>{title}</h2>
      {sub && <p className={`mt-4 text-lg ${light ? 'text-white/75' : 'text-muted-foreground'}`}>{sub}</p>}
    </div>
  )
}

// --------------------------------------------------------------------------
function Navbar({ setView }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const go = (id) => { setOpen(false); scrollToId(id) }
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm py-2' : 'bg-transparent py-4'}`}>
      <div className="container flex items-center justify-between">
        <button onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="flex items-center">
          <Logo className={scrolled ? 'h-10' : 'h-12'} />
        </button>
        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className={`text-sm font-medium transition-colors hover:text-brand-red ${scrolled ? 'text-brand-navy' : 'text-white'}`}>{n.label}</button>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" onClick={() => setView('login')} className={scrolled ? 'text-brand-navy hover:text-brand-purple' : 'text-white hover:text-white hover:bg-white/10'}>Student Login</Button>
          <Button onClick={() => setView('apply')} className="bg-brand-red hover:bg-brand-red-light text-white font-semibold shadow-lg shadow-brand-red/20">Apply / Enrol</Button>
        </div>
        <button className={`lg:hidden ${scrolled ? 'text-brand-navy' : 'text-white'}`} onClick={() => setOpen(!open)}>
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-white shadow-xl mt-2 mx-4 rounded-2xl p-5 space-y-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className="block w-full text-left py-2 text-brand-navy font-medium">{n.label}</button>
          ))}
          <Separator className="my-2" />
          <Button variant="outline" className="w-full mb-2" onClick={() => { setOpen(false); setView('login') }}>Student Login</Button>
          <Button className="w-full bg-brand-red hover:bg-brand-red-light" onClick={() => { setOpen(false); setView('apply') }}>Apply / Enrol</Button>
        </div>
      )}
    </header>
  )
}

function Hero({ setView, c }) {
  return (
    <section id="home" className="relative min-h-screen flex items-center">
      <div className="absolute inset-0">
        <img src={c.media.hero} alt="Vocalist performing" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
      </div>
      <div className="container relative z-10 pt-28 pb-16">
        <div className="max-w-3xl section-fade">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-white/90 text-sm mb-6">
            <Sparkles className="h-4 w-4 text-brand-gold-light" /> {c.hero.badge}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.05]">
            {c.hero.titleTop} <span className="brand-gradient-text bg-clip-text">{c.hero.titleHighlight}</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-xl">
            {c.hero.subtitle}
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => setView('apply')} className="bg-brand-red hover:bg-brand-red-light text-white text-base font-semibold h-14 px-8 shadow-xl shadow-brand-red/30">
              {c.hero.ctaPrimary} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToId('programmes')} className="h-14 px-8 text-base bg-white/5 border-white/30 text-white hover:bg-white/15 hover:text-white">
              <Play className="mr-2 h-5 w-5" /> {c.hero.ctaSecondary}
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap gap-8 text-white/80">
            {[['3-Month', 'Intensive Program'], ['Online + Hybrid', 'Flexible Learning'], ['Certified', 'On Completion']].map(([a, b]) => (
              <div key={a}>
                <p className="font-display text-2xl font-bold text-white">{a}</p>
                <p className="text-sm text-white/60">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function About({ c }) {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="container grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative">
          <img src={c.media.about} alt="Grand piano" className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]" />
          <div className="absolute -bottom-8 -right-4 md:right-8 bg-brand-navy text-white rounded-2xl p-6 shadow-xl max-w-xs">
            <p className="font-display text-4xl font-bold text-brand-gold-light">DSML</p>
            <p className="text-white/70 text-sm mt-1">Damichromes School of Music Limited</p>
          </div>
        </div>
        <div>
          <SectionTitle eyebrow={c.about.eyebrow} title={c.about.title} sub={c.about.subtitle} />
          <p className="mt-6 text-muted-foreground leading-relaxed">
            {c.about.body1}
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-5">
            {[
              [Target, c.about.missionTitle, c.about.mission],
              [Eye, c.about.visionTitle, c.about.vision],
            ].map(([Icon, t, d]) => (
              <div key={t} className="rounded-2xl border p-5 card-hover">
                <Icon className="h-8 w-8 text-brand-purple" />
                <p className="font-display text-xl font-semibold mt-3 text-brand-navy">{t}</p>
                <p className="text-sm text-muted-foreground mt-1">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Values({ c }) {
  return (
    <section className="py-24 bg-brand-cream">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <SectionTitle eyebrow="Vision • Mission • Values" title="What We Stand For" />
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {c.values.map((v, i) => {
            const Icon = VALUE_ICONS[i % VALUE_ICONS.length]
            return (
              <div key={i} className="bg-white rounded-2xl p-7 card-hover border">
                <div className="h-14 w-14 rounded-xl brand-gradient flex items-center justify-center">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <p className="font-display text-xl font-semibold mt-5 text-brand-navy">{v.title}</p>
                <p className="text-sm text-muted-foreground mt-2">{v.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Programmes({ setView, c }) {
  const p = c.programmes
  const tracks = [
    { name: 'Online Track', price: p.onlinePrice, badge: null, features: p.onlineFeatures, plan: 'online' },
    { name: 'Hybrid Track', price: p.hybridPrice, badge: 'Most Popular', features: p.hybridFeatures, plan: 'hybrid' },
  ]
  return (
    <section id="programmes" className="py-24 bg-white">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 items-end">
          <SectionTitle eyebrow="Programmes" title="The Vocal Transformation Program" sub="A three-month signature intensive designed to transform your voice, technique and stage presence." />
          <div className="lg:justify-self-end">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-brand-navy text-white px-6 py-4">
              <Clock className="h-6 w-6 text-brand-gold-light" />
              <div>
                <p className="text-sm text-white/60">Duration</p>
                <p className="font-display text-xl font-semibold">3 Months • Registration {NAIRA(p.registration)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {c.curriculum.map((cur) => (
            <div key={cur.m} className="rounded-2xl border p-6 card-hover">
              <Badge className="bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/10">{cur.m}</Badge>
              <p className="font-display text-2xl font-semibold mt-4 text-brand-navy">{cur.t}</p>
              <ul className="mt-4 space-y-2">
                {cur.items.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" />{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tracks.map((t) => (
            <div key={t.name} className={`relative rounded-3xl p-8 card-hover ${t.badge ? 'brand-gradient text-white shadow-2xl' : 'bg-white border-2 text-brand-navy'}`}>
              {t.badge && <span className="absolute -top-3 left-8 bg-brand-red text-white text-xs font-semibold px-3 py-1 rounded-full">{t.badge}</span>}
              <p className={`font-display text-2xl font-semibold ${t.badge ? 'text-white' : 'text-brand-navy'}`}>{t.name}</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-display text-5xl font-bold">{NAIRA(t.price)}</span>
                <span className={`mb-1.5 text-sm ${t.badge ? 'text-white/70' : 'text-muted-foreground'}`}>tuition</span>
              </div>
              <p className={`text-sm mt-1 ${t.badge ? 'text-white/70' : 'text-muted-foreground'}`}>+ {NAIRA(p.registration)} one-time registration</p>
              <p className={`text-xs mt-1 ${t.badge ? 'text-brand-gold-light' : 'text-brand-red'}`}>Pay in full or two 50/50 instalments of {NAIRA(t.price / 2)}</p>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm"><CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${t.badge ? 'text-brand-gold-light' : 'text-brand-blue'}`} />{f}</li>
                ))}
              </ul>
              <Button onClick={() => setView('apply')} className={`mt-8 w-full h-12 font-semibold ${t.badge ? 'bg-white text-brand-purple hover:bg-white/90' : 'bg-brand-purple text-white hover:bg-brand-purple-light'}`}>
                Enrol on {t.name} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-blue" /> Registration first — confirmed payment instantly generates your admission letter and student portal.</p>
      </div>
    </section>
  )
}

function Assessment({ c }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', voiceType: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch('/api/assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (r.ok) { toast.success(d.message || 'Request received!'); setForm({ name: '', email: '', phone: '', voiceType: '', notes: '' }) }
      else toast.error(d.error || 'Something went wrong')
    } catch { toast.error('Network error') } finally { setBusy(false) }
  }
  return (
    <section id="assessment" className="py-24 bg-brand-navy relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
        <img src={c.media.assessment} alt="Studio microphone" className="w-full h-full object-cover" />
      </div>
      <div className="container relative z-10 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <SectionTitle light eyebrow="Vocal Assessment" title="Discover Your Voice Type" sub="Book a complimentary vocal assessment. We will evaluate your range, tone and technique and recommend the right starting point for you." />
          <ul className="mt-8 space-y-3">
            {['Range & register evaluation', 'Tone & breath analysis', 'Personalised recommendations'].map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/85"><CheckCircle2 className="h-5 w-5 text-brand-gold-light" />{f}</li>
            ))}
          </ul>
        </div>
        <Card className="p-7">
          <p className="font-display text-2xl font-semibold text-brand-navy">Request Your Assessment</p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
              <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5" /></div>
              <div><Label>Voice type (if known)</Label><Input placeholder="Soprano, Tenor..." value={form.voiceType} onChange={(e) => setForm({ ...form, voiceType: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div><Label>Tell us about your goals</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5" /></div>
            <Button disabled={busy} className="w-full h-12 bg-brand-blue hover:bg-brand-blue-dark font-semibold">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Book Free Assessment'}</Button>
          </form>
        </Card>
      </div>
    </section>
  )
}

function Founder({ c }) {
  return (
    <section id="founder" className="py-24 bg-white">
      <div className="container grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -inset-4 brand-gradient rounded-3xl rotate-2 opacity-90" />
          <img src={c.media.founder} alt={c.founder.name} className="relative rounded-3xl w-full object-cover bg-brand-navy shadow-2xl" />
        </div>
        <div className="order-1 lg:order-2">
          <SectionTitle eyebrow="Meet The Founder" title={c.founder.name} />
          <p className="text-brand-red font-semibold mt-2">{c.founder.role}</p>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            {c.founder.bio1}
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {c.founder.bio2}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[[Award, 'Expert', 'Coaching'], [Users, 'Mentor', 'To Many'], [Music2, 'Director', 'Vox Magic']].map(([Icon, a, b]) => (
              <div key={a} className="rounded-2xl bg-brand-cream p-4 text-center">
                <Icon className="h-6 w-6 mx-auto text-brand-purple" />
                <p className="font-semibold mt-2 text-brand-navy text-sm">{a}</p>
                <p className="text-xs text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Faculty({ c }) {
  return (
    <section className="py-24 bg-brand-cream">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <SectionTitle eyebrow="Faculty & Instructors" title="Learn From The Best" />
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {c.faculty.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border card-hover">
              <div className="aspect-[4/5] brand-gradient flex items-center justify-center overflow-hidden">
                {f.img ? <img src={f.img} alt={f.name} className="w-full h-full object-cover" /> : <Mic2 className="h-16 w-16 text-white/60" />}
              </div>
              <div className="p-5">
                <Badge className="bg-brand-red/10 text-brand-red hover:bg-brand-red/10">{f.tag}</Badge>
                <p className="font-display text-lg font-semibold mt-2 text-brand-navy">{f.name}</p>
                <p className="text-sm text-muted-foreground">{f.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Events({ c }) {
  return (
    <section id="events" className="py-24 bg-white">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 items-end">
          <SectionTitle eyebrow="Events & Masterclasses" title="Grow On Stage" sub="Regular masterclasses, performance labs and guest sessions to sharpen your craft." />
        </div>
        <div className="mt-14 grid lg:grid-cols-3 gap-6">
          {c.events.map((e, i) => (
            <div key={i} className="group rounded-3xl overflow-hidden border card-hover">
              <div className="h-44 relative overflow-hidden">
                <img src={c.media.events} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent" />
                <Badge className="absolute top-4 left-4 bg-white text-brand-purple hover:bg-white">{e.mode}</Badge>
              </div>
              <div className="p-6">
                <p className="flex items-center gap-2 text-sm text-brand-red font-medium"><CalendarDays className="h-4 w-4" /> {e.date}</p>
                <p className="font-display text-xl font-semibold mt-2 text-brand-navy">{e.title}</p>
                <p className="text-sm text-muted-foreground mt-2">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials({ c }) {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="absolute inset-0">
        <img src={c.media.testimonials} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-brand-navy/90" />
      </div>
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center">
          <SectionTitle light eyebrow="Testimonials" title="Voices We’ve Transformed" />
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {c.testimonials.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-7 text-white">
              <Quote className="h-9 w-9 text-brand-gold-light" />
              <p className="mt-4 text-white/90 leading-relaxed">{t.text}</p>
              <div className="flex mt-5 gap-0.5">{[...Array(5)].map((_, k) => <Star key={k} className="h-4 w-4 fill-brand-gold-light text-brand-gold-light" />)}</div>
              <div className="mt-4">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-white/60">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Resources({ c }) {
  return (
    <section id="resources" className="py-24 bg-brand-cream">
      <div className="container">
        <SectionTitle eyebrow="Resources / Blog" title="Sing Smarter" sub="Free tips, techniques and vocal health insights from our coaches." />
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {c.blog.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 card-hover">
              <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">{b.tag}</Badge>
              <p className="font-display text-xl font-semibold mt-4 text-brand-navy">{b.title}</p>
              {b.excerpt && <p className="text-sm text-muted-foreground mt-2">{b.excerpt}</p>}
              <div className="flex items-center justify-between mt-5">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><BookOpen className="h-4 w-4" /> {b.read} read</span>
                <ChevronRight className="h-5 w-5 text-brand-red" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ({ c }) {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <SectionTitle eyebrow="FAQ" title="Questions, Answered" />
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {c.faq.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`}>
              <AccordionTrigger className="text-left font-medium text-brand-navy">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

function Contact({ c }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (r.ok) { toast.success(d.message || 'Message sent!'); setForm({ name: '', email: '', subject: '', message: '' }) }
      else toast.error(d.error || 'Something went wrong')
    } catch { toast.error('Network error') } finally { setBusy(false) }
  }
  return (
    <section id="contact" className="py-24 bg-brand-cream">
      <div className="container grid lg:grid-cols-2 gap-14">
        <div>
          <SectionTitle eyebrow="Contact" title="Let’s Talk" sub="Have a question about enrolment, tuition or the programme? We would love to hear from you." />
          <div className="mt-8 space-y-5">
            {[[Mail, 'Email', c.brand.email], [Phone, 'Phone', c.brand.phone], [MapPin, 'Location', c.brand.location]].map(([Icon, a, b]) => (
              <div key={a} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl brand-gradient flex items-center justify-center"><Icon className="h-5 w-5 text-white" /></div>
                <div><p className="text-sm text-muted-foreground">{a}</p><p className="font-medium text-brand-navy">{b}</p></div>
              </div>
            ))}
          </div>
        </div>
        <Card className="p-7">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
              <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Message</Label><Textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5" /></div>
            <Button disabled={busy} className="w-full h-12 bg-brand-purple hover:bg-brand-purple-light font-semibold">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Message'}</Button>
          </form>
        </Card>
      </div>
    </section>
  )
}

function Footer({ setView, openLegal, c }) {
  const socials = [[Instagram, c.brand.socials.instagram], [Facebook, c.brand.socials.facebook], [Youtube, c.brand.socials.youtube], [Twitter, c.brand.socials.twitter]]
  return (
    <footer className="bg-brand-navy-deep text-white pt-16 pb-8">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="bg-white inline-block rounded-xl p-3"><Logo className="h-12" /></div>
            <p className="mt-5 text-white/60 max-w-sm">The Vocal Music Department of Damichromes School of Music Limited (DSML). {c.brand.tagline}.</p>
            <div className="flex gap-3 mt-6">
              {socials.map(([Icon, href], i) => (
                <a key={i} href={href || '#'} className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-white/20"><Icon className="h-4 w-4" /></a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold mb-4">Explore</p>
            <ul className="space-y-2 text-white/60 text-sm">
              {NAV.slice(0, 6).map((n) => <li key={n.id}><button onClick={() => scrollToId(n.id)} className="hover:text-white">{n.label}</button></li>)}
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-4">Get Started</p>
            <ul className="space-y-2 text-white/60 text-sm">
              <li><button onClick={() => setView('apply')} className="hover:text-white">Apply / Enrol</button></li>
              <li><button onClick={() => setView('login')} className="hover:text-white">Student Login</button></li>
              <li><button onClick={() => setView('admin')} className="hover:text-white">Staff & Admin Portal</button></li>
              <li><button onClick={() => openLegal('terms')} className="hover:text-white">Terms of Service</button></li>
              <li><button onClick={() => openLegal('privacy')} className="hover:text-white">Privacy Policy</button></li>
              <li><button onClick={() => openLegal('refund')} className="hover:text-white">Refund Policy</button></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8 bg-white/10" />
        <p className="text-center text-white/40 text-sm">&copy; {new Date().getFullYear()} Vox Magic — Damichromes School of Music Limited (DSML). All rights reserved.</p>
      </div>
    </footer>
  )
}

// -------------------------- Apply / Enrol ---------------------------------
function ApplyView({ setView }) {
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '', location: '', track: 'online', experience: 'Beginner', goals: '', hearAbout: '' })
  const upd = (k, v) => setForm({ ...form, [k]: v })

  const submit = async () => {
    if (!form.name || !form.email) { toast.error('Please enter your name and email'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (!r.ok) { toast.error(d.error || 'Could not submit application'); setBusy(false); return }
      const appId = d.application.id
      const pr = await fetch('/api/payments/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'registration', applicationId: appId }) })
      const pd = await pr.json()
      if (pr.ok && pd.link) { window.location.assign(pd.link); return }
      if (pd.error === 'PAYMENT_NOT_CONFIGURED') { toast.error('Payment gateway not configured yet. Please add the Flutterwave key to enable payments.'); setBusy(false); return }
      toast.error(pd.error || 'Could not start payment'); setBusy(false)
    } catch { toast.error('Network error'); setBusy(false) }
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-28 pb-16">
      <div className="container max-w-2xl">
        <button onClick={() => setView('home')} className="text-sm text-brand-purple mb-4">&larr; Back to Home</button>
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-brand-purple" />
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-navy">Apply / Enrol</h1>
              <p className="text-sm text-muted-foreground">Vocal Transformation Program • 3 Months</p>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            {[1, 2, 3].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-brand-purple' : 'bg-muted'}`} />)}
          </div>

          {step === 1 && (
            <div className="mt-6 space-y-4">
              <p className="font-medium text-brand-navy">Your details</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Full name *</Label><Input value={form.name} onChange={(e) => upd('name', e.target.value)} className="mt-1.5" /></div>
                <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} className="mt-1.5" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => upd('phone', e.target.value)} className="mt-1.5" /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => upd('location', e.target.value)} className="mt-1.5" /></div>
              </div>
              <Button onClick={() => { if (!form.name || !form.email) { toast.error('Enter name and email'); return } setStep(2) }} className="w-full h-12 bg-brand-purple hover:bg-brand-purple-light">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 space-y-4">
              <p className="font-medium text-brand-navy">Choose your track</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[{ k: 'online', n: 'Online', p: 80000 }, { k: 'hybrid', n: 'Hybrid', p: 130000 }].map((t) => (
                  <button key={t.k} onClick={() => upd('track', t.k)} className={`text-left rounded-2xl border-2 p-5 transition ${form.track === t.k ? 'border-brand-purple bg-brand-purple/5' : 'border-border'}`}>
                    <p className="font-display text-xl font-semibold text-brand-navy">{t.n} Track</p>
                    <p className="text-brand-red font-semibold mt-1">{NAIRA(t.p)} tuition</p>
                    <p className="text-xs text-muted-foreground mt-1">Or two instalments of {NAIRA(t.p / 2)}</p>
                  </button>
                ))}
              </div>
              <div><Label>Singing experience</Label>
                <select value={form.experience} onChange={(e) => upd('experience', e.target.value)} className="mt-1.5 w-full h-11 rounded-md border border-input px-3 bg-background">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Professional</option>
                </select>
              </div>
              <div><Label>What are your goals?</Label><Textarea rows={3} value={form.goals} onChange={(e) => upd('goals', e.target.value)} className="mt-1.5" /></div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-12 bg-brand-purple hover:bg-brand-purple-light">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 space-y-5">
              <p className="font-medium text-brand-navy">Confirm & pay registration</p>
              <div className="rounded-2xl border p-5 bg-brand-cream">
                <div className="flex justify-between text-sm py-1"><span className="text-muted-foreground">Applicant</span><span className="font-medium">{form.name || '—'}</span></div>
                <div className="flex justify-between text-sm py-1"><span className="text-muted-foreground">Track</span><span className="font-medium capitalize">{form.track}</span></div>
                <div className="flex justify-between text-sm py-1"><span className="text-muted-foreground">Tuition (later)</span><span className="font-medium">{NAIRA(form.track === 'hybrid' ? 130000 : 80000)}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center py-1"><span className="font-semibold text-brand-navy">Registration fee (now)</span><span className="font-display text-2xl font-bold text-brand-purple">{NAIRA(20000)}</span></div>
              </div>
              <p className="text-xs text-muted-foreground flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" /> Secure payment via Flutterwave. On confirmation, your admission letter and student portal are created instantly, then you choose full or 50/50 tuition payment.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">Back</Button>
                <Button disabled={busy} onClick={submit} className="flex-1 h-12 bg-brand-red hover:bg-brand-red-light font-semibold">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Pay {NAIRA(20000)} <Wallet className="ml-2 h-4 w-4" /></>}</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// -------------------------- Login -----------------------------------------
function LoginView({ setView, onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      if (r.ok) { localStorage.setItem('vm_token', d.token); toast.success('Welcome back!'); onLogin() }
      else toast.error(d.error || 'Invalid credentials')
    } catch { toast.error('Network error') } finally { setBusy(false) }
  }
  return (
    <div className="min-h-screen brand-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-2"><Logo className="h-14" /></div>
        <h1 className="font-display text-2xl font-bold text-center text-brand-navy">Student Portal</h1>
        <p className="text-center text-sm text-muted-foreground mt-1">Sign in with the credentials from your admission email.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Password</Label><Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5" /></div>
          <Button disabled={busy} className="w-full h-12 bg-brand-purple hover:bg-brand-purple-light font-semibold">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}</Button>
        </form>
        <div className="flex justify-between mt-5 text-sm">
          <button onClick={() => setView('home')} className="text-muted-foreground hover:text-brand-navy">&larr; Home</button>
          <button onClick={() => setView('apply')} className="text-brand-red font-medium">New here? Apply</button>
        </div>
      </Card>
    </div>
  )
}

// -------------------------- Portal ----------------------------------------
function AdmissionLetter({ letter, student }) {
  return (
    <div className="bg-white rounded-2xl border p-8 md:p-10" id="admission-letter">
      <div className="flex items-center justify-between border-b pb-5">
        <Logo className="h-14" />
        <div className="text-right text-xs text-muted-foreground">
          <p className="font-semibold text-brand-navy">Admission No.</p>
          <p>{letter.admissionNo}</p>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{new Date(letter.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <h2 className="font-display text-2xl font-bold text-brand-navy mt-4">Letter of Admission</h2>
      <p className="mt-4">Dear <span className="font-semibold">{letter.studentName}</span>,</p>
      <p className="mt-4 text-muted-foreground leading-relaxed">{letter.body}</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl bg-brand-cream p-4"><p className="text-muted-foreground">Programme</p><p className="font-semibold text-brand-navy">{letter.program}</p></div>
        <div className="rounded-xl bg-brand-cream p-4"><p className="text-muted-foreground">Duration</p><p className="font-semibold text-brand-navy">{letter.duration}</p></div>
        <div className="rounded-xl bg-brand-cream p-4"><p className="text-muted-foreground">Cohort Start</p><p className="font-semibold text-brand-navy">{letter.cohortStart}</p></div>
        <div className="rounded-xl bg-brand-cream p-4"><p className="text-muted-foreground">Expected Completion</p><p className="font-semibold text-brand-navy">{letter.cohortEnd}</p></div>
      </div>
      <div className="mt-8">
        <p className="font-display text-xl text-brand-purple">{letter.signatory}</p>
        <p className="text-sm text-muted-foreground">{letter.signatoryTitle}</p>
      </div>
      <div className="mt-6 pt-5 border-t text-center text-xs text-muted-foreground">Vox Magic — Damichromes School of Music Limited (DSML) • Cast The Spell With The Rhythm</div>
    </div>
  )
}

function PortalView({ setView }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [lms, setLms] = useState(null)
  const [payBusy, setPayBusy] = useState('')

  const token = () => localStorage.getItem('vm_token')

  const loadLms = async () => {
    try {
      const r = await fetch('/api/lms', { headers: { Authorization: `Bearer ${token()}` } })
      if (r.ok) setLms(await r.json())
    } catch {}
  }

  const load = async () => {
    const t = token()
    if (!t) { setView('login'); return }
    try {
      const r = await fetch('/api/students/me', { headers: { Authorization: `Bearer ${t}` } })
      if (r.status === 401) { localStorage.removeItem('vm_token'); setView('login'); return }
      const d = await r.json(); setData(d)
      await loadLms()
    } catch { toast.error('Could not load portal') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token()}` } }) } catch {}
    localStorage.removeItem('vm_token'); setView('home')
  }

  const payTuition = async (plan) => {
    setPayBusy(plan)
    try {
      const r = await fetch('/api/payments/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ plan }) })
      const d = await r.json()
      if (r.ok && d.link) { window.location.assign(d.link); return }
      if (d.error === 'PAYMENT_NOT_CONFIGURED') toast.error('Payment gateway not configured yet.')
      else toast.error(d.error || 'Could not start payment')
    } catch { toast.error('Network error') } finally { setPayBusy('') }
  }

  const toggleLesson = async (lessonId, done) => {
    try {
      await fetch('/api/lms/lesson/complete', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ lessonId, done }) })
      await loadLms()
    } catch { toast.error('Could not update lesson') }
  }

  const attend = async (sessionId, joinUrl) => {
    try {
      await fetch('/api/lms/session/attend', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ sessionId }) })
      if (joinUrl && joinUrl !== '#') window.open(joinUrl, '_blank')
      await loadLms()
      toast.success('Attendance marked')
    } catch { toast.error('Could not mark attendance') }
  }

  const submitAssignment = async (assignmentId, content) => {
    try {
      const r = await fetch('/api/lms/assignment/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ assignmentId, content }) })
      const d = await r.json()
      if (r.ok) { toast.success(d.message || 'Submitted'); await loadLms() }
      else toast.error(d.error || 'Could not submit')
    } catch { toast.error('Network error') }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-brand-purple" /></div>
  if (!data) return null
  const { student, tuition, payments } = data

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="brand-gradient text-white">
        <div className="container flex items-center justify-between py-4 no-print">
          <div className="bg-white rounded-lg p-2"><Logo className="h-9" /></div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80 hidden sm:block">{student.name}</span>
            <Button size="sm" variant="outline" onClick={logout} className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"><LogOut className="h-4 w-4 mr-1.5" /> Logout</Button>
          </div>
        </div>
      </div>
      <div className="container py-8 max-w-6xl">
        <h1 className="font-display text-3xl font-bold text-brand-navy">Welcome, {student.name.split(' ')[0]} 🎵</h1>
        <p className="text-muted-foreground">Vocal Transformation Program • Admission {student.admissionNo}</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-muted-foreground">Course Progress</p><p className="font-display text-xl font-semibold text-brand-purple">{lms ? `${lms.progress.percent}%` : '—'}</p></div>
          <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-muted-foreground">Track</p><p className="font-display text-xl font-semibold text-brand-navy capitalize">{tuition.track || 'Not selected'}</p></div>
          <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-muted-foreground">Tuition</p><p className={`font-display text-xl font-semibold capitalize ${tuition.status === 'paid' ? 'text-emerald-600' : tuition.status === 'partial' ? 'text-amber-600' : 'text-brand-red'}`}>{tuition.status}</p></div>
          <div className="bg-white rounded-2xl border p-5"><p className="text-sm text-muted-foreground">Live Classes Attended</p><p className="font-display text-xl font-semibold text-brand-navy">{lms ? lms.attendanceCount : 0}</p></div>
        </div>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="bg-white border flex flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="live">Live Classes</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="certificate">Certificate</TabsTrigger>
            <TabsTrigger value="tuition">Tuition</TabsTrigger>
            <TabsTrigger value="admission">Admission</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {lms ? <LmsOverview lms={lms} /> : <LmsLoading />}
          </TabsContent>
          <TabsContent value="lessons" className="mt-6">
            {lms ? <LessonsPanel lms={lms} toggleLesson={toggleLesson} /> : <LmsLoading />}
          </TabsContent>
          <TabsContent value="live" className="mt-6">
            {lms ? <SchedulePanel lms={lms} attend={attend} /> : <LmsLoading />}
          </TabsContent>
          <TabsContent value="assignments" className="mt-6">
            {lms ? <AssignmentsPanel lms={lms} submitAssignment={submitAssignment} /> : <LmsLoading />}
          </TabsContent>
          <TabsContent value="resources" className="mt-6">
            {lms ? <ResourcesPanel lms={lms} /> : <LmsLoading />}
          </TabsContent>
          <TabsContent value="certificate" className="mt-6">
            {lms ? <CertificatePanel lms={lms} student={student} /> : <LmsLoading />}
          </TabsContent>
          <TabsContent value="tuition" className="mt-6">
            <TuitionPanel tuition={tuition} payments={payments} payTuition={payTuition} payBusy={payBusy} />
          </TabsContent>
          <TabsContent value="admission" className="mt-6">
            {student.admissionLetter ? (
              <div>
                <div className="flex justify-end mb-3 no-print"><Button onClick={() => window.print()} variant="outline"><Download className="h-4 w-4 mr-2" /> Download / Print</Button></div>
                <AdmissionLetter letter={student.admissionLetter} student={student} />
              </div>
            ) : <p className="text-muted-foreground">Your admission letter will appear here after registration is confirmed.</p>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function LmsLoading() {
  return <div className="flex items-center gap-2 text-muted-foreground py-10"><Loader2 className="h-5 w-5 animate-spin" /> Loading your classroom…</div>
}

function LmsOverview({ lms }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xl font-semibold text-brand-navy">Your Progress</p>
            <p className="text-sm text-muted-foreground">{lms.progress.done} of {lms.progress.total} lessons completed</p>
          </div>
          <p className="font-display text-3xl font-bold text-brand-purple">{lms.progress.percent}%</p>
        </div>
        <Progress value={lms.progress.percent} className="mt-4 h-3" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border p-6">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-brand-navy"><Megaphone className="h-5 w-5 text-brand-red" /> Announcements</p>
          <div className="mt-4 space-y-4">
            {lms.announcements.map((a) => (
              <div key={a.id} className="border-l-2 border-brand-purple pl-3">
                <p className="font-medium text-brand-navy">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.date}</p>
                <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border p-6">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-brand-navy"><Radio className="h-5 w-5 text-brand-blue" /> Next Live Classes</p>
          <div className="mt-4 space-y-3">
            {lms.schedule.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-navy text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.date} • {s.time}</p>
                </div>
                <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">{s.mode}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LessonsPanel({ lms, toggleLesson }) {
  const [active, setActive] = useState(null)
  return (
    <div className="space-y-6">
      {lms.modules.map((m) => {
        const done = m.lessons.filter((l) => l.completed).length
        return (
          <div key={m.id} className="bg-white rounded-2xl border overflow-hidden">
            <div className="brand-gradient text-white p-5 flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-semibold">{m.title}</p>
                <p className="text-white/70 text-sm">{m.weeks}</p>
              </div>
              <Badge className="bg-white/15 text-white hover:bg-white/15">{done}/{m.lessons.length} done</Badge>
            </div>
            <div className="divide-y">
              {m.lessons.map((l) => (
                <div key={l.id} className="p-5 flex items-start gap-4">
                  <button onClick={() => toggleLesson(l.id, !l.completed)} className="mt-0.5">
                    <CheckCircle2 className={`h-6 w-6 ${l.completed ? 'text-emerald-500 fill-emerald-100' : 'text-muted-foreground/40'}`} />
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${l.completed ? 'text-muted-foreground line-through' : 'text-brand-navy'}`}>{l.title}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><Clock className="h-3.5 w-3.5" /> {l.duration}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button size="sm" className="bg-brand-blue hover:bg-brand-blue-dark" onClick={() => setActive(l)}>
                        <PlayCircle className="h-4 w-4 mr-1.5" /> Watch Lesson
                      </Button>
                      {l.resources?.map((r) => (
                        <Button key={r.name} size="sm" variant="ghost" className="text-brand-blue" onClick={() => toast.info('Resource download coming soon.')}>
                          <FolderOpen className="h-4 w-4 mr-1.5" /> {r.name}
                        </Button>
                      ))}
                      {!l.completed && <Button size="sm" variant="outline" onClick={() => toggleLesson(l.id, true)}>Mark complete</Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle className="font-display text-xl text-brand-navy">{active?.title}</DialogTitle></DialogHeader>
          {active && (
            <div>
              <div className="rounded-xl overflow-hidden bg-black">
                <video key={active.id} controls autoPlay className="w-full aspect-video" src={fileHref(active.video, localStorage.getItem('vm_token'))}>
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground mt-3"><Clock className="h-3.5 w-3.5" /> {active.duration}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {active.resources?.map((r) => (
                  <Button key={r.name} size="sm" variant="ghost" className="text-brand-blue" onClick={() => toast.info('Resource download coming soon.')}>
                    <FolderOpen className="h-4 w-4 mr-1.5" /> {r.name}
                  </Button>
                ))}
                {!active.completed && (
                  <Button size="sm" className="bg-brand-purple hover:bg-brand-purple-light" onClick={() => { toggleLesson(active.id, true); setActive(null) }}>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SchedulePanel({ lms, attend }) {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {lms.schedule.map((s) => (
        <div key={s.id} className="bg-white rounded-2xl border p-6 card-hover">
          <div className="h-12 w-12 rounded-xl brand-gradient flex items-center justify-center"><Video className="h-6 w-6 text-white" /></div>
          <p className="font-display text-lg font-semibold mt-4 text-brand-navy">{s.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{s.date} • {s.time}</p>
          <Badge className="mt-3 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">{s.mode}</Badge>
          <Button className="w-full mt-4 bg-brand-red hover:bg-brand-red-light" onClick={() => attend(s.id, s.joinUrl)}>
            <Radio className="h-4 w-4 mr-2" /> Join Live Class
          </Button>
          {s.attended && <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Attendance marked</p>}
        </div>
      ))}
    </div>
  )
}

function AssignmentsPanel({ lms, submitAssignment }) {
  const [inputs, setInputs] = useState({})
  return (
    <div className="space-y-5">
      {lms.assignments.map((a) => (
        <div key={a.id} className="bg-white rounded-2xl border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className="bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/10">{a.module}</Badge>
              <p className="font-display text-lg font-semibold mt-2 text-brand-navy">{a.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{a.instructions}</p>
              <p className="text-xs text-brand-red mt-1">Due: {a.due}</p>
            </div>
            <ClipboardList className="h-6 w-6 text-brand-blue shrink-0" />
          </div>
          {a.submission ? (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-sm text-emerald-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Submitted</p>
              <p className="text-sm text-muted-foreground mt-1 break-all">{a.submission.content}</p>
              {a.submission.grade ? <p className="text-sm font-medium text-brand-navy mt-2">Grade: {a.submission.grade}</p> : <p className="text-xs text-muted-foreground mt-2">Awaiting grading by your coach.</p>}
            </div>
          ) : (
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Input placeholder="Paste your submission link (Drive/YouTube)…" value={inputs[a.id] || ''} onChange={(e) => setInputs({ ...inputs, [a.id]: e.target.value })} />
              <Button className="bg-brand-blue hover:bg-brand-blue-dark shrink-0" onClick={() => { if (!inputs[a.id]) { toast.error('Enter a submission link'); return } submitAssignment(a.id, inputs[a.id]) }}>
                <Send className="h-4 w-4 mr-1.5" /> Submit
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ResourcesPanel({ lms }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {lms.resources.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl border p-5 flex items-center justify-between card-hover">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-brand-purple/10 flex items-center justify-center"><FolderOpen className="h-5 w-5 text-brand-purple" /></div>
            <div>
              <p className="font-medium text-brand-navy">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.type}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => { if (r.url && r.url !== '#') window.open(fileHref(r.url, localStorage.getItem('vm_token')), '_blank'); else toast.info('This resource will be available shortly.') }}><Download className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  )
}

function CertificatePanel({ lms, student }) {
  if (!lms.certificateEligible) {
    return (
      <div className="bg-white rounded-2xl border p-10 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto"><Lock className="h-7 w-7 text-muted-foreground" /></div>
        <p className="font-display text-xl font-semibold mt-4 text-brand-navy">Certificate Locked</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Complete all lessons ({lms.progress.percent}% done) and ensure your tuition is fully paid to unlock your Vox Magic certificate of completion.</p>
      </div>
    )
  }
  return (
    <div>
      <div className="flex justify-end mb-3 no-print"><Button onClick={() => window.print()} variant="outline"><Download className="h-4 w-4 mr-2" /> Download / Print</Button></div>
      <div className="bg-white rounded-2xl border-4 border-brand-gold p-10 text-center" id="certificate">
        <Logo className="h-16 mx-auto" />
        <p className="tracking-[0.3em] text-xs text-brand-red mt-6 uppercase">Certificate of Completion</p>
        <div className="gold-rule mx-auto my-5" />
        <p className="text-muted-foreground">This certifies that</p>
        <p className="font-display text-4xl font-bold text-brand-navy mt-2">{student.name}</p>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">has successfully completed the <span className="font-semibold text-brand-purple">Vocal Transformation Program</span> at Vox Magic — the Vocal Music Department of Damichromes School of Music Limited (DSML).</p>
        <div className="mt-10 flex items-center justify-center gap-12">
          <div><p className="font-display text-xl text-brand-purple">Damian Nworgu</p><p className="text-xs text-muted-foreground">Vocal Coach / Music Director</p></div>
          <Award className="h-12 w-12 text-brand-gold" />
        </div>
      </div>
    </div>
  )
}


function TuitionPanel({ tuition, payments, payTuition, payBusy }) {
  const noTrack = !tuition.track
  const half = tuition.track === 'hybrid' ? 65000 : 40000
  const fullPlan = tuition.track === 'hybrid' ? 'tuition_hybrid_full' : 'tuition_online_full'
  const halfPlan = tuition.track === 'hybrid' ? 'tuition_hybrid_half' : 'tuition_online_half'

  return (
    <div className="space-y-6">
      {tuition.status === 'paid' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          <div><p className="font-display text-xl font-semibold text-emerald-800">Tuition Fully Paid</p><p className="text-sm text-emerald-700">You are fully enrolled. Welcome to Vox Magic!</p></div>
        </div>
      )}

      {noTrack && (
        <div>
          <p className="font-medium text-brand-navy mb-3">Choose your tuition track to continue enrolment</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {[{ n: 'Online', total: 80000, full: 'tuition_online_full', half: 'tuition_online_half', h: 40000 }, { n: 'Hybrid', total: 130000, full: 'tuition_hybrid_full', half: 'tuition_hybrid_half', h: 65000 }].map((t) => (
              <div key={t.n} className="bg-white rounded-2xl border p-6">
                <p className="font-display text-xl font-semibold text-brand-navy">{t.n} Track</p>
                <p className="font-display text-3xl font-bold text-brand-purple mt-2">{NAIRA(t.total)}</p>
                <div className="mt-4 space-y-2">
                  <Button disabled={!!payBusy} onClick={() => payTuition(t.full)} className="w-full bg-brand-blue hover:bg-brand-blue-dark">{payBusy === t.full ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay in full — ${NAIRA(t.total)}`}</Button>
                  <Button disabled={!!payBusy} onClick={() => payTuition(t.half)} variant="outline" className="w-full">{payBusy === t.half ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay 50% now — ${NAIRA(t.h)}`}</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!noTrack && tuition.status !== 'paid' && (
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div><p className="text-sm text-muted-foreground">Total tuition ({tuition.track})</p><p className="font-display text-2xl font-bold text-brand-navy">{NAIRA(tuition.total)}</p></div>
            <div><p className="text-sm text-muted-foreground">Paid</p><p className="font-display text-2xl font-bold text-emerald-600">{NAIRA(tuition.paid)}</p></div>
            <div><p className="text-sm text-muted-foreground">Balance</p><p className="font-display text-2xl font-bold text-brand-red">{NAIRA(tuition.balance)}</p></div>
          </div>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            {tuition.status === 'partial'
              ? <Button disabled={!!payBusy} onClick={() => payTuition(halfPlan)} className="bg-brand-red hover:bg-brand-red-light">{payBusy === halfPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay remaining ${NAIRA(tuition.balance)}`}</Button>
              : <>
                  <Button disabled={!!payBusy} onClick={() => payTuition(fullPlan)} className="bg-brand-blue hover:bg-brand-blue-dark">{payBusy === fullPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay in full ${NAIRA(tuition.total)}`}</Button>
                  <Button disabled={!!payBusy} onClick={() => payTuition(halfPlan)} variant="outline">{payBusy === halfPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay 50% ${NAIRA(half)}`}</Button>
                </>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border p-6">
        <p className="font-medium text-brand-navy mb-4">Payment history</p>
        {payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div><p className="font-medium text-brand-navy capitalize">{p.kind} {p.part ? `(${p.part})` : ''}</p><p className="text-xs text-muted-foreground">{p.tx_ref}</p></div>
                <div className="text-right"><p className="font-semibold">{NAIRA(p.amount)}</p><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Paid</Badge></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------- Legal -----------------------------------------
const LEGAL = {
  terms: { title: 'Terms of Service', body: 'By enrolling with Vox Magic (DSML) you agree to attend scheduled classes, respect faculty and fellow students, and abide by our code of conduct. Registration fees confirm your place and are subject to our refund policy. Tuition grants access to programme materials for the enrolled cohort only.' },
  privacy: { title: 'Privacy Policy', body: 'We collect only the information necessary to process your application, payments and enrolment. Your data is stored securely and never sold. Payment processing is handled by Flutterwave; we do not store card details.' },
  refund: { title: 'Refund Policy', body: 'The registration fee is non-refundable once your admission letter and portal have been generated. Tuition refunds may be considered within 7 days of payment, less any classes attended, at the discretion of the management.' },
}

// -------------------------- Admin / Staff Portal --------------------------
function AdminView({ setView }) {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [staff, setStaff] = useState(null)
  const [creds, setCreds] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [data, setData] = useState({ stats: null, applications: [], students: [], payments: [], submissions: [], cohorts: [], announcements: [], content: null, lmsConfig: null, paymentSettings: null, emailSettings: null, storageSettings: null, auditLogs: [] })

  const atoken = () => localStorage.getItem('vm_admin_token')
  const api = (path, opts = {}) => fetch(`/api/admin/${path}`, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${atoken()}`, ...(opts.headers || {}) } })

  const loadAll = async () => {
    try {
      const keys = ['overview', 'applications', 'students', 'payments', 'submissions', 'cohorts', 'announcements', 'content', 'lms', 'payment-settings', 'email-settings', 'storage-settings', 'audit-logs']
      const res = await Promise.all(keys.map((k) => api(k).then((r) => r.ok ? r.json() : {})))
      setData({
        stats: res[0].stats || null,
        applications: res[1].applications || [],
        students: res[2].students || [],
        payments: res[3].payments || [],
        submissions: res[4].submissions || [],
        cohorts: res[5].cohorts || [],
        announcements: res[6].announcements || [],
        content: res[7].content || null,
        lmsConfig: res[8].config || null,
        paymentSettings: res[9].settings || null,
        emailSettings: res[10].settings || null,
        storageSettings: res[11].settings || null,
        auditLogs: res[12].logs || [],
      })
    } catch { toast.error('Could not load admin data') }
  }

  useEffect(() => {
    (async () => {
      if (!atoken()) { setChecking(false); return }
      const r = await api('me')
      if (r.ok) { const d = await r.json(); setStaff(d.staff); setAuthed(true); await loadAll() }
      else localStorage.removeItem('vm_admin_token')
      setChecking(false)
    })()
  }, [])

  const login = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) })
      const d = await r.json()
      if (r.ok) { localStorage.setItem('vm_admin_token', d.token); setStaff(d.staff); setAuthed(true); await loadAll(); toast.success('Welcome back!') }
      else toast.error(d.error || 'Invalid credentials')
    } catch { toast.error('Network error') } finally { setBusy(false) }
  }

  const logout = () => { localStorage.removeItem('vm_admin_token'); setAuthed(false); setView('home') }

  if (checking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-brand-purple" /></div>

  if (!authed) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex justify-center mb-2"><Logo className="h-14" /></div>
          <h1 className="font-display text-2xl font-bold text-center text-brand-navy">Staff & Admin Portal</h1>
          <p className="text-center text-sm text-muted-foreground mt-1">For Vox Magic coaches and administrators.</p>
          <form onSubmit={login} className="mt-6 space-y-4">
            <div><Label>Email</Label><Input type="email" required value={creds.email} onChange={(e) => setCreds({ ...creds, email: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Password</Label><Input type="password" required value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} className="mt-1.5" /></div>
            <Button disabled={busy} className="w-full h-12 bg-brand-purple hover:bg-brand-purple-light font-semibold">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}</Button>
          </form>
          <button onClick={() => setView('home')} className="block mx-auto mt-5 text-sm text-muted-foreground hover:text-brand-navy">← Back to Home</button>
        </Card>
      </div>
    )
  }

  const s = data.stats
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-navy text-white">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3"><div className="bg-white rounded-lg p-2"><Logo className="h-8" /></div><span className="font-display text-lg">Admin Console</span></div>
          <div className="flex items-center gap-3"><span className="text-sm text-white/80 hidden sm:block">{staff?.name}</span><Button size="sm" variant="outline" onClick={logout} className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"><LogOut className="h-4 w-4 mr-1.5" /> Logout</Button></div>
        </div>
      </div>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold text-brand-navy">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          {[
            ['Applications', s?.applications ?? 0], ['Students', s?.students ?? 0],
            ['Revenue', s ? NAIRA(s.revenue) : NAIRA(0)], ['Pending Apps', s?.pendingApplications ?? 0],
            ['To Grade', s?.ungradedSubmissions ?? 0],
          ].map(([label, val]) => (
            <div key={label} className="bg-white rounded-2xl border p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="font-display text-2xl font-bold text-brand-navy">{val}</p></div>
          ))}
        </div>

        <Tabs defaultValue="students" className="mt-8">
          <TabsList className="bg-white border flex flex-wrap h-auto">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="grading">Grading</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            <TabsTrigger value="lms">LMS Manager</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="cms">Website (CMS)</TabsTrigger>
            <TabsTrigger value="payments-settings">Payment Settings</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="mt-6">
            <StudentsPanel students={data.students} cohorts={data.cohorts} api={api} reload={loadAll} />
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <AdminTable
              head={['Name', 'Email', 'Phone', 'Track', 'Status', 'Date']}
              rows={data.applications.map((a) => [a.name, a.email, a.phone || '—', a.track, a.status, new Date(a.createdAt).toLocaleDateString('en-GB')])}
              empty="No applications yet." />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <AdminTable
              head={['Ref', 'Email', 'Type', 'Amount', 'Status', 'Date']}
              rows={data.payments.map((p) => [p.tx_ref, p.email, `${p.kind}${p.part ? ' (' + p.part + ')' : ''}`, NAIRA(p.amount), <span key="s" className={p.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>{p.status}</span>, new Date(p.createdAt).toLocaleDateString('en-GB')])}
              empty="No payments yet." />
          </TabsContent>

          <TabsContent value="grading" className="mt-6">
            <GradingPanel submissions={data.submissions} api={api} reload={loadAll} />
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <AttendancePanel students={data.students} api={api} />
          </TabsContent>

          <TabsContent value="cohorts" className="mt-6">
            <CohortsPanel cohorts={data.cohorts} api={api} reload={loadAll} />
          </TabsContent>

          <TabsContent value="announcements" className="mt-6">
            <AnnouncementsPanel announcements={data.announcements} api={api} reload={loadAll} />
          </TabsContent>

          <TabsContent value="cms" className="mt-6">
            <CmsPanel content={data.content} api={api} reload={loadAll} />
          </TabsContent>

          <TabsContent value="lms" className="mt-6">
            <LmsManagerPanel config={data.lmsConfig} api={api} reload={loadAll} />
          </TabsContent>

          <TabsContent value="payments-settings" className="mt-6">
            <PaymentSettingsPanel settings={data.paymentSettings} api={api} reload={loadAll} />
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <IntegrationsPanel email={data.emailSettings} storage={data.storageSettings} api={api} reload={loadAll} />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AdminTable
              head={['When', 'Action', 'By', 'Details']}
              rows={(data.auditLogs || []).map((l) => [new Date(l.createdAt).toLocaleString('en-GB'), l.action, l.by, JSON.stringify(l.meta || {})])}
              empty="No audit entries yet." />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StudentsPanel({ students, cohorts, api, reload }) {
  const [filter, setFilter] = useState('all')
  const [busyId, setBusyId] = useState('')
  const assign = async (studentId, cohortId) => {
    setBusyId(studentId)
    try {
      const r = await api('students/assign-cohort', { method: 'POST', body: JSON.stringify({ studentId, cohortId: cohortId || null }) })
      const d = await r.json()
      if (r.ok) { toast.success(d.message || 'Updated'); reload() } else toast.error(d.error || 'Could not update')
    } catch { toast.error('Network error') } finally { setBusyId('') }
  }
  const list = filter === 'all' ? students : filter === 'none' ? students.filter((s) => !s.cohortId) : students.filter((s) => s.cohortId === filter)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border p-4">
        <span className="text-sm font-medium text-brand-navy">Filter by cohort:</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input px-3 bg-background text-sm">
          <option value="all">All students ({students.length})</option>
          <option value="none">Unassigned</option>
          {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {cohorts.length === 0 && <span className="text-sm text-muted-foreground">Tip: create cohorts in the Cohorts tab first.</span>}
      </div>
      {list.length === 0 ? <div className="bg-white rounded-2xl border p-8 text-center text-muted-foreground">No students in this view.</div> : (
        <div className="bg-white rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-brand-cream text-left">{['Name', 'Email', 'Track', 'Tuition', 'Progress', 'Cohort'].map((h) => <th key={h} className="px-4 py-3 font-semibold text-brand-navy whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {list.map((st) => (
                <tr key={st.id} className="border-t">
                  <td className="px-4 py-3 whitespace-nowrap text-brand-navy font-medium">{st.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{st.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground capitalize">{st.tuitionTrack || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><span className={st.tuitionStatus === 'paid' ? 'text-emerald-600' : st.tuitionStatus === 'partial' ? 'text-amber-600' : 'text-brand-red'}>{st.tuitionStatus}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{st.progress}%</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <select disabled={busyId === st.id} value={st.cohortId || ''} onChange={(e) => assign(st.id, e.target.value)} className="h-9 rounded-md border border-input px-2 bg-background text-sm">
                      <option value="">— Unassigned —</option>
                      {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AdminTable({ head, rows, empty }) {
  if (!rows.length) return <div className="bg-white rounded-2xl border p-8 text-center text-muted-foreground">{empty}</div>
  return (
    <div className="bg-white rounded-2xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="bg-brand-cream text-left">{head.map((h) => <th key={h} className="px-4 py-3 font-semibold text-brand-navy whitespace-nowrap">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function GradingPanel({ submissions, api, reload }) {
  const [inputs, setInputs] = useState({})
  const save = async (sub) => {
    const key = sub.studentId + sub.assignmentId
    const v = inputs[key] || {}
    if (!v.grade) { toast.error('Enter a grade'); return }
    const r = await api('submissions/grade', { method: 'POST', body: JSON.stringify({ studentId: sub.studentId, assignmentId: sub.assignmentId, grade: v.grade, feedback: v.feedback || '' }) })
    if (r.ok) { toast.success('Grade saved'); reload() } else toast.error('Could not save grade')
  }
  if (!submissions.length) return <div className="bg-white rounded-2xl border p-8 text-center text-muted-foreground">No assignment submissions yet.</div>
  return (
    <div className="space-y-4">
      {submissions.map((sub) => {
        const key = sub.studentId + sub.assignmentId
        return (
          <div key={key} className="bg-white rounded-2xl border p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium text-brand-navy">{sub.assignmentTitle}</p>
                <p className="text-sm text-muted-foreground">{sub.studentName} • {sub.studentEmail}</p>
                <a href={sub.content} target="_blank" rel="noreferrer" className="text-sm text-brand-blue break-all">{sub.content}</a>
              </div>
              {sub.grade && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 h-6">Graded: {sub.grade}</Badge>}
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Input placeholder="Grade (e.g. A, 85%)" className="sm:w-40" defaultValue={sub.grade || ''} onChange={(e) => setInputs({ ...inputs, [key]: { ...inputs[key], grade: e.target.value } })} />
              <Input placeholder="Feedback (optional)" defaultValue={sub.feedback || ''} onChange={(e) => setInputs({ ...inputs, [key]: { ...inputs[key], feedback: e.target.value } })} />
              <Button className="bg-brand-purple hover:bg-brand-purple-light shrink-0" onClick={() => save(sub)}>Save grade</Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AttendancePanel({ students, api }) {
  const SESSIONS = [{ id: 's1', name: 'Live Class: Breath & Belting' }, { id: 's2', name: 'Performance Lab' }, { id: 's3', name: 'Guest Artist Masterclass' }]
  const [studentId, setStudentId] = useState('')
  const [sessionId, setSessionId] = useState('s1')
  const [busy, setBusy] = useState(false)
  const mark = async () => {
    if (!studentId) { toast.error('Select a student'); return }
    setBusy(true)
    const r = await api('attendance', { method: 'POST', body: JSON.stringify({ studentId, sessionId }) })
    if (r.ok) toast.success('Attendance marked'); else toast.error('Could not mark attendance')
    setBusy(false)
  }
  return (
    <div className="bg-white rounded-2xl border p-6 max-w-xl">
      <p className="font-display text-lg font-semibold text-brand-navy">Mark Attendance</p>
      <div className="mt-4 space-y-4">
        <div><Label>Student</Label>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-1.5 w-full h-11 rounded-md border border-input px-3 bg-background">
            <option value="">Select a student…</option>
            {students.map((st) => <option key={st.id} value={st.id}>{st.name} ({st.email})</option>)}
          </select>
        </div>
        <div><Label>Live session</Label>
          <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="mt-1.5 w-full h-11 rounded-md border border-input px-3 bg-background">
            {SESSIONS.map((se) => <option key={se.id} value={se.id}>{se.name}</option>)}
          </select>
        </div>
        <Button disabled={busy} onClick={mark} className="bg-brand-blue hover:bg-brand-blue-dark">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark attendance'}</Button>
      </div>
    </div>
  )
}

function CohortsPanel({ cohorts, api, reload }) {
  const [form, setForm] = useState({ name: '', track: 'online', startDate: '', capacity: 20 })
  const [busy, setBusy] = useState(false)
  const create = async () => {
    if (!form.name) { toast.error('Enter a cohort name'); return }
    setBusy(true)
    const r = await api('cohorts', { method: 'POST', body: JSON.stringify(form) })
    if (r.ok) { toast.success('Cohort created'); setForm({ name: '', track: 'online', startDate: '', capacity: 20 }); reload() } else toast.error('Could not create cohort')
    setBusy(false)
  }
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl border p-6">
        <p className="font-display text-lg font-semibold text-brand-navy">New Cohort</p>
        <div className="mt-4 space-y-3">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cohort A – Q3 2026" className="mt-1.5" /></div>
          <div><Label>Track</Label>
            <select value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })} className="mt-1.5 w-full h-11 rounded-md border border-input px-3 bg-background"><option value="online">Online</option><option value="hybrid">Hybrid</option></select>
          </div>
          <div><Label>Start date</Label><Input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} placeholder="e.g. 1 August 2026" className="mt-1.5" /></div>
          <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="mt-1.5" /></div>
          <Button disabled={busy} onClick={create} className="w-full bg-brand-purple hover:bg-brand-purple-light">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create cohort'}</Button>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-3">
        {cohorts.length === 0 ? <div className="bg-white rounded-2xl border p-8 text-center text-muted-foreground">No cohorts yet.</div> : cohorts.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border p-5 flex items-center justify-between">
            <div><p className="font-medium text-brand-navy">{c.name}</p><p className="text-sm text-muted-foreground capitalize">{c.track} • Starts {c.startDate || 'TBA'}</p></div>
            <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">Cap {c.capacity}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnnouncementsPanel({ announcements, api, reload }) {
  const [form, setForm] = useState({ title: '', body: '' })
  const [busy, setBusy] = useState(false)
  const post = async () => {
    if (!form.title || !form.body) { toast.error('Enter a title and body'); return }
    setBusy(true)
    const r = await api('announcements', { method: 'POST', body: JSON.stringify(form) })
    if (r.ok) { toast.success('Announcement posted'); setForm({ title: '', body: '' }); reload() } else toast.error('Could not post announcement')
    setBusy(false)
  }
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl border p-6">
        <p className="font-display text-lg font-semibold text-brand-navy">Post Announcement</p>
        <div className="mt-4 space-y-3">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" /></div>
          <div><Label>Message</Label><Textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="mt-1.5" /></div>
          <Button disabled={busy} onClick={post} className="w-full bg-brand-purple hover:bg-brand-purple-light">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post to all students'}</Button>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-3">
        {announcements.length === 0 ? <div className="bg-white rounded-2xl border p-8 text-center text-muted-foreground">No announcements yet.</div> : announcements.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border p-5">
            <p className="font-medium text-brand-navy">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.date}</p>
            <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}


// -------------------------- CMS Editors -----------------------------------
async function uploadFile(file) {
  const token = localStorage.getItem('vm_admin_token')
  const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  const d = await res.json()
  if (!res.ok) throw new Error(d.error || 'Upload failed')
  return d.url
}

// Build a viewable URL: private blob files are served through our authenticated proxy
function fileHref(url, sessionToken) {
  if (!url) return url
  if (typeof url === 'string' && url.includes('blob.vercel-storage.com')) {
    return `/api/file?u=${encodeURIComponent(url)}&t=${encodeURIComponent(sessionToken || '')}`
  }
  return url
}

function UploadButton({ onDone, accept, label = 'Upload' }) {
  const [busy, setBusy] = useState(false)
  return (
    <label className="inline-flex items-center gap-1.5 text-sm text-brand-blue cursor-pointer border rounded-md px-3 h-9 hover:bg-brand-blue/5 whitespace-nowrap">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {busy ? 'Uploading…' : label}
      <input type="file" accept={accept} className="hidden" disabled={busy} onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return; setBusy(true)
        try { const url = await uploadFile(f); onDone(url); toast.success('File uploaded') }
        catch (err) { toast.error(err?.message?.includes('Unauthorized') ? 'Session expired — please re-login' : (err?.message || 'Upload failed')) }
        finally { setBusy(false); e.target.value = '' }
      }} />
    </label>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={value ?? ''} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} className="mt-1" />
    </div>
  )
}
function AreaField({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="mt-1" />
    </div>
  )
}
function ImageField({ label, value, onChange }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-3 items-center mt-1">
        {value ? <img src={value} alt="" className="h-14 w-20 object-cover rounded-md border" /> : <div className="h-14 w-20 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">none</div>}
        <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="Image URL or upload" className="flex-1" />
        <UploadButton accept="image/*" label="Upload" onDone={(url) => onChange(url)} />
      </div>
    </div>
  )
}
function StringListField({ label, items, onChange }) {
  const arr = items || []
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="space-y-2 mt-1">
        {arr.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input value={v} onChange={(e) => { const n = [...arr]; n[i] = e.target.value; onChange(n) }} />
            <Button variant="outline" size="icon" onClick={() => onChange(arr.filter((_, j) => j !== i))}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...arr, ''])}>+ Add item</Button>
      </div>
    </div>
  )
}
function ObjectListEditor({ label, items, fields, onChange, makeEmpty }) {
  const arr = items || []
  const update = (i, key, val) => { const n = arr.map((x) => ({ ...x })); n[i][key] = val; onChange(n) }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-brand-navy">{label}</Label>
        <Button variant="outline" size="sm" onClick={() => onChange([...arr, makeEmpty()])}>+ Add</Button>
      </div>
      {arr.map((item, i) => (
        <div key={i} className="rounded-xl border p-4 space-y-2 bg-brand-cream/40">
          <div className="flex justify-end"><Button variant="ghost" size="sm" className="text-brand-red h-7" onClick={() => onChange(arr.filter((_, j) => j !== i))}><X className="h-4 w-4 mr-1" /> Remove</Button></div>
          {fields.map((f) => f.type === 'area'
            ? <AreaField key={f.key} label={f.label} value={item[f.key]} onChange={(v) => update(i, f.key, v)} />
            : f.type === 'image'
            ? <ImageField key={f.key} label={f.label} value={item[f.key]} onChange={(v) => update(i, f.key, v)} />
            : f.type === 'list'
            ? <StringListField key={f.key} label={f.label} items={item[f.key]} onChange={(v) => update(i, f.key, v)} />
            : <Field key={f.key} label={f.label} value={item[f.key]} onChange={(v) => update(i, f.key, v)} type={f.type || 'text'} />
          )}
        </div>
      ))}
    </div>
  )
}

function ResourcesUploader({ items, onChange }) {
  const arr = items || []
  const upd = (i, key, val) => { const n = arr.map((x) => ({ ...x })); n[i][key] = val; onChange(n) }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-brand-navy">Resources</Label>
        <Button variant="outline" size="sm" onClick={() => onChange([...arr, { name: '', type: 'PDF', url: '' }])}>+ Add</Button>
      </div>
      {arr.map((r, i) => (
        <div key={i} className="rounded-xl border p-4 space-y-2 bg-brand-cream/40">
          <div className="flex justify-end"><Button variant="ghost" size="sm" className="text-brand-red h-7" onClick={() => onChange(arr.filter((_, j) => j !== i))}><X className="h-4 w-4 mr-1" /> Remove</Button></div>
          <div className="grid sm:grid-cols-2 gap-2">
            <Field label="Name" value={r.name} onChange={(v) => upd(i, 'name', v)} />
            <Field label="Type (PDF/Audio/Video/Guide)" value={r.type} onChange={(v) => upd(i, 'type', v)} />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1"><Field label="File link (upload or paste a URL)" value={r.url} onChange={(v) => upd(i, 'url', v)} /></div>
            <UploadButton accept="application/pdf,audio/*,video/*,image/*" label="Upload file" onDone={(url) => upd(i, 'url', url)} />
          </div>
          {r.url && r.url !== '#' && <a href={fileHref(r.url, localStorage.getItem('vm_admin_token'))} target="_blank" rel="noreferrer" className="text-xs text-brand-blue break-all">{r.url}</a>}
        </div>
      ))}
      {arr.length === 0 && <p className="text-sm text-muted-foreground">No resources yet — add one and upload a file or paste a link.</p>}
    </div>
  )
}

function IntegrationsPanel({ email, storage, api, reload }) {
  const [resendApiKey, setResendApiKey] = useState('')
  const [mailFrom, setMailFrom] = useState('')
  const [admissionsEmail, setAdmissionsEmail] = useState('')
  const [blobToken, setBlobToken] = useState('')
  const [testTo, setTestTo] = useState('')
  const [busy, setBusy] = useState('')
  useEffect(() => { if (email) { setMailFrom(email.mailFrom || ''); setAdmissionsEmail(email.admissionsEmail || '') } }, [email])
  if (!email || !storage) return <LmsLoading />

  const saveEmail = async () => {
    setBusy('email')
    try {
      const body = { mailFrom, admissionsEmail }
      if (resendApiKey.trim()) body.resendApiKey = resendApiKey.trim()
      const r = await api('email-settings', { method: 'PUT', body: JSON.stringify(body) })
      if (r.ok) { toast.success('Email settings saved'); setResendApiKey(''); reload() } else toast.error('Could not save')
    } catch { toast.error('Network error') } finally { setBusy('') }
  }
  const sendTest = async () => {
    if (!testTo.trim()) { toast.error('Enter a recipient email'); return }
    setBusy('test')
    try {
      const r = await api('email-settings/test', { method: 'POST', body: JSON.stringify({ to: testTo.trim() }) })
      const d = await r.json()
      if (r.ok && d.ok) toast.success(d.message || 'Test email sent'); else toast.error(d.error || 'Send failed')
    } catch { toast.error('Network error') } finally { setBusy('') }
  }
  const saveStorage = async () => {
    if (!blobToken.trim()) { toast.error('Paste a storage token first'); return }
    setBusy('storage')
    try {
      const r = await api('storage-settings', { method: 'PUT', body: JSON.stringify({ blobToken: blobToken.trim() }) })
      if (r.ok) { toast.success('Storage settings saved'); setBlobToken(''); reload() } else toast.error('Could not save')
    } catch { toast.error('Network error') } finally { setBusy('') }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div><p className="font-display text-lg font-semibold text-brand-navy">Email (Resend)</p><p className="text-sm text-muted-foreground">Manage transactional email keys and sender.</p></div>
          <Badge className={email.configured ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-brand-red/10 text-brand-red hover:bg-brand-red/10'}>{email.configured ? 'Configured' : 'Not set'}</Badge>
        </div>
        <div className="rounded-lg bg-brand-cream p-3 text-sm text-muted-foreground">Source: <b className="text-brand-navy">{email.source === 'admin' ? 'Admin panel' : 'Server env'}</b>{email.apiKeyMasked && <> · Key: <code className="text-brand-purple">{email.apiKeyMasked}</code></>}</div>
        <div><Label>Resend API Key</Label><Input type="password" value={resendApiKey} onChange={(e) => setResendApiKey(e.target.value)} placeholder={email.configured ? 'Enter a new key to replace' : 're_...'} className="mt-1.5" /><p className="text-xs text-muted-foreground mt-1">Leave blank to keep current. Never shown back in full.</p></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>From (sender)</Label><Input value={mailFrom} onChange={(e) => setMailFrom(e.target.value)} placeholder="Vox Magic <admissions@yourdomain.com>" className="mt-1.5" /></div>
          <div><Label>Admissions inbox</Label><Input value={admissionsEmail} onChange={(e) => setAdmissionsEmail(e.target.value)} placeholder="contact@yourdomain.com" className="mt-1.5" /></div>
        </div>
        <div className="flex justify-end"><Button disabled={busy === 'email'} onClick={saveEmail} className="bg-brand-purple hover:bg-brand-purple-light">{busy === 'email' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save email settings'}</Button></div>
        <Separator />
        <div><Label>Send a test email</Label>
          <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
            <Input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" />
            <Button disabled={busy === 'test'} onClick={sendTest} className="bg-brand-blue hover:bg-brand-blue-dark shrink-0">{busy === 'test' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1.5" /> Send test</>}</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Sends a sample admission email so you can confirm inbox delivery.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div><p className="font-display text-lg font-semibold text-brand-navy">File Storage (Vercel Blob)</p><p className="text-sm text-muted-foreground">Token used for secure file uploads.</p></div>
          <Badge className={storage.configured ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-brand-red/10 text-brand-red hover:bg-brand-red/10'}>{storage.configured ? 'Configured' : 'Not set'}</Badge>
        </div>
        <div className="rounded-lg bg-brand-cream p-3 text-sm text-muted-foreground">Source: <b className="text-brand-navy">{storage.source === 'admin' ? 'Admin panel' : 'Server env'}</b>{storage.tokenMasked && <> · Token: <code className="text-brand-purple">{storage.tokenMasked}</code></>}</div>
        <div><Label>Blob Read/Write Token</Label><Input type="password" value={blobToken} onChange={(e) => setBlobToken(e.target.value)} placeholder="vercel_blob_rw_..." className="mt-1.5" /></div>
        <div className="flex justify-end"><Button disabled={busy === 'storage'} onClick={saveStorage} className="bg-brand-purple hover:bg-brand-purple-light">{busy === 'storage' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save storage settings'}</Button></div>
      </div>
    </div>
  )
}

function PaymentSettingsPanel({ settings, api, reload }) {
  const [secretKey, setSecretKey] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [mode, setMode] = useState('test')
  const [busy, setBusy] = useState(false)
  const [testing, setTesting] = useState(false)
  useEffect(() => { if (settings) { setPublicKey(settings.publicKey || ''); setMode(settings.mode || 'test') } }, [settings])
  if (!settings) return <LmsLoading />

  const save = async () => {
    setBusy(true)
    try {
      const body = { publicKey, mode }
      if (secretKey.trim()) body.secretKey = secretKey.trim()
      const r = await api('payment-settings', { method: 'PUT', body: JSON.stringify(body) })
      if (r.ok) { toast.success('Payment settings saved'); setSecretKey(''); reload() } else toast.error('Could not save settings')
    } catch { toast.error('Network error') } finally { setBusy(false) }
  }
  const testConn = async () => {
    setTesting(true)
    try {
      const body = secretKey.trim() ? { secretKey: secretKey.trim() } : {}
      const r = await api('payment-settings/test', { method: 'POST', body: JSON.stringify(body) })
      const d = await r.json()
      if (r.ok && d.ok) toast.success(d.message || 'Connection successful'); else toast.error(d.error || 'Key appears invalid')
    } catch { toast.error('Network error') } finally { setTesting(false) }
  }

  return (
    <div className="max-w-2xl space-y-5">
      {mode === 'live' && (
        <div className="rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red p-4 text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> LIVE mode is selected — real payments will be charged to real cards.
        </div>
      )}
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-brand-navy">Flutterwave Payment Settings</p>
            <p className="text-sm text-muted-foreground">Update your payment keys and mode. The secret key is stored securely and shown masked.</p>
          </div>
          <Badge className={settings.configured ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-brand-red/10 text-brand-red hover:bg-brand-red/10'}>{settings.configured ? 'Configured' : 'Not set'}</Badge>
        </div>

        <div className="rounded-lg bg-brand-cream p-3 text-sm text-muted-foreground">
          Current key source: <b className="text-brand-navy">{settings.source === 'admin' ? 'Admin (this panel)' : 'Server environment'}</b>
          {settings.secretMasked && <> · Active secret: <code className="text-brand-purple">{settings.secretMasked}</code></>}
        </div>

        <div>
          <Label>Secret Key</Label>
          <Input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder={settings.configured ? 'Enter a new secret key to replace the current one' : 'FLWSECK_TEST-... or FLWSECK-...'} className="mt-1.5" />
          <p className="text-xs text-muted-foreground mt-1">Leave blank to keep the current secret key. Never shared back to the browser.</p>
        </div>
        <div>
          <Label>Public Key (optional)</Label>
          <Input value={publicKey} onChange={(e) => setPublicKey(e.target.value)} placeholder="FLWPUBK_TEST-..." className="mt-1.5" />
        </div>
        <div>
          <Label>Mode</Label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1.5 w-full h-11 rounded-md border border-input px-3 bg-background">
            <option value="test">Test mode</option>
            <option value="live">Live mode</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" disabled={testing} onClick={testConn}>{testing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test connection'}</Button>
          <Button disabled={busy} onClick={save} className="bg-brand-purple hover:bg-brand-purple-light">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save settings'}</Button>
        </div>
      </div>
    </div>
  )
}

function LmsManagerPanel({ config, api, reload }) {
  const [cfg, setCfg] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (config) setCfg(JSON.parse(JSON.stringify(config))) }, [config])
  if (!cfg) return <LmsLoading />

  const save = async () => {
    setBusy(true)
    try {
      const r = await api('lms', { method: 'PUT', body: JSON.stringify({ config: cfg }) })
      if (r.ok) { toast.success('LMS content saved — students see it now'); reload() } else toast.error('Could not save LMS content')
    } catch { toast.error('Network error') } finally { setBusy(false) }
  }
  const resetAll = async () => {
    if (!confirm('Reset all LMS content (lessons, schedule, assignments, resources) to defaults?')) return
    const r = await api('lms/reset', { method: 'POST' })
    if (r.ok) { const d = await r.json(); setCfg(JSON.parse(JSON.stringify(d.config))); toast.success('Reset to defaults'); reload() }
  }

  // modules helpers
  const setModules = (v) => setCfg({ ...cfg, modules: v })
  const updModule = (mi, key, val) => { const m = cfg.modules.map((x) => ({ ...x })); m[mi][key] = val; setModules(m) }
  const addModule = () => setModules([...cfg.modules, { title: 'New Month', weeks: '', lessons: [] }])
  const delModule = (mi) => setModules(cfg.modules.filter((_, i) => i !== mi))
  const addLesson = (mi) => { const m = cfg.modules.map((x) => ({ ...x, lessons: [...(x.lessons || [])] })); m[mi].lessons.push({ title: 'New Lesson', duration: '', recordingUrl: '', resources: [] }); setModules(m) }
  const updLesson = (mi, li, key, val) => { const m = cfg.modules.map((x) => ({ ...x, lessons: (x.lessons || []).map((l) => ({ ...l })) })); m[mi].lessons[li][key] = val; setModules(m) }
  const delLesson = (mi, li) => { const m = cfg.modules.map((x) => ({ ...x, lessons: (x.lessons || []).filter((_, j) => j !== li) })); setModules(m) }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border p-4 sticky top-2 z-10">
        <div>
          <p className="font-display text-lg font-semibold text-brand-navy">LMS Manager</p>
          <p className="text-sm text-muted-foreground">Plan lessons, schedule live classes, set assignments and share resources. Save to publish to students instantly.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetAll}>Reset defaults</Button>
          <Button disabled={busy} onClick={save} className="bg-brand-purple hover:bg-brand-purple-light">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}</Button>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-3" defaultValue={['modules']}>
        <AccordionItem value="modules" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Modules & Lessons</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-5">
            {cfg.modules.map((m, mi) => (
              <div key={mi} className="rounded-xl border p-4 bg-brand-cream/40 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-brand-navy">Module {mi + 1}</p>
                  <Button variant="ghost" size="sm" className="text-brand-red h-7" onClick={() => delModule(mi)}><X className="h-4 w-4 mr-1" /> Remove module</Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Module title" value={m.title} onChange={(v) => updModule(mi, 'title', v)} />
                  <Field label="Weeks/label" value={m.weeks} onChange={(v) => updModule(mi, 'weeks', v)} />
                </div>
                <div className="space-y-2">
                  {(m.lessons || []).map((l, li) => (
                    <div key={li} className="rounded-lg border bg-white p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium text-muted-foreground">Lesson {li + 1}</p>
                        <Button variant="ghost" size="sm" className="text-brand-red h-6 text-xs" onClick={() => delLesson(mi, li)}><X className="h-3.5 w-3.5 mr-1" /> Remove</Button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <Field label="Lesson title" value={l.title} onChange={(v) => updLesson(mi, li, 'title', v)} />
                        <Field label="Duration" value={l.duration} onChange={(v) => updLesson(mi, li, 'duration', v)} />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1"><Field label="Recording / video link (YouTube, Drive, mp4)" value={l.recordingUrl} onChange={(v) => updLesson(mi, li, 'recordingUrl', v)} /></div>
                        <UploadButton accept="video/*,audio/*" label="Upload" onDone={(url) => updLesson(mi, li, 'recordingUrl', url)} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addLesson(mi)}>+ Add lesson</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addModule}>+ Add module</Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="schedule" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Live Class Schedule</AccordionTrigger>
          <AccordionContent className="pb-5">
            <ObjectListEditor label="Live classes" items={cfg.schedule} onChange={(v) => setCfg({ ...cfg, schedule: v })} makeEmpty={() => ({ title: '', date: '', time: '', mode: 'Online', joinUrl: '' })}
              fields={[{ key: 'title', label: 'Title' }, { key: 'date', label: 'Date / frequency' }, { key: 'time', label: 'Time' }, { key: 'mode', label: 'Mode (Online/Hybrid/In-person)' }, { key: 'joinUrl', label: 'Join link (Zoom/Meet)' }]} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="assignments" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Assignments</AccordionTrigger>
          <AccordionContent className="pb-5">
            <ObjectListEditor label="Assignments" items={cfg.assignments} onChange={(v) => setCfg({ ...cfg, assignments: v })} makeEmpty={() => ({ title: '', module: '', due: '', instructions: '' })}
              fields={[{ key: 'title', label: 'Title' }, { key: 'module', label: 'Module' }, { key: 'due', label: 'Due' }, { key: 'instructions', label: 'Instructions', type: 'area' }]} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="resources" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Resources (links)</AccordionTrigger>
          <AccordionContent className="pb-5">
            <ResourcesUploader items={cfg.resources} onChange={(v) => setCfg({ ...cfg, resources: v })} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function CmsPanel({ content, api, reload }) {
  const [c, setC] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { setC(content ? withDefaults(content) : withDefaults(null)) }, [content])
  if (!c) return <LmsLoading />

  const set = (path, value) => {
    setC((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      const parts = path.split('.')
      let o = next
      for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]]
      o[parts[parts.length - 1]] = value
      return next
    })
  }

  const save = async () => {
    setBusy(true)
    try {
      const r = await api('content', { method: 'PUT', body: JSON.stringify({ content: c }) })
      if (r.ok) { toast.success('Website content saved — changes are now live'); reload() }
      else toast.error('Could not save content')
    } catch { toast.error('Network error') } finally { setBusy(false) }
  }
  const resetAll = async () => {
    if (!confirm('Reset all website content to defaults?')) return
    const r = await api('content/reset', { method: 'POST' })
    if (r.ok) { const d = await r.json(); setC(withDefaults(d.content)); toast.success('Reset to defaults'); reload() }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border p-4 sticky top-2 z-10">
        <div>
          <p className="font-display text-lg font-semibold text-brand-navy">Website Content Manager</p>
          <p className="text-sm text-muted-foreground">Edit any section, then save — the public site updates instantly. No coding required.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetAll}>Reset defaults</Button>
          <Button disabled={busy} onClick={save} className="bg-brand-purple hover:bg-brand-purple-light">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}</Button>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-3">
        <AccordionItem value="brand" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Brand & Contact</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <Field label="Tagline" value={c.brand.tagline} onChange={(v) => set('brand.tagline', v)} />
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Email" value={c.brand.email} onChange={(v) => set('brand.email', v)} />
              <Field label="Phone" value={c.brand.phone} onChange={(v) => set('brand.phone', v)} />
              <Field label="Location" value={c.brand.location} onChange={(v) => set('brand.location', v)} />
            </div>
            <div className="grid sm:grid-cols-4 gap-3">
              <Field label="Instagram URL" value={c.brand.socials.instagram} onChange={(v) => set('brand.socials.instagram', v)} />
              <Field label="Facebook URL" value={c.brand.socials.facebook} onChange={(v) => set('brand.socials.facebook', v)} />
              <Field label="YouTube URL" value={c.brand.socials.youtube} onChange={(v) => set('brand.socials.youtube', v)} />
              <Field label="Twitter/X URL" value={c.brand.socials.twitter} onChange={(v) => set('brand.socials.twitter', v)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="hero" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Hero Section</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <ImageField label="Hero background image" value={c.media.hero} onChange={(v) => set('media.hero', v)} />
            <Field label="Badge text" value={c.hero.badge} onChange={(v) => set('hero.badge', v)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Title (main)" value={c.hero.titleTop} onChange={(v) => set('hero.titleTop', v)} />
              <Field label="Title (highlighted word)" value={c.hero.titleHighlight} onChange={(v) => set('hero.titleHighlight', v)} />
            </div>
            <AreaField label="Subtitle" value={c.hero.subtitle} onChange={(v) => set('hero.subtitle', v)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Primary button label" value={c.hero.ctaPrimary} onChange={(v) => set('hero.ctaPrimary', v)} />
              <Field label="Secondary button label" value={c.hero.ctaSecondary} onChange={(v) => set('hero.ctaSecondary', v)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="about" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">About Section</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <ImageField label="About image" value={c.media.about} onChange={(v) => set('media.about', v)} />
            <Field label="Eyebrow" value={c.about.eyebrow} onChange={(v) => set('about.eyebrow', v)} />
            <Field label="Title" value={c.about.title} onChange={(v) => set('about.title', v)} />
            <AreaField label="Subtitle" value={c.about.subtitle} onChange={(v) => set('about.subtitle', v)} />
            <AreaField label="Body paragraph" value={c.about.body1} onChange={(v) => set('about.body1', v)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Mission title" value={c.about.missionTitle} onChange={(v) => set('about.missionTitle', v)} />
              <Field label="Vision title" value={c.about.visionTitle} onChange={(v) => set('about.visionTitle', v)} />
              <AreaField label="Mission" value={c.about.mission} onChange={(v) => set('about.mission', v)} />
              <AreaField label="Vision" value={c.about.vision} onChange={(v) => set('about.vision', v)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="values" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Values</AccordionTrigger>
          <AccordionContent className="pb-5">
            <ObjectListEditor label="Values" items={c.values} onChange={(v) => set('values', v)} makeEmpty={() => ({ title: '', text: '' })}
              fields={[{ key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'area' }]} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="programmes" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Programme & Pricing</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Registration fee (₦)" type="number" value={c.programmes.registration} onChange={(v) => set('programmes.registration', v)} />
              <Field label="Online tuition (₦)" type="number" value={c.programmes.onlinePrice} onChange={(v) => set('programmes.onlinePrice', v)} />
              <Field label="Hybrid tuition (₦)" type="number" value={c.programmes.hybridPrice} onChange={(v) => set('programmes.hybridPrice', v)} />
            </div>
            <StringListField label="Online track features" items={c.programmes.onlineFeatures} onChange={(v) => set('programmes.onlineFeatures', v)} />
            <StringListField label="Hybrid track features" items={c.programmes.hybridFeatures} onChange={(v) => set('programmes.hybridFeatures', v)} />
            <ObjectListEditor label="Curriculum (months)" items={c.curriculum} onChange={(v) => set('curriculum', v)} makeEmpty={() => ({ m: '', t: '', items: [] })}
              fields={[{ key: 'm', label: 'Label (e.g. Month 1)' }, { key: 't', label: 'Title' }, { key: 'items', label: 'Topics', type: 'list' }]} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="founder" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Founder Section</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <ImageField label="Founder photo" value={c.media.founder} onChange={(v) => set('media.founder', v)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Name" value={c.founder.name} onChange={(v) => set('founder.name', v)} />
              <Field label="Role" value={c.founder.role} onChange={(v) => set('founder.role', v)} />
            </div>
            <AreaField label="Bio paragraph 1" value={c.founder.bio1} onChange={(v) => set('founder.bio1', v)} />
            <AreaField label="Bio paragraph 2" value={c.founder.bio2} onChange={(v) => set('founder.bio2', v)} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faculty" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Faculty</AccordionTrigger>
          <AccordionContent className="pb-5">
            <ObjectListEditor label="Faculty & Instructors" items={c.faculty} onChange={(v) => set('faculty', v)} makeEmpty={() => ({ name: '', role: '', tag: 'Instructor', img: '' })}
              fields={[{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'tag', label: 'Tag (e.g. Founder/Instructor)' }, { key: 'img', label: 'Photo', type: 'image' }]} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="events" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Events & Masterclasses</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <ImageField label="Events image" value={c.media.events} onChange={(v) => set('media.events', v)} />
            <ObjectListEditor label="Events" items={c.events} onChange={(v) => set('events', v)} makeEmpty={() => ({ title: '', date: '', mode: '', desc: '' })}
              fields={[{ key: 'title', label: 'Title' }, { key: 'date', label: 'Date/Frequency' }, { key: 'mode', label: 'Mode' }, { key: 'desc', label: 'Description', type: 'area' }]} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="testimonials" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Testimonials</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <ImageField label="Testimonials background image" value={c.media.testimonials} onChange={(v) => set('media.testimonials', v)} />
            <ObjectListEditor label="Testimonials" items={c.testimonials} onChange={(v) => set('testimonials', v)} makeEmpty={() => ({ name: '', role: '', text: '' })}
              fields={[{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'text', label: 'Quote', type: 'area' }]} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="blog" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">Blog / Resources</AccordionTrigger>
          <AccordionContent className="pb-5">
            <ObjectListEditor label="Blog posts" items={c.blog} onChange={(v) => set('blog', v)} makeEmpty={() => ({ title: '', tag: '', read: '3 min', excerpt: '' })}
              fields={[{ key: 'title', label: 'Title' }, { key: 'tag', label: 'Tag' }, { key: 'read', label: 'Read time' }, { key: 'excerpt', label: 'Excerpt', type: 'area' }]} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq" className="bg-white rounded-2xl border px-5">
          <AccordionTrigger className="font-medium text-brand-navy">FAQ</AccordionTrigger>
          <AccordionContent className="pb-5">
            <ObjectListEditor label="FAQ" items={c.faq} onChange={(v) => set('faq', v)} makeEmpty={() => ({ q: '', a: '' })}
              fields={[{ key: 'q', label: 'Question' }, { key: 'a', label: 'Answer', type: 'area' }]} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

// -------------------------- App -------------------------------------------
export default function App() {
  const [view, setViewState] = useState('home')
  const [legal, setLegal] = useState(null)
  const [content, setContent] = useState(DEFAULT_CONTENT)

  const setView = (v) => {
    setViewState(v)
    const url = v === 'home' ? '/' : `/?view=${v}`
    window.history.pushState({}, '', url)
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const v = params.get('view')
    if (v && ['apply', 'login', 'portal', 'admin'].includes(v)) setViewState(v)
    const onPop = () => {
      const p = new URLSearchParams(window.location.search).get('view')
      setViewState(p && ['apply', 'login', 'portal', 'admin'].includes(p) ? p : 'home')
    }
    window.addEventListener('popstate', onPop)
    fetch('/api/content').then((r) => r.json()).then((d) => { if (d.content) setContent(withDefaults(d.content)) }).catch(() => {})
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (view === 'apply') return <ApplyView setView={setView} />
  if (view === 'login') return <LoginView setView={setView} onLogin={() => setView('portal')} />
  if (view === 'portal') return <PortalView setView={setView} />
  if (view === 'admin') return <AdminView setView={setView} />

  const c = content
  return (
    <div className="bg-white">
      <Navbar setView={setView} />
      <Hero setView={setView} c={c} />
      <About c={c} />
      <Values c={c} />
      <Programmes setView={setView} c={c} />
      <Assessment c={c} />
      <Founder c={c} />
      <Faculty c={c} />
      <Events c={c} />
      <Testimonials c={c} />
      <Resources c={c} />
      <FAQ c={c} />
      <Contact c={c} />
      <Footer setView={setView} openLegal={(k) => setLegal(k)} c={c} />
      <Dialog open={!!legal} onOpenChange={(o) => !o && setLegal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl text-brand-navy">{legal && LEGAL[legal].title}</DialogTitle></DialogHeader>
          <p className="text-muted-foreground leading-relaxed">{legal && LEGAL[legal].body}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
