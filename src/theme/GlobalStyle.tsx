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
    @page { margin: 12mm; }

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

    /* Keep the wide stats table inside the printable page: shrink the type,
       tighten the cells, and let the text columns wrap instead of forcing a
       single nowrap line that runs off the paper. */
    .print-document table { font-size: 8px; }
    .print-document th,
    .print-document td {
      padding: 1px 3px !important;
      white-space: normal !important;
    }

    /* Alternating row tint for readability. The transparent-background rule
       above wins on specificity, so re-assert the fill more specifically and
       force backgrounds to render with print-color-adjust. */
    .print-document table {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-document tbody tr:nth-child(even) td {
      background: #f0f0f0 !important;
    }
  }
`;
