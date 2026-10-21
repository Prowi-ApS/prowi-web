/* ---- Page behaviour: ported from Prowi Homepage.dc.html (Claude Design) to the Webflow DOM ---- */
(function () {
  'use strict';
  var d = document, w = window;
  var root = d.querySelector('.pw-root'); if (!root) return;
  var LANG = ((d.documentElement.getAttribute('lang') || 'da').toLowerCase().indexOf('en') === 0) ? 'en' : 'da';
  var DA = LANG === 'da';
  var EASE = 'cubic-bezier(0.2,0.6,0.2,1)', EM = 'cubic-bezier(0.2,0.8,0.2,1)', SPRING = 'cubic-bezier(0.3,1.25,0.5,1)';
  var REDUCED = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // the same bundle runs on every new page; homepage-only modules check HOME (the hero only exists there)
  var HOME = !!root.querySelector('.pw-hero');
  // Class names are the readable Webflow names (pw-<block>__<part>); see CLASSES.md for the full list.
  var tol = function (sel) { return sel; };
  var q = function (sel, el) { return (el || d).querySelector(tol(sel)); };
  var qa = function (sel, el) { return Array.prototype.slice.call((el || d).querySelectorAll(tol(sel))); };
  var vw = function () { return d.documentElement.clientWidth || w.innerWidth; };
  var vh = function () { return w.innerHeight || d.documentElement.clientHeight || 800; };
  var raf = w.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  // scroll may happen on the window or on an inner scroll container (embeds, previews): listen to both
  var onScroll = function (fn) {
    var h = function () { raf(fn); };
    w.addEventListener('scroll', h, { passive: true });
    d.addEventListener('scroll', h, { passive: true, capture: true });
  };
  var tween = function (ms, fn, ease, delay) {
    var t0 = performance.now() + (delay || 0);
    var step = function (now) {
      var p = Math.max(0, Math.min(1, (now - t0) / ms));
      var e = ease ? ease(p) : (1 - Math.pow(1 - p, 3));
      fn(e, p);
      if (p < 1) raf(step);
    };
    raf(step);
  };
  var easeInOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var easeOut4 = function (p) { return 1 - Math.pow(1 - p, 4); };
  var fmtDa = function (n) { return Math.round(n).toLocaleString('da-DK'); };
  var fmtEn = function (n) { return Math.round(n).toLocaleString('en-GB'); };
  var sceneProps = function (el, patch) {
    if (!el) return;
    var cur = {}; try { cur = JSON.parse(el.getAttribute('data-scene-props') || '{}'); } catch (e) {}
    el.setAttribute('data-scene-props', JSON.stringify(Object.assign(cur, patch)));
    if (w.__pwScenes) w.__pwScenes.setProps(el, patch);
  };
  var once = function (el, cb, threshold, rootMargin) {
    if (!el) return;
    if (!w.IntersectionObserver) { cb(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); cb(); }
    }, { threshold: threshold == null ? 0.35 : threshold, rootMargin: rootMargin || '0px' });
    io.observe(el);
  };

  /* ---------- CSS the page behaviour needs (src/page.css) ----------
     The live page carries the same CSS in the page head (<style id="pw-css">) so it applies at first paint;
     the bundle only injects it where that tag is missing (preview, other pages). */
  if (!d.getElementById('pw-css')) {
    var style = d.createElement('style'); style.id = 'pw-css';
    style.textContent = w.__PW_CSS || '';
    d.head.appendChild(style);
  }
  d.documentElement.classList.add('pw-js');

  /* ---------- Routes per locale (for the burger menu + language switch) ---------- */
  var ROUTES = {
    da: { why: '#why', platform: '/platform', app: '/medarbejder-app', customers: '/kunder', pricing: '/pris', about: '/om-os', careers: '/karriere', demo: '/demo', login: 'https://app.prowi.io/login' },
    en: { why: '#why', platform: '/en/platform', app: '/en/employee-app', customers: '/en/customers', pricing: '/en/pricing', about: '/en/about-us', careers: '/en/careers', demo: '/en/demo', login: 'https://app.prowi.io/login' }
  };
  var NAVTXT = {
    da: { why: 'Hvorfor Prowi', platform: 'Platform', app: 'Sælger-app', customers: 'Kunder', pricing: 'Priser', about: 'Om os', careers: 'Karriere', login: 'Log ind', cta: 'Book demo', menu: 'Menu', close: 'Luk' },
    en: { why: 'Why Prowi', platform: 'Platform', app: 'Rep app', customers: 'Customers', pricing: 'Pricing', about: 'About', careers: 'Careers', login: 'Log in', cta: 'Book a demo', menu: 'Menu', close: 'Close' }
  };

  /* ---------- English strings for text Webflow localisation cannot reach (mock-up chips, ledgers, labels inside DOM elements).
     Keys are the Danish strings from the export; values the English ones from the same export. No-op where Webflow already translated. ---------- */
  // On lang=en pages build.py moves the three maps below into their own file (dist/chunks/en.js); see the end of this file.
  function enStrings() {
    if (LANG !== 'en' || !w.NodeFilter) return;
    var M = {"Manifest": "Manifesto", "Officiel HubSpot-app": "Official HubSpot app", "Vurderet 5/5": "Rated 5/5", "Provisionssoftware": "Sales commission software", "til salgsteams i HubSpot.": "for sales teams on HubSpot.", "Revenue leaders sætter planen, RevOps styrer den, og sælgerne ser provisionen på telefonen i samme sekund dealen lukker.": "Revenue leaders set the plan, RevOps runs it, and reps see the commission on their phone the second the deal closes.", "Book demo": "Book a demo", "Eller se hvordan live provision driver den næste deal": "Or see how live commission powers the next win", "Læs historien": "Read the story", "Problemet": "The problem", "Det største håndtag, du har på momentum, kommer 6 uger for sent, i et regneark.": "But the biggest lever you have on momentum arrives 6 weeks late, in a spreadsheet.", "Dealen vindes i dag, men provisionen dukker op på lønsedlen 6 uger senere. På det tidspunkt er din sælger tre deals videre, og belønningen har intet med dealen at gøre.": "The deal is won today but the commission shows up on the payslip 6 weeks later. By then your rep is three deals further on, and the reward has nothing to do with the win.", "provision_jan_v7_ENDELIG(2).xlsx": "commission_jan_v7_FINAL(2).xlsx", "=HVIS.FEJL(LOPSLAG(B14;Planer!A:F;5;0)*C14;\"\")": "=IFERROR(VLOOKUP(B14,Plans!A:F,5,0)*C14,\"\")", "Sælger": "Rep", "Beløb": "Amount", "Provision": "Commission", "32.250 kr.": "€12,900", "2.580 kr.": "€1,032", "62.500 kr.": "€25,000", "21.000 kr.": "€8,400", "1.680 kr.": "€672", "Sv: Provision januar?": "Re: Commission January?", "I dag, 14:32": "Today, 14:32", "Til: finans@company.com": "To: finance@company.com", "Hej Mette,": "Hi Claire,", "Lige et hurtigt: hvad står jeg til denne måned? Arket siger 8.000 kr., men jeg lukkede Lumen d. 14., og den er ikke med.": "Quick one: what am I on this month? The sheet says €3,200, but I closed Lumen on the 14th and it's not in there.", "Mvh. Sam": "Thanks, Sam", "Det gør Prowi": "What Prowi does", "Så vi flyttede belønningen. Til det øjeblik, der betyder noget. Når dealen lukker.": "So we moved the reward. To the moment it matters. The win.", "I det sekund du flytter en deal til Closed Won i HubSpot, kører Prowi provisionsplanen på den. 4 sekunder senere,": "The second you move a deal to Closed Won in HubSpot, Prowi runs the comp plan on it. 4 seconds later,", ", viser sælgerens telefon, hvad han tjente. Prowi kører de provisionsplaner, du allerede har. Vi anvender dem bare i det øjeblik, det betyder noget.": ", the rep's phone shows what he earned. Prowi runs the comp plans you already have. We simply apply them the moment it matters.", "Men nogen skal køre planen": "But someone has to run the plan", "RevOps sætter planen op en gang. Derefter kører den på autopilot.": "RevOps sets the plan up once. From then on it runs on autopilot.", "Du bygger og styrer provisionsplanerne i admin-platformen. Dine sælgere har resultatet i lommen. Samme regler, samme deals, samme tal.": "You build and manage comp plans in the admin platform. Your reps carry the result in their pocket. Same rules, same deals, same number.", "250.000 kr.": "€48,000", "20.000 kr.": "€3,840", "Admin-platform": "Admin platform", "Byg planen en gang. Styr den uden regneark.": "Build the plan once. Manage it without spreadsheets.", "Sæt din provisionsplan op som regler på de HubSpot-deals, du allerede har: satser, trin, acceleratorer, SPIFFs, clawbacks. Ret en regel, og den gælder næste deal. Godkend en gang pr. periode, send en fil til løn.": "Set your comp plan up as rules on the HubSpot deals you already have: rates, tiers, accelerators, SPIFFs, clawbacks. Change a rule and it applies to the next deal. Approve once per period, send one file to payroll.", "Sælger-app": "Rep app", "Tallet, i hver sælgers lomme.": "The number, in every rep's pocket.", "Hver sælger ser sin live indtjening, hvad næste deal giver, og milepæle værd at jagte. En push det sekund en deal lukker. Intet at lære, intet at taste.": "Each rep sees live earnings, what the next deal pays and milestones worth chasing. A push the second a deal lands. Nothing to learn, nothing to fill in.", "Hent i": "Download on the", "Hent på": "Get it on", "Hvad der ændrer sig": "What changes", "Når provisionen kommer i samme øjeblik du lukker en deal, begynder provisionsplanen at virke.": "When the commission arrives with the win, the comp plan starts working.", "Du ændrer ikke, hvordan du betaler. Du ændrer, hvornår sælgerne ser det. En belønning, man hører om seks uger senere, er en bonus. En belønning, man ser i dag, er et mål, og den næste deal er vejen derhen.": "You don't change how you pay. You change when reps see it. A reward you learn about in six weeks is a bonus. A reward you see today is a target, and the next deal is how you hit it.", "Når sælgeren ser tallet": "When the rep sees the number", "Fra Closed won til lønsedlen": "From Closed won to the payslip", "Uger": "Weeks", "Fra Closed won til sælgerens telefon": "From Closed won to the rep's phone", "Øjeblikkeligt": "Instant", "For virksomheden": "For the company", "Mindre sandbagging. Mere Closed Won i dette kvartal.": "Less sandbagging. More Closed Won this quarter.", "Når en sælger kan se, hvad en deal giver i dag, er der ingen grund til at gemme den til næste kvartal. De tre deals under stregen lukker nu, og kvartalet går fra 86 % til over mål.": "When a rep can see what a deal pays today, there is no reason to hold it for next quarter. The three deals past the line close now, and the quarter goes from 86% to over target.", "Q4 2026 · Closed won mod mål": "Q4 2026 · Closed won vs target", "Mål": "Target", "1.200.000 kr.": "€480,000", "Closed won i kvartalet": "Closed won this quarter", "1.212.001 kr.": "€484,623", "+182.001 kr.": "+€72,623", "fra 3 deals, der ellers var gemt til næste kvartal": "from 3 deals that would have been held for next quarter", "Af mål": "Of target", "Næste kvartal": "Next quarter", "hvor sandbaggede deals venter": "where sandbagged deals wait", "Uge": "Week", "155k kr.": "€62k", "295k kr.": "€118k", "135k kr.": "€54k", "243k kr.": "€97k", "203k kr.": "€81k", "60k kr.": "€24k", "78k kr.": "€31k", "48k kr.": "€19k", "Men for RevOps": "But for RevOps", "Når hver sælger jagter den næste deal, flytter hele teamets kvartal sig.": "When every rep chases the next deal, the whole team's quarter moves.", "En sælger, der finder en ekstra deal, er en god eftermiddag. Hver sælger, hver uge, er en business case. Din plan belønner allerede det, du vil have: længere kontrakter, større deals, omsætning der lander nu. Når sælgerne ser reglerne live, sælger de efter dem. Du styrer det fra cockpittet; de mærker det i appen.": "One rep finding one extra deal is a good afternoon. Every rep, every week, is a business case. Your plan already rewards what you want: longer contracts, bigger deals, revenue that lands now. When reps see those rules live, they sell to them. You steer it from the cockpit; they feel it in the app.", "+2 % på flerårige kontrakter": "+2% on multi-year contracts", "12 % over 100 % af mål": "12% above 100% of target", "Clawback ved churn inden 90 dage": "Clawback on churn within 90 days", "SPIFF på den nye produktlinje": "SPIFF on the new product line", "Bonus ved betaling, ikke ved underskrift": "Bonus on payment received, not signature", "Hvad sælgere gør, når de ser den live": "What reps do when they see it live", "Beder om den treårige, ikke den etårige.": "Ask for the three-year, not the one-year.", "Hvad du får": "What you get", "Længere kontrakter. Kunder der bliver.": "Longer contracts. Customers that stay.", "Platformen": "The platform", "Alt herunder kører på de deals, der allerede ligger i din HubSpot. Intet at taste igen, intet at vedligeholde ved siden af.": "Everything below runs on the deals already in your HubSpot. Nothing to re-enter, nothing to maintain on the side.", "Salgsleder-visning": "Sales leader view", "Godkendelsesflow": "Approval flow", "Pipeline-kvalitet": "Pipeline quality", "RevOps-cockpit": "RevOps cockpit", "Konkurrencer": "Competitions", "Bygget til": "Built for", "Også": "Also", "Løn": "Payroll", "+11.475 kr. tjent": "+€4,590 earned", "Accelerator ramt": "Accelerator hit", "Trofæ ved 90 %": "Trophy at 90%", "Inden for rækkevidde": "Within reach", "En deal til på 9.600 kr. rammer målet.": "One more deal worth €3,840 hits target.", "Planen i hver sælgers lomme": "The plan, in every rep's pocket", "Live indtjening, rettidige nudges og milepæle, der er værd at jagte. Trofæ ved 90 %, krone ved 100 %. Fremgang, sælgerne kan mærke.": "Live earnings, timely nudges and milestones worth chasing. Trophy at 90%, crown at 100%. Progress reps can feel.", "Oktober": "October", "Mål pr.": "Targets by", "Måned": "Month", "Kvartal": "Quarter", "År": "Year", "Et scoreboard, i det åbne": "One scoreboard, in the open", "Teamets stilling på de samme live tal, alle har tillid til. Sæt mål, kør konkurrencer, se adfærden flytte sig, mens perioden stadig er åben.": "Team standings on the same live numbers everyone trusts. Set targets, run competitions, watch behavior shift while the period is still open.", "Alle er enige om tallet, før det udbetales.": "Everyone agrees on the number before it's paid.", "Hver periode bekræfter sælgerne deres egen opgørelse deal for deal, ledere afklarer spørgsmål på dealen, finans godkender en gang. Hvert trin logges.": "Each period, reps confirm their own statement deal by deal, managers resolve any questions on the deal, finance approves once. Every step logged.", "69.500 kr.": "€27,800", "78.000 kr.": "€31,200", "Dealtype": "Deal type", "Ny deal": "New deal", "Krydssalg": "Cross sell", "Lukkedato": "Close date", "okt.": "Oct", "Rettet af sælgeren i HubSpot, to minutter efter dealen ikke matchede forventningen.": "Fixed by the rep in HubSpot, two minutes after the deal didn't match their expectation.", "Jeres pipeline bliver skarpere. Af sig selv.": "Your pipeline gets sharper. On its own.", "Sælgere vil have den rigtige løn, så de retter selv dealen i HubSpot: beløb, stadie, custom properties. Før det koster dem.": "Reps care about getting paid right, so they fix the deal in HubSpot themselves: amount, stage, custom properties. Before it costs them.", "4.606.500 kr.": "€ 1.842.600", "383.875 kr.": "€ 153.550", "Hver krone i provision, på en skærm.": "Every dollar of commission, on one screen.", "Samlet udbetaling, gennemsnit pr. periode og hver måned opdelt i Udbetalt, Afventer godkendelse og Aktuel. Finans og RevOps ser planens omkostning, mens det sker, ikke efter lønkørslen.": "Total payout, average per period and every month split by Paid, Awaiting approval and Current. Finance and RevOps see the cost of the plan as it happens, not after payroll.", "Et live leaderboard, beregnet på rigtige deals.": "A live leaderboard, calculated from real deals.", "Vælg en periode, deltagerne og hvad der tæller. Prowi rangerer alle ud fra dine CRM-data, opdaterer hvert par sekunder og sætter top tre på podiet. Sælgerne ser det i appen; teams sætter det på kontorskærmen.": "Pick a period, the participants and what counts. Prowi ranks everyone from your CRM data, refreshes every few seconds, and puts the top three on a podium. Reps see it in the app; teams put it on the office screen.", "Beviset": "Evidence", "Momentum, man kan måle.": "Momentum you can measure.", "Provision var noget, vi forklarede omkring lønkørslen. Nu kører teamet selv med det, og diskussionerne handler om deals, ikke udbetalinger.": "Commission used to be something we explained around payroll. Now the team runs with it themselves, and the discussions are about deals, not payouts.", "sælgere": "reps", "på live provision": "on live commission", "Planen er den samme som før. Forskellen er, at alle kan se den, mens det stadig betyder noget.": "The plan is the same as before. The difference is that everyone can see it while it still matters.", "% af sælgerne": "% of reps", "åbner appen i periodens første uge": "open the app in week one of a period", "Kører på HubSpot": "Runs on HubSpot", "Det månedlige godkendelsesflow gør provisionen gennemskuelig, og afregnet korrekt, hver gang.": "The monthly approval flow makes commission transparent, and settled correctly, every time.", "% nøjagtighed": "% accuracy", "godkendt og afstemt": "approved & reconciled", "Vi havde sat en ny medarbejders provision op i et Google Sheet, koblet til HubSpot via Zapier. Det virkede stadig ikke.": "We'd set up a new hire's commission in a Google Sheet, wired to HubSpot through Zapier. It still didn't work.", "værktøjer": "tools", "sheet, Zapier og lapper erstattet": "sheet, Zapier & patches replaced", "Medstifter, Returnflows": "Co-founder, Returnflows", "Kom i gang": "Getting started", "Brændt af provisionsværktøjer før? Live på fire uger, på den HubSpot-portal du allerede har.": "Burned by comp tools before? Live in four weeks, on the HubSpot portal you already have.", "Uge 1": "Week 1", "Forstå dit dealflow og din plan": "Understand your deal flow & plan", "Hvad der logges på en deal, hvilket stadie provisionen tæller på, hver regel og tærskel, kortlagt sammen med dig.": "What's logged on a deal, which stage commission counts on, every rule and threshold, mapped together with you.", "Uge 2–3": "Weeks 2–3", "Bevis tallene": "Prove the numbers", "Prowi kører mod din sidste lukkede periode, sammen med finans, indtil hvert tal stemmer.": "Prowi runs against your last closed period, with finance, until every number matches.", "Uge 4": "Week 4", "Lancer til sælgerne": "Launch to your reps", "Sælgerne åbner appen og ser live tal fra dag et. Intet at lære, intet at sætte op.": "Reps open the app and see live numbers from day one. Nothing to learn, nothing to set up.", "Første lønkørsel": "First payout cycle", "Finjuster første cyklus": "Tune the first cycle", "Godkend, send til løn, og se hvilken adfærd der flyttede sig. Så justerer vi planen sammen.": "Approve, hand off to payroll, and see which behavior shifted. Then we tune the plan together.", "kaffe.": "coffee.", "kode.": "code.", "Ingen platformsgebyr": "No platform fee", "Du betaler pr. bruger på en plan. Intet pr. måned bare for at have en konto.": "You pay per user on a plan. Nothing per month just to have an account.", "Ingen gebyr pr. integration": "No per-integration fee", "HubSpot, Pipedrive, løn- og regnskabsintegrationer er en del af pakken, ikke solgt enkeltvis.": "HubSpot, Pipedrive, payroll and accounting connectors are part of the tier, not sold one by one.", "Økonomi og admins er gratis": "Finance and admins are free", "Brugere tælles for dem, der tjener provision, ikke for dem, der godkender den.": "Seats are counted for people who earn commission, not for the people who approve it.", "Et onboardinggebyr, på forhånd": "One onboarding fee, up front", "Afdækning, opbygning af plan, en parallel testperiode og go-live. Ingen timeoverraskelser.": "Discovery, plan build, a parallel test period and go-live. No hourly surprises.", "Åben provision pr. plan og pr. deal, opdateret når HubSpot flytter sig": "Open commission by plan and by deal, updated as HubSpot moves", "Swipe tilbage gennem perioder: hver især en komplet opgørelse": "Swipe back through periods: each one a complete statement", "Tryk på en deal og se sats, accelerator og endeligt beløb": "Tap any deal to see rate, accelerator and final amount", "Push på hver lukket deal, 4 sekunder efter HubSpot": "Push on every closed deal, 4 seconds after HubSpot", "Milepæle: trofæ ved 90 %, krone ved 100 %": "Milestone alerts: trophy at 90%, crown at 100%", "Stillingen i konkurrencen, når en placering skifter": "Competition standings when a place changes", "Målopfyldelse live, pr. plan og pr. periode": "Target attainment live, per plan and per period", "Milepæle ved 90 % og 100 % med den deal, der får dem derhen": "Milestones at 90% and 100% with the deal that gets them there", "Hvad den næste deal giver, før de jagter den": "What the next deal pays, before they chase it", "Sælger bekræfter, leder gennemgår, økonomi godkender": "Rep confirms, manager reviews, finance approves", "Spørgsmål stilles på dealen og løses før lønkørslen": "Questions raised on the deal, resolved before payroll", "Hver godkendelse logget med hvem, hvad og hvornår": "Every approval logged with who, what and when", "Sælgerne ser deres egne tal, lederne deres team": "Reps see their own numbers, managers their team", "Konkurrencer viser målopfyldelse, ikke penge": "Competitions show attainment, not money", "Hosting i EU, GDPR-compliant, SOC 2": "EU hosting, GDPR compliant, SOC 2", "Se godkendelser i sælger-appen": "See approvals in the rep app", "Trin 1 · sælgeren": "Step 1 · the rep", "Trin 2 · lederen": "Step 2 · the manager", "Trin 3 · økonomi": "Step 3 · finance", "Tillid": "Trust", "Prøv korrektionsberegneren": "Try the corrections calculator", "Opdag": "Detect", "Genberegn": "Recalculate", "Kæde": "Chain", "Politik": "Policy", "Se HubSpot-integrationen": "See the HubSpot integration", "Øjeblikket": "The moment", "Opgørelsen": "The statement", "Sikkerhedsnettet": "The safety net", "En godkendt fil pr. periode til Zenegy, Visma, Danløn eller e-conomic": "One approved file per period to Zenegy, Visma, Danløn or e-conomic", "Periodisering med, så økonomi bogfører provisionen i den rigtige måned": "Accruals included, so finance books commission in the right month", "Hver linje kan spores til en deal og en regel": "Every line traceable to a deal and a rule", "Gennemsnitsprovision i feriepengene, beregnet pr. sælger": "Average commission on holiday pay, calculated per rep", "Sygdom og barsel håndteret efter de samme regler": "Sick leave and parental leave handled by the same rules", "Dansk arbejdsret indbygget, ingen manuelle justeringer": "Danish labour-law compliance built in, no manual adjustments", "Fuld historik på hver opgørelse og hver ændring": "Full history on every statement and every change", "Godkendelser logget med hvem, hvad og hvornår": "Approvals logged with who, what and when", "SOC 2-compliant; data hostet i EU": "SOC 2 compliant; data hosted in the EU", "Løn- og CRM-integrationer": "Payroll and CRM integrations", "Saldo": "Balance", "Udbetalingskørsel": "Payout run", "Fravær": "Leave", "Til salgsledere": "For sales leaders", "Ledere": "Leaders", "Gennemse trappe-, accelerator- og kicker-modeller": "Browse tiered, accelerator and kicker models", "Modeller": "Models", "Ændring": "Change", "Book en arbejdssession med Anders": "Book a working session with Anders", "Byg": "Build", "Kør": "Run", "Se": "See", "Gennemse biblioteket af provisionsmodeller": "Browse the commission model library", "Simuler": "Simulate", "Forhåndsvis": "Preview", "Publicer": "Publish", "Målopfyldelse og indtjening pr. sælger, opdateret når deals lukker": "Attainment and earnings per rep, updated as deals close", "Milepæle ved 90 % og 100 %, som sælgerne faktisk jagter": "Milestones at 90% and 100% that reps actually chase", "Push-notifikation på hver lukket deal, 4 sekunder efter HubSpot": "Push notification on every closed deal, 4 seconds after HubSpot", "Enhver metrik på en HubSpot-deal: omsætning, møder, produkt, margin": "Any metric on a HubSpot deal: revenue, meetings, product, margin", "Team eller individuel, fra ugentlig til kvartalsvis": "Team or individual, weekly to quarterly", "Leaderboard i appen og på lederens dashboard": "Leaderboard in the app and on the manager dashboard", "Satser, trin, acceleratorer, SPIFFs og splits som regler": "Rates, tiers, accelerators, SPIFFs and splits as rules", "Gælder fra en dato, du vælger; historikken urørt": "Effective from a date you choose; history untouched", "Sælgerne ser den nye regel, og hvad den er værd, før de jagter den": "Reps see the new rule and what it is worth before they chase it", "Provision sporet til dealen og det felt, den kom fra": "Commission traced to the deal and the property it came from", "Spørgsmål stilles på dealen, ikke ved lønkørslen": "Questions raised on the deal, not at payroll", "Renere HubSpot-data uden en oprydningskampagne": "Cleaner HubSpot data without a hygiene campaign", "En samtale med": "A conversation with", "Nøglefunktioner": "Key features", "Udfordring": "Challenge", "Løsning": "Solution", "Resultater": "Results", "Historien i fem trin": "The story in five beats", "Flere historier": "More stories", "Kunder": "Customers", "Sådan fik en nordisk IT-servicekoncern 100+ sælgere på live provision og flyttede samtalen fra udbetalinger til deals": "How a Nordic IT services group put 100+ reps on live commission, and moved the conversation from payouts to deals", "Sådan gav Talentech et nordisk salgsteam 10 timer om måneden tilbage, og sælgerne en grund til at åbne appen": "How Talentech gave a Nordic sales team back 10 hours a month, and their reps a reason to check the app", "Sådan gjorde Bazoom Group provision til noget, økonomi godkender, ikke noget økonomi diskuterer": "How Bazoom Group made commission something finance signs off, not something finance argues about", "Sådan erstattede Returnflows et Google Sheet, Zapier og en masse tålmodighed med et live tal": "How Returnflows replaced a Google Sheet, Zapier and a lot of patience with one live number"};
    var MT = {"Grundløn (årlig)": "Base salary (annual)", "Provision ved målopfyldelse (årlig)": "On-target commission (annual)", "Hele den variable løn, en sælger tjener ved præcis 100 % af målet.": "The full variable a rep earns at exactly 100% of target.", "Salgsmål (årligt)": "Sales quota (annual)", "Virksomhedens omsætning": "Company revenue", "OTE (løn ved målopfyldelse)": "On-target earnings", "Grundløn": "Base", "og provision ved målopfyldelse": "and on-target commission", "Balanceret. Typisk for account executives.": "Balanced. Typical for account executives.", "Hvad sælgeren tjener ved": "What the rep earns at", "Lineær provision. Rigtige planer tilføjer acceleratorer over 100 % og ofte et gulv under 70 %. Prowi kører de regler live, deal for deal.": "Linear commission. Real plans add accelerators above 100% and often a floor below 70%. Prowi runs those rules live, deal by deal.", "Sælgere på provision": "Reps on commission", "Provision udbetalt pr. år": "Commission paid per year", "Samlet variabel løn i teamet.": "Total variable pay across the team.", "Økonomi/ops-tid på provision": "Finance / ops time on commission", "Bygge arket, jagte data, svare på spørgsmål, rette lønnen.": "Building the sheet, chasing data, answering questions, fixing payroll.", "Sælgertid på at tjekke provision": "Rep time checking commission", "Afstemme deres eget tal, rejse indsigelser.": "Reconciling their own number, raising disputes.", "Antagelser (kan redigeres)": "Assumptions (editable)", "Timepris, økonomi": "Finance hourly cost", "Timepris, sælger": "Rep hourly cost", "Overbetalinger i dag": "Overpayments today", "Tid fjernet af Prowi": "Time removed by Prowi", "Prøv det. I marts bliver Acme-dealen fra januar…": "Try it. In March, the Acme deal from January…", "Vindue: 3 perioder efter beregning. Slutter efter 2 beregninger mere.": "Window: 3 periods after calculation. Ends after 2 more calculations.", "Intet er ændret i januars data, så intet flytter sig. Vælg et scenarie ovenfor.": "Nothing changed in January’s data, so nothing moves. Pick a scenario above.", "Stærkt fit": "Strong fit", "Book en demo": "Book a demo", "de fem akser ovenfor ganges med": "the five axes above are multiplied by", "Seneste": "Latest", "min. læsetid": "min read", "Læs artiklen": "Read article", "Søg i artikler, fx accelerator, OTE, clawback": "Search articles, e.g. accelerators, OTE, clawback", "Opdateret": "Updated", "Indhold": "Contents", "Se det på din egen plan": "See it on your own plan", "Tredive minutter, jeres CRM, jeres regler.": "Thirty minutes, your CRM, your rules.", "Book demo": "Book a demo", "Læs videre": "Keep reading", "Prowi": "Prowi", "Hvad er provision?": "What is commission?", "Hvad er bonus?": "What is a bonus?", "Søg efter begreb, fx accelerator, ARR, clawback": "Search terms, e.g. accelerator, ARR, clawback", "Søg i ordbogen": "Search the glossary", "66 af 66": "66 of 66", "Provisionsbegreb": "Commission term", "Relaterede begreber": "Related terms", "25 af 25": "25 of 25", "Sådan bygges planen typisk": "How the plan is usually built", "Hvad Prowi gør med den": "What Prowi does with it", "Regneeksempel": "Worked example", "Andre brancher": "Other business types", "Søg i integrationer, fx HubSpot, Visma, fakturaer": "Search integrations, e.g. HubSpot, Visma, invoices", "Søg i integrationer": "Search integrations", "28 af 28": "28 of 28", "1 live": "1 live", "Live": "Live", "På roadmappet": "On the roadmap", "API": "API", "Forbind jeres eget system": "Connect your own system", "Eget CRM, ERP eller fakturering? Send deals og fakturaer gennem REST-API’et, så behandler Prowi dem som enhver anden kilde.": "Custom CRM, ERP or billing? Push deals and invoices through the REST API and Prowi treats them like any native source.", "Skræddersyet": "Bespoke", "Mangler I en integration, vi ikke har?": "Need an integration we don’t have?", "Fortæl os systemet. Kører nok teams på det, bygger vi det, og I kommer først.": "Tell us the system. If enough teams run on it, we build it, and you go first.", "Hvad synkroniseres": "What syncs", "Prowi for": "Prowi for", "Data": "Data", "Fordele": "Pros", "Ulemper": "Cons", "Bedst til": "Best for", "Typiske roller": "Typical roles", "Andre modeller": "Other models", "Prøv med jeres tal": "Try it with your numbers", "100 % af målet": "100% of quota", "udbetaling": "payout", "Hvor det begyndte": "Where it began", "Søren Søe Holm, medstifter. Aarhus.": "Søren Søe Holm, founder. Aarhus.", "Ti timer om måneden tilbage, og sælgere der tjekker appen.": "Ten hours a month back, and reps who check the app.", "Provision, som økonomi skriver under på i stedet for at diskutere.": "Commission finance signs off, not argues about.", "Et live tal i stedet for et regneark, Zapier og tålmodighed.": "One live number instead of a sheet, Zapier and patience.", "Brancher": "Business types", "SaaS-virksomheder": "SaaS companies", "IT-virksomheder": "IT companies", "Medier & marketing": "Media & marketing", "E-handelssoftware": "E-commerce software", "Læring & EdTech": "Learning & EdTech", "Retail & workforce-tech": "Retail & workforce tech", "Talentech, HR-SaaS": "Talentech, HR SaaS", "Nordisk IT-servicekoncern, 100+ sælgere": "Nordic IT services group, 100+ reps", "Nordisk IT-servicekoncern": "Nordic IT services group", "sælgere på live provision hos en kunde": "reps on live commission at a single customer", "Bazoom Group, to brands": "Bazoom Group, two brands", "Se alle 25 brancher": "See all 25 business types", "Karriere": "Careers", "Se ledige stillinger": "See open roles", "Provision på ARR med acceleratorer over målet; fornyelser og mersalg til egen sats.": "Commission on ARR with accelerators over target; renewals and upsell paid at their own rate.", "Forskellige satser for licens-, projekt- og driftsomsætning; flerårige kickers på tværs af forretningsenheder.": "Different rates for licence, project and managed-service revenue; multi-year kickers across business units.", "Høj dealvolumen, to-trins godkendelse før løn; nul korrektioner efter udbetaling.": "High deal volume, two-step approval before payroll; zero corrections after payout.", "Første sælger på en live plan fra dag 1, direkte fra CRM.": "A first sales hire on a live plan from day one, reading the CRM directly.", "Kursus- og licenssalg med teammål og månedlige konkurrencer oven på planen.": "Course and licence sales with team targets and monthly competitions on top of the plan.", "Tilbagevendende platformsomsætning med trin for målopfyldelse og delt provision mellem AE og CS.": "Recurring platform revenue with attainment tiers and split commission between AE and CS.", "Aarhus, Danmark · Hybrid": "Aarhus, Denmark · Hybrid", "Uopfordret ansøgning": "Unsolicited application", "Udvikling, design, salg eller customer success. Fortæl os, hvad du ville bygge eller rette først hos Prowi, og hvorfor dig. Et link til noget, du har lavet, slår et CV.": "Engineering, design, sales or customer success. Tell us what you'd build or fix first at Prowi, and why you. A link to something you've made beats a CV.", "Bengaluru · Indien": "Bengaluru · India", "Danmark · Norden": "Denmark · Nordics", "Bliv partner": "Become a partner", "Du kører HubSpot-projekter. Tag provision med i scopet.": "You run HubSpot projects. Add commission to the scope.", "Træning, en sandbox, fælles salg og en henvisningsandel på hver kunde, du får live. Skriv til partners@prowi.io.": "Training, a sandbox, co-selling and a referral share on every customer you bring live. Write to partners@prowi.io.", "Brug for en anbefaling?": "Need a recommendation?", "Fortæl os om jeres setup, så matcher vi jer med en partner.": "Tell us your setup, we match you with a partner.", "Eller arbejd direkte med Prowi. De fleste teams er live inden for to uger uanset hvad.": "Or work with Prowi directly. Most teams are live within two weeks either way.", "Danmark": "Denmark", "Norden": "Nordics", "Hvad er Prowi?": "What is Prowi?", "Er Prowi et provisionsværktøj eller et motivationsværktøj?": "Is Prowi a commission tool or a motivation tool?", "Hvad ser en sælger i appen?": "What does a rep see in the app?", "Får sælgerne besked, når de tjener?": "Do reps get notified when they earn?", "Kører Prowi konkurrencer?": "Does Prowi run competitions?", "Kan vi beholde vores nuværende provisionsplan?": "Can we keep our current commission plan?", "Hvad sker der, hvis vi ændrer en plan midt i perioden?": "What happens if we change a plan mid-period?", "Hvordan håndteres clawbacks og sene ændringer?": "How are clawbacks and late changes handled?", "Kan en sælger se, hvordan tallet er beregnet?": "Can a rep see how their number was calculated?", "Hvordan virker godkendelse?": "How does approval work?", "Hvad hvis en opgørelse er forkert?": "What if a statement is wrong?", "Glemmer folk at godkende?": "Will people forget to approve?", "Hvordan kommer provisionen til løn?": "How does commission reach payroll?", "Hvilke CRM-systemer virker Prowi med?": "Which CRMs does Prowi work with?", "Hvor hurtigt dukker en lukket deal op?": "How quickly does a closed deal show up?", "Skal sælgerne taste noget to gange?": "Do reps have to enter anything twice?", "Forbedrer Prowi vores CRM-data?": "Does Prowi improve our CRM data?", "Hvad betaler vi for?": "What do we pay for?", "Er der et onboardinggebyr?": "Is there an onboarding fee?", "Hvordan foregår onboarding?": "How does onboarding work?", "Hvorfor kontrollere mod en periode, vi allerede har udbetalt?": "Why check against a period we already paid?", "Hvilken provisionsmodel skal vi bruge?": "Which commission model should we use?", "Hvad er forskellen på en trappemodel og en accelerator?": "What is the difference between a tiered model and an accelerator?", "Marginale trin eller trin på hele beløbet?": "Marginal or whole-amount tiers?", "Skal vi låse provisionen bag et mål?": "Should we gate commission behind a target?", "Giver lofter mening?": "Do caps make sense?", "Hvordan betaler vi en leder på teamets resultater?": "How do we pay a manager on the team’s results?", "Kan en deal betale flere personer?": "Can one deal pay several people?", "Skal dette kvartals sats afhænge af sidste kvartals udbetaling?": "Should this quarter’s rate depend on last quarter’s payout?", "Hvordan garanterer vi en ny sælgers provision under opstart?": "How do we guarantee a new hire’s commission during ramp?", "Hvad med SPIFFs og kortvarige spurter?": "What about SPIFFs and short-term pushes?", "Kan vi kombinere flere former?": "Can we combine several shapes?", "En sælger lukkede en deal, men den er ikke på opgørelsen. Hvorfor?": "A rep closed a deal but it is not on their statement. Why?", "Vores deals er i flere valutaer. Virker det?": "Our deals are in several currencies. Does that work?", "Hvad sker der, når nogen stopper eller skifter team?": "What happens when someone leaves or changes team?", "Hvorfor sidder en opgørelse fast i godkendelse?": "Why is a statement stuck in approval?", "En udbetalt opgørelse ser anderledes ud end det, vi udbetalte. Hvad er ændret?": "A paid statement looks different from what we paid. What changed?", "Vi beskrev vores plan som enkel. Hvorfor stiller onboarding så mange spørgsmål?": "We described our plan as simple. Why does onboarding ask so many questions?", "Må plandokumentet og modellen nogensinde være uenige?": "Should the plan document and the model ever disagree?", "Kan vi se, hvem der ændrede hvad?": "Can we see who changed what?", "Hvordan logger man ind?": "How do people sign in?", "Er der en databehandleraftale?": "Is there a data processing agreement?", "Byg eller køb": "Build or buy", "Sælgere, ledere og økonomi tæller alle som brugere": "Reps, leaders and finance all count as users", "Samme pris pr. bruger, uanset om man tjener provisionen eller godkender den.": "Same price per user, whether they earn the commission or approve it.", "01 Sælger-app": "01 Rep app", "02 Salgsleder-visning": "02 Sales leader view", "03 Godkendelsesflow": "03 Approval flow", "04 Pipeline-kvalitet": "04 Pipeline quality", "05 RevOps-cockpit": "05 RevOps cockpit", "06 Konkurrencer": "06 Competitions", "Lønmix": "Pay mix", "Økonomitid": "Finance time", "Sælgertid": "Rep time", "Overbetalinger": "Overpayments", "Planer": "Plans", "Under motorhjelmen": "Under the hood", "Se det køre på jeres egne HubSpot-deals.": "See it running on your own HubSpot deals.", "Tag en provisionsmodel med. Vi kører den live på mødet.": "Bring one comp plan. We run it live on the call.", "Læs historien om Talentech": "Read the Talentech story", "Læs historien om Bazoom Group": "Read the Bazoom Group story", "Læs historien om Returnflows": "Read the Returnflows story", "4 historier": "4 stories", "Milepæle": "Milestones", "Prowi på LinkedIn": "Prowi on LinkedIn", "Prowi på HubSpot App Marketplace": "Prowi on the HubSpot App Marketplace", "Anmeldelser af Prowi på G2": "Prowi reviews on G2", "Prowi på GetApp": "Prowi on GetApp", "5 ud af 5 stjerner": "Rated 5 out of 5", "Prowis adminplatform i en browser": "Prowi admin platform in a browser", "Prowis økonomioverblik i en browser": "Prowi financial overview in a browser"}; /* tool pages */
    for (var mk in MT) M[mk] = MT[mk];
    // strings that also occur in nav/footer with another meaning: only translated inside their own section
    var SCOPED = [[".pw-pricing__cell", {"En": "One", "Flere": "Multiple"}], [".pw-feature__band .pw-feature__step-tag", {"Plan": "Plan", "Kør": "Run", "Luk": "Close"}], [".pw-story-band .pw-feature__step-tag", {"Men": "But", "Så": "So", "Det betyder": "Which means"}], ['[data-about="kf"]', {"Om Prowi": "About Prowi", "B2B SaaS-salgsteams i HubSpot, fra 3 til 100+ sælgere": "B2B SaaS sales teams on HubSpot, from 3 to 100+ reps", "IT- og managed services-koncerner med flere forretningsenheder og flere planer": "IT and managed-services groups with several business units and several plans", "Medie- og marketingvirksomheder med mange deals og godkendelse i to trin før lønnen": "Media and marketing companies with high deal volume and two-step approval before payroll", "Founder-ledede startups, der sætter deres første sælger på en live plan": "Founder-led startups putting their first sales hire on a live plan", "RevOps- og økonomiteams, der i dag beregner provision i regneark": "RevOps and finance teams that calculate commission in spreadsheets today", "Nordiske og europæiske virksomheder, der udbetaler provision i DKK, SEK, NOK eller EUR": "Nordic and European companies paying commission in DKK, SEK, NOK or EUR", "Hvor det begyndte": "Where it began", "Søren Søe Holm, medstifter. Aarhus.": "Søren Søe Holm, founder. Aarhus.", "Co-founder og CEO": "Co-founder and CEO", "Stifter og bestyrelsesmedlem": "Founder and board member", "Bestyrelsesformand": "Chairman of the board", "Virksomhedsnavn": "Company name", "B2B SaaS, provisionssoftware til salg": "B2B SaaS, sales commission software", "Grundlagt": "Founded", "2022, Aarhus": "2022, Aarhus, Denmark", "Stiftere": "Founders", "Hovedkontor": "Headquarters", "Aarhus · CVR 43243977": "Aarhus, Denmark · CVR 43243977", "Kerneydelse": "Core offering", "Live provision til salgsteams: planer, beregning på hver deal, sælger-app, godkendelser og lønfil": "Live commission for sales teams: plans, calculation on every deal, rep app, approvals and payroll export", "Priser": "Pricing", "Starter 269 kr., Business 349 kr., Prowi Plus 699 kr. pr. bruger / md., faktureret årligt (årlig betaling sparer 25 % i forhold til månedlig); oprettelse fra 5.500 kr.": "Starter €37, Business €49, Prowi Plus €89 per user / month, billed annually (annual billing saves 25% against monthly); onboarding from €749", "Kontraktvilkår": "Contract terms", "Årsplan, der fornyes automatisk; opsig før fornyelsesdatoen": "Annual plan that renews automatically; cancel before the renewal date", "Ydelser": "Services", "Commission Studio, live provision, sælger-app til iOS og Android, opgørelser og godkendelser, korrektioner og clawbacks, lønfil, performance og konkurrencer": "Commission Studio, live commission, rep app for iOS and Android, statements and approvals, corrections and clawbacks, payroll export, performance and competitions", "Integrationer": "Integrations", "Kommunikation": "Communication", "hello@prowi.io · +45 70 60 45 54 · svar inden for en arbejdsdag": "hello@prowi.io · +45 70 60 45 54 · reply within one business day", "Udvalgte kunder": "Notable clients", "Kunder": "Customers served", "Salgsteams fra 3 til 100+ sælgere på provision": "Sales teams from 3 to 100+ reps on commission", "Konkurrenter": "Competitors", "Sociale medier": "Social"}]];
    var walker = d.createTreeWalker(root, w.NodeFilter.SHOW_TEXT, null, false), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var p = n.parentNode; if (!p || !p.closest || p.closest('.pw-embed, script, style')) return;
      var t = n.nodeValue, k = t.replace(/\s+/g, ' ').trim();
      if (!k) return;
      for (var si = 0; si < SCOPED.length; si++) { if (Object.prototype.hasOwnProperty.call(SCOPED[si][1], k) && p.closest(SCOPED[si][0])) { n.nodeValue = t.replace(k, SCOPED[si][1][k]); return; } }
      if (Object.prototype.hasOwnProperty.call(M, k)) n.nodeValue = t.replace(k, M[k]);
    });
    // accessible names and placeholders set in Webflow (no EN localization node for attributes)
    qa('[aria-label], [placeholder], [title]', root).forEach(function (el) {
      if (el.closest('.pw-embed')) return;
      ['aria-label', 'placeholder', 'title'].forEach(function (an) {
        var v = el.getAttribute(an); if (!v) return; var k = v.replace(/\s+/g, ' ').trim();
        if (Object.prototype.hasOwnProperty.call(M, k)) el.setAttribute(an, M[k]);
      });
    });
  }

  /* Everything below runs after the English strings are in place (hero intro, reveals and the tool modules read the text). */
  function main() {

  /* ---------- Hero headlines: break only between phrases ----------
     Each known H1 is a list of phrases; spaces inside a phrase become no-break spaces, so text-wrap:balance can only
     break where a reader would pause ("Hver deal belonnet | i det sekund, | den lukker."). Matched on the full text
     (DA or EN, after translation). Unknown headlines are left alone. */
  (function lockH1() {
    var P = [
  // Danish
  ['Hver deal belønnet', 'i det sekund,', 'den lukker.'],
  ['Når en deal', 'ændrer sig', 'efter lønningsdag,', 'finder forskellen', 'selv hjem.'],
  ['En godkendt fil', 'pr. periode.', 'Pr. lønart.'],
  ['Sælgeren', 'underskriver først.', 'Økonomi', 'underskriver sidst.'],
  ['Mål, stillinger', 'og konkurrencer.', 'Live.'],
  ['Rul planen ud.', 'Lad den så køre.'],
  ['Byg det,', 'kør det,', 'se det hele.'],
  ['Test enhver plan,', 'før en eneste', 'sælger ser den.'],
  ['Din provisionsplan', 'er rigtig.', 'Ingen kan se den,', 'mens de sælger.'],
  ['Du udbetaler', 'korrekt.', 'Du bruger den', 'første uge', 'af hver måned', 'på at bevise det.'],
  ['Din provisionsplan', 'er det dyreste', 'værktøj, du ejer.', 'Få den til', 'at gøre noget.'],
  ['Sælgerne', 'lukker i dag.', 'De får at vide,', 'hvad det gav,', '6 uger senere.'],
  ['Provisionssoftwaretil salgsteams', 'i HubSpot.'],
  ['Jeres CRM ind.', 'Jeres løn ud.', 'Intet imellem.'],
  ['Hjælp hver', 'lukket deal', 'med at få', 'sit øjeblik.'],
  ['Er jeres lønmix', 'på niveau', 'med markedet?'],
  ['Dem, der satte', 'jeres HubSpot op,', 'kan også sætte', 'jeres provision op.'],
  ['Hvad provision', 'koster jer i dag,', 'og hvad det koster', 'med Prowi.'],
  ['Praktiske guides', 'til dem,', 'der udbetaler', 'provision.'],
  ['Hvert', 'provisionsbegreb,', 'forklaret ligeud.'],
  ['Andre administrerer', 'provision.', 'Prowi motiverer dem,', 'der tjener den.'],
  ['Se om der', 'er et match.'],
  // English
  ['Every deal', 'rewarded', 'the second', 'it closes.'],
  ['When a deal', 'changes', 'after payday,', 'the difference', 'finds its own', 'way home.'],
  ['One approved file', 'per period.', 'By wage code.'],
  ['The rep signs first.', 'Finance signs last.'],
  ['Targets, standings', 'and competitions.', 'Live.'],
  ['Roll the plan out.', 'Then let it run.'],
  ['Build it,', 'run it,', 'see all of it.'],
  ['Test any plan', 'before a single', 'rep sees it.'],
  ['Your comp plan', 'is right.', 'Nobody can see it', 'while they sell.'],
  ['You pay correctly.', 'You spend', 'the first week', 'of every month', 'proving it.'],
  ['Your comp plan', 'is the most', 'expensive', 'tool you own.', 'Make it do', 'something.'],
  ['Reps close today.', 'They learn', 'what it paid', 'six weeks later.'],
  ['Sales commission', 'softwarefor sales teams', 'on HubSpot.'],
  ['Your CRM in.', 'Your payroll out.', 'Nothing in between.'],
  ['Is your pay mix', 'in line with', 'the market?'],
  ['Help every', 'closed deal', 'get its moment.'],
  ['The people who', 'set up your HubSpot', 'can set up', 'your commission too.'],
  ['What commission', 'costs you today,', 'and what it costs', 'with Prowi.'],
  ['Practical guides', 'for people', 'who pay commission.'],
  ['Every', 'commission term,', 'explained plainly.'],
  ['Sales, finance,', 'leadership:', 'same conclusion.'],
  ['Others manage', 'commission.', 'Prowi motivates', 'the people earning it.']
];
    var norm = function (s) { return s.replace(/[\s\u00A0]+/g, ' ').trim(); };
    var MAP = {}; P.forEach(function (p) { MAP[p.join(' ')] = p; });
    qa('h1').forEach(function (h) {
      var p = MAP[norm(h.textContent)]; if (!p) return;
      var ok = {}, pos = 0; p.forEach(function (seg, i) { pos += seg.length; if (i < p.length - 1) { ok[pos] = true; pos += 1; } });
      var tw = d.createTreeWalker(h, 4), n, idx = 0, started = false, prevSpace = false;
      while ((n = tw.nextNode())) {
        var v = n.nodeValue, out = '';
        for (var i = 0; i < v.length; i++) {
          var c = v.charAt(i), sp = /[\s\u00A0]/.test(c);
          if (sp) { if (!started || prevSpace) { out += c; continue; } out += ok[idx] ? ' ' : '\u00A0'; idx++; prevSpace = true; }
          else { out += c; idx++; started = true; prevSpace = false; }
        }
        if (out !== v) n.nodeValue = out;
      }
    });
  })();

  /* ---------- Customer stories: locale links + hide the current story in "More stories" ----------
     Story links are plain URLs (/kunder/<slug>) because rich text and collection links cannot be page links;
     on the English site they get the /en prefix (the collection path is not localised yet; see the launch list). */
  (function stories() {
    // CMS item slugs that differ per locale (DA slug → EN slug)
    var EN_SLUG = { 'nordisk-it-servicekoncern': 'nordic-it-services-group' };
    qa('a[data-story]').forEach(function (a) {
      var slug = a.getAttribute('data-story');
      if (!DA) {
        var h = (a.getAttribute('href') || '/kunder/' + slug).replace(/^\/en(?=\/)/, '');
        if (EN_SLUG[slug]) h = h.replace('/' + slug, '/' + EN_SLUG[slug]);
        a.setAttribute('href', '/en' + h);
      }
    });
    // "100+" in light headlines: Readex Pro's "+" at weight 300 reads oddly, so the design sets the "+" in
    // Helvetica Neue / Arial (light). Wrap each "+" in story titles and story cards.
    qa('.pw-case__title, .pw-customers__card-title, .pw-case__more-title').forEach(function (el) {
      var tw = d.createTreeWalker(el, 4), nodes = [], n;
      while ((n = tw.nextNode())) if (n.nodeValue.indexOf('+') > -1 && !(n.parentNode.classList && n.parentNode.classList.contains('pw-plus'))) nodes.push(n);
      nodes.forEach(function (tn) {
        var parts = tn.nodeValue.split('+'), frag = d.createDocumentFragment();
        parts.forEach(function (p, i) {
          if (p) frag.appendChild(d.createTextNode(p));
          if (i < parts.length - 1) { var s = d.createElement('span'); s.className = 'pw-plus'; s.textContent = '+'; frag.appendChild(s); }
        });
        tn.parentNode.replaceChild(frag, tn);
      });
    });
    var m = w.location.pathname.match(/\/(?:kunder|customers)\/([^\/?#]+)/);
    if (m) {
      var cur = m[1];
      Object.keys(EN_SLUG).forEach(function (k) { if (EN_SLUG[k] === cur) cur = k; });
      qa('.pw-case__more a[data-story="' + cur + '"]').forEach(function (a) { a.style.display = 'none'; });
    }
  })();

  /* ---------- Plain internal links (set as URLs, not page links) get their English path on the English site ---------- */
  if (!DA) qa('.pw-legal__aside nav[aria-label]').forEach(function (n) { n.setAttribute('aria-label', 'Contents'); });
  if (!DA) {
    var EN_PATH = { '/byg-eller-koeb-provisionssoftware': '/build-or-buy-commission-software', '/karriere': '/careers', '/partnerprogram': '/partner-program', '/provisionsmodeller': '/commission-models', '/provisionsordbogen': '/commission-dictionary', '/virksomhedstyper-oversigt': '/business-types', '/integrationer': '/integrations',
      '/kunder': '/customers', '/pris': '/pricing', '/om-os': '/about-us', '/ote-beregner': '/ote-ratio-calculator', '/corrections-beregner': '/corrections-calculator' };
    qa('a[href^="/"]').forEach(function (a) {
      if (a.closest('.w-richtext')) return;
      var h = a.getAttribute('href'); if (/^\/en(\/|$)/.test(h) || /^\/\//.test(h)) return;
      var m = h.match(/^(\/[^\/?#]*)(.*)$/); var head = m ? m[1] : h, rest = m ? m[2] : '';
      if (EN_PATH[head] && (!rest || rest.charAt(0) !== '/')) head = EN_PATH[head];
      a.setAttribute('href', '/en' + head + rest);
    });
  }

  /* ---------- [data-if] blocks: hide when their bound value is empty, or when the collection list right after them is empty ---------- */
  qa('[data-if]').forEach(function (el) {
    var nx = el.nextElementSibling;
    if (el.querySelector('.w-dyn-bind-empty') || (nx && nx.classList.contains('w-dyn-list') && !nx.querySelector('.w-dyn-item'))) el.style.display = 'none';
  });

  /* ---------- CMS dates bound as plain text: show "month year" where the template asks for it (data-format) ---------- */
  qa('[data-format]').forEach(function (el) {
    var t = el.querySelector('*') || el; while (t.firstElementChild) t = t.firstElementChild;
    var d = new Date((t.textContent || '').trim()); if (isNaN(d)) return;
    t.textContent = d.toLocaleDateString(DA ? 'da-DK' : 'en-GB', { month: 'long', year: 'numeric' });
  });

  /* ---------- Demo page host links: Danish accessible names on the Danish page ---------- */
  if (DA) qa('.pw-demo__host-link').forEach(function (a) { var l = a.getAttribute('aria-label') || ''; if (l === 'Email Anders') a.setAttribute('aria-label', 'Skriv til Anders'); else if (l === 'Anders on LinkedIn') a.setAttribute('aria-label', 'Anders på LinkedIn'); });

  /* ---------- English labels Webflow localisation cannot reach (links that carry inline SVG are not text nodes) ---------- */
  (function enLabels() {
    if (LANG !== 'en') return;
    var H = ['How it works', "Who it's for", 'Connect'];
    qa('.pw-nav__col-link').forEach(function (a, i) { var sp = q('span', a); if (sp && H[i]) sp.textContent = H[i]; });
    qa('.pw-logos__story').forEach(function (el) { var sp = q('span', el) || el; sp.textContent = 'Read the story'; });
    qa('.pw-cta-demo .pw-cta__label').forEach(function (el) { var n = el; while (n.firstElementChild) n = n.firstElementChild; n.textContent = 'Schedule a 30-minute call'; });
    qa('.pw-feature__stars').forEach(function (el) { el.setAttribute('aria-label', '5 out of 5 stars'); });
    qa('a[aria-label^="Læs historien om "]').forEach(function (a) { a.setAttribute('aria-label', 'Read the story: ' + a.getAttribute('aria-label').replace('Læs historien om ', '')); });
    // footer accessible names are Danish in Webflow (primary locale); English here
    var FA = { 'Officiel HubSpot-app · Vurderet 5/5 · Prowi på HubSpot App Marketplace': 'Official HubSpot app · Rated 5/5 · Prowi on the HubSpot App Marketplace',
      'Anmeldelser og sociale medier': 'Reviews and social', 'Prowi på LinkedIn': 'Prowi on LinkedIn', 'Anmeldelser af Prowi på G2': 'Prowi reviews on G2',
      'Prowi på GetApp': 'Prowi on GetApp', 'Prowi på SourceForge': 'Prowi on SourceForge',
      'Hver lukket deal fortjener sit øjeblik. Lavet i Aarhus.': 'Every closed deal deserves its moment. Made in Aarhus.' };
    qa('.pw-footer [aria-label], .pw-footer [title]').forEach(function (el) {
      ['aria-label', 'title'].forEach(function (k) { var v = el.getAttribute(k); if (v && FA[v]) el.setAttribute(k, FA[v]); });
    });
  })();

  /* ---------- Logo: gradient id repair + hover turn ---------- */
  function logo(svg, key) {
    if (!svg) return;
    // namespace lookup: WebKit's querySelector is unreliable with camelCase SVG tag names in HTML documents
    var grad = (svg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'linearGradient') || [])[0] || q('linearGradient', svg) || q('defs > *', svg);
    var pieces = qa('g.pw-logo__mark', svg);
    if (grad && pieces[0]) {
      var id = grad.getAttribute('id') || ('pwlg-' + key);
      grad.setAttribute('id', id);
      // bounding-box units: the same diagonal as the design's userSpaceOnUse + flip matrix, without the transform
      // (WebKit mis-renders userSpaceOnUse gradients under transform-box:fill-box)
      grad.setAttribute('gradientUnits', 'objectBoundingBox'); grad.removeAttribute('gradientTransform');
      grad.setAttribute('x1', '0.165'); grad.setAttribute('y1', '-0.166'); grad.setAttribute('x2', '1.163'); grad.setAttribute('y2', '0.834');
      // plain fragment reference; WebKit cannot resolve absolute-URL fills to in-document gradients.
      // Only when the page carries a <base href> pointing elsewhere do we need the absolute form.
      var base = q('base[href]'), here = w.location.href.split('#')[0];
      var ref = (base && base.href.split('#')[0] !== here) ? 'url("' + here + '#' + id + '")' : 'url(#' + id + ')';
      var p = q('path', pieces[0]); if (p) p.setAttribute('fill', ref + ' #4C39CA'); // solid fallback if the reference ever fails
    }
    if (pieces.length < 3 || REDUCED) return;
    var moves = [[79.37, -79.37], [11.9, 115.08], [-115.1, -11.5]];
    var busy = false, t;
    var set = function (on) {
      pieces.forEach(function (g, i) {
        g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center';
        g.style.transition = 'transform 700ms ' + SPRING + (on ? '' : ' 350ms');
        g.style.transform = on ? 'translate(' + moves[i][0] + 'px,' + moves[i][1] + 'px) rotate(-180deg)' : 'translate(0px,0px) rotate(0deg)';
      });
    };
    svg.addEventListener('mouseenter', function () {
      if (busy) return; busy = true; set(true);
      clearTimeout(t); t = setTimeout(function () { set(false); setTimeout(function () { busy = false; }, 750); }, 1150);
    });
  }
  logo(q('svg.pw-nav__logo-svg'), 'nav');
  logo(q('svg.pw-footer__wordmark-svg'), 'foot');
  // Footer wordmark: white letters on Home (they sit on the hero-coloured band there); dark blue like the nav
  // wordmark on every other page.
  (function () {
    var fw = q('svg.pw-footer__wordmark-svg'); if (!fw) return;
    var pid = d.documentElement.getAttribute('data-wf-page') || '';
    var isHome = pid === '6ad6301484084e5f0e6a7401' || /^\/(?:en\/?)?(?:home-2026\/?)?$/.test(w.location.pathname);
    if (!isHome) fw.classList.add('pw-footer__wordmark-svg--ink');
  })();

  /* ---------- Nav: hover pill, morphing dropdown, language switch, burger ---------- */
  (function nav() {
    var bar = q('.pw-nav'), navEl = q('.pw-nav__menu'); if (!bar || !navEl) return;
    var pill = q('.pw-nav__hover-pill', navEl);
    var card = q('.pw-nav__dropdown', navEl);
    var panels = card ? qa('.pw-nav__panel', card) : [];
    var trigs = qa(':scope > a, :scope > button', navEl);
    var ddTrigs = trigs.filter(function (t) { return t.classList.contains('pw-nav__dropdown-toggle'); });
    var open = -1, prev = -1, closeT;
    ddTrigs.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); if (t.tagName === 'A') t.setAttribute('href', '#'); });
    function movePill(el) {
      if (!pill) return;
      if (!el) { pill.style.opacity = '0'; pill.style.width = '0px'; return; }
      pill.style.left = el.offsetLeft + 'px'; pill.style.width = el.offsetWidth + 'px'; pill.style.opacity = '1';
    }
    function layout() {
      if (!card || open < 0) return;
      var c = panels[open]; if (!c) return;
      var tr = ddTrigs[open];
      var wdt = c.offsetWidth, hgt = c.offsetHeight;
      var barR = bar.getBoundingClientRect(), navR = navEl.getBoundingClientRect();
      var maxX = barR.right - navR.left - wdt - 20;
      var x = Math.max(-navEl.offsetLeft + 8, Math.min(tr ? tr.offsetLeft : 0, maxX));
      card.style.width = wdt + 'px'; card.style.height = hgt + 'px'; card.style.left = x + 'px';
    }
    function render() {
      if (!card) return;
      var isOpen = open >= 0, wasOpen = prev >= 0;
      card.style.visibility = (isOpen || wasOpen) ? 'visible' : 'hidden';
      card.style.transition = isOpen && wasOpen ? ('left 320ms ' + EM + ', width 320ms ' + EM + ', height 320ms ' + EM + ', opacity 160ms') : ('opacity 200ms ' + EM + ', transform 260ms ' + EM + ', left 0ms, width 0ms, height 0ms');
      card.style.opacity = isOpen ? '1' : '0';
      card.style.transform = isOpen ? 'none' : 'translateY(-8px) scale(0.98)';
      card.style.pointerEvents = isOpen ? 'auto' : 'none';
      panels.forEach(function (p, i) {
        var on = i === open;
        p.style.opacity = on ? '1' : '0';
        p.style.transform = on ? 'none' : (i < open ? 'translateX(-28px)' : 'translateX(28px)');
        p.style.transition = on ? ('opacity 220ms ' + EM + ' 60ms, transform 300ms ' + EM) : ('opacity 140ms, transform 300ms ' + EM);
        p.style.pointerEvents = on ? 'auto' : 'none';
      });
      ddTrigs.forEach(function (t, i) { t.setAttribute('aria-expanded', i === open ? 'true' : 'false'); t.style.color = i === open ? '#110663' : ''; });
      if (isOpen) layout();
    }
    function setOpen(i) { clearTimeout(closeT); prev = open; open = i; render(); }
    function scheduleClose() { clearTimeout(closeT); closeT = setTimeout(function () { prev = open; open = -1; movePill(null); render(); }, 140); }
    trigs.forEach(function (t) {
      t.addEventListener('mouseenter', function () {
        clearTimeout(closeT); movePill(t);
        var i = ddTrigs.indexOf(t);
        if (i >= 0) setOpen(i); else if (open >= 0) { prev = open; open = -1; render(); }
      });
      if (ddTrigs.indexOf(t) >= 0) {
        t.addEventListener('click', function (e) { e.preventDefault(); var i = ddTrigs.indexOf(t); if (open === i) { prev = open; open = -1; render(); } else setOpen(i); });
      }
    });
    if (card) { card.addEventListener('mouseenter', function () { clearTimeout(closeT); }); }
    navEl.addEventListener('mouseleave', scheduleClose);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open >= 0) { prev = open; open = -1; movePill(null); render(); } });
    w.addEventListener('resize', layout);

    // Language switch: roll the letters on hover, navigate to the other locale on click
    var lb = q('.pw-nav__lang', bar);
    if (lb) {
      var cols = qa('.pw-nav__lang-first, .pw-nav__lang-second', lb);
      var roll = function (on) { cols.forEach(function (c) { c.style.transform = on ? 'translateY(-1em)' : 'none'; }); };
      lb.addEventListener('mouseenter', function () { roll(true); });
      lb.addEventListener('mouseleave', function () { roll(false); });
      // accessible name starts with the visible letters (top letter of each column, e.g. "DA") — WCAG 2.5.3 label in name
      var shown = cols.map(function (c) { var l = q('.pw-nav__lang-letter', c); return l ? l.textContent.trim() : ''; }).join('') || (DA ? 'DA' : 'EN');
      lb.setAttribute('aria-label', shown + ' · ' + (DA ? 'Switch to English' : 'Skift til dansk'));
      var target = function () {
        var p = w.location.pathname;
        // Webflow prints <link rel="alternate" hreflang> for every locale with the localized slug (pris ↔ pricing);
        // use it so pages whose slugs differ per language don't 404. Path only, so staging stays on its own host.
        var want = DA ? 'en' : 'da', alt = qa('link[rel="alternate"][hreflang]').filter(function (l) {
          var h = (l.getAttribute('hreflang') || '').toLowerCase(); return h === want || h.indexOf(want + '-') === 0;
        })[0];
        if (alt && alt.href) { try { var u = new URL(alt.href, w.location.href); return u.pathname + w.location.search + w.location.hash; } catch (e) {} }
        // fallback: our own DA ↔ EN slug list (drafts and final URLs; model items keep the /provisionsmodeller path)
        var SLUG_EN = {"/administration": "/commission-management", "/administration-2026": "/commission-management-2026", "/byg-eller-koeb-provisionssoftware": "/build-or-buy-commission-software", "/corrections-beregner": "/corrections-calculator", "/corrections-beregner-2026": "/corrections-calculator-2026", "/integrationer": "/integrations", "/karriere": "/careers", "/kunder": "/customers", "/medarbejder-app": "/employee-app", "/medarbejder-app-2026": "/employee-app-2026", "/om-os": "/about-us", "/om-os-2026": "/about-us-2026", "/ote-beregner": "/ote-ratio-calculator", "/ote-beregner-2026": "/ote-ratio-calculator-2026", "/partnerprogram": "/partner-program", "/platform-korrektioner-2026": "/platform-corrections-and-clawbacks-2026", "/platform-live-provision-2026": "/platform-live-commission-2026", "/platform-loen-2026": "/platform-payroll-2026", "/platform-opgoerelser-2026": "/platform-statements-and-approvals-2026", "/platform-provisionsmodeller-2026": "/platform-commission-models-2026", "/platform-studio-2026": "/platform-commission-studio-2026", "/platform/korrektioner-og-clawbacks": "/platform/corrections-and-clawbacks", "/platform/live-provision": "/platform/live-commission", "/platform/loen": "/platform/payroll", "/platform/opgoerelser-og-godkendelser": "/platform/statements-and-approvals", "/platform/provisionsmodeller": "/platform/commission-models", "/pris": "/pricing", "/pris-2026": "/pricing-2026", "/provisionsmodeller": "/commission-models", "/provisionsmodeller-2026": "/commission-models-2026", "/provisionsordbogen": "/commission-dictionary", "/provisionsordbogen-2026": "/commission-dictionary-2026", "/salgsledere": "/sales-leaders", "/salgsledere-2026": "/sales-leaders-2026", "/virksomhedstyper-oversigt": "/business-types", "/virksomhedstyper-oversigt-2026": "/business-types-2026"}, MODEL_EN = {"loebende-provision": "residual", "teambonus": "team", "delt-provision": "split", "forskud": "draw", "bruttomargin": "margin", "trappemodel": "tiered", "milepael": "milestone-bonus", "fast-sats": "flat-rate"};
        var flip = function (o) { var r = {}; for (var k in o) r[o[k]] = k; return r; };
        var path = p.replace(/\/$/, '') || '/', mm;
        if (DA) {
          if (SLUG_EN[path]) path = SLUG_EN[path];
          else if ((mm = path.match(/^\/provisionsmodeller\/([^\/]+)$/)) && MODEL_EN[mm[1]]) path = '/provisionsmodeller/' + MODEL_EN[mm[1]];
          return '/en' + (path === '/' ? '' : path) + w.location.search + w.location.hash;
        }
        path = path.replace(/^\/en(\/|$)/, '/').replace(/\/$/, '') || '/';
        var SD = flip(SLUG_EN), MD = flip(MODEL_EN);
        if (SD[path]) path = SD[path];
        else if ((mm = path.match(/^\/provisionsmodeller\/([^\/]+)$/)) && MD[mm[1]]) path = '/provisionsmodeller/' + MD[mm[1]];
        return path + w.location.search + w.location.hash;
      };
      if (lb.tagName === 'A') lb.setAttribute('href', target());
      lb.addEventListener('click', function (e) { e.preventDefault(); w.location.href = target(); });
    }

    // Burger + full-screen menu (≤991px)
    var right = q('.pw-nav__actions', bar);
    if (right) {
      var T = NAVTXT[LANG], R = ROUTES[LANG];
      var btn = d.createElement('button'); btn.type = 'button'; btn.className = 'pw-burger'; btn.setAttribute('aria-label', T.menu);
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>';
      right.appendChild(btn);
      var menu = null;
      var closeMenu = function () { if (menu) { menu.remove(); menu = null; d.body.classList.remove('pw-menu-open'); } };
      btn.addEventListener('click', function () {
        if (menu) { closeMenu(); return; }
        menu = d.createElement('div'); menu.className = 'pw-menu'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', T.menu);
        var logoSvg = q('svg.pw-nav__logo-svg'); var logoHtml = logoSvg ? logoSvg.outerHTML.replace(/fill="#110663"/g, 'fill="#FFFFFF"').replace(/fill="url\(#[^)]*\)"/, 'fill="#FFFFFF"') : '';
        // use the desktop nav's own links (Webflow page links: the draft URLs now, the final URLs after launch)
        var navA = qa('a[href]', bar).map(function (a) { return a.getAttribute('href'); });
        R = Object.assign({}, R);
        Object.keys(R).forEach(function (k) {
          if (!/^\//.test(R[k])) return;
          var hit = navA.filter(function (h) { return h.replace(/-2026(?=\/?(?:[?#]|$))/, '').replace(/\/$/, '') === R[k]; })[0];
          if (hit) R[k] = hit;
        });
        var logoA = q('a.pw-nav__logo', bar), homeHref = logoA ? logoA.getAttribute('href') : (DA ? '/' : '/en');
        if (!HOME) R.why = homeHref.replace(/#.*$/, '') + '#why';
        var links = ['why', 'platform', 'app', 'customers', 'pricing', 'about', 'careers'].map(function (k) { return '<a href="' + R[k] + '">' + T[k] + '</a>'; }).join('');
        menu.innerHTML = '<div class="pw-menu__top"><span class="pw-menu__logo">' + logoHtml + '</span><button type="button" class="pw-menu__close">' + T.close + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div><nav class="pw-menu__nav">' + links + '</nav><div class="pw-menu__foot"><a class="is-cta" href="' + R.demo + '">' + T.cta + '</a><a href="' + R.login + '">' + T.login + '</a></div>';
        d.body.appendChild(menu); d.body.classList.add('pw-menu-open');
        q('.pw-menu__close', menu).addEventListener('click', closeMenu);
        qa('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
      });
      d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
      w.addEventListener('resize', function () { if (vw() > 991) closeMenu(); });
    }
    // "Why Prowi" anchor → the problem section on the homepage; from other pages it goes to the homepage's section
    var why = trigs[0];
    if (why && why.getAttribute('href') === '#why') {
      if (HOME) { var prob = qa('section', root)[2]; if (prob) prob.id = 'why'; }
      else { var lg = q('a.pw-nav__logo', bar); why.setAttribute('href', (lg ? lg.getAttribute('href').replace(/#.*$/, '') : (DA ? '/' : '/en')) + '#why'); }
    }
  })();

  /* ---------- Hero: staged intro + figure parallax ---------- */
  (function hero() {
    if (!HOME) return;
    var sec = q('section', root); if (!sec) return;
    var h1 = q('h1', sec), kick = q('.pw-hero__badge', sec), sub = q('.pw-hero__lead', sec), ctas = q('.pw-hero__actions', sec);
    var fig = q('.pw-hero__scene', sec) || q('.pw-hero__visual', sec);
    var scene = q('.pw-embed[data-component="LiveMoment"]', sec);
    var seen = false, introDone = false, introOver = false;
    // the pipeline scene starts when the intro (title, sentences, CTA) has finished AND either the figure is scrolled
    // into view or 3 s have passed since the intro ended - whichever comes first
    var released = false, AUTO_MS = 3000;
    var release = function (force) { if (released || !introOver || !(seen || force)) return; released = true; sceneProps(scene, { hold: false }); };
    var introEnded = function () { if (introOver) return; introOver = true; release(); setTimeout(function () { release(true); }, AUTO_MS); };
    // figure parallax: tilts in as it scrolls up; 0 at bottom edge → 1 when its centre reaches 50% of the viewport
    var reveal = function () {
      if (!fig || REDUCED) return;
      var r = fig.getBoundingClientRect(), H = vh();
      var p = Math.max(0, Math.min(1, (H - r.top) / Math.max(1, H - (H * 0.5 - r.height / 2))));
      var e = 1 - Math.pow(1 - p, 3);
      fig.style.transformOrigin = '50% 0%';
      fig.style.transform = 'perspective(1100px) rotateX(' + ((1 - e) * 34).toFixed(2) + 'deg) translateY(' + ((1 - e) * 160).toFixed(1) + 'px) scale(' + (0.86 + 0.14 * e).toFixed(4) + ')';
      fig.style.opacity = (0.25 + 0.75 * e).toFixed(3);
      if (!seen && (r.top + r.height / 2) < H * 0.62) { seen = true; if (introDone) release(); else finish(); }
    };
    if (fig) { fig.style.willChange = 'transform, opacity'; }
    var timers = [];
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var finish = function () {
      if (introDone) return; introDone = true;
      timers.forEach(clearTimeout);
      [kick, sub, ctas].forEach(function (el) { if (el) { el.style.opacity = ''; el.style.animation = ''; } });
      if (h1) qa('span.pw-ch', h1).forEach(function (s) { s.style.opacity = ''; s.style.animation = ''; });
      if (sub) qa('span.pw-ln', sub).forEach(function (s) { s.style.opacity = ''; s.style.animation = ''; });
      introEnded();
    };
    if (REDUCED || !h1) { finish(); }
    else {
      // hold the scene until the intro has run
      sceneProps(scene, { hold: true });
      // title: wrap characters
      var chars = [];
      var wrap = function (node) {
        if (node.nodeType === 3) {
          var frag = d.createDocumentFragment();
          Array.from(node.nodeValue).forEach(function (ch) {
            if (ch === ' ' || ch === '\n') { frag.appendChild(d.createTextNode(' ')); return; }
            var s = d.createElement('span'); s.className = 'pw-ch'; s.textContent = ch; s.style.opacity = '0'; frag.appendChild(s); chars.push(s);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1 && node.tagName !== 'BR') { Array.from(node.childNodes).forEach(wrap); }
      };
      Array.from(h1.childNodes).forEach(wrap);
      // subtitle: wrap sentences
      var lines = [];
      if (sub) {
        var tn = (function find(n) { if (n.nodeType === 3 && n.nodeValue.trim()) return n; for (var i = 0; i < n.childNodes.length; i++) { var r = find(n.childNodes[i]); if (r) return r; } return null; })(sub);
        if (tn) {
          var txt = tn.nodeValue; var sents = txt.match(/[^.!?]+[.!?]+["»]?/g) || [txt];
          var frag = d.createDocumentFragment();
          sents.forEach(function (s) { var sp = d.createElement('span'); sp.className = 'pw-ln'; sp.textContent = s.trim(); sp.style.display = 'inline-block'; sp.style.marginRight = '0.3em'; sp.style.opacity = '0'; frag.appendChild(sp); lines.push(sp); frag.appendChild(d.createTextNode(' ')); });
          tn.parentNode.replaceChild(frag, tn);
        }
      }
      if (kick) kick.style.opacity = '0';
      if (ctas) ctas.style.opacity = '0';
      var navEnd = 120 + 520 + 160;
      at(navEnd, function () { chars.forEach(function (s, i) { s.style.animation = 'pwCharIn 520ms ' + EM + ' ' + (i * 28) + 'ms both'; }); });
      var titleEnd = navEnd + chars.length * 28 + 520;
      var DUR = [760, 560, 440, 360], GAP = [340, 240, 170, 120];
      at(titleEnd - 100 + 380, function () {
        var acc = 0;
        lines.forEach(function (s, i) {
          var dur = DUR[Math.min(i, 3)];
          at(acc, function () { s.style.animation = 'pwLineIn ' + dur + 'ms ' + EM + ' both'; });
          acc += dur + GAP[Math.min(i, 3)];
        });
        at(acc + 220, function () {
          if (kick) kick.style.animation = 'pwFadeIn 500ms linear both';
          if (ctas) ctas.style.animation = 'pwRise 700ms ' + EASE + ' both';
        });
        at(acc + 220 + 700, introEnded); // CTA rise (700ms) has landed
        at(acc + 2000, finish);
      });
    }
    reveal();
    onScroll(reveal);
    w.addEventListener('resize', reveal);
  })();

  /* ---------- Section reveals ----------
     Spec (handover §4, corrected Oct 2026): IntersectionObserver, threshold 0.12, -6% bottom root margin, plus a load-time
     scan for blocks already in view; fires once. Opacity 0 -> 1 and translateY(14px) -> 0, 650ms, cubic-bezier(0.2,0.6,0.2,1).
     Unit = the whole block (header block, body block, figure), no child stagger. The hero is never held back (it has its own
     intro), Platform panels reveal one at a time, the footer is never held back. Reduced motion: final state. */
  (function reveals() {
    var steps = q('.pw-platform__steps');
    var blocks = [];
    var skip = function (el) {
      return el.classList.contains('pw-rail') || !!el.querySelector(':scope > .pw-rail:only-child') || el.tagName === 'FOOTER' ||
        el.matches('.pw-footer, .pw-foot-wrap, .pw-nav, nav, script, style, .w-embed:empty') || !el.getClientRects().length ||
        /^(absolute|fixed)$/.test(w.getComputedStyle(el).position); // decorative layers (hero watermark, glows) never fade in
    };
    var kidsOf = function (el) { return qa(':scope > *', el).filter(function (c) { return !skip(c); }); };
    // open single-child wrappers (containers, column stacks) until a level with several blocks
    var open = function (el) { var k = kidsOf(el), n = 0; while (k.length === 1 && n++ < 6 && !k[0].matches('.pw-embed, [data-component], .w-dyn-list')) { el = k[0]; k = kidsOf(el); } return k; };
    var add = function (el) {
      if (el === steps) { qa(':scope > *', steps).forEach(function (p) { blocks.push(p); }); return; }
      if (steps && el.contains(steps)) { kidsOf(el).forEach(add); return; }
      if (el.matches('.pw-platform__index')) return;
      blocks.push(el);
    };
    var sections = qa(':scope > section, :scope > div > section', root).filter(function (s) { return !skip(s); });
    sections.forEach(function (sec, si) {
      var bands = open(sec);
      bands.forEach(function (band, bi) {
        if (si === 0 && bi === 0) return; // the hero
        if (HOME) { add(band); return; }
        // a page band: its header block, body block and figures each reveal on their own
        var parts = open(band);
        // one tall column of stacked blocks (FAQ groups, long article sections): each stacked block is its own unit;
        // a grid of cards stays one unit (no card-by-card stagger)
        if (parts.length === 1 && parts[0].getBoundingClientRect().height > (w.innerHeight || 800) * 1.5) {
          var cs = w.getComputedStyle(parts[0]), multi = cs.display.indexOf('grid') > -1 && cs.gridTemplateColumns.split(' ').length > 1;
          var stack = kidsOf(parts[0]);
          if (!multi && stack.length > 1 && stack.length <= 16) { stack.forEach(add); return; }
        }
        if (parts.length > 1) {
          var box = parts[0].parentNode, bs = w.getComputedStyle(box);
          var grid = (bs.display.indexOf('grid') > -1 && bs.gridTemplateColumns.split(' ').length > 1) || (bs.display.indexOf('flex') > -1 && bs.flexDirection.indexOf('row') === 0);
          if (!grid && parts.length <= 16) { parts.forEach(add); return; }
        }
        add(band);
      });
    });
    blocks = blocks.filter(function (el, i) { return blocks.indexOf(el) === i && !el.closest('.pw-footer'); });
    if (!blocks.length) return;
    blocks.forEach(function (el) { el.setAttribute('data-pw-rv', ''); });
    var show = function (el) { el.classList.add('is-in'); };
    if (!w.IntersectionObserver || REDUCED) { blocks.forEach(show); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    // load-time scan: anything already in view (or above it, after a reload mid-page) shows at once
    var vh = w.innerHeight || d.documentElement.clientHeight;
    var pending = [];
    blocks.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < vh * 0.94) show(el); else { io.observe(el); pending.push(el); } });
    // safety net for blocks inside pinned / transformed scenes where the observer may not fire
    var sweep = function () { if (!pending.length) return; var h = w.innerHeight || vh; pending = pending.filter(function (el) { if (el.classList.contains('is-in')) return false; if (el.getBoundingClientRect().top < h * 0.94) { show(el); io.unobserve(el); return false; } return true; }); };
    onScroll(sweep);
  })();

  /* ---------- Platform rail: active panel marker + click to scroll ---------- */
  (function rail() {
    var col = q('.pw-platform__steps'), list = q('.pw-platform__index'), marker = q('.pw-platform__index-marker'); if (!col || !list) return;
    var panels = qa(':scope > *', col), items = qa(':scope > *', list).filter(function (el) { return el !== marker; });
    if (!panels.length || !items.length) return;
    var active = 0;
    var ON = 'pw-platform__index-item--active', OFF = 'pw-platform__index-item';
    var ONS = [ON], OFFS = [OFF];
    var paint = function () {
      items.forEach(function (it, i) {
        var on = i === active;
        ONS.forEach(function (c) { it.classList.toggle(c, on); }); OFFS.forEach(function (c) { it.classList.toggle(c, !on); });
        it.setAttribute('aria-current', on ? 'true' : 'false');
      });
      if (marker) {
        var k = items[active]; marker.style.top = k.offsetTop + 'px'; marker.style.height = k.offsetHeight + 'px'; marker.style.opacity = '1';
        // sit on the container rail's left hairline, like the design (indLeft)
        var railEl = q('.pw-rail', col.closest('section') || d);
        if (railEl && railEl.offsetWidth > 0) { var dx = railEl.getBoundingClientRect().left - list.getBoundingClientRect().left - 0.5; marker.style.left = (Math.round(dx * 2) / 2) + 'px'; }
      }
      var narrow = vw() < 1024;
      panels.forEach(function (p, i) { var inner = p.firstElementChild || p; inner.style.transition = 'opacity 500ms ' + EASE; inner.style.opacity = (narrow || i === active) ? '1' : '0.32'; });
    };
    var scan = function () {
      var H = vh(), best = -1, bestD = Infinity;
      panels.forEach(function (p, i) { var r = p.getBoundingClientRect(); var dd = Math.abs((r.top + Math.min(r.height, H) / 2) - H / 2); if (r.bottom > 0 && r.top < H && dd < bestD) { bestD = dd; best = i; } });
      if (best >= 0 && best !== active) { active = best; paint(); }
    };
    items.forEach(function (it, i) {
      it.style.cursor = 'pointer';
      it.addEventListener('click', function (ev) { ev.preventDefault(); var p = panels[i]; if (!p) return; p.style.scrollMarginTop = (vw() < 768 ? 122 : vw() < 1024 ? 134 : 100) + 'px'; try { p.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { p.scrollIntoView(true); } });
    });
    paint(); scan();
    onScroll(scan);
    w.addEventListener('resize', paint);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(paint);
  })();

  /* ---------- Q4 chart: chips slide in from "next quarter", bar fills, amount counts ---------- */
  /* ---------- Q4 chart: the plot strip scrolls sideways at 749px and below (CSS: .pw-quarter__scroll) ---------- */
  (function quarterScroll() {
    var plot = q('.pw-quarter__plot'); if (!plot || plot.parentNode.classList.contains('pw-quarter__scroll')) return;
    var wrap = d.createElement('div'); wrap.className = 'pw-quarter__scroll';
    plot.parentNode.insertBefore(wrap, plot); wrap.appendChild(plot);
  })();

  (function quarter() {
    if (!HOME) return;
    var sec = qa(':scope > section, :scope > div > section', root)[6]; if (!sec) return; // sections may sit in the div[role=main] wrapper
    var amt = q('.pw-quarter__stat-value', sec), pct = q('.pw-quarter__progress-value', sec), bar = q('.pw-quarter__progress-bar', sec), delta = q('.pw-quarter__stat-delta', sec), deltaAmt = q('.pw-quarter__stat-delta-value', sec), nextSub = q('.pw-quarter__next-text', sec);
    var slip = [q('.pw-quarter__deal--meridian', sec), q('.pw-quarter__deal--orbital', sec), q('.pw-quarter__deal--keystone', sec)];
    if (!amt || !bar) return;
    var txt = function (el, s) { var n = (function f(x) { if (x.nodeType === 3 && x.nodeValue.trim()) return x; for (var i = 0; i < x.childNodes.length; i++) { var r = f(x.childNodes[i]); if (r) return r; } return null; })(el); if (n) n.nodeValue = s; else el.textContent = s; };
    var fmtAmt = function (v) { return DA ? fmtDa(v * 2.5) + ' kr.' : '€' + fmtEn(v); };
    var START = 412000, END = 486000, from = [84, 93, 102], to = [70, 66, 72];
    // initial state
    txt(amt, fmtAmt(START)); txt(pct, '86%'); pct.style.color = '#110663'; pct.style.transition = 'color 400ms ease';
    bar.style.width = '86%'; bar.style.background = 'linear-gradient(90deg,#B68FF8,#4C39CA)'; bar.style.transition = 'width 2600ms ' + EM + ', background 600ms ease';
    if (delta) { delta.style.opacity = '0'; delta.style.transform = 'translateY(6px)'; delta.style.transition = 'opacity 600ms ' + EM + ' 1500ms, transform 600ms ' + EM + ' 1500ms'; }
    if (nextSub) { nextSub.style.opacity = '1'; nextSub.style.transition = 'opacity 600ms ease 900ms'; }
    slip.forEach(function (c, i) { if (!c) return; c.style.left = from[i] + '%'; c.style.opacity = '0.6'; c.style.boxShadow = 'inset 0 0 0 1px rgba(17,6,99,0.14)'; c.style.transition = 'left 1100ms ' + EM + ' ' + (i * 650) + 'ms, opacity 500ms ease ' + (i * 650 + 500) + 'ms, box-shadow 500ms ease ' + (i * 650 + 500) + 'ms'; });
    if (REDUCED) { go(0); return; }
    once(sec, function () { setTimeout(function () { go(1); }, 600); }, 0.3);
    function go(anim) {
      slip.forEach(function (c, i) { if (!c) return; c.style.left = to[i] + '%'; c.style.opacity = '1'; c.style.boxShadow = '0 1px 2px rgba(17,6,99,0.06), 0 4px 10px -4px rgba(17,6,99,0.18), inset 0 0 0 1px rgba(17,6,99,0.08)'; });
      if (delta) { delta.style.opacity = '1'; delta.style.transform = 'none'; }
      if (nextSub) nextSub.style.opacity = '0.5';
      var apply = function (v) {
        var p = Math.round(v / 480000 * 100);
        txt(amt, fmtAmt(v)); txt(pct, p + '%');
        pct.style.color = p >= 100 ? '#0E8A5F' : '#110663';
        bar.style.width = Math.min(100, p) + '%';
        bar.style.background = p >= 100 ? 'linear-gradient(90deg,#4C39CA,#0E8A5F)' : 'linear-gradient(90deg,#B68FF8,#4C39CA)';
        if (deltaAmt) txt(deltaAmt, DA ? '+' + fmtDa(Math.max(0, v - START) * 2.5) + ' kr.' : '+€' + fmtEn(Math.max(0, v - START)));
      };
      if (!anim) { apply(END); return; }
      tween(2600, function (e) { apply(START + (END - START) * e); }, easeOut4, 400);
    }
  })();

  /* ---------- Results: rule chips cycle, click to pick ---------- */
  (function results() {
    if (!HOME) return;
    var sec = qa(':scope > section, :scope > div > section', root)[7]; if (!sec) return;
    var chips = qa('.pw-stack--tight > *', sec), does = q('.pw-results__does', sec), gets = q('.pw-results__gets', sec);
    if (chips.length < 2 || !does || !gets) return;
    var ROWS = { da: [["+2 % på flerårige kontrakter", "Beder om den treårige, ikke den etårige.", "Længere kontrakter. Kunder der bliver."], ["12 % over 100 % af mål", "Trækker næste deal ind i dette kvartal for at komme over stregen.", "Omsætning der lander nu, ikke næste periode."], ["Clawback ved churn inden 90 dage", "Kvalificerer hårdere. Oversælger mindre.", "Færre dårlige kunder i bøgerne."], ["SPIFF på den nye produktlinje", "Åbner med den i hver demo.", "En lancering der faktisk sælger."], ["Bonus ved betaling, ikke ved underskrift", "Følger op på fakturaen, ikke kun kontrakten.", "Penge i banken. Færre afskrivninger."]], en: [["+2% on multi-year contracts", "Ask for the three-year, not the one-year.", "Longer contracts. Customers that stay."], ["12% above 100% of target", "Pull the next deal into this quarter to cross the line.", "Revenue that lands now, not next period."], ["Clawback on churn within 90 days", "Qualify harder. Oversell less.", "Fewer bad-fit customers on the books."], ["SPIFF on the new product line", "Lead with it in every demo.", "A launch that actually sells."], ["Bonus on payment received, not signature", "Chase the invoice, not just the contract.", "Cash in the bank. Fewer write-offs."]] }[LANG];
    var ON = 'pw-results__rule--active', OFF = 'pw-results__rule';
    var sel = 0, manual = false, timer = null, auto = false;
    var setText = function (el, s) { var n = (function f(x) { if (x.nodeType === 3 && x.nodeValue.trim()) return x; for (var i = 0; i < x.childNodes.length; i++) { var r = f(x.childNodes[i]); if (r) return r; } return null; })(el); if (n) n.nodeValue = s; else el.textContent = s; };
    var paint = function () {
      chips.forEach(function (c, i) {
        var on = i === sel;
        c.classList.toggle(ON, on); c.classList.toggle(OFF, !on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
        var prog = c.lastElementChild;
        if (prog && prog.getAttribute('aria-hidden') === 'true') {
          prog.className = on ? 'pw-results__rule-progress' : 'pw-results__rule-progress--off';
          prog.style.animation = (on && auto && !manual) ? 'pwResProg 3500ms linear both' : 'none';
          prog.style.display = on && auto && !manual ? '' : 'none';
        }
      });
      var r = ROWS[sel] || ROWS[0];
      does.style.transition = gets.style.transition = 'opacity 180ms';
      does.style.opacity = gets.style.opacity = '0';
      setTimeout(function () { setText(does, r[1]); setText(gets, r[2]); does.style.opacity = gets.style.opacity = '1'; }, 180);
    };
    chips.forEach(function (c, i) {
      c.setAttribute('href', '#'); c.setAttribute('role', 'button');
      c.addEventListener('click', function (e) { e.preventDefault(); manual = true; clearInterval(timer); sel = i; paint(); });
    });
    var start = function () { if (manual || REDUCED) return; auto = true; paint(); timer = setInterval(function () { sel = (sel + 1) % ROWS.length; paint(); }, 3500); };
    once(sec, function () { setTimeout(start, 600); }, 0.3);
  })();

  /* ---------- Top performers: Jordan fills to 108% and takes first place ---------- */
  (function board() {
    var panel = qa('.pw-platform__steps > *')[1]; if (!panel) return;
    var rows = qa('.pw-board__rows > *', panel); if (rows.length < 3 || REDUCED) return;
    var marie = rows[0], jordan = rows[1], amara = rows[2];
    var THEME = { gold: ['#FFF6DB', '#FEE9A8', '#FDD65B', 'linear-gradient(90deg,#A16207,#EAB308)'], green: ['#E8FBEF', '#BBF7D0', '#86EFAC', 'linear-gradient(90deg,#027A48,#22C55E)'], purple: ['#EEEAFB', '#D9CFF6', '#B9A8EC', 'linear-gradient(90deg,#2217B7,#7C5CE6)'] };
    var theme = function (row, t) { var blobs = qa(':scope > span[aria-hidden="true"]', row).slice(0, 3); blobs.forEach(function (b, i) { b.style.background = t[i]; b.style.transition = 'background 450ms ' + EASE; }); var fill = q('.pw-board__score > span', row); if (fill) { fill.style.background = t[3]; fill.style.transition = 'width 1200ms ' + EASE + ', background 450ms ' + EASE; } };
    var jFill = q('.pw-board__score > span', jordan), jPct = q('.pw-board__score-value', jordan);
    // initial standings: Marie 1st (gold), Amara 2nd (green), Jordan 3rd (purple, 78%)
    theme(marie, THEME.gold); theme(amara, THEME.green); theme(jordan, THEME.purple);
    if (jFill) jFill.style.width = '78%'; if (jPct) jPct.textContent = '78%';
    var list = rows[0].parentNode;
    list.insertBefore(jordan, amara.nextSibling); // order: Marie, Amara, Jordan
    once(panel, function () {
      setTimeout(function () {
        if (jFill) jFill.style.width = '100%';
        tween(1200, function (e) { if (jPct) jPct.textContent = Math.round(78 + 30 * e) + '%'; }, easeInOut);
        setTimeout(function () {
          // FLIP: Jordan moves to the top
          var before = rows.map(function (r) { return r.getBoundingClientRect().top; });
          list.insertBefore(jordan, marie);
          theme(jordan, THEME.gold); theme(marie, THEME.green); theme(amara, THEME.purple);
          rows.forEach(function (r, i) { var dy = before[i] - r.getBoundingClientRect().top; r.style.transition = 'none'; r.style.transform = 'translateY(' + dy + 'px)'; });
          raf(function () { rows.forEach(function (r) { r.style.transition = 'transform 600ms ' + EASE; r.style.transform = 'none'; }); });
        }, 1200 + 300);
      }, 250);
    }, 0.35);
  })();

  /* ---------- Getting started: cards land one after another ---------- */
  (function timeline() {
    var grid = q('.pw-start__grid'); if (!grid || REDUCED) return;
    var cards = qa(':scope > *', grid); cards.forEach(function (c) { c.style.opacity = '0'; });
    once(grid, function () { cards.forEach(function (c, i) { setTimeout(function () { c.style.animation = 'pwRiseA 600ms ' + EM + ' both'; c.style.opacity = ''; }, 400 + i * 700); }); }, 0.4);
  })();

  /* ---------- Pricing: annual / monthly toggle ----------
     Thumb slides with a spring (420ms), pulls 10px toward the other option on hover; prices count over 700ms.
     Monthly = annual x 1.25 (the struck "was" price), DKK on the Danish page, EUR on the English one. */
  (function pricing() {
    var sec = q('.pw-pricing'); if (!sec) return;
    var seg = q('.pw-pricing__billing', sec); if (!seg) return;
    var thumb = q('.pw-pricing__billing-thumb', seg);
    var opts = qa(':scope > a, :scope > button', seg); if (opts.length < 2) return;
    var save = q('.pw-pricing__save', opts[0]);
    var TIERS = [{ amt: 37, dkk: 269 }, { amt: 49, dkk: 349 }, { amt: 89, dkk: 699 }];
    var cards = qa('.pw-pricing__tiers > *', sec).slice(0, 3);
    var rows = cards.map(function (c, i) { return { price: q('.pw-pricing__price', c), was: q('.pw-pricing__price-was', c), onb: q('.pw-pricing__onboarding', c), t: TIERS[i] }; });
    var SUF = DA ? [' · årlig betaling', ' · månedlig betaling'] : [' · annual billing', ' · monthly billing'];
    var leaf = function (el) { var n = el; while (n && n.firstElementChild) n = n.firstElementChild; return n || el; };
    var money = function (t, k) { return DA ? Math.round(t.dkk * k) + ' kr.' : '€' + Math.round(t.amt * k); };
    var annual = true, k = 1, hov = -1, pull = 0, ready = false;
    var paintThumb = function () {
      if (!thumb) return;
      var on = annual ? 0 : 1, b = opts[on];
      var p = (hov >= 0 && hov !== on) ? pull * 10 : 0;
      thumb.style.transition = ready ? 'transform 420ms cubic-bezier(0.2,0.8,0.2,1), width 420ms cubic-bezier(0.2,0.8,0.2,1)' : 'none';
      thumb.style.width = (b.offsetWidth + Math.abs(p) * 0.6) + 'px';
      thumb.style.transform = 'translateX(' + (b.offsetLeft + (on === 0 ? p : -p)) + 'px)';
    };
    var paintPrices = function () {
      rows.forEach(function (r) { if (r.price) leaf(r.price).textContent = money(r.t, k); });
    };
    var paint = function () {
      opts.forEach(function (b, i) {
        var on = (i === 0) === annual;
        b.className = on ? 'pw-pricing__billing-option--on' : 'pw-pricing__billing-option';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (save) { save.style.background = annual ? '' : '#F4F1FE'; save.style.color = annual ? '' : '#4C39CA'; }
      rows.forEach(function (r) {
        if (r.was) { r.was.style.display = annual ? '' : 'none'; leaf(r.was).textContent = money(r.t, 1.25); }
        if (r.onb) { var l = leaf(r.onb); l.textContent = l.textContent.replace(/ · .*$/, '') + SUF[annual ? 0 : 1]; }
      });
      paintThumb();
    };
    var set = function (a) {
      if (a === annual) return; annual = a;
      var from = k, to = a ? 1 : 1.25;
      paint();
      if (REDUCED) { k = to; paintPrices(); return; }
      tween(700, function (e) { k = from + (to - from) * e; paintPrices(); });
    };
    opts.forEach(function (b, i) {
      b.setAttribute('role', 'button'); b.setAttribute('href', '#');
      b.addEventListener('click', function (e) { e.preventDefault(); set(i === 0); });
    });
    seg.addEventListener('mousemove', function (e) {
      var r = seg.getBoundingClientRect(), x = e.clientX - r.left;
      var i = x < opts[0].offsetLeft + opts[0].offsetWidth + 2 ? 0 : 1, t = opts[i];
      var dd = Math.max(-1, Math.min(1, (x - (t.offsetLeft + t.offsetWidth / 2)) / (t.offsetWidth / 2)));
      var pn = Math.max(0, 1 - Math.abs(dd));
      if (i !== hov || Math.abs(pn - pull) > 0.05) { hov = i; pull = pn; paintThumb(); }
    });
    seg.addEventListener('mouseleave', function () { hov = -1; pull = 0; paintThumb(); });
    paint(); paintPrices();
    var settle = function () { paintThumb(); setTimeout(function () { ready = true; }, 50); };
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(settle); else settle();
    w.addEventListener('resize', paintThumb);
  })();

  /* ---------- MCP access: the thinking orb (Fibonacci sphere of dots, ThinkingOrb.dc.html) ---------- */
  (function orbs() {
    qa('.pw-pricing__orb').forEach(function (holder) {
      if (q('canvas', holder)) return;
      var size = 18, N = 56, color = '#4C39CA', dpr = Math.min(2, w.devicePixelRatio || 1);
      var c = d.createElement('canvas'); c.className = 'pw-pricing__orb-canvas'; c.setAttribute('aria-hidden', 'true');
      c.width = size * dpr; c.height = size * dpr; c.style.width = c.style.height = size + 'px';
      holder.appendChild(c);
      var ctx = c.getContext('2d'); if (!ctx) return; ctx.scale(dpr, dpr);
      var R = size / 2 - 1.5, pts = [], ga = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < N; i++) { var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i; pts.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
      var t0 = performance.now(), visible = true, running = false;
      var draw = function (now) {
        var t = (now - t0) / 1000, ay = t * 0.55, ax = Math.sin(t * 0.35) * 0.45 + 0.35;
        var cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax), pulse = 0.85 + 0.15 * Math.sin(t * 1.6);
        ctx.clearRect(0, 0, size, size); ctx.fillStyle = color;
        pts.forEach(function (p) {
          var x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy, y1 = p[1] * cx - z1 * sx, z2 = p[1] * sx + z1 * cx;
          var depth = (z2 + 1) / 2;
          ctx.globalAlpha = 0.18 + depth * 0.82; ctx.beginPath(); ctx.arc(size / 2 + x1 * R, size / 2 + y1 * R, (0.55 + depth * 0.95) * pulse, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
      };
      var loop = function (now) { if (!visible) { running = false; return; } draw(now); raf(loop); };
      if (REDUCED) { draw(t0 + 1200); return; }
      var start = function () { if (!running) { running = true; raf(loop); } };
      if (w.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }).observe(holder);
      else start();
    });
  })();

  /* ---------- Book a demo: the pop-up (lives in the footer component, so every page has it) ----------
     Design: DEMO-MODAL-HANDOVER.md ("Unlock calendar"). Three steps in one dialog:
     1 name + work email (the native Webflow form "Book demo" is submitted here, so the Zapier flow gets every lead),
     2 three one-at-a-time questions, 3 Anders' cal.com calendar inline (prefilled; answers + UTM in the notes),
     then a booked state. Any link to the demo page, #demo-form or [data-demo-open] opens it in place. */
  (function demo() {
    var modal = q('.pw-demo-modal'); if (!modal) return;
    var dm = q('.pw-dm', modal); if (!dm) return;
    // out of the footer: a transformed ancestor (section reveal) would otherwise pin the fixed layer to it
    if (modal.parentNode !== d.body) d.body.appendChild(modal);
    var form = q('form', dm), email = q('input[type="email"]', dm), name = q('input[name="Name"]', dm);
    var err = q('.pw-demo-modal__error', dm), sub = form && q('input[type="submit"]', form);
    var closeBtn = q('.pw-demo-modal__close', modal), backdrop = q('.pw-demo-modal__backdrop', modal);
    if (!form || !email || !sub) return;
    var EN = {
      role: 'Co-founder of Prowi', title: 'Book 30 minutes with Anders.', sub: 'Your plan, run live. Not a slideshow.', lang: 'English or Danish',
      get: 'What you get', get1: 'Your plan, run live', get2: 'One closed deal, start to payslip', get3: 'A straight answer', hs: 'Official HubSpot app · Rated 5/5',
      s1: 'Your work email', s2: 'About your team', s3: 'Pick a time', change: 'Change',
      q1: 'How many reps are on commission?', q2: 'Which CRM do you sell from?', q3: 'How did you hear about Prowi?',
      other: 'Other', partner: 'A partner', reco: 'Recommendation', ai: 'AI assistant', back: 'Back', skip: 'Skip',
      loading: 'Loading the calendar…', lockh: 'Almost there', lockp: 'Add your work email above and the calendar opens right here.',
      newtab: 'Open the calendar in a new tab', notime: 'No time that works?', mail: 'Email Anders',
      bkh: 'You are booked.', before: 'Before the call', b1: 'Pick one comp plan to bring.', b2: 'Have one recent closed deal in mind.',
      b3: 'Invite whoever runs payroll, if you like.', backsite: 'Back to the site'
    };
    var TX = DA ? { name: 'Navn', email: 'Arbejdsmail', next: 'Fortsæt', wait: 'Fortsæt', reps: 'sælgere', of: 'af', err: 'Brug venligst din arbejdsmail. Private adresser (Gmail, Outlook, iCloud …) accepteres ikke.', phName: 'Dit navn', phEmail: 'navn@virksomhed.dk', close: 'Luk', dialog: 'Book demo', fail: 'Noget gik galt. Prøv igen, eller skriv direkte til anders@prowi.io.' }
      : { name: 'Name', email: 'Work email', next: 'Continue', wait: 'Continue', reps: 'reps', of: 'of', err: 'Please use your work email. Personal addresses (Gmail, Outlook, iCloud …) aren’t accepted.', phName: 'Your name', phEmail: 'name@company.com', close: 'Close', dialog: 'Book a demo', fail: 'Something went wrong. Try again, or email anders@prowi.io directly.' };
    var setFirstText = function (el, s) { if (!el) return; for (var i = 0; i < el.childNodes.length; i++) { var n = el.childNodes[i]; if (n.nodeType === 3 && n.nodeValue.trim()) { n.nodeValue = s; return; } } };
    if (!DA) qa('[data-dm-t]', dm).forEach(function (el) { var s = EN[el.getAttribute('data-dm-t')]; if (s) el.textContent = s; });
    var labels = qa('.pw-demo-modal__label', dm); setFirstText(labels[0], TX.name); setFirstText(labels[1], TX.email);
    if (err) err.textContent = TX.err;
    var ft = q('.pw-demo-modal__fail-text', dm); if (ft) ft.textContent = TX.fail;
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', TX.dialog);
    if (closeBtn) { closeBtn.setAttribute('aria-label', TX.close); closeBtn.setAttribute('role', 'button'); }
    sub.value = TX.next; sub.setAttribute('data-wait', TX.wait);
    [name, email].forEach(function (el) { if (el) el.value = ''; });
    if (name) name.setAttribute('placeholder', TX.phName);
    if (email) email.setAttribute('placeholder', TX.phEmail);
    if (name) name.removeAttribute('required'); // only the work email gates step 1
    var hid = function (n) { return q('input[name="' + n + '"]', form); };
    ['Reps on commission', 'CRM', 'Heard about Prowi'].forEach(function (n) { var el = hid(n); if (el) el.value = ''; });

    var track = function (ev, o) { try { w.dataLayer = w.dataLayer || []; var p = { event: ev }; for (var k in o) p[k] = o[k]; w.dataLayer.push(p); } catch (e) {} };

    // where the visitor came from: kept for the session so a later page still carries the landing UTMs
    var store = {}; try { store = JSON.parse(sessionStorage.getItem('pwAttribution') || '{}'); } catch (e) {}
    try {
      var qs = new URLSearchParams(w.location.search), hs = new URLSearchParams((w.location.hash || '').replace(/^#/, ''));
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { var v = qs.get(k) || hs.get(k); if (v) store[k] = v; });
      if (!store.referrer && d.referrer && d.referrer.indexOf(w.location.host) < 0) store.referrer = d.referrer;
      sessionStorage.setItem('pwAttribution', JSON.stringify(store));
    } catch (e) {}
    var S = { step: 1, q: 0, reps: '', crm: '', src: '', source: '', booked: null };
    var fill = function () {
      var set = function (n, v) { var el = hid(n); if (el) el.value = v || ''; };
      set('utm_source', store.utm_source); set('utm_medium', store.utm_medium); set('utm_campaign', store.utm_campaign);
      set('Referrer', store.referrer || d.referrer);
      set('Page', w.location.href.split('#')[0] + (S.source ? ' · ' + S.source : ''));
      set('Reps on commission', S.reps); set('CRM', S.crm); set('Heard about Prowi', S.src);
    };

    // work email check
    var FREE = ['gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.dk', 'yahoo.co.uk', 'hotmail.com', 'hotmail.dk', 'hotmail.co.uk', 'outlook.com', 'outlook.dk', 'live.com', 'live.dk', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'protonmail.com', 'proton.me', 'pm.me', 'gmx.com', 'gmx.de', 'mail.com', 'yandex.com', 'zoho.com', 'fastmail.com', 'tutanota.com', 'hey.com', 'mail.dk', 'jubii.dk', 'post.dk', 'ofir.dk', 'sol.dk', 'stofanet.dk', 'youmail.dk', 'tdcadsl.dk', 'webspeed.dk', 'it.dk', 'privat.dk'];
    var isWork = function (v) { var m = String(v || '').trim().toLowerCase().match(/^[^\s@]+@([^\s@]+\.[a-z]{2,})$/); if (!m) return false; return !FREE.some(function (f) { return m[1] === f || m[1].slice(-(f.length + 1)) === '.' + f; }); };
    var showErr = function (on) {
      if (err) err.style.display = on ? 'block' : '';
      email.style.borderColor = on ? '#B42318' : ''; email.setAttribute('aria-invalid', on ? 'true' : 'false');
      if (on && !REDUCED) { var lab = email.parentNode; lab.classList.remove('pw-dm-shake'); void lab.offsetWidth; lab.classList.add('pw-dm-shake'); }
    };
    var paintBtn = function () { sub.classList.toggle('is-off', !isWork(email.value)); };
    email.addEventListener('input', function () { paintBtn(); if (isWork(email.value)) showErr(false); });
    email.addEventListener('blur', function () { if (email.value.trim() && !isWork(email.value)) showErr(true); });
    paintBtn();

    // the three steps
    var steps = qa('.pw-dm__step', dm), Qs = qa('.pw-dm__q', dm), KEYS = ['reps', 'crm', 'src'];
    var stepEl = function (n) { return steps.filter(function (s) { return s.getAttribute('data-step') === String(n); })[0]; };
    var fillEl = q('.pw-dm__bar-fill', dm), countEl = q('.pw-dm__count', dm), backQ = q('.pw-dm__back', dm), skipQ = q('.pw-dm__skip', dm);
    var label = function (key, v) { var o = q('.pw-dm__q[data-q="' + key + '"] .pw-dm__opt[data-opt="' + v + '"]', dm); return o ? o.textContent.trim() : v; };
    var render = function () {
      steps.forEach(function (s) {
        var n = +s.getAttribute('data-step');
        s.classList.toggle('is-active', n === S.step); s.classList.toggle('is-done', n < S.step); s.classList.toggle('is-todo', n > S.step);
        var sum = q('.pw-dm__sum', s);
        if (sum) sum.textContent = n === 1 ? [name && name.value.trim(), email.value.trim()].filter(Boolean).join(' · ')
          : n === 2 ? [S.reps ? S.reps + ' ' + TX.reps : '', S.crm ? label('crm', S.crm) : ''].filter(Boolean).join(' · ') : '';
      });
      Qs.forEach(function (el, i) { el.classList.toggle('is-on', i === S.q); });
      if (fillEl) fillEl.style.width = ((S.q + 1) / 3 * 100) + '%';
      if (countEl) countEl.textContent = (S.q + 1) + ' ' + TX.of + ' 3';
      if (backQ) backQ.style.visibility = S.q > 0 ? '' : 'hidden';
      if (skipQ) skipQ.style.display = S.q === 2 ? '' : 'none';
      qa('.pw-dm__opt', dm).forEach(function (o) { var key = o.closest('.pw-dm__q').getAttribute('data-q'); o.setAttribute('aria-checked', S[key] === o.getAttribute('data-opt') ? 'true' : 'false'); });
      modal.classList.toggle('is-booked', !!S.booked);
      if (S.step === 3) mountCal();
    };
    var focusStep = function () {
      setTimeout(function () {
        var t = S.booked ? q('.pw-dm__bk-back', dm) : S.step === 1 ? ((name && !name.value) ? name : email) : S.step === 2 ? q('.pw-dm__q.is-on .pw-dm__opt', dm) : q('.pw-dm__newtab', dm);
        if (t) try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
      }, 80);
    };
    var go = function (n) { S.step = n; if (n === 2) S.q = 0; render(); focusStep(); };
    // step 1: the native form is submitted (Webflow sends it), and the visitor moves on without waiting
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      if (!isWork(email.value)) { e.preventDefault(); e.stopImmediatePropagation(); showErr(true); email.focus(); return; }
      fill(); track('demo_step1_done', {});
      if (!w.Webflow || !w.jQuery) e.preventDefault(); // no Webflow form handler (preview/tests): never reload the page
      setTimeout(function () { go(2); }, 0);
    }, true);
    // step 2: one question at a time, auto-advance
    var adv = null;
    var pick = function (key, v) {
      S[key] = v; fill(); render(); track('demo_q_answered', { q: key, value: v });
      clearTimeout(adv); adv = setTimeout(function () { if (S.q < 2) { S.q++; render(); focusStep(); } else go(3); }, 280);
    };
    qa('.pw-dm__opt', dm).forEach(function (o) {
      o.addEventListener('click', function (e) { e.preventDefault(); pick(o.closest('.pw-dm__q').getAttribute('data-q'), o.getAttribute('data-opt')); });
    });
    if (backQ) backQ.addEventListener('click', function (e) { e.preventDefault(); if (S.q > 0) { S.q--; render(); focusStep(); } });
    if (skipQ) skipQ.addEventListener('click', function (e) { e.preventDefault(); go(3); });
    qa('.pw-dm__change', dm).forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); go(+a.closest('.pw-dm__step').getAttribute('data-step')); });
    });
    // step 3: cal.com inline, loaded on first open, mounted on entering the step (again if name or email changed)
    var CAL = 'anders-goosmann/30min', calBox = q('.pw-dm__calbox', dm), calKey = null;
    var loadCal = function () {
      (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var dd = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; dd.head.appendChild(dd.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(w, 'https://app.cal.com/embed/embed.js', 'init');
      if (w.__pwCalInit) return; w.__pwCalInit = true;
      w.Cal('init', '30min', { origin: 'https://app.cal.com' });
      w.Cal.config = w.Cal.config || {}; w.Cal.config.forwardQueryParams = true;
      var ns = w.Cal.ns['30min'];
      ns('on', { action: 'linkReady', callback: function () { if (calBox) calBox.classList.add('is-ready'); track('demo_cal_ready', {}); } });
      ns('on', { action: 'bookingSuccessfulV2', callback: booked });
      ns('on', { action: 'bookingSuccessful', callback: booked });
      ns('ui', { hideEventTypeDetails: false, layout: 'month_view', theme: 'light', cssVarsPerTheme: { light: { 'cal-brand': '#4C39CA' } } });
    };
    var notes = function () {
      var p = [];
      if (S.reps) p.push('Reps on commission: ' + S.reps); if (S.crm) p.push('CRM: ' + S.crm); if (S.src) p.push('Heard via: ' + S.src);
      var u = [store.utm_source, store.utm_medium, store.utm_campaign].filter(Boolean).join(' / '); if (u) p.push('utm: ' + u);
      if (S.source) p.push('From: ' + S.source);
      return p.join(' · ');
    };
    var mountCal = function () {
      if (!calBox) return;
      var ok = isWork(email.value);
      calBox.classList.toggle('is-locked', !ok); if (!ok) return;
      var nm = name ? name.value.trim() : '', em = email.value.trim(), key = nm + '|' + em + '|' + notes();
      if (key === calKey) return; calKey = key;
      loadCal(); calBox.classList.remove('is-ready');
      var old = q('.pw-dm__cal', calBox), box = d.createElement('div');
      box.className = 'pw-dm__cal'; box.id = 'my-cal-inline-30min';
      if (old) old.parentNode.replaceChild(box, old); else calBox.appendChild(box);
      var cfg = { layout: 'month_view', useSlotsViewOnSmallScreen: 'true', theme: 'light', email: em };
      if (nm) cfg.name = nm; var nt = notes(); if (nt) cfg.notes = nt;
      w.Cal.ns['30min']('inline', { elementOrSelector: '#my-cal-inline-30min', calLink: CAL, config: cfg });
    };
    // booked
    var bkP = q('.pw-dm__bk-p', dm);
    var booked = function (e) {
      var x = (e && e.detail && e.detail.data) || {}, b = x.booking || x;
      var t = b.startTime || b.start || b.date || x.startTime || x.start || x.date;
      var when = '';
      if (t) try { var dt = new Date(t); if (!isNaN(dt)) when = dt.toLocaleDateString(DA ? 'da-DK' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + (DA ? ' kl. ' : ' at ') + dt.toLocaleTimeString(DA ? 'da-DK' : 'en-GB', { hour: '2-digit', minute: '2-digit' }); } catch (er) {}
      when = when ? when.charAt(0).toUpperCase() + when.slice(1) : (DA ? 'Dit møde' : 'Your call');
      var em = email.value.trim() || (DA ? 'din indbakke' : 'your inbox');
      if (bkP) bkP.textContent = DA ? when + ' med Anders. Invitationen er på vej til ' + em + '.' : when + ' with Anders. The invite is on its way to ' + em + '.';
      S.booked = x; w.__prowiBooked = x; render(); focusStep(); track('demo_booked', {});
    };
    var bkBack = q('.pw-dm__bk-back', dm);
    // open / close
    var opener = null;
    var open = function (src, named) {
      if (closing) { clearTimeout(closing); closing = null; modal.classList.remove('is-closing'); }
      if (modal.classList.contains('is-open')) return;
      opener = d.activeElement; if (named) S.source = src; // a CTA that names its source (data-demo-source) reaches the form and the booking notes
      fill(); modal.classList.add('is-open'); d.body.style.overflow = 'hidden';
      loadCal(); render(); focusStep();
      track('demo_open', { source_cta: src || 'link' });
    };
    var closing = null;
    var close = function () {
      if (!modal.classList.contains('is-open') || closing) return;
      modal.classList.add('is-closing');
      closing = setTimeout(function () { closing = null; modal.classList.remove('is-open', 'is-closing'); }, REDUCED ? 0 : 220);
      d.body.style.overflow = '';
      if (opener && opener.focus) try { opener.focus({ preventScroll: true }); } catch (e) {}
    };
    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.preventDefault(); close(); });
    if (backdrop) backdrop.addEventListener('click', close);
    if (bkBack) bkBack.addEventListener('click', function (e) { e.preventDefault(); close(); });
    d.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (S.step === 2 && !S.booked && /^[1-7]$/.test(e.key) && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) {
        var opts = qa('.pw-dm__q.is-on .pw-dm__opt', dm), o = opts[+e.key - 1];
        if (o) { e.preventDefault(); o.click(); } return;
      }
      if (e.key === 'Tab') { // keep focus inside the dialog
        var f = qa('a[href], button, input:not([type="hidden"]), iframe, [tabindex]:not([tabindex="-1"])', modal).filter(function (el) { return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden'; });
        if (!f.length) return; var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Every "Book demo" CTA opens the pop-up in place. Matched on the link's resolved path (any host, so Webflow preview
    // and staging hosts count too), on [data-demo-open], or on the button text. Runs in the capture phase on window,
    // ahead of Webflow's own link handling, and stops the click so nothing navigates to the Demo page.
    var DEMO_PATH = /^\/(?:en\/)?(?:demo|book-demo)(?:-2026)?\/?$/;
    var DEMO_TEXT = /^\s*(?:book\s+(?:a\s+)?demo|book\s+en\s+demo)\s*$/i;
    var isDemoLink = function (a) {
      if (a.hasAttribute('data-demo-open')) return true;
      var h = a.getAttribute('href') || '';
      if (h === '#demo-form') return true;
      if (a.tagName === 'A' && h && h.charAt(0) !== '#') {
        var path = ''; try { path = new URL(h, w.location.href).pathname; } catch (err) {}
        if (DEMO_PATH.test(path)) return true;
      }
      var lab = a.querySelector('.pw-cta__label') || a;
      return DEMO_TEXT.test(lab.textContent || '');
    };
    w.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a,button'); if (!a || modal.contains(a)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      if (isDemoLink(a)) {
        e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        var cls = (a.className && typeof a.className === 'string' ? a.className.split(/\s+/)[0] : '') || 'link';
        var named = a.getAttribute('data-demo-source');
        open(named || cls, !!named);
      }
    }, true);
    if (w.location.hash === '#demo-form') setTimeout(function () { open('hash'); }, 400);
    render();
  })();

  /* ---------- Footer: copyright year ---------- */
  qa('footer span, footer div', root).forEach(function (el) {
    if (el.children.length === 0 && /©\s*\d{4}/.test(el.textContent)) el.textContent = el.textContent.replace(/©\s*\d{4}/, '© ' + new Date().getFullYear());
  });
  }

  // English pages: the string maps arrive in their own file (dist/chunks/en.js, requested by src/loader.js before this
  // code runs). Translate first, then run the rest. Danish pages run at once.
  if (LANG === 'en' && w.__pwNeed) w.__pwNeed('en', function () { enStrings(); main(); }, true);
  else { enStrings(); main(); }
})();
