import { useEffect, useState } from 'react';
import {
  Activity, BedDouble, BellRing, BookOpen, Bot, CalendarDays, Check, ChevronRight,
  CircleDollarSign, ClipboardCheck, DoorOpen, House, LayoutDashboard, Menu, MessageSquareText,
  RefreshCw, Search, Settings, Sparkles, Users, X,
} from 'lucide-react';
import type { DemoRole } from '@logic-estancia/domain';
import { canOperate, initialState, parseStored, type DemoState, type Scenario } from './state';

type Locale = 'es' | 'en';
type View = 'home' | 'enquiries' | 'planning' | 'bookings' | 'guests' | 'cleaning' | 'channels' | 'automation' | 'control' | 'reports' | 'settings';

const properties = {
  terrava: ['Casa Aira', 'Casa Bruma', 'Casa Cauce', 'Casa Duna', 'Casa Era', 'Casa Faya', 'Casa Linde', 'Casa Umbral'],
  aurem: ['Aurem Hotel'],
};

const labels = {
  es: { home: 'Inicio', enquiries: 'Solicitudes', planning: 'Planning', bookings: 'Reservas', guests: 'Huéspedes', cleaning: 'Limpieza', channels: 'Canales', automation: 'Automatiza', control: 'Control total', reports: 'Informes', settings: 'Ajustes' },
  en: { home: 'Home', enquiries: 'Enquiries', planning: 'Planning', bookings: 'Bookings', guests: 'Guests', cleaning: 'Cleaning', channels: 'Channels', automation: 'Automate', control: 'Total control', reports: 'Reports', settings: 'Settings' },
} as const;

const icons: Record<View, typeof House> = { home: LayoutDashboard, enquiries: MessageSquareText, planning: CalendarDays, bookings: BookOpen, guests: Users, cleaning: ClipboardCheck, channels: Activity, automation: Sparkles, control: Bot, reports: CircleDollarSign, settings: Settings };

const viewsFor = (scenario: Scenario): View[] => scenario === 'terrava'
  ? ['home', 'enquiries', 'planning', 'bookings', 'guests', 'cleaning', 'reports', 'settings']
  : ['home', 'planning', 'bookings', 'guests', 'cleaning', 'channels', 'automation', 'control', 'reports', 'settings'];

function useDemoState(scenario: Scenario) {
  const key = `logic-estancia-demo-${scenario}-v1`;
  const [state, setState] = useState<DemoState>(() => typeof localStorage === 'undefined' ? initialState(scenario) : parseStored(localStorage.getItem(key), scenario));
  useEffect(() => localStorage.setItem(key, JSON.stringify(state)), [key, state]);
  const patch = (next: Partial<DemoState>) => setState((current) => ({ ...current, ...next }));
  const reset = () => { const fresh = initialState(scenario); localStorage.setItem(key, JSON.stringify(fresh)); setState(fresh); };
  return { state, patch, reset };
}

