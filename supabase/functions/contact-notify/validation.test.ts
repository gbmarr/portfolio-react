import { describe, it, expect } from "vitest";

import {
  CONTACT_LIMITS,
  hasControlChars,
  isDisposableEmail,
  isSafeEmail,
  isTurnstileResponseValid,
  TURNSTILE_ACTION,
  validateContactInput,
} from "./validation";

// SEC-005: `name`/`email` terminan en headers del email (subject/reply_to);
// la validación server-side debe rechazar caracteres de control (CRLF injection).
describe("hasControlChars", () => {
  it("detecta CR/LF/NUL y otros caracteres de control", () => {
    expect(hasControlChars("Ana\nPérez")).toBe(true);
    expect(hasControlChars("a\r\nb")).toBe(true);
    expect(hasControlChars("a\u0000b")).toBe(true);
    expect(hasControlChars("a\u0007b")).toBe(true);
  });

  it("no marca texto normal (acentos, espacios, símbolos)", () => {
    expect(hasControlChars("Ana Pérez")).toBe(false);
    expect(hasControlChars("ana@example.com")).toBe(false);
    expect(hasControlChars("+54 9 11 5555-5555")).toBe(false);
  });
});

describe("isDisposableEmail (SEC-007)", () => {
  it("detecta dominios desechables (case-insensitive y con espacios)", () => {
    expect(isDisposableEmail("usuario@mailinator.com")).toBe(true);
    expect(isDisposableEmail("usuario@10MINUTEMAIL.com")).toBe(true);
    expect(isDisposableEmail("usuario@yopmail.com ")).toBe(true);
  });

  it("no marca proveedores legítimos ni teléfonos/WhatsApp", () => {
    expect(isDisposableEmail("ana@gmail.com")).toBe(false);
    expect(isDisposableEmail("ana@empresa.com.ar")).toBe(false);
    expect(isDisposableEmail("+54 9 11 5555 5555")).toBe(false);
    expect(isDisposableEmail("")).toBe(false);
  });
});

describe("isSafeEmail", () => {
  it("acepta emails normales y recorta", () => {
    expect(isSafeEmail("ana@example.com")).toBe(true);
    expect(isSafeEmail("  a.b+c@sub.example.co  ")).toBe(true);
  });

  it("rechaza delimitadores de header/mailto y no-emails", () => {
    expect(isSafeEmail("a@b.com?body=hi")).toBe(false);
    expect(isSafeEmail("a@b.com,other@x.com")).toBe(false);
    expect(isSafeEmail("+54 9 11 5555 5555")).toBe(false);
    expect(isSafeEmail("")).toBe(false);
  });
});

describe("validateContactInput (SEC-005)", () => {
  const base = {
    name: "Ana Pérez",
    email: "ana@example.com",
    message: "Necesito una landing page",
    turnstileToken: "mock-token",
  };

  it("acepta un payload válido", () => {
    const result = validateContactInput(base);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.email).toBe("ana@example.com");
  });

  it("rechaza inyección de headers por CRLF en el nombre", () => {
    expect(
      validateContactInput({ ...base, name: "Ana\r\nBcc: attacker@example.com" }),
    ).toEqual({ ok: false, reason: "name" });
  });

  it("rechaza inyección de headers por CRLF en el email", () => {
    expect(
      validateContactInput({ ...base, email: "ana@example.com\nbcc:x@y.com" }),
    ).toEqual({ ok: false, reason: "email" });
  });

  it("rechaza emails de dominios desechables (SEC-007), pero no un teléfono", () => {
    expect(
      validateContactInput({ ...base, email: "spam@mailinator.com" }),
    ).toEqual({ ok: false, reason: "email" });
    expect(
      validateContactInput({ ...base, email: "spam@10minutemail.com" }),
    ).toEqual({ ok: false, reason: "email" });
    // WhatsApp/teléfono no se ve afectado por la blocklist.
    expect(validateContactInput({ ...base, email: "+54 9 11 5555 5555" }).ok).toBe(true);
  });

  it("rechaza nombre/email vacíos o demasiado largos", () => {
    expect(validateContactInput({ ...base, name: "" })).toEqual({
      ok: false,
      reason: "name",
    });
    expect(
      validateContactInput({ ...base, name: "x".repeat(CONTACT_LIMITS.nameMax + 1) }),
    ).toEqual({ ok: false, reason: "name" });
    expect(validateContactInput({ ...base, email: "" })).toEqual({
      ok: false,
      reason: "email",
    });
    expect(
      validateContactInput({ ...base, email: "x".repeat(CONTACT_LIMITS.emailMax + 1) }),
    ).toEqual({ ok: false, reason: "email" });
  });

  it("permite saltos de línea en el mensaje (a diferencia de name/email)", () => {
    const result = validateContactInput({ ...base, message: "Hola.\nNecesito una landing page." });
    expect(result.ok).toBe(true);
  });

  it("exige el token de Turnstile", () => {
    expect(validateContactInput({ ...base, turnstileToken: "" })).toEqual({
      ok: false,
      reason: "turnstile",
    });
  });
});

// SEC-006: además de `success`, se valida la acción y el hostname del token.
describe("isTurnstileResponseValid (SEC-006)", () => {
  const expectations = {
    allowedHostnames: ["gabrielmarrero.com.ar", "www.gabrielmarrero.com.ar", "localhost"],
    expectedAction: TURNSTILE_ACTION,
  };

  it("acepta una respuesta válida de la acción y hostname esperados", () => {
    expect(
      isTurnstileResponseValid(
        { success: true, action: "contact", hostname: "gabrielmarrero.com.ar" },
        expectations,
      ),
    ).toBe(true);
  });

  it("acepta localhost (dev) y respuestas sin hostname", () => {
    expect(
      isTurnstileResponseValid(
        { success: true, action: "contact", hostname: "localhost" },
        expectations,
      ),
    ).toBe(true);
    expect(
      isTurnstileResponseValid({ success: true, action: "contact" }, expectations),
    ).toBe(true);
  });

  it("rechaza cuando success es false o falta", () => {
    expect(
      isTurnstileResponseValid(
        { success: false, action: "contact", hostname: "gabrielmarrero.com.ar" },
        expectations,
      ),
    ).toBe(false);
    expect(isTurnstileResponseValid({ action: "contact" }, expectations)).toBe(false);
  });

  it("rechaza una acción distinta (token de otro widget)", () => {
    expect(
      isTurnstileResponseValid(
        { success: true, action: "other", hostname: "gabrielmarrero.com.ar" },
        expectations,
      ),
    ).toBe(false);
  });

  it("rechaza un hostname no permitido", () => {
    expect(
      isTurnstileResponseValid(
        { success: true, action: "contact", hostname: "attacker.example" },
        expectations,
      ),
    ).toBe(false);
  });
});
