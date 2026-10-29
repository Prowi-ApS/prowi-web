/* Provisionsplan-tjek / Commission plan health check (feature/plan-health-check, for v1.25.52+).
   A self-assessment for sales leaders and finance: 15 questions in 4 areas, each answer worth 0-3 points, a total score
   0-100 with a band, area scores, top 3 priorities and one recommendation (with a link to a Prowi resource) per weak
   answer. No gate in front of the result. Self-contained: own markup, own scoped CSS (.pw-hc, same tokens and look as the
   free calculators in calc-kit.js), own print stylesheet. No external requests.

   Webflow markup: one empty element <div data-tool="health-check"></div> (DA page /provisionsplan-tjek, EN page
   /en/commission-plan-health-check). Language from <html lang>.

   Analytics: the site footer counts Plausible "Calculator used" on the first input event inside [data-tool] (a native
   radio click fires one). This module adds "Health check completed" (props: band, score_bucket) once per completed run
   and "Health check PDF" when the report is printed. The result CTA is a link to /demo with data-demo-open and
   data-demo-source="health-check", so page.js opens the demo pop-up and pushes demo_open with source_cta "health-check".

   Progress (answers, step, done) is kept in sessionStorage, so a reload keeps it. In Node the module exports its data
   and the scoring, for test/healthcheck.test.js. */
