"use client";

const THEME_INIT_SCRIPT = `(function(){try{var val=localStorage.getItem('ansh-expense-ui');if(val){var parsed=JSON.parse(val);if(parsed&&parsed.state){var appearance=parsed.state.appearance;var accent=parsed.state.accentTheme;if(appearance==='dark'){document.documentElement.classList.add('dark');}if(accent){document.documentElement.setAttribute('data-accent',accent);}}}}catch(e){}})();`;

export function ThemeInitScript() {
  // React 19 does not allow <script> in client component trees during hydration.
  // The script only needs to exist in the SSR HTML so the browser runs it before paint.
  if (typeof window !== "undefined") {
    return null;
  }

  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
