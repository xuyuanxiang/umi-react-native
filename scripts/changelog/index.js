'use strict';
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const conventionalChangelog = require('conventional-changelog');

conventionalChangelog(
  {
    preset: 'angular',
    releaseCount: 0,
  },
  null,
  null,
  null,
  {
    mainTemplate: fs.readFileSync(path.resolve(__dirname, './templates/template.hbs'), 'utf8'),
    headerPartial: fs.readFileSync(path.resolve(__dirname, './templates/header.hbs'), 'utf8'),
    commitPartial: fs.readFileSync(path.resolve(__dirname, './templates/commit.hbs'), 'utf8'),
    footerPartial: fs.readFileSync(path.resolve(__dirname, './templates/footer.hbs'), 'utf8'),
    generateOn(commit) {
      return semver.valid(commit.version);
    },
    transform(commit) {
      let discard = true;
      const issues = [];
      commit.notes.forEach(function (note) {
        note.title = '破坏性改动';
        discard = false;
      });
      if (commit.type === 'feat') {
        commit.type = '新功能';
      } else if (commit.type === 'fix') {
        commit.type = 'Bug 修复';
      } else if (commit.type === 'perf') {
        commit.type = '性能改进';
      } else if (commit.type === 'revert') {
        commit.type = '回滚';
      } else if (discard) {
        return;
      } else if (commit.type === 'docs') {
        commit.type = '文档';
      } else if (commit.type === 'style') {
        commit.type = '代码样式';
      } else if (commit.type === 'refactor') {
        commit.type = '重构';
      } else if (commit.type === 'test') {
        commit.type = '单元测试';
      } else if (commit.type === 'chore') {
        commit.type = '其他';
      }
      if (typeof commit.hash === 'string') {
        commit.hash = commit.hash.substring(0, 7);
      }
      if (typeof commit.subject === 'string') {
        commit.subject = commit.subject.replace(/#([0-9]+)/g, function (_, issue) {
          issues.push(issue);
          return `[#${issue}](https://github.com/xuyuanxiang/umi-react-native/issues/${issue})`;
        });
      }
      commit.references = commit.references.filter(function (reference) {
        if (!reference.issue || !reference.owner) {
          return false;
        }
        reference.issue = reference.issue.match(/([0-9]+)/)[1];
        if (issues.indexOf(reference.issue) === -1) {
          return true;
        }
        return reference;
      });
      return commit;
    },
  },
).pipe(fs.createWriteStream('CHANGELOG.md'));
