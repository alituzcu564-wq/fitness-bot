import * as fs from "fs";
import * as path from "path";

// ── Ortam ─────────────────────────────────────────────────────────────────────
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN!;
const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const POLL_INTERVAL_MS = 5000;

// ── Tipler ────────────────────────────────────────────────────────────────────
interface UserProfile {
  userId: string;
  name: string;
  age: number;
  gender: "erkek" | "kadın";
  weight: number;
  height: number;
  goal: "kilo_ver" | "kilo_al" | "form_koru";
  activity: "sedanter" | "hafif" | "orta" | "aktif" | "cok_aktif";
  workoutType: "ev" | "salon" | "ikisi";
  tdee: number;
  dailyCalorieGoal: number;
  onboardingStep: string | null;
  createdAt: string;
}

interface MealLog {
  time: string;
  description: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
}

interface DayLog {
  date: string;
  meals: MealLog[];
  workoutDone: boolean;
}

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

interface WorkoutDay {
  focus: string;
  exercises: Exercise[];
}

interface WorkoutProgram {
  generatedAt: string;
  type: string;
  days: Record<string, WorkoutDay | null>;
}

interface WeightEntry {
  date: string;
  weight: number;
}

// ── Dosya yardımcıları ────────────────────────────────────────────────────────
function userDir(userId: string): string {
  const d = path.join(DATA_DIR, "users", userId);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

function logsDir(userId: string): string {
  const d = path.join(userDir(userId), "logs");
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

function loadProfile(userId: string): UserProfile | null {
  const p = path.join(userDir(userId), "profile.json");
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : null;
}

function saveProfile(profile: UserProfile) {
  fs.writeFileSync(path.join(userDir(profile.userId), "profile.json"), JSON.stringify(profile, null, 2));
}

function loadDayLog(userId: string, date: string): DayLog {
  const p = path.join(logsDir(userId), `${date}.json`);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : { date, meals: [], workoutDone: false };
}

function saveDayLog(userId: string, log: DayLog) {
  fs.writeFileSync(path.join(logsDir(userId), `${log.date}.json`), JSON.stringify(log, null, 2));
}

function loadProgram(userId: string): WorkoutProgram | null {
  const p = path.join(userDir(userId), "program.json");
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : null;
}

function saveProgram(userId: string, program: WorkoutProgram) {
  fs.writeFileSync(path.join(userDir(userId), "program.json"), JSON.stringify(program, null, 2));
}

function loadProgress(userId: string): WeightEntry[] {
  const p = path.join(userDir(userId), "progress.json");
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : [];
}

function saveProgress(userId: string, entries: WeightEntry[]) {
  fs.writeFileSync(path.join(userDir(userId), "progress.json"), JSON.stringify(entries, null, 2));
}

// ── BMR / TDEE Hesaplama (Mifflin-St Jeor) ───────────────────────────────────
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedanter: 1.2,
  hafif: 1.375,
  orta: 1.55,
  aktif: 1.725,
  cok_aktif: 1.9,
};

function calculateTDEE(p: UserProfile): number {
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.gender === "erkek" ? 5 : -161);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[p.activity]);
}

function goalCalories(tdee: number, goal: UserProfile["goal"]): number {
  if (goal === "kilo_ver") return tdee - 300;
  if (goal === "kilo_al") return tdee + 300;
  return tdee;
}

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

async function getUpdates(offset: number): Promise<any[]> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?offset=${offset}&timeout=4`);
    const data = (await res.json()) as any;
    return data.ok ? data.result : [];
  } catch { return []; }
}

// ── Groq API ──────────────────────────────────────────────────────────────────
async function groqChat(prompt: string, max_tokens = 1024): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens,
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  return ((await res.json()) as any).choices[0].message.content;
}

// ── Kalori tahmini (AI) ───────────────────────────────────────────────────────
async function estimateMeal(description: string): Promise<MealLog> {
  const prompt = `Türkçe yemek: "${description}"
