export default {
  async fetch(request) {
    const url = new URL(request.url);

    return url.pathname === '/sitemap.txt'
      ? GetSitemap(url.origin)
      : url.origin === 'https://sound-buttons.click'
      ? handlePageRequest(request)
      : handleButtonRequest(request);
  },
};

async function handlePageRequest(request) {
  console.log('Handle page request: ', request.url);
  const response = await fetch(request);
  const headers = new Headers(response.headers);

  if (
    request.method !== 'GET' ||
    !response.ok ||
    !headers.get('content-type')?.includes('text/html') ||
    new URL(request.url).pathname === '/'
  ) {
    console.log('Not HTML, or not ok, or root path. Return original response.');
    return response;
  }

  let cache = caches.default;
  let cacheResponse = await cache.match(request);
  if (cacheResponse) {
    console.log('Cache hit!');
    return cacheResponse;
  }

  let Title = 'Sound Buttons';
  let Description = '在Vtuber聲音按鈕網站上聽她說...';
  let Thumbnail = 'https://sound-buttons.click/assets/img/preview/home-page.png';

  const found = new URL(request.url).pathname.match(/\/(\w+)\/?/);
  // root
  if (!found) {
    console.log('Not found (root page), return original response.');
    return response;
  }

  if (found) {
    const configUrl = new URL(`https://sound-buttons.click/assets/configs/main.json`);
    const configResponse = await fetch(configUrl);
    const configs = await configResponse.json();
    const config = configs.find((c) => c.name === found[1]);
    if (!config) return new Response('Not found.', { status: 404 });

    Title = `${config.fullName} | Sound Buttons`;
    Description = `在Vtuber聲音按鈕網站上聽 ${config.fullName} 說...`;
    Thumbnail = `https://sound-buttons.click/assets/img/preview/${found[1]}.png`;
    const rewriter = new HTMLRewriter()
      .on('title', {
        element(element) {
          element.setInnerContent(Title);
        },
      })
      .on('meta[name="title"], meta[property="og:title"], meta[property="twitter:title"]', {
        element(element) {
          element.setAttribute('content', Title);
        },
      })
      .on(
        'meta[name="description"], meta[property="og:description"], meta[property="twitter:description"], meta[property="og:image:alt"]',
        {
          element(element) {
            element.setAttribute('content', Description);
          },
        }
      )
      .on('meta[property="og:type"]', {
        element(element) {
          element.setAttribute('content', 'website');
        },
      })
      .on('link[rel="canonical"]', {
        element(element) {
          element.setAttribute('href', `https://sound-buttons.click/${found[1]}`);
        },
      })
      .on('meta[property="og:url"], meta[property="twitter:url"]', {
        element(element) {
          element.setAttribute('content', `https://sound-buttons.click/${found[1]}`);
        },
      })
      .on('meta[property="og:image"], meta[name="twitter:image"]', {
        element(element) {
          element.setAttribute('content', Thumbnail);
        },
      })
      .on('link[rel="image_src"]', {
        element(element) {
          element.setAttribute('href', Thumbnail);
        },
      })
      .on('meta[property="twitter:card"]', {
        element(element) {
          element.setAttribute('content', 'summary_large_image');
        },
      });

    const newResponse = rewriter.transform(response);
    console.log('Title: ', Title);
    console.log('Description: ', Description);
    console.log('Thumbnail: ', Thumbnail);

    if (response.status === 200) await cache.put(request, newResponse.clone());
    console.log('Cache updated.');

    return newResponse;
  }
}

