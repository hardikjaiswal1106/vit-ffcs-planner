// ═══════════════════════════════════════════════════════════════
// GRID STRUCTURE — 12 columns (P1-P12) per day (same VIT grid as 3rd sem)
// ═══════════════════════════════════════════════════════════════
const DAY_THEORY = {
  Mon: ["A1","F1","D1","TB1","TG1",null,  "A2","F2","D2","TB2","TG2",null],
  Tue: ["B1","G1","E1","TC1","TAA1",null, "B2","G2","E2","TC2","TAA2",null],
  Wed: ["C1","A1","F1","V1","V2",null,    "C2","A2","F2","TD2","TBB2",null],
  Thu: ["D1","B1","G1","TE1","TCC1",null, "D2","B2","G2","TE2","TCC2",null],
  Fri: ["E1","C1","TA1","TF1","TD1",null, "E2","C2","TA2","TF2","TDD2",null],
};

const DAY_LAB = {
  Mon: ["L1","L2","L3","L4","L5","L6",  "L31","L32","L33","L34","L35","L36"],
  Tue: ["L7","L8","L9","L10","L11","L12", "L37","L38","L39","L40","L41","L42"],
  Wed: ["L13","L14","L15","L16","L17","L18","L43","L44","L45","L46","L47","L48"],
  Thu: ["L19","L20","L21","L22","L23","L24","L49","L50","L51","L52","L53","L54"],
  Fri: ["L25","L26","L27","L28","L29","L30","L55","L56","L57","L58","L59","L60"],
};

const DAYS = ["Mon","Tue","Wed","Thu","Fri"];

const THEORY_TO_CELLS = {};
DAYS.forEach(day => {
  DAY_THEORY[day].forEach((slot, col) => {
    if (!slot) return;
    if (!THEORY_TO_CELLS[slot]) THEORY_TO_CELLS[slot] = [];
    THEORY_TO_CELLS[slot].push({ day, col });
  });
});

const LAB_TO_CELL = {};
DAYS.forEach(day => {
  DAY_LAB[day].forEach((lab, col) => {
    if (!lab) return;
    LAB_TO_CELL[lab] = { day, col };
  });
});

function slotCells(slotStr) {
  const parts = slotStr.split("+").map(s => s.trim());
  const cells = [];
  const seen = new Set();
  const isLab = parts[0].startsWith("L");

  if (isLab) {
    parts.forEach(p => {
      const loc = LAB_TO_CELL[p];
      if (loc) {
        const key = `${loc.day}-${loc.col}-L`;
        if (!seen.has(key)) { seen.add(key); cells.push({ ...loc, isLab: true, name: p }); }
      }
    });
  } else {
    parts.forEach(p => {
      const locs = THEORY_TO_CELLS[p] || [];
      locs.forEach(loc => {
        const key = `${loc.day}-${loc.col}-T`;
        if (!seen.has(key)) { seen.add(key); cells.push({ ...loc, isLab: false }); }
      });
    });
  }
  return cells;
}

function slotKeys(slotStr) {
  return slotCells(slotStr).map(c => `${c.day}-${c.col}-${c.isLab?'L':'T'}`);
}

function isEveningTheory(slotStr) {
  return /2(\+|$)/.test(slotStr.split("+")[0]);
}