Bu yemeğin besin değerlerini tahmin et. SADECE JSON döndür, başka hiçbir şey yazma:
{"calories":350,"protein":20,"carb":40,"fat":12}
Gerçekçi ve ortalama porsiyona göre hesapla.`;

  const raw = await groqChat(prompt, 150);
  try {
    const m = raw.match(/\{[^}]+\}/);
    if (!m) throw new Error("JSON yok");
    const d = JSON.parse(m[0]);
    return {
      time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      description,
      calories: d.calories || 0,
      protein: d.protein || 0,
      carb: d.carb || 0,
      fat: d.fat || 0,
    };
  } catch {
    return { time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }), description, calories: 0, protein: 0, carb: 0, fat: 0 };
  }
}

// ── Antrenman programı üretimi (AI) ───────────────────────────────────────────
async function generateProgram(profile: UserProfile): Promise<WorkoutProgram> {
  const tip = profile.workoutType === "ev" ? "ev (ekipsiz)" : profile.workoutType === "salon" ? "spor salonu" : "karma (ev + salon)";
  const hedef = profile.goal === "kilo_ver" ? "yağ yakma" : profile.goal === "kilo_al" ? "kas kazanımı" : "form koruma";
  const cinsiyet = profile.gender === "erkek" ? "Erkek" : "Kadın";

  const prompt = `${cinsiyet}, ${profile.age} yaş, ${profile.weight}kg, hedef: ${hedef}, antrenman: ${tip}.
