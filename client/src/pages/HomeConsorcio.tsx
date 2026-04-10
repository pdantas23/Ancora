import { useState, useEffect, useRef } from "react";
import { createLeadConsorcio } from "@/features/leads/leadApi";
import { gtm } from "@/lib/gtm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Anchor,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ShieldCheck,
  BadgeCheck,
  Clock3,
  HeartHandshake,
  ArrowRight,
  Car,
  Home as HomeIcon,
  Briefcase,
  MessageCircle,
  Loader2,
  X,
} from "lucide-react";

const SLIDER_MIN = 20000;
const SLIDER_MAX = 500000;
const SLIDER_STEP = 5000;

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL ?? "ancoraprimeseguros@gmail.com";
const contactPhone = import.meta.env.VITE_CONTACT_PHONE ?? "(86) 99445-8461";
const contactAddress = import.meta.env.VITE_CONTACT_ADDRESS ?? "Piauí, PI";
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? "5586994458461";

const whatsappMessage = encodeURIComponent(
  import.meta.env.VITE_WHATSAPP_MESSAGE || "Olá, gostaria de mais informações sobre consórcio."
);
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

type FormData = { name: string; email: string; telefone: string };
type FormErrors = { name?: string; email?: string; telefone?: string };
type ModalState = "form" | "success";
type ModalSource = "hero" | "cta";

