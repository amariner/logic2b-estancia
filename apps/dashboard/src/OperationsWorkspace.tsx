import { useEffect, useRef, useState, type RefObject } from "react";
import type { DemoRole } from "@logic-estancia/domain";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  DoorOpen,
  Droplets,
  Layers3,
  RotateCcw,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import {
  applyOperation,
  createOperationsWorkspace,
  taskReadiness,
  CLEANERS,
  CHECKLIST_ITEMS,
  OPERATIONS_DEMO_DATE,
  type OperationsWorkspace,
  type PreparationTask,
  type OperationAction,
  type CleanerId,
  type ChecklistId,
} from "./operations";
import "./operations-workspace.css";

type Locale = "es" | "en";
export type AuremOperationsView =
  | "home"
  | "control"
  | "cleaning"
  | "maintenance"
  | "planning"
  | "bookings"
  | "guests";
type Props = {
  locale: Locale;
  view: AuremOperationsView;
  role: DemoRole;
  workspace: OperationsWorkspace;
  onChange: (workspace: OperationsWorkspace) => void;
  go: (view: AuremOperationsView) => void;
  onRoleChange?: (role: DemoRole) => void;
  requestedTask?: { id: string; key: number };
};
type ActionResult = ReturnType<typeof applyOperation>;
type Readiness = NonNullable<ReturnType<typeof taskReadiness>>;
const copy = (locale: Locale, es: string, en: string) =>
  locale === "es" ? es : en;
const roleName = (role: DemoRole, locale: Locale) =>
  ({
    direction: copy(locale, "Dirección", "Management"),
    reception: copy(locale, "Recepción", "Reception"),
    cleaning: copy(locale, "Limpieza", "Cleaning"),
  })[role];
const unitName = (id: string, locale: Locale) =>
  copy(locale, `Habitación ${id}`, `Room ${id}`);
const actorName = (actor: string | null, locale: Locale) =>
  actor === "marta"
    ? "Marta"
    : actor === "leo"
      ? "Leo"
      : actor === "direction" || actor === "reception" || actor === "cleaning"
        ? roleName(actor, locale)
        : copy(locale, "Por asignar", "Unassigned");
