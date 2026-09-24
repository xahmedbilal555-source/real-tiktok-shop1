import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CONTACT_EMAIL,
  copyToClipboard,
  launchPaymentApp,
  openGmail,
  openWhatsApp,
  type PaymentAppInfo,
} from "./utils/launch";

type RegionAccount = {
  flag: string;
  name: string;
  price: number;
  demand: "High" | "Medium";
  focus: string;
  governmentDeviceRestriction: boolean;
};

const regions: RegionAccount[] = [
  { flag: "🇬🇧", name: "United Kingdom", price: 1900, demand: "High", focus: "Top-tier buyer trust and strong monetization value", governmentDeviceRestriction: true },
  { flag: "🇦🇪", name: "UAE", price: 1700, demand: "High", focus: "High-value buyer traffic", governmentDeviceRestriction: false },
  { flag: "🇨🇦", name: "Canada", price: 1600, demand: "High", focus: "Reliable creator monetization niche", governmentDeviceRestriction: true },
  { flag: "🇯🇵", name: "Japan", price: 1800, demand: "High", focus: "Premium CPM and quality traffic", governmentDeviceRestriction: false },
  { flag: "🇫🇷", name: "France", price: 1650, demand: "High", focus: "EU creator audience and brand reach", governmentDeviceRestriction: true },
  { flag: "🇳🇱", name: "Netherlands", price: 1700, demand: "High", focus: "Strong conversion and ad quality", governmentDeviceRestriction: true },
  { flag: "🇦🇺", name: "Australia", price: 1680, demand: "High", focus: "High purchasing-power market", governmentDeviceRestriction: true },
  { flag: "🇰🇷", name: "South Korea", price: 1850, demand: "High", focus: "Strong short-form engagement market", governmentDeviceRestriction: false },
  { flag: "🇧🇷", name: "Brazil", price: 1480, demand: "High", focus: "Massive active TikTok user base", governmentDeviceRestriction: false },
  { flag: "🇳🇴", name: "Norway", price: 1550, demand: "Medium", focus: "Stable EU audience targeting", governmentDeviceRestriction: true },
  { flag: "🇻🇳", name: "Vietnam", price: 1450, demand: "Medium", focus: "Fast growth commerce audience", governmentDeviceRestriction: false },
  { flag: "🇮🇹", name: "Italy", price: 1500, demand: "Medium", focus: "Lifestyle and retail friendly region", governmentDeviceRestriction: false },
  { flag: "🇹🇷", name: "Turkey", price: 1400, demand: "Medium", focus: "High daily watch-time audience", governmentDeviceRestriction: false },
  { flag: "🇬🇷", name: "Greece", price: 1300, demand: "Medium", focus: "Emerging regional creator demand", governmentDeviceRestriction: false },
  { flag: "🇧🇬", name: "Bulgaria", price: 1200, demand: "Medium", focus: "Budget-friendly EU entry", governmentDeviceRestriction: false },
  { flag: "🇦🇿", name: "Azerbaijan", price: 1250, demand: "Medium", focus: "Growing local creator market", governmentDeviceRestriction: false },
  { flag: "🇹🇭", name: "Thailand", price: 1500, demand: "Medium", focus: "Shopping and affiliate traction", governmentDeviceRestriction: false },
  { flag: "🇿🇦", name: "South Africa", price: 1350, demand: "Medium", focus: "Growing English market audience", governmentDeviceRestriction: false },
  { flag: "🇪🇸", name: "Spain", price: 1580, demand: "High", focus: "Wide entertainment audience", governmentDeviceRestriction: false },
  { flag: "🇰🇿", name: "Kazakhstan", price: 1280, demand: "Medium", focus: "Underserved growth market", governmentDeviceRestriction: false },
];

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Accounts", href: "#accounts" },
  { label: "Payments", href: "#payments" },
  { label: "Contact", href: "#contact" },
];

