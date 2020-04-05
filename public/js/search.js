let state = {
  advancedOptionsToggle: false
};

function showHideAdvancedOptions() {
  const advancedOptions = document.getElementById("advanced-options");
  const submit1 = document.getElementById("submit1");
  const submit2 = document.getElementById("submit2");
  if (state.advancedOptions) {
    submit1.style.display =  "inline";
    submit2.style.display = "none";
    advancedOptions.style.display = "none";
    state.advancedOptions = false
  } else if (!state.advancedOptions) {
    submit1.style.display =  "none";
    submit2.style.display = "inline";
    advancedOptions.style.display = "block";
    state.advancedOptions = true
  }
}