7 günlük haftalık program oluştur. Dinlenme günleri null olsun.
SADECE JSON döndür, başka bir şey yazma:
{"Pazartesi":{"focus":"Göğüs + Triceps","exercises":[{"name":"Bench Press","sets":"4","reps":"8-10","rest":"90 sn"}]},"Salı":null,"Çarşamba":{"focus":"Sırt + Biceps","exercises":[{"name":"Pull-up","sets":"4","reps":"6-8","rest":"90 sn"}]},"Perşembe":null,"Cuma":{"focus":"Bacak","exercises":[{"name":"Squat","sets":"4","reps":"10","rest":"90 sn"}]},"Cumartesi":null,"Pazar":null}
Maksimum 5 egzersiz per gün. Gerçekçi ve uygulanabilir olsun.`;

  try {
    const raw = await groqChat(prompt, 1500);
    const m = raw.match(/\{[\s\S]+\}/);
    if (!m) throw new Error("JSON yok");
    return { generatedAt: new Date().toISOString().split("T")[0], type: tip, days: JSON.parse(m[0]) };
  } catch {
    return {
      generatedAt: new Date().toISOString().split("T")[0],
      type: tip,
      days: {
        Pazartesi: { focus: "Üst Vücut", exercises: [{ name: "Şınav", sets: "3", reps: "10-15", rest: "60 sn" }, { name: "Dumbbell Row", sets: "3", reps: "12", rest: "60 sn" }] },
        Salı: null,
        Çarşamba: { focus: "Alt Vücut", exercises: [{ name: "Squat", sets: "3", reps: "15", rest: "60 sn" }, { name: "Lunge", sets: "3", reps: "12", rest: "60 sn" }] },
        Perşembe: null,
        Cuma: { focus: "Karın + Kardiyo", exercises: [{ name: "Plank", sets: "3", reps: "30 sn", rest: "30 sn" }, { name: "Crunch", sets: "3", reps: "20", rest: "30 sn" }] },
        Cumartesi: null,
        Pazar: null,
      },
    };
  }
}

// ── Onboarding (adım adım kurulum) ────────────────────────────────────────────
async function handleOnboarding(userId: string, text: string, profile: UserProfile) {
  const t = text.trim();
  const step = profile.onboardingStep;

  if (step === "name") {
    if (t.length < 2) { await sendTelegram(userId, "⚠️ Geçerli bir isim gir."); return; }
    profile.name = t;
    profile.onboardingStep = "age";
    saveProfile(profile);
    await sendTelegram(userId, `Hoş geldin *${profile.name}*! 🎉\n\nKaç yaşındasın? _(Sadece rakam yaz)_`);
    return;
  }

  if (step === "age") {
    const age = parseInt(t);
    if (isNaN(age) || age < 10 || age > 100) { await sendTelegram(userId, "⚠️ Geçerli bir yaş gir (10-100)"); return; }
    profile.age = age;
    profile.onboardingStep = "gender";
    saveProfile(profile);
    await sendTelegram(userId, "Cinsiyetin?\n\n1️⃣ Erkek\n2️⃣ Kadın");
    return;
  }

  if (step === "gender") {
    if (t === "1" || t.toLowerCase().includes("erkek")) profile.gender = "erkek";
    else if (t === "2" || t.toLowerCase().includes("kad")) profile.gender = "kadın";
    else { await sendTelegram(userId, "⚠️ 1 (Erkek) veya 2 (Kadın) yaz"); return; }
    profile.onboardingStep = "weight";
    saveProfile(profile);
    await sendTelegram(userId, "Şu anki kilonu gir _(kg olarak, örn: 75)_");
    return;
  }

  if (step === "weight") {
    const w = parseFloat(t.replace(",", "."));
    if (isNaN(w) || w < 30 || w > 300) { await sendTelegram(userId, "⚠️ Geçerli bir kilo gir (30-300 kg)"); return; }
    profile.weight = w;
    profile.onboardingStep = "height";
    saveProfile(profile);
    await sendTelegram(userId, "Boyunu gir _(cm olarak, örn: 175)_");
    return;
  }

  if (step === "height") {
    const h = parseInt(t);
    if (isNaN(h) || h < 100 || h > 250) { await sendTelegram(userId, "⚠️ Geçerli bir boy gir (100-250 cm)"); return; }
    profile.height = h;
    profile.onboardingStep = "goal";
    saveProfile(profile);
    await sendTelegram(userId, "Hedefiniz ne?\n\n1️⃣ Kilo vermek\n2️⃣ Kilo almak\n3️⃣ Forma girmek / korumak");
    return;
  }

  if (step === "goal") {
    if (t === "1" || t.includes("ver")) profile.goal = "kilo_ver";
    else if (t === "2" || t.includes("al")) profile.goal = "kilo_al";
    else if (t === "3" || t.includes("form") || t.includes("kor")) profile.goal = "form_koru";
    else { await sendTelegram(userId, "⚠️ 1, 2 veya 3 yaz"); return; }
    profile.onboardingStep = "activity";
    saveProfile(profile);
    await sendTelegram(userId,
      "Günlük aktivite seviyeni seç:\n\n" +
      "1️⃣ Hareketsiz _(masa başı, az yürüyüş)_\n" +
      "2️⃣ Hafif aktif _(haftada 1-3 gün egzersiz)_\n" +
      "3️⃣ Orta aktif _(haftada 3-5 gün)_\n" +
      "4️⃣ Çok aktif _(haftada 6-7 gün yoğun)_"
    );
    return;
  }

  if (step === "activity") {
    if (t === "1" || t.includes("hareketsiz")) profile.activity = "sedanter";
    else if (t === "2" || t.includes("hafif")) profile.activity = "hafif";
    else if (t === "3" || t.includes("orta")) profile.activity = "orta";
    else if (t === "4" || t.includes("aktif") || t.includes("yoğun")) profile.activity = "aktif";
    else { await sendTelegram(userId, "⚠️ 1, 2, 3 veya 4 yaz"); return; }
    profile.onboardingStep = "workout";
    saveProfile(profile);
    await sendTelegram(userId, "Antrenman tercihin?\n\n1️⃣ Ev antrenmanı _(ekipsiz)_\n2️⃣ Spor salonu\n3️⃣ İkisi de");
    return;
  }

  if (step === "workout") {
    if (t === "1" || t.includes("ev")) profile.workoutType = "ev";
    else if (t === "2" || t.includes("salon")) profile.workoutType = "salon";
    else if (t === "3" || t.includes("ikisi") || t.includes("her")) profile.workoutType = "ikisi";
    else { await sendTelegram(userId, "⚠️ 1, 2 veya 3 yaz"); return; }

    profile.tdee = calculateTDEE(profile);
    profile.dailyCalorieGoal = goalCalories(profile.tdee, profile.goal);
    profile.onboardingStep = null;
    saveProfile(profile);

    // İlk kilo kaydı
    saveProgress(profile.userId, [{ date: new Date().toISOString().split("T")[0], weight: profile.weight }]);

    await sendTelegram(userId, "⏳ Haftalık antrenman programın hazırlanıyor...");

    const program = await generateProgram(profile);
    saveProgram(userId, program);

    const goalText = { kilo_ver: "Kilo vermek", kilo_al: "Kilo almak", form_koru: "Forma girmek" }[profile.goal];
    await sendTelegram(userId,
      `✅ *Profil tamamlandı!*\n\n` +
      `👤 *${profile.name}* | ${profile.gender} | ${profile.age} yaş\n` +
      `⚖️ ${profile.weight} kg | ${profile.height} cm\n` +
      `🎯 Hedef: ${goalText}\n\n` +
      `🔥 Günlük kalori hedefin: *${profile.dailyCalorieGoal} kcal*\n` +
      `📊 TDEE: ${profile.tdee} kcal\n\n` +
      `Haftalık programın hazır! Aşağıdaki komutları kullanabilirsin:\n\n` +
      `/antrenman — Bugünkü egzersizler\n` +
      `/öğün 2 yumurta — Yemek kaydet\n` +
      `/bugün — Kalori özeti`
    );
    return;
  }
}

// ── Komut işleyici ────────────────────────────────────────────────────────────
async function handleMessage(userId: string, text: string) {
  const profile = loadProfile(userId);

  // Onboarding devam ediyor mu?
  if (profile?.onboardingStep) {
    await handleOnboarding(userId, text, profile);
    return;
  }

  // /başla
  if (text === "/başla" || text === "/basla" || text === "/start") {
    if (profile) {
      await sendTelegram(userId, `Merhaba *${profile.name}*! Profilin zaten mevcut.\n\n/profil — bilgilerini gör\n/yardım — tüm komutlar`);
      return;
    }
    const yeni: UserProfile = {
      userId, name: "", age: 0, gender: "erkek", weight: 0, height: 0,
      goal: "form_koru", activity: "orta", workoutType: "salon",
      tdee: 0, dailyCalorieGoal: 0, onboardingStep: "name",
      createdAt: new Date().toISOString().split("T")[0],
    };
    saveProfile(yeni);
    await sendTelegram(userId,
      `🏋️ *FitBot'a hoş geldin!*\n\n` +
      `Sana özel kalori takibi ve antrenman programı hazırlayacağım.\n\n` +
      `Başlamak için birkaç sorum var. Adın ne?`
    );
    return;
  }

  // Profil yoksa yönlendir
  if (!profile) {
    await sendTelegram(userId, `Merhaba! 👋\nHenüz kaydın yok.\n\n/başla yazarak başlayabilirsin.`);
    return;
  }

  // /öğün
  if (text.startsWith("/öğün ") || text.startsWith("/ogun ")) {
    const yemek = text.replace(/^\/[^\s]+\s+/, "").trim();
    if (!yemek) { await sendTelegram(userId, "⚠️ Format: `/öğün 2 yumurta 1 dilim ekmek`"); return; }
    await sendTelegram(userId, "🔍 Besin değerleri hesaplanıyor...");
    try {
      const meal = await estimateMeal(yemek);
      const today = new Date().toISOString().split("T")[0];
      const log = loadDayLog(userId, today);
      log.meals.push(meal);
      saveDayLog(userId, log);
      const toplamCal = log.meals.reduce((s, m) => s + m.calories, 0);
      const kalan = profile.dailyCalorieGoal - toplamCal;
      await sendTelegram(userId,
        `✅ *${meal.description}* eklendi\n\n` +
        `🔥 ${meal.calories} kcal  |  🥩 ${meal.protein}g protein  |  🍞 ${meal.carb}g karb  |  🧈 ${meal.fat}g yağ\n\n` +
        `📊 Bugün toplam: *${toplamCal} kcal*\n` +
        (kalan > 0 ? `✅ Kalan: *${kalan} kcal*` : `⚠️ Hedef aşıldı: *${Math.abs(kalan)} kcal*`)
      );
    } catch (e) { await sendTelegram(userId, `⚠️ Hata oluştu: ${e}`); }
    return;
  }

  // /bugün
  if (text === "/bugün" || text === "/bugun") {
    const today = new Date().toISOString().split("T")[0];
    const log = loadDayLog(userId, today);
    if (!log.meals.length) {
      await sendTelegram(userId, "📋 Bugün henüz öğün eklemedin.\n\n`/öğün yemek adı` ile ekleyebilirsin.");
      return;
    }
    const totCal = log.meals.reduce((s, m) => s + m.calories, 0);
    const totProt = log.meals.reduce((s, m) => s + m.protein, 0);
    const totCarb = log.meals.reduce((s, m) => s + m.carb, 0);
    const totFat = log.meals.reduce((s, m) => s + m.fat, 0);
    const kalan = profile.dailyCalorieGoal - totCal;
    const pct = Math.min(100, Math.round((totCal / profile.dailyCalorieGoal) * 100));
    const dolu = Math.floor(pct / 10);
    const bar = "█".repeat(dolu) + "░".repeat(10 - dolu);
    const ogunler = log.meals.map((m, i) => `${i + 1}. ${m.time} — ${m.description} _(${m.calories} kcal)_`).join("\n");
    await sendTelegram(userId,
      `📊 *Bugünkü Özet*\n\n` +
      `${bar} %${pct}\n` +
      `🔥 ${totCal} / ${profile.dailyCalorieGoal} kcal\n\n` +
      `🥩 Protein: ${totProt}g  |  🍞 Karb: ${totCarb}g  |  🧈 Yağ: ${totFat}g\n\n` +
      `*Öğünler:*\n${ogunler}\n\n` +
      (kalan > 0 ? `✅ Kalan: *${kalan} kcal*` : `⚠️ Hedef aşıldı: *${Math.abs(kalan)} kcal*`)
    );
    return;
  }

  // /antrenman
  if (text === "/antrenman") {
    const program = loadProgram(userId);
    if (!program) { await sendTelegram(userId, "⚠️ Program bulunamadı. `/başla` ile profil oluştur."); return; }
    const gunler = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const bugunAd = gunler[new Date().getDay()];
    const bugun = program.days[bugunAd];
    if (!bugun) {
      await sendTelegram(userId, `💤 *${bugunAd}* — Dinlenme günü\n\nKaslarını dinlendir, iyi uyu! 🌙`);
      return;
    }
    const egzersizler = bugun.exercises.map((e, i) =>
      `${i + 1}. *${e.name}*\n   ${e.sets} set × ${e.reps} | Dinlenme: ${e.rest}`
    ).join("\n\n");
    await sendTelegram(userId,
      `💪 *${bugunAd} — ${bugun.focus}*\n\n${egzersizler}\n\n` +
      `Tamamladın mı? /tamamla yazabilirsin ✅`
    );
    return;
  }

  // /tamamla
  if (text === "/tamamla") {
    const today = new Date().toISOString().split("T")[0];
    const log = loadDayLog(userId, today);
    log.workoutDone = true;
    saveDayLog(userId, log);
    await sendTelegram(userId, "🎉 *Harika iş!* Antrenman tamamlandı!\n\nBugünkü egzersizin işaretlendi. Devam et! 💪🔥");
    return;
  }

  // /program
  if (text === "/program") {
    const program = loadProgram(userId);
    if (!program) { await sendTelegram(userId, "⚠️ Program bulunamadı."); return; }
    const sira = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    const liste = sira.map(gun => {
      const g = program.days[gun];
      return g ? `*${gun}:* ${g.focus} (${g.exercises.length} egzersiz)` : `*${gun}:* 💤 Dinlenme`;
    }).join("\n");
    await sendTelegram(userId, `📅 *Haftalık Program*\n_(${program.type})_\n\n${liste}\n\n/antrenman — bugünkü detaylar`);
    return;
  }

  // /tartı
  if (text.startsWith("/tartı ") || text.startsWith("/tarti ")) {
    const kilo = parseFloat((text.split(" ")[1] || "").replace(",", "."));
    if (isNaN(kilo) || kilo < 30 || kilo > 300) { await sendTelegram(userId, "⚠️ Format: `/tartı 78.5`"); return; }
    const entries = loadProgress(userId);
    entries.push({ date: new Date().toISOString().split("T")[0], weight: kilo });
    saveProgress(userId, entries);
    profile.weight = kilo;
    profile.tdee = calculateTDEE(profile);
    profile.dailyCalorieGoal = goalCalories(profile.tdee, profile.goal);
    saveProfile(profile);
    const fark = kilo - entries[0].weight;
    await sendTelegram(userId,
      `⚖️ Kilo kaydedildi: *${kilo} kg*\n\n` +
      `Başlangıçtan fark: *${fark > 0 ? "+" : ""}${fark.toFixed(1)} kg*\n` +
      `Kalori hedefin güncellendi: *${profile.dailyCalorieGoal} kcal*`
    );
    return;
  }

  // /ilerleme
  if (text === "/ilerleme") {
    const entries = loadProgress(userId);
    if (entries.length < 2) {
      await sendTelegram(userId, "📈 İlerleme için en az 2 kilo kaydı gerekli.\n\n`/tartı 75` ile kilo kaydedebilirsin.");
      return;
    }
    const ilk = entries[0];
    const son = entries[entries.length - 1];
    const fark = son.weight - ilk.weight;
    const gun = Math.round((new Date(son.date).getTime() - new Date(ilk.date).getTime()) / 86400000);
    const son7 = entries.slice(-7).map(e => `• ${e.date}: *${e.weight} kg*`).join("\n");
    const durum = profile.goal === "kilo_ver"
      ? fark < 0 ? "✅ Hedefe doğru gidiyorsun!" : "⚠️ Henüz ilerleme yok, devam et!"
      : profile.goal === "kilo_al"
      ? fark > 0 ? "✅ Hedefe doğru gidiyorsun!" : "⚠️ Henüz ilerleme yok, daha fazla ye!"
      : "📊 Kilo korunuyor";
    await sendTelegram(userId,
      `📈 *İlerleme Raporu*\n\n` +
      `Başlangıç: ${ilk.date} — ${ilk.weight} kg\n` +
      `Bugün: ${son.date} — ${son.weight} kg\n` +
      `Fark: *${fark > 0 ? "+" : ""}${fark.toFixed(1)} kg* (${gun} günde)\n\n` +
      `${durum}\n\n` +
      `*Son kayıtlar:*\n${son7}`
    );
    return;
  }

  // /profil
  if (text === "/profil") {
    const goalText = { kilo_ver: "Kilo vermek", kilo_al: "Kilo almak", form_koru: "Forma girmek" }[profile.goal];
    const actText = { sedanter: "Hareketsiz", hafif: "Hafif aktif", orta: "Orta aktif", aktif: "Aktif", cok_aktif: "Çok aktif" }[profile.activity];
    const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
    await sendTelegram(userId,
      `👤 *${profile.name}*\n\n` +
      `Yaş: ${profile.age} | Cinsiyet: ${profile.gender}\n` +
      `Boy: ${profile.height} cm | Kilo: ${profile.weight} kg\n` +
      `BMI: *${bmi}*\n\n` +
      `🎯 Hedef: ${goalText}\n` +
      `🏃 Aktivite: ${actText}\n\n` +
      `🔥 TDEE: ${profile.tdee} kcal\n` +
      `📊 Günlük hedef: *${profile.dailyCalorieGoal} kcal*\n\n` +
      `Üyelik: ${profile.createdAt}`
    );
    return;
  }

  // /yardım
  if (text === "/yardım" || text === "/yardim" || text === "/help") {
    await sendTelegram(userId,
      `🏋️ *FitBot Komutları*\n\n` +
      `👤 /profil — Profil bilgilerin\n` +
      `🍽 /öğün \\[yemek\\] — Öğün kaydet\n` +
      `📊 /bugün — Günlük kalori özeti\n` +
      `💪 /antrenman — Bugünkü program\n` +
      `✅ /tamamla — Antrenmanı tamamlandı say\n` +
      `📅 /program — Haftalık program\n` +
      `⚖️ /tartı \\[kg\\] — Kilo kaydet\n` +
      `📈 /ilerleme — İlerleme raporu\n` +
      `❓ /yardım — Bu menü\n\n` +
      `_Örnek: /öğün 2 yumurta 1 dilim ekmek peynir_`
    );
    return;
  }
}

// ── Ana döngü ─────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let offset = 0;
  const cfgPath = path.join(DATA_DIR, "config.json");
  if (fs.existsSync(cfgPath)) offset = JSON.parse(fs.readFileSync(cfgPath, "utf-8")).offset || 0;

  console.log(`[FitBot] Başlatıldı. Offset: ${offset}`);

  while (true) {
    const updates = await getUpdates(offset);
    for (const update of updates) {
      offset = update.update_id + 1;
      const msg = update.message;
      if (!msg?.text) continue;
      const userId = String(msg.from.id);
      console.log(`[${new Date().toISOString()}] ${msg.from.first_name} (${userId}): ${msg.text}`);
      try { await handleMessage(userId, msg.text.trim()); }
      catch (e) { console.error(`Hata (${userId}):`, e); }
    }
    if (updates.length) fs.writeFileSync(cfgPath, JSON.stringify({ offset }, null, 2));
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
}

main().catch(e => { console.error("Kritik hata:", e); process.exit(1); });
