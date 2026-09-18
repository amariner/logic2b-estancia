import type { Locale } from '@logic-estancia/config';
import { COMMERCIAL_TOUR_STEP_IDS, type CommercialTourStepId } from './commercial-tour';
import { PLAN_HANDOFF_SOURCES, getPlanCards, planHandoffHref, type PlanHandoffSegment, type PlanHandoffSource, type AssessmentNeed } from './plan-contract';

/** Only closed product context crosses the commercial journey. Never forward the query string. */
export function parseTourEntry(params: URLSearchParams, locale: Locale) {
  const step = params.get('step');
  const segment = params.get('segment');
  const source = params.get('sourcePath');
  return {
    step: COMMERCIAL_TOUR_STEP_IDS.find((id) => id === step) ?? 'brand-web',
    segment: (['rural', 'apartments', 'hotels'].includes(segment ?? '') ? segment : 'unknown') as PlanHandoffSegment,
    sourcePath: PLAN_HANDOFF_SOURCES.find((path) => path === source) ?? (locale === 'en' ? '/en/journey/' : '/recorrido/'),
  };
}

export function tourAssessmentHref(locale: Locale, step: CommercialTourStepId, sourcePath: PlanHandoffSource, segment: PlanHandoffSegment = 'unknown') {
  const planId = step === 'brand-web' ? 'basico' : step === 'enquiries' || step === 'planning' ? 'gestion' : 'inteligente';
  const plan = getPlanCards(locale).find(({ id }) => id === planId)!;
  const needs: Partial<Record<CommercialTourStepId, AssessmentNeed>> = { enquiries: 'enquiries', planning: 'planning', preparation: 'cleaning', operations: 'metrics' };
  return planHandoffHref(locale, plan, sourcePath, segment, needs[step]);
}