export function DashboardDemo({ scenario, locale = 'es' }: { scenario: Scenario; locale?: Locale }) {
  const { state, patch, reset } = useDemoState(scenario);
  const [view, setView] = useState<View>('home');
  const [mobile, setMobile] = useState(false);
  const [tour, setTour] = useState<number | null>(null);
  const brand = scenario === 'aurem' ? 'Aurem Hotel' : 'Terrava Collection';
  const level = scenario === 'aurem' ? (locale === 'es' ? 'Visión' : 'Vision') : (locale === 'es' ? 'Gestión' : 'Manage');
  const availableViews = viewsFor(scenario);

  const go = (next: View) => { setView(next); setMobile(false); const url = new URL(location.href); url.searchParams.set('vista', next); history.replaceState(null, '', url); };
  useEffect(() => { const candidate = new URLSearchParams(location.search).get('vista') as View | null; if (candidate && availableViews.includes(candidate)) setView(candidate); }, []);

  const tourSteps: [string, View][] = scenario === 'terrava' ? [
    [locale === 'es' ? 'Una solicitud sin encaje' : 'An enquiry without a fit', 'enquiries' as View],
    [locale === 'es' ? 'Compara las ocho casas' : 'Compare all eight homes', 'planning' as View],
    [locale === 'es' ? 'Convierte la alternativa' : 'Convert the alternative', 'bookings' as View],
  ] : [
    [locale === 'es' ? 'Detecta la habitación en riesgo' : 'Find the room at risk', 'home' as View],
    [locale === 'es' ? 'Limpieza prepara la 408' : 'Cleaning prepares room 408', 'cleaning' as View],
    [locale === 'es' ? 'Recepción valida la entrada' : 'Reception validates the arrival', 'planning' as View],
  ];

  const startTour = () => { setTour(0); go(tourSteps[0]![1]); patch({ tourSeen: true }); };
  const advanceTour = () => { if (tour === null) return; const next = tour + 1; if (next >= tourSteps.length) setTour(null); else { setTour(next); go(tourSteps[next]![1]); } };

  return <div className="dash">
    <aside className={mobile ? 'sidebar open' : 'sidebar'}>
      <div className="dash-brand"><span>{brand}</span><small>Logic Estancia · {level}</small></div>
      <button className="sidebar-close" onClick={() => setMobile(false)} aria-label="Cerrar"><X size={20}/></button>
      <nav aria-label={locale === 'es' ? 'Gestor' : 'Workspace'}>{availableViews.map((item) => { const Icon = icons[item]; return <button key={item} className={item === view ? 'active' : ''} onClick={() => go(item)}><Icon size={17}/><span>{labels[locale][item]}</span></button>; })}</nav>
      <div className="sidebar-foot"><a href="https://wa.me/34626432316" target="_blank" rel="noreferrer">{locale === 'es' ? 'Ayuda Logic2B' : 'Logic2B help'} ↗</a><span>{locale === 'es' ? 'Datos ficticios · sin integraciones' : 'Fictitious data · no integrations'}</span></div>
    </aside>
    {mobile && <button className="backdrop" onClick={() => setMobile(false)} aria-label="Cerrar menú"/>}
    <main className="dash-main">
      <header className="dash-top">
        <button className="mobile-menu" onClick={() => setMobile(true)} aria-label="Menu"><Menu size={20}/></button>
        <label className="property-select"><span className="sr-only">{locale === 'es' ? 'Propiedad' : 'Property'}</span><select value={state.selectedProperty} onChange={(e) => patch({ selectedProperty: e.target.value })}><option value="all">{locale === 'es' ? 'Todas las propiedades' : 'All properties'}</option>{properties[scenario].map((p) => <option key={p}>{p}</option>)}</select></label>
        {scenario === 'aurem' && <label className="role-select"><span className="sr-only">Rol</span><select value={state.role} onChange={(e) => patch({ role: e.target.value as DemoRole })}><option value="direction">{locale === 'es' ? 'Dirección' : 'Direction'}</option><option value="reception">{locale === 'es' ? 'Recepción' : 'Reception'}</option><option value="cleaning">{locale === 'es' ? 'Limpieza' : 'Cleaning'}</option></select></label>}
        <button className="tour-button" onClick={startTour}><Sparkles size={16}/>{locale === 'es' ? 'Ver recorrido' : 'Start tour'}</button>
        <button className="reset" onClick={reset} title={locale === 'es' ? 'Restablecer datos' : 'Reset data'}><RefreshCw size={16}/><span>{locale === 'es' ? 'Restablecer' : 'Reset'}</span></button>
      </header>
      <div className="demo-banner"><strong>{locale === 'es' ? 'Demo funcional' : 'Functional demo'}</strong><span>{locale === 'es' ? 'Los cambios solo viven en este navegador. Pagos, canales, IA y envíos externos no están conectados.' : 'Changes only live in this browser. Payments, channels, AI and external delivery are not connected.'}</span></div>
      <section className="dash-content">
        <div className="page-head"><div><p>{level} · {brand}</p><h1>{labels[locale][view]}</h1></div><div className="page-meta"><Search size={17}/><BellRing size={17}/></div></div>
        <ViewContent scenario={scenario} locale={locale} view={view} state={state} patch={patch} go={go}/>
      </section>
    </main>
    {tour !== null && <div className="tour-pop" role="dialog" aria-modal="true" aria-label={locale === 'es' ? 'Recorrido guiado' : 'Guided tour'}><span>{tour + 1}/{tourSteps.length}</span><h2>{tourSteps[tour]![0]}</h2><p>{locale === 'es' ? 'La demo conserva este paso si cambias de pantalla. Puedes cerrarla y explorar libremente.' : 'The demo keeps this step as you change screens. Close it at any time and explore freely.'}</p><div><button onClick={() => setTour(null)}>{locale === 'es' ? 'Cerrar' : 'Close'}</button><button className="primary" onClick={advanceTour}>{tour === tourSteps.length - 1 ? (locale === 'es' ? 'Terminar' : 'Finish') : (locale === 'es' ? 'Siguiente' : 'Next')}<ChevronRight size={16}/></button></div></div>}
  </div>;
}