export default function Home() {
  const [heroValue, setHeroValue] = useState(150000);
  const [modalValue, setModalValue] = useState(150000);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState<ModalSource>("hero");
  const [modalState, setModalState] = useState<ModalState>("form");
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", telefone: "" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappThrottled, setWhatsappThrottled] = useState(false);
  const [formStarted, setFormStarted] = useState(false);

  const heroSliderDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalSliderDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveValue = modalSource === "hero" ? heroValue : modalValue;

  useEffect(() => {
    document.title = "Âncora Consórcios - Realize seu sonho sem juros";
    gtm.pageView("landing_consorcio");
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (modalOpen) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  function openWhatsApp(placement: string) {
    if (whatsappThrottled) return;
    setWhatsappThrottled(true);
    setTimeout(() => setWhatsappThrottled(false), 800);
    gtm.clickWhatsApp(placement);
    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  }

  function handleHeroSliderChange(val: number) {
    setHeroValue(val);
    if (heroSliderDebounce.current) clearTimeout(heroSliderDebounce.current);
    heroSliderDebounce.current = setTimeout(() => gtm.sliderInteraction(val), 400);
  }

  function handleModalSliderChange(val: number) {
    setModalValue(val);
    if (modalSliderDebounce.current) clearTimeout(modalSliderDebounce.current);
    modalSliderDebounce.current = setTimeout(() => gtm.sliderInteraction(val), 400);
  }

  function openModalFromHero() {
    gtm.clickSimularAgora(heroValue);
    setModalSource("hero");
    setModalState("form");
    setFormData({ name: "", email: "", telefone: "" });
    setFormErrors({});
    setFormStarted(false);
    setModalOpen(true);
    gtm.modalOpen(heroValue);
  }

  function openModalFromCta() {
    gtm.clickSimularAgora(modalValue);
    setModalSource("cta");
    setModalState("form");
    setFormData({ name: "", email: "", telefone: "" });
    setFormErrors({});
    setFormStarted(false);
    setModalOpen(true);
    gtm.modalOpen(modalValue);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleFieldFocus() {
    if (!formStarted) {
      setFormStarted(true);
      gtm.formStart("formulario_lead_consorcio", effectiveValue);
    }
  }

  function validate(): boolean {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = "Informe o nome completo.";
    if (!formData.email.trim()) {
      errors.email = "Informe o email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Informe um email válido.";
    }
    const tel = formData.telefone.replace(/\D/g, "");
    if (!tel) {
      errors.telefone = "Informe o telefone.";
    } else if (tel.length !== 11) {
      errors.telefone = "O telefone deve ter 11 dígitos com DDD.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await createLeadConsorcio({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        telefone: formData.telefone.replace(/\D/g, ""),
        valor_simulado: effectiveValue,
      });
      gtm.formSuccess("formulario_lead_consorcio", { valor_simulado: effectiveValue });
      setModalState("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      gtm.formError("formulario_lead_consorcio", msg, { valor_simulado: effectiveValue });
      setFormErrors({ name: "Não foi possível enviar. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const benefits = [
    { icon: ShieldCheck, title: "Aquisição planejada", desc: "Conquiste seus objetivos com planejamento e parcelas organizadas."},
    { icon: BadgeCheck, title: "Carta de crédito", desc: "Use o crédito como dinheiro à vista na compra do bem." },
    { icon: Clock3, title: "Flexibilidade", desc: "Prazos e valores adaptados ao seu planejamento financeiro." },
    { icon: HeartHandshake, title: "Suporte completo", desc: "Acompanhamento especializado do início à contemplação." },
  ];

  const categories = [
    { icon: Car, label: "Automóveis", sub: "0km e seminovos" },
    { icon: HomeIcon, label: "Imóveis", sub: "Casa, apto, terreno" },
    { icon: Briefcase, label: "Empresarial", sub: "Máquinas e veículos" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 py-20 pb-10 pt-5 sm:pt-5 sm:pb-10 md:pt-8 md:pb-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          {/*Logo*/}
          <div className="mb-5 flex justify-center">
            <div className="inline-flex items-center justify-center p-1">
                <img
                src="/logo.png?v=2"
                alt="Âncora Seguros"
                className="block h-[96px] w-auto object-contain sm:h-[84px] md:h-[150px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between text-center">

            <div className="max-w-2xl space-y-5 text-white sm:space-y-6 md:space-y-7">
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Seu próximo passo{" "}
                <span className="text-white">com mais clareza</span>
              </h1>

              <p className="mx-auto max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base md:text-lg">
                Escolher um consórcio pode ser uma forma organizada de conquistar um bem
                ou realizar um projeto importante. Faça uma simulação simples e veja qual
                valor faz mais sentido para o seu momento.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-center">
                <Button
                  size="lg"
                  onClick={openModalFromHero}
                  className="w-full gap-2 cursor-pointer bg-blue-500 text-white shadow-lg hover:bg-blue-600 sm:w-auto"
                >
                  Simular agora <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  size="lg"
                  onClick={() => openWhatsApp("hero_button")}
                  className="w-full gap-2 cursor-pointer bg-green-500 text-white shadow-lg hover:bg-green-600 sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                  WhatsApp
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 sm:gap-3">
                {[
                  { v: "Sem pressão", l: "simule com calma e entenda as opções" },
                  { v: "Suporte dedicado", l: "tiramos suas dúvidas de forma clara" },
                  { v: "No seu tempo", l: "você escolhe quando avançar" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="flex flex-col justify-center rounded-xl border border-white/15 bg-white/10 p-2 text-center sm:p-4"
                  >
                    <p className="text-sm font-bold sm:text-lg md:text-xl">{s.v}</p>
                    <p className="mt-1 text-[10px] leading-snug text-blue-200 sm:text-xs">
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* card simulador do topo */}
            <div className="mx-auto w-full max-w-sm lg:mx-0" id="simulador">
              <Card className="border-0 bg-white/10 backdrop-blur-sm p-6 shadow-2xl text-white">
                <p className="text-sm font-medium text-blue-200 mb-1">Qual valor de crédito você precisa?</p>
                <p className="text-4xl font-extrabold text-white mb-6">{formatBRL(heroValue)}</p>

                <div className="space-y-2 mb-8">
                  <Slider
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    step={SLIDER_STEP}
                    value={[heroValue]}
                    onValueChange={([v]) => handleHeroSliderChange(v)}
                    className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-range]]:bg-blue-500 [&_[data-slot=slider-thumb]]:h-6 [&_[data-slot=slider-thumb]]:w-6 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-blue-500 [&_[data-slot=slider-thumb]]:shadow-lg"
                  />
                  <div className="flex justify-between text-xs text-white">
                    <span>{formatBRL(SLIDER_MIN)}</span>
                    <span>{formatBRL(SLIDER_MAX)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-base py-3 cursor-pointer"
                  onClick={openModalFromHero}
                >
                  Simular agora <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <p className="mt-3 text-center text-xs text-blue-300">
                  Sem compromisso · Consultor especializado
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={openModalFromHero}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-blue-50 p-4 sm:p-7 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg cursor-pointer"
                >
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-800" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-blue-900 uppercase">{cat.label}</p>
                    <p className="text-xs text-slate-500 uppercase">{cat.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-extrabold text-blue-900 sm:text-3xl md:text-4xl">
              Por que escolher a Âncora?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
              Um atendimento mais claro, com orientação para você entender melhor o consórcio
              e avaliar com calma o que faz sentido para o seu momento.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {benefits.map((b) => {
              const Icon = b.icon;

              return (
                <div
                  key={b.title}
                  className="group rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl"
                >
                  <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-start sm:text-left">

                    {/* Ícone */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Icon className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                    </div>

                    {/* Texto */}
                    <div className="flex flex-col">
                      <h3 className="text-xs font-bold text-blue-900 sm:text-sm">
                        {b.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        {b.desc}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-3 text-white sm:grid-cols-4 sm:gap-6">
            {[
              {
                title: "Atendimento próximo",
                desc: "tiramos suas dúvidas de forma clara",
              },
              {
                title: "Sem pressão",
                desc: "simule com calma e entenda as opções",
              },
              {
                title: "Processo transparente",
                desc: "informações simples e objetivas",
              },
              {
                title: "Decisão no seu tempo",
                desc: "você escolhe quando avançar",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="flex flex-col items-center text-center px-2 py-4 rounded-xl border border-blue-600/50 bg-blue-800/40 backdrop-blur-sm overflow-hidden min-w-0"
              >
                <h3 className="text-xs sm:text-base font-bold leading-snug mb-2 break-words w-full">
                  {s.title}
                </h3>
                <p className="text-[10px] sm:text-xs leading-relaxed text-blue-200 break-words w-full">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL — abre modal com slider interno */}
      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center text-blue-900">
          <h2 className="text-2xl font-extrabold sm:text-3xl md:text-4xl">
            Pronto para dar o primeiro passo?
          </h2>
          <p className="mt-3 text-blue-900">
            Selecione o valor e um consultor especializado entrará em contato com as melhores opções para você.
          </p>
          <Button
            size="lg"
            onClick={openModalFromCta}
            className="mt-8 bg-white text-blue-900 hover:bg-blue-50 font-bold shadow-xl gap-2 cursor-pointer"
          >
            Simular gratuitamente <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contato" className="bg-gray-900 py-10 sm:py-12 text-white">
        <div className="mx-auto max-w-2xl px-6">

          <div className="mb-8 grid grid-cols-2 items-center gap-6">

            {/* Logo */}
            <div className="flex flex-col items-center text-center">
              <img
                src="/logo.png?v=2"
                alt="Âncora Seguros"
                className="h-20 sm:h-24 w-auto object-contain"
              />
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

          <div className="border-t border-gray-800 pt-5 text-center">
            <p className="text-[10px] text-gray-600">
              © 2026 Âncora Consórcios. Todos os direitos reservados.
            </p>
          </div>

        </div>
      </footer>

      {/* BOTÃO FLUTUANTE WHATSAPP */}
      <button
        onClick={() => openWhatsApp("floating_button")}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-green-600 cursor-pointer"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Formulário de simulação"
        >
          <div
            className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-5">
              <div>
                <p className="text-sm text-blue-200">Âncora Consórcio</p>
                <p className="text-lg font-extrabold text-white">Fale com um consultor</p>
              </div>
              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {modalState === "success" ? (
                <div className="py-4 text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-9 w-9 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-blue-900">Dados recebidos!</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Recebemos suas informações com sucesso. Nossa equipe entrará em
                      contato em breve para apresentar as melhores opções disponíveis para você.
                    </p>
                  </div>
                  <Button
                    onClick={closeModal}
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold cursor-pointer"
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <>
                  {/* slider interno — apenas quando aberto pelo CTA inferior */}
                  {modalSource === "cta" && (
                    <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Valor de crédito desejado
                        </p>
                        <p className="text-base font-extrabold text-blue-900">
                          {formatBRL(modalValue)}
                        </p>
                      </div>
                      <Slider
                        min={SLIDER_MIN}
                        max={SLIDER_MAX}
                        step={SLIDER_STEP}
                        value={[modalValue]}
                        onValueChange={([v]) => handleModalSliderChange(v)}
                        className="[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-orange-500 [&_[data-slot=slider-thumb]]:h-4 [&_[data-slot=slider-thumb]]:w-4 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-orange-500"
                      />
                      <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                        <span>{formatBRL(SLIDER_MIN)}</span>
                        <span>{formatBRL(SLIDER_MAX)}</span>
                      </div>
                    </div>
                  )}

                  {/* referência do valor do hero — apenas quando aberto pelo topo */}
                  {modalSource === "hero" && (
                    <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Crédito selecionado
                      </p>
                      <p className="text-base font-extrabold text-blue-900">
                        {formatBRL(heroValue)}
                      </p>
                    </div>
                  )}

                  <p className="mb-4 text-sm text-slate-500">
                    Preencha os dados abaixo e um especialista entrará em contato com as melhores condições para o seu perfil.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <input type="hidden" name="valor_simulado" value={effectiveValue} />

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Nome completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: João Silva"
                        value={formData.name}
                        onFocus={handleFieldFocus}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                        }}
                        disabled={isSubmitting}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition focus:border-blue-500 ${
                          formErrors.name ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                        }`}
                      />
                      {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
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
                        disabled={isSubmitting}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition focus:border-blue-500 ${
                          formErrors.email ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                        }`}
                      />
                      {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Telefone com DDD <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Ex: (11) 9 9999-9999"
                        value={formData.telefone}
                        onFocus={handleFieldFocus}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, "").slice(0, 11);
                          setFormData({ ...formData, telefone: cleaned });
                          if (formErrors.telefone) setFormErrors({ ...formErrors, telefone: "" });
                        }}
                        disabled={isSubmitting}
                        className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none transition focus:border-blue-500 ${
                          formErrors.telefone ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                        }`}
                      />
                      {formErrors.telefone && <p className="mt-1 text-xs text-red-500">{formErrors.telefone}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-blue-500 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                        </span>
                      ) : (
                        "Quero ser contactado →"
                      )}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                      Seus dados estão seguros. Não fazemos spam.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}