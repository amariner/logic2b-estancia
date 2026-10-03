import { ArrowUpRight, CalendarDays, Info } from "lucide-react";
import { stayReport, type StayWorkspace } from "./stays";
import "./stay-report.css";

export function StayReport({
  workspace,
  selectedProperty,
  locale,
  onOpenBookings,
}: {
  workspace: StayWorkspace;
  selectedProperty: string;
  locale: "es" | "en";
  onOpenBookings: () => void;
}) {
  const report = stayReport(workspace, selectedProperty);
  const es = locale === "es";
  const money = (cents: number) =>
    new Intl.NumberFormat(es ? "es-ES" : "en-GB", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(cents / 100);
  const number = (value: number) =>
    new Intl.NumberFormat(es ? "es-ES" : "en-GB", {
      maximumFractionDigits: 1,
    }).format(value);
  return (
    <div className="stay-report" data-stay-report>
      <div className="stay-report-heading">
        <div>
          <span className="tag">
            <CalendarDays size={14} />{" "}
            {es
              ? "Agosto de 2026 · escenario ficticio"
              : "August 2026 · fictitious scenario"}
          </span>
          <h2>{es ? "Cada cifra, una estancia" : "Every figure, a stay"}</h2>
          <p>
            {selectedProperty === "all"
              ? es
                ? "Las ocho casas"
                : "All eight homes"
              : selectedProperty}{" "}
            ·{" "}
            {es
              ? "El informe se actualiza con tus cambios en esta visita."
              : "This report updates with your changes during this visit."}
          </p>
        </div>
        <button type="button" onClick={onOpenBookings}>
          {es ? "Revisar estancias" : "Review stays"}
          <ArrowUpRight size={16} />
        </button>
      </div>
      <dl className="stay-report-metrics">
        <div>
          <dt>{es ? "Estancias confirmadas" : "Confirmed stays"}</dt>
          <dd>
            <span data-report-stays>{report.stayCount}</span>
            <small>
              {report.guestCount}{" "}
              {es ? "huéspedes de muestra" : "sample guests"}
            </small>
          </dd>
        </div>
        <div>
          <dt>{es ? "Importe de las estancias" : "Stay value"}</dt>
          <dd>
            <span data-report-value>{money(report.totalCents)}</span>
            <small>
              {es
                ? "Importe ficticio · no cobrado"
                : "Fictitious value · not collected"}
            </small>
          </dd>
        </div>
        <div>
          <dt>{es ? "Ocupación del escenario" : "Scenario occupancy"}</dt>
          <dd>
            {number(report.occupancyPercent)}%
            <small>
              {report.occupiedNights} / {report.availableNights}{" "}
              {es ? "noches disponibles" : "available nights"}
            </small>
          </dd>
        </div>
      </dl>
      <article className="panel">
        <div className="stay-report-chart-heading">
          <div>
            <h3>{es ? "Ocupación noche a noche" : "Occupancy by night"}</h3>
            <p>
              {es
                ? "La salida libera la casa ese mismo día. Los bloqueos de mantenimiento se excluyen de la capacidad."
                : "Departure frees the home on the same day. Maintenance blocks are excluded from capacity."}
            </p>
          </div>
          <span className="tag">{es ? "31 noches" : "31 nights"}</span>
        </div>
        <div
          className="stay-report-chart"
          role="img"
          aria-label={
            es
              ? `Ocupación de agosto: ${report.occupiedNights} noches ocupadas de ${report.availableNights} disponibles. Valores por día en la tabla siguiente.`
              : `August occupancy: ${report.occupiedNights} occupied nights out of ${report.availableNights} available. Daily values in the following table.`
          }
        >
          {report.daily.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.occupiedUnits}/${day.availableUnits}`}
            >
              <span>
                <i
                  style={{
                    height: `${day.availableUnits ? (day.occupiedUnits / day.availableUnits) * 100 : 0}%`,
                  }}
                />
              </span>
              <small>{Number(day.date.slice(-2))}</small>
            </div>
          ))}
        </div>
        <details className="stay-report-ledger">
          <summary>
            {es
              ? "Ver capacidad y ocupación por día"
              : "View daily capacity and occupancy"}
          </summary>
          <div
            tabIndex={0}
            role="region"
            aria-label={
              es ? "Detalle diario de ocupación" : "Daily occupancy detail"
            }
          >
            <table>
              <caption>
                {es
                  ? "Noches de agosto de 2026 · solo estancias confirmadas"
                  : "August 2026 nights · confirmed stays only"}
              </caption>
              <thead>
                <tr>
                  {(es
                    ? ["Noche", "Disponibles", "Ocupadas", "Fuera de servicio"]
                    : ["Night", "Available", "Occupied", "Out of service"]
                  ).map((heading) => (
                    <th scope="col" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.daily.map((day) => (
                  <tr key={day.date}>
                    <th scope="row">{day.date}</th>
                    <td>{day.availableUnits}</td>
                    <td>{day.occupiedUnits}</td>
                    <td>{day.outOfServiceUnits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </article>
      <div className="stay-report-explanation">
        <article className="panel">
          <h3>{es ? "Desglose del importe" : "Value breakdown"}</h3>
          <dl>
            <div>
              <dt>{es ? "Alojamiento" : "Accommodation"}</dt>
              <dd>{money(report.accommodationCents)}</dd>
            </div>
            <div>
              <dt>{es ? "Limpieza de las estancias" : "Stay cleaning fees"}</dt>
              <dd>{money(report.cleaningFeeCents)}</dd>
            </div>
            <div>
              <dt>{es ? "Total ficticio" : "Fictitious total"}</dt>
              <dd>{money(report.totalCents)}</dd>
            </div>
          </dl>
        </article>
        <article className="panel">
          <Info size={20} />
          <h3>{es ? "Cómo se calcula" : "How it is calculated"}</h3>
          <p>
            {es
              ? "Se suman las estancias confirmadas de agosto de la colección que ves en Reservas. Las canceladas se excluyen. El filtro de propiedad se aplica a todas las cifras."
              : "We add up confirmed August stays from the collection shown in Bookings. Cancelled stays are excluded. The property filter applies to every figure."}
          </p>
          <p>
            {es
              ? "Ocupación = noches ocupadas ÷ noches disponibles. Estos importes son ejemplos; no representan cobros, facturas, impuestos desglosados ni resultados reales."
              : "Occupancy = occupied nights ÷ available nights. These amounts are examples; they are not payments, invoices, itemised taxes or real results."}
          </p>
        </article>
      </div>
    </div>
  );
}
