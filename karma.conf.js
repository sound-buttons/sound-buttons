// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/sound-buttons'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'json-summary' },
      ],
      // Behaviour-preservation gate: the suite must keep meaningful coverage so a
      // regression in observable behaviour is caught. The global floor is the 70%
      // target; behaviour-critical units carry stricter per-file floors via
      // `each.overrides`.
      check: {
        global: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
        each: {
          overrides: {
            'src/app/sound-buttons/context-menu/context-menu.component.ts': {
              statements: 90,
              branches: 75,
              functions: 90,
              lines: 90,
            },
            'src/app/services/share.service.ts': {
              statements: 90,
              branches: 60,
              functions: 90,
              lines: 90,
            },
            'src/app/services/audio.service.ts': {
              statements: 85,
              branches: 70,
              functions: 85,
              lines: 85,
            },
            'src/app/services/config.service.ts': {
              statements: 80,
              branches: 60,
              functions: 80,
              lines: 80,
            },
            'src/app/upload/upload.component.ts': {
              statements: 80,
              branches: 60,
              functions: 80,
              lines: 80,
            },
          },
        },
      },
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    customLaunchers: {
      // Headless launcher for CI and sandboxed/immutable environments
      // (e.g. Fedora Kinoite). Resolves the browser binary from process.env.CHROME_BIN,
      // so a Chromium-only host can run the suite without Google Chrome installed.
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--headless'],
      },
    },
    singleRun: false,
    restartOnFileChange: true,
  });
};
