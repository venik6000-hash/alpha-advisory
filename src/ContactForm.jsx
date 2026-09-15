import { useLanguage } from "./Language.jsx";
import { useState } from "react";
import Arrow from "./Arrow.jsx";
import { linkedin } from "./content.js";

export default function ContactForm({ message, onMessageChange }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT;

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!endpoint) {
      setStatus(
        "Your message has not been sent. Please connect with Lasha on LinkedIn to start a conversation.",
      );
      return;
    }

    setSending(true);
    setStatus("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Submission failed");
      setStatus("Thank you. Your message has been submitted.");
      form.reset();
      onMessageChange("");
    } catch {
      setStatus(
        "Your message could not be sent. Please try again or connect with Lasha on LinkedIn.",
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
          maxLength={5000}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
        />
      </label>
      <button className="button" type="submit" disabled={sending}>
        {sending ? t("Sending…") : t("Send message")} <Arrow />
      </button>
      <p className="form-note">{t("Fields marked * are required.")} </p>
      {status && (
        <div className="form-status" role="status">
          {t(status)}
          {!status.startsWith("Thank you") && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer">
              {t("Connect with Lasha")} <Arrow />
            </a>
          )}
        </div>
      )}
    </form>
  );
}