const paymentMethods: PaymentAppInfo[] = [
  {
    name: "SadaPay",
    number: "03335265823",
    note: "Send transaction ID to verify payment quickly.",
    androidPackage: "com.sadapay.app",
    iosScheme: "sadapay://",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.sadapay.app",
    appStoreUrl: "https://apps.apple.com/app/id1543848524",
  },
  {
    name: "JazzCash",
    number: "03195008491",
    note: "Send transaction ID to verify payment quickly.",
    androidPackage: "com.techlogix.mobilinkcustomer",
    iosScheme: "jazzcash://",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.techlogix.mobilinkcustomer",
    appStoreUrl: "https://apps.apple.com/app/id1224617688",
  },
  {
    name: "EasyPaisa",
    number: "03195008491",
    note: "Use the same buyer name for faster confirmation.",
    androidPackage: "pk.com.telenor.phoenix",
    iosScheme: "easypaisa://",
    playStoreUrl: "https://play.google.com/store/apps/details?id=pk.com.telenor.phoenix",
    appStoreUrl: "https://apps.apple.com/app/id1227725092",
  },
];

type PolicyKey = "privacy" | "terms" | "refund";

const policyContent: Record<PolicyKey, { title: string; paragraphs: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    paragraphs: [
      "We only collect information you submit through inbox, WhatsApp, or the contact form including your name, email address, preferred region, and purchase message.",
      "This data is used only for order handling, account delivery, payment verification, and support. We do not sell your personal data to any third party.",
      "Payment screenshots are used for verification and record purposes. If you want your data removed after order completion, contact us at xahmedbilal555@gmail.com.",
    ],
  },
  terms: {
    title: "Terms of Service",
    paragraphs: [
      "By placing an order, you confirm that you understand the account details, pricing, and delivery process before payment.",
      "After payment, you must provide one Gmail address so the purchased TikTok account can be securely transferred to you.",
      "Buyers must submit valid payment proof and cooperate during verification. Any false claim or fake payment proof can lead to immediate order cancellation.",
    ],
  },
  refund: {
    title: "No Refund Policy",
    paragraphs: [
      "All sales are final. Once payment is confirmed and account delivery process has started, refunds are not available.",
      "If a technical delivery issue happens from our side, we will resolve it by replacement or correction, not cash refund.",
    ],
  },
};

