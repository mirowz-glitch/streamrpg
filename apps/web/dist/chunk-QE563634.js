// apps/web/src/lib/onboarding.ts
var PREFIX = "streamrpg_onboarding_";
function isFlagSet(flag) {
  return localStorage.getItem(PREFIX + flag) === "1";
}
var ONBOARDING_FLAG_EVENT = "streamrpg:onboarding-flag";
function setFlag(flag) {
  localStorage.setItem(PREFIX + flag, "1");
  window.dispatchEvent(new Event(ONBOARDING_FLAG_EVENT));
}
var FIRST_STEPS_PAGE_FLAGS = ["profile_seen", "city_seen", "ranking_seen", "world_seen"];
var FIRST_STEPS_TOTAL = FIRST_STEPS_PAGE_FLAGS.length + 1;
function countFirstStepsDone(totalMinutesWatched) {
  const pageDone = FIRST_STEPS_PAGE_FLAGS.filter(isFlagSet).length;
  return pageDone + (totalMinutesWatched > 0 ? 1 : 0);
}
var ELDRIN_STEP_KEY = `${PREFIX}eldrin_step`;
function getEldrinStep() {
  return Number(localStorage.getItem(ELDRIN_STEP_KEY) ?? 0);
}
function advanceEldrinStep() {
  localStorage.setItem(ELDRIN_STEP_KEY, String(getEldrinStep() + 1));
}

export {
  isFlagSet,
  ONBOARDING_FLAG_EVENT,
  setFlag,
  FIRST_STEPS_TOTAL,
  countFirstStepsDone,
  getEldrinStep,
  advanceEldrinStep
};
