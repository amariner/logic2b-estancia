import { describe, expect, it } from 'vitest';
import { EMAIL_ENQUIRY_DEFAULT_ID, EMAIL_ENQUIRY_DEMO, validateEmailEnquiryDemo } from './email-enquiry-demo';

describe('email enquiry demo contract', () => {
  it('keeps the same three complete scenarios in both languages', () => {
    expect(validateEmailEnquiryDemo()).toBe(true);
    expect(EMAIL_ENQUIRY_DEMO.es.scenarios.map(({ id }) => id)).toEqual(['city-break', 'family', 'long-stay']);
    expect(EMAIL_ENQUIRY_DEMO.en.scenarios.map(({ id }) => id)).toEqual(['city-break', 'family', 'long-stay']);
    expect(EMAIL_ENQUIRY_DEMO.es.scenarios.some(({ id }) => id === EMAIL_ENQUIRY_DEFAULT_ID)).toBe(true);
  });

  it('uses reserved example recipients and states the local boundary', () => {
    for (const locale of ['es', 'en'] as const) {
      const copy = EMAIL_ENQUIRY_DEMO[locale];
      expect(copy.recipient).toMatch(/@nivora\.example$/);
      expect(copy.boundary).toMatch(locale === 'es' ? /No recoge datos personales.*no envía ningún email.*no crea una reserva/i : /collects no personal data.*sends no email.*creates no booking/i);
    }
  });
});
