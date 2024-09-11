export default [
  {
    context: ['/api', '/runtime'],
    target: 'http://localhost:7071',
    secure: false,
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyRes: function (proxyRes, req, res) {
      let body = '';

      if (proxyRes.headers.hasOwnProperty('location')) {
        proxyRes.headers['location'] = proxyRes.headers['location'].replace(
          'http://localhost:7071',
          'https://localhost:4200'
        );
      }

      proxyRes.on('data', (chunk) => {
        body += chunk;
      });

      proxyRes.on('end', () => {
        // 處理 JSON 響應體
        if (proxyRes.headers['content-type']?.includes('application/json')) {
          body = body.replace(/http:\/\/localhost:7071/g, 'https://localhost:4200');
        }

        // 將修改後的響應體寫回
        let chunks = [];
        let encoding = proxyRes.headers['content-encoding'];
        if (!encoding || encoding === 'identity') {
          chunks.push(Buffer.from(body));
        } else {
          chunks.push(Buffer.from(body, encoding));
        }

        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        chunks.forEach((chunk) => res.write(chunk));
        res.end();
      });
    },
  },
];
