"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { quoteTotals, searchRecords, updateRequestStatus } from "../../lib/crm-domain.mjs";
import { requestLocalDraft } from "@/lib/ollama-client";
import styles from "./crm.module.css";

type View = "Dashboard" | "Aanvragen" | "Klanten" | "Offertes" | "Taken" | "Rapportages";
type Customer = { id: string; name: string; contact: string; email: string; phone: string; city: string; type: string; lastActivity: string };
type Request = { id: string; number: string; customerId: string; customer: string; service: string; location: string; amount: number; status: string; owner: string; createdAt: string; priority: string };
type Quote = { id: string; number: string; requestId: string; customer: string; service: string; subtotal: number; vat: number; total: number; status: string; expiresAt: string; createdAt: string; draftText?: string };
type Task = { id: string; title: string; customer: string; due: string; owner: string; done: boolean };
type AppData = { customers: Customer[]; requests: Request[]; quotes: Quote[]; tasks: Task[] };
type Dialog = "request" | "customer" | { kind: "quote"; request: Request } | null;

const STORAGE_KEY = "geregeldwerk-crm-demo-v1";
const navItems: { label: View; icon: string }[] = [
  { label: "Dashboard", icon: "grid" }, { label: "Aanvragen", icon: "inbox" },
  { label: "Klanten", icon: "users" }, { label: "Offertes", icon: "file" },
  { label: "Taken", icon: "check" }, { label: "Rapportages", icon: "chart" },
];

const seed: AppData = {
  customers: [
    { id: "c1", name: "Van den Berg Installaties", contact: "Sophie van den Berg", email: "sophie@vandenberg.nl", phone: "+31 6 2834 9120", city: "Utrecht", type: "Zakelijk", lastActivity: "Vandaag" },
    { id: "c2", name: "Familie Jansen", contact: "Mark Jansen", email: "mark.jansen@gmail.com", phone: "+31 6 1044 2261", city: "Amersfoort", type: "Particulier", lastActivity: "Vandaag" },
    { id: "c3", name: "Noord Klimaattechniek", contact: "Erik de Vries", email: "erik@noordklimaat.nl", phone: "+31 6 3920 7811", city: "Hilversum", type: "Zakelijk", lastActivity: "Gisteren" },
    { id: "c4", name: "De Wit Elektrotechniek", contact: "Lisa de Wit", email: "lisa@dewit-elektro.nl", phone: "+31 6 5184 0332", city: "Zeist", type: "Zakelijk", lastActivity: "Gisteren" },
    { id: "c5", name: "Peter van Leeuwen", contact: "Peter van Leeuwen", email: "peter.vl@outlook.com", phone: "+31 6 8532 0108", city: "Nieuwegein", type: "Particulier", lastActivity: "11 nov" },
    { id: "c6", name: "GroenWonen Projecten", contact: "Nina Bakker", email: "nina@groenwonen.nl", phone: "+31 30 778 4100", city: "Utrecht", type: "Zakelijk", lastActivity: "10 nov" },
  ],
  requests: [
    { id: "r1", number: "AAN-2026-084", customerId: "c1", customer: "Van den Berg Installaties", service: "Hybride warmtepomp", location: "Utrecht", amount: 8450, status: "Offerte verzonden", owner: "Mark de Vries", createdAt: "Vandaag, 09:42", priority: "Hoog" },
    { id: "r2", number: "AAN-2026-083", customerId: "c2", customer: "Familie Jansen", service: "Airconditioning", location: "Amersfoort", amount: 3250, status: "In behandeling", owner: "Lisa Bakker", createdAt: "Vandaag, 08:15", priority: "Normaal" },
    { id: "r3", number: "AAN-2026-082", customerId: "c3", customer: "Noord Klimaattechniek", service: "Onderhoud cv-ketel", location: "Hilversum", amount: 680, status: "Nieuw", owner: "Mark de Vries", createdAt: "Gisteren", priority: "Normaal" },
    { id: "r4", number: "AAN-2026-081", customerId: "c4", customer: "De Wit Elektrotechniek", service: "Meterkast vervangen", location: "Zeist", amount: 2190, status: "Informatie nodig", owner: "Lisa Bakker", createdAt: "Gisteren", priority: "Laag" },
    { id: "r5", number: "AAN-2026-080", customerId: "c5", customer: "Peter van Leeuwen", service: "Laadpaal installatie", location: "Nieuwegein", amount: 1750, status: "Offerte in voorbereiding", owner: "Mark de Vries", createdAt: "11 nov", priority: "Normaal" },
    { id: "r6", number: "AAN-2026-079", customerId: "c6", customer: "GroenWonen Projecten", service: "Zonnepanelen, 12 stuks", location: "Utrecht", amount: 8950, status: "Gewonnen", owner: "Lisa Bakker", createdAt: "10 nov", priority: "Hoog" },
  ],
  quotes: [
    { id: "q1", number: "OFF-2026-041", requestId: "r1", customer: "Van den Berg Installaties", service: "Hybride warmtepomp", subtotal: 6983, vat: 1467, total: 8450, status: "Verzonden", expiresAt: "18 nov 2026", createdAt: "Vandaag" },
    { id: "q2", number: "OFF-2026-040", requestId: "r6", customer: "GroenWonen Projecten", service: "Zonnepanelen, 12 stuks", subtotal: 7397, vat: 1553, total: 8950, status: "Geaccepteerd", expiresAt: "25 nov 2026", createdAt: "10 nov" },
    { id: "q3", number: "OFF-2026-039", requestId: "r2", customer: "Familie Jansen", service: "Airconditioning", subtotal: 2686, vat: 564, total: 3250, status: "In concept", expiresAt: "21 nov 2026", createdAt: "Gisteren" },
    { id: "q4", number: "OFF-2026-038", requestId: "r5", customer: "Peter van Leeuwen", service: "Laadpaal installatie", subtotal: 1446, vat: 304, total: 1750, status: "Verlopen", expiresAt: "10 nov 2026", createdAt: "4 nov" },
  ],
  tasks: [
    { id: "t1", title: "Eerste opvolging offerte", customer: "Van den Berg Installaties", due: "Vandaag om 14:00", owner: "Mark de Vries", done: false },
    { id: "t2", title: "Gegevens meterkast opvragen", customer: "De Wit Elektrotechniek", due: "Vandaag om 16:30", owner: "Lisa Bakker", done: false },
    { id: "t3", title: "Offerte warmtepomp afronden", customer: "Familie Jansen", due: "Morgen om 10:00", owner: "Lisa Bakker", done: false },
    { id: "t4", title: "Onderhoudsafspraak bevestigen", customer: "Noord Klimaattechniek", due: "13 nov om 09:00", owner: "Mark de Vries", done: true },
  ],
};