function ViewContent({ scenario, locale, view, state, patch, go }: { scenario: Scenario; locale: Locale; view: View; state: DemoState; patch: (next: Partial<DemoState>) => void; go: (view: View) => void }) {
  if (view === 'home') return <Home scenario={scenario} locale={locale} state={state} go={go}/>;
  if (view === 'enquiries') return <Enquiries locale={locale} state={state} patch={patch} go={go}/>;
  if (view === 'planning') return <Planning scenario={scenario} locale={locale} state={state} patch={patch}/>;
  if (view === 'bookings') return <Bookings scenario={scenario} locale={locale} state={state}/>;
  if (view === 'guests') return <TablePage locale={locale}/>;
  if (view === 'cleaning') return <Cleaning scenario={scenario} locale={locale} state={state} patch={patch}/>;
  if (view === 'channels') return <Channels locale={locale}/>;
  if (view === 'automation') return <Automation locale={locale}/>;
  if (view === 'control') return <Control locale={locale} state={state} go={go}/>;
  if (view === 'reports') return <Reports scenario={scenario} locale={locale}/>;
  return <SettingsPage locale={locale} scenario={scenario}/>;
}

function Home({ scenario, locale, state, go }: { scenario: Scenario; locale: Locale; state: DemoState; go: (v: View) => void }) {
  const cards = scenario === 'aurem' ? [
    [locale === 'es' ? 'Llegadas hoy' : 'Arrivals today', '18', 'planning'],
    [locale === 'es' ? 'Habitaciones listas' : 'Rooms ready', state.cleaning === 'ready' ? '93/96' : '92/96', 'cleaning'],
    [locale === 'es' ? 'Ocupación 14 días' : '14-day occupancy', '87%', 'reports'],
    [locale === 'es' ? 'Canales' : 'Channels', '4 demo', 'channels'],
  ] : [
    [locale === 'es' ? 'Solicitudes nuevas' : 'New enquiries', state.enquiry === 'new' ? '4' : '3', 'enquiries'],
    [locale === 'es' ? 'Propiedades ocupadas' : 'Occupied properties', '6/8', 'planning'],
    [locale === 'es' ? 'Entradas esta semana' : 'Arrivals this week', '5', 'bookings'],
    [locale === 'es' ? 'Pendientes de preparar' : 'Pending preparation', '2', 'cleaning'],
  ];
  return <><div className="metric-grid">{cards.map(([name, value, target]) => <button key={name} onClick={() => go(target as View)}><span>{name}</span><strong>{value}</strong><ChevronRight size={17}/></button>)}</div><div className="dash-grid"><article className="panel wide"><h2>{locale === 'es' ? 'Lo que amenaza el día' : 'What threatens today'}</h2><Task tone="urgent" title={scenario === 'aurem' ? (locale === 'es' ? '408 · entrada a las 15:00' : '408 · arrival at 15:00') : (locale === 'es' ? 'Solicitud de Marina no cabe en Casa Aira' : 'Marina’s enquiry does not fit Casa Aira')} detail={scenario === 'aurem' ? (locale === 'es' ? 'Salida completada · limpieza pendiente' : 'Checkout complete · cleaning pending') : (locale === 'es' ? '4 huéspedes · 21–24 agosto' : '4 guests · 21–24 August')}/><Task title={locale === 'es' ? 'Cobro preparado, no enviado' : 'Payment prepared, not sent'} detail={locale === 'es' ? 'Requiere confirmación de Recepción' : 'Requires Reception confirmation'}/></article><article className="panel"><h2>{locale === 'es' ? 'Próximas decisiones' : 'Next decisions'}</h2><ol className="decision-list"><li><span>09:30</span>{locale === 'es' ? 'Validar dos salidas' : 'Validate two departures'}</li><li><span>11:00</span>{locale === 'es' ? 'Revisar disponibilidad' : 'Review availability'}</li><li><span>14:00</span>{locale === 'es' ? 'Preparar relevo' : 'Prepare handover'}</li></ol></article></div></>;
}

