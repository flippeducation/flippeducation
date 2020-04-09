"use strict";

let state = {
  advancedOptionsToggle: false
};

window.onload = function hideOnLoad() {
  const advancedOptions = document.getElementById("advanced-options");
  advancedOptions.style.visibility = "hidden";
};

function showHideAdvancedOptions() {
  const advancedOptions = document.getElementById("advanced-options");
  const submit1 = document.getElementById("submit1");
  if (state.advancedOptions) {
    submit1.style.visibility = "visible";
    advancedOptions.style.visibility = "hidden";
    state.advancedOptions = false
  } else if (!state.advancedOptions) {
    submit1.style.visibility = "hidden";
    advancedOptions.style.visibility = "visible";
    state.advancedOptions = true
  }
}