import { createContext, useContext, useEffect, useState } from "react";
import { georgian } from "./translations.js";

const LanguageContext = createContext(null);
const title = document.title;
const description = document.querySelector('meta[name="description"]').content;

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("alpha-language") === "ka" ? "ka" : "en";
    } catch {
      return "en";
    }
  });
  function t(text) {
    return language === "ka" ? (georgian[text] ?? text) : text;
  }
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t(title);
    document.querySelector('meta[name="description"]').content = t(description);
    try {
      localStorage.setItem("alpha-language", language);
    } catch {
      // Language switching still works when browser storage is unavailable.
    }
  }, [language]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