function Enquiries({ locale, state, patch, go }: { locale: Locale; state: DemoState; patch: (n: Partial<DemoState>) => void; go: (v: View) => void }) {
  const status = { new: locale === 'es' ? 'Nueva' : 'New', alternative: locale === 'es' ? 'Alternativa preparada' : 'Alternative prepared', booked: locale === 'es' ? 'Convertida' : 'Converted' }[state.enquiry];
  return <div className="dash-grid"><article className="panel wide"><div className="panel-head"><div><span className={`tag ${state.enquiry}`}>{status}</span><h2>{locale === 'es' ? 'Marina Costa · 4 huéspedes' : 'Marina Costa · 4 guests'}</h2><p>21–24 · Casa Aira</p></div><strong>REQ-024</strong></div><div className="alert">{locale === 'es' ? 'Casa Aira no está disponible la primera noche. Casa Bruma encaja en fechas, capacidad y precio.' : 'Casa Aira is unavailable on the first night. Casa Bruma fits dates, capacity and price.'}</div><div className="comparison"><div><span>Casa Aira</span><b>{locale === 'es' ? 'Sin encaje' : 'No fit'}</b><small>{locale === 'es' ? 'Ocupada hasta el 22' : 'Occupied until 22'}</small></div><div className="recommended"><span>Casa Bruma</span><b>€ 612</b><small>{locale === 'es' ? 'Disponible · 3 noches' : 'Available · 3 nights'}</small></div></div><div className="actions">{state.enquiry === 'new' && <button className="primary" onClick={() => patch({ enquiry: 'alternative' })}>{locale === 'es' ? 'Preparar alternativa' : 'Prepare alternative'}</button>}{state.enquiry === 'alternative' && <button className="primary" onClick={() => { patch({ enquiry: 'booked' }); go('bookings'); }}>{locale === 'es' ? 'Convertir en reserva' : 'Convert to booking'}</button>}{state.enquiry === 'booked' && <span className="done"><Check size={16}/>{locale === 'es' ? 'Reserva TER-104 creada' : 'Booking TER-104 created'}</span>}</div></article><article className="panel"><h2>{locale === 'es' ? 'Contexto conservado' : 'Context preserved'}</h2><p className="body-copy">{locale === 'es' ? 'Fechas, huéspedes, preferencias y conversación viajan a la reserva. No hay que copiar datos entre pantallas.' : 'Dates, guests, preferences and conversation move into the booking. No copy and paste between screens.'}</p></article></div>;
}

function Planning({ scenario, locale, state, patch }: { scenario: Scenario; locale: Locale; state: DemoState; patch: (n: Partial<DemoState>) => void }) {
  const rows = scenario === 'aurem' ? ['401 · Classic', '402 · Classic', '403 · Classic', '404 · Corner', '405 · Corner', '406 · Terrace', '407 · Terrace', '408 · Terrace'] : properties.terrava;
  return <div className="panel planning"><div className="planning-head"><div><h2>{locale === 'es' ? 'Agosto · 14 días' : 'August · 14 days'}</h2><p>{state.selectedProperty === 'all' ? (locale === 'es' ? 'Todas las propiedades' : 'All properties') : state.selectedProperty}</p></div><span className="status-line">{locale === 'es' ? 'Salida exclusiva · EUR' : 'Exclusive checkout · EUR'}</span></div><div className="tape" role="table"><div className="tape-days"><span></span>{Array.from({length: 14}, (_, i) => <b key={i}>{18+i}</b>)}</div>{rows.map((row, r) => <div className="tape-row" key={row}><span>{row}</span>{Array.from({length: 14}, (_, d) => <i key={d} className={(d >= (r % 5) && d < (r % 5) + 4) ? 'occupied' : (scenario === 'aurem' && row.startsWith('408') && d === 3 ? `clean-${state.cleaning}` : '')}>{scenario === 'aurem' && row.startsWith('408') && d === 3 ? '!' : ''}</i>)}</div>)}</div>{scenario === 'aurem' && <div className="planning-action"><div><strong>408 · {state.cleaning === 'ready' ? (locale === 'es' ? 'Lista para entrada' : 'Ready for arrival') : (locale === 'es' ? 'Preparación pendiente' : 'Preparation pending')}</strong><span>{locale === 'es' ? 'Entrada prevista 15:00' : 'Expected arrival 15:00'}</span></div>{state.cleaning === 'review' && canOperate(state.role, 'review') && <button className="primary" onClick={() => patch({ cleaning: 'ready' })}>{locale === 'es' ? 'Validar habitación' : 'Validate room'}</button>}</div>}</div>;
}

