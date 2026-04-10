import { useEffect, useState, useRef } from "react";
import { createLeadSeguro } from "@/features/leads/leadApi";
import { Button } from "@/components/ui/button";
import { gtm } from "@/lib/gtm";
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
  ShieldCheck,
  BadgeCheck,
  MessageCircle,
  HeartHandshake,
  Car,
  Building2,
  Heart,
  Sun,
  HardHat,
} from "lucide-react";

// ─── Variáveis de ambiente ────────────────────────────────────────────────────
// Certifique-se de que todas estas variáveis existem no seu .env:
//   VITE_WHATSAPP_NUMBER=5586994458461
//   VITE_WHATSAPP_MESSAGE=Olá! Gostaria de solicitar uma cotação de seguro.
//   VITE_CONTACT_EMAIL=ancoraprimeseguros@gmail.com
//   VITE_CONTACT_PHONE=(86) 99445-8461
//   VITE_CONTACT_ADDRESS=Piauí, PI
// ─────────────────────────────────────────────────────────────────────────────

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
const whatsappMessage = "Olá, gostaria de mais informações sobre seguros.";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL ?? "ancoraprimeseguros@gmail.com";
const contactPhone = import.meta.env.VITE_CONTACT_PHONE ?? "(86) 99445-8461";
const contactAddress = import.meta.env.VITE_CONTACT_ADDRESS ?? "Piauí, PI";

// ─── Seguros disponíveis ──────────────────────────────────────────────────────
const segmentos = [
  "Seguro de Carro & Moto",
  "Seguro Empresarial (CNPJ)",
  "Seguro de Vida",
  "Seguro de Placas Solares",
  "Seguro e Garantia / Engenharia",
] as const;

type Segmento = (typeof segmentos)[number] | "";

type FormData = {
  name: string;
  email: string;
  telefone: string;
  segmento: Segmento;
  descricao: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  telefone?: string;
  descricao?: string;
};

