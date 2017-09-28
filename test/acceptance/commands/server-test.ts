/* tslint:disable:completed-docs no-empty no-invalid-this member-access */
import test from 'ava';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import { execSync as run } from 'child_process';
import { CommandAcceptanceTest } from 'denali-cli';
import * as tmp from 'tmp';

function linkDependency(pkgDir: string, dependencyName: string, dependencyDir: string) {
  let dest = path.join(pkgDir, 'node_modules', dependencyName);
  // use fs-extra
  mkdirp.sync(path.dirname(dest));
  rimraf.sync(dest);
  fs.symlinkSync(dependencyDir, dest);
}

test('launches a server', async (t) => {
  let server = new CommandAcceptanceTest('server --port 3001', { name: 'server-command' });

  return server.spawn({
    failOnStderr: true,
    env: {
      DEBUG: null
    },
    checkOutput(stdout) {
      let started = stdout.indexOf('dummy@0.0.0 server up') > -1;
      if (started) {
        t.pass();
      }
      return started;
    }
  });
});

test('launches a server based on the dummy app in an addon', async (t) => {
  // Generate a new, blank addon. Do it outisde our normal tmp folder so that
  // we don't hit problems with the addon blueprint thinking it's inside an
  // existing project
  let denaliBin = path.join(process.cwd(), 'node_modules', 'denali-cli', 'dist', 'bin', 'denali');
  let dir = tmp.dirSync({
    unsafeCleanup: true,
    prefix: `denali-server-command-launches-dummy-app-from-inside-addon-`
  }).name;
  await run(`${ denaliBin } addon my-denali-addon`, { cwd: dir });
  dir = path.join(dir, 'my-denali-addon');

  // Use local copies of denali-cli and denali, not whatever npm installed. Copy,
  // don't symlink, Denali itself. If it was symlinked, the addon would try to build
  // Denali itself, which hits concurrency issues as other tests might be trying
  // to access the built files as they are removed by the addon for rebuild. Copying
  // Denali itself means the addon won't try to build it, and even if it does, will
  // build it's own copy
  linkDependency(dir, 'denali-cli', path.join(process.cwd(), 'node_modules', 'denali-cli'));
  fs.removeSync(path.join(dir, 'node_modules', 'denali'));
  fs.copySync(process.cwd(), path.join(dir, 'node_modules', 'denali'));

  let server = new CommandAcceptanceTest('server --port 3002', {
    dir,
    populateWithDummy: false
  });

  return server.spawn({
    failOnStderr: true,
    checkOutput(stdout, stderr) {
      let started = stdout.indexOf('dummy@0.0.0 server up') > -1;
      if (started) {
        t.pass();
      }
      return started;
    }
  });
});