const dateLabel = (value: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
const statusName = (status: PreparationTask["status"], locale: Locale) =>
  ({
    unassigned: copy(locale, "Por asignar", "Unassigned"),
    assigned: copy(locale, "Pendiente de aceptación", "Awaiting acceptance"),
    accepted: copy(locale, "En preparación", "In preparation"),
    review: copy(locale, "En revisión", "Under review"),
    ready: copy(locale, "Preparada", "Ready"),
    declined: copy(locale, "Tarea rechazada", "Task declined"),
  })[status];
const readinessName = (status: Readiness["status"], locale: Locale) =>
  ({
    ready: copy(locale, "Preparada", "Ready"),
    blocked: copy(locale, "Bloqueada", "Blocked"),
    pending: copy(locale, "Pendiente", "Pending"),
    review: copy(locale, "Por revisar", "Needs review"),
  })[status];
const reasonName = (reason: Readiness["reason"], locale: Locale) =>
  ({
    ready: copy(
      locale,
      "Preparación validada por recepción o dirección.",
      "Preparation validated by reception or management.",
    ),
    departure: copy(
      locale,
      "La salida anterior aún no está confirmada.",
      "The previous departure has not been confirmed.",
    ),
    assignment: copy(
      locale,
      "La tarea necesita una persona asignada.",
      "The task needs an assigned team member.",
    ),
    acceptance: copy(
      locale,
      "La persona asignada debe aceptar la tarea.",
      "The assigned team member needs to accept the task.",
    ),
    declined: copy(
      locale,
      "La tarea ha sido rechazada y necesita reasignación.",
      "The task was declined and needs reassignment.",
    ),
    checklist: copy(
      locale,
      "Faltan comprobaciones de preparación.",
      "Preparation checks remain incomplete.",
    ),
    incident: copy(
      locale,
      "Hay una incidencia abierta que impide validar la habitación.",
      "An open issue prevents room readiness validation.",
    ),
    review: copy(
      locale,
      "El checklist está completo; falta la revisión final.",
      "The checklist is complete; final review is pending.",
    ),
  })[reason];
const actionName = (action: string, locale: Locale) =>
  ({
    "confirm-departure": copy(
      locale,
      "Salida confirmada",
      "Departure confirmed",
    ),
    assign: copy(locale, "Tarea asignada", "Task assigned"),
    accept: copy(locale, "Tarea aceptada", "Task accepted"),
    decline: copy(locale, "Tarea rechazada", "Task declined"),
    check: copy(locale, "Checklist actualizado", "Checklist updated"),
    "report-issue": copy(locale, "Incidencia registrada", "Issue reported"),
    "resolve-issue": copy(locale, "Incidencia resuelta", "Issue resolved"),
    "submit-review": copy(locale, "Revisión solicitada", "Review requested"),
    approve: copy(locale, "Habitación validada", "Room validated"),
    return: copy(locale, "Devuelta a limpieza", "Returned to cleaning"),
    undo: copy(locale, "Cambio deshecho", "Change undone"),
  })[action as "assign"] ??
  copy(locale, "Cambio registrado", "Change recorded");
const focusAfterChange = (target: () => HTMLElement | null) =>
  requestAnimationFrame(() => {
    const element = target();
    if (element?.isConnected) element.focus();
    else
      document
        .querySelector<HTMLElement>("[data-operations-workspace]")
        ?.focus();
  });

export function AuremOperations({
  locale,
  view,
  role,
  workspace,
  onChange,
  go,
  onRoleChange,
  requestedTask,
}: Props) {
  const [actor, setActor] = useState<CleanerId>("marta");
  const [scope, setScope] = useState("own");
  const [filter, setFilter] = useState("today");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(false);
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const region = useRef<HTMLElement>(null);
  const resetTrigger = useRef<HTMLButtonElement>(null);
  const detailTrigger = useRef<HTMLElement | null>(null);
  const activeActor = role === "cleaning" ? actor : role;
  const task = workspace.tasks.find((entry) => entry.id === selectedId);
  const lastChange = workspace.history.at(-1)?.event;
  const canUndo =
    !!lastChange &&
    (role === "direction" ||
      (lastChange.role === role && lastChange.actor === activeActor));
  const execute = (action: OperationAction): boolean => {
    const result: ActionResult = applyOperation(
      workspace,
      role,
      action,
      activeActor,
    );
    setError(!result.ok);
    if (!result.ok) {
      setNotice(
        copy(
          locale,
          "Este cambio no está permitido con el estado o la responsabilidad actual. Revisa el siguiente paso de la ficha.",
          "This change is not allowed for the current status or responsibility. Check the next step in the record.",
        ),
      );
      return false;
    }
    onChange(result.workspace);
    setNotice(
      `${actionName(action.type, locale)}. ${copy(locale, "Preparación, planning y estancia actualizados en esta demo.", "Preparation, calendar and stay updated in this demo.")}`,
    );
    return true;
  };
  const openTask = (id: string) => {
    detailTrigger.current = document.activeElement as HTMLElement | null;
    setSelectedId(id);
    focusAfterChange(() => detailTitle.current);
  };
  const closeTask = () => {
    setSelectedId(null);
    focusAfterChange(() =>
      detailTrigger.current?.isConnected
        ? detailTrigger.current
        : region.current,
    );
  };
  const switchResponsibility = (responsible: string | null) => {
    if (responsible === "marta" || responsible === "leo") {
      setActor(responsible);
      onRoleChange?.("cleaning");
    } else
      onRoleChange?.(responsible === "reception" ? "reception" : "direction");
  };
  useEffect(() => {
    if (requestedTask) {
      setSelectedId(requestedTask.id);
    }
  }, [requestedTask]);
  useEffect(() => {
    // Selection from a utility mounts the record in a second commit.
    if (requestedTask && selectedId === requestedTask.id) {
      detailTitle.current?.focus();
    }
  }, [selectedId, requestedTask]);
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        selectedId &&
        !event.defaultPrevented &&
        !region.current?.closest("[inert]")
      ) {
        setSelectedId(null);
        focusAfterChange(() =>
          detailTrigger.current?.isConnected
            ? detailTrigger.current
            : region.current,
        );
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedId]);
  const visibleTasks = workspace.tasks
    .filter(
      (entry) =>
        view !== "cleaning" ||
        role !== "cleaning" ||
        scope === "all" ||
        entry.assignee === actor,
    )
    .filter(
      (entry) =>
        filter === "today" ||
        (filter === "pending"
          ? taskReadiness(workspace, entry.id)?.status !== "ready"
          : workspace.incidents.some(
              (incident) =>
                incident.taskId === entry.id && incident.status === "open",
            )),
    );
  const todayTasks = workspace.tasks;
  const ready = todayTasks.filter(
    (entry) => taskReadiness(workspace, entry.id)?.status === "ready",
  );
  const openIssues = workspace.incidents.filter(
    (incident) => incident.status === "open",
  );
  const roleSummary =
    role === "direction"
      ? copy(
          locale,
          "Asigna responsables y resuelve las excepciones.",
          "Assign responsibility and resolve exceptions.",
        )
      : role === "reception"
        ? copy(
            locale,
            "Confirma salidas y valida la preparación antes de la llegada.",
            "Confirm departures and validate preparation before arrival.",
          )
        : copy(
            locale,
            "Acepta tus tareas, completa el checklist y solicita revisión.",
            "Accept your tasks, complete the checklist and request review.",
          );
  const heading = {
    home: copy(locale, "Cada llegada, preparada.", "Every arrival, prepared."),
    control: copy(
      locale,
      "Lo que necesita atención, primero.",
      "What needs attention comes first.",
    ),
    cleaning: copy(
      locale,
      "Una tarea. Un responsable. Un siguiente paso.",
      "One task. One owner. One next step.",
    ),
    maintenance: copy(
      locale,
      "Resuelve el bloqueo de la estancia.",
      "Resolve what is blocking the stay.",
    ),
    planning: copy(
      locale,
      "Preparación y llegada, conectadas.",
      "Preparation and arrival, connected.",
    ),
    bookings: copy(
      locale,
      "La preparación acompaña a la estancia.",
      "Preparation follows the stay.",
    ),
    guests: copy(
      locale,
      "El contexto de cada llegada.",
      "Context for every arrival.",
    ),
  }[view];
  return (
    <section
      className="operations-workspace"
      data-operations-workspace
      ref={region}
      tabIndex={-1}
      aria-label={copy(locale, "Preparación de Aurem", "Aurem preparation")}
    >
      <div className="ops-context">
        <span>
          <Layers3 size={14} aria-hidden="true" />
          {copy(
            locale,
            "Operación de muestra · Aurem Hotel",
            "Sample operations · Aurem Hotel",
          )}
        </span>
        <span>
          <CalendarDays size={14} />
          {dateLabel(OPERATIONS_DEMO_DATE, locale)}
        </span>
        <button
          ref={resetTrigger}
          type="button"
          className="ops-text-button"
          aria-expanded={resetting}
          onClick={() => setResetting(!resetting)}
        >
          <RotateCcw size={14} />
          {copy(locale, "Restablecer demo", "Reset demo")}
        </button>
      </div>
      {resetting && (
        <div className="ops-reset">
          <p>
            {copy(
              locale,
              "Se restablecerán las tareas, las incidencias y el historial de preparación de esta visita.",
              "The preparation tasks, issues and history from this visit will be reset.",
            )}
          </p>
          <div className="ops-actions">
            <button
              type="button"
              className="ops-button"
              onClick={() => {
                setResetting(false);
                focusAfterChange(() => resetTrigger.current);
              }}
            >
              {copy(locale, "Seguir trabajando", "Keep working")}
            </button>
            <button
              type="button"
              className="ops-button is-primary"
              onClick={() => {
                onChange(createOperationsWorkspace());
                setSelectedId(null);
                setActor("marta");
                setFilter("today");
                setResetting(false);
                setError(false);
                setNotice(
                  copy(
                    locale,
                    "Casos restablecidos. Los cambios de esta visita se han descartado.",
                    "Cases reset. Changes from this visit have been discarded.",
                  ),
                );
                focusAfterChange(() => resetTrigger.current);
              }}
            >
              {copy(locale, "Restablecer casos", "Reset cases")}
            </button>
          </div>
        </div>
      )}
      <div
        className={`ops-feedback${error ? " is-error" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice && (
          <span>
            {error ? <CircleAlert size={16} /> : <CheckCircle2 size={16} />}
            {notice}
          </span>
        )}
      </div>
      {lastChange && (
        <div className="ops-undo">
          <button
            type="button"
            className="ops-text-button"
            disabled={!canUndo}
            onClick={() => {
              if (execute({ type: "undo" }) && workspace.history.length === 1)
                focusAfterChange(() => detailTitle.current ?? region.current);
            }}
          >
            <RotateCcw size={14} />
            {copy(locale, "Deshacer último cambio", "Undo last change")}
          </button>
          {!canUndo && (
            <span>
              {copy(
                locale,
                "Solo Dirección o la persona del último cambio pueden deshacerlo.",
                "Only Management or the person who made the last change can undo it.",
              )}
            </span>
          )}
        </div>
      )}
      <header className="ops-heading">
        <div>
          <span className="ops-eyebrow">
            {role === "cleaning" && view === "cleaning"
              ? copy(locale, "Mis tareas", "My tasks")
              : roleName(role, locale)}{" "}
            ·{" "}
            {copy(
              locale,
              "Responsabilidad simulada",
              "Simulated responsibility",
            )}
          </span>
          <h2>{heading}</h2>
          <p>{roleSummary}</p>
        </div>
        <div className="ops-date-stamp">
          <Clock3 size={17} />
          <span>
            {copy(locale, "Llegadas de hoy", "Today's arrivals")}
            <small>
              {copy(locale, "3 habitaciones ficticias", "3 fictitious rooms")}
            </small>
          </span>
        </div>
      </header>
      {(view === "home" || view === "control") && (
        <>
          <div className="ops-metrics">
            <button
              type="button"
              onClick={() => {
                setFilter("today");
                go("bookings");
              }}
            >
              <span>
                {copy(locale, "Llegadas hoy", "Arrivals today")}
                <DoorOpen size={18} />
              </span>
              <strong>{todayTasks.length}</strong>
              <small>
                {copy(
                  locale,
                  "Estancias de la colección de muestra",
                  "Stays in the sample collection",
                )}
              </small>
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("pending");
                go("cleaning");
              }}
            >
              <span>
                {copy(locale, "Pendientes de preparar", "Preparation pending")}
                <ClipboardCheck size={18} />
              </span>
              <strong>{todayTasks.length - ready.length}</strong>
              <small>
                {copy(
                  locale,
                  "Falta un paso o una validación",
                  "A step or validation is missing",
                )}
              </small>
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("today");
                go("planning");
              }}
            >
              <span>
                {copy(locale, "Preparadas", "Ready")}
                <ShieldCheck size={18} />
              </span>
              <strong>
                {ready.length} <em>/ {todayTasks.length}</em>
              </strong>
              <small>
                {copy(
                  locale,
                  "Checklist y revisión completos",
                  "Checklist and review complete",
                )}
              </small>
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("today");
                go("maintenance");
              }}
            >
              <span>
                {copy(locale, "Incidencias abiertas", "Open issues")}
                <Wrench size={18} />
              </span>
              <strong>{openIssues.length}</strong>
              <small>
                {copy(
                  locale,
                  "Bloquean la validación final",
                  "Block final validation",
                )}
              </small>
            </button>
          </div>
          <div className="ops-home-intro">
            <article className="ops-priority">
              <span className="ops-eyebrow">
                {copy(
                  locale,
                  "Caso destacado · 15:00",
                  "Featured case · 15:00",
                )}
              </span>
              <h3>{unitName("408", locale)} · Elena Rossi</h3>
              <p>
                {reasonName(
                  taskReadiness(workspace, "PREP-408")!.reason,
                  locale,
                )}
              </p>
              <button
                type="button"
                className="ops-button"
                onClick={() => openTask("PREP-408")}
              >
                {copy(locale, "Abrir preparación", "Open preparation")}
                <ArrowRight size={16} />
              </button>
            </article>
            <article className="panel ops-role-summary">
              <span className="ops-eyebrow">
                {copy(
                  locale,
                  "Relevo claro entre equipos",
                  "A clear handoff between teams",
                )}
              </span>
              <h3>
                {copy(
                  locale,
                  "La causa y el responsable, siempre visibles.",
                  "The reason and owner, always visible.",
                )}
              </h3>
              <p>
                {copy(
                  locale,
                  "Una salida pendiente, un checklist incompleto o una incidencia abierta impiden dar la habitación por preparada.",
                  "A pending departure, incomplete checklist or open issue prevents a room being marked ready.",
                )}
              </p>
              <ol>
                <li>
                  <span>01</span>
                  {copy(locale, "Dirección asigna", "Management assigns")}
                </li>
                <li>
                  <span>02</span>
                  {copy(locale, "Limpieza prepara", "Cleaning prepares")}
                </li>
                <li>
                  <span>03</span>
                  {copy(locale, "Recepción revisa", "Reception reviews")}
                </li>
              </ol>
            </article>
          </div>
        </>
      )}
      {(view === "home" || view === "control" || view === "cleaning") && (
        <>
          <div className="ops-list-toolbar">
            <div
              className="ops-filters"
              aria-label={copy(locale, "Filtrar tareas", "Filter tasks")}
            >
              {[
                ["today", copy(locale, "Hoy", "Today")],
                ["pending", copy(locale, "Pendientes", "Pending")],
                ["issues", copy(locale, "Con incidencia", "With an issue")],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {role === "cleaning" && (
              <div className="ops-person-controls">
                <label>
                  {copy(locale, "Persona de muestra", "Demo team member")}
                  <select
                    value={actor}
                    onChange={(event) =>
                      setActor(event.target.value as CleanerId)
                    }
                  >
                    {CLEANERS.map((person) => (
                      <option value={person.id} key={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </label>
                {view === "cleaning" && (
                  <label>
                    {copy(locale, "Tareas visibles", "Visible tasks")}
                    <select
                      value={scope}
                      onChange={(event) => setScope(event.target.value)}
                    >
                      <option value="own">
                        {copy(locale, "Mis tareas", "My tasks")}
                      </option>
                      <option value="all">
                        {copy(locale, "Toda la colección", "Whole collection")}
                      </option>
                    </select>
                  </label>
                )}
              </div>
            )}
          </div>
          {visibleTasks.length ? (
            <div className="ops-task-grid">
              {visibleTasks.map((entry) => (
                <TaskCard
                  key={entry.id}
                  locale={locale}
                  workspace={workspace}
                  task={entry}
                  openTask={openTask}
                />
              ))}
            </div>
          ) : (
            <EmptyOperations
              title={copy(
                locale,
                "No hay tareas en esta vista",
                "No tasks in this view",
              )}
              description={
                role === "cleaning" && scope === "own"
                  ? copy(
                      locale,
                      "Esta persona no tiene tareas que coincidan con el filtro. Consulta toda la colección o cambia la persona de muestra.",
                      "This person has no tasks matching the filter. View the whole collection or choose another demo team member.",
                    )
                  : copy(
                      locale,
                      "No hay tareas con este estado. Prueba Hoy para volver a ver las tres habitaciones de muestra.",
                      "No tasks have this status. Choose Today to see all three sample rooms.",
                    )
              }
            />
          )}
        </>
      )}
      {view === "maintenance" && (
        <MaintenanceOverview
          locale={locale}
          workspace={workspace}
          openTask={openTask}
        />
      )}
      {view === "planning" && (
        <PreparationPlanning
          locale={locale}
          workspace={workspace}
          openTask={openTask}
        />
      )}
      {(view === "bookings" || view === "guests") && (
        <ArrivalCollection
          locale={locale}
          workspace={workspace}
          openTask={openTask}
          guests={view === "guests"}
        />
      )}
      {task && (
        <PreparationDetail
          key={task.id}
          locale={locale}
          task={task}
          workspace={workspace}
          role={role}
          actor={actor}
          execute={execute}
          close={closeTask}
          titleRef={detailTitle}
          onHandoff={onRoleChange ? switchResponsibility : undefined}
        />
      )}
      <p className="ops-boundary">
        {copy(
          locale,
          "Personas, estancias e incidencias ficticias. Los roles son una simulación; los cambios solo duran esta visita y se restablecen al recargar. No se envían avisos, no se actualiza un hotel real y no se guardan datos.",
          "Fictitious people, stays and issues. Roles are simulated; changes last for this visit and reset on reload. No notifications are sent, no real hotel is updated and no data is saved.",
        )}
      </p>
    </section>
  );
}

function ReadinessBadge({
  locale,
  readiness,
}: {
  locale: Locale;
  readiness: Readiness;
}) {
  return (
    <span
      className={`ops-status is-${readiness.status}`}
      data-task-readiness={readiness.status}
    >
      {readiness.status === "ready" ? (
        <CheckCircle2 size={14} />
      ) : readiness.status === "blocked" ? (
        <CircleAlert size={14} />
      ) : readiness.status === "review" ? (
        <ShieldCheck size={14} />
      ) : (
        <Clock3 size={14} />
      )}
      {readinessName(readiness.status, locale)}
    </span>
  );
}
function EmptyOperations({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="ops-empty">
      <Layers3 size={22} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
function TaskCard({
  locale,
  workspace,
  task,
  openTask,
}: {
  locale: Locale;
  workspace: OperationsWorkspace;
  task: PreparationTask;
  openTask: (id: string) => void;
}) {
  const readiness = taskReadiness(workspace, task.id)!;
  const stay = workspace.stays.find((entry) => entry.id === task.stayId)!;
  const completed = CHECKLIST_ITEMS.filter(
    (item) => task.checklist[item.id],
  ).length;
  return (
    <button
      type="button"
      className="panel ops-task-card"
      data-operation-task={task.id}
      data-operation-stay={stay.id}
      data-task-readiness={readiness.status}
      onClick={() => openTask(task.id)}
    >
      <span className="ops-task-top">
        <span className="ops-room-icon">
          <BedDouble size={20} />
        </span>
        <ReadinessBadge locale={locale} readiness={readiness} />
      </span>
      <span className="ops-task-title">{unitName(task.unitId, locale)}</span>
      <span className="ops-task-guest">
        {stay.guestName} ·{" "}
        {task.unitId === "408"
          ? "15:00"
          : task.unitId === "312"
            ? "16:00"
            : "14:00"}
      </span>
      <span className="ops-task-reason">
        {reasonName(readiness.reason, locale)}
      </span>
      <span className="ops-task-assignee">
        <UserRound size={14} />
        {actorName(task.assignee, locale)}
        <span>
          {completed}/{CHECKLIST_ITEMS.length}{" "}
          {copy(locale, "comprobaciones", "checks")}
        </span>
      </span>
      <span className="ops-task-footer">
        {statusName(task.status, locale)}
        <ArrowRight size={16} />
      </span>
    </button>
  );
}

function MaintenanceOverview({
  locale,
  workspace,
  openTask,
}: {
  locale: Locale;
  workspace: OperationsWorkspace;
  openTask: (id: string) => void;
}) {
  const reported = workspace.incidents.filter(
    (incident) => incident.status !== "available",
  );
  return (
    <>
      <article className="panel ops-maintenance-intro">
        <div>
          <span className="ops-eyebrow">
            {copy(locale, "Bloqueos de preparación", "Preparation blockers")}
          </span>
          <h3>
            {reported.some((incident) => incident.status === "open")
              ? copy(
                  locale,
                  "Una incidencia necesita atención.",
                  "An issue needs attention.",
                )
              : copy(locale, "Sin incidencias abiertas.", "No open issues.")}
          </h3>
          <p>
            {copy(
              locale,
              "Resolver una incidencia permite continuar el checklist. La habitación solo queda preparada después de una nueva revisión.",
              "Resolving an issue allows the checklist to continue. The room only becomes ready after a new review.",
            )}
          </p>
        </div>
        <Wrench size={28} />
      </article>
      {reported.length ? (
        <div className="ops-incident-list">
          {reported.map((incident) => (
            <button
              type="button"
              className="panel ops-incident-card"
              data-operation-task={incident.taskId}
              key={incident.id}
              onClick={() => openTask(incident.taskId)}
            >
              <span
                className={`ops-status ${incident.status === "open" ? "is-blocked" : "is-ready"}`}
              >
                {incident.status === "open" ? (
                  <CircleAlert size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {incident.status === "open"
                  ? copy(locale, "Abierta", "Open")
                  : copy(locale, "Resuelta", "Resolved")}
              </span>
              <strong>
                {copy(locale, "Fuga en el baño", "Bathroom leak")} ·{" "}
                {unitName(incident.unitId, locale)}
              </strong>
              <span>
                {incident.id} ·{" "}
                {copy(locale, "Evidencia de muestra", "Sample evidence")}
              </span>
              <span className="ops-incident-link">
                {copy(
                  locale,
                  "Ver causa y siguiente paso",
                  "View reason and next step",
                )}
                <ArrowRight size={16} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyOperations
          title={copy(
            locale,
            "La preparación no tiene incidencias registradas",
            "No preparation issues have been reported",
          )}
          description={copy(
            locale,
            "El caso 408 permite registrar una fuga ficticia una vez aceptada la tarea. Puedes explorar el bloqueo y su revisión sin adjuntar archivos.",
            "Case 408 lets you report a fictitious leak after the task is accepted. Explore the blocker and review without attaching files.",
          )}
        />
      )}
      <button
        type="button"
        className="ops-text-button"
        onClick={() => openTask("PREP-408")}
      >
        {copy(locale, "Abrir el caso de la 408", "Open the room 408 case")}
        <ArrowRight size={15} />
      </button>
    </>
  );
}
function PreparationPlanning({
  locale,
  workspace,
  openTask,
}: {
  locale: Locale;
  workspace: OperationsWorkspace;
  openTask: (id: string) => void;
}) {
  return (
    <article className="panel ops-planning">
      <div className="ops-section-heading">
        <div>
          <h3>
            {copy(locale, "Del relevo a la llegada", "From handoff to arrival")}
          </h3>
          <p>
            {dateLabel(OPERATIONS_DEMO_DATE, locale)} ·{" "}
            {copy(
              locale,
              "Secuencia de preparación ficticia",
              "Fictitious preparation sequence",
            )}
          </p>
        </div>
        <span className="ops-eyebrow">
          {copy(locale, "3 estancias conectadas", "3 connected stays")}
        </span>
      </div>
      <div className="ops-planning-rows">
        {workspace.tasks.map((task) => {
          const readiness = taskReadiness(workspace, task.id)!;
          const stay = workspace.stays.find(
            (entry) => entry.id === task.stayId,
          )!;
          return (
            <button
              type="button"
              key={task.id}
              className="ops-planning-row"
              data-operation-task={task.id}
              data-operation-stay={stay.id}
              data-task-readiness={readiness.status}
              onClick={() => openTask(task.id)}
            >
              <span className="ops-planning-unit">
                <strong>{unitName(task.unitId, locale)}</strong>
                <small>
                  {stay.guestName} · {stay.id}
                </small>
              </span>
              <span
                className={`ops-planning-step${task.departureConfirmed ? " is-done" : ""}`}
              >
                <DoorOpen size={17} />
                <span>
                  {copy(locale, "Salida anterior", "Previous departure")}
                  <small>
                    {task.departureConfirmed
                      ? copy(locale, "Confirmada", "Confirmed")
                      : copy(locale, "Pendiente", "Pending")}
                  </small>
                </span>
              </span>
              <span className="ops-planning-step">
                <ClipboardCheck size={17} />
                <span>
                  {actorName(task.assignee, locale)}
                  <small>{statusName(task.status, locale)}</small>
                </span>
              </span>
              <span className="ops-planning-arrival">
                <ReadinessBadge locale={locale} readiness={readiness} />
                <small>
                  {copy(locale, "Llegada", "Arrival")}{" "}
                  {task.unitId === "408"
                    ? "15:00"
                    : task.unitId === "312"
                      ? "16:00"
                      : "14:00"}
                  <ChevronRight size={14} />
                </small>
              </span>
            </button>
          );
        })}
      </div>
      <p className="ops-planning-note">
        {copy(
          locale,
          "El planning muestra el estado de las mismas tareas y estancias. Una incidencia abierta o una revisión pendiente mantienen bloqueada la preparación.",
          "The calendar shows the status of the same tasks and stays. An open issue or pending review prevents readiness.",
        )}
      </p>
    </article>
  );
}
function ArrivalCollection({
  locale,
  workspace,
  openTask,
  guests,
}: {
  locale: Locale;
  workspace: OperationsWorkspace;
  openTask: (id: string) => void;
  guests: boolean;
}) {
  return (
    <div className={`ops-arrivals${guests ? " is-guests" : ""}`}>
      {workspace.tasks.map((task) => {
        const stay = workspace.stays.find((entry) => entry.id === task.stayId)!;
        const readiness = taskReadiness(workspace, task.id)!;
        return (
          <button
            type="button"
            className="panel ops-arrival-card"
            key={stay.id}
            data-operation-task={task.id}
            data-operation-stay={stay.id}
            data-task-readiness={readiness.status}
            onClick={() => openTask(task.id)}
          >
            <span className="ops-arrival-name">
              <span className="ops-room-icon">
                {guests ? <Users size={19} /> : <BedDouble size={19} />}
              </span>
              <span>
                <strong>{stay.guestName}</strong>
                <small>
                  {stay.id} · {unitName(task.unitId, locale)}
                </small>
              </span>
            </span>
            {guests ? (
              <span className="ops-arrival-dates">
                {stay.email}
                <small>
                  {stay.guests}{" "}
                  {copy(locale, "huéspedes ficticios", "fictitious guests")}
                </small>
              </span>
            ) : (
              <span className="ops-arrival-dates">
                <time dateTime={stay.startDate}>
                  {dateLabel(stay.startDate, locale)}
                </time>
                <small>
                  →{" "}
                  <time dateTime={stay.endDate}>
                    {dateLabel(stay.endDate, locale)}
                  </time>{" "}
                  · {stay.guests} {copy(locale, "huéspedes", "guests")}
                </small>
              </span>
            )}
            <ReadinessBadge locale={locale} readiness={readiness} />
            <span className="ops-arrival-action">
              {copy(locale, "Ver preparación", "View preparation")}
              <ArrowRight size={16} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

type DetailProps = {
  locale: Locale;
  task: PreparationTask;
  workspace: OperationsWorkspace;
  role: DemoRole;
  actor: CleanerId;
  execute: (action: OperationAction) => boolean;
  close: () => void;
  titleRef: RefObject<HTMLHeadingElement | null>;
  onHandoff?: (responsible: string | null) => void;
};
function PreparationDetail({
  locale,
  task,
  workspace,
  role,
  actor,
  execute,
  close,
  titleRef,
  onHandoff,
}: DetailProps) {
  const [assignee, setAssignee] = useState<CleanerId>(task.assignee ?? "marta");
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState<"workload" | "supplies">(
    "workload",
  );
  const [returning, setReturning] = useState(false);
  const [returnItem, setReturnItem] = useState<ChecklistId>("bathroom");
  const stay = workspace.stays.find((entry) => entry.id === task.stayId)!;
  const previousStay = workspace.stays.find(
    (entry) => entry.id === task.previousStayId,
  );
  const readiness = taskReadiness(workspace, task.id)!;
  const incident = workspace.incidents.find(
    (entry) => entry.taskId === task.id,
  );
  const isReviewer = role === "direction" || role === "reception";
  const ownsTask = role === "cleaning" && task.assignee === actor;
  const canAssign =
    role === "direction" &&
    task.departureConfirmed &&
    ["unassigned", "assigned", "declined", "accepted"].includes(task.status) &&
    (task.assignee !== assignee || task.status === "declined");
  const canAccept =
    ownsTask && task.status === "assigned" && task.departureConfirmed;
  const canCheck =
    ownsTask && task.status === "accepted" && incident?.status !== "open";
  const complete = CHECKLIST_ITEMS.every((item) => task.checklist[item.id]);
  const canSubmit = canCheck && complete && incident?.status !== "open";
  const canReview =
    isReviewer &&
    task.status === "review" &&
    complete &&
    incident?.status !== "open";
  const canReport =
    !!incident &&
    incident.status !== "open" &&
    ["accepted", "review", "ready"].includes(task.status) &&
    (isReviewer || ownsTask);
  const completeCount = CHECKLIST_ITEMS.filter(
    (item) => task.checklist[item.id],
  ).length;
  const ownershipReason =
    role !== "cleaning"
      ? copy(
          locale,
          "Estas acciones corresponden a Limpieza.",
          "These actions belong to Cleaning.",
        )
      : !ownsTask
        ? copy(
            locale,
            "Esta tarea pertenece a otra persona de muestra. Solo su responsable puede ejecutarla.",
            "This task belongs to another demo team member. Only its assigned person can carry it out.",
          )
        : task.status === "ready"
          ? copy(
              locale,
              "El checklist ya está validado y se conserva como evidencia de esta preparación ficticia.",
              "The checklist is already validated and remains as evidence of this fictitious preparation.",
            )
          : task.status === "review"
            ? copy(
                locale,
                "El checklist se ha enviado a Recepción o Dirección para su revisión.",
                "The checklist has been sent to Reception or Management for review.",
              )
            : task.status !== "accepted"
              ? copy(
                  locale,
                  "Acepta la tarea antes de completar el checklist.",
                  "Accept the task before completing its checklist.",
                )
              : "";
  const run = (action: OperationAction, moveFocus = true) => {
    if (!execute(action)) return false;
    if (moveFocus) {
      const target = (
        {
          "confirm-departure": "ops-assignment-heading",
          assign: "ops-assignment-heading",
          accept: "ops-checklist-heading",
          decline: "ops-assignment-heading",
          "report-issue": "ops-incident-title",
          "resolve-issue": "ops-checklist-heading",
          "submit-review": "ops-review-heading",
          return: "ops-checklist-heading",
        } as Record<string, string>
      )[action.type];
      focusAfterChange(() =>
        target ? document.getElementById(target) : titleRef.current,
      );
    }
    return true;
  };
  const taskEvents = workspace.events.filter(
    (event) => event.taskId === task.id,
  );
  useEffect(() => {
    setAssignee(task.assignee ?? "marta");
  }, [task.assignee]);
  useEffect(() => {
    setDeclining(false);
    setReturning(false);
  }, [role, actor]);
  const steps = [
    {
      label: copy(locale, "Salida", "Departure"),
      done: task.departureConfirmed,
    },
    { label: copy(locale, "Asignación", "Assignment"), done: !!task.assignee },
    {
      label: copy(locale, "Aceptación", "Acceptance"),
      done: !!task.acceptedBy,
    },
    { label: copy(locale, "Checklist", "Checklist"), done: complete },
    {
      label: copy(locale, "Revisión", "Review"),
      done: task.status === "ready",
    },
    {
      label: copy(locale, "Preparada", "Ready"),
      done: readiness.status === "ready",
    },
  ];
  return (
    <article
      className="panel ops-detail"
      data-operation-detail={task.id}
      data-task-readiness={readiness.status}
      data-operation-status={task.status}
      aria-labelledby="ops-detail-title"
    >
      <header className="ops-detail-heading">
        <div>
          <span className="ops-eyebrow">
            {task.id} ·{" "}
            {copy(locale, "Ficha de preparación", "Preparation record")}
          </span>
          <h2 id="ops-detail-title" ref={titleRef} tabIndex={-1}>
            {unitName(task.unitId, locale)} · {stay.guestName}
          </h2>
          <p>
            {stay.id} · {copy(locale, "Llegada", "Arrival")}{" "}
            {task.unitId === "408"
              ? "15:00"
              : task.unitId === "312"
                ? "16:00"
                : "14:00"}{" "}
            ·{" "}
            <time dateTime={stay.startDate}>
              {dateLabel(stay.startDate, locale)}
            </time>
          </p>
        </div>
        <button
          type="button"
          className="ops-icon-button"
          onClick={close}
          aria-label={copy(
            locale,
            "Cerrar ficha de preparación",
            "Close preparation record",
          )}
        >
          <X size={19} />
        </button>
      </header>
      <div className={`ops-next-step is-${readiness.status}`}>
        <ReadinessBadge locale={locale} readiness={readiness} />
        <div>
          <strong>{reasonName(readiness.reason, locale)}</strong>
          <p>
            {copy(locale, "Siguiente responsable", "Next owner")}:{" "}
            {readiness.status === "ready"
              ? copy(locale, "Recepción · llegada", "Reception · arrival")
              : actorName(readiness.responsible, locale)}
          </p>
        </div>
        {onHandoff &&
          readiness.status !== "ready" &&
          readiness.responsible &&
          readiness.responsible !== (role === "cleaning" ? actor : role) && (
            <button
              type="button"
              className="ops-button"
              onClick={() => {
                onHandoff(readiness.responsible);
                focusAfterChange(() => titleRef.current);
              }}
            >
              {copy(locale, "Continuar como", "Continue as")}{" "}
              {actorName(readiness.responsible, locale)}
              <ArrowRight size={15} />
            </button>
          )}
      </div>
      <ol
        className="ops-progress"
        aria-label={copy(locale, "Pasos de preparación", "Preparation steps")}
      >
        {steps.map((step, index) => (
          <li className={step.done ? "is-done" : ""} key={step.label}>
            <span>
              {step.done ? (
                <Check size={14} />
              ) : (
                String(index + 1).padStart(2, "0")
              )}
            </span>
            {step.label}
          </li>
        ))}
      </ol>
      <div className="ops-detail-layout">
        <div className="ops-detail-main">
          <section
            className="ops-detail-section"
            aria-labelledby="ops-departure-heading"
          >
            <div className="ops-section-heading">
              <h3 id="ops-departure-heading" tabIndex={-1}>
                <DoorOpen size={17} />
                {copy(
                  locale,
                  "01 · Salida anterior",
                  "01 · Previous departure",
                )}
              </h3>
              <span
                className={`ops-status ${task.departureConfirmed ? "is-ready" : "is-pending"}`}
              >
                {task.departureConfirmed ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Clock3 size={14} />
                )}
                {task.departureConfirmed
                  ? copy(locale, "Confirmada", "Confirmed")
                  : copy(locale, "Por confirmar", "Unconfirmed")}
              </span>
            </div>
            <p>
              {previousStay
                ? `${previousStay.guestName} · ${previousStay.id}`
                : copy(
                    locale,
                    "Estancia anterior de muestra",
                    "Previous sample stay",
                  )}
            </p>
            <button
              type="button"
              className="ops-button"
              disabled={!isReviewer || task.departureConfirmed}
              onClick={() =>
                run({ type: "confirm-departure", taskId: task.id })
              }
            >
              {copy(locale, "Confirmar salida", "Confirm departure")}
            </button>
            <p className="ops-permission">
              {copy(
                locale,
                "Recepción o Dirección confirma la salida ficticia antes de asignar la preparación.",
                "Reception or Management confirms the fictitious departure before preparation is assigned.",
              )}
            </p>
          </section>
          <section
            className="ops-detail-section"
            aria-labelledby="ops-assignment-heading"
          >
            <div className="ops-section-heading">
              <h3 id="ops-assignment-heading" tabIndex={-1}>
                <UserRound size={17} />
                {copy(
                  locale,
                  "02 · Persona responsable",
                  "02 · Assigned person",
                )}
              </h3>
              <span className="ops-status">
                {actorName(task.assignee, locale)}
              </span>
            </div>
            <div className="ops-assignment">
              <label>
                {copy(locale, "Asignar a", "Assign to")}
                <select
                  value={assignee}
                  disabled={
                    role !== "direction" ||
                    !task.departureConfirmed ||
                    ["review", "ready"].includes(task.status)
                  }
                  onChange={(event) =>
                    setAssignee(event.target.value as CleanerId)
                  }
                >
                  {CLEANERS.map((person) => (
                    <option value={person.id} key={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="ops-button"
                disabled={!canAssign}
                onClick={() =>
                  run({ type: "assign", taskId: task.id, assignee })
                }
              >
                {task.assignee
                  ? copy(locale, "Reasignar tarea", "Reassign task")
                  : copy(locale, "Asignar tarea", "Assign task")}
              </button>
            </div>
            <p className="ops-permission">
              {!task.departureConfirmed
                ? copy(
                    locale,
                    "Primero debe confirmarse la salida anterior.",
                    "The previous departure must be confirmed first.",
                  )
                : copy(
                    locale,
                    "Dirección asigna y reasigna. Reasignar reinicia la aceptación y el checklist; conserva las incidencias.",
                    "Management assigns and reassigns. Reassignment resets acceptance and the checklist; issues remain.",
                  )}
            </p>
            {task.status === "declined" && (
              <p className="ops-rejection">
                <CircleAlert size={16} />
                {copy(locale, "Motivo del rechazo", "Decline reason")}:{" "}
                {task.declineReason === "workload"
                  ? copy(locale, "Carga de trabajo", "Workload")
                  : copy(locale, "Faltan materiales", "Missing supplies")}
              </p>
            )}
            <div className="ops-actions">
              <button
                type="button"
                className="ops-button is-primary"
                disabled={!canAccept}
                onClick={() => run({ type: "accept", taskId: task.id })}
              >
                {copy(locale, "Aceptar tarea", "Accept task")}
              </button>
              <button
                type="button"
                className="ops-button"
                disabled={!canAccept}
                aria-expanded={declining}
                onClick={() => setDeclining(!declining)}
              >
                {copy(locale, "Rechazar tarea", "Decline task")}
              </button>
            </div>
            {!canAccept && task.status !== "ready" && (
              <p className="ops-permission">
                {role !== "cleaning" || !ownsTask
                  ? copy(
                      locale,
                      "Solo la persona de Limpieza asignada puede aceptar o rechazar esta tarea.",
                      "Only the assigned Cleaning team member can accept or decline this task.",
                    )
                  : copy(
                      locale,
                      "La aceptación solo está disponible para una tarea recién asignada.",
                      "Acceptance is only available for a newly assigned task.",
                    )}
              </p>
            )}
            {declining && canAccept && (
              <div className="ops-inline-decision">
                <label>
                  {copy(locale, "Motivo de rechazo", "Decline reason")}
                  <select
                    value={declineReason}
                    onChange={(event) =>
                      setDeclineReason(
                        event.target.value as "workload" | "supplies",
                      )
                    }
                  >
                    <option value="workload">
                      {copy(locale, "Carga de trabajo", "Workload")}
                    </option>
                    <option value="supplies">
                      {copy(locale, "Faltan materiales", "Missing supplies")}
                    </option>
                  </select>
                </label>
                <div className="ops-actions">
                  <button
                    type="button"
                    className="ops-button"
                    onClick={() => {
                      if (
                        run({
                          type: "decline",
                          taskId: task.id,
                          reason: declineReason,
                        })
                      )
                        setDeclining(false);
                    }}
                  >
                    {copy(locale, "Confirmar rechazo", "Confirm decline")}
                  </button>
                  <button
                    type="button"
                    className="ops-text-button"
                    onClick={() => {
                      setDeclining(false);
                      focusAfterChange(() => titleRef.current);
                    }}
                  >
                    {copy(locale, "Conservar asignación", "Keep assignment")}
                  </button>
                </div>
              </div>
            )}
          </section>
          <section
            className="ops-detail-section"
            aria-labelledby="ops-checklist-heading"
          >
            <div className="ops-section-heading">
              <h3 id="ops-checklist-heading" tabIndex={-1}>
                <ClipboardCheck size={17} />
                {copy(
                  locale,
                  "03 · Checklist de preparación",
                  "03 · Preparation checklist",
                )}
              </h3>
              <span className="ops-count">
                {completeCount}/{CHECKLIST_ITEMS.length}
              </span>
            </div>
            <div className="ops-checklist">
              {CHECKLIST_ITEMS.map((item) => (
                <label key={item.id}>
                  <input
                    type="checkbox"
                    aria-label={locale === "es" ? item.labelEs : item.labelEn}
                    aria-describedby={
                      [
                        task.returnReason === item.id
                          ? `ops-return-${item.id}`
                          : null,
                        item.id === "bathroom" && incident?.status === "open"
                          ? "ops-check-incident"
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    checked={task.checklist[item.id]}
                    disabled={!canCheck || incident?.status === "open"}
                    onChange={(event) =>
                      run(
                        {
                          type: "check",
                          taskId: task.id,
                          itemId: item.id,
                          checked: event.target.checked,
                        },
                        false,
                      )
                    }
                  />
                  <span>
                    {locale === "es" ? item.labelEs : item.labelEn}
                    {task.returnReason === item.id && (
                      <small id={`ops-return-${item.id}`}>
                        {copy(
                          locale,
                          "Se ha solicitado repetir esta comprobación.",
                          "This check needs to be repeated.",
                        )}
                      </small>
                    )}
                    {item.id === "bathroom" && incident?.status === "open" && (
                      <small id="ops-check-incident">
                        {copy(
                          locale,
                          "Bloqueado por la incidencia del baño.",
                          "Blocked by the bathroom issue.",
                        )}
                      </small>
                    )}
                  </span>
                </label>
              ))}
            </div>
            {ownershipReason && (
              <p className="ops-permission">{ownershipReason}</p>
            )}
            {incident?.status === "open" && (
              <p className="ops-permission">
                {copy(
                  locale,
                  "El checklist está bloqueado hasta que Dirección resuelva la incidencia.",
                  "The checklist is blocked until Management resolves the issue.",
                )}
              </p>
            )}
            <button
              type="button"
              className="ops-button is-primary"
              disabled={!canSubmit}
              onClick={() => run({ type: "submit-review", taskId: task.id })}
            >
              {copy(locale, "Solicitar revisión", "Request review")}
              <ArrowRight size={15} />
            </button>
            {!canSubmit && (
              <p className="ops-permission">
                {incident?.status === "open"
                  ? copy(
                      locale,
                      "La incidencia debe resolverse antes de solicitar revisión.",
                      "The issue must be resolved before requesting review.",
                    )
                  : copy(
                      locale,
                      "La persona asignada debe completar todas las comprobaciones.",
                      "The assigned person must complete every check.",
                    )}
              </p>
            )}
          </section>
          <section
            className="ops-detail-section"
            aria-labelledby="ops-review-heading"
          >
            <div className="ops-section-heading">
              <h3 id="ops-review-heading" tabIndex={-1}>
                <ShieldCheck size={17} />
                {copy(locale, "04 · Revisión final", "04 · Final review")}
              </h3>
              {task.status === "ready" && (
                <span className="ops-status is-ready">
                  <CheckCircle2 size={14} />
                  {copy(locale, "Validada", "Validated")}
                </span>
              )}
            </div>
            <p>
              {copy(
                locale,
                "Recepción o Dirección revisa la preparación. Puede devolver una comprobación concreta a Limpieza.",
                "Reception or Management reviews preparation. A specific check can be returned to Cleaning.",
              )}
            </p>
            <div className="ops-actions">
              <button
                type="button"
                className="ops-button is-primary"
                disabled={!canReview}
                onClick={() => run({ type: "approve", taskId: task.id })}
              >
                {copy(
                  locale,
                  "Validar habitación preparada",
                  "Validate room readiness",
                )}
              </button>
              <button
                type="button"
                className="ops-button"
                disabled={!isReviewer || task.status !== "review"}
                aria-expanded={returning}
                onClick={() => setReturning(!returning)}
              >
                {copy(locale, "Devolver a limpieza", "Return to cleaning")}
              </button>
            </div>
            {!canReview && (
              <p className="ops-permission">
                {!isReviewer
                  ? copy(
                      locale,
                      "Esta validación corresponde a Recepción o Dirección.",
                      "This validation belongs to Reception or Management.",
                    )
                  : task.status === "ready"
                    ? copy(
                        locale,
                        "La habitación ya está preparada. La llegada permanece ficticia.",
                        "The room is already ready. The arrival remains fictitious.",
                      )
                    : copy(
                        locale,
                        "Se requiere salida confirmada, checklist completo, incidencias resueltas y revisión solicitada.",
                        "A confirmed departure, complete checklist, resolved issues and requested review are required.",
                      )}
              </p>
            )}
            {returning && isReviewer && task.status === "review" && (
              <div className="ops-inline-decision">
                <label>
                  {copy(locale, "Comprobación a repetir", "Check to repeat")}
                  <select
                    value={returnItem}
                    onChange={(event) =>
                      setReturnItem(event.target.value as ChecklistId)
                    }
                  >
                    {CHECKLIST_ITEMS.map((item) => (
                      <option value={item.id} key={item.id}>
                        {locale === "es" ? item.labelEs : item.labelEn}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="ops-actions">
                  <button
                    type="button"
                    className="ops-button"
                    onClick={() => {
                      if (
                        run({
                          type: "return",
                          taskId: task.id,
                          itemId: returnItem,
                        })
                      )
                        setReturning(false);
                    }}
                  >
                    {copy(locale, "Confirmar devolución", "Confirm return")}
                  </button>
                  <button
                    type="button"
                    className="ops-text-button"
                    onClick={() => {
                      setReturning(false);
                      focusAfterChange(() => titleRef.current);
                    }}
                  >
                    {copy(locale, "Conservar revisión", "Keep review")}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
        <aside className="ops-detail-aside">
          {incident && (
            <section
              className={`ops-incident-evidence${incident.status === "open" ? " is-open" : ""}`}
              aria-labelledby="ops-incident-title"
            >
              <div className="ops-section-heading">
                <h3 id="ops-incident-title" tabIndex={-1}>
                  <Wrench size={17} />
                  {copy(locale, "Incidencia de muestra", "Sample issue")}
                </h3>
              </div>
              <figure className="ops-evidence-diagram">
                <div aria-hidden="true">
                  <span>
                    <Droplets size={31} />
                  </span>
                  <span>{copy(locale, "Baño", "Bathroom")}</span>
                  <ArrowRight size={18} />
                  <span>
                    <CircleAlert size={25} />
                  </span>
                </div>
                <figcaption>
                  {copy(
                    locale,
                    "Esquema ficticio · no es una fotografía",
                    "Fictitious diagram · not a photograph",
                  )}
                </figcaption>
              </figure>
              <h4>{copy(locale, "Fuga en el baño", "Bathroom leak")}</h4>
              <p>
                {copy(
                  locale,
                  "Se observa agua junto a la ducha en este caso de muestra. Registrar la incidencia desmarca la comprobación del baño e impide validar la habitación.",
                  "Water is shown beside the shower in this sample case. Reporting the issue unchecks the bathroom check and prevents room validation.",
                )}
              </p>
              <dl>
                <div>
                  <dt>{copy(locale, "Estado", "Status")}</dt>
                  <dd>
                    {incident.status === "available"
                      ? copy(locale, "Caso sin registrar", "Not yet reported")
                      : incident.status === "open"
                        ? copy(
                            locale,
                            "Abierta · bloquea preparación",
                            "Open · blocks readiness",
                          )
                        : copy(
                            locale,
                            readiness.status === "ready"
                              ? "Resuelta · preparación validada"
                              : "Resuelta · requiere revisión",
                            readiness.status === "ready"
                              ? "Resolved · preparation validated"
                              : "Resolved · review required",
                          )}
                  </dd>
                </div>
                <div>
                  <dt>
                    {copy(
                      locale,
                      "Responsable de resolver",
                      "Resolution owner",
                    )}
                  </dt>
                  <dd>{roleName("direction", locale)}</dd>
                </div>
              </dl>
              {incident.status !== "open" ? (
                <button
                  type="button"
                  className="ops-button"
                  disabled={!canReport}
                  onClick={() => run({ type: "report-issue", taskId: task.id })}
                >
                  {copy(
                    locale,
                    "Registrar incidencia ficticia",
                    "Report fictitious issue",
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="ops-button is-primary"
                  disabled={role !== "direction"}
                  onClick={() =>
                    run({ type: "resolve-issue", taskId: task.id })
                  }
                >
                  {copy(locale, "Resolver incidencia", "Resolve issue")}
                </button>
              )}
              <p className="ops-permission">
                {incident.status === "open"
                  ? copy(
                      locale,
                      "Solo Dirección puede resolverla. Después, Limpieza vuelve a comprobar el baño y solicita revisión.",
                      "Only Management can resolve it. Cleaning then checks the bathroom again and requests review.",
                    )
                  : copy(
                      locale,
                      "Puede registrarse durante la preparación, revisión o después de validar; reabrirla exige una nueva revisión.",
                      "It can be reported during preparation, review or after validation; reopening it requires a new review.",
                    )}
              </p>
            </section>
          )}
          <section className="ops-record-context">
            <span className="ops-eyebrow">
              {copy(
                locale,
                "Misma estancia, mismo estado",
                "Same stay, same status",
              )}
            </span>
            <h3>{stay.guestName}</h3>
            <dl>
              <div>
                <dt>{copy(locale, "Estancia", "Stay")}</dt>
                <dd>{stay.id}</dd>
              </div>
              <div>
                <dt>{copy(locale, "Habitación", "Room")}</dt>
                <dd>{task.unitId}</dd>
              </div>
              <div>
                <dt>{copy(locale, "Huéspedes", "Guests")}</dt>
                <dd>{stay.guests}</dd>
              </div>
              <div>
                <dt>{copy(locale, "Salida", "Check-out")}</dt>
                <dd>
                  <time dateTime={stay.endDate}>
                    {dateLabel(stay.endDate, locale)}
                  </time>
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
      <details className="ops-history">
        <summary>
          {copy(locale, "Trazabilidad de este caso", "Case history")} ·{" "}
          {taskEvents.length} {copy(locale, "cambios", "changes")}
        </summary>
        {taskEvents.length ? (
          <ol>
            {taskEvents.map((event) => (
              <li key={event.id}>
                <span>{String(event.id).padStart(2, "0")}</span>
                <div>
                  <strong>{actionName(event.type, locale)}</strong>
                  <small>
                    {roleName(event.role, locale)} ·{" "}
                    {actorName(event.actor, locale)}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p>
            {copy(
              locale,
              "Este caso conserva su estado inicial de muestra. Los cambios que hagas aparecerán aquí durante la visita.",
              "This case remains in its initial sample state. Changes made during this visit will appear here.",
            )}
          </p>
        )}
      </details>
    </article>
  );
}
