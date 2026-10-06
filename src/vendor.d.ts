// Dichiarazioni per pacchetti senza tipi
declare module 'mjml-browser' {
  const mjml2html: (mjml: string, opts?: Record<string, unknown>) => { html: string; errors: unknown[] };
  export default mjml2html;
}

declare module 'grapesjs/locale/it' {
  const messages: Record<string, unknown>;
  export default messages;
}
