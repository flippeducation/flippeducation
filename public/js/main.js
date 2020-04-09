"use strict";

/*
The following code is adapted from
the Responsive Horizontal-to-Vertical Menu code found at
<https://purecss.io/layouts/tucked-menu-vertical/>, which is
available under the zlib License as per <https://purecss.io/layouts/>.
*/
(function (window, document) {
  const menu = document.getElementById('menu');
  const menuItems = document.getElementById('menu-items');
  const WINDOW_CHANGE_EVENT = ('onorientationchange' in window) ? 'orientationchange':'resize';
  var rollBack;

  function toggleHorizontal() {
    menu.classList.remove('closing');
    [].forEach.call(
      document.getElementById('menu').querySelectorAll('.custom-can-transform'),
      function(el){
        el.classList.toggle('pure-menu-horizontal');
      }
    );
  }

  function toggleMenu() {
    // set timeout so that the panel has a chance to roll up
    // before the menu switches states
    if (menu.classList.contains('open')) {
      menu.classList.add('closing');
      rollBack = setTimeout(toggleHorizontal, 500);
    }
    else {
      if (menu.classList.contains('closing')) {
        clearTimeout(rollBack);
      } else {
        toggleHorizontal();
      }
    }
    menu.classList.toggle('open');
    menuItems.classList.toggle('open');
    document.getElementById('toggle').classList.toggle('x');
  }

  function closeMenu() {
    if (menu.classList.contains('open')) {
      toggleMenu();
    }
  }

  document.getElementById('toggle').addEventListener('click', function (e) {
    toggleMenu();
    e.preventDefault();
  });

  window.addEventListener(WINDOW_CHANGE_EVENT, closeMenu);
})(this, this.document);
/* End of Responsive Horizontal-to-Vertical Menu code. */
