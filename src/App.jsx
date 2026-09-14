import { useEffect, useState } from "react";
import { linkedin, navigation, services, steps } from "./content.js";
import ContactForm from "./ContactForm.jsx";
import Globe from "./Globe.jsx";

function Arrow({ straight = false }) {
  return (
    <span className="arrow" aria-hidden="true">
      {straight ? "⟶" : "↗"}
    </span>
  );
}

function Logo() {
  return (
    <a className="logo" href="#home" aria-label="Alpha Advisory home">
      <svg viewBox="0 0 40 44" aria-hidden="true">
        <path fill="currentColor" d="M18 2 38 42H28L13 12zM9 28h9L11 42H1z" />
        <path fill="#426885" d="m19 25 6 13h-7l-4-7z" />
      </svg>
      <span>Alpha Advisory</span>
    </a>
  );
}

function LinkedInLink({ children, compact = false }) {
  return (
    <a
      className={`linkedin-link${compact ? " compact" : ""}`}
      href={linkedin}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="linkedin-icon" aria-hidden="true">
        in
      </span>
      <span>
        {children} <Arrow />
      </span>
    </a>
  );
}

function Button({ children, note = false, className = "" }) {
  return (
    <div className={`cta ${className}`}>
      <a className="button" href="#contact">
        {children} <Arrow />
      </a>
      {note && <small>A first conversation. No obligation.</small>}
    </div>
  );
}

// Display just the artwork region of each supplied screenshot; all page copy is live HTML.
function Artwork({
  type,
  file,
  width,
  height,
  x,
  y,
  sourceWidth,
  sourceHeight,
}) {
  return (
    <div
      className={`artwork ${type}`}
      aria-hidden="true"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <img
        src={`${import.meta.env.BASE_URL}assets/${file}`}
        alt=""
        loading={type === "hero-art" ? "eager" : "lazy"}
        decoding="async"
        style={{
          width: `${(sourceWidth / width) * 100}%`,
          height: `${(sourceHeight / height) * 100}%`,
          left: `${(-x / width) * 100}%`,
          top: `${(-y / height) * 100}%`,
        }}
      />
    </div>
  );
}

function ServiceIcon({ name }) {
  const paths = {
    chart: (
      <>
        <path d="M5 3v30h29M8 23l9-9 6 5L33 9m-6 0h6v6" />
        <path d="m3 5 2-2 2 2" />
      </>
    ),
    report: (
      <>
        <rect x="7" y="3" width="25" height="32" rx="5" />
        <path d="M13 11h13M13 18h13M13 25h7" />
      </>
    ),
    compass: (
      <>
        <circle cx="20" cy="20" r="16" />
        <path d="m20 8 5 12-5 12-5-12zM15 20h10" />
      </>
    ),
    bars: (
      <>
        <path d="M4 22h6v14H4zM14 12h6v24h-6zM24 3h6v33h-6zM2 36h33" />
      </>
    ),
    building: (
      <>
        <path d="m4 14 15-11 15 11zM5 33h28v4H5zM8 15v17M15 15v17M23 15v17M30 15v17" />
      </>
    ),
    globe: (
      <>
        <circle cx="20" cy="20" r="17" />
        <ellipse cx="20" cy="20" rx="8" ry="17" />
        <path d="M3 20h34" />
      </>
    ),
  };
  return (
    <svg
      className="service-icon"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Header({ active }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function dismiss(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <button
          className={`menu-toggle${open ? " open" : ""}`}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>
        <nav
          id="main-navigation"
          className={open ? "navigation is-open" : "navigation"}
          aria-label="Main navigation"
        >
          {navigation.map(([id, title]) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? "active" : ""}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              {title}
            </a>
          ))}
          <a
            className={`header-cta${active === "contact" ? " active" : ""}`}
            href="#contact"
            onClick={() => setOpen(false)}
          >
            Let’s talk <Arrow />
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="hero-section" aria-labelledby="hero-title">
      <div className="hero dark">
        <div className="container hero-inner">
          <Artwork
            type="hero-art"
            file="hero-ribbed.png"
            width={590}
            height={537}
            x={690}
            y={65}
            sourceWidth={1280}
            sourceHeight={878}
          />
          <div className="hero-copy">
            <p className="eyebrow">
              Strategic finance · Georgia &amp; the Caucasus
            </p>
            <h1 id="hero-title">
              Clarity today. <br />
              Confidence in <br />
              what’s next.
            </h1>
            <p className="hero-description">
              Financial strategy, CFO advisory and investment support.
              <br />
              {" International expertise. Local understanding."}
            </p>
            <div className="hero-actions">
              <Button note>Discuss your business</Button>
              <a className="text-link" href="#expertise">
                Explore our expertise <Arrow straight />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="credentials container">
        <div>
          <p className="eyebrow">Founder-led expertise</p>
          <h3>Lasha Khanishvili</h3>
          <p>ACCA Qualified · MBA, Webster University</p>
        </div>
        <div>
          <p className="eyebrow">Finance &amp; accounting</p>
          <h3>15+ years</h3>
          <p>Founder’s professional experience</p>
        </div>
        <div>
          <p className="eyebrow">International connections</p>
          <h3>Alpha Mosaic Network</h3>
          <p>Regional partner for Georgia &amp; the Caucasus</p>
        </div>
      </div>
    </section>
  );
}

