// Besin veritabanı — 100g başına değerler (kcal, protein g, karb g, yağ g)
export interface FoodData {
  kcal: number; protein: number; carb: number; fat: number;
  serving?: { g: number; label: string }; // standart porsiyon
}

export const FOODS: Record<string, FoodData & { aliases: string[] }> = {

  // ── TEMEL MALZEMELer ────────────────────────────────────────────────────────
  yumurta:          { kcal: 143, protein: 12.6, carb: 0.7,  fat: 9.5,  aliases: ["egg", "eggs", "yumurta"], serving: { g: 60, label: "1 yumurta" } },
  yumurta_beyazi:   { kcal: 52,  protein: 10.9, carb: 0.7,  fat: 0.2,  aliases: ["egg white", "beyaz", "akı"] },
  yumurta_sarisi:   { kcal: 322, protein: 15.9, carb: 3.6,  fat: 26.5, aliases: ["yolk", "sarısı"] },

  // ── SÜT ÜRÜNLERİ ────────────────────────────────────────────────────────────
  sut:              { kcal: 61,  protein: 3.2,  carb: 4.8,  fat: 3.3,  aliases: ["milk", "süt"], serving: { g: 200, label: "1 bardak" } },
  sut_yagsiz:       { kcal: 34,  protein: 3.4,  carb: 5.0,  fat: 0.1,  aliases: ["yağsız süt", "skim milk"] },
  yogurt:           { kcal: 61,  protein: 3.5,  carb: 4.7,  fat: 3.3,  aliases: ["yoğurt", "yoghurt"], serving: { g: 150, label: "1 kase" } },
  yogurt_light:     { kcal: 42,  protein: 4.3,  carb: 5.5,  fat: 0.3,  aliases: ["light yoğurt", "yağsız yoğurt"] },
  greek_yogurt:     { kcal: 97,  protein: 9.0,  carb: 3.6,  fat: 5.0,  aliases: ["süzme yoğurt", "greek", "süzme"] },
  tereyagi:         { kcal: 717, protein: 0.9,  carb: 0.1,  fat: 81.1, aliases: ["butter", "tereyağı", "tereyağ"], serving: { g: 10, label: "1 tatlı kaşığı" } },
  beyaz_peynir:     { kcal: 264, protein: 17.5, carb: 1.5,  fat: 21.0, aliases: ["white cheese", "feta", "peynir"] },
  kasar_peynir:     { kcal: 340, protein: 25.0, carb: 1.3,  fat: 26.0, aliases: ["kaşar", "cheddar", "kaşar peyniri"] },
  lor_peyniri:      { kcal: 100, protein: 16.0, carb: 2.0,  fat: 2.0,  aliases: ["lor", "cottage cheese", "lor peynir"] },
  labne:            { kcal: 270, protein: 7.0,  carb: 4.0,  fat: 25.0, aliases: ["labneh", "krem peynir"] },
  kefir:            { kcal: 64,  protein: 3.4,  carb: 4.7,  fat: 3.5,  aliases: ["kefir"] },

  // ── ET & TAVUK ───────────────────────────────────────────────────────────────
  tavuk_gogus:      { kcal: 165, protein: 31.0, carb: 0.0,  fat: 3.6,  aliases: ["chicken breast", "tavuk göğsü", "tavuk göğüs", "chicken"] },
  tavuk_but:        { kcal: 209, protein: 26.0, carb: 0.0,  fat: 11.0, aliases: ["tavuk but", "chicken thigh", "but"] },
  kiyma:            { kcal: 254, protein: 17.2, carb: 0.0,  fat: 20.0, aliases: ["kıyma", "ground beef", "minced meat"] },
  biftek:           { kcal: 271, protein: 26.0, carb: 0.0,  fat: 18.0, aliases: ["steak", "et", "beef", "dana"] },
  hindi:            { kcal: 135, protein: 29.0, carb: 0.0,  fat: 1.0,  aliases: ["turkey", "hindi eti"] },
  balik_somon:      { kcal: 208, protein: 20.0, carb: 0.0,  fat: 13.0, aliases: ["somon", "salmon", "som balığı"] },
  ton_baligi:       { kcal: 116, protein: 26.0, carb: 0.0,  fat: 1.0,  aliases: ["tuna", "ton", "ton balık"] },
  levrek:           { kcal: 124, protein: 23.6, carb: 0.0,  fat: 2.7,  aliases: ["sea bass", "levrek"] },
  çipura:           { kcal: 109, protein: 20.0, carb: 0.0,  fat: 2.5,  aliases: ["sea bream", "çipura", "cipura"] },
  karides:          { kcal: 85,  protein: 20.0, carb: 0.0,  fat: 0.5,  aliases: ["shrimp", "prawn", "karides"] },

  // ── TÜRK YEMEKLERİ ───────────────────────────────────────────────────────────
  pilav:            { kcal: 130, protein: 2.5,  carb: 28.0, fat: 0.3,  aliases: ["rice", "pirinç pilavı", "pirinç"], serving: { g: 150, label: "1 porsiyon" } },
  bulgur_pilavi:    { kcal: 83,  protein: 3.1,  carb: 18.6, fat: 0.2,  aliases: ["bulgur pilavı", "bulgur"] },
  mercimek_corbasi: { kcal: 89,  protein: 5.5,  carb: 13.0, fat: 2.0,  aliases: ["mercimek çorbası", "lentil soup", "mercimek"] },
  domates_corbasi:  { kcal: 40,  protein: 1.5,  carb: 7.5,  fat: 0.5,  aliases: ["domates çorbası", "tomato soup"] },
  kofte:            { kcal: 245, protein: 18.0, carb: 5.0,  fat: 17.0, aliases: ["köfte", "meatball", "meatballs"] },
  doner:            { kcal: 274, protein: 21.0, carb: 4.0,  fat: 20.0, aliases: ["döner", "doner kebab"] },
  kebap:            { kcal: 255, protein: 22.0, carb: 1.0,  fat: 18.0, aliases: ["kebap", "kebab", "adana", "urfa"] },
  lahmacun:         { kcal: 270, protein: 12.0, carb: 35.0, fat: 9.0,  aliases: ["lahmacun"], serving: { g: 130, label: "1 adet" } },
  pide:             { kcal: 265, protein: 9.0,  carb: 43.0, fat: 6.0,  aliases: ["pide", "kiymali pide"], serving: { g: 200, label: "1 pide" } },
  gozleme:          { kcal: 215, protein: 8.0,  carb: 26.0, fat: 9.0,  aliases: ["gözleme"], serving: { g: 150, label: "1 gözleme" } },
  menemen:          { kcal: 100, protein: 6.0,  carb: 6.0,  fat: 6.0,  aliases: ["menemen"], serving: { g: 200, label: "1 porsiyon" } },
  baklava:          { kcal: 428, protein: 5.7,  carb: 52.0, fat: 23.0, aliases: ["baklava"], serving: { g: 80, label: "1 dilim" } },
  simit:            { kcal: 294, protein: 9.5,  carb: 55.0, fat: 4.0,  aliases: ["simit"], serving: { g: 130, label: "1 simit" } },
  poğaça:           { kcal: 330, protein: 7.0,  carb: 40.0, fat: 16.0, aliases: ["poğaça", "pogaca"], serving: { g: 100, label: "1 poğaça" } },
  boreks:           { kcal: 320, protein: 10.0, carb: 32.0, fat: 18.0, aliases: ["börek", "borek", "su böreği"] },
  cacik:            { kcal: 60,  protein: 3.0,  carb: 4.5,  fat: 3.5,  aliases: ["cacık", "tzatziki"] },
  hummus:           { kcal: 177, protein: 7.9,  carb: 20.0, fat: 8.6,  aliases: ["humus", "hummus"] },
  tarhana:          { kcal: 87,  protein: 3.5,  carb: 16.0, fat: 1.0,  aliases: ["tarhana çorbası", "tarhana"] },
  ezogelin:         { kcal: 85,  protein: 4.5,  carb: 14.0, fat: 1.5,  aliases: ["ezogelin çorbası", "ezogelin"] },

  // ── EKMEK & TAHILLAR ─────────────────────────────────────────────────────────
  ekmek:            { kcal: 265, protein: 9.0,  carb: 49.0, fat: 3.2,  aliases: ["bread", "white bread", "beyaz ekmek"], serving: { g: 35, label: "1 dilim" } },
  tam_bugday_ekmek: { kcal: 247, protein: 13.0, carb: 41.0, fat: 4.2,  aliases: ["tam buğday", "whole wheat", "çavdar"] },
  yulaf:            { kcal: 389, protein: 16.9, carb: 66.0, fat: 6.9,  aliases: ["oats", "oatmeal", "yulaf ezmesi"], serving: { g: 80, label: "1 porsiyon" } },
  makarna:          { kcal: 131, protein: 5.0,  carb: 25.0, fat: 1.1,  aliases: ["pasta", "spaghetti", "penne", "noodle"], serving: { g: 200, label: "1 porsiyon (pişmiş)" } },
  mercimek:         { kcal: 116, protein: 9.0,  carb: 20.0, fat: 0.4,  aliases: ["lentils", "lentil", "kırmızı mercimek"] },
  nohut:            { kcal: 164, protein: 8.9,  carb: 27.0, fat: 2.6,  aliases: ["chickpeas", "chickpea", "nohut"] },
  fasulye:          { kcal: 127, protein: 8.7,  carb: 22.8, fat: 0.5,  aliases: ["beans", "bean", "kuru fasulye"] },
  kinoa:            { kcal: 120, protein: 4.4,  carb: 21.3, fat: 1.9,  aliases: ["quinoa", "kinoa"] },
  pirinc:           { kcal: 130, protein: 2.7,  carb: 28.2, fat: 0.3,  aliases: ["rice", "pirinç"] },

  // ── MEYVE ────────────────────────────────────────────────────────────────────
  muz:              { kcal: 89,  protein: 1.1,  carb: 23.0, fat: 0.3,  aliases: ["banana", "muz"], serving: { g: 120, label: "1 muz" } },
  elma:             { kcal: 52,  protein: 0.3,  carb: 14.0, fat: 0.2,  aliases: ["apple", "elma"], serving: { g: 180, label: "1 elma" } },
  portakal:         { kcal: 47,  protein: 0.9,  carb: 12.0, fat: 0.1,  aliases: ["orange", "portakal"], serving: { g: 200, label: "1 portakal" } },
  cilek:            { kcal: 32,  protein: 0.7,  carb: 7.7,  fat: 0.3,  aliases: ["strawberry", "çilek"] },
  karpuz:           { kcal: 30,  protein: 0.6,  carb: 7.6,  fat: 0.2,  aliases: ["watermelon", "karpuz"] },
  uzum:             { kcal: 69,  protein: 0.7,  carb: 18.1, fat: 0.2,  aliases: ["grapes", "üzüm"] },
  avokado:          { kcal: 160, protein: 2.0,  carb: 9.0,  fat: 15.0, aliases: ["avocado", "avokado"], serving: { g: 150, label: "1 avokado" } },
  hurma:            { kcal: 277, protein: 1.8,  carb: 75.0, fat: 0.2,  aliases: ["dates", "date", "hurma"] },

  // ── SEBZE ────────────────────────────────────────────────────────────────────
  domates:          { kcal: 18,  protein: 0.9,  carb: 3.9,  fat: 0.2,  aliases: ["tomato", "domates"] },
  salatalik:        { kcal: 15,  protein: 0.7,  carb: 3.6,  fat: 0.1,  aliases: ["cucumber", "salatalık", "hıyar"] },
  ispanak:          { kcal: 23,  protein: 2.9,  carb: 3.6,  fat: 0.4,  aliases: ["spinach", "ıspanak", "ispanak"] },
  brokoli:          { kcal: 34,  protein: 2.8,  carb: 7.0,  fat: 0.4,  aliases: ["broccoli", "brokoli"] },
  patates:          { kcal: 77,  protein: 2.0,  carb: 17.0, fat: 0.1,  aliases: ["potato", "patates"], serving: { g: 200, label: "1 orta patates" } },
  patates_kizartma: { kcal: 312, protein: 3.4,  carb: 41.0, fat: 15.0, aliases: ["french fries", "fries", "kızartma", "patates kızartması"] },
  havuc:            { kcal: 41,  protein: 0.9,  carb: 10.0, fat: 0.2,  aliases: ["carrot", "havuç"] },
  misir:            { kcal: 86,  protein: 3.2,  carb: 19.0, fat: 1.2,  aliases: ["corn", "mısır"] },

  // ── YAĞ & SOSLAR ─────────────────────────────────────────────────────────────
  zeytinyagi:       { kcal: 884, protein: 0.0,  carb: 0.0,  fat: 100.0, aliases: ["olive oil", "zeytinyağı", "zeytin yağı"], serving: { g: 10, label: "1 yemek kaşığı" } },
  aycicek_yagi:     { kcal: 884, protein: 0.0,  carb: 0.0,  fat: 100.0, aliases: ["sunflower oil", "ayçiçek yağı"] },
  mayonez:          { kcal: 680, protein: 1.0,  carb: 0.6,  fat: 75.0, aliases: ["mayo", "mayonez"] },
  ketçap:           { kcal: 112, protein: 1.6,  carb: 26.0, fat: 0.2,  aliases: ["ketchup", "ketçap"] },

  // ── KURUYEMIŞ ────────────────────────────────────────────────────────────────
  badem:            { kcal: 579, protein: 21.0, carb: 22.0, fat: 50.0, aliases: ["almonds", "almond", "badem"] },
  ceviz:            { kcal: 654, protein: 15.0, carb: 14.0, fat: 65.0, aliases: ["walnut", "walnuts", "ceviz"] },
  yer_fistigi:      { kcal: 567, protein: 25.8, carb: 16.1, fat: 49.2, aliases: ["peanut", "peanuts", "yer fıstığı"] },
  fistik_ezmesi:    { kcal: 588, protein: 25.0, carb: 20.0, fat: 50.0, aliases: ["peanut butter", "fıstık ezmesi", "fıstık"], serving: { g: 32, label: "2 yemek kaşığı" } },

  // ── FITNESS BESİNLERİ ─────────────────────────────────────────────────────────
  whey_protein:     { kcal: 370, protein: 75.0, carb: 10.0, fat: 4.0,  aliases: ["whey", "protein tozu", "protein powder"], serving: { g: 30, label: "1 ölçek" } },
  kazein:           { kcal: 360, protein: 78.0, carb: 6.0,  fat: 2.0,  aliases: ["casein", "kazein"] },
  mass_gainer:      { kcal: 380, protein: 15.0, carb: 72.0, fat: 4.0,  aliases: ["gainer", "mass", "hiq gainer", "hiq", "mass gainer"], serving: { g: 150, label: "2 ölçek" } },
  kreatın:          { kcal: 0,   protein: 0.0,  carb: 0.0,  fat: 0.0,  aliases: ["creatine", "kreatin", "creatın"] },
  protein_bar:      { kcal: 350, protein: 28.0, carb: 35.0, fat: 8.0,  aliases: ["protein bar", "bar"] },

  // ── FAST FOOD & ULUSLARARASI ──────────────────────────────────────────────────
  pizza:            { kcal: 266, protein: 11.0, carb: 33.0, fat: 10.0, aliases: ["pizza"], serving: { g: 150, label: "1 dilim" } },
  hamburger:        { kcal: 295, protein: 17.0, carb: 24.0, fat: 14.0, aliases: ["burger", "hamburger", "cheeseburger"], serving: { g: 200, label: "1 adet" } },
  hotdog:           { kcal: 290, protein: 11.0, carb: 25.0, fat: 17.0, aliases: ["hot dog", "sosis ekmek"] },
  wrap:             { kcal: 220, protein: 10.0, carb: 28.0, fat: 8.0,  aliases: ["wrap", "dürüm"], serving: { g: 200, label: "1 adet" } },
  tost:             { kcal: 300, protein: 14.0, carb: 35.0, fat: 12.0, aliases: ["tost", "toast", "sandviç"], serving: { g: 150, label: "1 tost" } },

  // ── SUSHİ ────────────────────────────────────────────────────────────────────
  sushi_nigiri:     { kcal: 150, protein: 7.0,  carb: 22.0, fat: 2.0,  aliases: ["nigiri", "niğiri"], serving: { g: 80, label: "2 parça" } },
  sushi_maki:       { kcal: 185, protein: 6.0,  carb: 30.0, fat: 4.0,  aliases: ["maki", "sushi maki"], serving: { g: 100, label: "6 parça" } },
  sushi_california: { kcal: 180, protein: 7.0,  carb: 28.0, fat: 4.5,  aliases: ["california roll", "california"], serving: { g: 100, label: "6 parça" } },
  sushi_sashimi:    { kcal: 142, protein: 23.0, carb: 0.0,  fat: 4.5,  aliases: ["sashimi"], serving: { g: 100, label: "5-6 parça" } },
  sushi_roll:       { kcal: 200, protein: 8.0,  carb: 30.0, fat: 5.0,  aliases: ["sushi roll", "sushi", "roll"] },

  // ── TATLILAR & ATIŞTIRILMAKLAR ────────────────────────────────────────────────
  cikolata:         { kcal: 546, protein: 4.9,  carb: 60.0, fat: 31.0, aliases: ["chocolate", "çikolata", "milk chocolate"], serving: { g: 40, label: "1 bar" } },
  bitter_cikolata:  { kcal: 598, protein: 7.8,  carb: 46.0, fat: 43.0, aliases: ["dark chocolate", "bitter çikolata", "bitter"] },
  kek:              { kcal: 350, protein: 5.0,  carb: 52.0, fat: 14.0, aliases: ["cake", "kek"], serving: { g: 100, label: "1 dilim" } },
  biskuvi:          { kcal: 480, protein: 6.5,  carb: 67.0, fat: 21.0, aliases: ["biscuit", "bisküvi", "cookie", "kurabiye"] },
  cips:             { kcal: 536, protein: 7.0,  carb: 53.0, fat: 35.0, aliases: ["chips", "cips", "potato chips"] },
  bal:              { kcal: 304, protein: 0.3,  carb: 82.0, fat: 0.0,  aliases: ["honey", "bal"], serving: { g: 21, label: "1 yemek kaşığı" } },
  reçel:            { kcal: 278, protein: 0.4,  carb: 69.0, fat: 0.1,  aliases: ["jam", "jelly", "reçel", "marmelat"] },

  // ── İÇECEKLER ────────────────────────────────────────────────────────────────
  kahve:            { kcal: 2,   protein: 0.3,  carb: 0.0,  fat: 0.0,  aliases: ["coffee", "kahve", "espresso", "americano"] },
  sutlu_kahve:      { kcal: 52,  protein: 1.7,  carb: 5.0,  fat: 2.7,  aliases: ["latte", "cappuccino", "sütlü kahve"], serving: { g: 240, label: "1 bardak" } },
  cay:              { kcal: 1,   protein: 0.0,  carb: 0.3,  fat: 0.0,  aliases: ["tea", "çay", "siyah çay"] },
  portakal_suyu:    { kcal: 45,  protein: 0.7,  carb: 10.4, fat: 0.2,  aliases: ["orange juice", "portakal suyu", "meyve suyu"] },
  kola:             { kcal: 37,  protein: 0.0,  carb: 9.6,  fat: 0.0,  aliases: ["cola", "kola", "coke", "coca cola", "pepsi"], serving: { g: 330, label: "1 kutu" } },
  protein_shake:    { kcal: 150, protein: 25.0, carb: 8.0,  fat: 2.0,  aliases: ["protein shake", "shake"], serving: { g: 300, label: "1 bardak" } },
};

