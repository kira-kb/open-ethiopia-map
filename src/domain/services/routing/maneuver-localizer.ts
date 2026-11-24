export interface ManeuverInfo {
  type: string;
  modifier?: string;
  name?: string;
}

export class ManeuverLocalizer {
  public static format(maneuver: ManeuverInfo, lang: "en" | "am" = "en"): string {
    const type = (maneuver.type || "").toLowerCase().trim();
    const modifier = (maneuver.modifier || "").toLowerCase().trim();
    const roadName = (maneuver.name || "").trim();

    if (lang === "am") {
      return this.formatAmharic(type, modifier, roadName);
    }
    return this.formatEnglish(type, modifier, roadName);
  }

  private static formatEnglish(type: string, modifier: string, roadName: string): string {
    const onRoad = roadName ? ` on ${roadName}` : "";

    switch (type) {
      case "depart":
        return `Start${onRoad}`;
      case "arrive":
        return "You have arrived at your destination";
      case "turn":
        return `Turn ${modifier || "ahead"}${onRoad}`;
      case "new name":
      case "continue":
        return `Continue straight${onRoad}`;
      case "roundabout":
      case "rotary":
        return `Enter roundabout and take exit${onRoad}`;
      case "fork":
        return `Take the ${modifier || "road"} fork${onRoad}`;
      case "end of road":
        return `At the end of the road, turn ${modifier || "ahead"}${onRoad}`;
      case "merge":
        return `Merge ${modifier || "ahead"}${onRoad}`;
      default:
        return `${type} ${modifier}${onRoad}`.trim();
    }
  }

  private static formatAmharic(type: string, modifier: string, roadName: string): string {
    const onRoad = roadName ? ` በ${roadName}` : "";

    switch (type) {
      case "depart":
        return roadName ? `በ${roadName} ጉዞ ይጀምሩ` : "ጉዞ ይጀምሩ";

      case "arrive":
        return "መድረሻዎ ደርሰዋል";

      case "turn": {
        let dir = "";
        if (modifier === "left") dir = "በግራ ታጠፍ";
        else if (modifier === "right") dir = "በቀኝ ታጠፍ";
        else if (modifier.includes("sharp left")) dir = "በጣም ወደ ግራ ታጠፍ";
        else if (modifier.includes("sharp right")) dir = "በጣም ወደ ቀኝ ታጠፍ";
        else if (modifier.includes("slight left")) dir = "ትንሽ ወደ ግራ ታጠፍ";
        else if (modifier.includes("slight right")) dir = "ትንሽ ወደ ቀኝ ታጠፍ";
        else if (modifier.includes("uturn") || modifier.includes("u-turn")) dir = "የዩ-ቅርጽ መታጠፊያ (U-turn) አድርግ";
        else dir = "ታጠፍ";

        return `${dir}${onRoad}`;
      }

      case "new name":
      case "continue":
        return roadName ? `በ${roadName} ቀጥታ ይቀጥሉ` : "ቀጥታ ይቀጥሉ";

      case "roundabout":
      case "rotary":
        return `በአደባባዩ በኩል ይለፉ${onRoad}`;

      case "fork": {
        const side = modifier.includes("left") ? "በግራ በኩል" : "በቀኝ በኩል";
        return `ከመንታ መንገዱ ${side} ያዙ${onRoad}`;
      }

      case "end of road": {
        const side = modifier.includes("left") ? "በግራ" : "በቀኝ";
        return `የመንገዱ መጨረሻ ላይ ${side} ታጠፍ${onRoad}`;
      }

      default:
        return roadName ? `በ${roadName} ይቀጥሉ` : "ቀጥታ ይቀጥሉ";
    }
  }
}
