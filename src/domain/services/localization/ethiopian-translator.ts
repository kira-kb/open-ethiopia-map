export type SupportedLanguage = "en" | "am";

export interface RequestLike {
  query?: Record<string, any>;
  headers?: Record<string, any>;
  body?: Record<string, any>;
}

// ── Geographic & Landmark Translations ───────────────────────────
const CITY_TRANSLATIONS: Record<string, string> = {
  "addis ababa": "አዲስ አበባ",
  "gondar": "ጎንደር",
  "gonder": "ጎንደር",
  "hawassa": "ሐዋሳ",
  "awassa": "ሐዋሳ",
  "bahir dar": "ባሕር ዳር",
  "bahirdar": "ባሕር ዳር",
  "dire dawa": "ድሬዳዋ",
  "diredawa": "ድሬዳዋ",
  "adama": "አዳማ",
  "nazret": "አዳማ",
  "nazreth": "አዳማ",
  "bishoftu": "ቢሾፍቱ",
  "debre zeit": "ቢሾፍቱ",
  "mekelle": "መቀሌ",
  "jimma": "ጅማ",
  "harar": "ሐረር",
  "ethiopia": "ኢትዮጵያ",
};

const SUBCITY_TRANSLATIONS: Record<string, string> = {
  "bole": "ቦሌ",
  "arada": "አራዳ",
  "kirkos": "ቂርቆስ",
  "yeka": "የካ",
  "lideta": "ልደታ",
  "nifas silk-lafto": "ንፋስ ስልክ ላፍቶ",
  "nifas silk": "ንፋስ ስልክ",
  "kolfe keranio": "ኮልፌ ቀራኒዮ",
  "gulele": "ጉለሌ",
  "akaky kaliti": "አቃቂ ቃሊቲ",
  "akaki kality": "አቃቂ ቃሊቲ",
  "addis ketema": "አዲስ ከተማ",
  "lemi kura": "ለሚ ኩራ",
  "piassa": "ፒያሳ",
  "kazanchis": "ካዛንቺስ",
  "megenagna": "መገናኛ",
  "sarbet": "ሳር ቤት",
  "mexico": "ሜክሲኮ",
  "merkato": "መርካቶ",
  "mercato": "መርካቶ",
  "gotera": "ጎተራ",
  "gerji": "ገርጂ",
  "cmc": "ሲኤምሲ",
  "ayat": "አያት",
  "kebele 18": "ቀበሌ 18",
  "azezo": "አዘዞ",
  "maraki": "ማራኪ",
};

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "fuel": "ነዳጅ ማደያ",
  "gas_station": "ነዳጅ ማደያ",
  "hospital": "ሆስፒታል",
  "clinic": "ክሊኒክ",
  "pharmacy": "ፋርማሲ",
  "restaurant": "ምግብ ቤት",
  "cafe": "ካፌ",
  "coffee": "ቡና ቤት",
  "hotel": "ሆቴል",
  "bank": "ባንክ",
  "atm": "ኤቲኤም (ATM)",
  "school": "ትምህርት ቤት",
  "university": "ዩኒቨርሲቲ",
  "mall": "የገበያ ማዕከል",
  "supermarket": "ሱፐርማርኬት",
  "market": "ገበያ",
  "police": "ፖሊስ ጣቢያ",
  "church": "ቤተ ክርስቲያን",
  "mosque": "መስጊድ",
  "square": "አደባባይ",
  "airport": "አውሮፕላን ማረፊያ",
  "parking": "የመኪና ማቆሚያ",
};

const VEHICLE_TRANSLATIONS: Record<string, string> = {
  "car": "መኪና",
  "automobile": "መኪና",
  "bajaj": "ባጃጅ",
  "tuktuk": "ባጃጅ",
  "bike": "ሞተር ሳይክል",
  "motorcycle": "ሞተር ሳይክል",
  "foot": "እግር ጉዞ",
  "walking": "እግር ጉዞ",
  "truck": "ከባድ መኪና",
  "any": "ማንኛውም ተሽከርካሪ",
};

const LANDMARK_NAME_DICTIONARY: Record<string, string> = {
  "meskel square": "መስቀል አደባባይ",
  "bole international airport": "ቦሌ ዓለም አቀፍ አውሮፕላን ማረፊያ",
  "bole airport": "ቦሌ አውሮፕላን ማረፊያ",
  "bole medhanialem": "ቦሌ መድኃኔዓለም",
  "piassa": "ፒያሳ",
  "arada": "አራዳ",
  "kazanchis": "ካዛንቺስ",
  "megenagna": "መገናኛ",
  "mexico square": "ሜክሲኮ አደባባይ",
  "gotera interchange": "የጎተራ ማዞሪያ",
  "gotera": "ጎተራ",
  "merkato": "መርካቶ",
  "fasil ghebbi": "ፋሲል ግቢ",
  "arada post office": "አራዳ ፖስታ ቤት",
  "piassa gondar": "ፒያሳ ጎንደር",
  "kebele 18": "ቀበሌ 18",
  "azezo bridge": "የአዘዞ ድልድይ",
  "azezo airport": "አዘዞ አውሮፕላን ማረፊያ",
  "goha hotel": "ጎሃ ሆቴል",
  "maraki university": "ማራኪ ዩኒቨርሲቲ",
  "debre zeit road": "ደብረ ዘይት መንገድ",
  "africa avenue": "አፍሪካ ጎዳና (ቦሌ መንገድ)",
  "churchill avenue": "ቸርችል ጎዳና",
  "ring road": "ቀለበት መንገድ",
};