// ── Miktar ayrıştırıcı ────────────────────────────────────────────────────────
// "4 yumurta", "2 ölçek whey", "100 gr tavuk", "1.5 bardak süt" gibi girdileri parse eder
export interface ParsedIngredient {
  key: string;
  food: FoodData;
  grams: number;
  raw: string;
}

const UNIT_TO_GRAMS: Record<string, number> = {
  "gr": 1, "g": 1, "gram": 1, "ml": 1,
  "kg": 1000, "lt": 1000, "litre": 1000,
  "yemek kaşığı": 15, "kaşık": 15, "tatlı kaşığı": 5,
  "bardak": 200, "çay bardağı": 100, "su bardağı": 200,
  "dilim": 35, "adet": 0, "tane": 0,
  "ölçek": 0, "porsiyon": 0,
};

function findFood(word: string): [string, FoodData] | null {
  const lower = word.toLowerCase().trim();
  for (const [key, food] of Object.entries(FOODS)) {
    if (lower === key || food.aliases.some(a => lower.includes(a.toLowerCase()) || a.toLowerCase().includes(lower))) {
      return [key, food];
    }
  }
  return null;
}

export function parseMeal(description: string): ParsedIngredient[] {
  const results: ParsedIngredient[] = [];
  const text = description.toLowerCase();

  // Her food item için metin içinde ara
  for (const [key, food] of Object.entries(FOODS)) {
    const allNames = [key, ...food.aliases].sort((a, b) => b.length - a.length);
    let matched = false;

    for (const name of allNames) {
      const idx = text.indexOf(name.toLowerCase());
      if (idx === -1) continue;

      // Öncesinde miktar var mı bak
      const before = text.slice(Math.max(0, idx - 20), idx).trim();
      const qtyMatch = before.match(/(\d+\.?\d*)\s*(gr|g|gram|ml|kg|lt|yemek kaşığı|kaşık|tatlı kaşığı|bardak|çay bardağı|su bardağı|dilim|adet|tane|ölçek|porsiyon)?$/i);

      let grams = food.serving?.g ?? 100;

      if (qtyMatch) {
        const qty = parseFloat(qtyMatch[1]);
        const unit = (qtyMatch[2] || "").toLowerCase().trim();

        if (unit && UNIT_TO_GRAMS[unit] > 0) {
          grams = qty * UNIT_TO_GRAMS[unit];
        } else if (unit === "adet" || unit === "tane" || unit === "") {
          grams = qty * (food.serving?.g ?? 100);
        } else if (unit === "ölçek") {
          grams = qty * (food.serving?.g ?? 30);
        } else if (unit === "porsiyon") {
          grams = qty * (food.serving?.g ?? 100);
        } else {
          grams = qty * (food.serving?.g ?? 100);
        }
      }

      results.push({ key, food, grams, raw: name });
      matched = true;
      break;
    }
  }

  return results;
}

export interface NutritionTotal {
  calories: number; protein: number; carb: number; fat: number;
  matched: string[];
  unmatched: boolean;
}

export function calculateMeal(description: string): NutritionTotal | null {
  const items = parseMeal(description);
  if (items.length === 0) return null;

  let calories = 0, protein = 0, carb = 0, fat = 0;
  const matched: string[] = [];

  for (const item of items) {
    const ratio = item.grams / 100;
    calories += item.food.kcal * ratio;
    protein  += item.food.protein * ratio;
    carb     += item.food.carb * ratio;
    fat      += item.food.fat * ratio;
    matched.push(item.raw);
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carb: Math.round(carb),
    fat: Math.round(fat),
    matched,
    unmatched: false,
  };
}