function Expertise({ onEnquire }) {
  return (
    <section id="expertise" aria-labelledby="expertise-title">
      <div className="container expertise-content">
        <div className="section-heading reveal">
          <div>
            <p className="eyebrow">How we help</p>
            <h2 id="expertise-title">Expertise for your next stage.</h2>
          </div>
          <div className="expertise-aside">
            <p>
              Practical financial support, <br />
              built around your business.
            </p>
            <a className="text-link" href="#services">
              Explore our services <Arrow />
            </a>
          </div>
        </div>
        <div id="services" className="services-grid">
          {services.map((service) => (
            <article className="service reveal" key={service.title}>
              <ServiceIcon name={service.icon} />
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                className="text-link"
                href="#contact"
                onClick={() => onEnquire(service.title)}
              >
                Explore service <Arrow />
              </a>
            </article>
          ))}
        </div>
      </div>
      <div className="expertise-cta dark">
        <div className="container">
          <div>
            <h2>Not sure where to start?</h2>
            <p>
              Tell us where your business stands. We’ll help define the next
              step.
            </p>
          </div>
          <Button note>Discuss your priorities</Button>
        </div>
      </div>
    </section>
  );
}

function Approach() {
  return (
    <section
      id="approach"
      className="approach dark"
      aria-labelledby="approach-title"
    >
      <div className="container">
        <div className="approach-heading reveal">
          <p className="eyebrow">Our approach</p>
          <h2 id="approach-title">Clarity that takes root.</h2>
          <p>Financial insight. Practical action. Lasting confidence.</p>
        </div>
        <div className="approach-body">
          <Artwork
            type="tree-art"
            file="approach-source.jpg"
            width={574}
            height={486}
            x={354}
            y={250}
            sourceWidth={1280}
            sourceHeight={880}
          />
          <div className="steps">
            {steps.map((step) => (
              <article
                className={`step step-${step.number} reveal`}
                key={step.number}
              >
                <p className="eyebrow">
                  {step.number} / {step.label}
                </p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="approach-bottom">
          <h3>Built to work beyond the engagement.</h3>
          <Button note>Start a conversation</Button>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section
      id="about"
      className="about container"
      aria-labelledby="about-title"
    >
      <div className="section-heading reveal">
        <div>
          <p className="eyebrow">Founder-led advisory</p>
          <h2 id="about-title">
            Senior expertise. <br />
            Personal commitment.
          </h2>
        </div>
        <p className="about-statement">
          International standards. <br />
          Local understanding. <br />A direct conversation.
        </p>
      </div>
      <div className="founder-grid">
        <div className="portrait-frame reveal">
          <img
            className="founder-portrait"
            src={`${import.meta.env.BASE_URL}assets/lasha-khanishvili.jpg`}
            alt="Lasha Khanishvili, founder of Alpha Advisory"
            width="853"
            height="1280"
            loading="lazy"
          />
        </div>
        <div className="founder-copy reveal">
          <h3>Lasha Khanishvili</h3>
          <div className="founder-role">
            <p>Founder, Alpha Advisory</p>
            <LinkedInLink>View profile</LinkedInLink>
          </div>
          <div className="founder-bio">
            <p>
              More than 15 years in finance and accounting, combining
              international qualifications with an understanding of business in
              Georgia and the Caucasus.
            </p>
            <p>Practical financial advice, with your business at the centre.</p>
          </div>
          <div className="founder-credentials">
            <div className="experience">
              <strong>15+</strong>
              <p>years in finance &amp; accounting</p>
              <small>Founder’s professional experience</small>
            </div>
            <div>
              <h4>
                ACCA <br />
                Qualified
              </h4>
            </div>
            <div>
              <h4>MBA</h4>
              <p>Webster University</p>
            </div>
          </div>
          <div className="industries">
            <p className="eyebrow">Experience across</p>
            <p>
              Energy <span>·</span> Construction <span>·</span> Aviation
            </p>
          </div>
          <Button note>Speak with Lasha</Button>
        </div>
      </div>
    </section>
  );
}

function Network() {
  return (
    <section
      id="network"
      className="network dark"
      aria-labelledby="network-title"
    >
      <div className="container">
        <div className="network-main">
          <div className="network-copy reveal">
            <p className="eyebrow">Global network</p>
            <h2 id="network-title">
              International perspective. <br />
              Local understanding.
            </h2>
            <h3>Alpha Mosaic Network</h3>
            <p className="network-subtitle">
              Regional partner for Georgia &amp; the Caucasus
            </p>
            <p className="network-description">
              International expertise, connected to the realities
              <br className="desktop-break" /> of doing business in our region.
            </p>
            <Button>Discuss your business</Button>
          </div>
          <div className="globe-wrapper">
            <Globe
              fallback={
                <Artwork
                  type="globe-art"
                  file="network-source.jpg"
                  width={470}
                  height={435}
                  x={750}
                  y={86}
                  sourceWidth={1280}
                  sourceHeight={745}
                />
              }
            />
            <p>Based in Tbilisi, Georgia</p>
          </div>
        </div>
        <div className="network-bottom reveal">
          <div>
            <p className="eyebrow">For businesses in Georgia</p>
            <h3>A wider perspective on your next stage.</h3>
          </div>
          <div>
            <p className="eyebrow">For international businesses</p>
            <h3>Local guidance for entering a new market.</h3>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact({ message, onMessageChange }) {
  return (
    <section
      id="contact"
      className="contact container"
      aria-labelledby="contact-title"
    >
      <div className="contact-copy reveal">
        <p className="eyebrow">Let’s talk</p>
        <h2 id="contact-title">
          Let’s talk <br />
          about what’s next.
        </h2>
        <p className="contact-intro">
          Tell us where your business stands. <br />
          We’ll help you define the next step.
        </p>
        <p className="contact-reassurance">
          A first conversation. No obligation.
        </p>
        <div className="contact-linkedin">
          <p className="eyebrow">Prefer LinkedIn?</p>
          <LinkedInLink>Connect with Lasha</LinkedInLink>
        </div>
        <p className="location">
          Tbilisi, Georgia <br />
          <span>Working across Georgia &amp; the Caucasus.</span>
        </p>
      </div>
      <div className="reveal">
        <ContactForm message={message} onMessageChange={onMessageChange} />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer dark">
      <div className="container">
        <div className="footer-top">
          <div>
            <Logo />
            <p>Strategic finance for Georgia &amp; the Caucasus.</p>
          </div>
          <nav aria-label="Footer navigation">
            {navigation.map(([id, title]) => (
              <a href={`#${id}`} key={id}>
                {title}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Alpha Advisory.</p>
          <LinkedInLink compact>Lasha Khanishvili</LinkedInLink>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [message, setMessage] = useState("");
  const [active, setActive] = useState("home");

  useEffect(() => {
    const initialSection = document.getElementById(
      window.location.hash.slice(1),
    );
    initialSection?.scrollIntoView({ behavior: "instant" });
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((element) => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    document
      .querySelectorAll("main > section")
      .forEach((element) => sectionObserver.observe(element));
    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header active={active} />
      <main id="main">
        <Hero />
        <Expertise
          onEnquire={(title) => setMessage(`I’d like to discuss ${title}.\n\n`)}
        />
        <Approach />
        <About />
        <Network />
        <Contact message={message} onMessageChange={setMessage} />
      </main>
      <Footer />
    </>
  );
}
