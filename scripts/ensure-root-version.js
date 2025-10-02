#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

(function main() {
  try {
    const repoRoot = path.join(__dirname, '..');
    process.chdir(repoRoot);

    const targetPath = path.join(repoRoot, 'root.json');
    if (!fs.existsSync(targetPath)) {
      return;
    }

    const stagedFiles = execSync('git diff --name-only --cached -- root.json', {
      encoding: 'utf8',
    }).trim();

    if (!stagedFiles) {
      return;
    }

    const currentRaw = fs.readFileSync(targetPath, 'utf8');
    const currentJson = JSON.parse(currentRaw);
    ensureVersionField(currentJson);

    const previousJson = readPreviousVersion();
    if (!previousJson) {
      // Nothing to compare yet (first commit or file newly created)
      persistIfMutated(targetPath, currentJson, currentRaw);
      return;
    }

    const reposChanged = hasReposChanged(previousJson, currentJson);
    if (!reposChanged) {
      return;
    }

    if (previousJson.version !== currentJson.version) {
      return;
    }

    const newVersion = bumpPatchVersion(currentJson.version);
    currentJson.version = newVersion;

    persistIfMutated(targetPath, currentJson, currentRaw);

    execSync('git add root.json', { stdio: 'ignore' });
    console.log(`root.repos alterado → versão atualizada automaticamente para ${newVersion}`);
  } catch (error) {
    console.error('[ensure-root-version]', error.message || error);
    process.exit(1);
  }
})();

function readPreviousVersion() {
  try {
    const previousRaw = execSync('git show HEAD:root.json', { encoding: 'utf8' });
    return JSON.parse(previousRaw);
  } catch (error) {
    return null;
  }
}

function hasReposChanged(previousJson, currentJson) {
  const prevRepos = Array.isArray(previousJson.repos) ? previousJson.repos : [];
  const currRepos = Array.isArray(currentJson.repos) ? currentJson.repos : [];
  return JSON.stringify(prevRepos) !== JSON.stringify(currRepos);
}

function ensureVersionField(json) {
  if (typeof json.version === 'string') {
    return;
  }
  json.version = '0.0.1';
}

function bumpPatchVersion(version) {
  if (typeof version !== 'string') {
    return '0.0.1';
  }
  const parts = version.split('.').map((piece) => Number.parseInt(piece, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Versão semântica inválida em root.json: "${version}"`);
  }
  parts[1] += 1;
  return parts.join('.');
}

function persistIfMutated(filePath, json, previousRaw) {
  const nextRaw = `${JSON.stringify(json, null, 2)}\n`;
  if (nextRaw === previousRaw) {
    return;
  }
  fs.writeFileSync(filePath, nextRaw);
}
