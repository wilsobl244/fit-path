
(() => {
  const SESSION = "fitpathDemoSession";
  const PROFILE = "fitpathDemoProfile";

  function read(store,key) {
    try {return JSON.parse(store.getItem(key));}
    catch {return null;}
  }

  function session() {
    return read(sessionStorage,SESSION) || read(localStorage,SESSION);
  }

  function signOut() {
    sessionStorage.removeItem(SESSION);
    localStorage.removeItem(SESSION);
    location.href = "login.html";
  }

  if (!document.body.classList.contains("fp-auth")) {
    const nav = document.querySelector(".navbar nav");
    if (!nav || document.querySelector(".fp-account-link")) return;

    const current = session();
    const link = document.createElement("a");
    link.className = "fp-account-link";
    link.href = "login.html";

    link.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg><span></span>';

    link.querySelector("span").textContent =
      current ? "Sign out" : "Sign in";

    if (current) link.addEventListener("click",e => {
      e.preventDefault();
      signOut();
    });

    nav.append(link);
    return;
  }

  const $ = id => document.getElementById(id);
  const register = document.body.dataset.mode === "register";
  const form = $("fp-form");

  function theme() {
    const dark = localStorage.getItem("fitpathTheme") === "dark";
    document.body.classList.toggle("fp-dark",dark);
    $("fp-theme").setAttribute("aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode");
  }

  theme();

  $("fp-theme").addEventListener("click",() => {
    localStorage.setItem("fitpathTheme",
      document.body.classList.contains("fp-dark") ? "light" : "dark");
    theme();
  });

  document.querySelectorAll("[data-password]").forEach(button => {
    button.addEventListener("click",() => {
      const input = $(button.dataset.password);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-pressed",String(show));
      button.setAttribute("aria-label",show ? "Hide password" : "Show password");
    });
  });

  function error(id,message) {
    $(id+"-error").textContent = message;
    $(id).setAttribute("aria-invalid",message ? "true" : "false");
  }

  function status(message) {
    $("fp-status").textContent = message;
  }

  form.querySelectorAll("input").forEach(input => {
    input.addEventListener("input",() => {
      if ($(input.id+"-error")) error(input.id,"");
      status("");
    });
  });

  if (register) {
    $("password").addEventListener("input",() => {
      const p = $("password").value;
      const score = [
        p.length >= 8,
        p.length >= 12,
        /[A-Z]/.test(p) && /[a-z]/.test(p),
        /[0-9]/.test(p),
        /[^A-Za-z0-9]/.test(p)
      ].filter(Boolean).length;

      $("fp-strength-bar").style.width = (p ? Math.max(10,score*20) : 0)+"%";
      $("fp-strength-label").textContent = !p ? "Password strength" :
        score < 2 ? "Weak password" :
        score < 4 ? "Moderate password" : "Strong password";
    });
  } else {
    $("fp-forgot").addEventListener("click",() => {
      status("Password recovery is not connected to a server in this prototype. You can create a new demo account or continue as a guest.");
    });

    const profile = read(localStorage,PROFILE);
    if (profile) $("email").value = profile.email;
  }

  form.addEventListener("submit",e => {
    e.preventDefault();

    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;
    const invalid = [];

    function validate(id,message) {
      error(id,message);
      if (message) invalid.push(id);
    }

    if (register) {
      validate("name",$("name").value.trim().length < 2
        ? "Please enter your name." : "");
    }

    validate("email",!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Enter a valid email address." : "");

    validate("password",password.length < 8
      ? "Enter at least 8 characters." : "");

    if (register) {
      validate("confirm",$("confirm").value !== password
        ? "Your passwords do not match." : "");
    }

    if (invalid.length) {
      status("Please review the highlighted fields.");
      $(invalid[0]).focus();
      return;
    }

    const existing = read(localStorage,PROFILE);

    const profile = {
      name:register ? $("name").value.trim() :
        existing && existing.email === email ? existing.name : email.split("@")[0],
      email:email
    };

    if (register) {
      localStorage.setItem(PROFILE,JSON.stringify(profile));
    }

    localStorage.removeItem(SESSION);
    sessionStorage.removeItem(SESSION);

    const store = !register && $("remember").checked
      ? localStorage : sessionStorage;

    store.setItem(SESSION,JSON.stringify(profile));

    status(register ? "Your demo account is ready." : "Signed in to your demo session.");

    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    button.textContent = "Opening your workspace...";

    setTimeout(() => {
      location.href = register ? "setup.html" : "index.html";
    },650);
  });
})();

/* FITPATH AUTH ENHANCEMENTS V2 */
(() => {
  if (!document.body.classList.contains("fp-auth")) return;

  const eyeOpen =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';

  const eyeClosed =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 18 18M10.5 10.5a2 2 0 0 0 3 3M9.8 5.2A12 12 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-3 3.5M6 6.5A20 20 0 0 0 2 12s4 7 10 7a10 10 0 0 0 4-.8"/></svg>';

  document.querySelectorAll("[data-password]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.password);
      if (!input) return;
      button.innerHTML = input.type === "text" ? eyeClosed : eyeOpen;
    });
  });

  const password = document.getElementById("password");
  const bar = document.getElementById("fp-strength-bar");
  const label = document.getElementById("fp-strength-label");

  if (password && bar && label) {
    password.addEventListener("input", () => {
      const value = password.value;
      const score = [
        value.length >= 8,
        value.length >= 12,
        /[A-Z]/.test(value) && /[a-z]/.test(value),
        /[0-9]/.test(value),
        /[^A-Za-z0-9]/.test(value)
      ].filter(Boolean).length;

      bar.style.width = value ? Math.max(10, score*20) + "%" : "0%";

      if (!value) {
        label.textContent = "Use at least 8 characters";
        bar.style.background = "var(--a-accent)";
      } else if (value.length < 8 || score < 2) {
        label.textContent = "Weak password - keep going";
        bar.style.background = "#d47d8d";
      } else if (score < 4) {
        label.textContent = "Moderate password";
        bar.style.background = "#c49a61";
      } else {
        label.textContent = "Strong password";
        bar.style.background = "var(--a-accent)";
      }
    });
  }
})();
/* END AUTH ENHANCEMENTS V2 */
