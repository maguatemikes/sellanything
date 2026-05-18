import {Link} from 'react-router';

/**
 * Dark footer with 5 content columns + bottom strip.
 * Content adapted from the WholesaleForEveryone reference; styling stays
 * with the existing Tailwind utility classes used across the app.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white px-9 pt-16 pb-6 mt-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-12 max-w-[1600px] mx-auto">
        <FooterCol title="About">
          <FooterLink to="/pages/about">About us</FooterLink>
          <FooterLink to="#">Contact us</FooterLink>
          <FooterLink to="#">Customer Help</FooterLink>
          <FooterLink to="/policies/privacy-policy">Privacy Policy</FooterLink>
          <FooterLink to="#">Returns &amp; Refund</FooterLink>
          <FooterLink to="#">Rewards</FooterLink>
          <FooterLink to="#">Deals</FooterLink>
          <FooterLink to="#">Discounts</FooterLink>
          <FooterLink to="/account">My account</FooterLink>
        </FooterCol>

        <FooterCol title="Partner with us">
          <FooterLink to="#">Become a Dropshipper</FooterLink>
          <FooterLink to="#">Become a Dealer</FooterLink>
          <FooterLink to="#">Guest Posting</FooterLink>
        </FooterCol>

        <FooterCol title="Contact info">
          <a
            href="mailto:info@sellanything.us"
            className="block text-neutral-400 text-[13px] mb-2 hover:text-white transition-colors underline underline-offset-2"
          >
            Email us
          </a>
          <p className="text-[13px] text-white mb-3 break-words">
            info@sellanything.us
          </p>
          <p className="text-[13px] text-neutral-400 mb-1">
            <a href="#" className="underline underline-offset-2 hover:text-white">PO Box</a>{' '}
            <span className="text-white">275 Hainesport, NJ 08036</span>
          </p>
          <a
            href="tel:8003551131"
            className="block text-[13px] text-neutral-400 mt-2 hover:text-white transition-colors underline underline-offset-2"
          >
            Call us: 800-355-1131
          </a>
        </FooterCol>

        <FooterCol title="Blog">
          <FooterLink to="/blogs/journal">Blogs</FooterLink>
        </FooterCol>

        <FooterCol title="Location">
          <p className="text-[13px] text-white">
            2402 Sylon Blvd
            <br />
            Hainesport NJ 08036
          </p>
        </FooterCol>
      </div>

      <div className="border-t border-neutral-700 pt-6 flex justify-between items-center flex-wrap gap-4 text-xs text-neutral-500 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            aria-label="Country/region"
            className="bg-transparent border border-neutral-700 rounded-md px-3 py-1.5 text-neutral-300 text-xs"
            defaultValue="US"
          >
            <option value="US">United States (USD $)</option>
            <option value="PH">Philippines (PHP ₱)</option>
            <option value="CA">Canada (CAD $)</option>
            <option value="GB">United Kingdom (GBP £)</option>
          </select>
          <span>© {year} sellanything.us</span>
          <span className="mx-1">·</span>
          <span>Powered by Shopify</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-neutral-400">We accept</span>
          <PaymentIcons />
        </div>
      </div>

      <div className="border-t border-neutral-800 mt-4 pt-4 flex gap-4 flex-wrap text-xs max-w-[1600px] mx-auto">
        <FooterLink to="#" muted>Guides</FooterLink>
        <FooterLink to="/policies/terms-of-service" muted>Terms of Sale</FooterLink>
        <FooterLink to="#" muted>Terms of Use</FooterLink>
        <FooterLink to="/policies/privacy-policy" muted>Privacy Policy</FooterLink>
        <FooterLink to="#" muted>Privacy Settings</FooterLink>
      </div>
    </footer>
  );
}

function FooterCol({title, children}) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-widest font-medium mb-4">
        {title}
      </h4>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function FooterLink({to, children, muted}) {
  const base = muted
    ? 'text-neutral-500 hover:text-white'
    : 'block text-neutral-400 text-[13px] mb-2 hover:text-white transition-colors';
  return (
    <Link to={to} className={base}>
      {children}
    </Link>
  );
}

/**
 * Inline SVG payment-method icons. Keeps the footer self-contained (no
 * external image dependencies).
 */
function PaymentIcons() {
  const cards = [
    {label: 'Amex', bg: '#016FD0', text: 'AMEX'},
    {label: 'Apple Pay', bg: '#000', text: 'Pay'},
    {label: 'Diners', bg: '#0079BE', text: 'DC'},
    {label: 'Discover', bg: '#F7941D', text: 'DISC'},
    {label: 'Google Pay', bg: '#fff', text: 'GPay', color: '#000'},
    {label: 'Mastercard', bg: '#EB001B', text: 'MC'},
    {label: 'PayPal', bg: '#003087', text: 'PP'},
    {label: 'Visa', bg: '#1A1F71', text: 'VISA'},
  ];
  return (
    <div className="flex items-center gap-1.5">
      {cards.map((c) => (
        <span
          key={c.label}
          aria-label={c.label}
          title={c.label}
          className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[9px] font-bold tracking-tight"
          style={{backgroundColor: c.bg, color: c.color || '#fff'}}
        >
          {c.text}
        </span>
      ))}
    </div>
  );
}
