'use strict';

const test = require('ava');
const customTag = require('../src');
const posthtml = require('posthtml');
// const clean = html => html.replace(/(\n|\t)/g, '').trim();

test('Must fail when using not defined namespace', async t => {
  const actual = `<div><x-unknown-namespace::button>Submit</x-unknown-namespace::button></div>`;

  await t.throwsAsync(async () => posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}]})
  ]).process(actual));
});
