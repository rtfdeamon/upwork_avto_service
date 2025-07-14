import jsonLogic from 'json-logic-js';

export function validate(logic: string | undefined) {
  if (!logic) return;
  try {
    jsonLogic.apply(JSON.parse(logic), {});
  } catch (err) {
    throw new Error('Invalid jsonLogic');
  }
}