async function handleButtonRequest(request) {
  console.log('Handle button request: ', request.url);
  const found = new URL(request.url).pathname.match(/\/(\w+)\/(.+)/);
  if (found) {
    const url = new URL('https://sound-buttons.click/');
    url.pathname = `/${found[1]}`;
    const response = await fetch(`${url}`);

    let cache = caches.default;
    let cacheResponse = await cache.match(request);
    if (cacheResponse) {
      console.log('Cache hit!');
      return cacheResponse;
    }

    const configUrl = new URL(
      `https://soundbuttons.blob.core.windows.net/sound-buttons/${found[1]}/${found[1]}.json`
    );
    const configResponse = await fetch(configUrl);
    const config = await configResponse.json();
    if (!config) {
      return new Response('Not found. Redirect to homepage.', {
        status: 302,
        headers: { Location: `${url}` },
      });
    }
    let id = decodeURI(found[2]);
    let filename = decodeURI(found[2]);
    filename =
      filename.indexOf('.') >= 0
        ? filename.split('.').slice(0, -1).join('.') + '.webm'
        : filename + '.webm';

    let button;
    config.buttonGroups?.forEach((group) => {
      button ??= group.buttons.find((btn) => btn.filename === filename);
      button ??= group.buttons.find((btn) => btn.id === id);
    });

    if (!button) {
      return new Response('Not found. Redirect to homepage.', {
        status: 302,
        headers: { Location: `${url}` },
      });
    }

    url.pathname += `/${id}`;

    const buttonName = button.text['zh-tw'] || button.text['ja'] || filename;
    filename = button.filename || filename;
    const imageUrl = config.imgSrc[0];
    const audioUrl = `https://soundbuttons.blob.core.windows.net/sound-buttons/${found[1]}/${filename}`;
    const creator = '@' + config.link.twitter.match(/[^/]+$/)[0];

    // https://developers.cloudflare.com/workers/runtime-apis/html-rewriter
    const rewriter = new HTMLRewriter()
      .on('meta[property="og:type"]', {
        element(e) {
          e.setAttribute('content', 'video.other');
          // e.setAttribute('content','music.song');
        },
      })
      .on('head', {
        element(e) {
          e.append(`<meta property="og:video" content="${audioUrl}">`, { html: true });
          e.append(`<meta property="og:video:url" content="${audioUrl}">`, { html: true });
          e.append(`<meta property="og:video:secure_url" content="${audioUrl}">`, { html: true });
          e.append(
            '<meta property="og:video:type" content="video/other" /> <meta property="og:video:width" content="640"> <meta property="og:video:height" content="1024">',
            { html: true }
          );

          e.append(`<meta name="twitter:player" content="${url}">`, {
            html: true,
          });
          e.append(
            '<meta name="twitter:player:width" content="640"> <meta name="twitter:player:height" content="1024">',
            { html: true }
          );

          e.append(`<meta property="og:audio" content="${audioUrl}">`, { html: true });
          e.append(`<meta property="og:audio:url" content="${audioUrl}">`, { html: true });
          e.append(`<meta property="og:audio:secure_url" content="${audioUrl}">`, { html: true });
          e.append('<meta property="og:audio:type" content="audio/vnd.facebook.bridge" />', {
            html: true,
          });
        },
      })
      .on('meta[property="og:image"], meta[name="twitter:image"]', {
        element(e) {
          e.setAttribute('content', imageUrl);
        },
      })
      .on('meta[property="og:image:width"]', {
        element(e) {
          e.setAttribute('content', '640');
        },
      })
      .on('meta[property="og:image:height"]', {
        element(e) {
          e.setAttribute('content', '1024');
        },
      })
      .on('link[rel="image_src"]', {
        element(e) {
          e.setAttribute('href', imageUrl);
        },
      })
      .on('meta[name="twitter:creator"]', {
        element(e) {
          e.setAttribute('content', creator);
        },
      })
      .on('meta[name="twitter:card"]', {
        element(e) {
          e.setAttribute('content', 'player');
        },
      })
      .on('meta[property="og:title"]', {
        element(e) {
          e.setAttribute('content', `${buttonName} | ${config.fullName} | Sound Buttons`);
        },
      })
      .on('title', {
        element(e) {
          e.setInnerContent(`${buttonName} | ${config.fullName} | Sound Buttons`);
        },
      })
      .on(
        'meta[property="og:description"], meta[name="description"], meta[property="og:image:alt"]',
        {
          element(e) {
            e.setAttribute(
              'content',
              `在Vtuber聲音按鈕網站上聽 ${config.fullName} 說 ${buttonName}`
            );
          },
        }
      )
      .on('link[rel="canonical"]', {
        element(element) {
          element.setAttribute('href', `https://button.sound-buttons.click/${creator}/${id}`);
        },
      })
      .on('meta[property="og:url"], meta[property="twitter:url"]', {
        element(element) {
          element.setAttribute('content', `https://button.sound-buttons.click/${creator}/${id}`);
        },
      })
      .on('body', {
        element(e) {
          e.append(`<script>window.onload = function() { location.href = "${url}"; }</script>`, {
            html: true,
          });
        },
      });

    const newResponse = rewriter.transform(response);
    console.log('ButtonName:', buttonName);
    console.log('Filename:', filename);
    console.log('Image:', imageUrl);
    console.log('URL:', url);
    console.log('Audio:', audioUrl);

    if (response.status === 200) await cache.put(request, newResponse.clone());
    console.log('Cache updated.');

    return newResponse;
  } else {
    return new Response('Bad Request', { status: 400 });
  }
}

async function GetSitemap(origin) {
  console.log('Start to generate sitemap');

  try {
    const configUrl = new URL(`https://sound-buttons.click/assets/configs/main.json`);
    const configResponse = await fetch(configUrl);
    const configs = await configResponse.json();

    const buttonUrls = await Promise.all(
      configs.map(async (config) => {
        const configUrl = new URL(`${origin}/${config.fullConfigURL}`);
        const configResponse = await fetch(configUrl);
        const fullConfig = await configResponse.json();

        const groupButtonUrls = fullConfig.buttonGroups.flatMap((group) =>
          group.buttons.map(
            (btn) => `https://button.sound-buttons.click/${fullConfig.name}/${btn.id}`
          )
        );

        console.log('Get config', fullConfig.name, fullConfig.buttonGroups.length);
        return groupButtonUrls;
      })
    );

    const allButtonUrls = buttonUrls.flat();
    const urls = configs.map((config) => `${origin}/${config.name}`).concat(allButtonUrls);
    const staticRoutes = `${origin}/\n`;

    return new Response(staticRoutes + urls.join('\n'), {
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
    });
  } catch (e) {
    console.error('Error:', e);
    throw e;
  }
}