function Bookings({ scenario, locale, state }: { scenario: Scenario; locale: Locale; state: DemoState }) {
  const extra = scenario === 'terrava' && state.enquiry === 'booked' ? [['TER-104', 'Marina Costa', 'Casa Bruma', '21–24 Aug', locale === 'es' ? 'Confirmada' : 'Confirmed']] : [];
  const rows = scenario === 'aurem' ? [['AUR-812', 'Elena Rossi', 'Terrace · 408', '14–17 Aug', locale === 'es' ? 'Entrada hoy' : 'Arrival today'],['AUR-809','M. Laurent','Classic · 403','14–16 Aug',locale === 'es' ? 'Confirmada' : 'Confirmed'],['AUR-798','Sofia Klein','Corner · 405','13–15 Aug',locale === 'es' ? 'En casa' : 'In house']] : [['TER-101','Irene Vidal','Casa Linde','18–22 Aug',locale === 'es' ? 'En casa' : 'In house'],['TER-102','Luis Martín','Casa Era','19–23 Aug',locale === 'es' ? 'Confirmada' : 'Confirmed'],['TER-103','Mina Olsen','Casa Faya','20–25 Aug',locale === 'es' ? 'Confirmada' : 'Confirmed'], ...extra];
  return <Table rows={rows} headings={locale === 'es' ? ['Reserva','Titular','Unidad','Estancia','Estado'] : ['Booking','Lead guest','Unit','Stay','Status']}/>;
}

function TablePage({ locale }: { locale: Locale }) {
  return <Table rows={[["Elena Rossi","elena@example.test","Italia",locale === 'es' ? 'Pre-check-in preparado' : 'Pre-check-in prepared'],["Marina Costa","marina@example.test","España",locale === 'es' ? 'Consentimiento demo' : 'Demo consent'],["M. Laurent","laurent@example.test","Francia",locale === 'es' ? 'En casa' : 'In house']]} headings={locale === 'es' ? ['Huésped','Email ficticio','País','Estado'] : ['Guest','Fictitious email','Country','Status']}/>;
}

function Cleaning({ scenario, locale, state, patch }: { scenario: Scenario; locale: Locale; state: DemoState; patch: (n: Partial<DemoState>) => void }) {
  if (scenario === 'terrava') return <div className="clean-list"><CleanCard name="Casa Bruma" status={locale === 'es' ? 'Lista' : 'Ready'} detail={locale === 'es' ? 'Revisada 10:42' : 'Reviewed 10:42'}/><CleanCard name="Casa Linde" status={locale === 'es' ? 'Pendiente' : 'Pending'} detail={locale === 'es' ? 'Salida prevista 11:00' : 'Departure expected 11:00'}/><CleanCard name="Casa Era" status={locale === 'es' ? 'En preparación' : 'In preparation'} detail={locale === 'es' ? 'Limpieza básica · Gestión' : 'Basic cleaning · Manage'}/></div>;
  const role = state.role; const title = { pending: locale === 'es' ? 'Pendiente' : 'Pending', in_progress: locale === 'es' ? 'En curso' : 'In progress', review: locale === 'es' ? 'Lista para revisar' : 'Ready for review', ready: locale === 'es' ? 'Validada' : 'Validated' }[state.cleaning];
  return <div className="dash-grid"><article className="panel wide"><div className="panel-head"><div><span className={`tag ${state.cleaning}`}>{title}</span><h2>408 · Terrace</h2><p>{locale === 'es' ? 'Salida 11:08 · entrada 15:00' : 'Departure 11:08 · arrival 15:00'}</p></div><BedDouble size={28}/></div><ul className="checklist"><li className={state.cleaning !== 'pending' ? 'checked' : ''}><Check size={16}/>{locale === 'es' ? 'Ropa y baño' : 'Linen and bathroom'}</li><li className={['review','ready'].includes(state.cleaning) ? 'checked' : ''}><Check size={16}/>{locale === 'es' ? 'Superficies y minibar' : 'Surfaces and minibar'}</li><li className={state.cleaning === 'ready' ? 'checked' : ''}><Check size={16}/>{locale === 'es' ? 'Validación de recepción' : 'Reception validation'}</li></ul><div className="actions">{state.cleaning === 'pending' && canOperate(role, 'cleaning') && <button className="primary" onClick={() => patch({ cleaning: 'in_progress' })}>{locale === 'es' ? 'Empezar preparación' : 'Start preparation'}</button>}{state.cleaning === 'in_progress' && canOperate(role, 'cleaning') && <button className="primary" onClick={() => patch({ cleaning: 'review' })}>{locale === 'es' ? 'Marcar lista para revisar' : 'Mark ready for review'}</button>}{state.cleaning === 'review' && canOperate(role, 'review') && <button className="primary" onClick={() => patch({ cleaning: 'ready' })}>{locale === 'es' ? 'Validar habitación' : 'Validate room'}</button>}{!canOperate(role, state.cleaning === 'review' ? 'review' : 'cleaning') && state.cleaning !== 'ready' && <span className="permission-note">{locale === 'es' ? `El rol ${role} puede ver este estado, pero no ejecutar el siguiente paso.` : `The ${role} role can see this state but cannot perform the next step.`}</span>}{state.cleaning === 'ready' && <span className="done"><Check size={16}/>{locale === 'es' ? 'Habitación disponible para la entrada' : 'Room available for arrival'}</span>}</div></article><article className="panel"><h2>{locale === 'es' ? 'Responsabilidad visible' : 'Visible responsibility'}</h2><p className="body-copy">{locale === 'es' ? 'Limpieza ejecuta; Recepción valida. Dirección puede intervenir, pero el historial conserva quién hizo cada paso.' : 'Cleaning performs; Reception validates. Direction may intervene, while history keeps who completed each step.'}</p></article></div>;
}

