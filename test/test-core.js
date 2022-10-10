'use strict';

const test = require('ava');
const customTag = require('../src');
const posthtml = require('posthtml');
const clean = html => html.replace(/(\n|\t)/g, '').trim();

test('Must fail when using not defined namespace', async t => {
  const actual = `<div><x-unknown-namespace::button>Submit</x-unknown-namespace::button></div>`;

  await t.throwsAsync(async () => posthtml([
    customTag({root: './', roots: 'test/templates'})
  ]).process(actual));
});

test('Must find file within sub folders', async t => {
  const actual = `<div><x-forms.button>Submit</x-forms.button></div>`;
  const expected = `<div><module href="test/templates/modules/forms/button.html">Submit</module></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/modules/', attribute: 'href', replaceTagNameWith: 'module'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must not fail and return node as-is without strict mode', async t => {
  const actual = `<div><x-unknown-tag>Submit</x-unknown-tag></div>`;
  const expected = `<div><x-unknown-tag>Submit</x-unknown-tag></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', strict: false})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must not fail and return node as-is without strict mode using not defined namespace', async t => {
  const actual = `<div><x-namespace::unknown-tag>Submit</x-namespace::unknown-tag></div>`;
  const expected = `<div><x-namespace::unknown-tag>Submit</x-namespace::unknown-tag></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', strict: false})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must not fail and return node as-is without strict mode using defined namespace', async t => {
  const actual = `<div><x-namespace::unknown-tag>Submit</x-namespace::unknown-tag></div>`;
  const expected = `<div><x-namespace::unknown-tag>Submit</x-namespace::unknown-tag></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', strict: false, namespaces: {name: 'namespace', root: './test/templates/namespace/'}})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must not fail and return node as-is without strict mode using defined namespace and root's fallback`, async t => {
  const actual = `<div><x-namespace::unknown-tag>Submit</x-namespace::unknown-tag></div>`;
  const expected = `<div><x-namespace::unknown-tag>Submit</x-namespace::unknown-tag></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', strict: false, namespaceFallback: true, namespaces: {name: 'namespace', root: './test/templates/namespace/'}})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result when using both plugin togheter with the same prefix`, async t => {
  const actual = `<x-base-layout><block name="content"><div><x-button>Submit</x-button></div></block><block name="footer">Footer</block></x-base-layout>`;
  const expected = `<html><head><title>Base Layout</title></head><body><main><div><button>Submit</button></div></main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/modules/', strict: false, modules: {root: './'}}),
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'src', replaceTagNameWith: 'extends', extends: {root: './'}})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});
