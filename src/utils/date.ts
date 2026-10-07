const TIMEZONE_IST = "Asia/Kolkata";

const getISTDateKey = (d: Date): string => {
  return d.toLocaleDateString("en-CA", { timeZone: TIMEZONE_IST });
};


export const formatLastSeen = (timestamp?: string | null): string => {
  if (!timestamp) return "Offline";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Offline";

    const now = new Date();
    const todayKey = getISTDateKey(now);
    const dateKey = getISTDateKey(date);

    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayKey = getISTDateKey(yesterday);

    const timeStr = date.toLocaleTimeString("en-IN", {
      timeZone: TIMEZONE_IST,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (dateKey === todayKey) {
      return `Last seen today at ${timeStr}`;
    }

    if (dateKey === yesterdayKey) {
      return `Last seen yesterday at ${timeStr}`;
    }

    const dateStr = date.toLocaleDateString("en-IN", {
      timeZone: TIMEZONE_IST,
      month: "short",
      day: "numeric",
    });

    return `Last seen ${dateStr} at ${timeStr}`;
  } catch {
    return "Offline";
  }
};


export const formatLastSeenCompact = (timestamp?: string | null): string => {
  if (!timestamp) return "Offline";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Offline";

    const now = new Date();
    const todayKey = getISTDateKey(now);
    const dateKey = getISTDateKey(date);

    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayKey = getISTDateKey(yesterday);

    if (dateKey === todayKey) {
      return date.toLocaleTimeString("en-IN", {
        timeZone: TIMEZONE_IST,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (dateKey === yesterdayKey) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-IN", {
      timeZone: TIMEZONE_IST,
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Offline";
  }
};


export const formatMessageTime = (timestamp: string | Date): string => {
  try {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    if (isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-IN", {
      timeZone: TIMEZONE_IST,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};


export const formatJoinDate = (timestamp?: string | null): string => {
  if (!timestamp) {
    const now = new Date();
    return now.toLocaleDateString("en-IN", {
      timeZone: TIMEZONE_IST,
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString("en-IN", {
        timeZone: TIMEZONE_IST,
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("en-IN", {
      timeZone: TIMEZONE_IST,
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("en-IN", {
      timeZone: TIMEZONE_IST,
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
};
