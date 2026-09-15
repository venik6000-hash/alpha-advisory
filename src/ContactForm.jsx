import { useLanguage } from "./Language.jsx";
import { useState } from "react";
import Arrow from "./Arrow.jsx";
import { linkedin } from "./content.js";

export const contactEmail = "infoalphaadvisory@gmail.com";
const endpoint =
  import.meta.env.VITE_CONTACT_ENDPOINT ||
  `https://formsubmit.co/ajax/${contactEmail}`;

export default function ContactForm({ message, onMessageChange }) {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (sending) return;
    const fields = Object.fromEntries(new FormData(form));
    const payload = {
      ...fields,
      _subject: "Alpha Advisory — New website enquiry",
      _template: "table",
      _url: window.location.href,
      language,
    };

    setSending(true);
    setStatus("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Submission failed");
      const result = await response.json();
      // FormSubmit can return HTTP 200 for inactive forms and rejected requests.
      if (result.success !== true && result.success !== "true") {
        throw new Error("Submission was not accepted");
      }
      setStatus("Thank you. Your message has been submitted.");
      form.reset();
      onMessageChange("");
    } catch {
      setStatus(
        "Your message has not been sent. Please try again or email us directly.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h3>{t("Tell us about your business.")} </h3>
      <div className="form-row">
        <label htmlFor="name">
          {t("Name *")}{" "}
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            disabled={sending}
            maxLength={150}
            pattern=".*\S.*"
          />
        </label>
        <label htmlFor="email">
          {t("Email *")}{" "}
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={sending}
            maxLength={254}
          />
        </label>
      </div>
      <label htmlFor="company">
        {t("Company (optional)")}{" "}
        <input
          id="company"
          name="company"
          autoComplete="organization"
          disabled={sending}
          maxLength={200}
        />
      </label>
      <label htmlFor="message">
        {t("How can we help? *")}{" "}
        <textarea
          id="message"
          name="message"
          placeholder={t("Tell us a little about your priorities.")}
          required
          disabled={sending}
          maxLength={5000}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
        />
      </label>
      <button className="button" type="submit" disabled={sending}>
        {sending ? t("Sending…") : t("Send message")} <Arrow />
      </button>
      <input
        type="text"
        name="_honey"
        className="form-honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <p className="form-note">{t("Fields marked * are required.")} </p>
      {status && (
        <div className="form-status" role="status">
          {t(status)}
          {!status.startsWith("Thank you") && (
            <>
              <a href={`mailto:${contactEmail}`}>
                {contactEmail} <Arrow />
              </a>
              <a href={linkedin} target="_blank" rel="noopener noreferrer">
                {t("Connect with Lasha")} <Arrow />
              </a>
            </>
          )}
        </div>
      )}
    </form>
  );
}