const money = (amount: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
const formatShortDate = (date: Date) => date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    inbox: "M4 4h16l2 10v5H2v-5L4 4zm-2 10h6l2 3h4l2-3h6",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6-7.5a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87",
    file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8",
    check: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    chart: "M3 3v18h18M18 17V9M13 17V5M8 17v-3",
    plus: "M12 5v14M5 12h14",
    search: "m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4z",
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
    arrow: "M5 12h14m-7-7 7 7-7 7",
    clock: "M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    filter: "M4 5h16M7 12h10m-7 7h4",
    more: "M5 12h.01M12 12h.01M19 12h.01",
    close: "M18 6 6 18M6 6l12 12",
    spark: "m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3zm7 13 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z",
    settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20.3h-3v-.09a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7.06 15a1.7 1.7 0 0 0-1.55-1.03H5.4v-3h.11A1.7 1.7 0 0 0 7.06 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 10.72 5.34a1.7 1.7 0 0 0 1.03-1.55V3.7h3v.09a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19.44 9a1.7 1.7 0 0 0 1.55 1.03h.11v3h-.11A1.7 1.7 0 0 0 19.4 15z",
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] || paths.grid} /></svg>;
}

function Status({ value }: { value: string }) {
  const map: Record<string, string> = {
    Nieuw: "blue", "In behandeling": "amber", "Informatie nodig": "orange", "Offerte in voorbereiding": "violet",
    "Offerte verzonden": "blue", Gewonnen: "green", Verloren: "red", Gesloten: "gray",
    Verzonden: "blue", Geaccepteerd: "green", "In concept": "gray", Verlopen: "red", Afgewezen: "red", Afgerond: "green",
  };
  return <span className={`${styles.status} ${styles[map[value] || "gray"]}`}>{value}</span>;
}

