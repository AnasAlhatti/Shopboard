import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Exercise real commits in a disposable repository; never stage or commit the
// user's working tree while testing the hook.
const project = process.cwd();
const output = path.resolve('output/quality');
await mkdir(output, { recursive: true });
const fixture = await mkdtemp(path.join(output, 'hook-check-'));
const git = (...args) =>
  spawnSync(
    'git',
    [
      '-c',
      `safe.directory=${fixture.replaceAll('\\', '/')}`,
      '-c',
      'user.name=ShopBoard Hook Verification',
      '-c',
      'user.email=hook-check@example.invalid',
      ...args,
    ],
    { cwd: fixture, encoding: 'utf8' },
  );
const runNode = (...args) =>
  spawnSync(process.execPath, args, {
    cwd: fixture,
    encoding: 'utf8',
    env: { ...process.env, HUSKY: '1' },
  });
const check = (result, label) =>
  assert.equal(result.status, 0, `${label}\n${result.stdout}\n${result.stderr}`);
check(git('init', '--template='), 'Initialize isolated test repository');
const projectPackage = JSON.parse(await readFile(path.join(project, 'package.json'), 'utf8'));
await writeFile(
  path.join(fixture, 'package.json'),
  JSON.stringify(
    {
      private: true,
      type: 'module',
      'lint-staged': projectPackage['lint-staged'],
    },
    null,
    2,
  ),
);
await mkdir(path.join(fixture, '.husky'));
await mkdir(path.join(fixture, 'src'));
for (const file of ['eslint.config.js', '.prettierrc.json', '.husky/pre-commit']) {
  await copyFile(path.join(project, file), path.join(fixture, file));
}
const huskyPackage = JSON.parse(
  await readFile(path.join(project, 'node_modules/husky/package.json'), 'utf8'),
);
check(
  runNode(path.join(project, 'node_modules/husky', huskyPackage.bin.husky)),
  'Install real Husky hook',
);
await writeFile(path.join(fixture, 'src/fixture.js'), 'export const answer={value:42}\n');
check(git('add', '.'), 'Stage deliberately unformatted fixture');
const formattedCommit = git('commit', '-m', 'Verify automatic formatting');
check(formattedCommit, 'Pre-commit should fix formatting and allow valid code');
assert.match(git('show', 'HEAD:src/fixture.js').stdout, /export const answer = \{ value: 42 \};/);
console.log('PASS real pre-commit hook: bad formatting was fixed in the committed file');
const before = git('rev-parse', 'HEAD').stdout.trim();
await writeFile(path.join(fixture, 'src/fixture.js'), 'export const answer = missingValue;\n');
check(git('add', 'src/fixture.js'), 'Stage deliberate lint error');
const blockedCommit = git('commit', '-m', 'This commit must be blocked');
assert.notEqual(blockedCommit.status, 0, 'A lint error must reject the commit');
assert.match(`${blockedCommit.stdout}\n${blockedCommit.stderr}`, /no-undef/);
assert.equal(
  git('rev-parse', 'HEAD').stdout.trim(),
  before,
  'Rejected commit must not change HEAD',
);
console.log(
  'PASS real pre-commit hook: ESLint no-undef blocked the commit and HEAD did not change',
);
await writeFile(
  path.join(output, 'hook-results.json'),
  JSON.stringify(
    {
      automaticFormatting: true,
      lintErrorBlocksCommit: true,
      fixture,
      successfulCommitOutput: `${formattedCommit.stdout}\n${formattedCommit.stderr}`,
      blockedCommitOutput: `${blockedCommit.stdout}\n${blockedCommit.stderr}`,
    },
    null,
    2,
  ),
);
