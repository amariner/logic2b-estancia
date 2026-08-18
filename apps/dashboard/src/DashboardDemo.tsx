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
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { DemoRole } from "@logic-estancia/domain";
import {
  canOperate,
  initialState,
  parseStored,
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
  | "automation"
  | "control"
  | "reports"
  | "settings";
type Utility = "search" | "notifications" | null;
type Notice = { title: string; detail: string; view: View; urgent?: boolean };
type RevenueMetric = "revenue" | "occupancy" | "adr" | "revpar";
type ChannelId = "booking" | "airbnb" | "expedia" | "ical";

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
    automation: "Automatización",
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
    automation: "Automation",
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
        "settings",
      ]
    : [
        "home",
        "planning",
        "bookings",
        "guests",
        "cleaning",
        "maintenance",
        "website",
        "channels",
        "automation",
        "control",
        "reports",
        "settings",
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
                  ? "Reserva TER-104 creada"
                  : "Booking TER-104 created",
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
      title: locale === "es" ? "Expedia por validar" : "Expedia to validate",
      detail:
        locale === "es"
          ? "Canal de muestra sin inventario enviado."
          : "Sample channel with no inventory sent.",
      view: "channels",
    },
  ];
};

function useDemoState(scenario: Scenario) {
  const key = `logic-estancia-demo-${scenario}-v2`;
  const legacyKey = `logic-estancia-demo-${scenario}-v1`;
  const [state, setState] = useState<DemoState>(() =>
    typeof localStorage === "undefined"
      ? initialState(scenario)
      : parseStored(
          localStorage.getItem(key) ?? localStorage.getItem(legacyKey),
          scenario,
        ),
  );
  useEffect(
    () => localStorage.setItem(key, JSON.stringify(state)),
    [key, state],
  );
  const patch = (next: Partial<DemoState>) =>
    setState((current) => ({ ...current, ...next }));
  const reset = () => {
    const fresh = initialState(scenario);
    localStorage.setItem(key, JSON.stringify(fresh));
    setState(fresh);
  };
  return { state, patch, reset };
}

