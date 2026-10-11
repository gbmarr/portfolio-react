// SEC-004: el `detail` del proveedor de email es interno (config, cuota,
// dominios no verificados). No debe llegar al browser: se responde un error
// genérico y el detalle queda solo en logs server-side.
//
// Módulo puro (sin imports de Deno) para poder testearlo con Vitest.
// Es importado desde `./index.ts` de la Edge Function contact-notify.

export type MailSendErrorBody = {
  ok: false;
  error: "mail-send";
};

/** Cuerpo de error para el cliente: genérico, SIN `detail`. */
export function mailSendErrorBody(): MailSendErrorBody {
  return { ok: false, error: "mail-send" };
}

/** Registra el detalle técnico del proveedor solo server-side. */
export function logMailError(detail: string): void {
  console.error("[contact-notify] mail-send falló - detail:", detail);
}