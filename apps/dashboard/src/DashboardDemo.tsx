import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BedDouble,
  BellRing,
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  DoorOpen,
  House,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PanelsTopLeft,
  Search,
  Settings,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  CHANNEL_READINESS_CONTRACTS,
  CHANNEL_READINESS_FIELDS,
  WEBSITE_PUBLICATION_READINESS,
  WEBSITE_PUBLICATION_READINESS_FIELDS,
  type ChannelReadinessCandidateId,
  type ChannelReadinessField,
  type DemoRole,
  type WebsitePublicationReadinessField,
} from "@logic-estancia/domain";
import {
  canOperate,
  initialState,
  TOUR_STEP_COUNTS,
  type DemoState,
  type Scenario,
} from "./state";

type Locale = "es" | "en";
type View =
  | "home"
  | "enquiries"
  | "planning"
  | "bookings"
  | "guests"
  | "cleaning"
  | "maintenance"
  | "website"
  | "channels"
  | "automations"
  | "automation"
  | "control"
  | "reports"
  | "settings";
type Utility = "search" | "notifications" | null;
type Notice = { title: string; detail: string; view: View; urgent?: boolean };
type RevenueMetric = "revenue" | "occupancy" | "adr" | "revpar";
type AutomationRuleId = "arrival" | "turnover" | "incident";

type TourStep = {
  phase: string;
  title: string;
  description: string;
  evidence: string;
  view: View;
};

const properties = {
  terrava: [
    "Casa Aira",
    "Casa Bruma",
    "Casa Cauce",
    "Casa Duna",
    "Casa Era",
    "Casa Faya",
    "Casa Linde",
    "Casa Umbral",
  ],
  aurem: ["Aurem Hotel"],
};

const labels = {
  es: {
    home: "Inicio",
    enquiries: "Solicitudes",
    planning: "Planning",
    bookings: "Reservas",
    guests: "Huéspedes",
    cleaning: "Limpieza",
    maintenance: "Mantenimiento",
    website: "Mi web",
    channels: "Canales",
    automations: "Automatizaciones",
    automation: "Copiloto",
    control: "Centro operativo",
    reports: "Informes",
    settings: "Ajustes",
  },
  en: {
    home: "Home",
    enquiries: "Enquiries",
    planning: "Planning",
    bookings: "Bookings",
    guests: "Guests",
    cleaning: "Cleaning",
    maintenance: "Maintenance",
    website: "My website",
    channels: "Channels",
    automations: "Automations",
    automation: "Copilot",
    control: "Operations centre",
    reports: "Reports",
    settings: "Settings",
  },
} as const;

const labelFor = (scenario: Scenario, locale: Locale, view: View) =>
  scenario === "aurem" && view === "reports"
    ? locale === "es"
      ? "Ingresos"
      : "Revenue"
    : labels[locale][view];

const icons: Record<View, typeof House> = {
  home: LayoutDashboard,
  enquiries: MessageSquareText,
  planning: CalendarDays,
  bookings: BookOpen,
  guests: Users,
  cleaning: ClipboardCheck,
  maintenance: Wrench,
  website: PanelsTopLeft,
  channels: Activity,
  automations: BellRing,
  automation: Sparkles,
  control: Bot,
  reports: CircleDollarSign,
  settings: Settings,
};

const viewsFor = (scenario: Scenario): View[] =>
  scenario === "terrava"
    ? [
        "home",
        "enquiries",
        "planning",
        "bookings",
        "guests",
        "website",
        "reports",
      ]
    : [
        "home",
        "planning",
        "bookings",
        "guests",
        "cleaning",
        "maintenance",
        "channels",
        "automations",
        "automation",
        "control",
        "reports",
      ];

