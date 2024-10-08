const origin = 'https://sound-buttons.click';
const cacheAssets = [
  {
    asset: '.well-known',
    regex: /^\.(well-known)/,
    ttl: 2592000,
  },
  {
    asset: 'image',
    regex: /^.*\.(jpg|jpeg|png|webp|gif|avif|svg|ico)$/,
    ttl: 2592000,
  },
  {
    asset: 'frontEnd',
    regex: /^.*\.(css|js|map)$/,
    ttl: 86400,
  },
  {
    asset: 'main.json',
    regex: /^\/assets\/configs\/main\.json$/,
    ttl: 86400,
  },
  {
    asset: 'json',
    regex: /^.*\.json$/,
    ttl: 3600,
  },
];

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (
      url.pathname.startsWith('/.well-known') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.map') ||
      url.pathname.startsWith('/assets')
    )
      return HandleStaticRequest(request);

    if (url.pathname.startsWith('/sitemap')) return GetSitemap(url);

    const parts = url.pathname.split('/');

    if (parts.length === 3 && parts[2] !== 'upload') {
      return HandleButtonRequest(request);
    } else {
      return HandlePageRequest(request);
    }
  },
};

async function HandleStaticRequest(request) {
  const url = new URL(request.url);
  const { asset, regex, ...cache } = cacheAssets.find(({ regex }) => url.pathname.match(regex)) ?? {
    ttl: 0,
  };

  const init = {
    cf: {
      cacheKey: `${url.hostname}${url.pathname}`,
      cacheTtlByStatus: {
        '100-199': 0,
        '200-299': cache.ttl,
        '300-399': 30,
        '400-499': 10,
        '500-599': 0,
      },
    },
  };

  console.log('Handle static request: ', request.url, cache.ttl);
  return fetch(request, init);
}

