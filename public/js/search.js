let state = {
  advancedOptionsToggle: false
};

function showHideAdvancedOptions() {
  const advancedOptions = document.getElementById("advanced-options");
  const submit1 = document.getElementById("submit1");
  if (state.advancedOptions) {
    submit1.removeAttribute("hidden");
    advancedOptions.setAttribute("hidden", "");
    state.advancedOptions = false
  } else if (!state.advancedOptions) {
    submit1.setAttribute("hidden", "");
    advancedOptions.removeAttribute("hidden");
    state.advancedOptions = true
  }
}