const track = (event: string, parameters: Record<string, string | number>) =>
  (
    window as Window & {
      estanciaTrack?: (
        event: string,
        parameters?: Record<string, string | number>,
      ) => void;
    }
  ).estanciaTrack?.(event, parameters);

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
const stayRange = (state: DemoState, locale: Locale) => {
  const format = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${format.format(new Date(`${state.stay.from}T00:00:00Z`))}–${format.format(new Date(`${state.stay.to}T00:00:00Z`))}`;
};

const noticesFor = (
  scenario: Scenario,
  state: DemoState,
  locale: Locale,
): Notice[] => {
  if (scenario === "terrava")
    return [
      state.enquiry === "new"
        ? {
            title:
              locale === "es"
                ? `Revisar solicitud de ${state.stay.name}`
                : `Review ${state.stay.name}’s enquiry`,
            detail:
              locale === "es"
                ? "Casa Aira no cubre la primera noche."
                : "Casa Aira does not cover the first night.",
            view: "enquiries",
            urgent: true,
          }
        : state.enquiry === "alternative"
          ? {
              title:
                locale === "es"
                  ? "Alternativa lista para convertir"
                  : "Alternative ready to convert",
              detail: `Casa Bruma · € ${state.stay.amount}`,
              view: "enquiries",
            }
          : {
              title:
                locale === "es"
                  ? "Reserva ficticia TER-104 visible"
                  : "Fictitious booking TER-104 shown",
              detail: `${state.stay.name} · Casa Bruma`,
              view: "bookings",
            },
      {
        title: locale === "es" ? "Casa Linde pendiente" : "Casa Linde pending",
        detail:
          locale === "es"
            ? "Salida prevista a las 11:00."
            : "Departure expected at 11:00.",
        view: "cleaning",
      },
    ];
  const cleaningNotice: Notice =
    state.cleaning === "ready"
      ? {
          title:
            locale === "es" ? "Habitación 408 validada" : "Room 408 validated",
          detail:
            locale === "es"
              ? "Disponible para la entrada."
              : "Available for arrival.",
          view: "cleaning",
        }
      : {
          title:
            locale === "es"
              ? "Habitación 408 requiere atención"
              : "Room 408 needs attention",
          detail:
            locale === "es"
              ? "Entrada prevista a las 15:00."
              : "Arrival expected at 15:00.",
          view: "cleaning",
          urgent: true,
        };
  return [
    cleaningNotice,
    {
      title:
        locale === "es"
          ? `Llegada de ${state.stay.name}`
          : `${state.stay.name} arrival`,
      detail: `${stayRange(state, locale)} · Terrace 408`,
      view: "bookings",
    },
    {
      title:
        locale === "es"
          ? "Distribución hotelera por validar"
          : "Hotel distribution to validate",
      detail:
        locale === "es"
          ? "Categoría ficticia sin proveedor elegido ni inventario enviado."
          : "Fictitious category with no selected provider or inventory sent.",
      view: "channels",
    },
  ];
};

function useDemoState(scenario: Scenario) {
  const [state, setState] = useState<DemoState>(() => ({
    ...initialState(scenario),
    tourMode: "free",
  }));
  const patch = (next: Partial<DemoState>) =>
    setState((current) => ({ ...current, ...next }));
  return { state, patch };
}

export function DashboardDemo({
  scenario,
  locale = "es",
}: {
  scenario: Scenario;
  locale?: Locale;
}) {
  const { state, patch } = useDemoState(scenario);
  const [view, setView] = useState<View>("home");
  const [mobile, setMobile] = useState(false);
  const [tour, setTour] = useState<number | null>(state.tourStep);
  const [utility, setUtility] = useState<Utility>(null);
  const [query, setQuery] = useState("");
  const utilityTrigger = useRef<HTMLElement | null>(null);
  const brand = scenario === "aurem" ? "Aurem Hotel" : "Terrava Collection";
  const level =
    scenario === "aurem"
      ? locale === "es"
        ? "Inteligente"
        : "Intelligent"
      : locale === "es"
        ? "Gestión"
        : "Management";
  const availableViews = viewsFor(scenario);

  const go = (next: View) => {
    setView(next);
    setMobile(false);
    setUtility(null);
    const url = new URL(location.href);
    url.searchParams.set("vista", next);
    history.replaceState(null, "", url);
  };
  useEffect(() => {
    const candidate = new URLSearchParams(location.search).get(
      "vista",
    ) as View | null;
    if (candidate && availableViews.includes(candidate)) setView(candidate);
  }, []);
  useEffect(() => {
    track("demo_open", { locale, demo: scenario, source_section: "dashboard" });
  }, [locale, scenario]);
  const closeUtility = () => {
    setUtility(null);
    requestAnimationFrame(() => utilityTrigger.current?.focus());
  };
  const openUtility = (next: Exclude<Utility, null>) => {
    utilityTrigger.current = document.activeElement as HTMLElement | null;
    setTour(null);
    setQuery("");
    setUtility(next);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && utility) closeUtility();
      const target = event.target as HTMLElement | null;
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")
      ) {
        event.preventDefault();
        openUtility("search");
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [utility]);
  const notices = noticesFor(scenario, state, locale);
  const normalizedQuery = query
    .trim()
    .toLocaleLowerCase(locale === "es" ? "es-ES" : "en-GB");
  const searchResults = availableViews.filter((item) =>
    labelFor(scenario, locale, item)
      .toLocaleLowerCase(locale === "es" ? "es-ES" : "en-GB")
      .includes(normalizedQuery),
  );

  const tourSteps: TourStep[] =
    scenario === "terrava"
      ? [
          {
            phase: locale === "es" ? "01 · Solicitud" : "01 · Enquiry",
            title:
              locale === "es"
                ? "Una solicitud sin encaje"
                : "An enquiry without a fit",
            description:
              locale === "es"
                ? "Abre el caso ficticio y entiende por qué la primera casa no cubre toda la estancia."
                : "Open the fictitious case and see why the first home cannot cover the full stay.",
            evidence:
              locale === "es"
                ? "Fixture local · sin CRM ni mensajería"
                : "Local fixture · no CRM or messaging",
            view: "enquiries",
          },
          {
            phase:
              locale === "es" ? "02 · Disponibilidad" : "02 · Availability",
            title:
              locale === "es"
                ? "Compara las ocho casas"
                : "Compare all eight homes",
            description:
              locale === "es"
                ? "El planning comparte el contexto necesario para preparar una alternativa sin confirmar ninguna reserva real."
                : "The planning view shares enough context to prepare an alternative without confirming a real booking.",
            evidence:
              locale === "es"
                ? "Inventario ficticio · cambio reversible"
                : "Fictitious inventory · reversible change",
            view: "planning",
          },
          {
            phase: locale === "es" ? "03 · Resultado" : "03 · Outcome",
            title:
              locale === "es"
                ? "Observa la alternativa"
                : "Review the alternative",
            description:
              locale === "es"
                ? "La reserva ficticia cierra el relato visual de Gestión sin crear ni confirmar nada."
                : "The fictitious booking closes the visual Management story without creating or confirming anything.",
            evidence:
              locale === "es"
                ? "Sin cobro ni confirmación externa"
                : "No payment or external confirmation",
            view: "bookings",
          },
        ]
      : [
          {
            phase: locale === "es" ? "01 · Señal" : "01 · Signal",
            title:
              locale === "es"
                ? "Detecta la habitación en riesgo"
                : "Find the room at risk",
            description:
              locale === "es"
                ? "El centro abre con una llegada ficticia que necesita coordinación antes de las 15:00."
                : "The workspace opens with a fictitious arrival that needs coordination before 15:00.",
            evidence:
              locale === "es"
                ? "Fixture local · sin PMS conectado"
                : "Local fixture · no connected PMS",
            view: "home",
          },
          {
            phase: locale === "es" ? "02 · Coordinación" : "02 · Coordination",
            title:
              locale === "es"
                ? "Limpieza prepara la 408"
                : "Cleaning prepares room 408",
            description:
              locale === "es"
                ? "La vista representa cómo los roles ordenarían la preparación y la revisión, sin ejecutar tareas."
                : "The view represents how roles would structure preparation and review without executing tasks.",
            evidence:
              locale === "es"
                ? "Permisos de muestra · sin avisos enviados"
                : "Sample permissions · no notifications sent",
            view: "cleaning",
          },
          {
            phase: locale === "es" ? "03 · Control" : "03 · Control",
            title:
              locale === "es"
                ? "Recepción revisa la entrada"
                : "Reception reviews the arrival",
            description:
              locale === "es"
                ? "El planning reúne estancia y estado de habitación para que una persona tome la decisión final."
                : "Planning brings stay and room status together so a person can make the final decision.",
            evidence:
              locale === "es"
                ? "Validación humana · sin reserva real"
                : "Human validation · no real booking",
            view: "planning",
          },
          {
            phase: locale === "es" ? "04 · Ingresos" : "04 · Revenue",
            title:
              locale === "es" ? "Explica cada métrica" : "Explain every metric",
            description:
              locale === "es"
                ? "El escenario de 28 días permite contrastar ocupación, ADR, RevPAR e ingresos con sus fórmulas y libro semanal."
                : "The 28-day scenario lets you check occupancy, ADR, RevPAR and revenue against their formulas and weekly ledger.",
            evidence:
              locale === "es"
                ? "96 habitaciones ficticias · sin predicción ni contabilidad"
                : "96 fictitious rooms · no forecast or accounting",
            view: "reports",
          },
          {
            phase: locale === "es" ? "05 · Canales" : "05 · Channels",
            title:
              locale === "es"
                ? "Revisa antes de conectar"
                : "Review before connecting",
            description:
              locale === "es"
                ? "La matriz muestra cobertura y requisitos sin fingir sincronizaciones, inventario publicado o credenciales."
                : "The matrix shows coverage and requirements without pretending to sync, publish inventory or hold credentials.",
            evidence:
              locale === "es"
                ? "0 canales conectados · publicación bloqueada"
                : "0 connected channels · publishing blocked",
            view: "channels",
          },
          {
            phase: locale === "es" ? "06 · Copiloto" : "06 · Copilot",
            title:
              locale === "es"
                ? "Edita y revisa con control humano"
                : "Edit and review with human control",
            description:
              locale === "es"
                ? "El borrador parte de un fixture con fuentes visibles. Puedes editarlo, guardar una versión local y revisarlo según el rol sin llamar a un modelo."
                : "The draft starts from a fixture with visible sources. You can edit it, save a local version and review it by role without calling a model.",
            evidence:
              locale === "es"
                ? "Sin modelo ni proveedor · envío siempre bloqueado"
                : "No model or provider · sending always blocked",
            view: "automation",
          },
          {
            phase: locale === "es" ? "07 · Tu encaje" : "07 · Your fit",
            title:
              locale === "es"
                ? "Convierte la evidencia en alcance"
                : "Turn evidence into scope",
            description:
              locale === "es"
                ? "Ya has visto operación, ingresos, canales y un copiloto supervisado como superficies ficticias. El diagnóstico traduce tus necesidades en un punto de partida Básico, Gestión o Inteligente."
                : "You have seen operations, revenue, channels and a supervised copilot as fictitious surfaces. The assessment turns your needs into a Basic, Management or Intelligent starting point.",
            evidence:
              locale === "es"
                ? "Resultado visible antes de pedir datos"
                : "Result shown before any data is requested",
            view: "home",
          },
        ];

  const assessmentHref = `${locale === "en" ? "/en/assessment/" : "/diagnostico/"}?segment=${scenario === "aurem" ? "hotels" : "managers"}&plan=${scenario === "aurem" ? "inteligente" : "gestion"}&demo=${scenario}`;

  useEffect(() => {
    if (tour === null) return;
    const step = tourSteps[Math.min(tour, tourSteps.length - 1)];
    if (step && step.view !== view) go(step.view);
  }, []);

  const startTour = () => {
    setTour(0);
    go(tourSteps[0]!.view);
    patch({ tourMode: "guided", tourStep: 0 });
    track("demo_mode_select", { locale, demo: scenario, flow: "guided" });
  };
  const resumeTour = () => {
    const step = state.tourStep ?? 0;
    setTour(step);
    go(tourSteps[Math.min(step, tourSteps.length - 1)]!.view);
  };
  const closeTour = () => {
    patch({ tourStep: tour });
    setTour(null);
  };
  const advanceTour = () => {
    if (tour === null) return;
    const next = tour + 1;
    track("demo_step_complete", {
      locale,
      demo: scenario,
      flow: "guided",
      step_index: tour + 1,
    });
    if (next >= tourSteps.length) {
      setTour(null);
      patch({
        tourStep: null,
        completedFlows: [...new Set([...state.completedFlows, "guided-tour"])],
      });
      track("demo_flow_complete", { locale, demo: scenario, flow: "guided" });
    } else {
      setTour(next);
      patch({ tourStep: next });
      go(tourSteps[next]!.view);
    }
  };
  const finishTour = (destination: "workspace" | "assessment") => {
    setTour(null);
    patch({
      tourStep: null,
      completedFlows: [...new Set([...state.completedFlows, "guided-tour"])],
    });
    track("demo_flow_complete", { locale, demo: scenario, flow: "guided" });
    if (destination === "assessment")
      track("demo_cta", {
        locale,
        demo: scenario,
        plan: scenario === "aurem" ? "inteligente" : "gestion",
        source_section: "guided_tour",
      });
  };

  return (
    <div className="dash">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <div className="dash-brand">
          <span>{brand}</span>
          <small>Logic2B Estancias · {level}</small>
        </div>
        <button
          className="sidebar-close"
          onClick={() => setMobile(false)}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        <nav aria-label={locale === "es" ? "Gestor" : "Workspace"}>
          {availableViews.map((item) => {
            const Icon = icons[item];
            return (
              <button
                key={item}
                className={item === view ? "active" : ""}
                onClick={() => go(item)}
              >
                <Icon size={17} />
                <span>{labelFor(scenario, locale, item)}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <a href={`${locale === "en" ? "/en" : ""}/demos/${scenario}/`}>
            {locale === "es" ? "Volver a la web demo" : "Back to demo website"}{" "}
            ←
          </a>
          <a href={`${locale === "en" ? "/en/" : "/"}#contacto`}>
            {locale === "es" ? "Contacto comercial" : "Commercial contact"} ↗
          </a>
          <span>
            {locale === "es"
              ? "Datos ficticios · sin integraciones"
              : "Fictitious data · no integrations"}
          </span>
        </div>
      </aside>
      {mobile && (
        <button
          className="backdrop"
          onClick={() => setMobile(false)}
          aria-label="Cerrar menú"
        />
      )}
      <main className="dash-main">
        <header className="dash-top">
          <button
            className="mobile-menu"
            onClick={() => setMobile(true)}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <label className="property-select">
            <span className="sr-only">
              {locale === "es" ? "Propiedad" : "Property"}
            </span>
            <select
              value={state.selectedProperty}
              onChange={(e) => patch({ selectedProperty: e.target.value })}
            >
              <option value="all">
                {locale === "es" ? "Todas las propiedades" : "All properties"}
              </option>
              {properties[scenario].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          {(scenario === "aurem" || view === "website") && (
            <label className="role-select">
              <span className="sr-only">{locale === "es" ? "Rol" : "Role"}</span>
              <select
                value={state.role}
                onChange={(e) => patch({ role: e.target.value as DemoRole })}
              >
                <option value="direction">
                  {locale === "es" ? "Dirección" : "Direction"}
                </option>
                <option value="reception">
                  {locale === "es" ? "Recepción" : "Reception"}
                </option>
                {scenario === "aurem" && (
                  <option value="cleaning">
                    {locale === "es" ? "Limpieza" : "Cleaning"}
                  </option>
                )}
              </select>
            </label>
          )}
          <button
            className="tour-button"
            onClick={
              state.tourMode === "guided" && state.tourStep !== null
                ? resumeTour
                : startTour
            }
          >
            <Sparkles size={16} />
            {state.tourMode === "guided" && state.tourStep !== null
              ? locale === "es"
                ? "Reanudar recorrido"
                : "Resume tour"
              : locale === "es"
                ? "Ver recorrido"
                : "Start tour"}
          </button>
        </header>
        <div className="demo-banner">
          <strong>
            {locale === "es"
              ? "MODO DEMO SEGURO"
              : "SAFE DEMO MODE"}
          </strong>
          <span>
            {view === "website"
              ? locale === "es"
                ? "Editor supervisado y local con contenido ficticio. Los cambios viven en memoria; no hay CMS, despliegue ni publicación real."
                : "Supervised local editor with fictitious content. Changes live in memory; there is no CMS, deployment or live publishing."
              : view === "automations"
                ? locale === "es"
                  ? "Reglas ficticias para inspección y revisión local. La ejecución permanece inactiva: no hay jobs, colas, cron, webhooks, mensajes ni proveedores."
                  : "Fictitious rules for local inspection and review. Execution remains inactive: there are no jobs, queues, cron, webhooks, messages or providers."
              : locale === "es"
                ? "Panel de solo lectura con datos ficticios. No da de alta alojamientos ni ejecuta cobros, reservas, mensajes, publicaciones o sincronizaciones."
                : "Read-only panel with fictitious data. It does not register stays or perform payments, bookings, messages, publishing or synchronisation."}
          </span>
        </div>
        <section className="dash-content">
          <div className="page-head">
            <div>
              <p>
                {level} · {brand}
              </p>
              <h1>{labelFor(scenario, locale, view)}</h1>
            </div>
            <div className="page-meta">
              <button
                type="button"
                onClick={() => openUtility("search")}
                aria-label={
                  locale === "es" ? "Buscar en el gestor" : "Search workspace"
                }
                aria-expanded={utility === "search"}
              >
                <Search size={17} />
                <span className="shortcut" aria-hidden="true">
                  /
                </span>
              </button>
              <button
                type="button"
                onClick={() => openUtility("notifications")}
                aria-label={
                  locale === "es" ? "Abrir avisos" : "Open notifications"
                }
                aria-expanded={utility === "notifications"}
              >
                <BellRing size={17} />
                <span className="notification-count">{notices.length}</span>
              </button>
            </div>
          </div>
          <ViewContent
            scenario={scenario}
            locale={locale}
            view={view}
            state={state}
            patch={patch}
            go={go}
          />
          {(view === "website" || view === "automations" || view === "channels") && (
            <a
              className={
                view === "website"
                  ? "website-diagnostic"
                  : view === "automations"
                    ? "automations-diagnostic"
                    : "channels-diagnostic"
              }
              href={assessmentHref}
              onClick={() =>
                track("demo_cta", {
                  locale,
                  demo: scenario,
                  plan: scenario === "aurem" ? "inteligente" : "gestion",
                  source_section:
                    view === "website"
                      ? "website_editor"
                      : view === "automations"
                        ? "automations"
                        : "channels_readiness",
                })
              }
            >
              {view === "website"
                ? locale === "es"
                  ? "Terminar la revisión y abrir diagnóstico"
                  : "Finish the review and open assessment"
                : view === "automations"
                  ? locale === "es"
                    ? "Cerrar la revisión y abrir diagnóstico"
                    : "Close the review and open assessment"
                  : locale === "es"
                    ? "Revisar el alcance y abrir diagnóstico"
                    : "Review scope and open assessment"}{" "}
              <ChevronRight size={16} />
            </a>
          )}
        </section>
      </main>
      {state.tourMode === "unset" && (
        <div
          className="tour-choice"
          role="dialog"
          aria-modal="true"
          aria-label={
            locale === "es"
              ? "Cómo explorar la demo"
              : "How to explore the demo"
          }
        >
          <span className="tag">
            {locale === "es"
              ? "Demo local · 3 minutos"
              : "Local demo · 3 minutes"}
          </span>
          <h2>
            {locale === "es"
              ? "¿Cómo quieres explorar?"
              : "How would you like to explore?"}
          </h2>
          <p>
            {locale === "es"
              ? scenario === "aurem"
                ? "Siete hitos conectan una llegada en riesgo con ingresos, canales y revisión humana del copiloto. Puedes pausar y reanudar durante esta visita; la exploración libre mantiene disponibles las superficies visuales del escenario."
                : "Tres hitos recorren una solicitud hasta su reserva ficticia. Puedes pausar y reanudar; la exploración libre mantiene todas las secciones disponibles."
              : scenario === "aurem"
                ? "Seven milestones connect an at-risk arrival with revenue, channels and human review of the copilot. Pause and resume during this visit; free exploration keeps the scenario’s visual surfaces available."
                : "Three milestones take an enquiry to its fictitious booking. Pause and resume at any time; free exploration keeps every area available."}
          </p>

          <div>
            <button className="primary" onClick={startTour} autoFocus>
              {locale === "es" ? "Visita guiada" : "Guided tour"}
            </button>
            <button
              onClick={() => {
                patch({ tourMode: "free" });
                track("demo_mode_select", {
                  locale,
                  demo: scenario,
                  flow: "free",
                });
              }}
            >
              {locale === "es" ? "Explorar libremente" : "Explore freely"}
            </button>
          </div>
        </div>
      )}
      {tour !== null && (
        <div
          key={tour}
          className="tour-pop"
          role="dialog"
          aria-labelledby={`tour-title-${tour}`}
        >
          <div
            className="tour-progress"
            style={{
              gridTemplateColumns: `repeat(${TOUR_STEP_COUNTS[scenario]}, minmax(0, 1fr))`,
            }}
            role="progressbar"
            aria-label={
              locale === "es" ? "Progreso del recorrido" : "Tour progress"
            }
            aria-valuemin={1}
            aria-valuemax={tourSteps.length}
            aria-valuenow={tour + 1}
          >
            {tourSteps.map((_, index) => (
              <i key={index} className={index <= tour ? "active" : ""} />
            ))}
          </div>
          <span>
            {tourSteps[tour]!.phase} · {tour + 1}/{tourSteps.length}
          </span>
          <h2 id={`tour-title-${tour}`}>{tourSteps[tour]!.title}</h2>
          <p>{tourSteps[tour]!.description}</p>
          <strong className="tour-evidence">{tourSteps[tour]!.evidence}</strong>
          <p className="tour-memory">
            {locale === "es"
              ? "El progreso solo vive durante esta visita y se restablece al recargar."
              : "Progress only lasts for this visit and resets on reload."}
          </p>
          <div className="tour-actions">
            {tour === tourSteps.length - 1 ? (
              <>
                <button onClick={() => finishTour("workspace")} autoFocus>
                  {locale === "es" ? "Seguir explorando" : "Keep exploring"}
                </button>
                <a
                  className="primary"
                  href={assessmentHref}
                  onClick={() => finishTour("assessment")}
                >
                  {locale === "es" ? "Abrir diagnóstico" : "Open assessment"}
                  <ChevronRight size={16} />
                </a>
              </>
            ) : (
              <>
                <button onClick={closeTour} autoFocus>
                  {locale === "es" ? "Pausar" : "Pause"}
                </button>
                <button className="primary" onClick={advanceTour}>
                  {locale === "es" ? "Siguiente hito" : "Next milestone"}
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {view !== "website" && view !== "automations" && view !== "channels" && (
        <a
          className="demo-conversion"
          href={assessmentHref}
          onClick={() =>
            track("demo_cta", {
              locale,
              demo: scenario,
              plan: scenario === "aurem" ? "inteligente" : "gestion",
              source_section: "persistent",
            })
          }
        >
          {locale === "es" ? "Abrir diagnóstico" : "Open assessment"}{" "}
          →
        </a>
      )}
      {utility && (
        <>
          <button
            className="utility-backdrop"
            type="button"
            onClick={closeUtility}
            aria-label={locale === "es" ? "Cerrar panel" : "Close panel"}
          />
          <aside
            className="utility-panel"
            role="dialog"
            aria-modal="true"
            aria-label={
              utility === "search"
                ? locale === "es"
                  ? "Búsqueda rápida"
                  : "Quick search"
                : locale === "es"
                  ? "Avisos operativos"
                  : "Operational notifications"
            }
          >
            <header>
              <div>
                <span>
                  {utility === "search"
                    ? locale === "es"
                      ? "Navegación"
                      : "Navigation"
                    : locale === "es"
                      ? "Ahora"
                      : "Now"}
                </span>
                <h2>
                  {utility === "search"
                    ? locale === "es"
                      ? "Buscar en el gestor"
                      : "Search workspace"
                    : locale === "es"
                      ? "Avisos operativos"
                      : "Operational notifications"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeUtility}
                aria-label={locale === "es" ? "Cerrar" : "Close"}
              >
                <X size={18} />
              </button>
            </header>
            {utility === "search" ? (
              <div className="utility-search">
                <label>
                  <Search size={17} />
                  <span className="sr-only">
                    {locale === "es"
                      ? "Buscar una sección"
                      : "Search a section"}
                  </span>
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={
                      locale === "es"
                        ? "Reservas, limpieza, informes…"
                        : "Bookings, cleaning, reports…"
                    }
                  />
                </label>
                <div className="utility-results">
                  {searchResults.map((item) => {
                    const Icon = icons[item];
                    return (
                      <button type="button" key={item} onClick={() => go(item)}>
                        <Icon size={18} />
                        <span>{labelFor(scenario, locale, item)}</span>
                        <ChevronRight size={16} />
                      </button>
                    );
                  })}
                  {searchResults.length === 0 && (
                    <p>
                      {locale === "es"
                        ? "No hay secciones que coincidan."
                        : "No matching sections."}
                    </p>
                  )}
                </div>
                <small>
                  {locale === "es"
                    ? "Pulsa / para abrir · Esc para cerrar"
                    : "Press / to open · Esc to close"}
                </small>
              </div>
            ) : (
              <div className="notice-list">
                {notices.map((notice) => (
                  <button
                    type="button"
                    key={`${notice.view}-${notice.title}`}
                    onClick={() => go(notice.view)}
                  >
                    <i className={notice.urgent ? "urgent" : ""}></i>
                    <span>
                      <strong>{notice.title}</strong>
                      <small>{notice.detail}</small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
}

function ViewContent({
  scenario,
  locale,
  view,
  state,
  patch,
  go,
}: {
  scenario: Scenario;
  locale: Locale;
  view: View;
  state: DemoState;
  patch: (next: Partial<DemoState>) => void;
  go: (view: View) => void;
}) {
  if (view === "home")
    return <Home scenario={scenario} locale={locale} state={state} go={go} />;
  if (view === "enquiries")
    return <Enquiries locale={locale} state={state} />;
  if (view === "planning")
    return (
      <Planning
        scenario={scenario}
        locale={locale}
        state={state}
      />
    );
  if (view === "bookings")
    return <Bookings scenario={scenario} locale={locale} state={state} />;
  if (view === "guests")
    return <TablePage scenario={scenario} locale={locale} state={state} />;
  if (view === "cleaning")
    return (
      <Cleaning
        scenario={scenario}
        locale={locale}
        state={state}
      />
    );
  if (view === "maintenance")
    return <Maintenance locale={locale} state={state} />;
  if (view === "website")
    return (
      <WebsiteEditor
        scenario={scenario}
        locale={locale}
        state={state}
        patch={patch}
      />
    );
  if (view === "channels")
    return <Channels locale={locale} />;
  if (view === "automations")
    return <Automations locale={locale} state={state} />;
  if (view === "automation")
    return <Automation locale={locale} state={state} patch={patch} />;
  if (view === "control")
    return <Control locale={locale} state={state} go={go} />;
  if (view === "reports")
    return <Reports scenario={scenario} locale={locale} go={go} />;
  return <SettingsPage locale={locale} scenario={scenario} />;
}

function Home({
  scenario,
  locale,
  state,
  go,
}: {
  scenario: Scenario;
  locale: Locale;
  state: DemoState;
  go: (v: View) => void;
}) {
  const cards =
    scenario === "aurem"
      ? [
          [
            locale === "es" ? "Llegadas hoy" : "Arrivals today",
            "18",
            "planning",
          ],
          [
            locale === "es" ? "Habitaciones listas" : "Rooms ready",
            state.cleaning === "ready" ? "93/96" : "92/96",
            "cleaning",
          ],
          [
            locale === "es" ? "Ocupación 28 días" : "28-day occupancy",
            "89%",
            "reports",
          ],
          [locale === "es" ? "Canales" : "Channels", "4 demo", "channels"],
        ]
      : [
          [
            locale === "es" ? "Solicitudes nuevas" : "New enquiries",
            state.enquiry === "new" ? "4" : "3",
            "enquiries",
          ],
          [
            locale === "es" ? "Propiedades ocupadas" : "Occupied properties",
            "6/8",
            "planning",
          ],
          [
            locale === "es" ? "Entradas esta semana" : "Arrivals this week",
            "5",
            "bookings",
          ],
          [
            locale === "es" ? "Huéspedes de ejemplo" : "Sample guests",
            "12",
            "guests",
          ],
        ];
  const stayDetail = `${state.stay.guests} ${locale === "es" ? "huéspedes" : "guests"} · ${stayRange(state, locale)}`;
  return (
    <>
      <div className="metric-grid">
        {cards.map(([name, value, target]) => (
          <button key={name} onClick={() => go(target as View)}>
            <span>{name}</span>
            <strong>{value}</strong>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
      <div className="dash-grid">
        <article className="panel wide">
          <h2>
            {locale === "es" ? "Prioridades del día" : "Today’s priorities"}
          </h2>
          <Task
            tone={scenario === "aurem" && state.cleaning === "ready" ? undefined : "urgent"}
            title={
              scenario === "aurem"
                ? state.cleaning === "ready"
                  ? locale === "es" ? "408 · lista para la entrada" : "408 · ready for arrival"
                  : locale === "es" ? "408 · entrada a las 15:00" : "408 · arrival at 15:00"
                : locale === "es"
                  ? `Solicitud de ${firstName(state.stay.name)} no cabe en Casa Aira`
                  : `${firstName(state.stay.name)}’s enquiry does not fit Casa Aira`
            }
            detail={
              scenario === "aurem"
                ? state.cleaning === "ready"
                  ? locale === "es" ? `Entrada de ${state.stay.name} · validada por Recepción` : `${state.stay.name} arrival · validated by Reception`
                  : locale === "es" ? `Entrada de ${state.stay.name} · limpieza pendiente` : `${state.stay.name} arrival · cleaning pending`
                : stayDetail
            }
          />
          <Task
            title={
              locale === "es"
                ? "Contexto ficticio de llegada"
                : "Fictitious arrival context"
            }
            detail={
              locale === "es"
                ? "Sin pago ni confirmación externa"
                : "No payment or external confirmation"
            }
          />
        </article>
        <article className="panel">
          <h2>{locale === "es" ? "Próximas decisiones" : "Next decisions"}</h2>
          <ol className="decision-list">
            <li>
              <span>09:30</span>
              {locale === "es"
                ? "Validar dos salidas"
                : "Validate two departures"}
            </li>
            <li>
              <span>11:00</span>
              {locale === "es"
                ? "Revisar disponibilidad"
                : "Review availability"}
            </li>
            <li>
              <span>14:00</span>
              {locale === "es" ? "Preparar relevo" : "Prepare handover"}
            </li>
          </ol>
        </article>
      </div>
    </>
  );
}

function Enquiries({
  locale,
  state,
}: {
  locale: Locale;
  state: DemoState;
}) {
  const status = locale === "es" ? "Caso ficticio" : "Fictitious case";
  return (
    <div className="dash-grid">
      <article className="panel wide">
        <div className="panel-head">
          <div>
            <div className="tag-row">
              <span className={`tag ${state.enquiry}`}>{status}</span>
              {state.stay.source === "website" && (
                <span className="tag source">
                  {locale === "es" ? "Desde la web demo" : "From demo website"}
                </span>
              )}
            </div>
            <h2>
              {state.stay.name} · {state.stay.guests}{" "}
              {locale === "es" ? "huéspedes" : "guests"}
            </h2>
            <p>{stayRange(state, locale)} · Casa Aira</p>
          </div>
          <strong>REQ-024</strong>
        </div>
        <div className="alert">
          {locale === "es"
            ? "Casa Aira no está disponible la primera noche. Casa Bruma encaja en fechas, capacidad y precio."
            : "Casa Aira is unavailable on the first night. Casa Bruma fits dates, capacity and price."}
        </div>
        <div className="comparison">
          <div>
            <span>Casa Aira</span>
            <b>{locale === "es" ? "Sin encaje" : "No fit"}</b>
            <small>
              {locale === "es"
                ? "Ocupada la primera noche"
                : "Occupied on the first night"}
            </small>
          </div>
          <div className="recommended">
            <span>Casa Bruma</span>
            <b>€ {state.stay.amount}</b>
            <small>
              {locale === "es"
                ? "Disponible · estancia completa"
                : "Available · full stay"}
            </small>
          </div>
        </div>
        <div className="actions">
          <span className="permission-note">
            {locale === "es"
              ? "Vista de solo lectura: compara el caso y la alternativa sin crear ni convertir reservas."
              : "Read-only view: compare the case and alternative without creating or converting bookings."}
          </span>
        </div>
      </article>
      <article className="panel">
        <h2>{locale === "es" ? "Contexto conservado" : "Context preserved"}</h2>
        <p className="body-copy">
          {locale === "es"
            ? "El panel representa fechas, huéspedes y preferencias con un fixture precargado; no mueve ni guarda datos de visitantes."
            : "The panel represents dates, guests and preferences with a preloaded fixture; it does not move or store visitor data."}
        </p>
      </article>
    </div>
  );
}

function Planning({
  scenario,
  locale,
  state,
}: {
  scenario: Scenario;
  locale: Locale;
  state: DemoState;
}) {
  const rows =
    scenario === "aurem"
      ? [
          "401 · Classic",
          "402 · Classic",
          "403 · Classic",
          "404 · Corner",
          "405 · Corner",
          "406 · Terrace",
          "407 · Terrace",
          "408 · Terrace",
        ]
      : properties.terrava;
  return (
    <div className="panel planning">
      <div className="planning-head">
        <div>
          <h2>{locale === "es" ? "Agosto · 14 días" : "August · 14 days"}</h2>
          <p>
            {state.selectedProperty === "all"
              ? locale === "es"
                ? "Todas las propiedades"
                : "All properties"
              : state.selectedProperty}
          </p>
        </div>
        <span className="status-line">
          {locale === "es"
            ? "Calendario ficticio · EUR"
            : "Fictitious calendar · EUR"}
        </span>
      </div>
      <div className="tape" role="table" aria-label={locale === "es" ? "Ocupación ficticia de 14 días" : "Fictitious 14-day occupancy"}>
        <div className="tape-days" role="row">
          <span role="columnheader" aria-label={locale === "es" ? "Alojamiento" : "Property"}></span>
          {Array.from({ length: 14 }, (_, i) => (
            <b role="columnheader" key={i}>{18 + i}</b>
          ))}
        </div>
        {rows.map((row, r) => (
          <div className="tape-row" role="row" key={row}>
            <span role="rowheader">{row}</span>
            {Array.from({ length: 14 }, (_, d) => (
              <i
                role="cell"
                key={d}
                className={
                  d >= r % 5 && d < (r % 5) + 4
                    ? "occupied"
                    : scenario === "aurem" && row.startsWith("408") && d === 3
                      ? `clean-${state.cleaning}`
                      : ""
                }
              >
                {scenario === "aurem" && row.startsWith("408") && d === 3
                  ? "!"
                  : ""}
              </i>
            ))}
          </div>
        ))}
      </div>
      {scenario === "terrava" && (
        <div className="planning-action stay-operation">
          <div>
            <span className="tag">
              {locale === "es"
                ? "Demo · operación de estancia"
                : "Demo · stay operation"}
            </span>
            <strong>
              {state.stay.name} · Casa Bruma
            </strong>
            <span>
              {locale === "es" ? "Alternativa ficticia visible" : "Fictitious alternative shown"}
            </span>
          </div>
          <div className="actions">
            <span className="permission-note">
              {locale === "es"
                ? "Solo visualización · sin cambios de inventario o tarifa"
                : "View only · no inventory or rate changes"}
            </span>
          </div>
        </div>
      )}
      {scenario === "aurem" && (
        <div className="planning-action">
          <div>
            <strong>
              408 ·{" "}
              {state.cleaning === "ready"
                ? locale === "es"
                  ? "Lista para entrada"
                  : "Ready for arrival"
                : locale === "es"
                  ? "Preparación pendiente"
                  : "Preparation pending"}
            </strong>
            <span>
              {locale === "es"
                ? "Entrada prevista 15:00"
                : "Expected arrival 15:00"}
            </span>
          </div>
          <span className="permission-note">
            {locale === "es"
              ? "Estado ficticio · no valida habitaciones"
              : "Fictitious status · does not validate rooms"}
          </span>
        </div>
      )}
    </div>
  );
}

function Bookings({
  scenario,
  locale,
  state,
}: {
  scenario: Scenario;
  locale: Locale;
  state: DemoState;
}) {
  const extra =
    scenario === "terrava" && state.enquiry === "booked"
      ? [
          [
            "TER-104",
            state.stay.name,
            "Casa Bruma",
            stayRange(state, locale),
            locale === "es" ? "Confirmada" : "Confirmed",
          ],
        ]
      : [];
  const rows =
    scenario === "aurem"
      ? [
          [
            "AUR-812",
            state.stay.name,
            "Terrace · 408",
            stayRange(state, locale),
            locale === "es" ? "Entrada hoy" : "Arrival today",
          ],
          [
            "AUR-809",
            "M. Laurent",
            "Classic · 403",
            "14–16 Aug",
            locale === "es" ? "Confirmada" : "Confirmed",
          ],
          [
            "AUR-798",
            "Sofia Klein",
            "Corner · 405",
            "13–15 Aug",
            locale === "es" ? "En casa" : "In house",
          ],
        ]
      : [
          [
            "TER-101",
            "Irene Vidal",
            "Casa Linde",
            "18–22 Aug",
            locale === "es" ? "En casa" : "In house",
          ],
          [
            "TER-102",
            "Luis Martín",
            "Casa Era",
            "19–23 Aug",
            locale === "es" ? "Confirmada" : "Confirmed",
          ],
          [
            "TER-103",
            "Mina Olsen",
            "Casa Faya",
            "20–25 Aug",
            locale === "es" ? "Confirmada" : "Confirmed",
          ],
          ...extra,
        ];
  return (
    <>
      {state.stay.source === "website" && (
        <div className="journey-note">
          <Check size={16} />
          <span>
            {locale === "es"
              ? `${state.stay.name} llega desde la reserva simulada de la web.`
              : `${state.stay.name} comes from the website’s simulated booking.`}
          </span>
        </div>
      )}
      <Table
        rows={rows}
        headings={
          locale === "es"
            ? ["Reserva", "Titular", "Unidad", "Estancia", "Estado"]
            : ["Booking", "Lead guest", "Unit", "Stay", "Status"]
        }
      />
    </>
  );
}

function TablePage({
  scenario,
  locale,
  state,
}: {
  scenario: Scenario;
  locale: Locale;
  state: DemoState;
}) {
  const rows = [
    [
      state.stay.name,
      state.stay.email,
      locale === "es" ? "Dato de la demo" : "Demo data",
      scenario === "aurem"
        ? locale === "es"
          ? "Pre-check-in preparado"
          : "Pre-check-in prepared"
        : locale === "es"
          ? "Consulta recibida"
          : "Enquiry received",
    ],
    [
      "M. Laurent",
      "laurent@example.test",
      "Francia",
      locale === "es" ? "En casa" : "In house",
    ],
  ];
  return (
    <Table
      rows={rows}
      headings={
        locale === "es"
          ? ["Huésped", "Email ficticio", "Origen", "Estado"]
          : ["Guest", "Fictitious email", "Source", "Status"]
      }
    />
  );
}

function Cleaning({
  scenario,
  locale,
  state,
}: {
  scenario: Scenario;
  locale: Locale;
  state: DemoState;
}) {
  if (scenario === "terrava")
    return (
      <div className="clean-list">
        <CleanCard
          name="Casa Bruma"
          status={locale === "es" ? "Lista" : "Ready"}
          detail={locale === "es" ? "Revisada 10:42" : "Reviewed 10:42"}
        />
        <CleanCard
          name="Casa Linde"
          status={locale === "es" ? "Pendiente" : "Pending"}
          detail={
            locale === "es"
              ? "Salida prevista 11:00"
              : "Departure expected 11:00"
          }
        />
        <CleanCard
          name="Casa Era"
          status={locale === "es" ? "En preparación" : "In preparation"}
          detail={
            locale === "es"
              ? "Limpieza básica · Gestión"
              : "Basic cleaning · Manage"
          }
        />
      </div>
    );
  const title = {
    pending: locale === "es" ? "Pendiente" : "Pending",
    in_progress: locale === "es" ? "En curso" : "In progress",
    review: locale === "es" ? "Lista para revisar" : "Ready for review",
    ready: locale === "es" ? "Validada" : "Validated",
  }[state.cleaning];
  return (
    <div className="dash-grid">
      <article className="panel wide">
        <div className="panel-head">
          <div>
            <span className={`tag ${state.cleaning}`}>{title}</span>
            <h2>408 · Terrace</h2>
            <p>
              {locale === "es"
                ? "Salida 11:08 · entrada 15:00"
                : "Departure 11:08 · arrival 15:00"}
            </p>
          </div>
          <BedDouble size={28} />
        </div>
        <ul className="checklist">
          <li className={state.cleaning !== "pending" ? "checked" : ""}>
            <Check size={16} />
            {locale === "es" ? "Ropa y baño" : "Linen and bathroom"}
          </li>
          <li
            className={
              ["review", "ready"].includes(state.cleaning) ? "checked" : ""
            }
          >
            <Check size={16} />
            {locale === "es" ? "Superficies y minibar" : "Surfaces and minibar"}
          </li>
          <li className={state.cleaning === "ready" ? "checked" : ""}>
            <Check size={16} />
            {locale === "es"
              ? "Validación de recepción"
              : "Reception validation"}
          </li>
        </ul>
        <div className="actions">
          <span className="permission-note">
            {locale === "es"
              ? "Checklist de ejemplo · no asigna, valida ni actualiza habitaciones"
              : "Sample checklist · does not assign, validate or update rooms"}
          </span>
        </div>
      </article>
      <article className="panel">
        <h2>
          {locale === "es"
            ? "Responsabilidad visible"
            : "Visible responsibility"}
        </h2>
        <p className="body-copy">
          {locale === "es"
            ? "La vista ilustra responsabilidades y estados con datos ficticios; no registra quién ejecuta tareas."
            : "The view illustrates responsibilities and statuses with fictitious data; it records no task execution."}
        </p>
      </article>
    </div>
  );
}

function Maintenance({
  locale,
  state,
}: {
  locale: Locale;
  state: DemoState;
}) {
  const labels = {
    new: locale === "es" ? "Nueva" : "New",
    assigned: locale === "es" ? "Asignada" : "Assigned",
    resolved: locale === "es" ? "Resuelta" : "Resolved",
  };
  return (
    <div className="dash-grid">
      <article className="panel wide">
        <div className="panel-head">
          <div>
            <span className={`tag ${state.maintenance}`}>
              {labels[state.maintenance]}
            </span>
            <h2>
              {locale === "es"
                ? "Climatización irregular · 512"
                : "Irregular temperature · 512"}
            </h2>
            <p>
              {locale === "es"
                ? "Prioridad alta · detectada antes de la entrada de mañana"
                : "High priority · detected before tomorrow’s arrival"}
            </p>
          </div>
          <Wrench size={28} />
        </div>
        <div className="incident-timeline">
          <span className="done">
            <Check size={15} />
            {locale === "es" ? "Incidencia registrada" : "Incident recorded"}
          </span>
          <span className={state.maintenance !== "new" ? "done" : ""}>
            <Check size={15} />
            {locale === "es"
              ? "Asignada a equipo técnico"
              : "Assigned to technical team"}
          </span>
          <span className={state.maintenance === "resolved" ? "done" : ""}>
            <Check size={15} />
            {locale === "es"
              ? "Revisión y habitación liberada"
              : "Reviewed and room released"}
          </span>
        </div>
        <div className="actions">
          <span className="permission-note">
            {locale === "es"
              ? "Timeline ficticio · no asigna ni resuelve incidencias"
              : "Fictitious timeline · does not assign or resolve incidents"}
          </span>
        </div>
      </article>
      <article className="panel">
        <span className="tag">{locale === "es" ? "Demo" : "Demo"}</span>
        <h2>{locale === "es" ? "Impacto visible" : "Visible impact"}</h2>
        <p className="body-copy">
          {locale === "es"
            ? "La incidencia muestra prioridad, responsable y efecto hipotético. No modifica inventario ni comunica con proveedores."
            : "The incident shows priority, ownership and hypothetical impact. It changes no inventory and contacts no provider."}
        </p>
      </article>
    </div>
  );
}

function WebsiteEditor({
  scenario,
  locale,
  state,
  patch,
}: {
  scenario: Scenario;
  locale: Locale;
  state: DemoState;
  patch: (n: Partial<DemoState>) => void;
}) {
  const allowedToApprove = canOperate(state.role, "website");
  const readinessLabels: Record<
    WebsitePublicationReadinessField,
    { es: string; en: string }
  > = {
    owner: { es: "Propietario", en: "Owner" },
    permissions: { es: "Permisos", en: "Permissions" },
    repositoryReference: {
      es: "Referencia de repositorio y entorno",
      en: "Repository and environment reference",
    },
    version: { es: "Rama o versión", en: "Branch or version" },
    isolatedPreview: { es: "Preview aislada", en: "Isolated preview" },
    contentValidation: {
      es: "Validación de contenido",
      en: "Content validation",
    },
    failureCases: { es: "Casos de fallo", en: "Failure cases" },
    audit: { es: "Auditoría", en: "Audit" },
    acceptance: { es: "Aceptación", en: "Acceptance" },
    changeWindow: { es: "Ventana de cambio", en: "Change window" },
    killSwitch: { es: "Kill switch", en: "Kill switch" },
    rollback: { es: "Reversión", en: "Rollback" },
  };
  const updateDraft = (draftTitle: string) =>
    patch({
      website: {
        ...state.website,
        draftTitle,
        status: draftTitle === state.website.publishedTitle ? "clean" : "draft",
      },
    });
  const approve = () => {
    if (!allowedToApprove) return;
    patch({
      website: {
        publishedTitle: state.website.draftTitle,
        draftTitle: state.website.draftTitle,
        status: "published",
      },
      completedFlows: [...new Set([...state.completedFlows, "website-editor"])],
    });
    track("demo_flow_complete", {
      locale,
      demo: scenario,
      flow: "website-editor",
    });
  };
  const revert = () =>
    patch({
      website: {
        ...state.website,
        draftTitle: state.website.publishedTitle,
        status: "clean",
      },
    });
  return (
    <div className="website-experience">
      <div className="website-editor">
        <article className="panel editor-controls">
          <div className="panel-head">
            <div>
              <span className={`tag ${state.website.status}`}>
                {state.website.status === "draft"
                  ? locale === "es"
                    ? "Borrador pendiente"
                    : "Draft pending"
                  : state.website.status === "published"
                    ? locale === "es"
                      ? "Aprobada en esta demo"
                      : "Approved in this demo"
                    : locale === "es"
                      ? "Versión inicial"
                      : "Initial version"}
              </span>
              <h2>
                {locale === "es"
                  ? "Portada · titular en revisión"
                  : "Homepage · headline under review"}
              </h2>
            </div>
            <PanelsTopLeft size={25} />
          </div>
          <ol className="editor-workflow" aria-label={locale === "es" ? "Flujo de revisión" : "Review flow"}>
            <li aria-current={state.website.status === "clean" ? "step" : undefined}>
              <span>01</span>{locale === "es" ? "Edición local" : "Local edit"}
            </li>
            <li aria-current={state.website.status === "draft" ? "step" : undefined}>
              <span>02</span>{locale === "es" ? "Borrador" : "Draft"}
            </li>
            <li aria-current={state.website.status === "published" ? "step" : undefined}>
              <span>03</span>{locale === "es" ? "Aprobación humana" : "Human approval"}
            </li>
          </ol>
          <label>
            {locale === "es" ? "Texto del hero" : "Hero copy"}
            <textarea
              value={state.website.draftTitle}
              maxLength={100}
              rows={3}
              onChange={(event) => updateDraft(event.target.value)}
            />
          </label>
          <div className="actions">
            <button onClick={revert} disabled={state.website.status !== "draft"}>
              {locale === "es" ? "Descartar borrador" : "Discard draft"}
            </button>
            <button
              className="primary"
              onClick={approve}
              disabled={
                !allowedToApprove ||
                state.website.status !== "draft" ||
                !state.website.draftTitle.trim()
              }
            >
              {locale === "es"
                ? "Aprobar vista local"
                : "Approve local preview"}
            </button>
          </div>
          <p className="permission-note" role="note">
            {allowedToApprove
              ? locale === "es"
                ? "Dirección puede aprobar esta vista ficticia. La aprobación solo cambia la memoria temporal de esta visita."
                : "Direction can approve this fictitious preview. Approval only changes this visit’s temporary memory."
              : locale === "es"
                ? "Recepción puede preparar el borrador; Dirección debe aprobarlo. Nada sale de esta visita."
                : "Reception can prepare the draft; Direction must approve it. Nothing leaves this visit."}
          </p>
          <p className="website-boundary">
            {locale === "es"
              ? "Sin CMS, repositorio, despliegue, proveedor ni escritura HTTP. Recargar restaura el fixture."
              : "No CMS, repository, deployment, provider or HTTP write. Reloading restores the fixture."}
          </p>
        </article>
        <article className={`website-preview ${scenario}`}>
          <span>
            {scenario === "aurem" ? "Aurem Hotel" : "Terrava Collection"}
          </span>
          <div>
            <small>{locale === "es" ? "Vista previa" : "Preview"}</small>
            <h2>{state.website.draftTitle}</h2>
            <span className="website-preview-cta">
              {locale === "es"
                ? "Consulta de ejemplo · sin acción"
                : "Sample enquiry · no action"}
            </span>
          </div>
        </article>
      </div>
      <section
        className="panel website-readiness"
        aria-labelledby="website-readiness-title"
        data-website-publication-readiness
      >
        <div className="website-readiness-intro">
          <span className="tag">
            {locale === "es"
              ? "Contrato de preparación"
              : "Readiness contract"}
          </span>
          <h2 id="website-readiness-title">
            {locale === "es"
              ? "Expediente antes de publicar"
              : "File required before publishing"}
          </h2>
          <p>
            {locale === "es"
              ? "Aprobar la vista local de arriba no valida ninguna condición de publicación. Las doce requieren infraestructura, pruebas y aceptación separadas."
              : "Approving the local preview above validates no publication condition. All twelve require separate infrastructure, tests and acceptance."}
          </p>
          <div className="website-readiness-zero">
            <span>
              {locale === "es"
                ? "Condiciones validadas"
                : "Validated conditions"}
            </span>
            <strong>0 / {WEBSITE_PUBLICATION_READINESS_FIELDS.length}</strong>
          </div>
        </div>
        <ol>
          {WEBSITE_PUBLICATION_READINESS_FIELDS.map((field, index) => (
            <li key={field} data-publication-readiness-field={field}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{readinessLabels[field][locale]}</strong>
                <p>
                  {WEBSITE_PUBLICATION_READINESS.requirements[field][locale]}
                </p>
                <small>{locale === "es" ? "Por validar" : "Not validated"}</small>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Channels({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState<ChannelReadinessCandidateId>("hotel-distribution");
  const active = CHANNEL_READINESS_CONTRACTS.find(({ id }) => id === selected) ?? CHANNEL_READINESS_CONTRACTS[0];
  const requirementLabels: Record<ChannelReadinessField, { es: string; en: string }> = {
    owner: { es: "Propietario", en: "Owner" },
    permissions: { es: "Permisos", en: "Permissions" },
    credentialReference: { es: "Referencia de credenciales", en: "Credential reference" },
    mapping: { es: "Mapeo", en: "Mapping" },
    sandboxCases: { es: "Casos sandbox", en: "Sandbox cases" },
    idempotency: { es: "Idempotencia", en: "Idempotency" },
    reconciliation: { es: "Reconciliación", en: "Reconciliation" },
    failureRecovery: { es: "Fallos y reintentos", en: "Failures and retries" },
    audit: { es: "Auditoría", en: "Audit" },
    acceptance: { es: "Aceptación", en: "Acceptance" },
    killSwitch: { es: "Kill switch", en: "Kill switch" },
    rollback: { es: "Reversión", en: "Rollback" },
  };
  return (
    <>
      <div className="integration-note channel-boundary" role="note">
        <strong>
          {locale === "es" ? "0 canales conectados" : "0 connected channels"}
        </strong>
        <span>
          {locale === "es"
            ? "La matriz y los expedientes son escenarios locales. No leen ni publican inventario, tarifas, reservas o mensajes; tampoco contienen marcas validadas, cuentas, credenciales o secretos."
            : "The matrix and readiness files are local scenarios. They neither read nor publish inventory, rates, bookings or messages, and contain no validated brands, accounts, credentials or secrets."}
        </span>
      </div>
      <div className="channel-metrics" aria-label={locale === "es" ? "Resumen de canales ficticios" : "Fictitious channel summary"}>
        <div><span>{locale === "es" ? "Conectados" : "Connected"}</span><strong>0</strong></div>
        <div><span>{locale === "es" ? "Categorías candidatas" : "Candidate categories"}</span><strong>{CHANNEL_READINESS_CONTRACTS.length}</strong></div>
        <div><span>{locale === "es" ? "Listas para activar" : "Ready to activate"}</span><strong>0</strong></div>
        <div><span>{locale === "es" ? "Publicaciones" : "Publications"}</span><strong>0</strong></div>
      </div>
      <div className="channel-workspace">
        <article className="panel table-wrap channel-matrix">
          <div className="channel-matrix-head">
            <span className="tag">{locale === "es" ? "Categorías sin marca" : "Unbranded categories"}</span>
            <h2 id="channel-matrix-title">{locale === "es" ? "Matriz de preparación" : "Readiness matrix"}</h2>
            <p>{locale === "es" ? "Selecciona una categoría para inspeccionar su contrato. Ninguna representa un proveedor validado." : "Select a category to inspect its contract. None represents a validated provider."}</p>
          </div>
          <table aria-labelledby="channel-matrix-title">
            <thead><tr>
              <th>{locale === "es" ? "Categoría" : "Category"}</th>
              <th>{locale === "es" ? "Disponibilidad" : "Availability"}</th>
              <th>{locale === "es" ? "Tarifas" : "Rates"}</th>
              <th>{locale === "es" ? "Reservas" : "Bookings"}</th>
              <th>{locale === "es" ? "Mensajes" : "Messages"}</th>
              <th>{locale === "es" ? "Conexión" : "Connection"}</th>
            </tr></thead>
            <tbody>
              {CHANNEL_READINESS_CONTRACTS.map((contract) => (
                <tr key={contract.id} className={selected === contract.id ? "selected" : ""}>
                  <td><button type="button" data-channel-candidate={contract.id} aria-pressed={selected === contract.id} onClick={() => setSelected(contract.id)}><strong>{contract.label[locale]}</strong><small>{contract.status[locale]}</small></button></td>
                  {(["availability", "rates", "bookings", "messages"] as const).map((field) => <td key={`${contract.id}-${field}`}><span className="channel-cell">{contract.coverage[field][locale]}</span></td>)}
                  <td><span className="channel-cell disconnected">{locale === "es" ? "No conectado" : "Not connected"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <aside className="panel channel-review" aria-live="polite">
          <span>{locale === "es" ? "Expediente local" : "Local readiness file"}</span>
          <h2>{active.label[locale]}</h2>
          <strong>{active.status[locale]}</strong>
          <p>{active.detail[locale]}</p>
          <div className="channel-readiness-zero">
            <span>{locale === "es" ? "Condiciones validadas" : "Validated conditions"}</span>
            <strong>0 / {CHANNEL_READINESS_FIELDS.length}</strong>
          </div>
          <small>
            {locale === "es"
              ? "Solo lectura · sin proveedor elegido, validación, activación o publicación"
              : "Read-only · no selected provider, validation, activation or publication"}
          </small>
        </aside>
      </div>
      <section className="panel channel-requirements" aria-labelledby="channel-requirements-title">
        <div>
          <span className="tag">{locale === "es" ? "Contrato de preparación" : "Readiness contract"}</span>
          <h2 id="channel-requirements-title">{locale === "es" ? "Expediente antes de activar" : "File required before activation"}</h2>
          <p>{locale === "es" ? "Las doce condiciones están documentadas como requisitos, pero cero han sido validadas contra un proveedor real." : "All twelve conditions are documented as requirements, but zero have been validated against a live provider."}</p>
        </div>
        <ol data-channel-readiness={active.id}>
          {CHANNEL_READINESS_FIELDS.map((field, index) => <li key={field} data-readiness-field={field}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{requirementLabels[field][locale]}</strong><p>{active.requirements[field][locale]}</p><small>{locale === "es" ? "Por validar" : "Not validated"}</small></div></li>)}
        </ol>
      </section>
    </>
  );
}

function Automations({
  locale,
  state,
}: {
  locale: Locale;
  state: DemoState;
}) {
  const [selected, setSelected] = useState<AutomationRuleId>("arrival");
  const [reviewed, setReviewed] = useState<AutomationRuleId | null>(null);
  const allowedToReview = canOperate(state.role, "automations");
  const rules: Record<
    AutomationRuleId,
    {
      title: string;
      trigger: string;
      condition: string;
      outcome: string;
      owner: string;
    }
  > =
    locale === "es"
      ? {
          arrival: {
            title: "Preparar una llegada",
            trigger: "24 h antes de la entrada ficticia",
            condition: "Hora de llegada todavía sin revisar",
            outcome: "Proponer un borrador de instrucciones",
            owner: "Recepción propone · Dirección revisa",
          },
          turnover: {
            title: "Coordinar la habitación 408",
            trigger: "Salida prevista a las 11:08",
            condition: "Nueva entrada ficticia el mismo día",
            outcome: "Proponer el checklist de preparación",
            owner: "Limpieza informa · Dirección revisa",
          },
          incident: {
            title: "Elevar una incidencia",
            trigger: "Prioridad alta en el fixture",
            condition: "Sigue abierta tras 30 min simulados",
            outcome: "Proponer un aviso interno a Dirección",
            owner: "Recepción prepara · Dirección revisa",
          },
        }
      : {
          arrival: {
            title: "Prepare an arrival",
            trigger: "24 h before the fictitious check-in",
            condition: "Arrival time has not been reviewed",
            outcome: "Propose a draft set of instructions",
            owner: "Reception proposes · Direction reviews",
          },
          turnover: {
            title: "Coordinate room 408",
            trigger: "Expected departure at 11:08",
            condition: "Another fictitious arrival that day",
            outcome: "Propose the preparation checklist",
            owner: "Cleaning reports · Direction reviews",
          },
          incident: {
            title: "Escalate an incident",
            trigger: "High priority in the fixture",
            condition: "Still open after 30 simulated minutes",
            outcome: "Propose an internal note to Direction",
            owner: "Reception prepares · Direction reviews",
          },
        };
  const active = rules[selected];
  const activeReviewed = reviewed === selected;

  return (
    <>
      <div className="integration-note automations-boundary" role="note">
        <strong>
          {locale === "es"
            ? "3 reglas ficticias · 0 ejecuciones"
            : "3 fictitious rules · 0 executions"}
        </strong>
        <span>
          {locale === "es"
            ? "Solo puedes inspeccionar y registrar una revisión durante esta visita. Ninguna regla se activa ni produce una tarea, mensaje o cambio externo."
            : "You can only inspect and record a review during this visit. No rule is activated or creates a task, message or external change."}
        </span>
      </div>
      <div className="automation-layout">
        <section
          className="automation-rule-list"
          aria-labelledby="automation-rule-list-title"
        >
          <div className="automation-rule-heading">
            <span className="tag">
              {locale === "es" ? "Fixture local" : "Local fixture"}
            </span>
            <h2 id="automation-rule-list-title">
              {locale === "es" ? "Reglas por revisar" : "Rules to review"}
            </h2>
            <p>
              {locale === "es"
                ? "Selecciona una regla para comprobar qué haría falta validar."
                : "Select a rule to inspect what would need validation."}
            </p>
          </div>
          <div className="automation-rule-buttons">
            {(Object.entries(rules) as [AutomationRuleId, typeof active][]).map(
              ([id, rule], index) => (
                <button
                  type="button"
                  key={id}
                  aria-pressed={selected === id}
                  onClick={() => setSelected(id)}
                >
                  <span>0{index + 1}</span>
                  <strong>{rule.title}</strong>
                  <small>
                    {reviewed === id
                      ? locale === "es"
                        ? "Revisada localmente · inactiva"
                        : "Locally reviewed · inactive"
                      : locale === "es"
                        ? "Pendiente de revisión · inactiva"
                        : "Pending review · inactive"}
                  </small>
                </button>
              ),
            )}
          </div>
        </section>
        <article className="panel automation-inspector" aria-live="polite">
          <div className="panel-head">
            <div>
              <span className={`tag ${activeReviewed ? "reviewed" : "pending"}`}>
                {activeReviewed
                  ? locale === "es"
                    ? "Revisada · sigue inactiva"
                    : "Reviewed · still inactive"
                  : locale === "es"
                    ? "Inactiva"
                    : "Inactive"}
              </span>
              <h2>{active.title}</h2>
            </div>
            <BellRing size={24} />
          </div>
          <ol
            className="automation-flow"
            aria-label={
              locale === "es"
                ? "Definición de la regla ficticia"
                : "Fictitious rule definition"
            }
          >
            <li>
              <span>01</span>
              <div>
                <strong>{locale === "es" ? "Disparador" : "Trigger"}</strong>
                <p>{active.trigger}</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>{locale === "es" ? "Condición" : "Condition"}</strong>
                <p>{active.condition}</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>
                  {locale === "es" ? "Resultado propuesto" : "Proposed outcome"}
                </strong>
                <p>{active.outcome}</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <strong>{locale === "es" ? "Decisión humana" : "Human decision"}</strong>
                <p>{active.owner}</p>
              </div>
            </li>
          </ol>
          <div className="automation-actions">
            <button
              type="button"
              className="primary"
              disabled={!allowedToReview || activeReviewed}
              onClick={() => allowedToReview && setReviewed(selected)}
            >
              {!allowedToReview
                ? locale === "es"
                  ? "Requiere Dirección"
                  : "Requires Direction"
                : activeReviewed
                  ? locale === "es"
                    ? "Revisión registrada"
                    : "Review recorded"
                  : locale === "es"
                    ? "Registrar revisión local"
                    : "Record local review"}
            </button>
            <button
              type="button"
              disabled={reviewed === null}
              onClick={() => setReviewed(null)}
            >
              {locale === "es" ? "Restaurar fixture" : "Restore fixture"}
            </button>
          </div>
          <p className="automation-permission" role="status">
            {activeReviewed
              ? locale === "es"
                ? "Dirección ha revisado esta definición durante la visita. La regla continúa inactiva y no se ha ejecutado."
                : "Direction reviewed this definition during the visit. The rule remains inactive and has not run."
              : allowedToReview
                ? locale === "es"
                  ? "Dirección puede registrar la revisión del fixture; no puede activarlo desde esta demo."
                  : "Direction can record the fixture review; it cannot activate it from this demo."
                : locale === "es"
                  ? "Recepción y Limpieza pueden inspeccionar; Dirección debe revisar. Nadie puede activar la regla."
                  : "Reception and Cleaning can inspect; Direction must review. Nobody can activate the rule."}
          </p>
          <p className="automation-safety">
            {locale === "es"
              ? "Sin job, cola, cron, webhook, mensaje, proveedor, persistencia ni escritura HTTP. Recargar restaura el fixture."
              : "No job, queue, cron, webhook, message, provider, persistence or HTTP write. Reloading restores the fixture."}
          </p>
        </article>
      </div>
    </>
  );
}

function Automation({ locale, state, patch }: { locale: Locale; state: DemoState; patch: (next: Partial<DemoState>) => void }) {
  const generated = locale === "es"
    ? `Hola ${firstName(state.stay.name)}, tu habitación Terrace estará lista a partir de las 15:00. Hemos preparado el pre-check-in, pero todavía necesitamos que confirmes tu hora de llegada.`
    : `Hello ${firstName(state.stay.name)}, your Terrace room will be ready from 15:00. We prepared pre-check-in, but still need you to confirm your arrival time.`;
  const saved = state.aiDraft ?? generated;
  const [draft, setDraft] = useState(saved);
  useEffect(() => setDraft(saved), [saved]);
  const dirty = draft !== saved;
  const allowedToReview = canOperate(state.role, "review");
  const saveDraft = () => patch({ aiDraft: draft.trim(), aiReview: "draft", aiRevision: Math.min(20, state.aiRevision + 1) });
  const markReviewed = () => {
    if (!allowedToReview || dirty) return;
    patch({ aiReview: "reviewed", completedFlows: [...new Set([...state.completedFlows, "supervised-ai"])] });
    track("demo_flow_complete", { locale, demo: "aurem", flow: "supervised-ai" });
  };
  return (
    <>
      <div className="integration-note ai-boundary" role="note">
        <strong>{locale === "es" ? "Copiloto local · sin modelo ni proveedor" : "Local copilot · no model or provider"}</strong>
        <span>{locale === "es" ? "El texto parte de un fixture y solo cambia en este navegador. Revisar no envía el mensaje ni confirma precio, reserva o cobro." : "The text starts from a fixture and only changes in this browser. Review does not send it or confirm a price, booking or charge."}</span>
      </div>
      <div className="ai-workspace">
        <article className="panel ai-editor">
          <div className="panel-head"><div><span className={`tag ${state.aiReview}`}>{state.aiReview === "reviewed" ? locale === "es" ? "Revisado" : "Reviewed" : locale === "es" ? "Borrador" : "Draft"}</span><h2>{locale === "es" ? `Respuesta para ${state.stay.name}` : `Reply for ${state.stay.name}`}</h2><p>{locale === "es" ? `Versión ${state.aiRevision} · edición local` : `Version ${state.aiRevision} · local edit`}</p></div><Sparkles size={24} /></div>
          <label>{locale === "es" ? "Mensaje preparado" : "Prepared message"}<textarea value={draft} maxLength={1000} rows={6} onChange={(event) => setDraft(event.target.value)} /></label>
          <div className="sources" aria-label={locale === "es" ? "Fuentes del borrador" : "Draft sources"}><span>{locale === "es" ? "Fuentes fixture" : "Fixture sources"}</span><b>Reserva AUR-812</b><b>{locale === "es" ? "Política de entrada" : "Arrival policy"}</b><b>{locale === "es" ? `Habitación 408 · ${state.cleaning === "ready" ? "lista" : "pendiente"}` : `Room 408 · ${state.cleaning === "ready" ? "ready" : "pending"}`}</b></div>
          <div className="actions">
            <button type="button" onClick={() => setDraft(saved)} disabled={!dirty}>{locale === "es" ? "Descartar edición" : "Discard edit"}</button>
            <button type="button" className="primary" onClick={saveDraft} disabled={!dirty || !draft.trim()}>{locale === "es" ? "Guardar borrador local" : "Save local draft"}</button>
            <button type="button" className="primary" onClick={markReviewed} disabled={dirty || state.aiReview === "reviewed" || !allowedToReview}>{!allowedToReview ? locale === "es" ? "Requiere Dirección o Recepción" : "Requires Direction or Reception" : locale === "es" ? "Marcar como revisado" : "Mark as reviewed"}</button>
          </div>
          <button type="button" disabled className="ai-send">{locale === "es" ? "Enviar deshabilitado · proveedor no conectado" : "Send disabled · provider not connected"}</button>
        </article>
        <aside className="panel ai-trace" aria-live="polite">
          <span>{locale === "es" ? "Trazabilidad" : "Trace"}</span>
          <h2>{locale === "es" ? "Qué ha ocurrido" : "What happened"}</h2>
          <ol><li className="done"><Check size={16} /><div><strong>{locale === "es" ? "Borrador de fixture" : "Fixture draft"}</strong><small>{locale === "es" ? "Sin llamada a un modelo externo" : "No external model call"}</small></div></li><li className={state.aiRevision > 1 ? "done" : ""}><Check size={16} /><div><strong>{locale === "es" ? "Edición humana" : "Human edit"}</strong><small>{state.aiRevision > 1 ? locale === "es" ? `Guardada como versión ${state.aiRevision}` : `Saved as version ${state.aiRevision}` : locale === "es" ? "Todavía sin cambios" : "No changes yet"}</small></div></li><li className={state.aiReview === "reviewed" ? "done" : ""}><Check size={16} /><div><strong>{locale === "es" ? "Revisión humana" : "Human review"}</strong><small>{state.aiReview === "reviewed" ? locale === "es" ? "Aprobada solo en local" : "Approved locally only" : locale === "es" ? "Pendiente" : "Pending"}</small></div></li><li><X size={16} /><div><strong>{locale === "es" ? "Envío externo" : "External delivery"}</strong><small>{locale === "es" ? "Bloqueado por diseño" : "Blocked by design"}</small></div></li></ol>
        </aside>
      </div>
    </>
  );
}

function Control({
  locale,
  state,
  go,
}: {
  locale: Locale;
  state: DemoState;
  go: (v: View) => void;
}) {
  const families =
    locale === "es"
      ? [
          "Centro",
          "Limpieza",
          "Mantenimiento",
          "Equipo",
          "Huésped",
          "Reservas y grupos",
          "Ingresos",
          "Canales e inteligencia",
        ]
      : [
          "Centre",
          "Cleaning",
          "Maintenance",
          "Team",
          "Guest",
          "Bookings and groups",
          "Revenue",
          "Channels and intelligence",
        ];
  return (
    <>
      <div className="control-hero panel">
        <div>
          <span className="tag">
            Demo
          </span>
          <h2>
            {locale === "es"
              ? "Lo importante de hoy, antes de que se convierta en incidencia."
              : "What matters today, before it becomes an incident."}
          </h2>
          <p>
            {locale === "es"
              ? `La habitación 408 está ${state.cleaning === "ready" ? "lista" : "en riesgo"} para una entrada a las 15:00.`
              : `Room 408 is ${state.cleaning === "ready" ? "ready" : "at risk"} for a 15:00 arrival.`}
          </p>
        </div>
        <button className="primary" onClick={() => go("cleaning")}>
          {locale === "es" ? "Abrir preparación" : "Open preparation"}
        </button>
      </div>
      <div className="family-grid">
        {families.map((f, i) => (
          <article className="panel" key={f}>
            <span>0{i + 1}</span>
            <h2>{f}</h2>
            <small>
              {i < 3
                ? "Demo"
                : i < 6
                  ? locale === "es" ? "A validar" : "To validate"
                  : i === 6
                    ? locale === "es" ? "Simulada" : "Simulated"
                    : locale === "es" ? "Futura" : "Future"}
            </small>
          </article>
        ))}
      </div>
    </>
  );
}

function Reports({
  scenario,
  locale,
  go,
}: {
  scenario: Scenario;
  locale: Locale;
  go: (view: View) => void;
}) {
  const values =
    scenario === "aurem"
      ? [62, 68, 74, 70, 79, 83, 87, 91, 88, 92, 86, 90]
      : [50, 63, 75, 75, 88, 75, 63, 75, 88, 75, 63, 50];
  const [selected, setSelected] = useState<RevenueMetric>("revenue");

  if (scenario === "aurem") {
    const weeks = [
      { occupancy: 88, occupied: 591, revenue: 73284 },
      { occupancy: 92, occupied: 618, revenue: 76632 },
      { occupancy: 86, occupied: 578, revenue: 71672 },
      { occupancy: 90, occupied: 605, revenue: 75020 },
    ];
    const metrics: Record<RevenueMetric, {
      label: string;
      value: string;
      summary: string;
      formula: string;
      evidence: string;
      target: View;
    }> = locale === "es" ? {
      revenue: {
        label: "Ingresos simulados",
        value: "€ 296.608",
        summary: "28 días · antes de impuestos y costes",
        formula: "2.392 noches ocupadas × €124 de tarifa media.",
        evidence: "Abrir reservas ficticias",
        target: "bookings",
      },
      occupancy: {
        label: "Ocupación",
        value: "89%",
        summary: "2.392 de 2.688 noches disponibles",
        formula: "2.392 noches ocupadas ÷ 2.688 noches disponibles.",
        evidence: "Abrir planning ficticio",
        target: "planning",
      },
      adr: {
        label: "Tarifa media diaria",
        value: "€ 124",
        summary: "ADR del escenario, no una tarifa publicada",
        formula: "€296.608 de ingresos ÷ 2.392 noches ocupadas.",
        evidence: "Abrir reservas ficticias",
        target: "bookings",
      },
      revpar: {
        label: "Ingreso por habitación disponible",
        value: "€ 110",
        summary: "RevPAR redondeado del escenario",
        formula: "€296.608 de ingresos ÷ 2.688 noches disponibles.",
        evidence: "Abrir planning ficticio",
        target: "planning",
      },
    } : {
      revenue: {
        label: "Simulated revenue",
        value: "€296,608",
        summary: "28 days · before tax and costs",
        formula: "2,392 occupied room nights × €124 average daily rate.",
        evidence: "Open fictitious bookings",
        target: "bookings",
      },
      occupancy: {
        label: "Occupancy",
        value: "89%",
        summary: "2,392 of 2,688 available room nights",
        formula: "2,392 occupied room nights ÷ 2,688 available room nights.",
        evidence: "Open fictitious planning",
        target: "planning",
      },
      adr: {
        label: "Average daily rate",
        value: "€124",
        summary: "Scenario ADR, not a published rate",
        formula: "€296,608 revenue ÷ 2,392 occupied room nights.",
        evidence: "Open fictitious bookings",
        target: "bookings",
      },
      revpar: {
        label: "Revenue per available room",
        value: "€110",
        summary: "Rounded scenario RevPAR",
        formula: "€296,608 revenue ÷ 2,688 available room nights.",
        evidence: "Open fictitious planning",
        target: "planning",
      },
    };
    const active = metrics[selected];
    return (
      <>
        <div className="revenue-boundary" role="note">
          <strong>{locale === "es" ? "Escenario local explicable" : "Explainable local scenario"}</strong>
          <span>
            {locale === "es"
              ? "Todas las cifras se calculan con 96 habitaciones ficticias durante 28 días. No proceden de PMS, canales, contabilidad ni pagos reales."
              : "Every figure is calculated from 96 fictitious rooms over 28 days. Nothing comes from a live PMS, channel, accounting or payment provider."}
          </span>
        </div>
        <div className="revenue-metrics" aria-label={locale === "es" ? "Indicadores de ingresos simulados" : "Simulated revenue indicators"}>
          {(Object.entries(metrics) as [RevenueMetric, typeof active][]).map(([id, metric]) => (
            <button
              type="button"
              key={id}
              aria-pressed={selected === id}
              onClick={() => setSelected(id)}
            >
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.summary}</small>
            </button>
          ))}
        </div>
        <div className="revenue-layout">
          <article className="panel revenue-chart">
            <div className="panel-head">
              <div>
                <span className="tag">{locale === "es" ? "28 días ficticios" : "28 fictitious days"}</span>
                <h2>{locale === "es" ? "Ocupación semanal" : "Weekly occupancy"}</h2>
                <p>{locale === "es" ? "672 noches disponibles por semana" : "672 available room nights per week"}</p>
              </div>
            </div>
            <div
              className="bar-chart"
              role="img"
              aria-label={locale === "es" ? "Ocupación semanal: 88, 92, 86 y 90 por ciento" : "Weekly occupancy: 88, 92, 86 and 90 percent"}
            >
              {weeks.map((week, index) => (
                <i key={week.occupancy} style={{ height: `${week.occupancy}%` }} aria-hidden="true">
                  <span>{week.occupancy}%</span>
                  <b>{locale === "es" ? `S${index + 1}` : `W${index + 1}`}</b>
                </i>
              ))}
            </div>
          </article>
          <aside className="panel revenue-explanation" aria-live="polite">
            <span>{locale === "es" ? "Cómo se calcula" : "How it is calculated"}</span>
            <h2>{active.label}</h2>
            <strong>{active.value}</strong>
            <p>{active.formula}</p>
            <button type="button" className="primary" onClick={() => go(active.target)}>
              {active.evidence} <ChevronRight size={16} />
            </button>
            <small>
              {locale === "es"
                ? "La pantalla enlazada aporta contexto de la demo; no representa una fuente externa conectada."
                : "The linked screen provides demo context; it is not a connected external source."}
            </small>
          </aside>
        </div>
        <article className="panel table-wrap revenue-ledger">
          <div className="revenue-ledger-head">
            <h2 id="revenue-ledger-title">{locale === "es" ? "Libro de cálculo del escenario" : "Scenario calculation ledger"}</h2>
            <span>{locale === "es" ? "ADR constante · €124" : "Constant ADR · €124"}</span>
          </div>
          <table aria-labelledby="revenue-ledger-title">
            <thead>
              <tr>
                <th>{locale === "es" ? "Semana" : "Week"}</th>
                <th>{locale === "es" ? "Disponibles" : "Available"}</th>
                <th>{locale === "es" ? "Ocupadas" : "Occupied"}</th>
                <th>{locale === "es" ? "Ocupación" : "Occupancy"}</th>
                <th>{locale === "es" ? "Ingresos" : "Revenue"}</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, index) => (
                <tr key={week.occupancy}>
                  <td>{locale === "es" ? `Semana ${index + 1}` : `Week ${index + 1}`}</td>
                  <td>672</td>
                  <td>{week.occupied}</td>
                  <td>{week.occupancy}%</td>
                  <td>{new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(week.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </>
    );
  }

  return (
    <div className="dash-grid">
      <article className="panel wide">
        <h2>
          {locale === "es" ? "Ocupación · 12 semanas" : "Occupancy · 12 weeks"}
        </h2>
        <div className="bar-chart">
          {values.map((v, i) => (
            <i key={i} style={{ height: `${v}%` }}>
              <span>{v}%</span>
            </i>
          ))}
        </div>
      </article>
      <article className="panel">
        <h2>{locale === "es" ? "Ingresos preparados" : "Prepared revenue"}</h2>
        <strong className="big-number">€ 26.4k</strong>
        <p className="body-copy">
          {locale === "es"
            ? "Dato de escenario. No procede de contabilidad ni pasarela real."
            : "Scenario data. Not sourced from accounting or a live payment provider."}
        </p>
      </article>
    </div>
  );
}

function SettingsPage({
  locale,
  scenario,
}: {
  locale: Locale;
  scenario: Scenario;
}) {
  return (
    <div className="settings-grid">
      <article className="panel">
        <h2>{locale === "es" ? "Empresa" : "Organisation"}</h2>
        <dl>
          <dt>{locale === "es" ? "Modelo" : "Mode"}</dt>
          <dd>{locale === "es" ? "Multiestancia" : "Multi-stay"}</dd>
          <dt>{locale === "es" ? "Propiedades" : "Properties"}</dt>
          <dd>{scenario === "aurem" ? 1 : 8}</dd>
          <dt>{locale === "es" ? "Unidades" : "Units"}</dt>
          <dd>{scenario === "aurem" ? 96 : 8}</dd>
          <dt>{locale === "es" ? "Moneda" : "Currency"}</dt>
          <dd>EUR</dd>
        </dl>
      </article>
      <article className="panel">
        <h2>{locale === "es" ? "Integraciones" : "Integrations"}</h2>
        <dl>
          <dt>Resend</dt>
          <dd>{locale === "es" ? "No conectado" : "Not connected"}</dd>
          <dt>Redsys / Stripe</dt>
          <dd>{locale === "es" ? "No conectado" : "Not connected"}</dd>
          <dt>SES.Hospedajes</dt>
          <dd>
            {locale === "es" ? "Preparado, no enviado" : "Prepared, not sent"}
          </dd>
          <dt>OTA</dt>
          <dd>{scenario === "aurem" ? "Demo" : "iCal"}</dd>
        </dl>
      </article>
    </div>
  );
}

function Table({ rows, headings }: { rows: string[][]; headings: string[] }) {
  return (
    <div className="table-wrap panel">
      <table>
        <thead>
          <tr>
            {headings.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>
                  {j === row.length - 1 ? (
                    <span className="tag">{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Task({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone?: string;
}) {
  return (
    <div className={`task ${tone ?? ""}`}>
      <i></i>
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <ChevronRight size={17} />
    </div>
  );
}
function CleanCard({
  name,
  status,
  detail,
}: {
  name: string;
  status: string;
  detail: string;
}) {
  return (
    <article className="panel">
      <DoorOpen size={22} />
      <span className="tag">{status}</span>
      <h2>{name}</h2>
      <p>{detail}</p>
    </article>
  );
}
