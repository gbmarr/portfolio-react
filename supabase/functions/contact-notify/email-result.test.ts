import { describe, it, expect, vi } from "vitest";

import { logMailError, mailSendErrorBody } from "./email-result";

// SEC-004: la ruta de error del envío de email no debe exponer `detail` al
// cliente; el detalle queda registrado solo server-side (console.error).
describe("email-result (SEC-004)", () => {
  it("mailSendErrorBody devuelve un error genérico sin detail", () => {
    const body = mailSendErrorBody();
    expect(body).toEqual({ ok: false, error: "mail-send" });
    // FR1: la respuesta al cliente nunca incluye el detalle del proveedor.
    expect(body).not.toHaveProperty("detail");
  });

  it("logMailError registra el detalle técnico con console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      logMailError("http-501: dominio no verificado");
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("[contact-notify]"),
        "http-501: dominio no verificado",
      );
    } finally {
      spy.mockRestore();
    }
  });
});