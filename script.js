/* ==========================================================================
   Login Template — Lógica de interacción
   --------------------------------------------------------------------------
   Sin dependencias externas. Se encarga de:
     1. Validar email y contraseña de forma inline (no solo al hacer submit).
     2. Alternar la visibilidad de la contraseña (ojo).
     3. Gestionar el envío del formulario y mostrar el estado (cargando / ok).
     4. Autenticación demo con dos usuarios integrados.
     5. Redirigir a `hola.html` tras login exitoso.
     6. Exponer una API simple y reutilizable en `window.LoginForm`.

   Cómo reutilizarlo / conectarlo a tu backend:
     const login = window.LoginForm.init({
       onSuccess: ({ email, remember }) => { ... },  // haz aquí tu fetch()
       onError:   (message) => { ... }
     });

   Si se omite `onSuccess`, el login usa la autenticación demo local.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
   * Usuarios de demo integrados
   * ---------------------------------------------------------------------- */
  const DEMO_USERS = [
    {
      email: "demo@dorado.com",
      password: "123456",
      label: "Usuario demo",
    },
    {
      email: "admin@dorado.com",
      password: "admin123",
      label: "Admin demo",
    },
  ];

  /* ------------------------------------------------------------------------
   * Utilidades
   * ---------------------------------------------------------------------- */

  // Valida una dirección de email con una expresión regular sencilla.
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* ------------------------------------------------------------------------
   * Instanciación de un formulario de login.
   * Devuelve un objeto con métodos para controlar el form desde fuera.
   * ---------------------------------------------------------------------- */
  function createLoginForm(root, options = {}) {
    const form = root;
    const emailInput = form.querySelector('[name="email"]');
    const passwordInput = form.querySelector('[name="password"]');
    const emailError = form.querySelector("#email-error");
    const passwordError = form.querySelector("#password-error");
    const submitBtn = form.querySelector("[data-submit]");
    const statusEl = form.querySelector("[data-login-status]");
    const toggleBtn = form.querySelector("[data-toggle-password]");

    /* ----------------------------------
     * Validación y feedback por campo
     * --------------------------------- */

    // Valida el email y pinta el error + estado aria-invalid en el input.
    function validateEmail() {
      const value = emailInput.value.trim();
      const valid = value.length > 0 && isValidEmail(value);
      setFieldState(emailInput, emailError, valid, "Introduce un correo válido.");
      return valid;
    }

    // Valida que la contraseña no esté vacía (mínimo opcional de 6 caracteres).
    function validatePassword() {
      const value = passwordInput.value;
      const valid = value.length > 0;
      setFieldState(passwordInput, passwordError, valid, "Introduce tu contraseña.");
      return valid;
    }

    // Aplica o limpia el estado de error de un campo y su mensaje asociado.
    function setFieldState(input, errorEl, valid, message) {
      if (valid) {
        input.removeAttribute("aria-invalid");
        errorEl.textContent = "";
      } else {
        input.setAttribute("aria-invalid", "true");
        errorEl.textContent = message;
      }
    }

    // Valida un campo en el momento en que el usuario lo abandona (blur).
    // Solo muestra error si ya escribió algo, para no abrumar al empezar.
    function validateOnBlur(validator) {
      return function () {
        if (this.value.length > 0) validator();
      };
    }

    /* ----------------------------------
     * Estado global del formulario
     * --------------------------------- */

    // Elimina cualquier mensaje global anterior.
    function clearStatus() {
      statusEl.textContent = "";
      statusEl.classList.remove("form__status--error", "form__status--success");
    }

    // Muestra un mensaje global (éxito o error).
    function setStatus(message, type) {
      statusEl.textContent = message;
      statusEl.classList.remove("form__status--error", "form__status--success");
      if (type === "error") {
        statusEl.classList.add("form__status--error");
      } else {
        statusEl.classList.add("form__status--success");
      }
    }

    // Pone el botón en estado "cargando" (spinner + deshabilitado).
    function setLoading(isLoading) {
      if (isLoading) {
        submitBtn.classList.add("button--loading");
        submitBtn.disabled = true;
      } else {
        submitBtn.classList.remove("button--loading");
        submitBtn.disabled = false;
      }
    }

    /* ----------------------------------
     * Acciones principales
     * --------------------------------- */

    // Muestra/oculta la contraseña y mantiene aria-label/pressed actualizados.
    function togglePassword() {
      const isVisible = passwordInput.type === "text";
      passwordInput.type = isVisible ? "password" : "text";
      toggleBtn.classList.toggle("field__toggle--visible", !isVisible);
      toggleBtn.setAttribute("aria-pressed", String(!isVisible));
      toggleBtn.setAttribute(
        "aria-label",
        !isVisible ? "Mostrar contraseña" : "Ocultar contraseña"
      );
    }

    // Intenta autenticar con los usuarios de demo integrados.
    function attemptDemoLogin() {
      const emailOk = validateEmail();
      const passwordOk = validatePassword();
      if (!emailOk || !passwordOk) return false;

      const email = emailInput.value.trim();
      const user = DEMO_USERS.find(
        (u) => u.email === email && u.password === passwordInput.value
      );

      if (user) {
        // Login exitoso: mostrar estado y redirigir
        setStatus("Sesión iniciada correctamente.", "success");
        setLoading(true);
        window.setTimeout(() => {
          window.location.href = "hola.html";
        }, 800);
        return true;
      }

      // Credenciales incorrectas
      setStatus("Credenciales incorrectas. Inténtalo de nuevo.", "error");
      form.classList.add("form--error-shake");
      window.setTimeout(() => {
        form.classList.remove("form--error-shake");
      }, 450);
      return false;
    }

    // Envía el formulario: valida todo, y si es válido, llama a onSuccess
    // o, en su defecto, intenta el login demo.
    function handleSubmit(event) {
      event.preventDefault();
      clearStatus();

      const result = attemptDemoLogin();
      if (result) return; // login demo manejado internamente

      // Si no coincidió con el demo, caemos al comportamiento externo o demo simulado.
      // Si el usuario provee onSubmit externo, usamos ese.
      if (typeof options.onSubmit === "function") {
        Promise.resolve()
          .then(() => setLoading(true))
          .then(() => options.onSubmit(payload))
          .then((msg) => {
            setLoading(false);
            setStatus(msg || "Sesión iniciada correctamente.", "success");
          })
          .catch((err) => {
            setLoading(false);
            setStatus(err && err.message ? err.message : String(err), "error");
          });
        return;
      }

      // Comportamiento de demo (solo frontend): simula una pequeña espera
      // solo si el usuario no usó credenciales demo.
      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        setStatus("Sesión iniciada correctamente.", "success");
      }, 800);
    }

    /* ----------------------------------
     * Registro de eventos
     * --------------------------------- */

    form.addEventListener("submit", handleSubmit);
    toggleBtn.addEventListener("click", togglePassword);
    emailInput.addEventListener("blur", validateOnBlur(validateEmail));
    passwordInput.addEventListener("blur", validateOnBlur(validatePassword));
    // Limpia el error mientras el usuario corrige el campo.
    emailInput.addEventListener("input", () => {
      if (emailInput.hasAttribute("aria-invalid")) {
        emailInput.removeAttribute("aria-invalid");
        emailError.textContent = "";
      }
    });
    passwordInput.addEventListener("input", () => {
      if (passwordInput.hasAttribute("aria-invalid")) {
        passwordInput.removeAttribute("aria-invalid");
        passwordError.textContent = "";
      }
    });

    // API pública para controlar este formulario desde fuera.
    return {
      form,
      reset() {
        form.reset();
        clearStatus();
        setLoading(false);
        emailInput.removeAttribute("aria-invalid");
        passwordInput.removeAttribute("aria-invalid");
        emailError.textContent = "";
        passwordError.textContent = "";
      },
    };
  }

  /* ------------------------------------------------------------------------
   * Punto de entrada global.
   * - init(selector, options): inicializa un formulario concreto.
   * - autoInit(): inicializa todos los formularios `[data-login-form]`.
   * ---------------------------------------------------------------------- */
  const LoginForm = {
    init(selector, options = {}) {
      const root = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!root) return null;
      return createLoginForm(root, options);
    },

    autoInit() {
      const instances = [];
      document.querySelectorAll("[data-login-form]").forEach((el) => {
        instances.push(createLoginForm(el, {}));
      });
      return instances;
    },
  };

  // Expone la API de forma global para reutilización.
  window.LoginForm = LoginForm;

  // Inicializa automáticamente todos los formularios de la página al cargar.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", LoginForm.autoInit);
  } else {
    LoginForm.autoInit();
  }
})();