(function () {
  'use strict';

  /* ---------------- resources (DA / EN paths and link texts) ----------------
     EN paths were read from the Webflow CMS on 2026-10-28. DA-only guides point to the closest EN page. */
  var RES = {
    plan: { da: ['/post/provisionsplan-skabelon', 'Provisionsplan skabelon'], en: ['/en/post/commission-plan-template', 'Commission plan template'] },
    agreement: { da: ['/post/provisionsaftale-skabelon', 'Provisionsaftale skabelon'], en: ['/en/post/commission-agreement-template', 'Commission agreement template'] },
    clawback: { da: ['/post/clawback-regler-skabelon', 'Clawback-regler skabelon'], en: ['/en/post/commission-clawback-policy-template', 'Commission clawback policy template'] },
    holiday: { da: ['/post/feriepenge-af-provision', 'Feriepenge af provision'], en: ['/en/glossary/holiday-pay-on-commission', 'Holiday pay on commission'] },
    holidayCalc: { da: ['/feriepenge-af-provision-beregner', 'Feriepenge-beregneren'], en: ['/en/holiday-pay-on-commission-calculator', 'Holiday pay on commission calculator'] },
    sick: { da: ['/post/provision-under-sygdom-og-barsel', 'Provision under sygdom og barsel'], en: ['/en/glossary/commission-during-sick-leave', 'Commission during sick leave'] },
    law: { da: ['/post/funktionaerloven-provision', 'Funktionærloven og provision'], en: ['/en/post/commission-upon-termination', 'Commission upon termination'] },
    change: { da: ['/post/funktionaerloven-provision', 'Funktionærloven og provision'], en: ['/en/post/commission-agreement-template', 'Commission agreement template'] },
    disputes: { da: ['/post/undgaa-provisionstvister', 'Undgå provisionstvister'], en: ['/en/post/avoiding-commission-disputes', 'Avoiding commission disputes'] },
    payroll: { da: ['/post/provision-loensystem', 'Provision i lønsystemet'], en: ['/en/integrations', 'Payroll and CRM integrations'] },
    calcs: { da: ['/beregnere', 'Gratis beregnere'], en: ['/en/calculators', 'Free calculators'] },
    statement: { da: ['/post/provisionsopgoerelse-skabelon', 'Provisionsopgørelse skabelon'], en: ['/en/post/commission-statement-template', 'Commission statement template'] },
    crediting: { da: ['/ordbog/salgskreditering', 'Salgskreditering i ordbogen'], en: ['/en/glossary/sales-crediting', 'Sales crediting in the glossary'] },
    crm: { da: ['/integrationer', 'Integrationer'], en: ['/en/integrations', 'Integrations'] },
    margin: { da: ['/provisionsmodeller/bruttomargin', 'Provision af dækningsbidrag'], en: ['/en/commission-models/margin', 'Margin-based commission'] },
    // role plans hub: set ROLE_HUB to true once /post/provisionsplaner-pr-rolle is published in both locales
    roles: { da: ['/post/provisionsplaner-pr-rolle', 'Provisionsplaner pr. rolle'], en: ['/en/post/commission-plans-by-role', 'Commission plans by role'] }
  };
  var ROLE_HUB = true;
  function res(key) { return key === 'roles' && !ROLE_HUB ? 'plan' : key; }

  /* ---------------- areas and questions ----------------
     Each option: id, points (0-3), and for anything below 3 the key of its recommendation (R) and resource (RES).
     imp (importance 1-3) only orders the priorities when two answers miss the same number of points. */
  var AREAS = [
    { id: 'clarity', da: 'Klarhed', en: 'Clarity' },
    { id: 'docs', da: 'Dokumentation og regler', en: 'Documentation and rules' },
    { id: 'process', da: 'Proces', en: 'Process' },
    { id: 'data', da: 'Motivation og data', en: 'Motivation and data' }
  ];
  var Q = [
    { id: 'understood', area: 'clarity', imp: 1, opts: [['a', 3], ['b', 2, 'example', 'plan'], ['c', 1, 'rewrite', 'plan'], ['d', 0, 'rewrite', 'plan']] },
    { id: 'selfcalc', area: 'clarity', imp: 2, opts: [['a', 3], ['b', 2, 'sameCalc', 'calcs'], ['c', 1, 'showCalc', 'statement'], ['d', 0, 'showCalc', 'statement']] },
    { id: 'exceptions', area: 'clarity', imp: 1, opts: [['a', 3], ['b', 2, 'exceptAnnex', 'plan'], ['c', 1, 'exceptWrite', 'disputes'], ['d', 0, 'exceptWrite', 'disputes']] },
    { id: 'written', area: 'docs', imp: 3, opts: [['a', 3], ['b', 2, 'agreeUpdate', 'agreement'], ['c', 1, 'agreeWrite', 'agreement'], ['d', 0, 'agreeWrite', 'agreement']] },
    { id: 'changes', area: 'docs', imp: 3, opts: [['a', 3], ['b', 2, 'changeDecide', 'change'], ['c', 1, 'changeNotice', 'change'], ['d', 0, 'changeNotice', 'change']] },
    { id: 'clawback', area: 'docs', imp: 3, opts: [['a', 3], ['b', 1, 'clawFull', 'clawback'], ['c', 0, 'clawNone', 'clawback']] },
    { id: 'absence', area: 'docs', imp: 3, opts: [['a', 3], ['b', 1, 'absBoth', 'sick'], ['c', 0, 'absBase', 'holiday'], ['d', 0, 'absUnknown', 'holidayCalc']] },
    { id: 'leaving', area: 'docs', imp: 3, opts: [['a', 3], ['b', 0, 'leaveClause', 'law'], ['c', 1, 'leaveDescribe', 'law'], ['d', 3]] },
    { id: 'time', area: 'process', imp: 1, opts: [['a', 3], ['b', 2, 'timeSteps', 'payroll'], ['c', 1, 'timeDays', 'payroll'], ['d', 0, 'timeDays', 'payroll']] },
    { id: 'disputes', area: 'process', imp: 2, opts: [['a', 3], ['b', 2, 'disputeRoute', 'disputes'], ['c', 1, 'disputeCause', 'disputes'], ['d', 0, 'disputeCause', 'disputes']] },
    { id: 'approval', area: 'process', imp: 2, opts: [['a', 3], ['b', 2, 'approveRep', 'payroll'], ['c', 1, 'approveFour', 'payroll'], ['d', 0, 'approveFour', 'payroll']] },
    { id: 'payroll', area: 'process', imp: 1, opts: [['a', 3], ['b', 2, 'payImport', 'payroll'], ['c', 1, 'payCode', 'payroll'], ['d', 1, 'payManual', 'payroll']] },
    { id: 'visibility', area: 'data', imp: 1, opts: [['a', 3], ['b', 2, 'seeLive', 'statement'], ['c', 1, 'seeLate', 'statement'], ['d', 0, 'seeLate', 'statement']] },
    { id: 'crm', area: 'data', imp: 2, opts: [['a', 3], ['b', 2, 'crmRules', 'crediting'], ['c', 1, 'crmSource', 'crm'], ['d', 0, 'crmSource', 'crm']] },
    { id: 'aligned', area: 'data', imp: 1, opts: [['a', 3], ['b', 2, 'alignMargin', 'margin'], ['c', 1, 'alignReview', 'roles'], ['d', 0, 'alignReview', 'roles']] }
  ];

  /* ---------------- texts ---------------- */
  var T = {
    da: {
      q: {
        understood: ['Kan jeres sælgere forklare, hvordan deres provision bliver beregnet?', 'Tænk på en typisk sælger, ikke den mest erfarne.',
          ['Ja, alle kan forklare planen med egne ord', 'De fleste kender det overordnet, men ikke detaljerne', 'Kun nogle få forstår den', 'Nej, planen giver ofte spørgsmål']],
        selfcalc: ['Kan en sælger selv regne sin provision ud for en måned og få samme tal som jer?', null,
          ['Ja, de følger tallet løbende og kan se beregningen', 'Ja, med et regneark eller en opgørelse fra os', 'Kun omtrent, de venter på lønsedlen', 'Nej']],
        exceptions: ['Hvor mange undtagelser og særaftaler har I i planen?', 'Fx individuelle satser, manuelle tillæg eller "lige denne gang".',
          ['Ingen, alle følger de skrevne regler', 'Få, og de står på skrift', 'Flere, og nogle er kun aftalt mundtligt', 'Mange, vi har svært ved at holde styr på dem']],
        written: ['Har hver sælger en skriftlig provisionsaftale, fx som tillæg til kontrakten?', null,
          ['Ja, underskrevet og opdateret til den plan, vi bruger i dag', 'Ja, men den passer ikke helt til den nuværende plan', 'Kun en generel sætning om provision i kontrakten', 'Nej']],
        changes: ['Hvordan ændrer I planen, fx satser, kvoter eller grundlag?', null,
          ['Nye vilkår gælder fra en ny periode, og væsentlige forringelser varsles skriftligt med den enkeltes opsigelsesvarsel', 'Vi har ikke ændret planen og har ingen fast procedure', 'Vi giver skriftlig besked, men uden fast varsel', 'Vi ændrer løbende og fortæller det på et møde']],
        clawback: ['Står det på skrift, hvad der sker med provisionen, hvis kunden annullerer eller ikke betaler?', null,
          ['Ja, med periode, beregning og modregning', 'Ja, men kun som en kort sætning', 'Nej, vi tager det fra sag til sag']],
        absence: ['Hvordan indgår provision i lønnen under ferie og sygdom?', null,
          ['Vi har en fast metode for både ferie og sygdom, og den står i aftalen', 'Vi har en metode for den ene, men ikke den anden', 'Vi betaler kun grundløn under ferie og sygdom', 'Det ved vi ikke']],
        leaving: ['Hvis en sælger fratræder midt i året, hvad sker der så med en års- eller kvartalsbonus?', null,
          ['Det står i aftalen, og en forholdsmæssig andel udbetales', 'Bonus kræver, at man er ansat på udbetalingstidspunktet', 'Det er ikke beskrevet', 'Vi har ingen bonus, kun løbende provision']],
        time: ['Hvor lang tid bruger I samlet om måneden på at beregne provision?', 'Medregn eksport, regneark, kontrol og indtastning i løn.',
          ['Under 1 time, det meste sker automatisk', '1-4 timer', '1-2 arbejdsdage', 'Mere end 2 arbejdsdage']],
        disputes: ['Hvor ofte skal en opgørelse rettes, eller en sælger klager over beløbet?', null,
          ['Sjældent, et par gange om året', 'Et par gange i kvartalet', 'Næsten hver måned', 'Flere gange om måneden']],
        approval: ['Bliver provisionen kontrolleret og godkendt, før den går til løn?', null,
          ['Ja, sælgeren ser opgørelsen, og en leder eller økonomi godkender den', 'En person godkender, men sælgeren ser tallet først på lønsedlen', 'Den, der beregner, sender den selv videre', 'Nej, der er ingen fast kontrol']],
        payroll: ['Hvordan kommer provisionen ind i lønsystemet?', null,
          ['Via importfil eller integration', 'Vi taster beløbene manuelt på en særskilt lønart', 'Vi taster dem manuelt sammen med anden løn', 'Vi sender et regneark til bogholder eller lønbureau']],
        visibility: ['Hvor ofte ser sælgerne, hvad de har tjent i provision?', null,
          ['Løbende i perioden, fx i en app', 'En gang om måneden i en opgørelse', 'Først på lønsedlen', 'Kun hvis de spørger']],
        crm: ['Hvor pålidelige er de CRM-data, provisionen bygger på (beløb, ejer, dato og status)?', null,
          ['Pålidelige: vi beregner direkte fra CRM uden rettelser', 'Gode, men vi retter nogle handler manuelt hver måned', 'Vi skal ofte rette ejer, beløb eller dato før beregningen', 'Vi bruger ikke CRM-data, sælgerne indberetter selv']],
        aligned: ['Belønner planen det, virksomheden vil have mere af, fx dækningsbidrag, nye kunder eller fastholdelse?', null,
          ['Ja, grundlag og satser følger vores mål og margin', 'Delvist: den belønner omsætning, også når marginen er lav', 'Den er ikke tilpasset de nuværende mål', 'Det har vi ikke kigget på']]
      },
      r: {
        example: 'Lav et regneeksempel på en side med en typisk måned, og gennemgå det med teamet, før næste periode starter.',
        rewrite: 'Skriv planen, så den kan forklares på to minutter: hvad giver provision, med hvilken sats, og hvornår udbetales den.',
        sameCalc: 'Giv sælgerne den samme beregning, som I selv bruger, så de kan tjekke tallet før lønkørslen.',
        showCalc: 'Vis sælgerne en opgørelse med hver handel og sats, før perioden godkendes, så fejl fanges før lønsedlen.',
        exceptAnnex: 'Saml undtagelserne i et bilag med dato og godkender, og tag stilling til, om de skal med i næste periodes plan.',
        exceptWrite: 'Mundtlige særaftaler er en typisk kilde til tvister. Skriv hver undtagelse ned med beløb, periode og hvem der har godkendt den.',
        agreeUpdate: 'Opdater aftalen, så den svarer til den plan, I faktisk regner efter. Ændringer i løndele skal som udgangspunkt meddeles skriftligt senest, når de træder i kraft (ansættelsesbevisloven § 5).',
        agreeWrite: 'Løndele, herunder provision, skal som udgangspunkt fremgå skriftligt (ansættelsesbevisloven § 3). Brug en provisionsaftale som tillæg til kontrakten.',
        changeDecide: 'Beslut, før I får brug for det, hvordan ændringer varsles, og hvilken plan der gælder for handler i pipeline ved skiftet.',
        changeNotice: 'En væsentlig ændring, der stiller sælgeren ringere, skal som udgangspunkt varsles individuelt med medarbejderens opsigelsesvarsel. Indfør skriftligt varsel og nye vilkår fra en ny periode.',
        clawFull: 'Skriv clawback-reglen helt ud: hvilke hændelser, hvilket vindue (fx 3 måneder), hvordan beløbet beregnes, og at det modregnes i senere provision.',
        clawNone: 'Uden en skriftlig regel er det svært at kræve provision tilbage. Aftal reglerne på forhånd, og modregn i senere provision frem for at kræve beløb betalt.',
        absBoth: 'Brug en fast metode for både ferie og sygdom. Under sygdom skal lønnen som udgangspunkt indeholde den provision, sælgeren antagelig ville have tjent (funktionærloven § 9, stk. 3).',
        absBase: 'Kun grundløn under ferie og sygdom er en risiko: provisionslønnede funktionærer har som udgangspunkt krav på, at provisionen indgår, både under ferie med løn (ferieloven § 17) og under sygdom.',
        absUnknown: 'Afklar metoden for ferie og sygdom, og skriv den ind i aftalen. Domstolene har accepteret 12,5 % af sidste års provision som kompensation under ferie.',
        leaveClause: 'En klausul om, at bonus kun udbetales til ansatte på et bestemt tidspunkt, kan som udgangspunkt ikke gøres gældende over for en funktionær, der er omfattet af funktionærloven § 17 a. Gennemgå bonusreglen.',
        leaveDescribe: 'Beskriv, hvad der sker med bonus og provision ved fratræden, herunder en forholdsmæssig andel efter funktionærloven § 17 a og provision af handler, der lukker bagefter.',
        timeSteps: 'Find de trin, der stadig er manuelle (eksport fra CRM, regneark, indtastning i løn), og fjern dem et ad gangen.',
        timeDays: 'Dage om måneden går typisk til eksport, regneark og manuel indtastning. Hent salget direkte fra CRM, og send godkendte beløb til løn som fil eller integration.',
        disputeRoute: 'Giv indsigelser en fast rute: skriftlig indsigelse inden en frist, svar inden fx 10 arbejdsdage og en navngiven person, der beslutter.',
        disputeCause: 'Hyppige rettelser peger på uklare regler eller manuelle trin. Find de tre mest almindelige årsager, og ret reglen eller dataene, ikke kun beløbet.',
        approveRep: 'Lad sælgeren se opgørelsen, før den godkendes. Så fanges fejl, før de står på lønsedlen.',
        approveFour: 'Indfør fire øjne: en anden end den, der beregner, godkender perioden, før beløbene sendes til løn.',
        payImport: 'Brug lønsystemets importfil frem for manuel indtastning. Det fjerner tastefejl og dobbelt indlæsning.',
        payCode: 'Læg provision på sin egen lønart, så det er tydeligt, hvad der er fast og variabelt, og så ferie og pension beregnes rigtigt.',
        payManual: 'Hvert manuelt led mellem beregning og løn er et sted, hvor et beløb kan blive tastet forkert. Send godkendte beløb pr. medarbejder og lønart i en fil.',
        seeLive: 'Provision motiverer mest, når sælgeren kan se effekten af en handel med det samme. Vis tallene løbende i perioden, ikke kun ved månedens slutning.',
        seeLate: 'Når sælgeren først ser tallet på lønsedlen, kommer motivationen for sent, og fejl opdages sent. Send som minimum en opgørelse pr. periode, før den godkendes.',
        crmRules: 'Lav faste regler for, hvornår en handel er vundet, og hvem der står som ejer, så de manuelle rettelser forsvinder.',
        crmSource: 'Når salgsdata rettes i hånden eller indberettes af sælgerne selv, kan provisionen ikke efterprøves. Brug CRM som eneste kilde, og lås data, når perioden lukker.',
        alignMargin: 'Overvej at beregne provision af dækningsbidrag eller at begrænse provisionen ved store rabatter, så sælgerne ikke køber omsætning med margin.',
        alignReview: 'Gennemgå planen mod årets mål, før næste periode starter: hvad skal sælgerne gøre mere af, og belønner satserne netop det?'
      },
      ui: {
        step: 'Spørgsmål {n} af {total}', time: 'Ca. 3 minutter', back: 'Tilbage', next: 'Næste', finish: 'Se resultat', pick: 'Vælg et svar for at fortsætte.',
        areas: 'Områder', answered: '{n} af {total} besvaret', progress: 'Fremskridt',
        resKicker: 'Jeres resultat', of: 'af 100', scoreLabel: 'Samlet score', areaTitle: 'Score pr. område',
        topTitle: 'Jeres 3 vigtigste prioriteter', allTitle: 'Alle svar og anbefalinger', yourAnswer: 'Jeres svar', points: '{p} af 3 point',
        noRec: 'Ingen anbefaling: svaret giver fuld score.', noTop: 'Ingen svage punkter. Planen får fuld score på alle spørgsmål.', read: 'Læs',
        pdf: 'Download som PDF', retake: 'Tag testen igen',
        ctaH: 'Vil I have en gennemgang af jeres plan?', ctaP: 'På 30 minutter gennemgår vi jeres svar og viser, hvordan Prowi beregner provision fra jeres CRM, lader sælgerne følge med i en app og sender godkendte beløb videre til løn.', ctaBtn: 'Book 30 minutter', demo: '/demo',
        fine: 'Tjekket er en vejledende selvevaluering, ikke juridisk rådgivning. Hvert svar giver 0-3 point, og scoren er jeres point i procent af det mulige. Tjek altid overenskomst og ansættelseskontrakt, og spørg jeres advokat eller arbejdsgiverorganisation, hvis I er i tvivl.',
        sources: 'Kilder', live: 'Jeres score er {score} af 100: {band}. Område for område: {areas}.',
        printTitle: 'Provisionsplan-tjek', printFor: 'Rapport', printDate: 'Dato', printFoot: 'Vejledende selvevaluering, ikke juridisk rådgivning. Tag tjekket igen på prowi.io/provisionsplan-tjek', printBook: 'Book en gennemgang af jeres plan: prowi.io/demo',
        strong: 'Stærk', ok: 'Ok', weak: 'Svag', region: 'Provisionsplan-tjek'
      },
      bands: {
        risky: ['Risikabel', 'Planen har flere huller, der kan give fejl, tvister eller juridiske problemer. Start med de tre prioriteter nedenfor.'],
        vulnerable: ['Fungerer, men sårbar', 'Det grundlæggende er på plads, men der er svage punkter, der typisk bliver dyre, når teamet vokser, eller en sælger fratræder.'],
        healthy: ['Sund', 'Planen er klar, dokumenteret og drevet med styr på processen. Brug anbefalingerne til at finpudse den.']
      }
    },
    en: {
      q: {
        understood: ['Can your reps explain how their commission is calculated?', 'Think of a typical rep, not the most experienced one.',
          ['Yes, everyone can explain the plan in their own words', 'Most know the big picture, but not the details', 'Only a few understand it', 'No, the plan often raises questions']],
        selfcalc: ['Can a rep work out their own commission for a month and get the same number as you?', null,
          ['Yes, they follow the number as it builds and can see the calculation', 'Yes, with a spreadsheet or a statement from us', 'Only roughly, they wait for the payslip', 'No']],
        exceptions: ['How many exceptions and side agreements does your plan have?', 'For example individual rates, manual top-ups or "just this once".',
          ['None, everyone follows the written rules', 'A few, and they are in writing', 'Several, and some were only agreed verbally', 'Many, and we struggle to keep track of them']],
        written: ['Does every rep have a written commission agreement, for example as an annex to the contract?', null,
          ['Yes, signed and up to date with the plan we use today', 'Yes, but it does not quite match the current plan', 'Only a general sentence about commission in the contract', 'No']],
        changes: ['How do you change the plan, for example rates, quotas or the basis?', null,
          ['New terms apply from a new period, and material changes for the worse are notified in writing with each rep\'s notice period', 'We have not changed the plan and have no set procedure', 'We tell reps in writing, but with no set notice', 'We change it as we go and announce it in a meeting']],
        clawback: ['Is it written down what happens to commission if the customer cancels or does not pay?', null,
          ['Yes, with window, calculation and offset', 'Yes, but only as a short sentence', 'No, we decide case by case']],
        absence: ['How is commission included in pay during holiday and sickness?', null,
          ['We have a set method for both holiday and sickness, and it is in the agreement', 'We have a method for one, but not the other', 'We only pay base salary during holiday and sickness', 'We do not know']],
        leaving: ['If a rep leaves mid-year, what happens to an annual or quarterly bonus?', null,
          ['It is in the agreement, and a proportional share is paid', 'The bonus requires the rep to be employed on the payout date', 'It is not described', 'We have no bonus, only ongoing commission']],
        time: ['How much time do you spend in total each month calculating commission?', 'Include exports, spreadsheets, checks and entry into payroll.',
          ['Under 1 hour, most of it is automatic', '1-4 hours', '1-2 working days', 'More than 2 working days']],
        disputes: ['How often does a statement need correcting, or a rep query the amount?', null,
          ['Rarely, a couple of times a year', 'A couple of times a quarter', 'Almost every month', 'Several times a month']],
        approval: ['Is commission checked and approved before it goes to payroll?', null,
          ['Yes, the rep sees the statement, and a manager or finance approves it', 'One person approves, but the rep first sees the number on the payslip', 'Whoever calculates it sends it on themselves', 'No, there is no set check']],
        payroll: ['How does commission get into the payroll system?', null,
          ['Through an import file or an integration', 'We type the amounts in manually on a separate pay code', 'We type them in manually together with other pay', 'We send a spreadsheet to a bookkeeper or payroll bureau']],
        visibility: ['How often do reps see what they have earned in commission?', null,
          ['Continuously during the period, for example in an app', 'Once a month in a statement', 'Only on the payslip', 'Only if they ask']],
        crm: ['How reliable is the CRM data your commission is based on (amount, owner, date and status)?', null,
          ['Reliable: we calculate straight from the CRM with no corrections', 'Good, but we fix some deals by hand every month', 'We often have to fix owner, amount or date before calculating', 'We do not use CRM data, reps report their own sales']],
        aligned: ['Does the plan reward what the company wants more of, for example gross margin, new customers or retention?', null,
          ['Yes, the basis and rates follow our goals and margin', 'Partly: it rewards revenue even when the margin is low', 'It has not been adjusted to the current goals', 'We have not looked at it']]
      },
      r: {
        example: 'Write a one-page worked example of a typical month, and walk the team through it before the next period starts.',
        rewrite: 'Write the plan so it can be explained in two minutes: what earns commission, at which rate, and when it is paid.',
        sameCalc: 'Give reps the same calculation you use yourselves, so they can check the number before payroll runs.',
        showCalc: 'Show reps a statement with every deal and rate before the period is approved, so errors are caught before the payslip.',
        exceptAnnex: 'Collect the exceptions in an annex with date and approver, and decide whether they belong in next period\'s plan.',
        exceptWrite: 'Verbal side agreements are a common source of disputes. Write down every exception with amount, period and who approved it.',
        agreeUpdate: 'Update the agreement so it matches the plan you actually calculate by. Under Danish rules, changes to pay components generally have to be notified in writing no later than the day they take effect (Employment Contracts Act, section 5).',
        agreeWrite: 'Under Danish rules, pay components, including commission, generally have to be stated in writing (Employment Contracts Act, section 3). Use a commission agreement as an annex to the contract.',
        changeDecide: 'Decide before you need it how changes are notified, and which plan applies to deals in the pipeline at the changeover.',
        changeNotice: 'A material change that leaves the rep worse off generally has to be notified individually with the employee\'s notice period. Introduce written notice and new terms from a new period.',
        clawFull: 'Write the clawback rule out in full: which events, which window (for example 3 months), how the amount is calculated, and that it is offset against later commission.',
        clawNone: 'Without a written rule it is hard to claim commission back. Agree the rules in advance, and offset against later commission rather than asking for repayment.',
        absBoth: 'Use a set method for both holiday and sickness. Under the Danish Salaried Employees Act, pay during sickness generally has to include the commission the rep would presumably have earned (section 9(3)).',
        absBase: 'Paying only base salary during holiday and sickness is a risk: under Danish rules, commission-paid salaried employees are generally entitled to have commission included, both during paid holiday (Holiday Act, section 17) and during sickness.',
        absUnknown: 'Settle the method for holiday and sickness, and write it into the agreement. Danish courts have accepted 12.5% of the previous year\'s commission as compensation during holiday.',
        leaveClause: 'A clause saying a bonus is only paid to staff employed on a set date generally cannot be enforced against a salaried employee covered by section 17a of the Danish Salaried Employees Act. Review the bonus rule.',
        leaveDescribe: 'Describe what happens to bonus and commission when a rep leaves, including a proportional share under section 17a of the Danish Salaried Employees Act and commission on deals that close afterwards.',
        timeSteps: 'Find the steps that are still manual (CRM export, spreadsheet, payroll entry) and remove them one at a time.',
        timeDays: 'Days each month usually go on exports, spreadsheets and manual entry. Read sales straight from the CRM, and send approved amounts to payroll as a file or through an integration.',
        disputeRoute: 'Give queries a fixed route: a written objection within a deadline, a reply within for example 10 working days, and a named person who decides.',
        disputeCause: 'Frequent corrections point to unclear rules or manual steps. Find the three most common causes, and fix the rule or the data, not just the amount.',
        approveRep: 'Let the rep see the statement before it is approved. Errors are then caught before they reach the payslip.',
        approveFour: 'Use four eyes: someone other than the person who calculates approves the period before the amounts go to payroll.',
        payImport: 'Use the payroll system\'s import file instead of typing amounts in. It removes typos and double entries.',
        payCode: 'Put commission on its own pay code, so fixed and variable pay are clearly separate, and holiday pay and pension are calculated correctly.',
        payManual: 'Every manual step between calculation and payroll is a place where an amount can be typed wrong. Send approved amounts per employee and pay code in a file.',
        seeLive: 'Commission motivates most when reps see the effect of a deal straight away. Show the numbers during the period, not only at month end.',
        seeLate: 'When reps first see the number on the payslip, the motivation comes too late and errors are found late. At a minimum, send a statement each period before it is approved.',
        crmRules: 'Set fixed rules for when a deal counts as won and who is the owner, so the manual fixes disappear.',
        crmSource: 'When sales data is fixed by hand or reported by reps themselves, commission cannot be checked. Use the CRM as the single source, and lock the data when the period closes.',
        alignMargin: 'Consider paying commission on gross margin or limiting commission on large discounts, so reps do not buy revenue with margin.',
        alignReview: 'Review the plan against this year\'s goals before the next period starts: what should reps do more of, and do the rates reward exactly that?'
      },
      ui: {
        step: 'Question {n} of {total}', time: 'About 3 minutes', back: 'Back', next: 'Next', finish: 'See result', pick: 'Choose an answer to continue.',
        areas: 'Areas', answered: '{n} of {total} answered', progress: 'Progress',
        resKicker: 'Your result', of: 'of 100', scoreLabel: 'Total score', areaTitle: 'Score by area',
        topTitle: 'Your top 3 priorities', allTitle: 'All answers and recommendations', yourAnswer: 'Your answer', points: '{p} of 3 points',
        noRec: 'No recommendation: this answer scores in full.', noTop: 'No weak spots. The plan scores in full on every question.', read: 'Read',
        pdf: 'Download as PDF', retake: 'Take the check again',
        ctaH: 'Want a review of your plan?', ctaP: 'In 30 minutes we go through your answers and show how Prowi calculates commission from your CRM, lets reps follow along in an app and passes approved amounts on to payroll.', ctaBtn: 'Book 30 minutes', demo: '/en/demo',
        fine: 'The check is a self-assessment for guidance, not legal advice. Each answer scores 0-3 points, and the score is your points as a percentage of the maximum. The legal points refer to Danish rules. Always check your collective agreement and employment contracts, and ask your lawyer or employers\' organisation if in doubt.',
        sources: 'Sources', live: 'Your score is {score} of 100: {band}. By area: {areas}.',
        printTitle: 'Commission plan health check', printFor: 'Report', printDate: 'Date', printFoot: 'Self-assessment for guidance, not legal advice. Take the check again at prowi.io/en/commission-plan-health-check', printBook: 'Book a review of your plan: prowi.io/en/demo',
        strong: 'Strong', ok: 'OK', weak: 'Weak', region: 'Commission plan health check'
      },
      bands: {
        risky: ['At risk', 'The plan has several gaps that can lead to errors, disputes or legal problems. Start with the three priorities below.'],
        vulnerable: ['Works, but vulnerable', 'The basics are in place, but there are weak spots that tend to get expensive as the team grows or when a rep leaves.'],
        healthy: ['Healthy', 'The plan is clear, documented and run with a controlled process. Use the recommendations to fine-tune it.']
      }
    }
  };
  // official sources behind the legal recommendations (shown under the result and in the PDF)
  var SOURCES = [
    ['https://www.retsinformation.dk/eli/lta/2017/1002', { da: 'Funktionærloven, LBK nr. 1002 af 24/08/2017 (§ 2, § 9 og § 17 a)', en: 'Danish Salaried Employees Act (funktionærloven), LBK no. 1002 of 24/08/2017 (sections 2, 9 and 17a), in Danish' }],
    ['https://www.retsinformation.dk/eli/lta/2024/152', { da: 'Ferieloven, LBK nr. 152 af 20/02/2024 (§ 17)', en: 'Danish Holiday Act (ferieloven), LBK no. 152 of 20/02/2024 (section 17), in Danish' }],
    ['https://www.retsinformation.dk/eli/lta/2023/501', { da: 'Ansættelsesbevisloven, lov nr. 501 af 16/05/2023 (§ 3 og § 5)', en: 'Danish Employment Contracts Act, act no. 501 of 16/05/2023 (sections 3 and 5), in Danish' }]
  ];

  /* ---------------- scoring (pure) ---------------- */
  var MAXP = 3;
  function band(score) { return score >= 75 ? 'healthy' : score >= 50 ? 'vulnerable' : 'risky'; }
  function bucket(score) { var b = Math.min(90, Math.floor(score / 10) * 10); return b + '-' + (b === 90 ? 100 : b + 9); }
  function optOf(q, id) { for (var i = 0; i < q.opts.length; i++) if (q.opts[i][0] === id) return q.opts[i]; return null; }
  /* answers: { questionId: optionId }. Unanswered questions count as 0 points (the UI only scores complete runs). */
  function score(answers) {
    answers = answers || {};
    var areas = {}, pts = 0, max = 0, recs = [];
    AREAS.forEach(function (a) { areas[a.id] = { id: a.id, pts: 0, max: 0 }; });
    Q.forEach(function (q, qi) {
      var o = optOf(q, answers[q.id]), p = o ? o[1] : 0;
      pts += p; max += MAXP; areas[q.area].pts += p; areas[q.area].max += MAXP;
      if (o && p < MAXP && o[2]) recs.push({ q: q.id, qi: qi, area: q.area, opt: o[0], points: p, gap: MAXP - p, imp: q.imp, rec: o[2], res: res(o[3]) });
    });
    var total = Math.round(pts / max * 100);
    var list = AREAS.map(function (a) { var x = areas[a.id]; x.score = Math.round(x.pts / x.max * 100); return x; });
    // priorities: most points missed first; on a tie the more important question (legal and control points), then question order
    var top = recs.slice().sort(function (a, b) { return (b.gap - a.gap) || (b.imp - a.imp) || (a.qi - b.qi); }).slice(0, 3);
    return { points: pts, max: max, total: total, band: band(total), bucket: bucket(total), areas: list, recs: recs, top: top };
  }
  function complete(answers) { return Q.every(function (q) { return answers && optOf(q, answers[q.id]); }); }

  var API = { AREAS: AREAS, Q: Q, T: T, RES: RES, SOURCES: SOURCES, score: score, band: band, bucket: bucket, complete: complete, res: res, MAXP: MAXP };
  if (typeof module === 'object' && module.exports) { module.exports = API; return; }
  if (typeof document === 'undefined') return;
  var ROOT_SEL = '[data-tool="health-check"]';
  if (!document.querySelector(ROOT_SEL)) return;

  /* ---------------- styles (scoped to .pw-hc; token values as in calc-kit.js) ---------------- */
  var V = function (n, f) { return 'var(--_prowi---pw-' + n + ',' + f + ')'; };
  var C = {
    purple: V('purple', '#4C39CA'), dark: V('dark-purple', '#110663'), subtle: V('bg-subtle', '#F4F1FE'), base: V('base', '#EDE7E5'),
    white: V('white', '#FFFFFF'), text2: V('text-secondary', '#34326C'), muted: V('text-muted', '#5E5B98'),
    hair: V('border-hairline', 'rgba(17,6,99,0.1)'), strong: V('border-strong', 'rgba(17,6,99,0.14)')
  };
  var EASE = 'cubic-bezier(.2,.6,.2,1)';
  var CSS = [
    '.pw-hc{display:grid;max-width:1120px;margin:0 auto;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:1px;border:1px solid ' + C.hair + ';background:' + C.hair + ';color:' + C.dark + ';font-size:16px;line-height:1.55;text-align:left}',
    '.pw-hc *{box-sizing:border-box}',
    '.pw-hc [hidden]{display:none!important}',
    '.pw-hc__sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;white-space:nowrap;clip-path:inset(50%)}',
    // quiz: aside (areas) + question
    '.pw-hc__aside{display:flex;min-width:0;flex-direction:column;gap:18px;padding:clamp(24px,3vw,40px);background:' + C.base + '}',
    '.pw-hc__label{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.02em;line-height:1.4;color:' + C.muted + '}',
    '.pw-hc__areas{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}',
    '.pw-hc__area{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid ' + C.strong + ';background:' + C.white + ';font-size:14px;font-weight:500;line-height:1.35}',
    '.pw-hc__area.is-current{border-color:' + C.dark + ';background:' + C.dark + ';color:#fff}',
    '.pw-hc__area-n{flex:none;font-size:12.5px;font-weight:500;opacity:.7;font-variant-numeric:tabular-nums}',
    '.pw-hc__meta{font-size:13px;line-height:1.5;color:' + C.muted + '}',
    '.pw-hc__main{display:flex;min-width:0;flex-direction:column;background:' + C.white + '}',
    '.pw-hc__top{display:flex;flex-direction:column;gap:10px;padding:clamp(20px,2.5vw,28px) clamp(24px,3vw,40px) 0}',
    '.pw-hc__topline{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:13px;font-weight:500;color:' + C.text2 + ';font-variant-numeric:tabular-nums}',
    '.pw-hc__topline span:last-child{color:' + C.muted + ';font-weight:400}',
    '.pw-hc__prog{display:grid;grid-template-columns:3fr 5fr 4fr 3fr;gap:4px}',
    '.pw-hc__seg{height:6px;border-radius:999px;background:' + C.subtle + ';overflow:hidden}',
    '.pw-hc__seg-fill{width:0;height:100%;border-radius:999px;background-image:linear-gradient(135deg,#b68ff8 0%,#2217b7 100%);transition:width 320ms ' + EASE + '}',
    '.pw-hc__form{display:flex;flex:1 1 auto;flex-direction:column;gap:22px;margin:0;padding:clamp(20px,2.5vw,28px) clamp(24px,3vw,40px) clamp(24px,3vw,40px)}',
    '.pw-hc__fs{min-width:0;margin:0;padding:0;border:0}',
    '.pw-hc__area-tag{display:block;margin-bottom:8px}',
    '.pw-hc__q{display:block;float:left;width:100%;margin:0;padding:0;font-size:clamp(20px,2.1vw,26px);font-weight:500;line-height:1.3;letter-spacing:-.01em;color:' + C.dark + '}',
    '.pw-hc__q:focus{outline:none}',
    '.pw-hc__q:focus-visible{outline:2px solid #4C39CA;outline-offset:4px;border-radius:4px}',
    '.pw-hc__hint{clear:both;margin:0;padding-top:8px;font-size:14px;line-height:1.5;color:' + C.muted + '}',
    '.pw-hc__opts{clear:both;display:flex;flex-direction:column;gap:8px;padding-top:18px}',
    '.pw-hc__opt{position:relative;display:flex;align-items:flex-start;gap:12px;margin:0;padding:14px 16px;border-radius:12px;border:1px solid ' + C.strong + ';background:' + C.white + ';font-size:15px;font-weight:400;line-height:1.45;color:' + C.dark + ';cursor:pointer;transition:background-color 200ms,border-color 200ms,box-shadow 140ms}',
    '.pw-hc__opt:hover{border-color:rgba(17,6,99,.32)}',
    '.pw-hc__opt.is-on{border-color:' + C.dark + ';background:' + C.subtle + '}',
    '.pw-hc__opt:has(.pw-hc__radio:focus-visible){box-shadow:0 0 0 4px rgba(76,57,202,.18);border-color:#4C39CA}',
    '.pw-hc__radio{flex:none;width:20px;height:20px;margin:1px 0 0;border-radius:50%;border:1.5px solid rgba(17,6,99,.4);background:#fff;-webkit-appearance:none;appearance:none;cursor:pointer;display:grid;place-content:center;transition:border-color 160ms}',
    '.pw-hc__radio::before{content:"";width:10px;height:10px;border-radius:50%;background:' + C.dark + ';transform:scale(0);transition:transform 160ms ' + EASE + '}',
    '.pw-hc__radio:checked{border-color:' + C.dark + '}',
    '.pw-hc__radio:checked::before{transform:scale(1)}',
    '.pw-hc__radio:focus-visible{outline:2px solid #4C39CA;outline-offset:2px}',
    '.pw-hc__err{margin:0;font-size:13.5px;color:#9a3412}',
    '.pw-hc__nav{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto}',
    '.pw-hc__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:12px 22px;border-radius:12px;border:1px solid ' + C.dark + ';background:' + C.dark + ';color:#fff;font:inherit;font-size:15px;font-weight:500;line-height:1.2;text-decoration:none;cursor:pointer;transition:background-color 200ms,color 200ms,border-color 200ms,transform 200ms}',
    '.pw-hc__btn:hover{background:#2217b7;border-color:#2217b7;color:#fff}',
    '.pw-hc__btn--ghost{background:transparent;color:' + C.dark + ';border-color:' + C.strong + '}',
    '.pw-hc__btn--ghost:hover{background:' + C.subtle + ';color:' + C.dark + ';border-color:' + C.dark + '}',
    '.pw-hc__btn--light{background:#fff;color:' + C.dark + ';border-color:#fff}',
    '.pw-hc__btn--light:hover{background:' + C.subtle + ';color:' + C.dark + ';border-color:' + C.subtle + '}',
    '.pw-hc__btn:focus-visible{outline:2px solid #4C39CA;outline-offset:3px}',
    '.pw-hc__btn--light:focus-visible{outline-color:#fff}',
    '.pw-hc__btn[hidden]{display:none}',
    '.pw-hc__in{animation:pw-hc-in 260ms ' + EASE + ' both}',
    '@keyframes pw-hc-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    // result
    '.pw-hc--result{grid-template-columns:repeat(4,minmax(0,1fr))}',
    '.pw-hc__hero{position:relative;display:grid;grid-column:1/-1;grid-template-columns:minmax(0,300px) minmax(0,1fr);align-items:center;gap:clamp(20px,4vw,56px);overflow:hidden;padding:clamp(28px,3.5vw,48px);background:' + C.dark + ';color:#fff}',
    '.pw-hc__glow{position:absolute;top:-40%;right:-15%;width:50%;aspect-ratio:1/1;border-radius:50%;background-image:radial-gradient(circle,rgba(70,211,247,.2),transparent 65%);pointer-events:none}',
    '.pw-hc__gauge{position:relative;width:100%;max-width:300px}',
    '.pw-hc__gauge svg{display:block;width:100%;height:auto;overflow:visible}',
    '.pw-hc__gauge-track{fill:none;stroke:rgba(255,255,255,.14);stroke-width:14;stroke-linecap:round}',
    '.pw-hc__gauge-fill{fill:none;stroke:url(#pw-hc-grad);stroke-width:14;stroke-linecap:round;transition:stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)}',
    '.pw-hc__gauge-num{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center}',
    '.pw-hc__score{font-size:clamp(48px,6vw,72px);font-weight:300;line-height:1;letter-spacing:-.03em;font-variant-numeric:tabular-nums}',
    '.pw-hc__of{font-size:13px;color:rgba(255,255,255,.7)}',
    '.pw-hc__sum{position:relative;display:flex;min-width:0;flex-direction:column;align-items:flex-start;gap:12px}',
    '.pw-hc__kicker{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.02em;color:rgba(255,255,255,.7)}',
    '.pw-hc__band{margin:0;font-size:clamp(26px,3vw,38px);font-weight:400;line-height:1.15;letter-spacing:-.02em;color:#fff}',
    '.pw-hc__band:focus{outline:none}',
    '.pw-hc__band:focus-visible{outline:2px solid #fff;outline-offset:4px;border-radius:4px}',
    '.pw-hc__chip{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:500;line-height:1.3}',
    '.pw-hc__chip::before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}',
    '.pw-hc__chip--risky{background:rgba(255,122,99,.18);color:#ffb3a6}',
    '.pw-hc__chip--vulnerable{background:rgba(201,138,0,.22);color:#ffe3a3}',
    '.pw-hc__chip--healthy{background:rgba(52,199,123,.2);color:#9ff0c4}',
    '.pw-hc__bandtext{margin:0;max-width:56ch;font-size:15px;line-height:1.55;color:rgba(255,255,255,.8)}',
    '.pw-hc__card{display:flex;min-width:0;flex-direction:column;gap:10px;padding:22px 24px;background:' + C.white + '}',
    '.pw-hc__metric{display:flex;align-items:baseline;gap:6px;line-height:1;font-weight:500;letter-spacing:-.02em;font-size:clamp(24px,2.3vw,32px);font-variant-numeric:tabular-nums}',
    '.pw-hc__metric small{font-size:13px;font-weight:400;letter-spacing:0;color:' + C.muted + '}',
    '.pw-hc__bar{display:flex;height:8px;border-radius:999px;background:' + C.subtle + ';overflow:hidden}',
    '.pw-hc__bar-fill{width:0;height:100%;border-radius:999px;background-image:linear-gradient(135deg,#b68ff8 0%,#2217b7 100%);transition:width 900ms ' + EASE + '}',
    '.pw-hc__state{font-size:13px;color:' + C.text2 + '}',
    '.pw-hc__block{display:flex;min-width:0;flex-direction:column;gap:14px;grid-column:1/-1;padding:clamp(24px,3vw,36px);background:' + C.base + '}',
    '.pw-hc__block--white{background:' + C.white + '}',
    '.pw-hc__h{margin:0;font-size:clamp(19px,1.8vw,22px);font-weight:500;line-height:1.3;color:' + C.dark + '}',
    '.pw-hc__tops{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:10px;margin:0;padding:0;list-style:none;counter-reset:pwhc}',
    '.pw-hc__top-item{display:flex;flex-direction:column;gap:8px;padding:18px 20px;border-radius:12px;background:' + C.white + ';border:1px solid ' + C.hair + ';counter-increment:pwhc}',
    '.pw-hc__top-item::before{content:counter(pwhc);display:grid;place-content:center;width:28px;height:28px;border-radius:50%;background:' + C.dark + ';color:#fff;font-size:13px;font-weight:600}',
    '.pw-hc__top-q{font-size:12.5px;font-weight:600;text-transform:uppercase;letter-spacing:.02em;color:' + C.muted + '}',
    '.pw-hc__rec{margin:0;font-size:14.5px;line-height:1.55;color:' + C.dark + '}',
    '.pw-hc__link{align-self:flex-start;font-size:14px;font-weight:500;color:' + C.purple + ';text-decoration:underline;text-underline-offset:3px}',
    '.pw-hc__link:focus-visible{outline:2px solid #4C39CA;outline-offset:2px;border-radius:2px}',
    '.pw-hc__cta{position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px 32px;grid-column:1/-1;overflow:hidden;padding:clamp(24px,3vw,40px);background:#2217b7;color:#fff}',
    '.pw-hc__cta-copy{position:relative;display:flex;max-width:620px;flex-direction:column;gap:8px}',
    '.pw-hc__cta-h{margin:0;font-size:clamp(20px,2vw,26px);font-weight:500;line-height:1.25;color:#fff}',
    '.pw-hc__cta-p{margin:0;font-size:15px;line-height:1.55;color:rgba(255,255,255,.82)}',
    '.pw-hc__actions{display:flex;flex-wrap:wrap;gap:10px;grid-column:1/-1;padding:18px clamp(24px,3vw,36px);background:' + C.white + '}',
    '.pw-hc__group{display:flex;flex-direction:column;gap:0;margin:0;padding:0;list-style:none;border-top:1px solid ' + C.hair + '}',
    '.pw-hc__row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 16px;padding:14px 0;border-bottom:1px solid ' + C.hair + '}',
    '.pw-hc__row-q{font-size:14.5px;font-weight:500;line-height:1.4;color:' + C.dark + '}',
    '.pw-hc__row-a{grid-column:1/2;font-size:13.5px;line-height:1.45;color:' + C.text2 + '}',
    '.pw-hc__row-p{grid-row:1/3;grid-column:2/3;align-self:start;padding:3px 10px;border-radius:999px;background:' + C.subtle + ';font-size:12.5px;font-weight:500;white-space:nowrap;color:' + C.dark + ';font-variant-numeric:tabular-nums}',
    '.pw-hc__row-p--full{background:rgba(52,199,123,.16)}',
    '.pw-hc__row-r{grid-column:1/-1;display:flex;flex-direction:column;gap:6px;margin-top:4px;padding:10px 12px;border-radius:8px;background:' + C.subtle + '}',
    '.pw-hc__row-r .pw-hc__rec{font-size:14px}',
    '.pw-hc__fine{margin:0;font-size:12.5px;line-height:1.5;color:' + C.muted + '}',
    '.pw-hc__fine a{color:' + C.purple + ';text-decoration:underline;text-underline-offset:3px}',
    '.pw-hc__src{margin:0;padding-left:18px;font-size:12.5px;line-height:1.5;color:' + C.muted + '}',
    '.pw-hc__src a{color:' + C.purple + '}',
    '@media (max-width:991px){.pw-hc{grid-template-columns:minmax(0,1fr) minmax(0,1.6fr)}.pw-hc--result{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '@media (max-width:767px){.pw-hc{grid-template-columns:minmax(0,1fr)}.pw-hc--result{grid-template-columns:repeat(2,minmax(0,1fr))}.pw-hc__aside{display:none}.pw-hc__hero{grid-template-columns:minmax(0,1fr);justify-items:center;text-align:center}.pw-hc__sum{align-items:center}.pw-hc__gauge{max-width:260px}.pw-hc__card{padding:18px}.pw-hc__opt{padding:13px 14px}.pw-hc__cta .pw-hc__btn,.pw-hc__actions .pw-hc__btn{flex:1 1 auto}}',
    '@media (max-width:420px){.pw-hc--result{grid-template-columns:minmax(0,1fr)}.pw-hc__nav .pw-hc__btn{padding:12px 18px}}',
    '@media (prefers-reduced-motion:reduce){.pw-hc__in{animation:none}.pw-hc__seg-fill,.pw-hc__bar-fill,.pw-hc__gauge-fill,.pw-hc__opt,.pw-hc__radio,.pw-hc__radio::before,.pw-hc__btn{transition:none}}',
    // print report (A4): only the report container prints while a result is shown
    '.pw-hc-print{display:none}',
    '@media print{',
    '@page{size:A4;margin:14mm 16mm}',
    'html.pw-hc-report body>*:not(.pw-hc-print){display:none!important}',
    'html.pw-hc-report body{margin:0!important;padding:0!important;background:#fff!important}',
    'html.pw-hc-report .pw-hc-print{display:block!important}',
    '.pw-hc-print{color:#110663;font-size:10.5pt;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    '.pw-hc-print *{box-sizing:border-box}',
    '.pw-hc-print__head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding-bottom:8pt;border-bottom:1.5pt solid #110663}',
    '.pw-hc-print__logo{font-size:20pt;font-weight:700;letter-spacing:-.02em;color:#4C39CA}',
    '.pw-hc-print__title{font-size:12pt;font-weight:500}',
    '.pw-hc-print__date{font-size:9.5pt;color:#5E5B98;text-align:right}',
    '.pw-hc-print__score{display:flex;align-items:center;gap:16pt;margin:12pt 0 6pt}',
    '.pw-hc-print__big{font-size:34pt;font-weight:300;line-height:1}',
    '.pw-hc-print__band{font-size:14pt;font-weight:500}',
    '.pw-hc-print p{margin:0 0 6pt}',
    '.pw-hc-print h2{margin:14pt 0 6pt;font-size:12.5pt;font-weight:600;break-after:avoid}',
    '.pw-hc-print h3{margin:10pt 0 4pt;font-size:11pt;font-weight:600;break-after:avoid}',
    '.pw-hc-print table{width:100%;border-collapse:collapse}',
    '.pw-hc-print td,.pw-hc-print th{padding:4pt 6pt;border-bottom:.5pt solid #d6d3e6;text-align:left;vertical-align:top}',
    '.pw-hc-print th{font-size:9pt;text-transform:uppercase;letter-spacing:.02em;color:#5E5B98}',
    '.pw-hc-print__bar{display:block;width:120pt;height:6pt;border-radius:3pt;background:#F4F1FE;overflow:hidden}',
    '.pw-hc-print__bar i{display:block;height:100%;background:#4C39CA}',
    '.pw-hc-print__item{padding:5pt 0;border-bottom:.5pt solid #e4e1ef;break-inside:avoid}',
    '.pw-hc-print__keep{break-inside:avoid}',
    '.pw-hc-print__q{font-weight:600}',
    '.pw-hc-print__a{color:#34326C}',
    '.pw-hc-print__r{margin-top:2pt}',
    '.pw-hc-print__u{color:#4C39CA}',
    '.pw-hc-print ol{margin:0;padding-left:16pt}',
    '.pw-hc-print ol li{margin-bottom:5pt;break-inside:avoid}',
    '.pw-hc-print__foot{margin-top:14pt;padding-top:8pt;border-top:.5pt solid #d6d3e6;font-size:9pt;color:#5E5B98}',
    '}'
  ].join('');

  /* ---------------- page ---------------- */
  var KEY = 'pwHealthCheck.v1';
  function load() { try { var s = JSON.parse(sessionStorage.getItem(KEY) || 'null'); return s && typeof s === 'object' && s.a ? s : null; } catch (e) { return null; } }
  function save(st) { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* private mode */ } }
  function track(name, props) { try { if (window.plausible) window.plausible(name, props ? { props: props } : undefined); } catch (e) { /* analytics off */ } }

  function mount(doc) {
    var root = doc.querySelector(ROOT_SEL);
    if (!root || root.getAttribute('data-hc-ready')) return;
    root.setAttribute('data-hc-ready', '1');
    var w = doc.defaultView || window;
    var lang = /^en/i.test(doc.documentElement.getAttribute('lang') || '') ? 'en' : 'da';
    var S = T[lang], U = S.ui;
    if (!doc.getElementById('pw-hc-css')) { var st = doc.createElement('style'); st.id = 'pw-hc-css'; st.textContent = CSS; (doc.head || doc.documentElement).appendChild(st); }
    var reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
    function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
    function tpl(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] == null ? m : o[k]; }); }
    function areaName(id) { for (var i = 0; i < AREAS.length; i++) if (AREAS[i].id === id) return AREAS[i][lang]; return id; }
    function resLink(key) { var r = RES[key][lang]; var a = el('a', 'pw-hc__link', U.read + ': ' + r[1]); a.href = r[0]; return a; }

    var state = load() || { a: {}, i: 0, done: false, sent: false };
    if (typeof state.i !== 'number' || state.i < 0 || state.i >= Q.length) state.i = 0;
    if (state.done && !complete(state.a)) state.done = false;

    var box = el('div', 'pw-hc');
    box.setAttribute('role', 'region'); box.setAttribute('aria-label', U.region);
    var live = el('div', 'pw-hc__sr'); live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status');
    while (root.firstChild) root.removeChild(root.firstChild);
    root.appendChild(box); root.appendChild(live);

    var lastPointer = 0, advanceTimer = 0;
    // how the last answer was picked: a tap or click moves on by itself, a key press (arrows, space) does not
    doc.addEventListener('pointerdown', function () { lastPointer = Date.now(); }, true);
    doc.addEventListener('keydown', function () { lastPointer = 0; }, true);

    /* ---- quiz ---- */
    function renderQuiz(focus) {
      clearTimeout(advanceTimer);
      doc.documentElement.classList.remove('pw-hc-report');
      box.className = 'pw-hc';
      box.innerHTML = '';
      box.removeAttribute('aria-labelledby'); box.setAttribute('aria-label', U.region);
      var i = state.i, q = Q[i], tq = S.q[q.id];
      // aside: areas with progress
      var aside = el('div', 'pw-hc__aside');
      var al = el('div', 'pw-hc__label', U.areas); al.id = 'pw-hc-areas';
      var ul = el('ul', 'pw-hc__areas'); ul.setAttribute('aria-labelledby', al.id);
      AREAS.forEach(function (a) {
        var qs = Q.filter(function (x) { return x.area === a.id; }), n = qs.filter(function (x) { return optOf(x, state.a[x.id]); }).length;
        var li = el('li', 'pw-hc__area' + (a.id === q.area ? ' is-current' : ''));
        li.appendChild(el('span', null, a[lang]));
        li.appendChild(el('span', 'pw-hc__area-n', tpl(U.answered, { n: n, total: qs.length })));
        if (a.id === q.area) li.setAttribute('aria-current', 'step');
        ul.appendChild(li);
      });
      aside.appendChild(al); aside.appendChild(ul);
      aside.appendChild(el('div', 'pw-hc__meta', U.time + ' · ' + Q.length + ' ' + (lang === 'en' ? 'questions' : 'spørgsmål')));
      box.appendChild(aside);

      var main = el('div', 'pw-hc__main');
      var top = el('div', 'pw-hc__top');
      var tl = el('div', 'pw-hc__topline');
      tl.appendChild(el('span', null, tpl(U.step, { n: i + 1, total: Q.length })));
      tl.appendChild(el('span', null, U.time));
      top.appendChild(tl);
      // progress: one segment per area, filled by answered questions (decorative; the text above carries it)
      var prog = el('div', 'pw-hc__prog'); prog.setAttribute('aria-hidden', 'true');
      AREAS.forEach(function (a) {
        var qs = Q.filter(function (x) { return x.area === a.id; }), n = qs.filter(function (x) { return optOf(x, state.a[x.id]); }).length;
        var sg = el('div', 'pw-hc__seg'), f = el('div', 'pw-hc__seg-fill'); f.style.width = Math.round(n / qs.length * 100) + '%';
        sg.appendChild(f); prog.appendChild(sg);
      });
      top.appendChild(prog);
      main.appendChild(top);

      var form = el('form', 'pw-hc__form' + (reduce ? '' : ' pw-hc__in'));
      form.setAttribute('novalidate', '');
      var fs = el('fieldset', 'pw-hc__fs');
      var lg = el('legend', 'pw-hc__q');
      var tag = el('span', 'pw-hc__label pw-hc__area-tag', areaName(q.area)); lg.appendChild(tag);
      lg.appendChild(doc.createTextNode(tq[0]));
      var qh = lg; qh.id = 'pw-hc-q-' + q.id; qh.tabIndex = -1;
      fs.appendChild(lg);
      if (tq[1]) { var h = el('p', 'pw-hc__hint', tq[1]); h.id = 'pw-hc-hint-' + q.id; fs.setAttribute('aria-describedby', h.id); fs.appendChild(h); }
      var opts = el('div', 'pw-hc__opts');
      var labels = [];
      q.opts.forEach(function (o, k) {
        var lab = el('label', 'pw-hc__opt'), inp = el('input', 'pw-hc__radio');
        inp.type = 'radio'; inp.name = 'pw-hc-' + q.id; inp.value = o[0]; inp.id = 'pw-hc-' + q.id + '-' + o[0];
        if (state.a[q.id] === o[0]) { inp.checked = true; lab.classList.add('is-on'); }
        lab.htmlFor = inp.id;
        lab.appendChild(inp); lab.appendChild(el('span', null, tq[2][k]));
        inp.addEventListener('change', function () {
          state.a[q.id] = o[0]; state.done = false; save(state);
          labels.forEach(function (l) { l.classList.toggle('is-on', l.querySelector('input').checked); });
          err.hidden = true;
          // keyboard users move on with Enter or the button (arrow keys only select)
          if (Date.now() - lastPointer < 800) { clearTimeout(advanceTimer); advanceTimer = setTimeout(next, reduce ? 120 : 280); }
        });
        labels.push(lab); opts.appendChild(lab);
      });
      fs.appendChild(opts);
      form.appendChild(fs);
      var err = el('p', 'pw-hc__err', U.pick); err.setAttribute('role', 'alert'); err.hidden = true;
      form.appendChild(err);
      var nav = el('div', 'pw-hc__nav');
      var back = el('button', 'pw-hc__btn pw-hc__btn--ghost', U.back); back.type = 'button'; back.hidden = i === 0;
      back.addEventListener('click', function () { if (state.i > 0) { state.i--; save(state); renderQuiz(true); } });
      var nx = el('button', 'pw-hc__btn', i === Q.length - 1 ? U.finish : U.next); nx.type = 'submit';
      nav.appendChild(i === 0 ? el('span') : back); nav.appendChild(nx);
      form.appendChild(nav);
      form.addEventListener('submit', function (e) { e.preventDefault(); next(); });
      main.appendChild(form);
      box.appendChild(main);

      function next() {
        clearTimeout(advanceTimer);
        if (!optOf(q, state.a[q.id])) { err.hidden = false; return; }
        if (state.i < Q.length - 1) { state.i++; save(state); renderQuiz(true); return; }
        // last question: go to the first unanswered one, or show the result
        for (var j = 0; j < Q.length; j++) if (!optOf(Q[j], state.a[Q[j].id])) { state.i = j; save(state); renderQuiz(true); return; }
        state.done = true; save(state); renderResult(true);
      }
      if (focus) {
        try { qh.focus({ preventScroll: true }); } catch (e) { qh.focus(); }
        var r = box.getBoundingClientRect();
        if (r.top < 0 || r.top > (w.innerHeight || 800) * 0.6) scrollToBox();
      }
    }
    function scrollToBox() {
      var nav = doc.querySelector('.pw-nav'), off = (nav ? nav.getBoundingClientRect().height : 0) + 16;
      var y = box.getBoundingClientRect().top + (w.pageYOffset || 0) - off;
      try { w.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { w.scrollTo(0, Math.max(0, y)); }
    }

    /* ---- result ---- */
    var R = null;
    function renderResult(fresh) {
      clearTimeout(advanceTimer);
      if (fresh) printed = false;
      R = score(state.a);
      var bandT = S.bands[R.band];
      box.className = 'pw-hc pw-hc--result';
      box.innerHTML = '';
      // hero: gauge + band
      var hero = el('div', 'pw-hc__hero');
      hero.appendChild(el('div', 'pw-hc__glow'));
      var g = el('div', 'pw-hc__gauge');
      // semicircle r=100 from (20,120) to (220,120); length = pi*r
      var L = Math.PI * 100;
      g.innerHTML = '<svg viewBox="0 0 240 132" aria-hidden="true" focusable="false"><defs><linearGradient id="pw-hc-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b68ff8"/><stop offset="1" stop-color="#46d3f7"/></linearGradient></defs>' +
        '<path class="pw-hc__gauge-track" d="M20 120 A100 100 0 0 1 220 120"/><path class="pw-hc__gauge-fill" d="M20 120 A100 100 0 0 1 220 120" stroke-dasharray="' + L.toFixed(2) + '" stroke-dashoffset="' + L.toFixed(2) + '"/></svg>';
      var gn = el('div', 'pw-hc__gauge-num'), num = el('div', 'pw-hc__score', fresh && !reduce ? '0' : String(R.total));
      gn.appendChild(num); gn.appendChild(el('div', 'pw-hc__of', U.of));
      g.appendChild(gn);
      g.setAttribute('role', 'img'); g.setAttribute('aria-label', U.scoreLabel + ': ' + R.total + ' ' + U.of);
      hero.appendChild(g);
      var sum = el('div', 'pw-hc__sum');
      sum.appendChild(el('div', 'pw-hc__kicker', U.resKicker));
      var bh = el('h2', 'pw-hc__band', bandT[0]); bh.tabIndex = -1; bh.id = 'pw-hc-result';
      sum.appendChild(bh);
      sum.appendChild(el('span', 'pw-hc__chip pw-hc__chip--' + R.band, R.total + ' ' + U.of));
      sum.appendChild(el('p', 'pw-hc__bandtext', bandT[1]));
      hero.appendChild(sum);
      box.appendChild(hero);
      box.setAttribute('aria-labelledby', bh.id); box.removeAttribute('aria-label');

      // area cards
      var fills = [];
      R.areas.forEach(function (a) {
        var c = el('div', 'pw-hc__card');
        c.appendChild(el('div', 'pw-hc__label', areaName(a.id)));
        var m = el('div', 'pw-hc__metric'); m.appendChild(doc.createTextNode(String(a.score))); m.appendChild(el('small', null, U.of)); c.appendChild(m);
        var bar = el('div', 'pw-hc__bar'), f = el('div', 'pw-hc__bar-fill'); bar.appendChild(f); bar.setAttribute('aria-hidden', 'true'); c.appendChild(bar);
        fills.push([f, a.score]);
        c.appendChild(el('div', 'pw-hc__state', a.score >= 75 ? U.strong : a.score >= 50 ? U.ok : U.weak));
        box.appendChild(c);
      });

      // top 3 priorities
      var tb = el('div', 'pw-hc__block');
      tb.appendChild(el('h3', 'pw-hc__h', U.topTitle));
      if (R.top.length) {
        var ol = el('ol', 'pw-hc__tops');
        R.top.forEach(function (x) {
          var li = el('li', 'pw-hc__top-item');
          li.appendChild(el('div', 'pw-hc__top-q', areaName(x.area)));
          li.appendChild(el('p', 'pw-hc__rec', S.r[x.rec]));
          li.appendChild(resLink(x.res));
          ol.appendChild(li);
        });
        tb.appendChild(ol);
      } else tb.appendChild(el('p', 'pw-hc__rec', U.noTop));
      box.appendChild(tb);

      // CTA: opens the demo pop-up (page.js matches the /demo link and data-demo-open), source_cta "health-check"
      var cta = el('div', 'pw-hc__cta');
      cta.appendChild(el('div', 'pw-hc__glow'));
      var cc = el('div', 'pw-hc__cta-copy');
      cc.appendChild(el('h3', 'pw-hc__cta-h', U.ctaH)); cc.appendChild(el('p', 'pw-hc__cta-p', U.ctaP));
      cta.appendChild(cc);
      var book = el('a', 'pw-hc__btn pw-hc__btn--light', U.ctaBtn);
      book.href = U.demo; book.setAttribute('data-demo-open', ''); book.setAttribute('data-demo-source', 'health-check');
      cta.appendChild(book);
      box.appendChild(cta);

      // actions
      var act = el('div', 'pw-hc__actions');
      var pdf = el('button', 'pw-hc__btn pw-hc__btn--ghost', U.pdf); pdf.type = 'button'; pdf.setAttribute('data-hc-pdf', '');
      pdf.addEventListener('click', function () { printReport(); });
      var again = el('button', 'pw-hc__btn pw-hc__btn--ghost', U.retake); again.type = 'button'; again.setAttribute('data-hc-retake', '');
      again.addEventListener('click', function () {
        state = { a: {}, i: 0, done: false, sent: false }; save(state); printed = false; renderQuiz(true);
      });
      act.appendChild(pdf); act.appendChild(again);
      box.appendChild(act);

      // all answers and recommendations, by area
      var all = el('div', 'pw-hc__block pw-hc__block--white');
      all.appendChild(el('h3', 'pw-hc__h', U.allTitle));
      AREAS.forEach(function (a) {
        all.appendChild(el('div', 'pw-hc__label', areaName(a.id)));
        var ul2 = el('ul', 'pw-hc__group');
        Q.forEach(function (q) {
          if (q.area !== a.id) return;
          var o = optOf(q, state.a[q.id]), k = q.opts.indexOf(o), tq = S.q[q.id];
          var li = el('li', 'pw-hc__row');
          li.appendChild(el('div', 'pw-hc__row-q', tq[0]));
          li.appendChild(el('div', 'pw-hc__row-p' + (o[1] === MAXP ? ' pw-hc__row-p--full' : ''), tpl(U.points, { p: o[1] })));
          li.appendChild(el('div', 'pw-hc__row-a', U.yourAnswer + ': ' + tq[2][k]));
          if (o[1] < MAXP && o[2]) {
            var rr = el('div', 'pw-hc__row-r'); rr.appendChild(el('p', 'pw-hc__rec', S.r[o[2]])); rr.appendChild(resLink(res(o[3]))); li.appendChild(rr);
          }
          ul2.appendChild(li);
        });
        all.appendChild(ul2);
      });
      all.appendChild(el('p', 'pw-hc__fine', U.fine));
      all.appendChild(el('div', 'pw-hc__label', U.sources));
      var src = el('ul', 'pw-hc__src');
      SOURCES.forEach(function (s) { var li = el('li'), a = el('a', null, s[1][lang]); a.href = s[0]; a.target = '_blank'; a.rel = 'noopener'; li.appendChild(a); src.appendChild(li); });
      all.appendChild(src);
      box.appendChild(all);

      buildPrint();
      doc.documentElement.classList.add('pw-hc-report');

      // animate gauge, number and bars (none with reduced motion)
      var fill = g.querySelector('.pw-hc__gauge-fill'), target = L * (1 - R.total / 100);
      var finish = function () { fill.style.strokeDashoffset = target.toFixed(2); fills.forEach(function (x) { x[0].style.width = x[1] + '%'; }); };
      if (fresh && !reduce) {
        fill.getBoundingClientRect();
        (w.requestAnimationFrame || setTimeout)(function () {
          finish();
          var t0 = Date.now(), D = 1100;
          (function tick() { var p = Math.min(1, (Date.now() - t0) / D), e = 1 - Math.pow(1 - p, 3); num.textContent = String(Math.round(R.total * e)); if (p < 1) (w.requestAnimationFrame || setTimeout)(tick, 16); })();
        });
      } else { fill.style.transition = 'none'; fills.forEach(function (x) { x[0].style.transition = 'none'; }); finish(); }

      if (fresh) {
        try { bh.focus({ preventScroll: true }); } catch (e) { bh.focus(); }
        scrollToBox();
        setTimeout(function () {
          live.textContent = tpl(U.live, { score: R.total, band: bandT[0], areas: R.areas.map(function (a) { return areaName(a.id) + ' ' + a.score; }).join(', ') });
        }, 400);
        if (!state.sent) { state.sent = true; save(state); track('Health check completed', { band: R.band, score_bucket: R.bucket }); }
      }
    }

    /* ---- print report (A4) ---- */
    var printEl = null, printed = false;
    function abs(path) { return 'prowi.io' + path; }
    function buildPrint() {
      if (printEl && printEl.parentNode) printEl.parentNode.removeChild(printEl);
      var r = R, bandT = S.bands[r.band], p = el('div', 'pw-hc-print');
      p.setAttribute('aria-hidden', 'true');
      var head = el('div', 'pw-hc-print__head'), hl = el('div');
      hl.appendChild(el('div', 'pw-hc-print__logo', 'Prowi')); hl.appendChild(el('div', 'pw-hc-print__title', U.printTitle + ' · ' + U.printFor));
      var dt = ''; try { dt = new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'da-DK', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { dt = new Date().toISOString().slice(0, 10); }
      head.appendChild(hl); head.appendChild(el('div', 'pw-hc-print__date', U.printDate + ': ' + dt));
      p.appendChild(head);
      var sc = el('div', 'pw-hc-print__score');
      sc.appendChild(el('div', 'pw-hc-print__big', r.total + '/100'));
      var sb = el('div'); sb.appendChild(el('div', 'pw-hc-print__band', bandT[0])); sb.appendChild(el('div', null, bandT[1])); sc.appendChild(sb);
      p.appendChild(sc);
      p.appendChild(el('h2', null, U.areaTitle));
      var tbl = el('table'), tb = el('tbody');
      r.areas.forEach(function (a) {
        var tr = el('tr'); tr.appendChild(el('td', null, areaName(a.id))); tr.appendChild(el('td', null, a.score + ' ' + U.of));
        var td = el('td'), bar = el('span', 'pw-hc-print__bar'), i = el('i'); i.style.width = a.score + '%'; bar.appendChild(i); td.appendChild(bar); tr.appendChild(td);
        tb.appendChild(tr);
      });
      tbl.appendChild(tb); p.appendChild(tbl);
      p.appendChild(el('h2', null, U.topTitle));
      if (r.top.length) {
        var ol = el('ol');
        r.top.forEach(function (x) { var li = el('li'); li.appendChild(doc.createTextNode(S.r[x.rec] + ' ')); li.appendChild(el('span', 'pw-hc-print__u', abs(RES[x.res][lang][0]))); ol.appendChild(li); });
        p.appendChild(ol);
      } else p.appendChild(el('p', null, U.noTop));
      p.appendChild(el('h2', null, U.allTitle));
      AREAS.forEach(function (a) {
        // the area heading travels with its first answer (no heading alone at the foot of a page)
        var hd = el('div', 'pw-hc-print__keep'); hd.appendChild(el('h3', null, areaName(a.id))); p.appendChild(hd);
        Q.forEach(function (q) {
          if (q.area !== a.id) return;
          var o = optOf(q, state.a[q.id]), k = q.opts.indexOf(o), tq = S.q[q.id], it = el('div', 'pw-hc-print__item');
          it.appendChild(el('div', 'pw-hc-print__q', tq[0]));
          it.appendChild(el('div', 'pw-hc-print__a', U.yourAnswer + ': ' + tq[2][k] + ' (' + tpl(U.points, { p: o[1] }) + ')'));
          if (o[1] < MAXP && o[2]) { var rr = el('div', 'pw-hc-print__r'); rr.appendChild(doc.createTextNode(S.r[o[2]] + ' ')); rr.appendChild(el('span', 'pw-hc-print__u', abs(RES[res(o[3])][lang][0]))); it.appendChild(rr); }
          if (hd && !hd.__first) { hd.__first = 1; hd.appendChild(it); } else p.appendChild(it);
        });
      });
      var ft = el('div', 'pw-hc-print__foot');
      ft.appendChild(el('p', null, U.printBook));
      ft.appendChild(el('p', null, U.printFoot));
      ft.appendChild(el('p', null, U.sources + ': ' + SOURCES.map(function (s) { return s[1][lang] + ' (' + s[0].replace(/^https:\/\/(www\.)?/, '') + ')'; }).join('; ')));
      p.appendChild(ft);
      doc.body.appendChild(p);
      printEl = p;
    }
    function printReport() {
      if (!R) return;
      buildPrint(); doc.documentElement.classList.add('pw-hc-report');
      if (!printed) { printed = true; track('Health check PDF'); }
      try { w.print(); } catch (e) { /* print blocked */ }
    }
    // "Health check PDF": once per result, whether printed with the button or the browser's own print command
    w.addEventListener('beforeprint', function () {
      if (!state.done || !R || printed) return;
      printed = true; track('Health check PDF');
    });

    if (state.done) renderResult(false); else renderQuiz(false);
    return { state: function () { return state; } };
  }

  var go = function () { mount(document); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