export default function CrmPage() {
  const [view, setView] = useState<View>("Dashboard");
  const [data, setData] = useState<AppData>(seed);
  const [ready, setReady] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [period, setPeriod] = useState("Deze maand");
  const [todayLabel, setTodayLabel] = useState("Vandaag");
  const [aiDraft, setAiDraft] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [aiFallback, setAiFallback] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setData({ ...seed, ...JSON.parse(stored) });
      } catch { /* Start clean if a browser blocks or corrupts local storage. */ }
      setTodayLabel(formatShortDate(new Date()));
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredRequests = useMemo(() => searchRecords(data.requests, query) as Request[], [data.requests, query]);
  const filteredCustomers = useMemo(() => searchRecords(data.customers, query) as Customer[], [data.customers, query]);
  const filteredQuotes = useMemo(() => searchRecords(data.quotes, query) as Quote[], [data.quotes, query]);
  const openRequests = data.requests.filter((request) => !["Gewonnen", "Verloren", "Gesloten"].includes(request.status));
  const openValue = openRequests.reduce((sum, request) => sum + request.amount, 0);
  const pendingQuotes = data.quotes.filter((quote) => quote.status === "Verzonden").reduce((sum, quote) => sum + quote.total, 0);
  const completedTasks = data.tasks.filter((task) => task.done).length;
  const decidedQuotes = data.quotes.filter((quote) => ["Geaccepteerd", "Afgewezen"].includes(quote.status));
  const conversionPercent = decidedQuotes.length
    ? Math.round((decidedQuotes.filter((quote) => quote.status === "Geaccepteerd").length / decidedQuotes.length) * 100)
    : 0;
  const ownerRequestCount = (owner: string) => data.requests.filter((request) => request.owner === owner).length;

  function notify(message: string) { setToast(message); }
  function openQuote(request: Request) {
    setAiDraft("");
    setAiModel("");
    setAiFallback(false);
    setAiError("");
    setDialog({ kind: "quote", request });
  }
  async function makeAiDraft(request: Request) {
    setAiLoading(true);
    setAiError("");
    try {
      const result = await requestLocalDraft({ customer: request.customer, service: request.service, location: request.location });
      setAiDraft(result.text);
      setAiModel(result.model);
      setAiFallback(Boolean(result.fallback));
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Het AI-concept kon niet worden gemaakt.");
    } finally {
      setAiLoading(false);
    }
  }
  function updateRequest(id: string, status: string) {
    setData((previous) => ({ ...previous, requests: previous.requests.map((request) => request.id === id ? updateRequestStatus(request, status) as Request : request) }));
    notify(`Aanvraagstatus bijgewerkt naar ${status.toLowerCase()}.`);
  }
  function toggleTask(id: string) {
    setData((previous) => ({ ...previous, tasks: previous.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) }));
    notify("Taak bijgewerkt.");
  }
  function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customerName = String(form.get("customer") || "").trim();
    const existing = data.customers.find((customer) => customer.name.toLocaleLowerCase() === customerName.toLocaleLowerCase());
    const customerId = existing?.id || `c${Date.now()}`;
    const amount = Number(form.get("amount")) || 0;
    const request: Request = {
      id: `r${Date.now()}`, number: `AAN-2026-${String(data.requests.length + 85).padStart(3, "0")}`, customerId,
      customer: customerName, service: String(form.get("service") || "Nieuwe aanvraag"), location: String(form.get("city") || "Nederland"),
      amount, status: "Nieuw", owner: "Mark de Vries", createdAt: "Zojuist", priority: "Normaal",
    };
    const customer: Customer = existing || {
      id: customerId, name: customerName, contact: String(form.get("contact") || customerName), email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""), city: String(form.get("city") || ""), type: "Particulier", lastActivity: "Zojuist",
    };
    setData((previous) => ({ ...previous, customers: existing ? previous.customers : [customer, ...previous.customers], requests: [request, ...previous.requests] }));
    setDialog(null); setView("Aanvragen"); setQuery(""); notify("Nieuwe aanvraag toegevoegd.");
  }
  function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const customer: Customer = {
      id: `c${Date.now()}`, name, contact: String(form.get("contact") || name), email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""), city: String(form.get("city") || ""), type: String(form.get("type") || "Particulier"), lastActivity: "Zojuist",
    };
    setData((previous) => ({ ...previous, customers: [customer, ...previous.customers] }));
    setDialog(null); setView("Klanten"); setQuery(""); notify("Klant toegevoegd aan je klantenbestand.");
  }
  function createQuote(event: FormEvent<HTMLFormElement>, request: Request) {
    event.preventDefault();
    const discount = Number(new FormData(event.currentTarget).get("discount")) || 0;
    const draftText = String(new FormData(event.currentTarget).get("aiDraft") || "").trim();
    const subtotal = request.amount / 1.21;
    const totals = quoteTotals([{ quantity: 1, unitPrice: subtotal, vatRate: 21 }], discount);
    const quote: Quote = {
      id: `q${Date.now()}`, number: `OFF-2026-${String(data.quotes.length + 42).padStart(3, "0")}`, requestId: request.id,
      customer: request.customer, service: request.service, subtotal: Math.round(totals.subtotal), vat: Math.round(totals.vat), total: Math.round(totals.total),
      status: "In concept", expiresAt: "30 dagen na verzending", createdAt: "Zojuist", draftText,
    };
    setData((previous) => ({
      ...previous, quotes: [quote, ...previous.quotes],
      requests: previous.requests.map((item) => item.id === request.id ? { ...item, status: "Offerte in voorbereiding" } : item),
    }));
    setDialog(null); setView("Offertes"); notify(`Conceptofferte ${quote.number} aangemaakt.`);
  }
  function updateQuoteStatus(quote: Quote, status: string) {
    setData((previous) => ({
      ...previous, quotes: previous.quotes.map((item) => item.id === quote.id ? { ...item, status } : item),
      requests: previous.requests.map((item) => item.id === quote.requestId ? { ...item, status: status === "Geaccepteerd" ? "Gewonnen" : status === "Afgewezen" ? "Verloren" : item.status } : item),
    }));
    notify(`Offerte ${status.toLocaleLowerCase()} gemarkeerd.`);
  }
  function resetDemo() {
    if (!window.confirm("Demo opnieuw instellen? Je lokale wijzigingen worden gewist.")) return;
    setData(seed); setQuery(""); notify("Demo opnieuw ingesteld.");
  }

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><div className={styles.brandMark}>G</div><div><b>Geregeldwerk</b><span>CRM <i>Demo</i></span></div><button className={styles.workspaceChevron} aria-label="Werkruimte menu">⌄</button></div>
      <div className={styles.orgCard}><div className={styles.orgAvatar}>V</div><div className={styles.orgInfo}><b>Van Dijk Installatie</b><span>Starter, 2 gebruikers</span></div></div>
      <div className={styles.navCaption}>Werkruimte</div>
      <nav className={styles.nav}>{navItems.map((item) => <button key={item.label} className={`${styles.navItem} ${view === item.label ? styles.navActive : ""}`} onClick={() => { setView(item.label); setQuery(""); }}><Icon name={item.icon} /><span>{item.label}</span>{item.label === "Aanvragen" && <em>{openRequests.length}</em>}</button>)}</nav>
      <Link href="/" className={styles.settingsBtn} style={{ textDecoration: "none" }}>Werkassistent</Link>
      <div className={styles.sidebarSpacer} />
      <div className={styles.sidebarTip}><div className={styles.tipIcon}><Icon name="spark" size={16} /></div><b>Meer grip op je aanvragen</b><p>Automatische opvolging houdt geen offerte meer stil.</p><button onClick={() => setView("Offertes")}>Bekijk offertes <Icon name="arrow" size={14} /></button></div>
      <button className={styles.settingsBtn} onClick={() => notify("Werkruimte-instellingen volgen in de volgende versie.")}><Icon name="settings" size={16} /> Instellingen <span className={styles.shortcut}>⌘ ,</span></button>
      <div className={styles.profile}><div className={styles.avatar}>MD</div><div><b>Mark de Vries</b><span>Eigenaar</span></div><button aria-label="Profiel menu">···</button></div>
    </aside>

    <main className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.mobileBrand}><div className={styles.brandMark}>G</div><b>Geregeldwerk <span>CRM</span></b></div>
        <div className={styles.breadcrumb}><span>Werkruimte</span><b>/</b><strong>{view}</strong></div>
        <div className={styles.topActions}>
          <label className={styles.search}><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoeken..." aria-label="Zoeken" /><kbd>⌘ K</kbd></label>
          <button className={styles.iconButton} aria-label="Meldingen" onClick={() => notify("Je bent helemaal bij.")}><Icon name="bell" size={18} /><i /></button>
          <div className={styles.topAvatar}>MD</div>
        </div>
      </header>
      <div className={styles.demoBanner}><span><span className={styles.demoDot} /> Demo-omgeving</span><span>Je gegevens worden alleen in deze browser opgeslagen.</span><button onClick={resetDemo}>Demo resetten</button></div>

      <div className={styles.content}>
        {view === "Dashboard" && <>
          <div className={styles.pageHeading}><div><div className={styles.dateLine}>{todayLabel}</div><h1>Goedemorgen, Mark</h1><p>Hier is wat er speelt binnen je bedrijf.</p></div><div className={styles.headingActions}><button className={styles.secondaryButton} onClick={() => setDialog("customer")}><Icon name="users" size={16} /> Klant toevoegen</button><button className={styles.primaryButton} onClick={() => setDialog("request")}><Icon name="plus" size={17} /> Nieuwe aanvraag</button></div></div>
          <section className={styles.metricGrid}>
            <Metric title="Open aanvragen" value={String(openRequests.length).padStart(2, "0")} note="Actieve aanvragen in deze demo" icon="inbox" tone="green" trend="" />
            <Metric title="Offertes in afwachting" value={money(pendingQuotes)} note={`${data.quotes.filter((quote) => quote.status === "Verzonden").length} offertes wachten op reactie`} icon="file" tone="blue" trend="" />
            <Metric title="Potentiële omzet" value={money(openValue)} note="Som van open aanvragen" icon="chart" tone="amber" trend="" />
            <Metric title="Opvolgtaken" value={String(data.tasks.filter((task) => !task.done).length).padStart(2, "0")} note={`${completedTasks} afgerond deze week`} icon="check" tone="violet" trend="" />
          </section>
          <section className={styles.dashboardGrid}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}><div><h2>Commerciële pipeline</h2><p>Overzicht van je aanvragen en offertewaarde</p></div><select className={styles.selectCompact} value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Periode"><option>Deze maand</option><option>Deze week</option><option>Dit jaar</option></select></div>
              <div className={styles.pipelineSummary}><strong>{money(openValue)}</strong><span>totale potentiële waarde</span></div>
              <div className={styles.chartWrap}><div className={styles.yLabels}><span>€ 12k</span><span>€ 8k</span><span>€ 4k</span><span>€ 0</span></div><div className={styles.chart}><div className={styles.gridline} /><div className={styles.gridline} /><div className={styles.gridline} /><div className={styles.gridline} /><div className={styles.chartBars}>{[38,54,45,70,57,82,65,90,58,75,49,68].map((height, index) => <div key={index} className={styles.barGroup}><i style={{ height: `${height}%` }} /><i style={{ height: `${Math.max(14, height * .56)}%` }} /></div>)}</div><div className={styles.xLabels}><span>1 nov</span><span>5 nov</span><span>10 nov</span><span>15 nov</span><span>20 nov</span><span>25 nov</span><span>30 nov</span></div></div></div>
              <div className={styles.chartLegend}><span><i className={styles.legendMain} /> Aanvragen</span><span><i className={styles.legendSub} /> Offertes verzonden</span><button onClick={() => setView("Rapportages")}>Rapportage bekijken <Icon name="arrow" size={14} /></button></div>
            </div>
            <div className={styles.panel}><div className={styles.panelHeader}><div><h2>Opvolging nodig</h2><p>Dit vraagt vandaag om aandacht</p></div><button className={styles.linkButton} onClick={() => setView("Taken")}>Alle taken <Icon name="arrow" size={14} /></button></div><div className={styles.taskList}>{data.tasks.filter((task) => !task.done).slice(0, 4).map((task) => <div className={styles.taskRow} key={task.id}><button className={styles.taskCheck} onClick={() => toggleTask(task.id)} aria-label={`Markeer ${task.title} als afgerond`} /><div className={styles.taskCopy}><b>{task.title}</b><span>{task.customer}</span></div><span className={styles.taskDue}><Icon name="clock" size={13} />{task.due}</span></div>)}</div><div className={styles.taskFoot}><span><span className={styles.warnDot} /> {data.tasks.filter((task) => !task.done).length} openstaande acties</span><button onClick={() => setView("Taken")}>Naar taken <Icon name="arrow" size={14} /></button></div></div>
          </section>
          <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Recente aanvragen</h2><p>De nieuwste aanvragen van je klanten</p></div><button className={styles.linkButton} onClick={() => setView("Aanvragen")}>Alle aanvragen</button></div><RequestTable requests={filteredRequests.slice(0, 5)} onStatus={updateRequest} onQuote={openQuote} /></section>
          <div className={styles.footerNote}>Je ziet de gegevens van <b>Van Dijk Installatie</b>. Laatst bijgewerkt: zojuist.</div>
        </>}
        {view === "Aanvragen" && <>
          <div className={styles.pageHeading}><div><h1>Aanvragen <span className={styles.headingCount}>{data.requests.length}</span></h1><p>Beheer binnenkomende aanvragen en houd elke kans in beweging.</p></div><button className={styles.primaryButton} onClick={() => setDialog("request")}><Icon name="plus" size={17} /> Nieuwe aanvraag</button></div>
          <div className={styles.listToolbar}><div className={styles.filterLabel}><Icon name="filter" size={15} /> Alle aanvragen <span>{filteredRequests.length}</span></div><button className={styles.secondaryButton} onClick={() => setQuery("")}><Icon name="filter" size={15} /> Filters <span className={styles.chev}>⌄</span></button></div>
          <section className={styles.panel}><RequestTable requests={filteredRequests} onStatus={updateRequest} onQuote={openQuote} /></section>
        </>}
        {view === "Klanten" && <>
          <div className={styles.pageHeading}><div><h1>Klanten <span className={styles.headingCount}>{data.customers.length}</span></h1><p>Alle klantgegevens en contactmomenten op één plek.</p></div><button className={styles.primaryButton} onClick={() => setDialog("customer")}><Icon name="plus" size={17} /> Klant toevoegen</button></div>
          <div className={styles.listToolbar}><div className={styles.filterLabel}><Icon name="users" size={15} /> Alle klanten <span>{filteredCustomers.length}</span></div><span className={styles.mutedText}>Gesorteerd op recent contact</span></div>
          <section className={styles.panel}><div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>Klant</th><th>Contactpersoon</th><th>Telefoon en e-mail</th><th>Plaats</th><th>Type</th><th>Laatste contact</th><th /></tr></thead><tbody>{filteredCustomers.map((customer) => <tr key={customer.id}><td><div className={styles.customerCell}><div className={styles.customerAvatar}>{initials(customer.name)}</div><div><b>{customer.name}</b><small>{data.requests.filter((item) => item.customerId === customer.id).length} aanvragen</small></div></div></td><td>{customer.contact}</td><td><span className={styles.contactText}>{customer.phone}<small>{customer.email}</small></span></td><td>{customer.city || "—"}</td><td><span className={`${styles.typePill} ${customer.type === "Zakelijk" ? styles.business : ""}`}>{customer.type}</span></td><td>{customer.lastActivity}</td><td><button className={styles.rowAction} onClick={() => notify(`Klantkaart van ${customer.name} wordt geopend in de volgende versie.`)} aria-label="Klantdetails"><Icon name="more" /></button></td></tr>)}</tbody></table>{filteredCustomers.length === 0 && <EmptyState text="Geen klanten gevonden. Pas je zoekopdracht aan." />}</div></section>
        </>}
        {view === "Offertes" && <>
          <div className={styles.pageHeading}><div><h1>Offertes <span className={styles.headingCount}>{data.quotes.length}</span></h1><p>Maak offertes, volg reacties op en houd versies overzichtelijk.</p></div><button className={styles.primaryButton} onClick={() => { const request = data.requests.find((item) => item.status !== "Gewonnen" && !data.quotes.some((quote) => quote.requestId === item.id)); if (request) openQuote(request); else notify("Maak eerst een nieuwe aanvraag of kies een aanvraag zonder offerte."); }}><Icon name="plus" size={17} /> Offerte opstellen</button></div>
          <div className={styles.quoteStats}><div><span>Openstaand bedrag</span><b>{money(pendingQuotes)}</b></div><div><span>Geaccepteerd in demo</span><b>{data.quotes.filter((quote) => quote.status === "Geaccepteerd").length}</b></div><div><span>Conversie besliste offertes</span><b>{conversionPercent}<span className={styles.percent}>%</span></b></div><div className={styles.quoteStatHint}><span>Offertes met besluit</span><b>{decidedQuotes.length}</b></div></div>
          <div className={styles.listToolbar}><div className={styles.filterLabel}><Icon name="file" size={15} /> Alle offertes <span>{filteredQuotes.length}</span></div><span className={styles.mutedText}>Versies worden automatisch bewaard</span></div>
          <section className={styles.panel}><div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>Offertenummer</th><th>Klant en werkzaamheid</th><th>Bedrag incl. btw</th><th>Vervaldatum</th><th>Status</th><th>Opgesteld</th><th>Actie</th></tr></thead><tbody>{filteredQuotes.map((quote) => <tr key={quote.id}><td><b className={styles.code}>{quote.number}</b></td><td><div className={styles.quoteCustomer}><b>{quote.customer}</b><small>{quote.service}</small></div></td><td className={styles.amountCell}>{money(quote.total)}</td><td>{quote.expiresAt}</td><td><Status value={quote.status} /></td><td>{quote.createdAt}</td><td>{quote.status === "In concept" ? <button className={styles.tableAction} onClick={() => updateQuoteStatus(quote, "Verzonden")}>Verstuur</button> : quote.status === "Verzonden" ? <div className={styles.inlineActions}><button className={styles.acceptAction} onClick={() => updateQuoteStatus(quote, "Geaccepteerd")}>Akkoord</button><button className={styles.rejectAction} onClick={() => updateQuoteStatus(quote, "Afgewezen")}>Afwijzen</button></div> : <button className={styles.rowAction} onClick={() => notify(`PDF van ${quote.number} is klaar zodra documentverwerking is gekoppeld.`)} aria-label="Offerteopties"><Icon name="more" /></button>}</td></tr>)}</tbody></table>{filteredQuotes.length === 0 && <EmptyState text="Geen offertes gevonden." />}</div></section>
        </>}
        {view === "Taken" && <>
          <div className={styles.pageHeading}><div><h1>Opvolgtaken <span className={styles.headingCount}>{data.tasks.filter((task) => !task.done).length}</span></h1><p>Houd afspraken en commerciële opvolging in beweging.</p></div><button className={styles.secondaryButton} onClick={() => notify("Nieuwe taken toevoegen volgt in de volgende versie.")}><Icon name="plus" size={16} /> Taak toevoegen</button></div>
          <div className={styles.taskSummary}><div><span className={styles.taskSummaryIcon}><Icon name="clock" size={17} /></span><span>Openstaande taken</span><b>{data.tasks.filter((task) => !task.done).length}</b></div><div><span className={styles.taskSummaryIcon}><Icon name="check" size={17} /></span><span>Afgerond deze week</span><b>{completedTasks}</b></div><div><span className={styles.taskSummaryIcon}><Icon name="users" size={17} /></span><span>Toegewezen aan team</span><b>2 <small>medewerkers</small></b></div></div>
          <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Alle opvolgtaken</h2><p>Werk taken af zodra je contact hebt gehad.</p></div><button className={styles.secondaryButton} onClick={() => setData((previous) => ({ ...previous, tasks: [...previous.tasks].sort((a, b) => Number(a.done) - Number(b.done)) }))}><Icon name="filter" size={15} /> Status</button></div><div className={styles.fullTaskList}>{data.tasks.map((task) => <div key={task.id} className={`${styles.fullTaskRow} ${task.done ? styles.taskDone : ""}`}><button className={`${styles.taskCheck} ${task.done ? styles.checked : ""}`} onClick={() => toggleTask(task.id)} aria-label={task.done ? "Markeer als open" : "Markeer als afgerond"}>{task.done && "✓"}</button><div className={styles.taskCopy}><b>{task.title}</b><span>{task.customer}</span></div><span className={styles.taskDue}><Icon name="clock" size={14} />{task.due}</span><span className={styles.taskOwner}><span className={styles.miniAvatar}>{initials(task.owner)}</span>{task.owner}</span><Status value={task.done ? "Afgerond" : "In behandeling"} /></div>)}</div></section>
        </>}
        {view === "Rapportages" && <>
          <div className={styles.pageHeading}><div><h1>Rapportages</h1><p>Commerciële prestaties op basis van de gegevens in je CRM.</p></div><select className={styles.selectCompact} value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Periode"><option>Deze maand</option><option>Deze week</option><option>Dit jaar</option></select></div>
          <section className={styles.metricGrid}><Metric title="Nieuwe aanvragen" value={String(data.requests.length)} note="Geregistreerd in demo" icon="inbox" tone="green" trend="" /><Metric title="Verzonden offertes" value={String(data.quotes.filter((quote) => quote.status === "Verzonden" || quote.status === "Geaccepteerd").length)} note="Incl. geaccepteerde offertes" icon="file" tone="blue" trend="" /><Metric title="Offerteconversie" value={`${conversionPercent}%`} note="Op basis van besliste demo-offertes" icon="chart" tone="amber" trend="" /><Metric title="Gem. offertewaarde" value={money(data.quotes.length ? data.quotes.reduce((sum, quote) => sum + quote.total, 0) / data.quotes.length : 0)} note="Inclusief btw" icon="spark" tone="violet" trend="" /></section>
          <section className={styles.dashboardGrid}><div className={styles.panel}><div className={styles.panelHeader}><div><h2>Aanvragen per fase</h2><p>Waar bevinden kansen zich op dit moment?</p></div></div><div className={styles.funnel}>{["Nieuw", "In behandeling", "Offerte in voorbereiding", "Offerte verzonden", "Gewonnen"].map((status) => { const count = data.requests.filter((request) => request.status === status).length; const width = Math.max(12, Math.round((count / Math.max(data.requests.length, 1)) * 100)); return <div key={status} className={styles.funnelRow}><span>{status}</span><div><i style={{ width: `${width}%` }} /></div><b>{count}</b><small>{money(data.requests.filter((request) => request.status === status).reduce((sum, request) => sum + request.amount, 0))}</small></div>; })}</div></div><div className={styles.panel}><div className={styles.panelHeader}><div><h2>Teamactiviteit</h2><p>Geregistreerde demo-aanvragen</p></div></div><div className={styles.teamRows}><div><span className={styles.avatar}>MD</span><b>Mark de Vries</b><strong>{ownerRequestCount("Mark de Vries")} <small>aanvragen</small></strong></div><div><span className={styles.avatar}>LB</span><b>Lisa Bakker</b><strong>{ownerRequestCount("Lisa Bakker")} <small>aanvragen</small></strong></div><p className={styles.reportNote}>Cijfers zijn afgeleid van de gegevens in deze demo.</p></div></div></section>
        </>}
      </div>
    </main>
    {dialog && <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}><div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className={styles.modalHeader}><div><h2 id="modal-title">{dialog === "request" ? "Nieuwe aanvraag" : dialog === "customer" ? "Klant toevoegen" : `Offerte voor ${dialog.request.customer}`}</h2><p>{dialog === "request" ? "Leg de aanvraag vast en plan je volgende stap." : dialog === "customer" ? "Bewaar contactgegevens voor snelle opvolging." : `Maak een concept voor ${dialog.request.service}.`}</p></div><button className={styles.modalClose} onClick={() => setDialog(null)} aria-label="Sluiten"><Icon name="close" size={18} /></button></div>
      {dialog === "request" && <form className={styles.form} onSubmit={createRequest}><label>Naam klant<input name="customer" placeholder="Bijv. Familie Jansen" required /></label><div className={styles.formRow}><label>Contactpersoon<input name="contact" placeholder="Voor- en achternaam" /></label><label>E-mailadres<input name="email" type="email" placeholder="naam@bedrijf.nl" /></label></div><div className={styles.formRow}><label>Telefoon<input name="phone" type="tel" placeholder="+31 6 1234 5678" /></label><label>Plaats<input name="city" placeholder="Utrecht" /></label></div><div className={styles.formRow}><label>Type werkzaamheden<input name="service" placeholder="Bijv. warmtepomp" required /></label><label>Geschatte waarde <span className={styles.inputSuffix}><input name="amount" type="number" min="0" step="50" placeholder="3500" required /><i>€</i></span></label></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setDialog(null)}>Annuleren</button><button type="submit" className={styles.primaryButton}><Icon name="plus" size={16} /> Aanvraag opslaan</button></div></form>}
      {dialog === "customer" && <form className={styles.form} onSubmit={createCustomer}><label>Klant- of bedrijfsnaam<input name="name" placeholder="Bijv. Familie Jansen" required /></label><div className={styles.formRow}><label>Contactpersoon<input name="contact" placeholder="Voor- en achternaam" /></label><label>Type klant<select name="type"><option>Particulier</option><option>Zakelijk</option></select></label></div><div className={styles.formRow}><label>E-mailadres<input name="email" type="email" placeholder="naam@bedrijf.nl" /></label><label>Telefoon<input name="phone" type="tel" placeholder="+31 6 1234 5678" /></label></div><label>Plaats<input name="city" placeholder="Utrecht" /></label><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setDialog(null)}>Annuleren</button><button type="submit" className={styles.primaryButton}><Icon name="plus" size={16} /> Klant opslaan</button></div></form>}
      {typeof dialog === "object" && <form className={styles.form} onSubmit={(event) => createQuote(event, dialog.request)}><div className={styles.quotePreview}><div><span>Werkzaamheden</span><b>{dialog.request.service}</b><small>{dialog.request.customer}</small></div><strong>{money(dialog.request.amount)}</strong></div><label>Korting<input name="discount" type="number" min="0" max="100" step="1" defaultValue="0" /><small className={styles.fieldHelp}>Het bedrag uit de aanvraag wordt als inclusief btw behandeld (21%).</small></label><div className={styles.aiField}><div className={styles.aiFieldHeader}><div><b>Concepttekst</b><span>{aiFallback ? "Veilige basistekst; Ollama was niet bereikbaar" : aiModel ? `Gemaakt met ${aiModel}` : "Lokaal via Ollama, met veilige fallback"}</span></div><button type="button" className={styles.secondaryButton} disabled={aiLoading} aria-busy={aiLoading} onClick={() => makeAiDraft(dialog.request)}><Icon name="spark" size={16} /> {aiLoading ? "Bezig…" : "Maak concept"}</button></div><textarea name="aiDraft" value={aiDraft} onChange={(event) => setAiDraft(event.target.value)} placeholder="Laat Ollama een concept schrijven of gebruik de veilige basistekst." rows={6} />{aiError && <p className={styles.aiError} role="alert">{aiError}</p>}<a className={styles.ollamaSupport} href="https://ollama.com" target="_blank" rel="noreferrer"><Image src="/ollama.png" alt="" width={20} height={20} />Ondersteund door Ollama</a></div><div className={styles.quoteHint}><Icon name="spark" size={16} /><span>Controleer altijd de tekst, bedragen, btw en klantgegevens voordat je iets verstuurt.</span></div><div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={() => setDialog(null)}>Annuleren</button><button type="submit" className={styles.primaryButton}><Icon name="file" size={16} /> Concept opslaan</button></div></form>}
    </div></div>}
    {toast && <div className={styles.toast}><span>✓</span>{toast}</div>}
  </div>;
}

