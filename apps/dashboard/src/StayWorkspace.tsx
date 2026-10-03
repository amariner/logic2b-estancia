import { useEffect, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  House,
  Layers3,
  RotateCcw,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import {
  cancelStay,
  changeStay,
  checkAvailability,
  confirmEnquiry,
  countNights,
  createStayWorkspace,
  getEnquiryOptions,
  quoteStay,
  undoLastChange,
  updateEnquiry,
  STAY_DEMO_DATE,
  STAY_MAX_DATE,
  STAY_MIN_DATE,
  type AvailabilityReason,
  type Stay,
  type StayEnquiry,
  type StayUnit,
  type StayWorkspace as Workspace,
} from "./stays";
import "./stay-workspace.css";

type Locale = "es" | "en";
export type TerravaView =
  "home" | "enquiries" | "planning" | "bookings" | "guests";
type Props = {
  locale: Locale;
  view: TerravaView;
  selectedProperty: string;
  workspace: Workspace;
  onChange: (workspace: Workspace) => void;
  go: (view: TerravaView) => void;
  requestedStay?: { id: string; key: number };
  requestedEnquiry?: { id: string; key: number };
};
type Operation = ReturnType<typeof changeStay>;
const text = (locale: Locale, es: string, en: string) =>
  locale === "es" ? es : en;
const money = (cents: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
const date = (value: string, locale: Locale, year = false) =>
  new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    ...(year ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
const addDays = (value: string, days: number) => {
  const next = new Date(`${value}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};
const reasonText = (reason: string, locale: Locale) => {
  const labels: Record<string, [string, string]> = {
    available: [
      "Disponible para toda la estancia",
      "Available for the full stay",
    ],
    occupied: ["Coincide con otra estancia", "Overlaps another stay"],
    "out-of-service": [
      "Unidad fuera de servicio en estas fechas",
      "Unit out of service on these dates",
    ],
    capacity: ["La capacidad no es suficiente", "Not enough guest capacity"],
    "invalid-dates": [
      "La salida debe ser posterior a la entrada",
      "Check-out must be after check-in",
    ],
    "out-of-range": [
      "Usa fechas del 1 de agosto al 1 de septiembre de 2026",
      "Use dates from 1 August to 1 September 2026",
    ],
    "invalid-guests": [
      "Selecciona entre 1 y 12 huéspedes",
      "Select between 1 and 12 guests",
    ],
    "unknown-unit": [
      "Selecciona una unidad de esta colección",
      "Select a unit in this collection",
    ],
    "invalid-transition": [
      "Este caso ya ha cambiado. Revisa su estado actual",
      "This case has changed. Check its current status",
    ],
    "nothing-to-undo": ["No hay cambios para deshacer", "No changes to undo"],
  };
  const copy = labels[reason];
  return copy
    ? copy[locale === "es" ? 0 : 1]
    : text(
        locale,
        "No se pudo aplicar el cambio. Revisa el caso",
        "Could not apply the change. Review this case",
      );
};
const scenarioName = (id: string, locale: Locale) => {
  const names: Record<string, [string, string]> = {
    "REQ-024": ["Conflicto con alternativa", "Conflict with an alternative"],
    "REQ-025": ["Estancia disponible", "Available stay"],
    "REQ-026": ["Colección completa", "Fully booked collection"],
    "REQ-027": ["Capacidad insuficiente", "Insufficient capacity"],
  };
  return names[id]?.[locale === "es" ? 0 : 1] ?? id;
};

const restoreWorkspaceFocus = (resolveTarget: () => HTMLElement | null) => {
  requestAnimationFrame(() => {
    const target = resolveTarget();
    if (target?.isConnected) target.focus();
    else document.querySelector<HTMLElement>("[data-stay-workspace]")?.focus();
  });
};

export function TerravaWorkspace({
  locale,
  view,
  selectedProperty,
  workspace,
  onChange,
  go,
  requestedStay,
  requestedEnquiry,
}: Props) {
  const [enquiryId, setEnquiryId] = useState("REQ-024");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedStayId, setSelectedStayId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetRevision, setResetRevision] = useState(0);
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const resetTrigger = useRef<HTMLButtonElement>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  const previousProperty = useRef(selectedProperty);
  const detailTrigger = useRef<HTMLElement | null>(null);
  const units = workspace.units.filter(
    (unit) => selectedProperty === "all" || unit.name === selectedProperty,
  );
  const unitIds = new Set(units.map((unit) => unit.id));
  const stays = workspace.stays.filter((stay) => unitIds.has(stay.unitId));
  const enquiries = workspace.enquiries.filter(
    (enquiry) =>
      unitIds.has(enquiry.preferredUnitId) ||
      (enquiry.stayId && stays.some((stay) => stay.id === enquiry.stayId)),
  );
  const enquiry =
    enquiries.find((item) => item.id === enquiryId) ?? enquiries[0];
  const selectedStay = workspace.stays.find(
    (stay) => stay.id === selectedStayId,
  );
  const apply = (result: Operation, success: string) => {
    setError(!result.ok);
    if (!result.ok) {
      setMessage(reasonText(result.error, locale));
      return false;
    }
    onChange(result.workspace);
    setMessage(success);
    return true;
  };
  const openStay = (id: string) => {
    detailTrigger.current = document.activeElement as HTMLElement | null;
    setSelectedStayId(id);
    requestAnimationFrame(() => detailTitle.current?.focus());
  };
  const closeStay = () => {
    setSelectedStayId(null);
    requestAnimationFrame(() => {
      if (detailTrigger.current?.isConnected) detailTrigger.current.focus();
      else workspaceRef.current?.focus();
    });
  };
  useEffect(() => {
    if (previousProperty.current !== selectedProperty) {
      setSelectedStayId(null);
      previousProperty.current = selectedProperty;
    }
  }, [selectedProperty]);
  useEffect(() => {
    if (requestedStay) setSelectedStayId(requestedStay.id);
  }, [requestedStay]);
  useEffect(() => {
    if (requestedEnquiry) {
      setEnquiryId(requestedEnquiry.id);
      setSelectedUnit("");
    }
  }, [requestedEnquiry]);
  useEffect(() => {
    if (selectedStayId && view !== "enquiries")
      requestAnimationFrame(() => detailTitle.current?.focus());
  }, [selectedStayId, view]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !workspaceRef.current?.closest("[inert]") &&
        selectedStayId
      ) {
        setSelectedStayId(null);
        requestAnimationFrame(() => {
          if (detailTrigger.current?.isConnected) detailTrigger.current.focus();
          else workspaceRef.current?.focus();
        });
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [selectedStayId]);
  const showBooking = (id: string) => {
    openStay(id);
    go("bookings");
  };
  return (
    <section
      ref={workspaceRef}
      tabIndex={-1}
      className="stay-workspace"
      data-stay-workspace
      aria-label={text(locale, "Gestor de estancias", "Stay workspace")}
    >
      <div className="sw-context">
        <span>
          <Layers3 size={12} aria-hidden="true" />
          {text(
            locale,
            "Colección · agosto de 2026",
            "Collection · August 2026",
          )}
        </span>
        <span>
          {selectedProperty === "all"
            ? text(
                locale,
                "8 casas · un mismo planning",
                "8 houses · one shared calendar",
              )
            : selectedProperty}
        </span>
        <button
          type="button"
          className="sw-text-button"
          ref={resetTrigger}
          onClick={() => setResetting(!resetting)}
          aria-expanded={resetting}
        >
          <RotateCcw size={13} />
          {text(locale, "Restablecer demo", "Reset demo")}
        </button>
      </div>
      {resetting && (
        <div className="sw-notice sw-reset">
          <p>
            {text(
              locale,
              "Se recuperarán los casos iniciales y se descartarán los cambios de esta visita.",
              "Restore the initial cases and discard changes made during this visit.",
            )}
          </p>
          <div className="sw-actions">
            <button
              type="button"
              className="sw-button"
              onClick={() => {
                setResetting(false);
                restoreWorkspaceFocus(() => resetTrigger.current);
              }}
            >
              {text(locale, "Seguir trabajando", "Keep working")}
            </button>
            <button
              type="button"
              className="sw-button primary"
              onClick={() => {
                onChange(createStayWorkspace());
                setResetRevision((revision) => revision + 1);
                setSelectedStayId(null);
                setEnquiryId("REQ-024");
                setSelectedUnit("");
                setResetting(false);
                restoreWorkspaceFocus(() => resetTrigger.current);
                setError(false);
                setMessage(
                  text(
                    locale,
                    "Demo restablecida. Todos los casos vuelven a su estado inicial.",
                    "Demo reset. All cases are back to their initial state.",
                  ),
                );
              }}
            >
              {text(locale, "Restablecer casos", "Reset cases")}
            </button>
          </div>
        </div>
      )}
      <div
        className={`sw-feedback${error ? " is-error" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message && (
          <span>
            {error ? <CircleAlert size={16} /> : <CheckCircle2 size={16} />}
            {message}
          </span>
        )}
        {workspace.history.length > 0 && (
          <button
            type="button"
            className="sw-text-button"
            onClick={() => {
              const applied = apply(
                undoLastChange(workspace),
                text(
                  locale,
                  "Último cambio deshecho. Planning y estancia actualizados.",
                  "Last change undone. Calendar and stay updated.",
                ),
              );
              if (applied && workspace.history.length === 1)
                restoreWorkspaceFocus(
                  () => detailTitle.current ?? workspaceRef.current,
                );
            }}
          >
            <RotateCcw size={14} />
            {text(locale, "Deshacer último cambio", "Undo last change")}
          </button>
        )}
      </div>
      {view === "home" && (
        <StayHome
          locale={locale}
          units={units}
          stays={stays}
          enquiries={enquiries}
          go={go}
          openStay={openStay}
        />
      )}
      {view === "enquiries" && (
        <>
          <div className="sw-heading">
            <div>
              <span className="sw-eyebrow">
                {text(
                  locale,
                  "De la consulta a la estancia",
                  "From enquiry to stay",
                )}
              </span>
              <h2>
                {text(
                  locale,
                  "Encuentra el mejor encaje.",
                  "Find the right fit.",
                )}
              </h2>
              <p>
                {text(
                  locale,
                  "Compara fechas, capacidad e importe antes de confirmar.",
                  "Compare dates, capacity and price before confirming.",
                )}
              </p>
            </div>
            <label className="sw-fixture-picker">
              {text(locale, "Caso de demostración", "Demo case")}
              <select
                value={enquiry?.id ?? ""}
                onChange={(event) => {
                  setEnquiryId(event.target.value);
                  setSelectedUnit("");
                  setMessage("");
                }}
                disabled={!enquiries.length}
              >
                {!enquiries.length && (
                  <option value="">
                    {text(locale, "Sin solicitudes", "No enquiries")}
                  </option>
                )}
                {enquiries.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} · {scenarioName(item.id, locale)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {enquiry ? (
            <EnquiryCase
              key={`${enquiry.id}-${resetRevision}`}
              locale={locale}
              enquiry={enquiry}
              workspace={workspace}
              visibleUnits={units}
              selectedUnit={selectedUnit}
              selectUnit={setSelectedUnit}
              apply={apply}
              showBooking={showBooking}
            />
          ) : (
            <EmptyState
              locale={locale}
              title={text(
                locale,
                "No hay solicitudes para esta casa",
                "No enquiries for this house",
              )}
              body={text(
                locale,
                "Prueba otra propiedad en el selector superior o abre su planning para consultar las estancias.",
                "Choose another property above or open its calendar to view stays.",
              )}
              action={() => go("planning")}
              actionLabel={text(locale, "Ver planning", "View calendar")}
            />
          )}
        </>
      )}
      {view === "planning" && (
        <StayPlanning
          locale={locale}
          units={units}
          stays={stays}
          openStay={openStay}
        />
      )}
      {view === "bookings" && (
        <StayList
          locale={locale}
          stays={stays}
          units={units}
          openStay={openStay}
        />
      )}
      {view === "guests" && (
        <GuestList
          locale={locale}
          stays={stays}
          units={units}
          openStay={openStay}
        />
      )}
      {selectedStay && view !== "enquiries" && (
        <>
          {!unitIds.has(selectedStay.unitId) && (
            <p className="sw-filter-note">
              {text(
                locale,
                "La estancia seleccionada pertenece ahora a otra propiedad. El listado conserva el filtro superior.",
                "The selected stay now belongs to another property. The list keeps the property filter above.",
              )}
            </p>
          )}
          <StayDetail
            key={selectedStay.id}
            locale={locale}
            stay={selectedStay}
            workspace={workspace}
            apply={apply}
            close={closeStay}
            titleRef={detailTitle}
          />
        </>
      )}
      <p className="sw-boundary">
        {text(
          locale,
          "Datos ficticios · cambios solo durante esta visita · se restablecen al recargar. No se realizan reservas, cobros ni comunicaciones reales.",
          "Fictitious data · changes last for this visit and reset on reload. No real bookings, payments or messages are made.",
        )}
      </p>
    </section>
  );
}

type Apply = (result: Operation, success: string) => boolean;
function EnquiryCase({
  locale,
  enquiry,
  workspace,
  visibleUnits,
  selectedUnit,
  selectUnit,
  apply,
  showBooking,
}: {
  locale: Locale;
  enquiry: StayEnquiry;
  workspace: Workspace;
  visibleUnits: StayUnit[];
  selectedUnit: string;
  selectUnit: (id: string) => void;
  apply: Apply;
  showBooking: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const editTrigger = useRef<HTMLButtonElement>(null);
  const finishEditing = () => {
    setEditing(false);
    restoreWorkspaceFocus(() => editTrigger.current);
  };
  const allOptions = getEnquiryOptions(workspace, enquiry.id);
  const options = allOptions.filter((option) =>
    visibleUnits.some((unit) => unit.id === option.unit.id),
  );
  const preferred = options.find(
    (option) => option.unit.id === enquiry.preferredUnitId,
  );
  const available = options.filter((option) => option.availability.available);
  const selected =
    available.find((option) => option.unit.id === selectedUnit) ??
    (preferred?.availability.available ? preferred : available[0]);
  const featureOptions = [preferred, selected, ...available]
    .filter(
      (option, index, list) =>
        option &&
        list.findIndex((entry) => entry?.unit.id === option.unit.id) === index,
    )
    .slice(0, 3);
  const otherOptions = options.filter(
    (option) =>
      !featureOptions.some((entry) => entry?.unit.id === option.unit.id),
  );
  const linkedStay = workspace.stays.find((stay) => stay.id === enquiry.stayId);
  const optionCard = (option: (typeof options)[number]) => (
    <article
      key={option.unit.id}
      className={`sw-option${option.availability.available ? " is-available" : " is-unavailable"}${selected?.unit.id === option.unit.id ? " is-selected" : ""}`}
      data-unit-option={option.unit.id}
    >
      <div className="sw-option-top">
        <span className="sw-mini-icon">
          <House size={18} />
        </span>
        <span
          className={`sw-status ${option.availability.available ? "is-good" : "is-warning"}`}
        >
          {option.availability.available
            ? text(locale, "Disponible", "Available")
            : text(locale, "Sin disponibilidad", "Unavailable")}
        </span>
      </div>
      <h3>{option.unit.name}</h3>
      <p className="sw-option-capacity">
        {text(
          locale,
          `Hasta ${option.unit.capacity} huéspedes`,
          `Up to ${option.unit.capacity} guests`,
        )}
        {option.unit.id === enquiry.preferredUnitId && (
          <span> · {text(locale, "Solicitada", "Requested")}</span>
        )}
      </p>
      <strong className="sw-option-price">
        {option.quote ? money(option.quote.totalCents, locale) : "—"}
        <small>{text(locale, " / estancia", " / stay")}</small>
      </strong>
      <p className="sw-reason">
        {option.availability.available ? (
          <Check size={14} />
        ) : (
          <CircleAlert size={14} />
        )}
        {reasonText(option.availability.reason, locale)}
      </p>
      {option.availability.reason === "occupied" &&
        option.availability.conflicts[0] && (
          <p className="sw-conflict-date">
            {date(option.availability.conflicts[0].startDate, locale)} –{" "}
            {date(option.availability.conflicts[0].endDate, locale)}
          </p>
        )}
      {option.availability.available && (
        <button
          type="button"
          className="sw-button"
          aria-pressed={selected?.unit.id === option.unit.id}
          onClick={() => selectUnit(option.unit.id)}
        >
          {selected?.unit.id === option.unit.id ? <Check size={15} /> : null}
          {text(
            locale,
            `Seleccionar ${option.unit.name}`,
            `Select ${option.unit.name}`,
          )}
        </button>
      )}
    </article>
  );
  return (
    <>
      <ol
        className="sw-progress"
        aria-label={text(
          locale,
          "Progreso de la solicitud",
          "Enquiry progress",
        )}
      >
        <li className="is-complete">
          <Check size={14} />
          {text(locale, "Solicitud", "Enquiry")}
        </li>
        <li
          className={linkedStay ? "is-complete" : "is-current"}
          aria-current={!linkedStay ? "step" : undefined}
        >
          <span>02</span>
          {text(locale, "Disponibilidad", "Availability")}
        </li>
        <li
          className={linkedStay ? "is-current" : ""}
          aria-current={linkedStay ? "step" : undefined}
        >
          <span>03</span>
          {text(locale, "Estancia", "Stay")}
        </li>
      </ol>
      <div className="sw-enquiry-layout">
        <div className="sw-enquiry-main">
          <article className="panel sw-request">
            <div className="sw-card-heading">
              <div>
                <span className="sw-eyebrow">
                  {enquiry.id} ·{" "}
                  {text(locale, "Solicitud ficticia", "Fictitious enquiry")}
                </span>
                <h3>{enquiry.guestName}</h3>
              </div>
              <span
                className={`sw-status ${linkedStay ? "is-good" : "is-warning"}`}
              >
                {linkedStay
                  ? text(
                      locale,
                      "Convertida en estancia",
                      "Converted to a stay",
                    )
                  : text(locale, "Por resolver", "Needs review")}
              </span>
            </div>
            <div className="sw-request-facts">
              <span>
                <CalendarDays size={16} />
                <time dateTime={enquiry.startDate}>
                  {date(enquiry.startDate, locale)}
                </time>{" "}
                →{" "}
                <time dateTime={enquiry.endDate}>
                  {date(enquiry.endDate, locale)}
                </time>
              </span>
              <span>
                <Users size={16} />
                {enquiry.guests} {text(locale, "huéspedes", "guests")}
              </span>
              <span>
                <House size={16} />
                {
                  workspace.units.find(
                    (unit) => unit.id === enquiry.preferredUnitId,
                  )?.name
                }
              </span>
            </div>
            {!linkedStay && (
              <button
                type="button"
                className="sw-text-button"
                ref={editTrigger}
                onClick={() => setEditing(!editing)}
                aria-expanded={editing}
              >
                <SlidersHorizontal size={14} />
                {text(locale, "Ajustar solicitud", "Adjust enquiry")}
              </button>
            )}
            {editing && !linkedStay && (
              <StayFields
                key={`${enquiry.preferredUnitId}-${enquiry.startDate}-${enquiry.endDate}-${enquiry.guests}`}
                locale={locale}
                units={workspace.units}
                initial={{
                  unitId: enquiry.preferredUnitId,
                  startDate: enquiry.startDate,
                  endDate: enquiry.endDate,
                  guests: enquiry.guests,
                }}
                submitLabel={text(
                  locale,
                  "Actualizar solicitud",
                  "Update enquiry",
                )}
                close={finishEditing}
                submit={(values) => {
                  if (
                    apply(
                      updateEnquiry(workspace, enquiry.id, {
                        preferredUnitId: values.unitId,
                        startDate: values.startDate,
                        endDate: values.endDate,
                        guests: values.guests,
                      }),
                      text(
                        locale,
                        "Solicitud actualizada. La disponibilidad se ha vuelto a calcular.",
                        "Enquiry updated. Availability has been recalculated.",
                      ),
                    )
                  ) {
                    finishEditing();
                    selectUnit("");
                  }
                }}
              />
            )}
          </article>
          {linkedStay ? (
            <article className="panel sw-confirmed">
              <span className="sw-confirm-icon">
                <CheckCircle2 size={25} />
              </span>
              <h3>
                {text(
                  locale,
                  "Una estancia, todo conectado.",
                  "One stay, everything connected.",
                )}
              </h3>
              <p>
                {text(
                  locale,
                  "La solicitud, el planning y la ficha de huésped comparten ahora la misma estancia ficticia.",
                  "The enquiry, calendar and guest record now share the same fictitious stay.",
                )}
              </p>
              <button
                type="button"
                className="sw-button primary"
                onClick={() => showBooking(linkedStay.id)}
              >
                {text(locale, "Ver estancia", "View stay")}
                <ArrowRight size={16} />
              </button>
            </article>
          ) : (
            <>
              <div className="sw-section-heading">
                <div>
                  <h3>
                    {text(
                      locale,
                      "Opciones para estas fechas",
                      "Options for these dates",
                    )}
                  </h3>
                  <p>
                    {text(
                      locale,
                      "El precio incluye alojamiento y limpieza.",
                      "The price includes accommodation and cleaning.",
                    )}
                  </p>
                </div>
                <span className="sw-count">
                  {available.length} / {options.length}{" "}
                  {text(locale, "disponibles", "available")}
                </span>
              </div>
              {!available.length && (
                <EmptyState
                  locale={locale}
                  title={text(
                    locale,
                    "No hay una alternativa que encaje",
                    "No suitable alternative",
                  )}
                  body={
                    enquiry.guests >
                    Math.max(...workspace.units.map((unit) => unit.capacity))
                      ? text(
                          locale,
                          "Ninguna casa admite a todo el grupo. Ajusta los huéspedes o prueba otro caso de demostración.",
                          "No house accommodates the whole group. Adjust the guest count or try another demo case.",
                        )
                      : text(
                          locale,
                          "Las fechas, los bloqueos y el filtro de propiedad dejan esta solicitud sin opciones. Ajusta la solicitud o cambia el caso superior.",
                          "Dates, service blocks and the property filter leave no suitable options. Adjust the enquiry or choose another case above.",
                        )
                  }
                />
              )}
              <div className="sw-options">
                {featureOptions.map((option) => option && optionCard(option))}
              </div>
              {!!otherOptions.length && (
                <details className="sw-more-options">
                  <summary>
                    {text(
                      locale,
                      `Ver otras ${otherOptions.length} unidades y sus motivos`,
                      `View ${otherOptions.length} more units and their reasons`,
                    )}
                  </summary>
                  <div className="sw-options">
                    {otherOptions.map(optionCard)}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
        <aside
          className="panel sw-quote"
          aria-label={text(locale, "Resumen de la estancia", "Stay summary")}
        >
          <span className="sw-eyebrow">
            {text(locale, "Resumen de la estancia", "Stay summary")}
          </span>
          <h3>
            {linkedStay
              ? workspace.units.find((unit) => unit.id === linkedStay.unitId)
                  ?.name
              : (selected?.unit.name ??
                text(locale, "Sin unidad disponible", "No unit available"))}
          </h3>
          {(linkedStay?.quote ?? selected?.quote) ? (
            <Quote
              locale={locale}
              quote={(linkedStay?.quote ?? selected?.quote)!}
            />
          ) : (
            <p className="sw-muted">
              {text(
                locale,
                "Necesitas una unidad disponible para continuar.",
                "An available unit is required to continue.",
              )}
            </p>
          )}
          {!linkedStay && (
            <button
              type="button"
              className="sw-button primary"
              disabled={!selected || editing}
              onClick={() => {
                if (selected)
                  apply(
                    confirmEnquiry(workspace, enquiry.id, selected.unit.id),
                    text(
                      locale,
                      "Estancia ficticia confirmada. Ya aparece en planning, reservas y huéspedes.",
                      "Fictitious stay confirmed. It now appears in the calendar, bookings and guests.",
                    ),
                  );
              }}
            >
              {text(
                locale,
                "Confirmar estancia ficticia",
                "Confirm fictitious stay",
              )}
              <ArrowRight size={16} />
            </button>
          )}
          {editing && (
            <p className="sw-quote-note" role="status">
              {text(
                locale,
                "Guarda o descarta la edición de la solicitud antes de confirmar.",
                "Save or discard enquiry edits before confirming.",
              )}
            </p>
          )}
          <p className="sw-quote-note">
            {text(
              locale,
              "Simulación en memoria. Puedes modificar, cancelar y deshacer los cambios.",
              "In-memory simulation. You can edit, cancel and undo changes.",
            )}
          </p>
        </aside>
      </div>
    </>
  );
}

function Quote({ locale, quote }: { locale: Locale; quote: Stay["quote"] }) {
  return (
    <dl className="sw-price-breakdown">
      <div>
        <dt>
          {quote.nights} {text(locale, "noches", "nights")} ×{" "}
          {money(quote.nightlyRateCents, locale)}
        </dt>
        <dd>{money(quote.accommodationCents, locale)}</dd>
      </div>
      <div>
        <dt>{text(locale, "Limpieza", "Cleaning")}</dt>
        <dd>{money(quote.cleaningFeeCents, locale)}</dd>
      </div>
      <div className="sw-price-total">
        <dt>{text(locale, "Total ficticio", "Fictitious total")}</dt>
        <dd data-stay-total>{money(quote.totalCents, locale)}</dd>
      </div>
    </dl>
  );
}

function EmptyState({
  title,
  body,
  action,
  actionLabel,
}: {
  locale: Locale;
  title: string;
  body: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="sw-empty">
      <span className="sw-mini-icon">
        <Layers3 size={20} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action && (
        <button type="button" className="sw-button" onClick={action}>
          {actionLabel}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}

function StayHome({
  locale,
  units,
  stays,
  enquiries,
  go,
  openStay,
}: {
  locale: Locale;
  units: StayUnit[];
  stays: Stay[];
  enquiries: StayEnquiry[];
  go: Props["go"];
  openStay: (id: string) => void;
}) {
  const active = stays.filter((stay) => stay.status === "confirmed");
  const arrivals = active.filter((stay) => stay.startDate === STAY_DEMO_DATE);
  const occupied = active.filter(
    (stay) => stay.startDate <= STAY_DEMO_DATE && stay.endDate > STAY_DEMO_DATE,
  );
  const pending = enquiries.filter((enquiry) => enquiry.status === "new");
  const upcoming = active
    .filter((stay) => stay.endDate > STAY_DEMO_DATE)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);
  const unavailable = units.filter((unit) =>
    unit.outOfService.some(
      (block) =>
        block.startDate <= STAY_DEMO_DATE && block.endDate > STAY_DEMO_DATE,
    ),
  );
  return (
    <>
      <div className="sw-heading">
        <div>
          <span className="sw-eyebrow">
            {text(
              locale,
              "Tu colección, bajo control",
              "Your collection, in view",
            )}
          </span>
          <h2>
            {text(locale, "Cada estancia cuenta.", "Every stay matters.")}
          </h2>
          <p>
            {text(
              locale,
              "Prioridades claras. Una sola versión de cada estancia.",
              "Clear priorities. One shared record for every stay.",
            )}
          </p>
        </div>
        <span className="sw-snapshot">
          <CalendarDays size={16} />
          {date(STAY_DEMO_DATE, locale, true)}
          <small>{text(locale, "Fecha de la demo", "Demo date")}</small>
        </span>
      </div>
      <div className="sw-metrics">
        {[
          {
            value: pending.length,
            label: text(locale, "Solicitudes abiertas", "Open enquiries"),
            detail: text(locale, "Pendientes de encaje", "Waiting for a match"),
            view: "enquiries" as const,
            icon: <ArrowDownLeft size={19} />,
          },
          {
            value: arrivals.length,
            label: text(locale, "Entradas hoy", "Arrivals today"),
            detail: date(STAY_DEMO_DATE, locale),
            view: "bookings" as const,
            icon: <CalendarDays size={19} />,
          },
          {
            value: `${occupied.length}/${units.length}`,
            label: text(locale, "Casas ocupadas", "Occupied houses"),
            detail: text(locale, "En la fecha de la demo", "On the demo date"),
            view: "planning" as const,
            icon: <House size={19} />,
          },
          {
            value: active.length,
            label: text(locale, "Estancias confirmadas", "Confirmed stays"),
            detail: text(
              locale,
              "En toda la colección visible",
              "Across the visible collection",
            ),
            view: "bookings" as const,
            icon: <CheckCircle2 size={19} />,
          },
        ].map((metric) => (
          <button
            type="button"
            key={metric.view + metric.label}
            onClick={() => go(metric.view)}
          >
            <span>
              {metric.label}
              {metric.icon}
            </span>
            <strong>{metric.value}</strong>
            <small>
              {metric.detail}
              <ArrowRight size={14} />
            </small>
          </button>
        ))}
      </div>
      <div className="sw-home-grid">
        <article className="panel sw-priority">
          <span className="sw-eyebrow">
            {text(locale, "Siguiente paso", "Next step")}
          </span>
          <h3>
            {pending.length
              ? text(
                  locale,
                  "Una solicitud. La mejor alternativa.",
                  "One enquiry. The best alternative.",
                )
              : text(
                  locale,
                  "Todo al día en esta propiedad.",
                  "This property is up to date.",
                )}
          </h3>
          <p>
            {pending.length
              ? text(
                  locale,
                  "Revisa el conflicto, compara las casas disponibles y crea una estancia ficticia que se refleje en todo el gestor.",
                  "Review the conflict, compare available houses and create a fictitious stay reflected across the workspace.",
                )
              : text(
                  locale,
                  "Consulta las próximas estancias o explora otra casa de la colección.",
                  "View upcoming stays or explore another house in the collection.",
                )}
          </p>
          <button
            type="button"
            className="sw-button primary"
            onClick={() => go(pending.length ? "enquiries" : "planning")}
          >
            {pending.length
              ? text(locale, "Resolver solicitud", "Resolve enquiry")
              : text(locale, "Ver planning", "View calendar")}
            <ArrowRight size={16} />
          </button>
        </article>
        <article className="panel">
          <div className="sw-section-heading">
            <h3>
              {text(locale, "Atención operativa", "Operational attention")}
            </h3>
            <span className="sw-count">{unavailable.length}</span>
          </div>
          {unavailable.length ? (
            unavailable.map((unit) => (
              <div className="sw-operational" key={unit.id}>
                <CircleAlert size={18} />
                <div>
                  <strong>{unit.name}</strong>
                  <span>
                    {text(locale, "Fuera de servicio", "Out of service")} ·{" "}
                    {date(unit.outOfService[0].startDate, locale)} –{" "}
                    {date(unit.outOfService[0].endDate, locale)}
                  </span>
                  <p>
                    {text(
                      locale,
                      "El bloqueo se tiene en cuenta al buscar disponibilidad.",
                      "The block is included in availability checks.",
                    )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="sw-muted">
              {text(
                locale,
                "No hay bloqueos de servicio para esta fecha.",
                "No service blocks on this date.",
              )}
            </p>
          )}
          <button
            type="button"
            className="sw-text-button"
            onClick={() => go("planning")}
          >
            {text(locale, "Abrir planning", "Open calendar")}
            <ArrowRight size={15} />
          </button>
        </article>
      </div>
      <article className="panel sw-upcoming">
        <div className="sw-section-heading">
          <div>
            <h3>
              {text(
                locale,
                "En curso y próximas",
                "Current and upcoming stays",
              )}
            </h3>
            <p>
              {text(
                locale,
                "Selecciona una para consultar o ajustar su ficha.",
                "Select a stay to view or update its details.",
              )}
            </p>
          </div>
          <button
            type="button"
            className="sw-text-button"
            onClick={() => go("bookings")}
          >
            {text(locale, "Ver todas", "View all")}
            <ArrowRight size={15} />
          </button>
        </div>
        {upcoming.length ? (
          upcoming.map((stay) => (
            <StayRow
              key={stay.id}
              locale={locale}
              stay={stay}
              unit={units.find((unit) => unit.id === stay.unitId)}
              openStay={openStay}
            />
          ))
        ) : (
          <p className="sw-muted">
            {text(
              locale,
              "No hay próximas estancias en esta propiedad.",
              "No upcoming stays at this property.",
            )}
          </p>
        )}
      </article>
    </>
  );
}

function StayRow({
  locale,
  stay,
  unit,
  openStay,
}: {
  locale: Locale;
  stay: Stay;
  unit?: StayUnit;
  openStay: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`sw-stay-row${stay.status === "cancelled" ? " is-cancelled" : ""}`}
      data-stay-id={stay.id}
      onClick={() => openStay(stay.id)}
    >
      <span className="sw-stay-name">
        <strong>{stay.guestName}</strong>
        <small>
          {stay.id} · {unit?.name}
        </small>
      </span>
      <span className="sw-stay-dates">
        <time dateTime={stay.startDate}>{date(stay.startDate, locale)}</time> →{" "}
        <time dateTime={stay.endDate}>{date(stay.endDate, locale)}</time>
        <small>
          {stay.guests} {text(locale, "huéspedes", "guests")} ·{" "}
          {stay.quote.nights} {text(locale, "noches", "nights")}
        </small>
      </span>
      <span
        className={`sw-status ${stay.status === "confirmed" ? "is-good" : ""}`}
      >
        {stay.status === "confirmed"
          ? text(locale, "Confirmada", "Confirmed")
          : text(locale, "Cancelada", "Cancelled")}
      </span>
      <span className="sw-stay-amount">
        {money(stay.quote.totalCents, locale)}
        <ChevronRight size={16} />
      </span>
    </button>
  );
}

function StayList({
  locale,
  stays,
  units,
  openStay,
}: {
  locale: Locale;
  stays: Stay[];
  units: StayUnit[];
  openStay: (id: string) => void;
}) {
  const [filter, setFilter] = useState("all");
  const shown = stays
    .filter((stay) => filter === "all" || stay.status === filter)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  return (
    <>
      <div className="sw-heading">
        <div>
          <span className="sw-eyebrow">
            {text(locale, "Libro de estancias", "Stay ledger")}
          </span>
          <h2>{text(locale, "Todo en su sitio.", "Everything in place.")}</h2>
          <p>
            {text(
              locale,
              "Fechas, huéspedes e importes conectados con el planning.",
              "Dates, guests and prices connected to the calendar.",
            )}
          </p>
        </div>
        <label className="sw-fixture-picker">
          {text(locale, "Estado de la estancia", "Stay status")}
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">
              {text(locale, "Todas las estancias", "All stays")}
            </option>
            <option value="confirmed">
              {text(locale, "Confirmadas", "Confirmed")}
            </option>
            <option value="cancelled">
              {text(locale, "Canceladas", "Cancelled")}
            </option>
          </select>
        </label>
      </div>
      <article className="panel sw-stay-ledger">
        <div className="sw-section-heading">
          <h3>
            {shown.length} {text(locale, "estancias", "stays")}
          </h3>
          <span className="sw-eyebrow">
            EUR · {text(locale, "Datos ficticios", "Fictitious data")}
          </span>
        </div>
        {shown.length ? (
          shown.map((stay) => (
            <StayRow
              key={stay.id}
              locale={locale}
              stay={stay}
              unit={units.find((unit) => unit.id === stay.unitId)}
              openStay={openStay}
            />
          ))
        ) : (
          <EmptyState
            locale={locale}
            title={text(
              locale,
              "Ninguna estancia en esta vista",
              "No stays in this view",
            )}
            body={text(
              locale,
              "Cambia el estado o la propiedad para ver otras estancias. Las solicitudes confirmadas aparecerán aquí.",
              "Change the status or property to see other stays. Confirmed enquiries will appear here.",
            )}
          />
        )}
      </article>
    </>
  );
}

function GuestList({
  locale,
  stays,
  units,
  openStay,
}: {
  locale: Locale;
  stays: Stay[];
  units: StayUnit[];
  openStay: (id: string) => void;
}) {
  const active = stays.filter((stay) => stay.status === "confirmed");
  return (
    <>
      <div className="sw-heading">
        <div>
          <span className="sw-eyebrow">
            {text(locale, "Personas y estancias", "People and stays")}
          </span>
          <h2>
            {text(locale, "El contexto, a mano.", "Context, close at hand.")}
          </h2>
          <p>
            {text(
              locale,
              "Titulares ficticios vinculados a sus estancias confirmadas.",
              "Fictitious lead guests linked to their confirmed stays.",
            )}
          </p>
        </div>
        <span className="sw-count">
          {active.length} {text(locale, "fichas", "records")}
        </span>
      </div>
      {active.length ? (
        <div className="sw-guests">
          {active.map((stay) => (
            <button
              type="button"
              className="panel sw-guest"
              data-guest-stay={stay.id}
              key={stay.id}
              onClick={() => openStay(stay.id)}
            >
              <span className="sw-avatar" aria-hidden="true">
                {stay.guestName
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <h3>{stay.guestName}</h3>
              <span className="sw-guest-email">{stay.email}</span>
              <span className="sw-guest-unit">
                {units.find((unit) => unit.id === stay.unitId)?.name}
              </span>
              <span>
                <time dateTime={stay.startDate}>
                  {date(stay.startDate, locale)}
                </time>{" "}
                –{" "}
                <time dateTime={stay.endDate}>
                  {date(stay.endDate, locale)}
                </time>
              </span>
              <span className="sw-guest-footer">
                {stay.id} · {stay.guests} {text(locale, "huéspedes", "guests")}
                <ArrowRight size={16} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          locale={locale}
          title={text(
            locale,
            "Aún no hay huéspedes en esta vista",
            "No guests in this view yet",
          )}
          body={text(
            locale,
            "Las estancias confirmadas crean aquí su ficha ficticia. Prueba otra propiedad o confirma una solicitud disponible.",
            "Confirmed stays create a fictitious record here. Try another property or confirm an available enquiry.",
          )}
        />
      )}
    </>
  );
}

function StayPlanning({
  locale,
  units,
  stays,
  openStay,
}: {
  locale: Locale;
  units: StayUnit[];
  stays: Stay[];
  openStay: (id: string) => void;
}) {
  const [start, setStart] = useState("2026-08-18");
  const days = Array.from({ length: 14 }, (_, index) => addDays(start, index));
  const active = stays.filter((stay) => stay.status === "confirmed");
  const visible = active.filter(
    (stay) => stay.startDate <= days[13] && stay.endDate > start,
  );
  return (
    <>
      <div className="sw-heading">
        <div>
          <span className="sw-eyebrow">
            {text(
              locale,
              "Disponibilidad de la colección",
              "Collection availability",
            )}
          </span>
          <h2>
            {text(
              locale,
              "La estancia, en perspectiva.",
              "Every stay in perspective.",
            )}
          </h2>
          <p>
            {text(
              locale,
              "Selecciona una estancia para ver los detalles. La salida deja libre esa noche.",
              "Select a stay to see its details. The check-out night is available.",
            )}
          </p>
        </div>
      </div>
      <article className="panel sw-calendar">
        <div className="sw-calendar-toolbar">
          <div>
            <h3>
              {date(start, locale)} – {date(days[13], locale, true)}
            </h3>
            <span>
              {units.length} {text(locale, "unidades", "units")} ·{" "}
              {visible.length}{" "}
              {text(locale, "estancias visibles", "visible stays")}
            </span>
          </div>
          <div className="sw-calendar-navigation">
            <button
              type="button"
              className="sw-button"
              aria-label={text(
                locale,
                "14 días anteriores",
                "Previous 14 days",
              )}
              disabled={start === STAY_MIN_DATE}
              onClick={() =>
                setStart(
                  addDays(start, -14) < STAY_MIN_DATE
                    ? STAY_MIN_DATE
                    : addDays(start, -14),
                )
              }
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="sw-button"
              onClick={() => setStart("2026-08-18")}
            >
              {text(locale, "Fecha demo", "Demo date")}
            </button>
            <button
              type="button"
              className="sw-button"
              aria-label={text(locale, "14 días siguientes", "Next 14 days")}
              disabled={addDays(start, 14) >= STAY_MAX_DATE}
              onClick={() =>
                setStart(
                  addDays(start, 14) > "2026-08-18"
                    ? "2026-08-18"
                    : addDays(start, 14),
                )
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div
          className="sw-calendar-scroll"
          tabIndex={0}
          role="region"
          aria-label={text(
            locale,
            "Planning de 14 días; desplázate para ver todas las fechas",
            "14-day calendar; scroll to see all dates",
          )}
        >
          <div className="sw-calendar-grid">
            <div className="sw-calendar-days">
              <span>
                {text(locale, "Unidad / capacidad", "Unit / capacity")}
              </span>
              {days.map((day) => (
                <span
                  key={day}
                  className={day === STAY_DEMO_DATE ? "is-today" : ""}
                >
                  <small>
                    {new Intl.DateTimeFormat(
                      locale === "es" ? "es-ES" : "en-GB",
                      { weekday: "short", timeZone: "UTC" },
                    ).format(new Date(`${day}T12:00:00Z`))}
                  </small>
                  <time dateTime={day}>{Number(day.slice(-2))}</time>
                </span>
              ))}
            </div>
            {units.map((unit) => (
              <div className="sw-calendar-row" key={unit.id}>
                <div className="sw-calendar-unit">
                  <strong>{unit.name}</strong>
                  <small>
                    <Users size={12} />
                    {unit.capacity} {text(locale, "huéspedes", "guests")}
                  </small>
                </div>
                <div className="sw-calendar-track">
                  {days.map((day, index) => (
                    <span
                      className={`sw-calendar-cell${day === STAY_DEMO_DATE ? " is-today" : ""}`}
                      key={day}
                      style={{ gridColumn: index + 1 }}
                    />
                  ))}
                  {unit.outOfService
                    .filter(
                      (block) =>
                        block.startDate <= days[13] && block.endDate > start,
                    )
                    .map((block) => {
                      const from = Math.max(
                        0,
                        countNights(start, block.startDate) ?? 0,
                      );
                      const to =
                        block.endDate > addDays(start, 14)
                          ? 14
                          : Math.max(0, countNights(start, block.endDate) ?? 0);
                      return (
                        <span
                          key={block.startDate}
                          className="sw-calendar-block"
                          style={{ gridColumn: `${from + 1} / ${to + 1}` }}
                          title={`${text(locale, "Fuera de servicio", "Out of service")} · ${date(block.startDate, locale)} – ${date(block.endDate, locale)}`}
                        >
                          <CircleAlert size={12} />
                          {text(locale, "Fuera de servicio", "Out of service")}
                        </span>
                      );
                    })}
                  {visible
                    .filter((stay) => stay.unitId === unit.id)
                    .map((stay) => {
                      const from =
                        stay.startDate <= start
                          ? 0
                          : (countNights(start, stay.startDate) ?? 0);
                      const to =
                        stay.endDate >= addDays(start, 14)
                          ? 14
                          : (countNights(start, stay.endDate) ?? 0);
                      return (
                        <button
                          key={stay.id}
                          type="button"
                          data-planning-stay={stay.id}
                          className="sw-calendar-stay"
                          style={{ gridColumn: `${from + 1} / ${to + 1}` }}
                          onClick={() => openStay(stay.id)}
                          aria-label={`${stay.id} · ${stay.guestName} · ${unit.name} · ${date(stay.startDate, locale)} – ${date(stay.endDate, locale)}`}
                        >
                          <span>{stay.guestName}</span>
                          <small>{stay.id}</small>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sw-calendar-legend">
          <span>
            <i className="is-stay" />
            {text(locale, "Estancia confirmada", "Confirmed stay")}
          </span>
          <span>
            <i className="is-block" />
            {text(locale, "Fuera de servicio", "Out of service")}
          </span>
          <span>
            <i />
            {text(locale, "Disponible", "Available")}
          </span>
          <span>
            {text(
              locale,
              "Fecha de referencia: 21 ago 2026",
              "Reference date: 21 Aug 2026",
            )}
          </span>
        </div>
      </article>
      {!visible.length && (
        <EmptyState
          locale={locale}
          title={text(locale, "Un planning despejado", "A clear calendar")}
          body={text(
            locale,
            "No hay estancias confirmadas en este periodo para las casas seleccionadas. Los bloqueos de servicio siguen visibles.",
            "No confirmed stays in this period for the selected houses. Service blocks remain visible.",
          )}
        />
      )}
    </>
  );
}

type FieldValues = {
  unitId: string;
  startDate: string;
  endDate: string;
  guests: number;
};
function StayFields({
  locale,
  units,
  initial,
  submitLabel,
  submit,
  close,
  workspace,
  stayId,
}: {
  locale: Locale;
  units: StayUnit[];
  initial: FieldValues;
  submitLabel: string;
  submit: (values: FieldValues) => void;
  close: () => void;
  workspace?: Workspace;
  stayId?: string;
}) {
  const [values, setValues] = useState(initial);
  const availability = workspace
    ? checkAvailability(workspace, { ...values, excludeStayId: stayId })
    : null;
  const unit = units.find((item) => item.id === values.unitId);
  const quote = unit ? quoteStay(unit, values.startDate, values.endDate) : null;
  const invalidDates =
    values.startDate < STAY_MIN_DATE ||
    values.endDate > STAY_MAX_DATE ||
    values.startDate >= values.endDate;
  return (
    <form
      className="sw-edit-form"
      onSubmit={(event) => {
        event.preventDefault();
        submit(values);
      }}
    >
      <div className="sw-fields">
        <label>
          {text(locale, "Unidad", "Unit")}
          <select
            value={values.unitId}
            onChange={(event) =>
              setValues({ ...values, unitId: event.target.value })
            }
          >
            {units.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.capacity}{" "}
                {text(locale, "personas", "people")}
              </option>
            ))}
          </select>
        </label>
        <label>
          {text(locale, "Huéspedes", "Guests")}
          <select
            value={values.guests}
            onChange={(event) =>
              setValues({ ...values, guests: Number(event.target.value) })
            }
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option value={index + 1} key={index}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          {text(locale, "Entrada", "Check-in")}
          <input
            type="date"
            required
            min={STAY_MIN_DATE}
            max={addDays(STAY_MAX_DATE, -1)}
            value={values.startDate}
            onChange={(event) =>
              setValues({ ...values, startDate: event.target.value })
            }
          />
        </label>
        <label>
          {text(locale, "Salida", "Check-out")}
          <input
            type="date"
            required
            min={addDays(STAY_MIN_DATE, 1)}
            max={STAY_MAX_DATE}
            value={values.endDate}
            onChange={(event) =>
              setValues({ ...values, endDate: event.target.value })
            }
          />
        </label>
      </div>
      {availability && (
        <div
          className={`sw-edit-check ${availability.available ? "is-good" : "is-warning"}`}
          role="status"
        >
          {availability.available ? (
            <CheckCircle2 size={16} />
          ) : (
            <CircleAlert size={16} />
          )}
          {reasonText(availability.reason, locale)}
        </div>
      )}
      {!availability && invalidDates && (
        <p className="sw-edit-check is-warning" role="status">
          {reasonText("invalid-dates" as AvailabilityReason, locale)}
        </p>
      )}
      {quote && (
        <div className="sw-edit-total">
          <span>
            {quote.nights}{" "}
            {text(
              locale,
              "noches · nuevo total ficticio",
              "nights · new fictitious total",
            )}
          </span>
          <strong>{money(quote.totalCents, locale)}</strong>
        </div>
      )}
      <div className="sw-actions">
        <button
          type="submit"
          className="sw-button primary"
          disabled={invalidDates || (!!availability && !availability.available)}
        >
          {submitLabel}
        </button>
        <button type="button" className="sw-button" onClick={close}>
          {text(locale, "Descartar edición", "Discard edits")}
        </button>
      </div>
    </form>
  );
}

function StayDetail({
  locale,
  stay,
  workspace,
  apply,
  close,
  titleRef,
}: {
  locale: Locale;
  stay: Stay;
  workspace: Workspace;
  apply: Apply;
  close: () => void;
  titleRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const finishEditing = () => {
    setEditing(false);
    restoreWorkspaceFocus(() => titleRef.current);
  };
  const finishCancelling = () => {
    setCancelling(false);
    restoreWorkspaceFocus(() => titleRef.current);
  };
  const unit = workspace.units.find((item) => item.id === stay.unitId);
  return (
    <article
      className="panel sw-detail"
      data-stay-detail
      aria-labelledby="sw-detail-title"
    >
      <header className="sw-card-heading">
        <div>
          <span className="sw-eyebrow">
            {stay.id} · {text(locale, "Ficha de estancia", "Stay details")}
          </span>
          <h2 ref={titleRef} tabIndex={-1} id="sw-detail-title">
            {stay.guestName}
          </h2>
          <p>
            {unit?.name} ·{" "}
            <span
              className={`sw-status ${stay.status === "confirmed" ? "is-good" : ""}`}
            >
              {stay.status === "confirmed"
                ? text(locale, "Confirmada", "Confirmed")
                : text(locale, "Cancelada", "Cancelled")}
            </span>
          </p>
        </div>
        <button
          type="button"
          className="sw-icon-button"
          onClick={close}
          aria-label={text(
            locale,
            "Cerrar ficha de estancia",
            "Close stay details",
          )}
        >
          <X size={18} />
        </button>
      </header>
      <div className="sw-detail-grid">
        <div>
          <div className="sw-detail-dates">
            <div>
              <span>{text(locale, "Entrada", "Check-in")}</span>
              <strong>
                <time dateTime={stay.startDate}>
                  {date(stay.startDate, locale, true)}
                </time>
              </strong>
            </div>
            <ArrowRight size={17} />
            <div>
              <span>{text(locale, "Salida", "Check-out")}</span>
              <strong>
                <time dateTime={stay.endDate}>
                  {date(stay.endDate, locale, true)}
                </time>
              </strong>
            </div>
          </div>
          <dl className="sw-detail-facts">
            <div>
              <dt>{text(locale, "Huéspedes", "Guests")}</dt>
              <dd>{stay.guests}</dd>
            </div>
            <div>
              <dt>{text(locale, "Contacto ficticio", "Fictitious contact")}</dt>
              <dd>{stay.email}</dd>
            </div>
            <div>
              <dt>{text(locale, "Origen del caso", "Case source")}</dt>
              <dd>
                {stay.enquiryId ??
                  text(locale, "Estancia de ejemplo", "Sample stay")}
              </dd>
            </div>
          </dl>
        </div>
        <Quote locale={locale} quote={stay.quote} />
      </div>
      {stay.status === "confirmed" && (
        <div className="sw-detail-actions">
          <button
            type="button"
            className="sw-button"
            onClick={() => {
              setEditing(!editing);
              setCancelling(false);
            }}
            aria-expanded={editing}
          >
            <SlidersHorizontal size={15} />
            {text(locale, "Modificar estancia", "Edit stay")}
          </button>
          <button
            type="button"
            className="sw-text-button sw-destructive"
            onClick={() => {
              setCancelling(!cancelling);
              setEditing(false);
            }}
            aria-expanded={cancelling}
          >
            {text(locale, "Cancelar estancia", "Cancel stay")}
          </button>
        </div>
      )}
      {editing && stay.status === "confirmed" && (
        <StayFields
          key={`${stay.unitId}-${stay.startDate}-${stay.endDate}-${stay.guests}`}
          locale={locale}
          units={workspace.units}
          initial={{
            unitId: stay.unitId,
            startDate: stay.startDate,
            endDate: stay.endDate,
            guests: stay.guests,
          }}
          workspace={workspace}
          stayId={stay.id}
          submitLabel={text(locale, "Guardar cambios", "Save changes")}
          close={finishEditing}
          submit={(values) => {
            if (
              apply(
                changeStay(workspace, stay.id, values),
                text(
                  locale,
                  "Estancia modificada. Fechas, importe y planning actualizados.",
                  "Stay updated. Dates, price and calendar are now in sync.",
                ),
              )
            )
              finishEditing();
          }}
        />
      )}
      {cancelling && stay.status === "confirmed" && (
        <div className="sw-cancel-confirm">
          <h3>
            {text(
              locale,
              "¿Cancelar esta estancia ficticia?",
              "Cancel this fictitious stay?",
            )}
          </h3>
          <p>
            {text(
              locale,
              "Sus noches quedarán libres en el planning. La ficha se conserva como cancelada y puedes deshacer el cambio.",
              "Its nights will become available in the calendar. The record remains as cancelled and you can undo the change.",
            )}
          </p>
          <div className="sw-actions">
            <button
              type="button"
              className="sw-button sw-danger-button"
              onClick={() => {
                if (
                  apply(
                    cancelStay(workspace, stay.id),
                    text(
                      locale,
                      "Estancia cancelada. Noches liberadas; puedes deshacer este cambio.",
                      "Stay cancelled. Nights released; you can undo this change.",
                    ),
                  )
                )
                  finishCancelling();
              }}
            >
              {text(locale, "Confirmar cancelación", "Confirm cancellation")}
            </button>
            <button
              type="button"
              className="sw-button"
              onClick={finishCancelling}
            >
              {text(locale, "Conservar estancia", "Keep stay")}
            </button>
          </div>
        </div>
      )}
      {stay.status === "cancelled" && (
        <p className="sw-edit-check is-warning">
          <CircleAlert size={16} />
          {text(
            locale,
            "Esta estancia ya no ocupa noches ni aparece en huéspedes activos.",
            "This stay no longer occupies nights or appears in active guests.",
          )}
        </p>
      )}
    </article>
  );
}
