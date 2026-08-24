const SITE_URL = "https://statuscode.app";
const SITE_NAME = "statuscode.app";

export function renderPage(title: string, description: string, contentHtml: string): string {
  return `<html lang="en">
  <head>
    <title>${title}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description}">
    <link rel="canonical" href="${SITE_URL}/" />
    <link rel="icon" href="/favicon.ico" />

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${SITE_URL}/">

    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">

    <link rel="stylesheet" href="/app.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css" integrity="sha512-bm684OXnsiNuQSyrxuuwo4PHqr3OzxPpXyhT66DA/fhl73e1JmBxRKGnO/nRwWvOZxJLRCmNH7FII+Yn1JNPmg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  </head>
  <body class="mx-auto max-w-4xl p-4">

    <div class="">
      <div class="markdown-body">
        ${contentHtml}
      </div>
    </div>

  </body>
</html>`;
}