export function DashboardDemo({
  scenario,
  locale = "es",
}: {
  scenario: Scenario;
  locale?: Locale;
}) {
  const { state, patch, reset } = useDemoState(scenario);
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
                ? "Convierte la alternativa"
                : "Convert the alternative",
            description:
              locale === "es"
                ? "La reserva de muestra cierra el relato de Gestión y permanece únicamente en este navegador."
                : "The sample booking closes the Management story and remains only in this browser.",
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
                ? "Los roles ordenan la preparación y la revisión; cada cambio es visible, reversible y local."
                : "Roles structure preparation and review; every change is visible, reversible and local.",
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
                ? "Recepción valida la entrada"
                : "Reception validates the arrival",
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
            phase:
              locale === "es" ? "06 · IA supervisada" : "06 · Supervised AI",
            title:
              locale === "es"
                ? "Edita, revisa y conserva el control"
                : "Edit, review and keep control",
            description:
              locale === "es"
                ? "El copiloto parte de fuentes visibles, guarda versiones locales y exige revisión humana; el envío permanece deshabilitado."
                : "The copilot starts from visible sources, saves local versions and requires human review; sending remains disabled.",
            evidence:
              locale === "es"
                ? "Sin modelo ni proveedor · sin envío"
                : "No model or provider · no delivery",
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
                ? "Ya has visto operación, ingresos, canales e IA con sus límites. El diagnóstico traduce tus necesidades en un punto de partida Básico, Gestión o Inteligente."
                : "You have seen operations, revenue, channels and AI with their boundaries. The assessment turns your needs into a Basic, Management or Intelligent starting point.",
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
          <small>Logic Estancia · {level}</small>
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
          <a href="https://wa.me/34626432316" target="_blank" rel="noreferrer">
            {locale === "es" ? "Ayuda Logic2B" : "Logic2B help"} ↗
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
          {scenario === "aurem" && (
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
                <option value="cleaning">
                  {locale === "es" ? "Limpieza" : "Cleaning"}
                </option>
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
          <button
            className="reset"
            onClick={reset}
            title={locale === "es" ? "Restablecer datos" : "Reset data"}
          >
            <RefreshCw size={16} />
            <span>{locale === "es" ? "Restablecer" : "Reset"}</span>
          </button>
        </header>
        <div className="demo-banner">
          <strong>
            {locale === "es"
              ? "Demostración ficticia"
              : "Fictitious demonstration"}
          </strong>
          <span>
            {locale === "es"
              ? "Negocios, huéspedes e importes son ficticios. Los cambios solo viven en este navegador; no se realizan cobros, reservas, mensajes ni sincronizaciones reales."
              : "Businesses, guests and amounts are fictitious. Changes only live in this browser; no live payments, bookings, messages or synchronisations occur."}
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
                ? "Siete hitos conectan una llegada en riesgo con ingresos, canales e IA supervisada. Puedes pausar y reanudar; la exploración libre mantiene todas las secciones disponibles."
                : "Tres hitos recorren una solicitud hasta su reserva ficticia. Puedes pausar y reanudar; la exploración libre mantiene todas las secciones disponibles."
              : scenario === "aurem"
                ? "Seven milestones connect an at-risk arrival with revenue, channels and supervised AI. Pause and resume at any time; free exploration keeps every area available."
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
              ? "El progreso queda en este navegador."
              : "Progress stays in this browser."}
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
        {locale === "es" ? "Aplicarlo a mi alojamiento" : "Apply it to my stay"}{" "}
        →
      </a>
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
    return <Enquiries locale={locale} state={state} patch={patch} go={go} />;
  if (view === "planning")
    return (
      <Planning
        scenario={scenario}
        locale={locale}
        state={state}
        patch={patch}
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
        patch={patch}
      />
    );
  if (view === "maintenance")
    return <Maintenance locale={locale} state={state} patch={patch} />;
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
    return <Channels locale={locale} state={state} patch={patch} />;
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
            locale === "es" ? "Cambios web" : "Website changes",
            state.website.status === "draft" ? "1" : "0",
            "website",
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
                ? "Cobro preparado, no enviado"
                : "Payment prepared, not sent"
            }
            detail={
              locale === "es"
                ? "Requiere confirmación de Recepción"
                : "Requires Reception confirmation"
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
  patch,
  go,
}: {
  locale: Locale;
  state: DemoState;
  patch: (n: Partial<DemoState>) => void;
  go: (v: View) => void;
}) {
  const status = {
    new: locale === "es" ? "Nueva" : "New",
    alternative:
      locale === "es" ? "Alternativa preparada" : "Alternative prepared",
    booked: locale === "es" ? "Convertida" : "Converted",
  }[state.enquiry];
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
          {state.enquiry === "new" && (
            <button
              className="primary"
              onClick={() => patch({ enquiry: "alternative" })}
            >
              {locale === "es" ? "Preparar alternativa" : "Prepare alternative"}
            </button>
          )}
          {state.enquiry === "alternative" && (
            <button
              className="primary"
              onClick={() => {
                patch({
                  enquiry: "booked",
                  completedFlows: [
                    ...new Set([...state.completedFlows, "enquiry-booking"]),
                  ],
                });
                track("demo_flow_complete", {
                  locale,
                  demo: "terrava",
                  flow: "enquiry-booking",
                });
                go("bookings");
              }}
            >
              {locale === "es" ? "Convertir en reserva" : "Convert to booking"}
            </button>
          )}
          {state.enquiry === "booked" && (
            <span className="done">
              <Check size={16} />
              {locale === "es"
                ? "Reserva TER-104 creada"
                : "Booking TER-104 created"}
            </span>
          )}
        </div>
      </article>
      <article className="panel">
        <h2>{locale === "es" ? "Contexto conservado" : "Context preserved"}</h2>
        <p className="body-copy">
          {locale === "es"
            ? "Fechas, huéspedes, preferencias y conversación viajan a la reserva. No hay que copiar datos entre pantallas."
            : "Dates, guests, preferences and conversation move into the booking. No copy and paste between screens."}
        </p>
      </article>
    </div>
  );
}

