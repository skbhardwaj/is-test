(function () {
  const NAV_DATA_URL = "/datastore/navdata.json";
  const CLASSES = {
    openCTA: "btn-open",

    sliderCol: "slider-column",
    sliderOverlay: "slider-overlay",
    sliderClose: "slider-close",
    sliderContent: "slider-content",

    accToggle: "accordion-toggle",
    accList: "accordion-list",

    navLink: "nav-link",

    active: "active",
    bold: "bold",
  };
  const SELECTORS = {
    sliderCol: "." + CLASSES.sliderCol,
    sliderOverlay: "." + CLASSES.sliderOverlay,
    accToggle: "." + CLASSES.accToggle,
    accList: "." + CLASSES.accList,
    navLink: "." + CLASSES.navLink,
  };
  const qs = function (selector) {
    return document.querySelector(selector);
  };
  const tmpl = function (tmplStr, obj) {
    return tmplStr.replace(/{{(.*?)}}/g, function (match, key) {
      return obj[key] !== undefined ? obj[key] : "";
    });
  };
  const siblings = function (elem, selector) {
    return elem.parentNode.querySelector(selector);
  };
  const remove = function (elem) {
    elem.parentNode.removeChild(elem);
  };
  const closest = function (el, selector, stopSelector) {
    var retval = null;
    while (el) {
      if (el.matches(selector)) {
        retval = el;
        break;
      } else if (stopSelector && el.matches(stopSelector)) {
        break;
      }
      el = el.parentElement;
    }
    return retval;
  };

  let tplContent;

  // close existing accordion panels
  function closeIfOpened(ul, currentEl) {
    const actives = ul.querySelectorAll(SELECTORS.accToggle + ".active");
    if (actives.length)
      for (let i = 0, len = actives.length; i < len; i++) {
        const thisActive = actives[i];
        if (!thisActive.isSameNode(currentEl)) {
          thisActive.classList.remove("active");
          thisActive.textContent = "+";
        }
      }
  }

  // toggle accordions
  function toggleAcc(e) {
    const pList = closest(e.target, SELECTORS.accList);
    closeIfOpened(pList, e.target);

    const isOpen = e.target.classList.contains(CLASSES.active);
    e.target.textContent = isOpen ? "+" : "-";
    e.target.classList.toggle(CLASSES.active, !isOpen);
    e.target.setAttribute("title", isOpen ? "expand" : "collapse");
  }

  // toggle slider/drawer view
  function toggleSlider(openFlag) {
    qs(SELECTORS.sliderCol).classList.toggle(CLASSES.active, openFlag);
    qs(SELECTORS.sliderOverlay).classList.toggle(CLASSES.active, openFlag);

    if (!openFlag) {
      closeIfOpened(qs(".ul-0"));
    }
  }

  // recursive function to create the navigation
  function createNav(data, ul) {
    if (!data.children.length) return;

    // create
    data.children.map(function (obj, index) {
      obj["index"] = index;
      const result = tmpl(tplContent.innerHTML, obj);
      ul.innerHTML += result;

      const id = "" + obj.depth + index;
      const newUl = ul.querySelector(".ul-" + id);

      if (obj.children.length) {
        createNav(obj, newUl);
      } else {
        siblings(newUl, SELECTORS.navLink).classList.remove(CLASSES.bold);
        remove(siblings(newUl, SELECTORS.accToggle));
        remove(newUl);
      }
    });
  }

  // get nav links data
  function getNavData() {
    if ("fetch" in window) {
      fetch(NAV_DATA_URL)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return createNav(data, qs(".ul-0"));
        });
    } else {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200)
          createNav(JSON.parse(xhttp.responseText), qs(".ul-0"));
      };
      xhttp.open("GET", NAV_DATA_URL, true);
      xhttp.send();
    }
  }

  // cache the variables
  function cacheVars() {
    tplContent = qs("#depth");
  }

  // bind the events to elements
  function bindEvents() {
    // add event listeners
    qs("body").addEventListener(
      "click",
      function (e) {
        const classList = e.target.classList;
        // open CTA click listener
        if (classList.contains(CLASSES.openCTA)) toggleSlider(true);
        else if (classList.contains(CLASSES.sliderOverlay)) toggleSlider(false);
        else if (classList.contains(CLASSES.sliderClose)) toggleSlider(false);
        else if (classList.contains(CLASSES.accToggle)) toggleAcc(e);
      },
      true
    );
  }

  // main initialise function
  function init() {
    cacheVars();
    bindEvents();
    getNavData();
  }

  init();
})();