function Channels({ locale }: { locale: Locale }) { return <><div className="integration-note"><strong>{locale === 'es' ? 'Demo · no conectado' : 'Demo · not connected'}</strong><span>{locale === 'es' ? 'Estos estados proceden de un fixture. Ningún canal ha recibido inventario.' : 'These states come from a fixture. No channel has received inventory.'}</span></div><div className="channel-grid">{[['Booking.com','Preparado','12:04'],['Airbnb','Preparado','11:58'],['Expedia','Por validar','—'],['iCal directo','Disponible','12:06']].map(([name,status,time]) => <article className="panel" key={name}><span>{status}</span><h2>{name}</h2><strong>{time}</strong><small>{locale === 'es' ? 'Última sincronización de muestra' : 'Sample last sync'}</small></article>)}</div></>; }

function Automation({ locale }: { locale: Locale }) { return <div className="dash-grid"><article className="panel wide"><span className="tag">{locale === 'es' ? 'Copiloto supervisado · demo' : 'Supervised copilot · demo'}</span><h2>{locale === 'es' ? 'Respuesta preparada para Elena Rossi' : 'Reply prepared for Elena Rossi'}</h2><blockquote>{locale === 'es' ? 'Hola Elena, tu habitación Terrace estará lista a partir de las 15:00. Hemos preparado el pre-check-in, pero todavía necesitamos que confirmes…' : 'Hello Elena, your Terrace room will be ready from 15:00. We prepared the pre-check-in, but still need you to confirm…'}</blockquote><div className="sources"><span>{locale === 'es' ? 'Fuentes' : 'Sources'}</span><b>Reserva AUR-812</b><b>{locale === 'es' ? 'Política de entrada' : 'Arrival policy'}</b><b>{locale === 'es' ? 'Estado habitación 408' : 'Room 408 status'}</b></div><button disabled>{locale === 'es' ? 'Enviar · proveedor no conectado' : 'Send · provider not connected'}</button></article><article className="panel"><h2>{locale === 'es' ? 'Límite visible' : 'Visible boundary'}</h2><p className="body-copy">{locale === 'es' ? 'El copiloto prepara y explica. Precio, reserva, cobro y mensaje requieren una confirmación humana y un proveedor real.' : 'The copilot prepares and explains. Price, booking, payment and message require human confirmation and a real provider.'}</p></article></div>; }