// ═══════════════════════════════════════════════════════════════
// COURSE DATA — 4th SEM
// ═══════════════════════════════════════════════════════════════
const COURSES = {
  MOC:{code:"BACSE201",name:"Models of Computation",short:"MoC",color:"#2F4858",credits:4,
    theory:[
      {f:"ANITHA E",slot:"C1+TC1+TCC1",venue:"PRP323"},
      {f:"ANITHA E",slot:"C2+TC2+TCC2",venue:"PRP323"},
      {f:"SATHIYA KUMAR C",slot:"C1+TC1+TCC1",venue:"PRP334"},
      {f:"JAYALAKSHMI M",slot:"C1+TC1+TCC1",venue:"PRP224"},
      {f:"ARUMUGA ARUN R",slot:"C1+TC1+TCC1",venue:"PRP322"},
      {f:"ARUMUGA ARUN R",slot:"C2+TC2+TCC2",venue:"PRP322"},
      {f:"DEBI PRASANNA ACHARJYA",slot:"C2+TC2+TCC2",venue:"PRP313"},
      {f:"BOOMINATHAN P",slot:"C1+TC1+TCC1",venue:"PRP304"},
      {f:"NAGARAJA RAO A",slot:"C2+TC2+TCC2",venue:"PRP304"},
      {f:"RAJKUMAR S",slot:"C1+TC1+TCC1",venue:"PRP306"},
      {f:"ANAND BIHARI",slot:"C1+TC1+TCC1",venue:"PRP308"},
      {f:"ANAND BIHARI",slot:"C2+TC2+TCC2",venue:"PRP308"},
      {f:"KALAIVANI K",slot:"C1+TC1+TCC1",venue:"PRP309"},
      {f:"KALAIVANI K",slot:"C2+TC2+TCC2",venue:"PRP309"},
      {f:"PARTHASARATHY G",slot:"C1+TC1+TCC1",venue:"PRP313"},
      {f:"PARTHASARATHY G",slot:"C2+TC2+TCC2",venue:"PRP339"},
      {f:"SATHYA K",slot:"C1+TC1+TCC1",venue:"PRP318"},
      {f:"SATHYA K",slot:"C2+TC2+TCC2",venue:"PRP318"},
      {f:"BASKARAN P",slot:"C1+TC1+TCC1",venue:"PRP319"},
      {f:"BASKARAN P",slot:"C2+TC2+TCC2",venue:"PRP319"},
      {f:"UMA PRIYA D",slot:"C1+TC1+TCC1",venue:"PRP320"},
      {f:"UMA PRIYA D",slot:"C2+TC2+TCC2",venue:"PRP320"},
      {f:"GUNAVATHI C",slot:"C2+TC2+TCC2",venue:"PRP306"},
      {f:"RAJARAJAN G",slot:"C2+TC2+TCC2",venue:"PRP334"},
      {f:"PRAKASH M",slot:"C1+TC1+TCC1",venue:"PRP332"},
      {f:"KRISHNA RANI SAMAL K",slot:"C2+TC2+TCC2",venue:"PRP332"},
      {f:"ISLABUDEEN M",slot:"C2+TC2+TCC2",venue:"PRP333"},
      {f:"HASHIDA HAIDROS RAHIMA MANZIL",slot:"C1+TC1+TCC1",venue:"PRP339"},
      {f:"MANIVANNAN P",slot:"C1+TC1+TCC1",venue:"PRP411"},
      {f:"SOMASUNDARAM S K",slot:"C1+TC1+TCC1",venue:"PRP333"},
      {f:"NIVITHA K",slot:"C2+TC2+TCC2",venue:"PRP414"},
      {f:"NIVITHA K",slot:"C1+TC1+TCC1",venue:"PRP424"},
      {f:"KAPIL KUMAR SHARMA",slot:"C2+TC2+TCC2",venue:"PRP411"},
      {f:"SHALINI L",slot:"C2+TC2+TCC2",venue:"PRP224"},
    ],
    lab:[]
  },
  SE:{code:"BACSE204",name:"Software Engineering",short:"SE",color:"#7B3340",credits:4,
    theory:[
      {f:"JUSTIN GOPINATH A",slot:"E2+TE2",venue:"PRP308"},
      {f:"JUSTIN GOPINATH A",slot:"E1+TE1",venue:"PRP308"},
      {f:"DEVIPRIYA A",slot:"E2+TE2",venue:"PRP319"},
      {f:"DEVIPRIYA A",slot:"E1+TE1",venue:"PRP319"},
      {f:"SWATHI J.N",slot:"E1+TE1",venue:"PRP224"},
      {f:"SWATHI J.N",slot:"E2+TE2",venue:"PRP224"},
      {f:"ARCHANA T",slot:"E1+TE1",venue:"PRP304"},
      {f:"ARCHANA T",slot:"E2+TE2",venue:"PRP304"},
      {f:"JYOTISMITA CHAKI",slot:"E1+TE1",venue:"PRP306"},
      {f:"JYOTISMITA CHAKI",slot:"E2+TE2",venue:"PRP306"},
      {f:"MADHAN E S",slot:"E2+TE2",venue:"PRP309"},
      {f:"MADHAN E S",slot:"E1+TE1",venue:"PRP309"},
      {f:"SIVAKUMAR V",slot:"E2+TE2",venue:"PRP313"},
      {f:"SIVAKUMAR V",slot:"E1+TE1",venue:"PRP313"},
      {f:"PRIYANKA N",slot:"E1+TE1",venue:"PRP318"},
      {f:"PRIYANKA N",slot:"E2+TE2",venue:"PRP318"},
      {f:"THANUJA R",slot:"E1+TE1",venue:"PRP320"},
      {f:"THANUJA R",slot:"E2+TE2",venue:"PRP320"},
      {f:"SIVAPRAKASH S",slot:"E1+TE1",venue:"PRP322"},
      {f:"SIVAPRAKASH S",slot:"E2+TE2",venue:"PRP322"},
      {f:"ARUNKUMAR S",slot:"E1+TE1",venue:"PRP323"},
      {f:"ARUNKUMAR S",slot:"E2+TE2",venue:"PRP323"},
      {f:"DEEPAK RAJ D M",slot:"E1+TE1",venue:"PRP411"},
      {f:"DEEPAK RAJ D M",slot:"E2+TE2",venue:"PRP411"},
      {f:"MADIAJAGAN M",slot:"E2+TE2",venue:"PRP414"},
      {f:"LOKESH KUMAR R",slot:"E1+TE1",venue:"PRP332"},
      {f:"PEREPI RAJARAJESWARI",slot:"E2+TE2",venue:"PRP332"},
      {f:"JAFAR ALI IBRAHIM S",slot:"E2+TE2",venue:"PRP333"},
      {f:"BASKARAN P",slot:"E1+TE1",venue:"PRP334"},
      {f:"MARGRET ANOUNCIA S",slot:"E1+TE1",venue:"PRP333"},
      {f:"SHASHANK MOULI SATAPATHY",slot:"E1+TE1",venue:"PRP330"},
      {f:"SAMRIDDHI SARKAR",slot:"E1+TE1",venue:"PRP339"},
      {f:"SAMRIDDHI SARKAR",slot:"E2+TE2",venue:"PRP339"},
      {f:"KUMARESAN A",slot:"E2+TE2",venue:"PRP334"},
      {f:"PRABHU J",slot:"G1+TG1",venue:"SJT215"},
      {f:"PRABHU J",slot:"G2+TG2",venue:"SJT224"},
      {f:"SUJATHA R",slot:"G1+TG1",venue:"SJT710"},
      {f:"SUJATHA R",slot:"G2+TG2",venue:"SJT712"},
      {f:"BHAVANI S",slot:"G1+TG1",venue:"SJT709"},
    ],
    lab:[
      {f:"SHASHANK MOULI SATAPATHY",slot:"L55+L56",venue:"PRP353"},
      {f:"SWATHI J.N",slot:"L15+L16",venue:"PRP353"},
      {f:"SWATHI J.N",slot:"L33+L34",venue:"PRP353"},
      {f:"ARCHANA T",slot:"L1+L2",venue:"PRP353"},
      {f:"ARCHANA T",slot:"L45+L46",venue:"PRP353"},
      {f:"JYOTISMITA CHAKI",slot:"L5+L6",venue:"PRP353"},
      {f:"JYOTISMITA CHAKI",slot:"L57+L58",venue:"PRP347"},
      {f:"MADIAJAGAN M",slot:"L9+L10",venue:"PRP353"},
      {f:"LOKESH KUMAR R",slot:"L53+L54",venue:"PRP353"},
      {f:"JUSTIN GOPINATH A",slot:"L11+L12",venue:"PRP353"},
      {f:"JUSTIN GOPINATH A",slot:"L45+L46",venue:"PRP347"},
      {f:"MARGRET ANOUNCIA S",slot:"L43+L44",venue:"PRP353"},
      {f:"MADHAN E S",slot:"L27+L28",venue:"PRP353"},
      {f:"MADHAN E S",slot:"L31+L32",venue:"PRP353"},
      {f:"PEREPI RAJARAJESWARI",slot:"L21+L22",venue:"PRP347"},
      {f:"JAFAR ALI IBRAHIM S",slot:"L7+L8",venue:"PRP353"},
      {f:"KUMARESAN A",slot:"L23+L24",venue:"PRP347"},
      {f:"SIVAKUMAR V",slot:"L3+L4",venue:"PRP347"},
      {f:"SIVAKUMAR V",slot:"L31+L32",venue:"PRP347"},
      {f:"BASKARAN P",slot:"L33+L34",venue:"PRP347"},
      {f:"PRIYANKA N",slot:"L13+L14",venue:"PRP347"},
      {f:"PRIYANKA N",slot:"L41+L42",venue:"PRP353"},
      {f:"SAMRIDDHI SARKAR",slot:"L5+L6",venue:"PRP347"},
      {f:"SAMRIDDHI SARKAR",slot:"L35+L36",venue:"PRP347"},
      {f:"ARUNKUMAR S",slot:"L15+L16",venue:"PRP347"},
      {f:"ARUNKUMAR S",slot:"L49+L50",venue:"PRP347"},
      {f:"DEEPAK RAJ D M",slot:"L11+L12",venue:"PRP347"},
      {f:"DEEPAK RAJ D M",slot:"L47+L48",venue:"PRP347"},
      {f:"DEVIPRIYA A",slot:"L49+L50",venue:"PRP353"},
      {f:"DEVIPRIYA A",slot:"L13+L14",venue:"PRP655"},
      {f:"SIVAPRAKASH S",slot:"L43+L44",venue:"PRP655"},
      {f:"SIVAPRAKASH S",slot:"L19+L20",venue:"PRP655"},
      {f:"THANUJA R",slot:"L29+L30",venue:"PRP347"},
      {f:"THANUJA R",slot:"L47+L48",venue:"PRP137"},
      {f:"PRABHU J",slot:"L49+L50",venue:"SJT219"},
      {f:"PRABHU J",slot:"L3+L4",venue:"SJT219"},
      {f:"SUJATHA R",slot:"L33+L34",venue:"SJT219"},
      {f:"SUJATHA R",slot:"L29+L30",venue:"SJT219"},
      {f:"BHAVANI S",slot:"L39+L40",venue:"SJT121"},
    ]
  },
  AIML:{code:"BACSE205",name:"Fundamentals of AIML",short:"AI/ML",color:"#4E6239",credits:4,
    theory:[
      {f:"MONASH P",slot:"G2+TG2",venue:"PRP308"},
      {f:"MONASH P",slot:"G1+TG1",venue:"PRP308"},
      {f:"CHELLATAMILAN T",slot:"G2+TG2",venue:"PRP313"},
      {f:"CHELLATAMILAN T",slot:"G1+TG1",venue:"PRP313"},
      {f:"KAUSER AHMED P",slot:"G2+TG2",venue:"PRP224"},
      {f:"KAUSER AHMED P",slot:"G1+TG1",venue:"PRP224"},
      {f:"DEGA NAGARAJU",slot:"G2+TG2",venue:"PRP304"},
      {f:"DEGA NAGARAJU",slot:"G1+TG1",venue:"PRP304"},
      {f:"EBENEZER JULIET S",slot:"G2+TG2",venue:"PRP318"},
      {f:"EBENEZER JULIET S",slot:"G1+TG1",venue:"PRP318"},
      {f:"ARUNKUMAR T",slot:"G2+TG2",venue:"PRP320"},
      {f:"BALAMURUGAN R",slot:"G1+TG1",venue:"PRP309"},
      {f:"BALAMURUGAN R",slot:"G2+TG2",venue:"PRP309"},
      {f:"SUGUMAR R",slot:"G1+TG1",venue:"PRP319"},
      {f:"SUGUMAR R",slot:"G2+TG2",venue:"PRP319"},
      {f:"NATARAJAN P",slot:"G1+TG1",venue:"PRP320"},
      {f:"RAJAY VEDARAJ I S",slot:"G1+TG1",venue:"PRP322"},
      {f:"VARALAKSHMI M",slot:"G2+TG2",venue:"PRP322"},
      {f:"ANANDA KUMAR S",slot:"G1+TG1",venue:"PRP323"},
      {f:"SANJIBAN SEKHAR ROY",slot:"G2+TG2",venue:"PRP323"},
      {f:"ANNAPURNA JONNALAGADDA",slot:"G1+TG1",venue:"PRP411"},
      {f:"CHIRANJEEVI C",slot:"G2+TG2",venue:"PRP411"},
      {f:"AKILA VICTOR",slot:"G1+TG1",venue:"PRP414"},
      {f:"RAJAKUMAR K",slot:"G1+TG1",venue:"PRP333"},
      {f:"SUDHAKARA PANDIAN R",slot:"G2+TG2",venue:"PRP332"},
      {f:"RADHAKRISHNAN DELHIBABU",slot:"G2+TG2",venue:"PRP414"},
      {f:"GUNAVATHI C",slot:"G1+TG1",venue:"PRP332"},
      {f:"NAGESHWAR RAO RAGI",slot:"G1+TG1",venue:"PRP306"},
      {f:"NAGESHWAR RAO RAGI",slot:"G2+TG2",venue:"PRP306"},
      {f:"MEHFOOZA",slot:"G2+TG2",venue:"PRP330"},
    ],
    lab:[
      {f:"SUDHAKARA PANDIAN R",slot:"L5+L6",venue:"SJT517"},
      {f:"NATARAJAN P",slot:"L43+L44",venue:"SJT517"},
      {f:"CHELLATAMILAN T",slot:"L13+L14",venue:"SJT515"},
      {f:"CHELLATAMILAN T",slot:"L55+L56",venue:"SJT515"},
      {f:"EBENEZER JULIET S",slot:"L25+L26",venue:"SJT515"},
      {f:"EBENEZER JULIET S",slot:"L43+L44",venue:"SJT515"},
      {f:"RAJAY VEDARAJ I S",slot:"L39+L40",venue:"SJT517"},
      {f:"KAUSER AHMED P",slot:"L1+L2",venue:"SJT517"},
      {f:"KAUSER AHMED P",slot:"L55+L56",venue:"SJT517"},
      {f:"ANANDA KUMAR S",slot:"L31+L32",venue:"SJT517"},
      {f:"ANNAPURNA JONNALAGADDA",slot:"L49+L50",venue:"SJT517"},
      {f:"AKILA VICTOR",slot:"L33+L34",venue:"SJT517"},
      {f:"DEGA NAGARAJU",slot:"L15+L16",venue:"SJT517"},
      {f:"DEGA NAGARAJU",slot:"L41+L42",venue:"SJT517"},
      {f:"NAGESHWAR RAO RAGI",slot:"L13+L14",venue:"SJT517"},
      {f:"NAGESHWAR RAO RAGI",slot:"L57+L58",venue:"SJT517"},
      {f:"GUNAVATHI C",slot:"L51+L52",venue:"SJT517"},
      {f:"MONASH P",slot:"L25+L26",venue:"SJT517"},
      {f:"MONASH P",slot:"L45+L46",venue:"SJT517"},
      {f:"RAJAKUMAR K",slot:"L37+L38",venue:"SJT517"},
      {f:"BALAMURUGAN R",slot:"L29+L30",venue:"SJT517"},
      {f:"BALAMURUGAN R",slot:"L53+L54",venue:"SJT517"},
      {f:"SUGUMAR R",slot:"L3+L4",venue:"SJT517"},
      {f:"SUGUMAR R",slot:"L47+L48",venue:"SJT517"},
      {f:"ARUNKUMAR T",slot:"L27+L28",venue:"SJT517"},
      {f:"VARALAKSHMI M",slot:"L7+L8",venue:"SJT517"},
      {f:"CHIRANJEEVI C",slot:"L21+L22",venue:"SJT515"},
      {f:"RADHAKRISHNAN DELHIBABU",slot:"L23+L24",venue:"SJT517"},
      {f:"MEHFOOZA",slot:"L11+L12",venue:"SJT517"},
      {f:"SANJIBAN SEKHAR ROY",slot:"L19+L20",venue:"SJT517"},
    ]
  },
  FS:{code:"BACSE325",name:"Full Stack",short:"Full Stack",color:"#94702B",credits:4,
    theory:[
      {f:"BALASUBRAMANIAN C",slot:"A2",venue:"PRP322"},
      {f:"BALASUBRAMANIAN C",slot:"A1",venue:"PRP322"},
      {f:"SAM NAVIN M",slot:"A1",venue:"PRP323"},
      {f:"SAM NAVIN M",slot:"A2",venue:"PRP323"},
      {f:"MEENAKSHI S P",slot:"A1",venue:"PRP224"},
      {f:"MEENAKSHI S P",slot:"A2",venue:"PRP224"},
      {f:"NALINI N",slot:"A1",venue:"PRP304"},
      {f:"NALINI N",slot:"A2",venue:"PRP304"},
      {f:"ARUN KUMAR G",slot:"A1",venue:"PRP411"},
      {f:"SANMUGA PRIYA M",slot:"A1",venue:"PRP306"},
      {f:"NIHAAL AHMED K",slot:"A2",venue:"PRP306"},
      {f:"LYDIA JANE G",slot:"A1",venue:"PRP308"},
      {f:"LYDIA JANE G",slot:"A2",venue:"PRP308"},
      {f:"TAMIZHARASI T",slot:"A1",venue:"PRP309"},
      {f:"TAMIZHARASI T",slot:"A2",venue:"PRP309"},
      {f:"PADMA PRIYA R",slot:"A1",venue:"PRP313"},
      {f:"PADMA PRIYA R",slot:"A2",venue:"PRP313"},
      {f:"ARULKUMAR V",slot:"A1",venue:"PRP318"},
      {f:"ARULKUMAR V",slot:"A2",venue:"PRP318"},
      {f:"SARANYA P",slot:"A1",venue:"PRP319"},
      {f:"SARANYA P",slot:"A2",venue:"PRP319"},
      {f:"SINTHUJA M",slot:"A1",venue:"PRP320"},
      {f:"SINTHUJA M",slot:"A2",venue:"PRP320"},
    ],
    lab:[
      {f:"MEENAKSHI S P",slot:"L45+L46+L57+L58",venue:"PRP137"},
      {f:"MEENAKSHI S P",slot:"L3+L4+L19+L20",venue:"PRP137"},
      {f:"NALINI N",slot:"L39+L40+L51+L52",venue:"PRP137"},
      {f:"NALINI N",slot:"L9+L10+L25+L26",venue:"PRP137"},
      {f:"SANMUGA PRIYA M",slot:"L43+L44+L55+L56",venue:"PRP137"},
      {f:"NIHAAL AHMED K",slot:"L1+L2+L13+L14",venue:"PRP137"},
      {f:"LYDIA JANE G",slot:"L45+L46+L49+L50",venue:"PRP356"},
      {f:"LYDIA JANE G",slot:"L21+L22+L27+L28",venue:"PRP137"},
      {f:"PADMA PRIYA R",slot:"L39+L40+L57+L58",venue:"PRP356"},
      {f:"PADMA PRIYA R",slot:"L5+L6+L7+L8",venue:"PRP356"},
      {f:"TAMIZHARASI T",slot:"L11+L12+L15+L16",venue:"PRP137"},
      {f:"TAMIZHARASI T",slot:"L37+L38+L49+L50",venue:"PRP137"},
      {f:"SAM NAVIN M",slot:"L49+L50+L57+L58",venue:"PRP655"},
      {f:"SAM NAVIN M",slot:"L5+L6+L15+L16",venue:"PRP655"},
      {f:"ARUN KUMAR G",slot:"L31+L32+L47+L48",venue:"PRP356"},
      {f:"ARULKUMAR V",slot:"L33+L34+L41+L42",venue:"PRP356"},
      {f:"ARULKUMAR V",slot:"L3+L4+L15+L16",venue:"PRP356"},
      {f:"SARANYA P",slot:"L41+L42+L57+L58",venue:"PRP354"},
      {f:"SARANYA P",slot:"L9+L10+L29+L30",venue:"PRP355"},
      {f:"SINTHUJA M",slot:"L37+L38+L51+L52",venue:"PRP355"},
      {f:"SINTHUJA M",slot:"L21+L22+L29+L30",venue:"PRP356"},
      {f:"BALASUBRAMANIAN C",slot:"L51+L52+L55+L56",venue:"PRP356"},
      {f:"BALASUBRAMANIAN C",slot:"L11+L12+L19+L20",venue:"PRP356"},
    ]
  },
  ETHICS:{code:"BAHUM103",name:"Ethics and Values",short:"Ethics",color:"#574063",credits:2,
    theory:[
      {f:"SIVAKUMAR S",slot:"F1",venue:"TT621"},
      {f:"MULUGU S NEELOTPAL",slot:"F1",venue:"TT305"},
      {f:"MULUGU S NEELOTPAL",slot:"F2",venue:"TT621"},
      {f:"KUBENDRAN A",slot:"F1",venue:"TT333"},
      {f:"KUBENDRAN A",slot:"F2",venue:"SJT101"},
      {f:"BHUVANESWARI M",slot:"F2",venue:"SJT102"},
      {f:"RAJAMEENAKSHI J",slot:"F1",venue:"SMVG21"},
      {f:"RASI R A",slot:"F2",venue:"SMV214"},
      {f:"BALAMURUGAN J",slot:"F1",venue:"SJT409"},
      {f:"BALAMURUGAN J",slot:"F2",venue:"SJT408"},
      {f:"SUDHEER C V",slot:"F1",venue:"PRPG26"},
      {f:"SUDHEER C V",slot:"F2",venue:"PRPG26"},
      {f:"BANGALORE MORARJI",slot:"F1",venue:"SMV320"},
      {f:"BANGALORE MORARJI",slot:"F2",venue:"SMV220"},
      {f:"NILAVATHY K",slot:"F1",venue:"TT201"},
      {f:"RAHUL SHUKLA",slot:"F1",venue:"PRP230"},
      {f:"POONAM SHARMA",slot:"F1",venue:"PRP304"},
      {f:"POONAM SHARMA",slot:"F2",venue:"PRP304"},
      {f:"RAMNATH REGHUNADHAN",slot:"F1",venue:"PRP306"},
      {f:"MOHD OWAIS KHAN",slot:"F1",venue:"PRP318"},
      {f:"RAHUL SHUKLA",slot:"F2",venue:"PRP318"},
      {f:"SHAHID HAMID RAINA",slot:"F2",venue:"PRP319"},
      {f:"BHUVANESWARI M",slot:"F1",venue:"PRP323"},
      {f:"NILAVATHY K",slot:"F2",venue:"PRP306"},
      {f:"SAVITHA N",slot:"F1",venue:"PRP313"},
      {f:"SAVITHA N",slot:"F2",venue:"PRP313"},
      {f:"TONY P JOSE",slot:"F1",venue:"PRP332"},
      {f:"TONY P JOSE",slot:"F2",venue:"PRP322"},
      {f:"SUMEETHA M",slot:"F2",venue:"PRP333"},
      {f:"ABHIJIT DASGUPTA",slot:"F1",venue:"PRP322"},
      {f:"ABHIJIT DASGUPTA",slot:"F2",venue:"PRP323"},
      {f:"SALMAN HAIDER",slot:"F1",venue:"PRP414"},
      {f:"AQUIB PARVEZ",slot:"F1",venue:"PRP319"},
      {f:"AQUIB PARVEZ",slot:"F2",venue:"PRP320"},
      {f:"ADIL AHMAD SHAH",slot:"F1",venue:"PRP333"},
      {f:"NAVIN KUMAR",slot:"F1",venue:"TT334"},
      {f:"NAVIN KUMAR",slot:"G1",venue:"TT416"},
      {f:"RIZWAN AHMAD",slot:"F1",venue:"PRP330"},
      {f:"SALMAN HAIDER",slot:"F2",venue:"PRP204"},
      {f:"SHAHID HAMID RAINA",slot:"F1",venue:"PRP334"},
      {f:"SUMEETHA M",slot:"F1",venue:"PRP339"},
      {f:"MOHD OWAIS KHAN",slot:"F2",venue:"PRP330"},
      {f:"ADIL AHMAD SHAH",slot:"G2",venue:"TT334"},
      {f:"TANU KUKREJA",slot:"F2",venue:"PRP334"},
      {f:"SREYA SEN",slot:"G2",venue:"TT333"},
      {f:"RAMNATH REGHUNADHAN",slot:"G1",venue:"TT204"},
      {f:"TANU KUKREJA",slot:"G1",venue:"SMV116"},
      {f:"RIZWAN AHMAD",slot:"F2",venue:"PRP214"},
    ],
    lab:[]
  },
  QQ:{code:"BASTS102",name:"Skills Practice II",short:"Skills",color:"#2B5F58",credits:1,
    isSelector:true,selectorKey:"QQ",
    selectorOptions:["TIME","ETHNUS","FACE","SIXPHRASE"],
    theory:[
      {f:"FACE",slot:"D2+TD2",venue:"PRP320"},{f:"ETHNUS",slot:"E1+TE1",venue:"MB213"},
      {f:"ETHNUS",slot:"D2+TD2",venue:"PRP304"},{f:"FACE",slot:"D2+TD2",venue:"PRP319"},
      {f:"FACE",slot:"D1+TD1",venue:"PRP320"},{f:"ETHNUS",slot:"E1+TE1",venue:"MB211"},
      {f:"ETHNUS",slot:"E2+TE2",venue:"MB211"},{f:"ETHNUS",slot:"E1+TE1",venue:"PRPG32"},
      {f:"ETHNUS",slot:"D2+TD2",venue:"PRP224"},{f:"ETHNUS",slot:"D1+TD1",venue:"PRP304"},
      {f:"ETHNUS",slot:"D2+TD2",venue:"PRP306"},{f:"ETHNUS",slot:"D2+TD2",venue:"PRP309"},
      {f:"ETHNUS",slot:"D1+TD1",venue:"PRP308"},{f:"ETHNUS",slot:"D2+TD2",venue:"PRP308"},
      {f:"ETHNUS",slot:"D1+TD1",venue:"PRP309"},{f:"FACE",slot:"D1+TD1",venue:"PRP318"},
      {f:"FACE",slot:"D1+TD1",venue:"PRP319"},{f:"SIXPHRASE",slot:"D1+TD1",venue:"PRP322"},
      {f:"FACE",slot:"D2+TD2",venue:"PRP322"},{f:"SIXPHRASE",slot:"D2+TD2",venue:"PRP411"},
      {f:"SIXPHRASE",slot:"D1+TD1",venue:"PRP414"},{f:"SIXPHRASE",slot:"D2+TD2",venue:"PRP414"},
      {f:"TIME",slot:"D1+TD1",venue:"PRP332"},{f:"ETHNUS",slot:"D2+TD2",venue:"PRP332"},
      {f:"TIME",slot:"D1+TD1",venue:"PRP333"},{f:"TIME",slot:"D1+TD1",venue:"PRP334"},
      {f:"TIME",slot:"D2+TD2",venue:"PRP334"},{f:"TIME",slot:"D1+TD1",venue:"PRP339"},
      {f:"TIME",slot:"D2+TD2",venue:"PRP339"},{f:"TIME",slot:"E1+TE1",venue:"SMV116"},
      {f:"TIME",slot:"E2+TE2",venue:"SMV116"},{f:"SIXPHRASE",slot:"E1+TE1",venue:"SMV101"},
      {f:"SIXPHRASE",slot:"E2+TE2",venue:"SMV101"},{f:"ETHNUS",slot:"E1+TE1",venue:"MB212"},
      {f:"SIXPHRASE",slot:"E1+TE1",venue:"CDMM103"},{f:"SIXPHRASE",slot:"E2+TE2",venue:"CDMM103"},
      {f:"ETHNUS",slot:"E2+TE2",venue:"MB212"},{f:"ETHNUS",slot:"E1+TE1",venue:"TT201"},
      {f:"ETHNUS",slot:"E2+TE2",venue:"TT201"},{f:"FACE",slot:"E2+TE2",venue:"MB213"},
      {f:"FACE",slot:"E1+TE1",venue:"TT204"},{f:"FACE",slot:"E2+TE2",venue:"TT204"},
      {f:"FACE",slot:"E1+TE1",venue:"MB214"},{f:"FACE",slot:"E2+TE2",venue:"MB214"},
      {f:"FACE",slot:"E1+TE1",venue:"SJT224"},{f:"FACE",slot:"E2+TE2",venue:"SJT224"},
      {f:"SIXPHRASE",slot:"E1+TE1",venue:"SJT215"},{f:"SIXPHRASE",slot:"E2+TE2",venue:"SJT221"},
      {f:"TIME",slot:"E2+TE2",venue:"SJT222"},{f:"TIME",slot:"E1+TE1",venue:"SJT223"},
      {f:"TIME",slot:"E2+TE2",venue:"SJT223"},{f:"ETHNUS",slot:"E2+TE2",venue:"PRPG32"},
      {f:"ETHNUS",slot:"E2+TE2",venue:"PRPG33"},{f:"FACE",slot:"E1+TE1",venue:"PRPG34"},
      {f:"FACE",slot:"E2+TE2",venue:"PRPG34"},{f:"FACE",slot:"E1+TE1",venue:"PRP134"},
      {f:"FACE",slot:"E2+TE2",venue:"PRP134"},{f:"SIXPHRASE",slot:"E1+TE1",venue:"PRP238"},
      {f:"SIXPHRASE",slot:"E2+TE2",venue:"PRP238"},{f:"SIXPHRASE",slot:"D1+TD1",venue:"PRP323"},
      {f:"TIME",slot:"D2+TD2",venue:"PRP333"},{f:"ETHNUS",slot:"E1+TE1",venue:"PRPG33"},
      {f:"FACE",slot:"D2+TD2",venue:"PRP313"},{f:"TIME",slot:"E2+TE2",venue:"PRP238A"},
      {f:"TIME",slot:"E1+TE1",venue:"PRP238A"},{f:"FACE",slot:"D2+TD2",venue:"PRP318"},
      {f:"ETHNUS",slot:"D1+TD1",venue:"PRP224"},{f:"TIME",slot:"E1+TE1",venue:"SJT222"},
      {f:"SIXPHRASE",slot:"D1+TD1",venue:"PRP411"},{f:"FACE",slot:"D1+TD1",venue:"PRP313"},
      {f:"ETHNUS",slot:"D1+TD1",venue:"PRP306"},{f:"SIXPHRASE",slot:"E2+TE2",venue:"SJT215"},
      {f:"SIXPHRASE",slot:"D2+TD2",venue:"PRP323"},{f:"SIXPHRASE",slot:"E1+TE1",venue:"SJT221"},
    ],
    lab:[]
  },
  HSM:{code:"HSM",name:"HSM Elective",short:"HSM",color:"#7A4B36",credits:3,
    isSelector:true,selectorKey:"HSM",
    // NOTE: only 2 options were present in the FFCS doc sent (it cut off before
    // any BAHUM111/112-style options) — add more here once you send the rest.
    selectorOptions:["BAHUM109","BAHUM110"],
    selectorNames:{"BAHUM109":"Principles of Sociology","BAHUM110":"Sustainability"},
    theory:{
      "BAHUM109":[
        {f:"BALAMURUGAN J",slot:"B1+TB1",venue:"SJT408"},
        {f:"RAHUL SHUKLA",slot:"B1+TB1",venue:"SJT103"},
        {f:"RAHUL SHUKLA",slot:"B2+TB2",venue:"SJT124"},
      ],
      "BAHUM110":[
        {f:"KUBENDRAN A",slot:"B2+TB2",venue:"TT415"},
      ]
    },
    lab:[]
  },
  CLOUDINFRA:{code:"BACSE344",name:"Cloud Infrastructure",short:"Cloud Infra",color:"#4A4E7C",credits:4,
    theory:[
      {f:"KARTHIKEYAN A",slot:"B2+TB2+TBB2",venue:"PRP304"},
      {f:"KEERTHIKA P",slot:"B2+TB2+TBB2",venue:"PRP306"},
      {f:"SURESH P",slot:"A1+TA1+TAA1",venue:"PRP414"},
      {f:"JAYACHANDRAN J",slot:"C1+TC1+TCC1",venue:"PRP414"},
    ],
    lab:[]
  },
  EDA:{code:"BACSEXXX",name:"Exploratory Data Analysis",short:"EDA",color:"#8C4F63",credits:4,
    theory:[
      {f:"RAJKUMAR R",slot:"B2+TB2",venue:"PRP318"},
      {f:"KALYANARAMAN P",slot:"B1+TB1",venue:"PRP318"},
      {f:"SARAVANAKUMAR K",slot:"B2+TB2",venue:"PRP320"},
      {f:"ANNY LEEMA A",slot:"B2+TB2",venue:"PRP319"},
      {f:"KARTHIKEYAN A",slot:"B1+TB1",venue:"PRP320"},
      {f:"PRABAKARAN N",slot:"B1+TB1",venue:"PRP309"},
      {f:"PRABAKARAN N",slot:"B2+TB2",venue:"PRP309"},
      {f:"THIRUMOORTHY K",slot:"B1+TB1",venue:"PRP313"},
      {f:"THIRUMOORTHY K",slot:"B2+TB2",venue:"PRP313"},
      {f:"JAYALAKSHMI M",slot:"B1+TB1",venue:"PRP322"},
      {f:"JAYAKUMAR K",slot:"B2+TB2",venue:"PRP322"},
      {f:"KATHIRAVAN S",slot:"B1+TB1",venue:"PRP323"},
      {f:"PRAKASH M",slot:"B2+TB2",venue:"PRP323"},
      {f:"SUBRAMANIYASWAMY V",slot:"B1+TB1",venue:"PRP411"},
      {f:"SWETHA V",slot:"B2+TB2",venue:"PRP411"},
      {f:"BALAKRISHNAN P",slot:"B1+TB1",venue:"PRP319"},
    ],
    lab:[
      {f:"SARAVANAKUMAR K",slot:"L3+L4",venue:"PRP354"},
      {f:"KALYANARAMAN P",slot:"L51+L52",venue:"PRP354"},
      {f:"RAJKUMAR R",slot:"L13+L14",venue:"PRP354"},
      {f:"ANNY LEEMA A",slot:"L15+L16",venue:"PRP354"},
      {f:"KARTHIKEYAN A",slot:"L43+L44",venue:"PRP354"},
      {f:"PRABAKARAN N",slot:"L39+L40",venue:"PRP354"},
      {f:"PRABAKARAN N",slot:"L23+L24",venue:"PRP354"},
      {f:"THIRUMOORTHY K",slot:"L31+L32",venue:"PRP354"},
      {f:"THIRUMOORTHY K",slot:"L9+L10",venue:"PRP354"},
      {f:"BALAKRISHNAN P",slot:"L45+L46",venue:"PRP354"},
      {f:"JAYALAKSHMI M",slot:"L55+L56",venue:"PRP354"},
      {f:"JAYAKUMAR K",slot:"L7+L8",venue:"PRP354"},
      {f:"KATHIRAVAN S",slot:"L35+L36",venue:"PRP354"},
      {f:"PRAKASH M",slot:"L5+L6",venue:"PRP354"},
      {f:"SUBRAMANIYASWAMY V",slot:"L31+L32",venue:"PRP655"},
      {f:"SWETHA V",slot:"L27+L28",venue:"PRP655"},
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// BUILD PAIRS — theory + paired lab for same faculty
// Evening theory (slot ends in 2) → morning lab (L1-L30)
// Morning theory (slot ends in 1) → evening lab (L31-L60)
// ═══════════════════════════════════════════════════════════════
function getSel(code) {
  return window._state?.sel?.[code] || null;
}

function getTheoryArr(code) {
  const c = COURSES[code];
  let arr = c.theory;
  if (!arr) return [];
  if (c.isSelector) {
    const sel = getSel(code);
    if (Array.isArray(arr)) return arr.filter(o => o.f === sel);
    return arr[sel] || [];
  }
  return arr;
}

function getLabArr(code) {
  const c = COURSES[code];
  let arr = c.lab;
  if (!arr || (Array.isArray(arr) && arr.length === 0)) return [];
  if (c.isSelector) {
    const sel = getSel(code);
    if (Array.isArray(arr)) return arr;
    return arr[sel] || [];
  }
  return arr;
}

function buildPairs(code) {
  const thArr = getTheoryArr(code);
  const lbArr = getLabArr(code);
  const pairs = [];

  if (thArr.length === 0 && lbArr.length === 0) return pairs;

  // Lab only
  if (thArr.length === 0) {
    lbArr.forEach(l => {
      pairs.push({ theory: null, lab: l, faculty: l.f,
        display: `${l.f}  ${l.slot}` });
    });
    return pairs;
  }

  // Theory only (e.g. Models of Computation)
  if (lbArr.length === 0) {
    thArr.forEach(t => {
      pairs.push({ theory: t, lab: null, faculty: t.f,
        display: `${t.f}  ${t.slot}` });
    });
    return pairs;
  }

  // Theory + Lab — same faculty, correct period pairing.
  // Full Stack's theory slots (bare "A1"/"A2") have no "T" letter but
  // still follow the morning(1)/evening(2) → lab pairing rule.
  thArr.forEach(t => {
    const evening = isEveningTheory(t.slot);
    const sameFacLabs = lbArr.filter(l => l.f === t.f);
    sameFacLabs.forEach(l => {
      const nums = l.slot.split("+").map(p => parseInt(p.replace("L",""))).filter(n => !isNaN(n));
      const labMorning = nums.length > 0 && nums.every(n => n <= 30);
      const valid = evening ? labMorning : !labMorning;
      if (valid) {
        pairs.push({ theory: t, lab: l, faculty: t.f,
          display: `${t.f}    ${t.slot}  →  ${l.slot}` });
      }
    });
  });
  return pairs;
}