function Planning({
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
  const finishStayFlow = (next: DemoState["stayOperation"]) => {
    const completed =
      next === "rate_updated"
        ? [...new Set([...state.completedFlows, "stay-operation"])]
        : state.completedFlows;
    patch({ stayOperation: next, completedFlows: completed });
    if (next === "rate_updated")
      track("demo_flow_complete", {
        locale,
        demo: "terrava",
        flow: "stay-operation",
      });
  };
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
            ? "Salida exclusiva · EUR"
            : "Exclusive checkout · EUR"}
        </span>
      </div>
      <div className="tape" role="table">
        <div className="tape-days">
          <span></span>
          {Array.from({ length: 14 }, (_, i) => (
            <b key={i}>{18 + i}</b>
          ))}
        </div>
        {rows.map((row, r) => (
          <div className="tape-row" key={row}>
            <span>{row}</span>
            {Array.from({ length: 14 }, (_, d) => (
              <i
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
              {state.stay.name} ·{" "}
              {state.stayOperation === "original" ? "Casa Aira" : "Casa Bruma"}
            </strong>
            <span>
              {state.stayOperation === "rate_updated"
                ? `€ ${state.stay.amount + 48} · ${locale === "es" ? "tarifa ajustada" : "adjusted rate"}`
                : `€ ${state.stay.amount}`}
            </span>
          </div>
          <div className="actions">
            {state.stayOperation === "original" && (
              <button
                className="primary"
                onClick={() => finishStayFlow("reassigned")}
              >
                {locale === "es"
                  ? "Reasignar a Casa Bruma"
                  : "Reassign to Casa Bruma"}
              </button>
            )}
            {state.stayOperation === "reassigned" && (
              <button
                className="primary"
                onClick={() => finishStayFlow("rate_updated")}
              >
                {locale === "es"
                  ? "Aplicar tarifa flexible +48 €"
                  : "Apply flexible rate +€48"}
              </button>
            )}
            {state.stayOperation === "rate_updated" && (
              <span className="done">
                <Check size={16} />
                {locale === "es"
                  ? "Planning y perfil actualizados"
                  : "Planning and profile updated"}
              </span>
            )}
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
          {state.cleaning === "review" && canOperate(state.role, "review") && (
            <button
              className="primary"
              onClick={() =>
                patch({
                  cleaning: "ready",
                  arrivalRisk: "resolved",
                  completedFlows: [
                    ...new Set([...state.completedFlows, "arrival-risk"]),
                  ],
                })
              }
            >
              {locale === "es" ? "Validar habitación" : "Validate room"}
            </button>
          )}
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
  patch,
}: {
  scenario: Scenario;
  locale: Locale;
  state: DemoState;
  patch: (n: Partial<DemoState>) => void;
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
  const role = state.role;
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
          {state.cleaning === "pending" && canOperate(role, "cleaning") && (
            <button
              className="primary"
              onClick={() =>
                patch({ cleaning: "in_progress", arrivalRisk: "coordinating" })
              }
            >
              {locale === "es" ? "Empezar preparación" : "Start preparation"}
            </button>
          )}
          {state.cleaning === "in_progress" && canOperate(role, "cleaning") && (
            <button
              className="primary"
              onClick={() => patch({ cleaning: "review" })}
            >
              {locale === "es"
                ? "Marcar lista para revisar"
                : "Mark ready for review"}
            </button>
          )}
          {state.cleaning === "review" && canOperate(role, "review") && (
            <button
              className="primary"
              onClick={() => {
                patch({
                  cleaning: "ready",
                  arrivalRisk: "resolved",
                  completedFlows: [
                    ...new Set([...state.completedFlows, "arrival-risk"]),
                  ],
                });
                track("demo_flow_complete", {
                  locale,
                  demo: "aurem",
                  flow: "arrival-risk",
                });
              }}
            >
              {locale === "es" ? "Validar habitación" : "Validate room"}
            </button>
          )}
          {!canOperate(
            role,
            state.cleaning === "review" ? "review" : "cleaning",
          ) &&
            state.cleaning !== "ready" && (
              <span className="permission-note">
                {locale === "es"
                  ? `El rol ${role} puede ver este estado, pero no ejecutar el siguiente paso.`
                  : `The ${role} role can see this state but cannot perform the next step.`}
              </span>
            )}
          {state.cleaning === "ready" && (
            <span className="done">
              <Check size={16} />
              {locale === "es"
                ? "Habitación disponible para la entrada"
                : "Room available for arrival"}
            </span>
          )}
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
            ? "Limpieza ejecuta; Recepción valida. Dirección puede intervenir, pero el historial conserva quién hizo cada paso."
            : "Cleaning performs; Reception validates. Direction may intervene, while history keeps who completed each step."}
        </p>
      </article>
    </div>
  );
}

function Maintenance({
  locale,
  state,
  patch,
}: {
  locale: Locale;
  state: DemoState;
  patch: (n: Partial<DemoState>) => void;
}) {
  const labels = {
    new: locale === "es" ? "Nueva" : "New",
    assigned: locale === "es" ? "Asignada" : "Assigned",
    resolved: locale === "es" ? "Resuelta" : "Resolved",
  };
  const advance = () => {
    if (state.maintenance === "new") patch({ maintenance: "assigned" });
    else if (state.maintenance === "assigned") {
      patch({
        maintenance: "resolved",
        completedFlows: [...new Set([...state.completedFlows, "maintenance"])],
      });
      track("demo_flow_complete", {
        locale,
        demo: "aurem",
        flow: "maintenance",
      });
    }
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
          {state.maintenance !== "resolved" ? (
            <button className="primary" onClick={advance}>
              {state.maintenance === "new"
                ? locale === "es"
                  ? "Asignar a mantenimiento"
                  : "Assign maintenance"
                : locale === "es"
                  ? "Resolver y liberar"
                  : "Resolve and release"}
            </button>
          ) : (
            <span className="done">
              <Check size={16} />
              {locale === "es"
                ? "Sin impacto en la llegada"
                : "No impact on arrival"}
            </span>
          )}
        </div>
      </article>
      <article className="panel">
        <span className="tag">{locale === "es" ? "Demo" : "Demo"}</span>
        <h2>{locale === "es" ? "Impacto visible" : "Visible impact"}</h2>
        <p className="body-copy">
          {locale === "es"
            ? "La incidencia conserva prioridad, responsable y efecto sobre inventario. No comunica con un proveedor externo."
            : "The incident keeps priority, ownership and inventory impact. It does not communicate with an external provider."}
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
  const updateDraft = (draftTitle: string) =>
    patch({
      website: {
        ...state.website,
        draftTitle,
        status: draftTitle === state.website.publishedTitle ? "clean" : "draft",
      },
    });
  const publish = () => {
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
    <div className="website-editor">
      <article className="panel editor-controls">
        <div className="panel-head">
          <div>
            <span className={`tag ${state.website.status}`}>
              {state.website.status === "draft"
                ? locale === "es"
                  ? "Borrador"
                  : "Draft"
                : state.website.status === "published"
                  ? locale === "es"
                    ? "Publicada en esta demo"
                    : "Published in this demo"
                  : locale === "es"
                    ? "Sin cambios"
                    : "No changes"}
            </span>
            <h2>
              {locale === "es"
                ? "Portada · titular principal"
                : "Homepage · main headline"}
            </h2>
          </div>
          <PanelsTopLeft size={25} />
        </div>
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
            {locale === "es" ? "Descartar" : "Discard"}
          </button>
          <button
            className="primary"
            onClick={publish}
            disabled={
              state.website.status !== "draft" ||
              !state.website.draftTitle.trim()
            }
          >
            {locale === "es"
              ? "Publicar cambio simulado"
              : "Publish simulated change"}
          </button>
        </div>
        <p className="permission-note">
          {locale === "es"
            ? "La publicación solo modifica localStorage y se puede restablecer. No existe CMS ni despliegue conectado."
            : "Publishing only changes localStorage and can be reset. No CMS or deployment is connected."}
        </p>
      </article>
      <article className={`website-preview ${scenario}`}>
        <span>
          {scenario === "aurem" ? "Aurem Hotel" : "Terrava Collection"}
        </span>
        <div>
          <small>{locale === "es" ? "Vista previa" : "Preview"}</small>
          <h2>{state.website.draftTitle}</h2>
          <button>
            {locale === "es"
              ? "Consultar disponibilidad"
              : "Check availability"}
          </button>
        </div>
      </article>
    </div>
  );
}

function Channels({
  locale,
  state,
  patch,
}: {
  locale: Locale;
  state: DemoState;
  patch: (next: Partial<DemoState>) => void;
}) {
  const [selected, setSelected] = useState<ChannelId>("expedia");
  const allowedToReview = canOperate(state.role, "review");
  const channels: Record<ChannelId, {
    name: string;
    status: string;
    detail: string;
    coverage: [string, string, string, string];
  }> = locale === "es" ? {
    booking: {
      name: "Booking.com",
      status: "Solo fixture",
      detail: "Faltan credenciales, contrato, alojamiento, planes de tarifa y reconciliación de reservas.",
      coverage: ["Escenario", "Escenario", "Sin entrada", "Fuera de demo"],
    },
    airbnb: {
      name: "Airbnb",
      status: "Solo fixture",
      detail: "Faltan autorización OAuth, mapeo del anuncio, reglas de disponibilidad y webhooks.",
      coverage: ["Escenario", "Escenario", "Sin entrada", "Fuera de demo"],
    },
    expedia: {
      name: "Expedia",
      status: state.channelReview === "reviewed" ? "Revisado localmente" : "Revisión pendiente",
      detail: "El fixture marca una diferencia de tarifa. Debe revisarla una persona; no existe canal al que publicarla.",
      coverage: ["Escenario", "Por revisar", "Sin entrada", "Fuera de demo"],
    },
    ical: {
      name: "iCal directo",
      status: "Lectura ficticia",
      detail: "Un iCal real requeriría URL, frecuencia, zona horaria, deduplicación y gestión de errores.",
      coverage: ["Lectura demo", "No compatible", "Sin entrada", "Fuera de demo"],
    },
  } : {
    booking: {
      name: "Booking.com",
      status: "Fixture only",
      detail: "Credentials, contract, property, rate-plan mapping and booking reconciliation are missing.",
      coverage: ["Scenario", "Scenario", "No intake", "Out of demo"],
    },
    airbnb: {
      name: "Airbnb",
      status: "Fixture only",
      detail: "OAuth authorisation, listing mapping, availability rules and webhooks are missing.",
      coverage: ["Scenario", "Scenario", "No intake", "Out of demo"],
    },
    expedia: {
      name: "Expedia",
      status: state.channelReview === "reviewed" ? "Locally reviewed" : "Review pending",
      detail: "The fixture flags a rate difference. A person must review it; there is no channel to publish to.",
      coverage: ["Scenario", "Review", "No intake", "Out of demo"],
    },
    ical: {
      name: "Direct iCal",
      status: "Fictitious read",
      detail: "A live iCal would require a URL, frequency, timezone, deduplication and error handling.",
      coverage: ["Demo read", "Unsupported", "No intake", "Out of demo"],
    },
  };
  const active = channels[selected];
  const markReviewed = () => {
    if (!allowedToReview) return;
    patch({
      channelReview: "reviewed",
      completedFlows: [...new Set([...state.completedFlows, "channel-review"])],
    });
    track("demo_flow_complete", {
      locale,
      demo: "aurem",
      flow: "channel-review",
    });
  };
  const requirements = locale === "es"
    ? [
        ["01", "Acuerdo y credenciales", "Contrato con el canal y secretos guardados fuera del navegador."],
        ["02", "Mapeo verificable", "Alojamiento, habitaciones, ocupaciones, tarifas, impuestos y restricciones."],
        ["03", "Entorno de pruebas", "Sandbox o certificación con casos de alta, cambio, cancelación y error."],
        ["04", "Reconciliación", "Colas, idempotencia, alertas, trazas y recuperación manual antes de producción."],
      ]
    : [
        ["01", "Agreement and credentials", "Channel contract and secrets stored outside the browser."],
        ["02", "Verifiable mapping", "Property, rooms, occupancies, rates, tax and restrictions."],
        ["03", "Test environment", "Sandbox or certification for create, change, cancel and failure cases."],
        ["04", "Reconciliation", "Queues, idempotency, alerts, traces and manual recovery before production."],
      ];
  return (
    <>
      <div className="integration-note channel-boundary" role="note">
        <strong>
          {locale === "es" ? "0 canales conectados" : "0 connected channels"}
        </strong>
        <span>
          {locale === "es"
            ? "La matriz es un escenario local. No lee ni publica inventario, tarifas, reservas o mensajes; tampoco contiene credenciales."
            : "This matrix is a local scenario. It neither reads nor publishes inventory, rates, bookings or messages, and contains no credentials."}
        </span>
      </div>
      <div className="channel-metrics" aria-label={locale === "es" ? "Resumen de canales ficticios" : "Fictitious channel summary"}>
        <div><span>{locale === "es" ? "Conectados" : "Connected"}</span><strong>0</strong></div>
        <div><span>{locale === "es" ? "Fixtures" : "Fixtures"}</span><strong>4</strong></div>
        <div><span>{locale === "es" ? "Revisiones pendientes" : "Pending reviews"}</span><strong>{state.channelReview === "reviewed" ? 0 : 1}</strong></div>
        <div><span>{locale === "es" ? "Publicaciones" : "Publications"}</span><strong>0</strong></div>
      </div>
      <div className="channel-workspace">
        <article className="panel table-wrap channel-matrix">
          <div className="channel-matrix-head">
            <span className="tag">{locale === "es" ? "Cobertura demostrada" : "Demonstrated coverage"}</span>
            <h2 id="channel-matrix-title">{locale === "es" ? "Matriz de alcance" : "Coverage matrix"}</h2>
            <p>{locale === "es" ? "Selecciona una fila para entender su límite." : "Select a row to understand its boundary."}</p>
          </div>
          <table aria-labelledby="channel-matrix-title">
            <thead><tr>
              <th>{locale === "es" ? "Canal" : "Channel"}</th>
              <th>{locale === "es" ? "Disponibilidad" : "Availability"}</th>
              <th>{locale === "es" ? "Tarifas" : "Rates"}</th>
              <th>{locale === "es" ? "Reservas" : "Bookings"}</th>
              <th>{locale === "es" ? "Mensajes" : "Messages"}</th>
              <th>{locale === "es" ? "Conexión" : "Connection"}</th>
            </tr></thead>
            <tbody>
              {(Object.entries(channels) as [ChannelId, typeof active][]).map(([id, channel]) => (
                <tr key={id} className={selected === id ? "selected" : ""}>
                  <td><button type="button" aria-pressed={selected === id} onClick={() => setSelected(id)}><strong>{channel.name}</strong><small>{channel.status}</small></button></td>
                  {channel.coverage.map((value) => <td key={value}><span className="channel-cell">{value}</span></td>)}
                  <td><span className="channel-cell disconnected">{locale === "es" ? "No conectado" : "Not connected"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <aside className="panel channel-review" aria-live="polite">
          <span>{locale === "es" ? "Inspección local" : "Local inspection"}</span>
          <h2>{active.name}</h2>
          <strong>{active.status}</strong>
          <p>{active.detail}</p>
          {selected === "expedia" ? (
            state.channelReview === "reviewed" ? (
              <div className="channel-reviewed" role="status"><Check size={17} /><span>{locale === "es" ? "Revisado en este navegador · sin publicación" : "Reviewed in this browser · not published"}</span></div>
            ) : (
              <button type="button" className="primary" onClick={markReviewed} disabled={!allowedToReview}>
                {allowedToReview
                  ? locale === "es" ? "Marcar revisión local" : "Mark local review"
                  : locale === "es" ? "Requiere Dirección o Recepción" : "Requires Direction or Reception"}
              </button>
            )
          ) : <small>{locale === "es" ? "Este fixture no ofrece una acción local." : "This fixture has no local action."}</small>}
          <button type="button" disabled className="channel-publish">
            {locale === "es" ? "Publicar deshabilitado · sin conexión" : "Publish disabled · no connection"}
          </button>
        </aside>
      </div>
      <section className="panel channel-requirements" aria-labelledby="channel-requirements-title">
        <div>
          <span className="tag">{locale === "es" ? "Fuera de esta demo" : "Outside this demo"}</span>
          <h2 id="channel-requirements-title">{locale === "es" ? "Qué exigiría conectar de verdad" : "What a live connection would require"}</h2>
        </div>
        <ol>
          {requirements.map(([number, title, detail]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{detail}</p></div></li>)}
        </ol>
      </section>
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
