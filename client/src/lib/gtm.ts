// ─── Google Tag Manager helper ────────────────────────────────────────────────
// Envia eventos para o dataLayer do GTM de forma centralizada e tipada.

type GtmEventData = Record<string, string | number | boolean | string[] | undefined>;

export function pushGtmEvent(eventName: string, data: GtmEventData = {}): void {
  if (typeof window === "undefined") return;

  const dl = ((window as any).dataLayer = (window as any).dataLayer || []);

  dl.push({
    event: eventName,
    ...data,
    timestamp: new Date().toISOString(),
    page_path: window.location.pathname,
  });
}

// ─── Eventos nomeados do fluxo Âncora ─────────────────────────────────────────

export const gtm = {
  /** Disparado quando a página principal é renderizada */
  pageView(pageName: "landing_consorcio" | "landing_seguros") {
    pushGtmEvent("ancora_page_view", {
      page_name: pageName,
    });
  },

  /** Disparado quando o usuário clica em botões de WhatsApp */
  clickWhatsApp(placement: string) {
    pushGtmEvent("ancora_click_whatsapp", {
      whatsapp_placement: placement,
    });
  },

  /** Disparado quando o usuário move o slider */
  sliderInteraction(valorSimulado: number) {
    pushGtmEvent("ancora_slider_interaction", {
      valor_simulado: valorSimulado,
      origem: "simulador_principal",
    });
  },

  /** Disparado quando o usuário clica em "Simular agora" */
  clickSimularAgora(valorSimulado: number) {
    pushGtmEvent("ancora_click_simular_agora", {
      valor_simulado: valorSimulado,
      origem: "botao_simulador",
    });
  },

  /** Disparado quando o modal de formulário é aberto */
  modalOpen(valorSimulado: number) {
    pushGtmEvent("ancora_modal_open", {
      form_name: "formulario_lead_consorcio",
      valor_simulado: valorSimulado,
    });
  },

  /** Disparado quando o usuário começa a preencher o formulário (primeiro campo) */
  formStart(formName: string, valorSimulado?: number) {
    pushGtmEvent("ancora_form_start", {
      form_name: formName,
      valor_simulado: valorSimulado,
    });
  },

  /** Disparado quando o formulário é enviado com sucesso */
  formSuccess(formName: string, data: GtmEventData = {}) {
    pushGtmEvent("ancora_form_success", {
      form_name: formName,
      status: "sucesso",
      ...data,
    });
  },

  /** Disparado quando ocorre erro no envio do formulário */
  formError(formName: string, errorMessage: string, data: GtmEventData = {}) {
    pushGtmEvent("ancora_form_error", {
      form_name: formName,
      status: "erro",
      error_message: errorMessage,
      ...data,
    });
  },
};