function Control({ locale, state, go }: { locale: Locale; state: DemoState; go: (v: View) => void }) {
  const families = locale === 'es' ? ['Centro','Limpieza','Mantenimiento','Equipo','Huésped','Reservas y grupos','Ingresos','Canales e inteligencia'] : ['Centre','Cleaning','Maintenance','Team','Guest','Bookings and groups','Revenue','Channels and intelligence'];
  return <><div className="control-hero panel"><div><span className="tag">{locale === 'es' ? 'Demo funcional' : 'Functional demo'}</span><h2>{locale === 'es' ? 'Lo importante de hoy, antes de que se convierta en incidencia.' : 'What matters today, before it becomes an incident.'}</h2><p>{locale === 'es' ? `La habitación 408 está ${state.cleaning === 'ready' ? 'lista' : 'en riesgo'} para una entrada a las 15:00.` : `Room 408 is ${state.cleaning === 'ready' ? 'ready' : 'at risk'} for a 15:00 arrival.`}</p></div><button className="primary" onClick={() => go('cleaning')}>{locale === 'es' ? 'Abrir preparación' : 'Open preparation'}</button></div><div className="family-grid">{families.map((f, i) => <article className="panel" key={f}><span>0{i+1}</span><h2>{f}</h2><small>{i < 2 ? (locale === 'es' ? 'Demo funcional' : 'Functional demo') : i < 6 ? (locale === 'es' ? 'Siguiente por validar' : 'Next to validate') : (locale === 'es' ? 'Visión futura' : 'Future vision')}</small></article>)}</div></>;
}

function Reports({ scenario, locale }: { scenario: Scenario; locale: Locale }) { const values = scenario === 'aurem' ? [62,68,74,70,79,83,87,91,88,92,86,90] : [50,63,75,75,88,75,63,75,88,75,63,50]; return <div className="dash-grid"><article className="panel wide"><h2>{locale === 'es' ? 'Ocupación · 12 semanas' : 'Occupancy · 12 weeks'}</h2><div className="bar-chart">{values.map((v,i) => <i key={i} style={{height: `${v}%`}}><span>{v}%</span></i>)}</div></article><article className="panel"><h2>{locale === 'es' ? 'Ingresos preparados' : 'Prepared revenue'}</h2><strong className="big-number">{scenario === 'aurem' ? '€ 184k' : '€ 26.4k'}</strong><p className="body-copy">{locale === 'es' ? 'Dato de escenario. No procede de contabilidad ni pasarela real.' : 'Scenario data. Not sourced from accounting or a live payment provider.'}</p></article></div>; }

function SettingsPage({ locale, scenario }: { locale: Locale; scenario: Scenario }) { return <div className="settings-grid"><article className="panel"><h2>{locale === 'es' ? 'Empresa' : 'Organisation'}</h2><dl><dt>{locale === 'es' ? 'Modelo' : 'Mode'}</dt><dd>{locale === 'es' ? 'Multiestancia' : 'Multi-stay'}</dd><dt>{locale === 'es' ? 'Propiedades' : 'Properties'}</dt><dd>{scenario === 'aurem' ? 1 : 8}</dd><dt>{locale === 'es' ? 'Unidades' : 'Units'}</dt><dd>{scenario === 'aurem' ? 96 : 8}</dd><dt>{locale === 'es' ? 'Moneda' : 'Currency'}</dt><dd>EUR</dd></dl></article><article className="panel"><h2>{locale === 'es' ? 'Integraciones' : 'Integrations'}</h2><dl><dt>Resend</dt><dd>{locale === 'es' ? 'No conectado' : 'Not connected'}</dd><dt>Redsys / Stripe</dt><dd>{locale === 'es' ? 'No conectado' : 'Not connected'}</dd><dt>SES.Hospedajes</dt><dd>{locale === 'es' ? 'Preparado, no enviado' : 'Prepared, not sent'}</dd><dt>OTA</dt><dd>{scenario === 'aurem' ? 'Demo' : 'iCal'}</dd></dl></article></div>; }

function Table({ rows, headings }: { rows: string[][]; headings: string[] }) { return <div className="table-wrap panel"><table><thead><tr>{headings.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i) => <tr key={i}>{row.map((cell,j) => <td key={j}>{j === row.length-1 ? <span className="tag">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>; }
function Task({ title, detail, tone }: { title: string; detail: string; tone?: string }) { return <div className={`task ${tone ?? ''}`}><i></i><div><strong>{title}</strong><span>{detail}</span></div><ChevronRight size={17}/></div>; }
function CleanCard({ name, status, detail }: { name: string; status: string; detail: string }) { return <article className="panel"><DoorOpen size={22}/><span className="tag">{status}</span><h2>{name}</h2><p>{detail}</p></article>; }
