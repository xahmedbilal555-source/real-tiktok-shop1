export const WHATSAPP_NUMBER = "923195008491";
export const CONTACT_EMAIL = "xahmedbilal555@gmail.com";

const getUA = () => (typeof navigator === "undefined" ? "" : navigator.userAgent || "");

export const isIOS = () => {
  const ua = getUA();
  const iOSDevice = /iPad|iPhone|iPod/i.test(ua);
  const iPadOS = /Macintosh/i.test(ua) && typeof document !== "undefined" && "ontouchend" in document;
  return iOSDevice || iPadOS;
};

export const isAndroid = () => /Android/i.test(getUA());

export const isMobile = () => isIOS() || isAndroid();

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    if (typeof document !== "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      textArea.remove();
      return successful;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Tries a native app deep link first and falls back to a web URL
 * if the app did not take over the browser window.
 */
const openWithFallback = (appUrl: string, webUrl: string, delay = 1500) => {
  if (typeof window === "undefined") return;

  let didHide = false;
  const onVisibility = () => {
    if (document.visibilityState === "hidden") didHide = true;
  };
  const onBlur = () => {
    didHide = true;
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("blur", onBlur);
  window.addEventListener("pagehide", onBlur);

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = appUrl;
  document.body.appendChild(iframe);

  // Direct navigation attempt (needed on iOS / Android Chrome).
  try {
    window.location.href = appUrl;
  } catch {
    /* scheme not supported - fallback will handle it */
  }

  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("pagehide", onBlur);
    iframe.remove();

    if (!didHide && document.visibilityState === "visible") {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }
  }, delay);
};

/**
 * Android / iOS  -> WhatsApp mobile app
 * Windows/Linux  -> WhatsApp Desktop (Microsoft Store / native) else WhatsApp Web
 */
export const openWhatsApp = (message: string) => {
  const text = encodeURIComponent(message);
  const appUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${text}`;

  if (isMobile()) {
    openWithFallback(appUrl, `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`);
    return;
  }

  openWithFallback(appUrl, `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${text}`);
};

/**
 * Android -> Gmail app (intent), iOS -> Gmail app scheme,
 * Desktop (Windows/Linux/macOS) -> Gmail web compose window.
 */
export const openGmail = (subject: string, body: string) => {
  const su = encodeURIComponent(subject);
  const bd = encodeURIComponent(body);

  const gmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${CONTACT_EMAIL}&su=${su}&body=${bd}`;
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${su}&body=${bd}`;

  if (isAndroid()) {
    const intentUrl =
      `intent://compose?to=${CONTACT_EMAIL}&subject=${su}&body=${bd}` +
      `#Intent;scheme=googlegmail;package=com.google.android.gm;S.browser_fallback_url=${encodeURIComponent(
        gmailWeb
      )};end`;
    openWithFallback(intentUrl, mailto);
    return;
  }

  if (isIOS()) {
    openWithFallback(`googlegmail:///co?to=${CONTACT_EMAIL}&subject=${su}&body=${bd}`, mailto);
    return;
  }

  window.open(gmailWeb, "_blank", "noopener,noreferrer");
};

export type PaymentAppInfo = {
  name: string;
  number: string;
  note: string;
  androidPackage: string;
  iosScheme: string;
  playStoreUrl: string;
  appStoreUrl: string;
};

export const launchPaymentApp = async (
  method: PaymentAppInfo,
  onNotify?: (msg: string) => void
) => {
  // Always copy number first so user has it ready
  await copyToClipboard(method.number);

  if (isAndroid()) {
    onNotify?.(`Copied ${method.number}! Opening ${method.name} app on phone...`);
    let didHide = false;
    const handleHide = () => {
      didHide = true;
    };

    document.addEventListener("visibilitychange", handleHide);
    window.addEventListener("blur", handleHide);
    window.addEventListener("pagehide", handleHide);

    const scheme = method.iosScheme.replace("://", "");

    // Chrome on older Android versions is more reliable with a complete intent URL.
    const intentUrl = `intent://launch/#Intent;scheme=${scheme};package=${method.androidPackage};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`;
    window.location.href = intentUrl;

    // Second attempt through custom scheme for apps that register only scheme handlers.
    window.setTimeout(() => {
      if (!didHide && document.visibilityState === "visible") {
        window.location.href = method.iosScheme;
      }
    }, 1200);

    // Final fallback: only when app did not open. Use market:// first for Play Store app.
    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", handleHide);
      window.removeEventListener("blur", handleHide);
      window.removeEventListener("pagehide", handleHide);

      if (!didHide && document.visibilityState === "visible") {
        const marketUrl = `market://details?id=${method.androidPackage}`;
        window.location.href = marketUrl;

        // If Play Store app route is unavailable, fallback to web Play Store.
        window.setTimeout(() => {
          if (document.visibilityState === "visible") {
            window.location.href = method.playStoreUrl;
          }
        }, 700);
      }
    }, 3000);
    return;
  }

  if (isIOS()) {
    onNotify?.(`Copied ${method.number}! Opening ${method.name} app...`);
    // iOS custom scheme opens the installed app
    let didHide = false;
    const handleHide = () => {
      didHide = true;
    };
    window.addEventListener("blur", handleHide, { once: true });
    window.addEventListener("pagehide", handleHide, { once: true });

    window.location.href = method.iosScheme;

    window.setTimeout(() => {
      if (!didHide && document.visibilityState === "visible") {
        // Only if app not installed on iPhone, open App Store (NOT website)
        window.location.href = method.appStoreUrl;
      }
    }, 2200);
    return;
  }

  // Windows / Linux / macOS (Desktop)
  onNotify?.(
    `Copied ${method.number}! Please open ${method.name} on your smartphone to complete the transfer.`
  );
};