function Metric({ title, value, note, icon, tone, trend }: { title: string; value: string; note: string; icon: string; tone: string; trend: string }) {
  const toneClass: Record<string, string> = { green: styles.metricGreen, blue: styles.metricBlue, amber: styles.metricAmber, violet: styles.metricViolet };
  return <article className={styles.metricCard}><div className={styles.metricTop}><span>{title}</span><div className={`${styles.metricIcon} ${toneClass[tone]}`}><Icon name={icon} size={17} /></div></div><div className={styles.metricValue}>{value}</div><div className={styles.metricBottom}><span>{note}</span>{trend && <b>↗ {trend}</b>}</div></article>;
}

function RequestTable({ requests, onStatus, onQuote }: { requests: Request[]; onStatus: (id: string, status: string) => void; onQuote: (request: Request) => void }) {
  return <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>Aanvraag</th><th>Klant</th><th>Werkzaamheden</th><th>Waarde</th><th>Status</th><th>Verantwoordelijke</th><th /></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td><b className={styles.code}>{request.number}</b><small className={styles.rowMeta}>{request.createdAt}</small></td><td><div className={styles.customerCell}><div className={styles.customerAvatar}>{initials(request.customer)}</div><b>{request.customer}</b></div></td><td><span className={styles.serviceCell}>{request.service}<small>{request.location}</small></span></td><td className={styles.amountCell}>{money(request.amount)}</td><td><select aria-label={`Status van ${request.number}`} className={`${styles.statusSelect} ${styles[`select${request.status.replaceAll(" ", "")}`] || ""}`} value={request.status} onChange={(event) => onStatus(request.id, event.target.value)}>{["Nieuw", "In behandeling", "Informatie nodig", "Offerte in voorbereiding", "Offerte verzonden", "Gewonnen", "Verloren", "Gesloten"].map((status) => <option key={status}>{status}</option>)}</select></td><td><span className={styles.ownerCell}><span className={styles.miniAvatar}>{initials(request.owner)}</span>{request.owner}</span></td><td><div className={styles.rowActions}>{request.status !== "Gewonnen" && request.status !== "Verloren" && <button className={styles.tableAction} onClick={() => onQuote(request)} title="Offerte opstellen"><Icon name="file" size={14} /></button>}<button className={styles.rowAction} aria-label="Meer opties"><Icon name="more" /></button></div></td></tr>)}</tbody></table>{requests.length === 0 && <EmptyState text="Geen aanvragen gevonden. Pas je zoekopdracht aan of registreer een nieuwe aanvraag." />}</div>;
}

function EmptyState({ text }: { text: string }) { return <div className={styles.emptyState}><span><Icon name="search" size={20} /></span><b>Geen resultaten</b><p>{text}</p></div>; }