export class EthiopianTranslator {
  /**
   * Resolves target language from URL query, HTTP headers, or JSON body.
   */
  public static resolveLanguage(req: RequestLike): SupportedLanguage {
    // 1. URL Query Parameter (?lang=am, ?l=am, ?language=am)
    const q = req.query?.lang || req.query?.l || req.query?.language;
    if (q) {
      const val = q.toString().toLowerCase().trim();
      if (val === "am" || val === "amh" || val === "amharic") return "am";
      if (val === "en" || val === "eng" || val === "english") return "en";
    }

    // 2. HTTP Headers (x-lang, accept-language)
    const xLang = req.headers?.["x-lang"] || req.headers?.["x-language"];
    if (xLang) {
      const val = xLang.toString().toLowerCase().trim();
      if (val === "am" || val === "amh" || val === "amharic") return "am";
      if (val === "en" || val === "eng" || val === "english") return "en";
    }

    const acceptLang = req.headers?.["accept-language"];
    if (acceptLang) {
      const str = acceptLang.toString().toLowerCase();
      if (str.startsWith("am") || str.includes(",am") || str.includes("am-") || str.includes("am;")) {
        return "am";
      }
    }

    // 3. Request Body ({ "lang": "am" }, { "language": "am" })
    const b = req.body?.lang || req.body?.language;
    if (b) {
      const val = b.toString().toLowerCase().trim();
      if (val === "am" || val === "amh" || val === "amharic") return "am";
      if (val === "en" || val === "eng" || val === "english") return "en";
    }

    return "en";
  }

  public static translateCity(city?: string | null, lang: SupportedLanguage = "en"): string {
    if (!city) return lang === "am" ? "ኢትዮጵያ" : "Ethiopia";
    if (lang === "en") return city;
    const key = city.toLowerCase().trim();
    return CITY_TRANSLATIONS[key] || city;
  }

  public static translateSubcity(subcity?: string | null, lang: SupportedLanguage = "en"): string {
    if (!subcity) return "";
    if (lang === "en") return subcity;
    const key = subcity.toLowerCase().trim();
    return SUBCITY_TRANSLATIONS[key] || subcity;
  }

  public static translateCategory(category?: string | null, lang: SupportedLanguage = "en"): string {
    if (!category) return lang === "am" ? "ቦታ" : "Place";
    if (lang === "en") return category;
    const key = category.toLowerCase().trim();
    return CATEGORY_TRANSLATIONS[key] || category;
  }

  public static translateVehicle(vehicle?: string | null, lang: SupportedLanguage = "en"): string {
    if (!vehicle) return lang === "am" ? "መኪና" : "Car";
    if (lang === "en") return vehicle;
    const key = vehicle.toLowerCase().trim();
    return VEHICLE_TRANSLATIONS[key] || vehicle;
  }

  public static translatePlaceName(name?: string | null, lang: SupportedLanguage = "en"): string {
    if (!name) return "";
    if (lang === "en") return name;
    const key = name.toLowerCase().trim();
    return LANDMARK_NAME_DICTIONARY[key] || name;
  }

  public static formatDistance(meters: number, lang: SupportedLanguage = "en"): string {
    if (meters < 1000) {
      const m = Math.round(meters);
      return lang === "am" ? `${m} ሜትር` : `${m} m`;
    }
    const km = (meters / 1000).toFixed(1);
    return lang === "am" ? `${km} ኪ.ሜ` : `${km} km`;
  }

  public static formatDuration(seconds: number, lang: SupportedLanguage = "en"): string {
    if (seconds < 60) {
      const s = Math.round(seconds);
      return lang === "am" ? `${s} ሰከንድ` : `${s} sec`;
    }
    const mins = Math.round(seconds / 60);
    if (mins < 60) {
      return lang === "am" ? `${mins} ደቂቃ` : `${mins} min${mins > 1 ? "s" : ""}`;
    }
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (remMins === 0) {
      return lang === "am" ? `${hrs} ሰዓት` : `${hrs} hr${hrs > 1 ? "s" : ""}`;
    }
    return lang === "am"
      ? `${hrs} ሰዓት ከ${remMins} ደቂቃ`
      : `${hrs} hr ${remMins} min${remMins > 1 ? "s" : ""}`;
  }

  public static formatAddress(
    components: {
      street?: string | null;
      building?: string | null;
      subcity?: string | null;
      city?: string | null;
      country?: string | null;
    },
    lang: SupportedLanguage = "en"
  ): string {
    if (lang === "am") {
      const parts = [
        components.building,
        components.street ? (components.street.includes("መንገድ") ? components.street : `${components.street} መንገድ`) : null,
        this.translateSubcity(components.subcity, "am"),
        this.translateCity(components.city, "am"),
        "ኢትዮጵያ",
      ].filter(Boolean);
      return parts.join("፣ ");
    }

    const parts = [
      components.building,
      components.street,
      components.subcity,
      components.city,
      components.country || "Ethiopia",
    ].filter(Boolean);
    return parts.join(", ");
  }
}
