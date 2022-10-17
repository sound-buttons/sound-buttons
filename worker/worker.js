export default {
  async fetch(request, env) {
    let cache = caches.default;
    let cacheResponse = await cache.match(request);
    if (!!cacheResponse) {
      return cacheResponse;
    }

    const response = await handleRequest(request).catch(
      (err) => new Response('Internal Server Error', { status: 500 })
      // (err) => new Response(err.stack, { status: 500 })
    );

    if (response.headers.status <= 299) cache.put(request, response);

    return response;
  },
};

async function handleRequest(request) {
  const found = new URL(request.url).pathname.match(/\/(\w+)\/(.+)/);
  if (found) {
    const url = new URL('https://sound-buttons.maki0419.com/');
    url.pathname = '/' + found[1];
    const searchParams = new URLSearchParams('filename=' + found[2]);
    const originalResponse = await fetch(`${url}?${searchParams}`);

    const configUrl = new URL(
      `https://soundbuttons.blob.core.windows.net/sound-buttons/${found[1]}/${found[1]}.json`
    );
    const configResponse = await fetch(configUrl);
    const config = await configResponse.json();
    let filename = decodeURI(found[2]);
    filename =
      filename.indexOf('.') >= 0
        ? filename.split('.').slice(0, -1).join('.') + '.webm'
        : filename + '.webm';

    let button;
    config.buttonGroups?.forEach((group) => {
      button ??= group.buttons.find((btn) => btn.filename === filename);
    });

    if (typeof button === 'undefined' || !button) {
      return new Response('', { status: 302, headers: { Location: `${url}?${searchParams}` } });
    }

    const buttonName = button.text['zh-tw'] || button.text['ja'] || filename;
    const imageUrl = config.imgSrc[0];

    // https://developers.cloudflare.com/workers/runtime-apis/html-rewriter
    return (
      new HTMLRewriter()
        // .on('head > meta', {
        //     element(e) {
        //         // get attributes to read tags
        //         // not all meta tags have a name and value
        //         let property = e.getAttribute('property');
        //         let content = e.getAttribute('content');
        //         console.log('property:', property, 'content:', content);
        //     },
        // })
        .on('head > meta[property="og:type"]', {
          element(e) {
            e.setAttribute('content', 'video.other');
            // e.setAttribute('content','music.song');
          },
        })
        .on('head', {
          element(e) {
            e.append(
              `<meta property="og:video" content="https://soundbuttons.blob.core.windows.net/sound-buttons/${found[1]}/${filename}">`,
              { html: true }
            );
            e.append(
              `<meta property="og:video:url" content="https://soundbuttons.blob.core.windows.net/sound-buttons/${found[1]}/${filename}">`,
              { html: true }
            );
            e.append(
              `<meta property="og:video:secure_url" content="https://soundbuttons.blob.core.windows.net/sound-buttons/${found[1]}/${filename}">`,
              { html: true }
            );
            e.append(
              '<meta property="og:video:type" content="video/other" /> <meta property="og:video:width" content="640"> <meta property="og:video:height" content="1024">',
              { html: true }
            );

            e.append(`<meta name="twitter:player" content="${url}?${searchParams}">`, {
              html: true,
            });
            e.append(
              '<meta name="twitter:player:width" content="800"> <meta name="twitter:player:height" content="800">',
              { html: true }
            );

            e.append(
              '<meta name="og:image:width" content="640"> <meta name="og:image:height" content="1024">',
              { html: true }
            );

            e.append(
              `<meta property="og:audio" content="https://soundbuttons.blob.core.windows.net/sound-buttons/${found[1]}/${filename}">`,
              { html: true }
            );
            e.append(
              `<meta property="og:audio:url" content="https://soundbuttons.blob.core.windows.net/sound-buttons/${found[1]}/${filename}">`,
              { html: true }
            );
            e.append(
              `<meta property="og:audio:secure_url" content="https://soundbuttons.blob.core.windows.net/sound-buttons/${found[1]}/${filename}">`,
              { html: true }
            );
            e.append('<meta property="og:audio:type" content="audio/vnd.facebook.bridge" />', {
              html: true,
            });
          },
        })
        .on('head > meta[property="og:image"], head > meta[name="twitter:image"]', {
          element(e) {
            e.setAttribute('content', imageUrl);
          },
        })
        .on('head > meta[name="twitter:card"]', {
          element(e) {
            e.setAttribute('content', 'player');
          },
        })
        .on('head > link[rel="image_src"]', {
          element(e) {
            e.setAttribute('href', imageUrl);
          },
        })
        .on('head > meta[property="og:title"]', {
          element(e) {
            e.setAttribute('content', buttonName);
          },
        })
        .on('head > title', {
          element(e) {
            e.setInnerContent(buttonName);
          },
        })
        .on('head > meta[property="og:description"], head > meta[name="description"]', {
          element(e) {
            e.setAttribute(
              'content',
              `在Vtuber聲音按鈕網站上聽 ${config.fullName} 說 ${buttonName}`
            );
          },
        })
        .on('body', {
          element(e) {
            e.append(
              `<script>window.onload = function() { location.href = "${url}?${searchParams}"; }</script>`,
              { html: true }
            );
          },
        })
        .transform(originalResponse)
    );
  } else {
    return new Response('Bad Request', { status: 400 });
  }
}