async function HandlePageRequest(request) {
  const userAgent = request.headers.get('User-Agent') || '';
  const isBot = userAgent.includes('bot') || userAgent.includes('InspectionTool');

  console.log('Handle page request: ', request.url);
  const response = await fetch(request);
  const headers = new Headers(response.headers);

  if (
    request.method !== 'GET' ||
    !headers.get('content-type')?.includes('text/html') ||
    new URL(request.url).pathname === '/'
  ) {
    console.log('Not HTML, or root path. Return original response.');
    return response;
  }

  let cache = isBot ? await caches.open('bot') : caches.default;
  let cacheResponse = await cache.match(request);
  if (cacheResponse) {
    console.log('Cache hit!');
    return cacheResponse;
  }

  let Title =
    'Sound Buttons - Vtuber voice button website with online YouTube audio clip submission.';
  let Description = '在 Vtuber 聲音按鈕網站上聽她說...';
  let Thumbnail = origin + '/assets/img/preview/open-graph.png';

  const found = new URL(request.url).pathname.match(/\/(\w+)\/?/);
  // root
  if (!found) {
    console.log('Not found (root page), return original response.');
    return response;
  }

  if (found) {
    const configUrl = new URL(`${origin}/assets/configs/main.json`);
    const configResponse = await fetch(configUrl);
    const configs = await configResponse.json();
    const config = configs.find((c) => c.name === found[1]);
    if (!config)
      return new Response('Not found.', {
        status: 404,
      });

    Title = `${config.fullName} | Sound Buttons - Vtuber voice button website with online YouTube audio clip submission.`;
    Description = `在 Vtuber 聲音按鈕網站上聽 ${config.fullName} 說...`;
    Thumbnail = `${origin}/assets/img/preview/open-graph.png`;
    const color = config.color.primary;
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
          element.after(`<meta content="${color}" name="theme-color">`, {
            html: true,
          });
        },
      })
      .on('link[rel="canonical"]', {
        element(element) {
          element.setAttribute('href', `${origin}/${found[1]}`);
        },
      })
      .on('meta[property="og:url"], meta[property="twitter:url"]', {
        element(element) {
          element.setAttribute('content', `${origin}/${found[1]}`);
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

    if (isBot) {
      rewriter.on('body', {
        element(e) {
          e.setInnerContent(
            `<a href="${origin}" target="_self">Please click here if the page does not redirect successfully.</a>`,
            {
              html: true,
            }
          );
        },
      });
    }

    let newResponse = rewriter.transform(response);
    console.log('Title: ', Title);
    console.log('Description: ', Description);
    console.log('Thumbnail: ', Thumbnail);

    if (response.status === 404) {
      newResponse = new Response(newResponse.body, {
        status: 200,
        statusText: 'OK',
        headers: newResponse.headers,
      });
    }

    await cache.put(request, newResponse.clone());
    console.log('Cache updated.');

    return newResponse;
  }
}

async function HandleButtonRequest(request) {
  const userAgent = request.headers.get('User-Agent') || '';
  const isBot = userAgent.includes('bot') || userAgent.includes('InspectionTool');

  console.log('Handle button request: ', request.url);
  const found = new URL(request.url).pathname.match(/\/(\w+)\/(.+)/);
  if (found) {
    const url = new URL(origin);
    url.pathname = `/${found[1]}`;
    const response = await fetch(`${url}`);

    let cache = isBot ? await caches.open('bot') : caches.default;
    let cacheResponse = await cache.match(request);
    if (cacheResponse) {
      console.log('Cache hit!');
      return cacheResponse;
    }

    const configUrl = new URL(
      `https://blob.sound-buttons.click/sound-buttons/${found[1]}/${found[1]}.json`
    );
    const configResponse = await fetch(configUrl);
    const config = await configResponse.json();
    if (!config) {
      return new Response('Not found. Redirect to homepage.', {
        status: 302,
        headers: {
          Location: `${url}`,
        },
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
        headers: {
          Location: `${url}`,
        },
      });
    }

    url.pathname += `/${id}`;

    const buttonName = button.text['zh-tw'] || button.text['ja'] || filename;
    filename = button.filename || filename;
    const imageUrl = config.imgSrc[0];
    const audioUrl = `https://blob.sound-buttons.click/sound-buttons/${found[1]}/${filename}`;
    const creator = '@' + config.link.twitter.match(/[^/]+$/)[0];
    const color = config.color.primary;

    // https://developers.cloudflare.com/workers/runtime-apis/html-rewriter
    const rewriter = new HTMLRewriter()
      .on('meta[property="og:type"]', {
        element(e) {
          e.setAttribute('content', 'video.other');
          // e.setAttribute('content', 'music.song');
          e.after(`<meta property="og:video" content="${audioUrl}">`, {
            html: true,
          });
          e.after(`<meta property="og:video:url" content="${audioUrl}">`, {
            html: true,
          });
          e.after(`<meta property="og:video:secure_url" content="${audioUrl}">`, {
            html: true,
          });
          e.after(
            '<meta property="og:video:type" content="video/other" /> <meta property="og:video:width" content="640"> <meta property="og:video:height" content="1024">',
            {
              html: true,
            }
          );

          e.after(`<meta name="twitter:player" content="${url}">`, {
            html: true,
          });
          e.after(
            '<meta name="twitter:player:width" content="640"> <meta name="twitter:player:height" content="1024">',
            {
              html: true,
            }
          );

          e.after(`<meta property="og:audio" content="${audioUrl}">`, {
            html: true,
          });
          e.after(`<meta property="og:audio:url" content="${audioUrl}">`, {
            html: true,
          });
          e.after(`<meta property="og:audio:secure_url" content="${audioUrl}">`, {
            html: true,
          });
          e.after('<meta property="og:audio:type" content="audio/vnd.facebook.bridge" />', {
            html: true,
          });
          e.after(`<meta content="${color}" name="theme-color">`, {
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
          e.setAttribute(
            'content',
            `${buttonName} | ${config.fullName} | Sound Buttons - Vtuber voice button website with online YouTube audio clip submission.`
          );
        },
      })
      .on('title', {
        element(e) {
          e.setInnerContent(
            `${buttonName} | ${config.fullName} | Sound Buttons - Vtuber voice button website with online YouTube audio clip submission.`
          );
        },
      })
      .on(
        'meta[property="og:description"], meta[name="description"], meta[property="og:image:alt"]',
        {
          element(e) {
            e.setAttribute(
              'content',
              `在 Vtuber 聲音按鈕網站上聽 ${config.fullName} 說: ${buttonName}`
            );
          },
        }
      )
      .on('meta[property="og:url"], meta[property="twitter:url"]', {
        element(element) {
          element.setAttribute('content', `${origin}/${found[1]}/${id}`);
        },
      });

    if (isBot) {
      rewriter.on('body', {
        element(e) {
          e.setInnerContent(
            `<a href="${origin}" target="_self">Please click here if the page does not redirect successfully.</a>`,
            {
              html: true,
            }
          );
        },
      });
    }

    let newResponse = rewriter.transform(response);
    console.log('UserAgent:', userAgent);
    console.log('ButtonName:', buttonName);
    console.log('Filename:', filename);
    console.log('Image:', imageUrl);
    console.log('URL:', url);
    console.log('Audio:', audioUrl);

    if (response.status === 404) {
      newResponse = new Response(newResponse.body, {
        status: 200,
        statusText: 'OK',
        headers: newResponse.headers,
      });
    }

    await cache.put(request, newResponse.clone());
    console.log('Cache updated.');

    return newResponse;
  } else {
    return new Response('Bad Request', {
      status: 400,
    });
  }
}

async function GetSitemap(url) {
  var url = new URL(url);
  const regex = new RegExp(origin + '/sitemap(?:-([a-zA-Z0-9_]+))?.xml', 'i');

  const match = url.toString().match(regex);
  if (!match) {
    return Response.redirect(`${url.origin}/sitemap.xml`, 302);
  }
  const id = match[1];

  console.log('Get sitemap id:', id);

  try {
    const configUrl = new URL(`${url.origin}/assets/configs/main.json`);
    const configResponse = await fetch(configUrl);
    const configs = await configResponse.json();

    return id ? await BuildSitemap(configs, id) : BuildSitemapIndex(configs);
  } catch (e) {
    console.error('Error:', e);
    throw e;
  }
}

async function BuildSitemap(configs, id) {
  console.log('Start to generate sitemap.');
  const head = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  const tail = `</urlset>`;

  const configUrl = new URL(`${origin}/${configs.find((c) => c.name === id).fullConfigURL}`);
  const configResponse = await fetch(configUrl);
  const fullConfig = await configResponse.json();
  console.log('Get config', fullConfig.name, fullConfig.buttonGroups.length);

  const groupButtonUrls = fullConfig.buttonGroups
    .map((group) =>
      group.buttons.map(
        (btn) => `${origin}/${fullConfig.name}/${encodeURI(btn.filename.replace(/\.[^/.]+$/, ''))}`
      )
    )
    .flat();
  var allUrls = [`${origin}/${fullConfig.name}`].concat(groupButtonUrls);
  console.log('Get urls', allUrls, allUrls.length);

  return new Response(
    head +
      allUrls
        .map(
          (url) => `  <url>
    <loc>${url}</loc>
  </url>`
        )
        .join('') +
      tail,
    {
      headers: {
        'content-type': 'application/xml;charset=UTF-8',
      },
    }
  );
}

function BuildSitemapIndex(configs) {
  console.log('Start to generate sitemap index.');
  const head = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  const tail = `</sitemapindex>`;

  let sitemaps = configs
    .map(
      (config) => `  <sitemap>
    <loc>${origin}/sitemap-${config.name}.xml</loc>
  </sitemap>
`
    )
    .join('');

  return new Response(head + sitemaps + tail, {
    headers: {
      'content-type': 'application/xml;charset=UTF-8',
    },
  });
}
