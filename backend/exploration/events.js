import { InputError, validateText } from '../validation.js';
import { explorationCareer } from './catalog.js';
const EVENTS = {
  view: 'career_viewed',
  search: 'career_searched',
  milestone: 'roadmap_milestone_expanded',
  resource: 'resource_opened',
  report: 'career_source_reported',
};
export function recordExploration(document, input) {
  if (
    !input ||
    !Object.hasOwn(EVENTS, input.action) ||
    (input.action !== 'search' && !explorationCareer(input.careerId))
  )
    throw new InputError('Choose a valid exploration event.');
  const at = new Date().toISOString();
  if (input.action === 'report') {
    const message = validateText(input.message, 'Content feedback', 1000, true);
    document.contentFeedback ??= [];
    if (document.contentFeedback.length >= 50) throw new InputError('Feedback limit reached.');
    document.contentFeedback.push({
      careerId: input.careerId,
      message,
      at,
      status: 'needs-review',
    });
  }
  document.productEvents ??= [];
  const last = document.productEvents.at(-1);
  if (
    last?.name === EVENTS[input.action] &&
    last.careerId === input.careerId &&
    Date.now() - new Date(last.at).getTime() < 10000 &&
    input.action !== 'report'
  )
    return;
  document.productEvents.push({ name: EVENTS[input.action], careerId: input.careerId, at });
  document.productEvents = document.productEvents.slice(-500);
}
