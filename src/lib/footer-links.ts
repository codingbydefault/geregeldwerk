export type FooterLink = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
};

export type FooterGroup = {
  title: string;
  links: FooterLink[];
};

export const footerGroups: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/" },
      { label: "Naar de app", href: "/app" },
      { label: "Prijzen", href: "/#prijzen" },
      { label: "Early access", href: "/#wachtlijst" },
    ],
  },
  {
    title: "Juridisch",
    links: [
      { label: "Privacyverklaring", href: "/privacy" },
      { label: "Algemene voorwaarden", href: "/algemene-voorwaarden" },
    ],
  },
  {
    title: "Technologie en standaarden",
    links: [
      { label: "Peppol", href: "https://peppol.org/", description: "BIS Billing 3.0" },
      { label: "Ollama", href: "https://ollama.com/", description: "Lokale AI", icon: "/ollama.png" },
    ],
  },
];