export default function App() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedRegionName, setSelectedRegionName] = useState(regions[0].name);
  const [regionQuery, setRegionQuery] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "", website: "" });
  const [lastInquiryAt, setLastInquiryAt] = useState<number>(0);
  const selectedRegion =
    regions.find((region) => region.name === selectedRegionName) ?? regions[0];

  const filteredRegions = useMemo(() => {
    const query = regionQuery.trim().toLowerCase();
    if (!query) return regions;
    return regions.filter((region) => region.name.toLowerCase().includes(query));
  }, [regionQuery]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const preferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : preferDark;
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const shouldShow = window.scrollY > 280;
        setShowBackToTop((prev) => (prev === shouldShow ? prev : shouldShow));
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!activePolicy) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePolicy(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [activePolicy]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 4000);
  };

  const handleCopy = async (num: string) => {
    await copyToClipboard(num);
    setCopiedNumber(num);
    showToast(`Number ${num} copied to clipboard!`);
    setTimeout(() => {
      setCopiedNumber((current) => (current === num ? null : current));
    }, 2500);
  };

  const handleLaunchPayment = async (method: PaymentAppInfo) => {
    await launchPaymentApp(method, (msg) => showToast(msg));
  };

  const cleanInput = (value: string, maxLength: number) =>
    value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);

  const handleInquirySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Honeypot: blocks common form bots filling hidden fields.
    if (contactForm.website) {
      showToast("Request blocked. Please try again.");
      return;
    }

    const now = Date.now();
    if (now - lastInquiryAt < 20000) {
      showToast("Please wait 20 seconds before sending another inquiry.");
      return;
    }

    const safeName = cleanInput(contactForm.name, 80);
    const safeEmail = cleanInput(contactForm.email, 120);
    const safeMessage = cleanInput(contactForm.message, 1200);

    if (!safeName || !safeEmail || !safeMessage) {
      showToast("Please complete all fields before sending.");
      return;
    }

    openGmail(
      "TikTok Account Purchase Inquiry",
      `Hello,\n\nName: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${safeMessage}\n`
    );

    setLastInquiryAt(now);
    showToast("Opening secure Gmail compose...");
  };

  return (
    <div className="bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.14),transparent_38%),radial-gradient(circle_at_85%_5%,rgba(30,64,175,0.12),transparent_35%),linear-gradient(to_bottom,#f8fafc,#ffffff,#eff6ff)] font-sans text-black">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-black/85">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 text-sm sm:px-6 md:px-8">
          <a href="#home" className="text-sm font-bold tracking-wide text-white sm:text-base">
            TikTok Verified Market
          </a>
          <div className="flex items-center gap-2 sm:gap-4">
            <ul className="flex items-center gap-4 overflow-x-auto text-xs sm:gap-6 sm:text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <a className="text-white/85 transition hover:text-blue-300" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
            </ul>
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="rounded-md border border-white/30 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:border-blue-300 hover:text-blue-200 sm:px-3 sm:text-xs"
            >
              {isDarkMode ? "Light" : "Dark"}
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section id="home" className="relative min-h-screen overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1920&q=80"
            alt="Person managing social media content on a phone"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 pt-24 pb-18 sm:px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-3xl space-y-5"
            >
              <p className="text-sm font-semibold tracking-[0.18em] text-blue-300">Trusted Digital Assets</p>
              <h1 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl md:text-6xl">
                🔥 Fresh TikTok Accounts for Sale
              </h1>
              <p className="max-w-2xl text-base text-white/90 sm:text-lg md:text-xl">
                Verified accounts with TikTok Shop, LIVE, and Creator Rewards enabled.
              </p>
              <div>
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-7 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
                >
                  Inbox to Buy Now
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="accounts" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-black md:text-4xl">Accounts by Region</h2>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
            <aside className="order-2 rounded-lg border border-zinc-200 bg-white p-3 lg:order-1">
              <p className="px-2 py-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                Region Options ({filteredRegions.length})
              </p>
              <div className="px-2 pb-2">
                <input
                  type="search"
                  value={regionQuery}
                  onChange={(event) => setRegionQuery(event.target.value)}
                  placeholder="Search country..."
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-blue-500"
                />
              </div>
              <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1 sm:max-h-[420px] lg:max-h-[520px]">
                {filteredRegions.map((region) => {
                  const isActive = selectedRegionName === region.name;
                  return (
                    <button
                      key={region.name}
                      type="button"
                      onClick={() => setSelectedRegionName(region.name)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm transition ${
                        isActive ? "bg-blue-600 text-white" : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      <span>
                        <span className="mr-2" aria-hidden="true">
                          {region.flag}
                        </span>
                        {region.name}
                      </span>
                      <span className={`text-xs font-semibold ${isActive ? "text-blue-100" : "text-zinc-500"}`}>
                        ₨{region.price}
                      </span>
                    </button>
                  );
                })}
                {filteredRegions.length === 0 && (
                  <p className="px-3 py-3 text-sm text-zinc-500">No region found for this search.</p>
                )}
              </div>
            </aside>

            <motion.article
              key={selectedRegion.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="order-1 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 lg:order-2"
            >
              <h3 className="text-2xl font-bold text-black">
                <span className="mr-2" aria-hidden="true">
                  {selectedRegion.flag}
                </span>
                {selectedRegion.name}
              </h3>

              <p className="mt-2 text-sm text-zinc-700">Market focus: {selectedRegion.focus}</p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Account Specs</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
                    <li>TikTok Shop enabled (region-supported setup)</li>
                    <li>LIVE streaming unlocked</li>
                    <li>Creator Rewards active (eligible account)</li>
                    <li>Email + phone secured handover</li>
                    <li>2FA-ready transfer process</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Pricing</p>
                  <p className="mt-2 text-xl font-bold text-black">Price: ₨{selectedRegion.price}</p>
                  <p className="mt-2 text-sm font-semibold text-blue-700">Fresh Account - Ready to Use</p>
                  <p className="mt-1 text-xs text-zinc-500">Prices may vary depending on demand</p>
                  <p className="mt-3 text-xs font-semibold text-zinc-600">Demand level: {selectedRegion.demand}</p>
                </div>
              </div>

              <p className="mt-6 text-xs text-zinc-600">
                TikTok status: {selectedRegion.governmentDeviceRestriction
                  ? "Publicly available, but some official government devices in this region have TikTok restrictions."
                  : "Publicly available with no full nationwide ban reported in this region."}
              </p>

              <a
                href="#payments"
                className="mt-5 inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Continue to Payment Methods
              </a>
            </motion.article>
          </div>

        </section>

        <section id="payments" className="border-t border-zinc-200/80 bg-white/85">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-black md:text-4xl">Payment Methods</h2>
              <p className="text-zinc-700">We accept secure local wallet payments. Send payment screenshot after checkout confirmation.</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div>
                    <h3 className="text-base font-bold text-black">{method.name}</h3>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xl font-extrabold tracking-wide text-blue-700">
                        {method.number}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(method.number)}
                        className="rounded border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
                        title="Copy account number"
                      >
                        {copiedNumber === method.number ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{method.note}</p>
                  </div>
                  <div className="mt-5 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchPayment(method)}
                      className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
                    >
                      Open {method.name} App
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="verification" className="border-t border-zinc-200/80 bg-slate-50/80">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-black md:text-4xl">Purchase Verification</h2>
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  "Hello, I have completed my payment. Here is my payment screenshot for purchase verification."
                )
              }
              className="mt-4 block text-2xl font-bold text-blue-700 underline underline-offset-4 transition hover:text-blue-600"
            >
              923195008491
            </button>
            <p className="mt-3 text-sm text-zinc-700">
              For purchase verification send screenshot of payment on this number.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  openWhatsApp(
                    "Hello, I have completed my payment. Here is my payment screenshot for purchase verification."
                  )
                }
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
              >
                Verify on WhatsApp
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  openGmail(
                    "TikTok Account Purchase Verification",
                    "Hello,\n\nI have completed my payment. Payment screenshot is attached for verification.\n\nRegion / Account:\nAmount Paid:\nPayment Method:\n"
                  )
                }
                className="inline-flex w-full justify-center rounded-md border border-blue-600 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:w-auto"
              >
                Verify via Gmail ({CONTACT_EMAIL})
              </motion.button>
            </div>

          </div>
        </section>

        <section id="contact" className="border-t border-zinc-200/80 bg-white/85">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:px-8 md:py-20">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-black md:text-4xl">For Purchase, Inbox Us Directly</h2>
              <p className="text-zinc-700">Share your preferred region and we will reply with current availability and checkout details.</p>
              <p className="text-sm font-medium text-zinc-900">
                Direct email:{" "}
                <button
                  type="button"
                  onClick={() =>
                    openGmail(
                      "TikTok Account Purchase Inquiry",
                      "Hello,\n\nI am interested in buying a verified TikTok account.\n\nPreferred Region:\nBudget:\n"
                    )
                  }
                  className="text-blue-700 underline underline-offset-2 transition hover:text-blue-600"
                >
                  {CONTACT_EMAIL}
                </button>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleInquirySubmit} noValidate>
              <input
                type="text"
                name="website"
                value={contactForm.website}
                onChange={(event) =>
                  setContactForm((prev) => ({
                    ...prev,
                    website: event.target.value,
                  }))
                }
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-800">Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  value={contactForm.name}
                  onChange={(event) =>
                    setContactForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  autoComplete="name"
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-800">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={contactForm.email}
                  onChange={(event) =>
                    setContactForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  autoComplete="email"
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-800">Message</span>
                <textarea
                  name="message"
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(event) =>
                    setContactForm((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </label>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Send Message
              </motion.button>
            </form>
          </div>
        </section>

        <footer className="border-t border-zinc-900 bg-zinc-950">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm text-zinc-300 sm:px-6 md:flex-row md:px-8 md:text-left">
            <p>© {new Date().getFullYear()} TikTok Verified Market</p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
              <button
                type="button"
                onClick={() => setActivePolicy("privacy")}
                className="text-zinc-200 transition hover:text-blue-300"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActivePolicy("terms")}
                className="text-zinc-200 transition hover:text-blue-300"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActivePolicy("refund")}
                className="text-zinc-200 transition hover:text-blue-300"
              >
                No Refund Policy
              </button>
            </div>
          </div>
        </footer>
      </main>

      {activePolicy && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-title"
          onClick={() => setActivePolicy(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id="policy-title" className="text-2xl font-bold text-black">
                {policyContent[activePolicy].title}
              </h3>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-700">
              {policyContent[activePolicy].paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 z-[70] -translate-x-1/2 max-w-[92vw] rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-2xl border border-zinc-700"
        >
          {toastMessage}
        </motion.div>
      )}

      {showBackToTop && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed left-5 bottom-5 z-50 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
        >
          Back to Top
        </motion.button>
      )}
    </div>
  );
}
