const path = require('path');
const spawn = require('child_process').spawn;
const sane = require('sane');
const nsp = require('nsp');
const ui = require('../lib/ui');
const Command = require('../lib/command');
const assign = require('lodash/assign');

module.exports = Command.extend({

  description: "Run your app's test suite",

  params: [ 'files' ],

  flags: {
    environment: {
      description: 'The environment to run as, i.e. `production`; defaults to `test`',
      defaultValue: process.env.DENALI_ENV || process.env.NODE_ENV || 'test'
    },
    debug: {
      description: 'Run the server in debug mode (adds the --debug flag to node and launches node-inspector)',
      defaultValue: false
    },
    watch: {
      description: 'Re-run the tests when the source files change',
      defaultValue: null
    },
    grep: {
      description: 'Filter which tests run based on the supplied regex pattern',
      defaultValue: null
    },
    lint: {
      description: 'Lint the app source files',
      defaultValue: null
    },
    skipAudit: {
      description: 'Skip auditing your package.json for vulnerabilites',
      defaultValue: false
    }
  },

  runsInApp: true,

  run(params, flags) {
    if (flags.lint == null) {
      flags.lint = flags.environment !== 'production';
    }

    this.environment = assign({}, process.env);
    this.environment.PORT = flags.port;
    this.environment.DENALI_ENV = flags.environment;
    this.environment.NODE_ENV = flags.environment;

    this.files = [
      'test/*.js',
      'test/integration/**/*.js',
      'test/unit/**/*.js'
    ].concat(params.files);

    if (flags.debug) {
      this.debug = true;
      this.startNodeInspector();
    }

    if (flags.grep) {
      this.grep = flags.grep;
    }

    if (flags.skipAudit) {
      this.auditPackages();
    }

    if (flags.lint) {
      this.lint();
    }

    if (flags.watch) {
      this.startWatching();
    } else {
      this.runTests();
    }
  },

  startNodeInspector() {
    spawn(path.join('.', 'node_modules', '.bin', 'node-inspector'), [ '--web-port', '4000', '--no-preload' ]);
    ui.debug('Starting in debug mode. You can access the debugger at http://127.0.0.1:4000/?port=5858');
  },

  startWatching() {
    this.watcher = sane('.', { glob: [ '**/*.js' ] });
    this.watcher.on('ready', () => {
      this.runTests();
      this.tests.on('exit', (code) => {
        if (code === 0) {
          ui.success('Tests passed! (๑˃̵ᴗ˂̵)و');
        } else {
          ui.error('Tests failed! (▰˘︹˘▰)');
        }
        ui.info('Waiting for changes to re-run ...');
      });
    });
    this.watcher.on('change', this.restartServer.bind(this));
    this.watcher.on('add', this.restartServer.bind(this));
    this.watcher.on('delete', this.restartServer.bind(this));
  },

  runTests() {
    let args = this.files;
    args = args.concat([ '--colors' ]);
    if (this.grep) {
      args = args.concat([ '--grep', this.grep ]);
    }
    if (this.debug) {
      args.unshift('--debug-brk');
    }
    this.tests = spawn('mocha', args, {
      stdio: [ 'pipe', process.stdout, process.stderr ],
      env: this.environment
    });
  },

  restartServer() {
    if (this.tests) {
      this.tests.removeAllListeners('exit');
      this.tests.kill('SIGINT');
    }
    this.runTests();
  },

  auditPackages() {
    nsp.check({ package: path.resolve('package.json') }, (err, results) => {
      if (err && [ 'ENOTFOUND', 'ECONNRESET' ].includes(err.code)) {
        ui.warn('Error trying to scan package dependencies for vulnerabilities with nsp, skipping scan ...');
        ui.warn(err);
      }
      if (results && results.length > 0) {
        ui.warn('WARNING: Some packages in your package.json may have security vulnerabilities:');
        results.map(ui.warn.bind(ui));
      }
    });
  }

});