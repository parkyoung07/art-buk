import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const workflowPaths = [
  '.github/workflows/daily-post.yml',
  '.github/workflows/deploy.yml',
  '.github/workflows/approve-and-deploy.yml',
];
const shellBodies = (source) => {
  const lines = source.split(/\r?\n/);
  const bodies = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(\s*)run:\s*(.*)$/);
    if (!match) continue;
    if (!['|', '>-', '>'].includes(match[2])) {
      bodies.push(match[2]);
      continue;
    }
    const indent = match[1].length;
    const block = [];
    while (++index < lines.length) {
      const nextIndent = lines[index].match(/^\s*/)[0].length;
      if (lines[index].trim() && nextIndent <= indent) {
        index -= 1;
        break;
      }
      block.push(lines[index]);
    }
    bodies.push(block.join('\n'));
  }
  return bodies;
};
const approvalScript = fileURLToPath(new URL('../scripts/approve-and-publish.mjs', import.meta.url));
const dailyScopeScript = fileURLToPath(new URL('../scripts/assert-daily-draft-scope.mjs', import.meta.url));
const deploymentMetadataScript = fileURLToPath(new URL('../scripts/verify-cloudflare-deployment.mjs', import.meta.url));

function makeApprovalFixture(draft) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'artbuk-approval-'));
  fs.mkdirSync(path.join(root, 'data/private'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src/content/drafts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data/private/content-drafts.json'), `${JSON.stringify([draft])}\n`);
  fs.writeFileSync(path.join(root, 'src/content/drafts', `${draft.id}.json`), `${JSON.stringify(draft)}\n`);
  return root;
}

function runApproval(root, args) {
  return spawnSync(process.execPath, [approvalScript, ...args], {
    env: { ...process.env, ARTBUK_ROOT_DIR: root },
    encoding: 'utf8',
  });
}

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function runFixtureApproval(root, draft) {
  const text = fs.readFileSync(path.join(root, 'src/content/drafts', `${draft.id}.json`), 'utf8');
  return runApproval(root, [
    '--phase=approve',
    `--id=${draft.id}`,
    `--expected-sha256=${sha256(text)}`,
  ]);
}

test('release workflows checkout main and verify its exact SHA before repository code', () => {
  const deploy = read('.github/workflows/deploy.yml');
  const approve = read('.github/workflows/approve-and-deploy.yml');

  for (const workflow of [deploy, approve]) {
    assert.match(workflow, /uses: actions\/checkout@v4/);
    assert.match(workflow, /uses: actions\/setup-node@v4/);
    assert.match(workflow, /ref: refs\/heads\/main/);
  }

  const approveCheckout = approve.indexOf('uses: actions/checkout@v4');
  const approveGuard = approve.indexOf('name: Verify checked-out main approval SHA');
  const approveSetup = approve.indexOf('uses: actions/setup-node@v4');
  assert.ok(approveCheckout >= 0 && approveGuard > approveCheckout && approveGuard < approveSetup);

  const deployCheckout = deploy.indexOf('uses: actions/checkout@v4');
  const deployGuard = deploy.indexOf('name: Verify checked-out main deployment SHA');
  const deploySetup = deploy.indexOf('uses: actions/setup-node@v4');
  assert.ok(deployCheckout >= 0 && deployGuard > deployCheckout && deployGuard < deploySetup);
  assert.match(deploy, /Manual deployments may only deploy current main/);
});

test('reusable deployment authorizes only the exact main workflow_ref', () => {
  const workflow = read('.github/workflows/deploy.yml');
  assert.match(workflow, /CALLER_WORKFLOW_REF:[^\n]*github\.workflow_ref/);
  assert.match(workflow, /github\.repository/);
  assert.match(workflow, /\.github\/workflows\/approve-and-deploy\.yml@refs\/heads\/main/);
  assert.doesNotMatch(workflow, /CALLER_WORKFLOW:[^\n]*github\.workflow(?:\s|$)/);
});

test('approval mutation is protected by production environment after validation', () => {
  const workflow = read('.github/workflows/approve-and-deploy.yml');
  const approveJob = workflow.slice(workflow.indexOf('  approve:'), workflow.indexOf('  deploy-approved:'));
  assert.match(approveJob, /environment:\s*production/);
  assert.match(approveJob, /APPROVAL_ACTOR:[^\n]*github\.actor/);
  assert.match(approveJob, /REPOSITORY_OWNER:[^\n]*github\.repository_owner/);
  assert.match(approveJob, /test "\$APPROVAL_ACTOR" = "\$REPOSITORY_OWNER"/);
  assert.ok(approveJob.indexOf('name: Validate approval inputs') < approveJob.indexOf('Move exactly one reviewed draft to approved'));
  assert.ok(approveJob.indexOf('name: Validate approval inputs') < approveJob.indexOf('git push origin HEAD:main'));
});

test('workflow expressions are never interpolated directly into shell commands', () => {
  for (const workflowPath of workflowPaths) {
    for (const body of shellBodies(read(workflowPath))) {
      assert.doesNotMatch(body, /\$\{\{/, `${workflowPath} interpolates an expression in shell`);
    }
  }
});

test('daily workflow only creates review-required drafts', () => {
  const workflow = read('.github/workflows/daily-post.yml');
  assert.doesNotMatch(workflow, /approve_post_trigger|approve-and-publish|Cloudflare|CLOUDFLARE/);
  assert.match(workflow, /generate-daily-draft\.mjs/);
  assert.match(workflow, /review_required/);
  assert.match(workflow, /assert-daily-draft-scope\.mjs --snapshot/);
  assert.match(workflow, /assert-daily-draft-scope\.mjs --verify/);
  assert.match(workflow, /--untracked-files=all|assert-daily-draft-scope/);
});

test('daily scope gate rejects untracked files outside the matching new draft', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'artbuk-daily-scope-'));
  fs.mkdirSync(path.join(root, 'data/private'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src/content/drafts'), { recursive: true });
  const oldDraft = { id: '2026-10-14-am', status: 'published' };
  fs.writeFileSync(path.join(root, 'data/private/content-drafts.json'), JSON.stringify([oldDraft]));
  fs.writeFileSync(path.join(root, 'src/content/drafts/2026-10-14-am.json'), JSON.stringify(oldDraft));
  for (const args of [['init'], ['config', 'user.email', 'test@example.com'], ['config', 'user.name', 'Test'], ['add', '.'], ['commit', '-m', 'base']]) {
    assert.equal(spawnSync('git', args, { cwd: root }).status, 0);
  }
  const snapshot = path.join(root, 'before.json');
  assert.equal(spawnSync(process.execPath, [dailyScopeScript, `--snapshot=${snapshot}`], { cwd: root }).status, 0);
  const newDraft = { id: '2026-10-15-am', status: 'review_required' };
  fs.writeFileSync(path.join(root, 'data/private/content-drafts.json'), JSON.stringify([oldDraft, newDraft]));
  fs.writeFileSync(path.join(root, 'src/content/drafts/2026-10-15-am.json'), JSON.stringify(newDraft));
  fs.writeFileSync(path.join(root, 'unexpected.txt'), 'not allowed');
  const result = spawnSync(process.execPath, [dailyScopeScript, `--verify=${snapshot}`], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /Unexpected changed files.*unexpected\.txt/s);
});

test('production deployment is explicit and never push- or schedule-triggered', () => {
  const workflow = read('.github/workflows/deploy.yml');
  assert.doesNotMatch(workflow, /^\s*push:/m);
  assert.doesNotMatch(workflow, /^\s*schedule:/m);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /--branch=main/);
  assert.match(workflow, /https:\/\/nadriai\.com/);
});

test('manual deployment requires an exact SHA and explicit confirmation', () => {
  const workflow = read('.github/workflows/deploy.yml');
  assert.match(workflow, /confirmation:[\s\S]*required:\s*true/);
  assert.match(workflow, /EVENT_NAME:[^\n]*github\.event_name/);
  assert.match(workflow, /\^\[0-9a-f\]\{40\}\$/);
  assert.match(workflow, /DEPLOY \$EXPECTED_SHA/);
  assert.match(workflow, /test "\$ACTOR" = "\$REPOSITORY_OWNER"/);
  assert.match(workflow, /CALLER_WORKFLOW_REF:[^\n]*github\.workflow_ref/);
});

test('private endpoint probes cover GET and harmless invalid POST with closed statuses', () => {
  const workflow = read('.github/workflows/deploy.yml');
  const privateProbe = workflow.match(/verify_private\(\) \{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.match(privateProbe, /for method in GET POST/);
  assert.match(privateProbe, /--request "\$method"/);
  assert.match(privateProbe, /Content-Type: application\/json/);
  assert.match(privateProbe, /\{\"invalid\":true\}/);
  assert.match(privateProbe, /\^\(404\|405\|410\)\$/);
});

test('Cloudflare deployment metadata gate rejects a mismatched commit SHA', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'artbuk-cf-meta-'));
  const file = path.join(root, 'deployments.json');
  fs.writeFileSync(file, JSON.stringify([{
    id: '11111111-1111-4111-8111-111111111111',
    url: 'https://11111111.art-buk.pages.dev',
    environment: 'preview',
    latest_stage: { status: 'success' },
    deployment_trigger: { metadata: { commit_hash: 'a'.repeat(40) } },
    created_on: '2026-10-15T00:00:00Z',
  }]));
  const result = spawnSync(process.execPath, [deploymentMetadataScript, `--file=${file}`, '--environment=preview', `--sha=${'b'.repeat(40)}`], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /No successful preview deployment matches/);
});

test('Cloudflare prior deployment metadata includes the exact rollback SHA', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'artbuk-cf-prior-'));
  const file = path.join(root, 'deployments.json');
  const output = path.join(root, 'outputs.txt');
  const sha = 'c'.repeat(40);
  fs.writeFileSync(file, JSON.stringify([{
    id: '22222222-2222-4222-8222-222222222222',
    url: 'https://22222222.art-buk.pages.dev',
    environment: 'production',
    latest_stage: { status: 'success' },
    deployment_trigger: { metadata: { commit_hash: sha } },
    created_on: '2026-10-15T00:00:00Z',
  }]));
  const result = spawnSync(process.execPath, [deploymentMetadataScript, `--file=${file}`, '--environment=production', '--prefix=prior', '--latest'], {
    env: { ...process.env, GITHUB_OUTPUT: output }, encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(fs.readFileSync(output, 'utf8'), new RegExp(`prior_deployed_sha=${sha}`));
});

test('deployment verifies Preview then Production and can roll back post-switch failure', () => {
  const workflow = read('.github/workflows/deploy.yml');
  const approval = read('.github/workflows/approve-and-deploy.yml');
  const daily = read('.github/workflows/daily-post.yml');
  const preview = workflow.indexOf('--environment preview');
  const production = workflow.indexOf('--branch=main');
  assert.ok(preview >= 0 && production > preview);
  assert.match(workflow, /verify-cloudflare-deployment\.mjs[\s\S]*--environment=preview/);
  assert.match(workflow, /verify-cloudflare-deployment\.mjs[\s\S]*--environment=production/);
  assert.match(workflow, /deployments\/\$prior_deployment_id\/rollback/);
  assert.match(workflow, /out\/deployment-marker\.txt/);
  assert.match(workflow, /verify_deployment_marker/);
  assert.match(workflow, /prior_deployed_sha/);
  assert.ok(workflow.indexOf("verify_deployment_marker 'https://nadriai.com'") > workflow.indexOf('/rollback'));
  assert.match(workflow, /for private_path in \/data\/content-drafts\.json \/api\/admin\/drafts/);
  assert.match(workflow, /curl -sS -L/);
  const privateProbe = workflow.match(/verify_private\(\) \{([\s\S]*?)\n\s*\}/)?.[1] || '';
  assert.doesNotMatch(privateProbe, /\|\| true/);
  assert.match(privateProbe, /\^\(404\|405\|410\)\$/);
  assert.ok(workflow.indexOf('switched=1') < workflow.indexOf('npx wrangler pages deploy out --project-name=art-buk --branch=main'));
  assert.match(workflow, /prior_deployment_id:/);
  assert.match(approval, /recover-production:[\s\S]*needs\.deploy-approved\.outputs\.prior_deployment_id[\s\S]*\/rollback/);
  assert.match(approval, /CURRENT_MAIN_SHA[\s\S]*CANDIDATE_SHA[\s\S]*skipping rollback/);
  assert.doesNotMatch(approval, /deploy-final-state:/);
  assert.match(daily, /concurrency:[\s\S]*group:\s*production-release/);
  assert.match(workflow, /deployment_id:/);
  assert.match(workflow, /deployment_url:/);
  assert.ok(workflow.lastIndexOf('verified_at=') > workflow.indexOf('Verify custom domain'));
});

test('approval workflow requires exact draft identity and digest', () => {
  const workflow = read('.github/workflows/approve-and-deploy.yml');
  assert.match(workflow, /draft_id:/);
  assert.match(workflow, /expected_draft_sha256:/);
  assert.match(workflow, /expected_main_sha:/);
  assert.match(workflow, /concurrency:[\s\S]*production-release/);
  assert.match(read('.github/workflows/deploy.yml'), /environment:\s*production/);
  assert.match(workflow, /public\/data\/search-index\.json/);
  assert.match(workflow, /public\/search-index\.json/);
  assert.match(workflow, /public\/rss\.xml/);
  assert.match(workflow, /public\/feed\.xml/);
  assert.doesNotMatch(workflow, /public\/sitemap\.xml/);
  assert.match(workflow, /needs\.deploy-approved\.outputs\.deployment_id/);
  assert.match(workflow, /needs\.deploy-approved\.outputs\.deployment_url/);
  assert.match(workflow, /needs\.deploy-approved\.outputs\.verified_at/);
  assert.match(workflow, /test "\$DEPLOYED_SHA" = "\$CANDIDATE_SHA"/);
});

test('approval script has no git, cloudflare, or notification side effects', () => {
  const script = read('scripts/approve-and-publish.mjs');
  assert.doesNotMatch(script, /git (add|commit|push|pull)|wrangler|sendTelegramMessage/);
  assert.match(script, /required\("phase"\)/);
  assert.match(script, /review_required/);
  assert.match(script, /approved/);
  assert.match(script, /published/);
  const telegram = read('scripts/telegram-bot.mjs');
  assert.doesNotMatch(telegram, /exec\(`?node scripts\/approve-and-publish/);
  assert.match(telegram, /approve-and-deploy\.yml/);
});

test('approval script rejects unsafe draft IDs before resolving a file path', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'artbuk-approval-id-'));
  const result = runApproval(root, [
    '--phase=approve',
    '--id=../../outside',
    `--expected-sha256=${'a'.repeat(64)}`,
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /Invalid draft ID/);
});

test('approval script rejects invalid draft dates before writing a post', () => {
  const draft = {
    id: '2026-10-15-am',
    date: '../../outside',
    slug: 'safe-slug',
    status: 'review_required',
  };
  const root = makeApprovalFixture(draft);
  const result = runFixtureApproval(root, draft);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /Invalid draft date/);
  assert.equal(fs.existsSync(path.join(root, 'outside-safe-slug.md')), false);
});

test('approval script rejects impossible calendar dates', () => {
  const draft = {
    id: '2026-02-31-am',
    date: '2026-02-31',
    slug: 'safe-slug',
    status: 'review_required',
  };
  const root = makeApprovalFixture(draft);
  const result = runFixtureApproval(root, draft);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /Invalid draft date/);
});

test('approval script rejects unsafe slugs and keeps writes under the posts root', () => {
  const draft = {
    id: '2026-10-15-pm',
    date: '2026-10-15',
    slug: '../../../outside',
    status: 'review_required',
  };
  const root = makeApprovalFixture(draft);
  const result = runFixtureApproval(root, draft);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /Invalid draft slug/);
  assert.equal(fs.existsSync(path.join(root, 'outside.md')), false);
});

test('finalize requires verified Cloudflare deployment metadata', () => {
  const draft = {
    id: '2026-10-15-am',
    date: '2026-10-15',
    slug: 'safe-slug',
    status: 'approved',
    approvalDigest: 'a'.repeat(64),
  };
  const root = makeApprovalFixture(draft);
  const result = runApproval(root, [
    '--phase=finalize',
    `--id=${draft.id}`,
    `--expected-sha256=${draft.approvalDigest}`,
    `--deployed-sha=${'b'.repeat(40)}`,
    '--live-url=https://nadriai.com/blog/2026-10-15-safe-slug/',
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /deployment-id/);
  const after = JSON.parse(fs.readFileSync(path.join(root, 'data/private/content-drafts.json')))[0];
  assert.equal(after.status, 'approved');
});

test('static output strips unpublished draft payloads', () => {
  const script = read('scripts/sanitize-static-output.mjs');
  assert.match(script, /content-drafts\.json/);
  assert.match(script, /ARTBUK_ROOT_DIR/);
  assert.equal(fs.existsSync(new URL('../public/data/content-drafts.json', import.meta.url)), false);
  assert.equal(fs.existsSync(new URL('../data/private/content-drafts.json', import.meta.url)), true);
});

test('static output gate fails if an unpublished draft ID is bundled', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'artbuk-static-gate-'));
  fs.mkdirSync(path.join(root, 'data/private'), { recursive: true });
  fs.mkdirSync(path.join(root, 'out'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data/private/content-drafts.json'), JSON.stringify([{ id: 'private-draft-id', status: 'review_required' }]));
  fs.writeFileSync(path.join(root, 'out/index.html'), '<p>private-draft-id</p>');
  const scriptPath = fileURLToPath(new URL('../scripts/sanitize-static-output.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [scriptPath], {
    env: { ...process.env, ARTBUK_ROOT_DIR: root },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /Unpublished draft leaked/);
});

test('production admin route is fail-closed and approvals use GitHub Actions', async () => {
  const page = read('src/app/admin/content-review/page.tsx');
  const api = read('functions/api/admin/drafts.js');
  assert.doesNotMatch(page, /VALID_PASSWORDS|nadri2026|artbuk_admin_auth/);
  assert.match(page, /localhost/);
  assert.match(page, /review_required/);
  assert.match(page, /compareDraftsNewestFirst/);
  assert.match(page, /approve-and-deploy\.yml/);
  assert.doesNotMatch(api, /ASSETS\.fetch|Draft updated in session/);
  const handlers = await import('../functions/api/admin/drafts.js');
  assert.equal((await handlers.onRequestGet()).status, 410);
  assert.equal((await handlers.onRequestPost()).status, 405);
});

test('no production admin page embeds a client-side credential', () => {
  for (const path of [
    'src/app/admin/page.tsx',
    'src/app/admin/images/page.tsx',
    'src/app/admin/image-review/page.tsx',
    'src/app/admin/content-review/page.tsx',
  ]) {
    const source = read(path);
    assert.doesNotMatch(source, /NEXT_PUBLIC_ADMIN_PASSWORD|nadri2026|artbuk_admin_auth/);
  }
});
