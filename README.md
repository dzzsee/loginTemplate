# Login Template

Plantilla de pantalla de **inicio de sesión** reutilizable, construida con tres archivos (HTML, CSS y JavaScript) y sin dependencias externas. De diseño tipo "vidrio" (Apple), con soporte automático de tema claro/oscuro, accesibilidad y validación inline.

## Estructura de archivos

```
loginTemplate/
├── index.html   # Estructura semántica y accesible del formulario
├── styles.css   # Diseño y temas (variables CSS personalizables)
└── script.js    # Validación, interacción y API reutilizable
```

## Cómo usarlo

1. Abre `index.html` en un navegador. Verás la pantalla de login funcionando.
2. Para integrarlo en tu proyecto, copia los tres archivos junto a tu página.

No necesitas instalar nada: todo corre en el navegador.

## Personalización rápida

### Cambiar colores, radios y tipografía
Todas las decisiones de diseño viven en variables CSS dentro de `:root` en `styles.css`. Edita ahí, sin tocar el resto:

```css
:root {
  --accent: #0a84ff;        /* color principal del botón */
  --accent-pressed: #0066cc;
  --radius-card: 24px;      /* radio de la tarjeta */
  --radius-input: 12px;     /* radio de los campos */
  --font-family: system-ui, ...;
  /* ... */
}
```

### Cambiar textos
Edita los textos directamente en `index.html` (título, subtítulo, placeholders, enlaces).

### Conectar a tu backend
`script.js` expone una API global `window.LoginForm`. En lugar del comportamiento de demo (que solo valida y simula una espera), pasa un manejador `onSubmit`:

```js
const login = window.LoginForm.init('[data-login-form]', {
  onSubmit: async ({ email, password, remember }) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember }),
    });
    if (!res.ok) throw new Error('Credenciales incorrectas');
    return 'Bienvenido'; // mensaje de éxito opcional
  },
});
```

- Si `onSubmit` **resuelve**, se muestra éxito; si **lanza un error**, se muestra como mensaje de error.
- Si **omites** `onSubmit`, el formulario solo valida en el frontend (modo demo).

### Métodos disponibles

| Método | Descripción |
| --- | --- |
| `LoginForm.init(selector, options)` | Inicializa un formulario concreto y devuelve su instancia. |
| `LoginForm.autoInit()` | Inicializa todos los formularios con `[data-login-form]`. |
| `instancia.reset()` | Limpia campos, errores y estado del formulario. |

`init` acepta tanto un selector CSS (`"#mi-form"`) como un elemento DOM.

## Accesibilidad incluida

- Etiquetas `<label>` asociadas a cada campo.
- Mensajes de error anunciados con `aria-live`.
- Estado inválido marcado con `aria-invalid`.
- Botón de contraseña con `aria-label` y `aria-pressed`.
- Foco visible en todos los controles (`focus-visible`).
- Respeto a `prefers-reduced-motion` y `prefers-reduced-transparency`.

## Validación

- **Email**: formato válido (regex simple). Se valida al salir del campo (`blur`) y al enviar.
- **Contraseña**: no vacía. Se valida al salir del campo y al enviar.
- Los mensajes de error se limpian automáticamente al corregir el campo.