const initialFormData: FormData = {
  name: "",
  email: "",
  telefone: "",
  segmento: "",
  descricao: "",
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [whatsappThrottled, setWhatsappThrottled] = useState(false);
  const [formStarted, setFormStarted] = useState(false);



  // ─── Tipos de seguro oferecidos ─────────────────────────────────────────────
  const insuranceTypes = [
    {
      icon: Car,
      title: "Veículos",
      description:
        "Mantenha seu veículo sempre protegido e preparado para imprevistos do dia a dia.",
    },
    {
      icon: Building2,
      title: "Empresarial (CNPJ)",
      description:
        "Proteja o funcionamento do seu negócio e os bens essenciais da empresa.",
    },
    {
      icon: Heart,
      title: "Vida",
      description:
        "Uma forma de organizar proteção financeira para quem depende de você.",
    },
    {
      icon: Sun,
      title: "Placas Solares",
      description:
        "Cuide do seu investimento em energia solar contra danos e imprevistos.",
    },
    {
      icon: HardHat,
      title: "Engenharia",
      description:
        "Mais segurança para obras, contratos e projetos de engenharia.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    document.title = "Âncora Seguros - Proteção para você e seu patrimônio";
    gtm.pageView("landing_seguros");
  }, []);

  function handleFieldFocus() {
    if (!formStarted) {
      setFormStarted(true);
      gtm.formStart("formulario_lead_seguro");
    }
  }

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 640) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  function startAutoplay() {
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);
  }

  function stopAutoplay() {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  }

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, []);

  function beginDrag(clientX: number) {
    touchStartX.current = clientX;
    isDragging.current = true;
    stopAutoplay();
  }

  function moveDrag(clientX: number) {
    if (!isDragging.current || touchStartX.current === null) return;
    setDragOffset(clientX - touchStartX.current);
  }

  function endDrag() {
    if (!isDragging.current || touchStartX.current === null) return;
    isDragging.current = false;
    const threshold = 50;
    if (dragOffset < -threshold) {
      setEnableTransition(true);
      setCurrentIndex((prev) => prev + 1);
    } else if (dragOffset > threshold) {
      setEnableTransition(true);
      setCurrentIndex((prev) => (prev - 1 < 0 ? insuranceTypes.length - 1 : prev - 1));
    }
    setDragOffset(0);
    touchStartX.current = null;
    startAutoplay();
  }

  function handleTouchStart(e: React.TouchEvent) { beginDrag(e.touches[0].clientX); }
  function handleTouchMove(e: React.TouchEvent) { moveDrag(e.touches[0].clientX); }
  function handleTouchEnd() { endDrag(); }

  function handleMouseDown(e: React.MouseEvent) { beginDrag(e.clientX); }
  function handleMouseMove(e: React.MouseEvent) { moveDrag(e.clientX); }
  function handleMouseUp() { endDrag(); }
  function handleMouseLeave() { if (isDragging.current) endDrag(); }

  useEffect(() => {
    if (!enableTransition) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [enableTransition]);

  useEffect(() => {
    if (currentIndex >= insuranceTypes.length) {
      const id = setTimeout(() => {
        setEnableTransition(false);
        setCurrentIndex(0);
        stopAutoplay();
        startAutoplay();
      }, 500);
      return () => clearTimeout(id);
    }
  }, [currentIndex]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitMessage("");
    setSubmitSuccess(null);

    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = "Informe o nome completo.";
    if (!formData.email.trim()) {
      errors.email = "Informe o email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Informe um email válido.";
    }
    const telefoneLimpo = formData.telefone.replace(/\D/g, "");
    if (!telefoneLimpo) {
      errors.telefone = "Informe o telefone.";
    } else if (telefoneLimpo.length !== 11) {
      errors.telefone = "O telefone deve ter 11 dígitos com DDD.";
    }
    if (formData.descricao.length > 500) {
      errors.descricao = "A mensagem deve ter no máximo 500 caracteres.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      gtm.formError("formulario_lead_seguro", "Erro de validação", {
        errors: Object.keys(errors),
        segmento: formData.segmento || "nao_informado",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createLeadSeguro({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: telefoneLimpo,
        segmento: formData.segmento,
        descricao: formData.descricao.trim(),
      });

      gtm.formSuccess("formulario_lead_seguro", {
        segmento: formData.segmento || "nao_informado",
      });

      setSubmitSuccess(true);
      setSubmitMessage("Orçamento enviado com sucesso.");
      setFormData(initialFormData);
      setFormErrors({});
      setFormStarted(false);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      gtm.formError("formulario_lead_seguro", error instanceof Error ? error.message : "Erro desconhecido", {
        segmento: formData.segmento || "nao_informado",
      });
      setSubmitSuccess(false);
      setSubmitMessage("Não foi possível enviar o orçamento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openWhatsApp(placement: string) {
    if (whatsappThrottled) return;
    setWhatsappThrottled(true);
    setTimeout(() => setWhatsappThrottled(false), 800);
    gtm.clickWhatsApp(placement);
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  }

  const benefits = [
    {
      icon: ShieldCheck,
      title: "Proteção confiável",
      description:
        "Coberturas claras e abrangentes para que você saiba exatamente contra o que está protegido.",
    },
    {
      icon: BadgeCheck,
      title: "Atendimento especializado",
      description:
        "Nossa equipe orienta você na escolha do seguro adequado ao seu perfil e às suas necessidades.",
    },
    {
      icon: Clock3,
      title: "Agilidade no suporte",
      description:
        "Processos diretos e acompanhamento próximo para quando você precisar acionar sua apólice.",
    },
    {
      icon: HeartHandshake,
      title: "Confiança e transparência",
      description:
        "Explicamos cada detalhe do contrato antes da assinatura. Sem letras miúdas, sem surpresas.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-10 pt-5 sm:pt-5 sm:pb-10 md:pt-8 md:pb-16">
        <img
          src="https://mom.com/wp-content/uploads/2024/09/iStock-608532752-scaled.jpg"
          alt="Família protegida por seguro"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-900/58 to-slate-900/28" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-5 flex justify-center">
            <div className="inline-flex items-center justify-center rounded-2xl p-1">
              <img
                src="/logo.png?v=2"
                alt="Âncora Seguros"
                className="block h-[96px] w-auto object-contain sm:h-[84px] md:h-[150px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-10 text-center md:flex-row md:items-center md:justify-between">
            <div className="mx-auto w-full max-w-2xl space-y-6 md:mx-0">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                Seguros para proteger{" "}
                <span className="text-white drop-shadow-md">
                  você, seu negócio e seu patrimônio
                </span>
              </h1>

              <p className="mx-auto max-w-xl leading-relaxed text-slate-200 sm:text-base md:text-lg text-center">
                A Âncora Seguros oferece soluções em seguro de carro, moto, vida, empresarial,
                placas solares e engenharia. Atendimento direto, cotação sem compromisso e
                suporte quando você precisar acionar.
              </p>

              <div className="flex flex-row justify-center gap-3 pt-4">
                <a href="#form-section" className="w-[48%] sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full min-w-0 border border-white/30 bg-white text-blue-950 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-slate-100 hover:shadow-xl active:scale-95 cursor-pointer sm:w-[220px]"
                  >
                    Solicitar cotação
                  </Button>
                </a>

                <Button
                  type="button"
                  size="lg"
                  onClick={() => openWhatsApp("hero_button")}
                  className="w-[48%] min-w-0 bg-green-500 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-green-600 hover:shadow-xl active:scale-95 cursor-pointer sm:w-[220px]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <MessageCircle size={20} />
                    WhatsApp
                  </span>
                </Button>
              </div>
            </div>

            <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2 md:mx-0 md:max-w-sm md:grid-cols-1 md:gap-4">
              <div className="rounded-lg border border-white/15 bg-slate-900/45 p-2 text-center shadow-lg backdrop-blur-sm transition-transform duration-200 hover:scale-105 md:p-5">
                <p className="text-lg font-bold text-white md:text-3xl">10k+</p>
                <p className="mt-1 text-[10px] text-slate-200 md:text-sm">apólices emitidas</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-slate-900/45 p-2 text-center shadow-lg backdrop-blur-sm transition-transform duration-200 hover:scale-105 md:p-5">
                <p className="text-lg font-bold text-white md:text-3xl">5</p>
                <p className="mt-1 text-[10px] text-slate-200 md:text-sm">tipos de seguro</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-slate-900/45 p-2 text-center shadow-lg backdrop-blur-sm transition-transform duration-200 hover:scale-105 md:p-5">
                <p className="text-lg font-bold text-white md:text-3xl">100%</p>
                <p className="mt-1 text-[10px] text-slate-200 md:text-sm">suporte dedicado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tipos de Seguro ── */}
      <section id="seguros" className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-blue-950 sm:text-3xl md:text-4xl">
              Seguros disponíveis
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Trabalhamos com cinco linhas de proteção para atender pessoas físicas e jurídicas.
              Solicite uma cotação e descubra a cobertura certa para o seu caso.
            </p>
          </div>

          <div className="overflow-hidden pt-2 pb-2">
            <div
              className="flex"
              style={{
                transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% + ${dragOffset}px))`,
                transition: dragOffset !== 0 ? "none" : enableTransition ? "transform 0.5s ease-in-out" : "none",
                cursor: isDragging.current ? "grabbing" : "grab",
                userSelect: "none",
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {[...insuranceTypes, ...insuranceTypes.slice(0, itemsPerView)].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="shrink-0 px-2"
                    style={{ width: `${100 / itemsPerView}%` }}
                  >
                    <a
                      href="#form-section"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-700 hover:shadow-lg"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl sm:h-14 sm:w-14">
                        <Icon className="h-6 w-6 text-blue-700 sm:h-7 sm:w-7" />
                      </div>
                      <h3 className="text-sm font-bold text-blue-900 sm:text-base">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">
                        {item.description}
                      </p>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indicadores */}
          <div className="mt-6 flex justify-center gap-2">
            {insuranceTypes.map((_, i) => (
              <button
                key={i}
                onClick={() => { setEnableTransition(true); setCurrentIndex(i); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex % insuranceTypes.length
                    ? "w-6 bg-blue-700"
                    : "w-2 bg-slate-300"
                }`}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefícios ── */}
      <section id="beneficios" className="bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-16 text-center">
            <h2 className="mt-4 text-2xl font-bold text-blue-950 sm:text-3xl md:text-4xl">
              Por que escolher a Âncora Seguros?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Mais do que vender apólices — orientamos você na contratação certa e estamos
              presentes quando você precisar acionar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl sm:h-16 sm:w-16">
                      <Icon className="h-6 w-6 text-blue-700 sm:h-8 sm:w-8" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="min-h-[40px] text-sm font-bold text-blue-900 sm:min-h-[56px] sm:text-lg">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 min-h-[60px] text-xs leading-5 text-slate-600 sm:mt-3 sm:min-h-[84px] sm:text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Formulário de Orçamento ── */}
      <section
        id="form-section"
        className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-300 py-14 text-white sm:py-20"
      >
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
                Solicite um orçamento
              </h2>
              <p className="text-blue-100">
                Preencha o formulário, selecione o tipo de seguro e nossa equipe
                retornará em breve com as melhores opções para você.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-2xl sm:p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Nome completo <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                    }}
                    onFocus={handleFieldFocus}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-sm transition sm:text-base ${
                      formErrors.name ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"
                    }`}
                    style={{ outline: "none" }}
                    disabled={isSubmitting}
                  />
                  {formErrors.name && (
                    <span className="mt-1 block text-sm text-red-600">{formErrors.name}</span>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: joao@email.com"
                    value={formData.email}
                    onFocus={handleFieldFocus}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                    }}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-sm transition sm:text-base ${
                      formErrors.email ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"
                    }`}
                    style={{ outline: "none" }}
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <span className="mt-1 block text-sm text-red-600">{formErrors.email}</span>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Telefone (11 dígitos com DDD) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: (86) 9 9445-8461"
                    value={formData.telefone}
                    onFocus={handleFieldFocus}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setFormData({ ...formData, telefone: cleaned });
                      if (formErrors.telefone) setFormErrors({ ...formErrors, telefone: "" });
                    }}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-sm transition sm:text-base ${
                      formErrors.telefone ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"
                    }`}
                    style={{ outline: "none" }}
                    disabled={isSubmitting}
                  />
                  {formErrors.telefone && (
                    <span className="mt-1 block text-sm text-red-600">{formErrors.telefone}</span>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Tipo de seguro <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.segmento}
                    onFocus={handleFieldFocus}
                    onChange={(e) =>
                      setFormData({ ...formData, segmento: e.target.value as Segmento })
                    }
                    className="w-full cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition sm:text-base"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      paddingRight: "36px",
                      outline: "none",
                    }}
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione o tipo de seguro</option>
                    {segmentos.map((segmento) => (
                      <option key={segmento} value={segmento}>
                        {segmento}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Mensagem (máx 500 caracteres)
                  </label>
                  <textarea
                    placeholder="Descreva brevemente o que você precisa proteger ou sua dúvida."
                    value={formData.descricao}
                    onFocus={handleFieldFocus}
                    onChange={(e) => {
                      const text = e.target.value.slice(0, 500);
                      setFormData({ ...formData, descricao: text });
                      if (formErrors.descricao) setFormErrors({ ...formErrors, descricao: "" });
                    }}
                    maxLength={500}
                    className={`h-24 w-full resize-none rounded-lg border-2 px-4 py-3 text-sm transition sm:text-base ${
                      formErrors.descricao ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"
                    }`}
                    style={{ outline: "none" }}
                    disabled={isSubmitting}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    {formErrors.descricao ? (
                      <span className="text-sm text-red-600">{formErrors.descricao}</span>
                    ) : (
                      <span />
                    )}
                    <span className="ml-auto text-sm text-slate-500">
                      {formData.descricao.length}/500
                    </span>
                  </div>
                </div>

                {submitMessage && (
                  <div
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      submitSuccess
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-blue-700 py-3 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg cursor-pointer"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Orçamento"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contato" className="bg-gray-900 py-10 sm:py-12 text-white">
        <div className="mx-auto max-w-2xl px-6">

          <div className="mb-8 grid grid-cols-2 items-center gap-6">

            {/* Logo */}
            <div className="flex flex-col items-center gap-2 text-center">
              <img
                src="/logo.png?v=2"
                alt="Âncora Seguros"
                className="h-20 sm:h-24 w-auto object-contain"
              />
              <p className="text-[9px] sm:text-[10px] uppercase leading-relaxed tracking-wide text-gray-500 max-w-[150px]">
                Seguros de carro, moto, vida, empresarial, placas solares e engenharia. Proteção com atendimento próximo e transparente.
              </p>
            </div>

            {/* Contato */}
            <div className="flex flex-col items-center gap-2">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">Contato</h4>

              <div className="flex flex-col items-center gap-1.5">

                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0 text-blue-400" />
                  <span className="text-xs text-gray-300">{contactPhone}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0 text-blue-400" />
                  <span className="text-xs text-gray-300">{contactEmail}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0 text-blue-400" />
                  <span className="text-xs text-gray-300">{contactAddress}</span>
                </div>

              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-5 text-center">
            <p className="text-[10px] text-gray-600">
              © 2026 Âncora Seguros. Todos os direitos reservados.
            </p>
          </div>

        </div>
      </footer>

      {/* ── Botão flutuante WhatsApp ── */}
      <button
        type="button"
        onClick={() => openWhatsApp("floating_button")}
        className="fixed bottom-4 right-4 z-50 flex items-center justify-center rounded-full bg-green-500 p-3 text-white shadow-lg transition hover:bg-green-600 hover:shadow-xl sm:bottom-6 sm:right-6 sm:p-4"
        aria-label="Abrir WhatsApp"
        title="Clique para conversar no WhatsApp"
        style={{ outline: "none" }}
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
}