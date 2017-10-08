const test = require('tape');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const bump = require('../index');
const inc = require('../index').inc;

const writeFile = fs.writeFile;

const fixturePaths = [
  path.join(__dirname, 'fixtures/2spaces.json'),
  path.join(__dirname, 'fixtures/4spaces.json'),
  path.join(__dirname, 'fixtures/tabs.json'),
  path.join(__dirname, 'fixtures/pre.json')
];

const fixtures = fixturePaths.map(fixturePath => fs.readFileSync(fixturePath, 'utf8'));

test('inc', t => {
  t.equal(inc('1.0.0', 'patch', 'beta'), '1.0.1');
  t.equal(inc('1.0.0', 'minor', 'beta'), '1.1.0');
  t.equal(inc('1.0.0', 'major', 'beta'), '2.0.0');
  t.equal(inc('1.0.0', 'prepatch', 'beta'), '1.0.1-beta.0');
  t.equal(inc('1.0.0', 'preminor', 'beta'), '1.1.0-beta.0');
  t.equal(inc('1.0.0', 'premajor', 'beta'), '2.0.0-beta.0');
  t.equal(inc('1.0.0', 'prerelease', 'beta'), '1.0.1-beta.0');
  t.equal(inc('1.0.0', 'pre', 'beta'), '1.0.0-beta.0');
  t.equal(inc('1.0.0-alpha.0', 'prerelease'), '1.0.0-alpha.1');
  t.equal(inc('1.0.0-alpha.0', 'prerelease', 'alpha'), '1.0.0-alpha.1');
  t.equal(inc('1.0.0-alpha.0', 'prerelease', 'alpha'), '1.0.0-alpha.1');
  t.equal(inc('1.0.0-alpha.0', 'prerelease', 'beta'), '1.0.0-beta.0');
  t.equal(inc('2.0.0-beta.0', 'major'), '2.0.0');
  t.equal(inc('2.0.0-beta.0'), '2.0.0');
  t.end();
});

test('indentation', t => {
  t.plan(2);

  bump(fixturePaths[1]).then(result => {
    const content = fs.readFileSync(fixturePaths[1], 'utf8');
    t.equal(content, '{\n    "version": "1.0.1"\n}\n');
  });

  bump(fixturePaths[2]).then(result => {
    const content = fs.readFileSync(fixturePaths[2], 'utf8');
    t.equal(content, '{\n\t"version": "1.0.1"\n}\n');
  });
});

test('bump', t => {
  t.plan(6);
  fs.writeFile = (file, data, cb) => cb(null);

  bump(fixturePaths[0]).then(result => {
    t.equal(result.version, '1.0.1');
  });

  bump(fixturePaths[0], { increment: 'patch' }).then(result => {
    t.equal(result.version, '1.0.1');
  });

  bump(fixturePaths[0], { increment: 'premajor', preId: 'alpha' }).then(result => {
    t.equal(result.version, '2.0.0-alpha.0');
  });

  bump(fixturePaths[0], 'minor').then(result => {
    t.equal(result.version, '1.1.0');
  });

  bump(fixturePaths[0], { increment: '1.2.3' }).then(result => {
    t.equal(result.version, '1.2.3');
  });

  bump(fixturePaths[3], { increment: 'prerelease' }).then(result => {
    t.equal(result.version, '1.0.0-alpha.1');
  });
});

test('invalid bump', t => {
  t.plan(2);

  bump(fixturePaths[0], 'foo').catch(err => {
    t.ok(/invalid increment value/i.test(err.message));
  });

  bump(fixturePaths[0], '1.0').catch(err => {
    t.ok(/invalid increment value/i.test(err.message));
  });
});

test('get/set', t => {
  const get = o => o.version;
  const set = (o, v) => (o.version = v);
  bump(fixturePaths[0], { get: get, set: set }).then(result => {
    t.equal(result.version, '1.0.1');
    t.end();
  });
});

test('cleanup', t => {
  fixturePaths.forEach((fixturePath, i) => fs.writeFileSync(fixturePath, fixtures[i], 'utf8'));
  fs.writeFile = writeFile;
  t.end();
});
