import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Oswald:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; }
  body {
    font-family: ${({ theme }) => theme.font.body};
    color: ${({ theme }) => theme.color.text.strong};
    background: ${({ theme }) => theme.color.bg.base};
    min-height: 100dvh;
  }
  button { font-family: inherit; cursor: pointer; }
  a { color: inherit; }

  @media print {
    body { background: #ffffff; color: #000000; }
    .no-print { display: none !important; }

    /* Ink-saving light mode: force the document to crisp monochrome,
       overriding the app's dark themed colors. */
    .print-document,
    .print-document * {
      color: #000000 !important;
      background: transparent !important;
    }
    .print-document th,
    .print-document td {
      border-color: #888888 !important;
    }
  }
`;
