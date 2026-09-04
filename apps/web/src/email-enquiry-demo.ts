export type EmailEnquiryLocale = 'es' | 'en';

export const EMAIL_ENQUIRY_DEFAULT_ID = 'city-break';

interface EmailEnquiryScenario {
  id: string;
  choice: string;
  subject: string;
  sender: string;
  dates: string;
  guests: string;
  message: string;
}

interface EmailEnquiryCopy {
  ariaLabel: string;
  mode: string;
  intro: string;
  scenarioLabel: string;
  previewLabel: string;
  recipientLabel: string;
  recipient: string;
  senderLabel: string;
  datesLabel: string;
  guestsLabel: string;
  stayLabel: string;
  stay: string;
  boundary: string;
  reset: string;
  initialStatus: string;
  updatedStatus: string;
  resetStatus: string;
  scenarios: readonly EmailEnquiryScenario[];
}

export const EMAIL_ENQUIRY_DEMO = {
  es: {
    ariaLabel: 'Simulación local de una solicitud por email para Nivora One',
    mode: 'Simulación local · sin envío',
    intro: 'Elige uno de los tres casos ficticios para comprobar qué contexto podría recibir el alojamiento.',
    scenarioLabel: 'Escenarios ficticios de solicitud',
    previewLabel: 'Vista previa del email',
    recipientLabel: 'Para',
    recipient: 'reservas@nivora.example',
    senderLabel: 'De',
    datesLabel: 'Estancia',
    guestsLabel: 'Viajeros',
    stayLabel: 'Alojamiento',
    stay: 'Nivora One · fixture ficticio',
    boundary: 'Esta vista solo cambia en la memoria de tu navegador. No recoge datos personales, no envía ningún email, no consulta ni bloquea inventario y no crea una reserva. Recargar restaura el primer ejemplo.',
    reset: 'Restaurar ejemplo',
    initialStatus: 'Vista previa ficticia preparada. Nada se ha enviado.',
    updatedStatus: 'Vista previa actualizada localmente. Nada se ha enviado.',
    resetStatus: 'Ejemplo inicial restaurado. Nada se ha enviado.',
    scenarios: [
      {
        id: 'city-break', choice: 'Escapada urbana', subject: 'Consulta ficticia · escapada de 3 noches',
        sender: 'Marta · persona ficticia', dates: '16–19 abril 2027', guests: '2 huéspedes',
        message: 'Nos gustaría caminar la ciudad desde el apartamento y saber si la guía incluye mercados y rutas tranquilas.',
      },
      {
        id: 'family', choice: 'Viaje en familia', subject: 'Consulta ficticia · estancia familiar',
        sender: 'Álex · persona ficticia', dates: '7–12 junio 2027', guests: '2 adultos · 2 menores',
        message: 'Buscamos una estancia de cinco noches y queremos confirmar qué espacios de la casa aparecen en la web.',
      },
      {
        id: 'long-stay', choice: 'Estancia larga', subject: 'Consulta ficticia · 12 noches',
        sender: 'Noa · persona ficticia', dates: '3–15 septiembre 2027', guests: '1 huésped',
        message: 'La web encaja con una estancia tranquila. Querríamos conocer las condiciones antes de decidir el siguiente paso.',
      },
    ],
  },
  en: {
    ariaLabel: 'Local email enquiry simulation for Nivora One',
    mode: 'Local simulation · no delivery',
    intro: 'Choose one of three fictitious cases to see the context the property could receive.',
    scenarioLabel: 'Fictitious enquiry scenarios',
    previewLabel: 'Email preview',
    recipientLabel: 'To',
    recipient: 'bookings@nivora.example',
    senderLabel: 'From',
    datesLabel: 'Stay',
    guestsLabel: 'Guests',
    stayLabel: 'Property',
    stay: 'Nivora One · fictitious fixture',
    boundary: 'This preview only changes in your browser memory. It collects no personal data, sends no email, queries or holds no inventory and creates no booking. Reloading restores the first example.',
    reset: 'Restore example',
    initialStatus: 'Fictitious preview prepared. Nothing was sent.',
    updatedStatus: 'Preview updated locally. Nothing was sent.',
    resetStatus: 'Initial example restored. Nothing was sent.',
    scenarios: [
      {
        id: 'city-break', choice: 'City break', subject: 'Fictitious enquiry · 3-night city break',
        sender: 'Marta · fictitious person', dates: '16–19 April 2027', guests: '2 guests',
        message: 'We would like to walk the city from the apartment and know whether the guide includes markets and quiet routes.',
      },
      {
        id: 'family', choice: 'Family trip', subject: 'Fictitious enquiry · family stay',
        sender: 'Alex · fictitious person', dates: '7–12 June 2027', guests: '2 adults · 2 children',
        message: 'We are planning a five-night stay and want to confirm which parts of the apartment are shown on the website.',
      },
      {
        id: 'long-stay', choice: 'Long stay', subject: 'Fictitious enquiry · 12 nights',
        sender: 'Noa · fictitious person', dates: '3–15 September 2027', guests: '1 guest',
        message: 'The website feels right for a quiet stay. We would like to understand the conditions before deciding the next step.',
      },
    ],
  },
} as const satisfies Record<EmailEnquiryLocale, EmailEnquiryCopy>;

export function validateEmailEnquiryDemo(): true {
  const ids = EMAIL_ENQUIRY_DEMO.es.scenarios.map(({ id }) => id);
  if (!ids.includes(EMAIL_ENQUIRY_DEFAULT_ID) || new Set(ids).size !== ids.length) throw new Error('invalid_email_enquiry_scenarios');
  for (const locale of ['es', 'en'] as const) {
    const copy = EMAIL_ENQUIRY_DEMO[locale];
    if (copy.scenarios.map(({ id }) => id).join('|') !== ids.join('|')) throw new Error('unlocalized_email_enquiry_scenarios');
    if (!copy.recipient.endsWith('.example')) throw new Error('unsafe_email_enquiry_recipient');
    if (copy.scenarios.some((scenario) => Object.values(scenario).some((value) => !value.trim()))) throw new Error('incomplete_email_enquiry_scenario');
  }
  return true;
}

export function getEmailEnquiryDemo(locale: EmailEnquiryLocale): EmailEnquiryCopy {
  validateEmailEnquiryDemo();
  return EMAIL_ENQUIRY_DEMO[locale];
}
