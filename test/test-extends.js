'use strict';

const test = require('ava');
const customTag = require('../src');
const posthtml = require('posthtml');
const posthtmlExtend = require('posthtml-extend');
const clean = html => html.replace(/(\n|\t)/g, '').trim();

test('Must set attribute src and replace tag name', async t => {
  const actual = `<x-base-layout><block name="content">Content</block><block name="footer">Footer</block></x-base-layout>`;
  const expected = `<extends src="test/templates/layouts/base-layout.html"><block name="content">Content</block><block name="footer">Footer</block></extends>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'src', replaceTagNameWith: 'extends'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must output result', async t => {
  const actual = `<x-base-layout><block name="content">Content</block><block name="footer">Footer</block></x-base-layout>`;
  const expected = `<html><head><title>Base Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'src', replaceTagNameWith: 'extends'}),
    posthtmlExtend({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must output result by using plugin via options', async t => {
  const actual = `<x-base-layout><block name="content">Content</block><block name="footer">Footer</block></x-base-layout>`;
  const expected = `<html><head><title>Base Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'src', replaceTagNameWith: 'extends', plugins: [posthtmlExtend({root: './'})]})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must set attribute src and replace tag name using namespace', async t => {
  const actual = `<x-theme-dark::base-layout><block name="content">Content</block><block name="footer">Footer</block></x-theme-dark::base-layout>`;
  const expected = `<extends src="test/templates/theme-dark/layouts/base-layout.html"><block name="content">Content</block><block name="footer">Footer</block></extends>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'src', replaceTagNameWith: 'extends', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/layouts/'}, {name: 'theme-light', root: './test/templates/theme-light/layouts/'}]})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must output result with namespace', async t => {
  const actual = `<x-theme-dark::base-layout><block name="content">Content</block><block name="footer">Footer</block></x-theme-dark::base-layout>`;
  const expected = `<html><head><title>Dark Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'src', replaceTagNameWith: 'extends', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/layouts/'}, {name: 'theme-light', root: './test/templates/theme-light/layouts/'}]}),
    posthtmlExtend({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must output result with namespace by using plugin via options', async t => {
  const actual = `<x-theme-dark::base-layout><block name="content">Content</block><block name="footer">Footer</block></x-theme-dark::base-layout>`;
  const expected = `<html><head><title>Dark Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'src', replaceTagNameWith: 'extends', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/layouts/'}, {name: 'theme-light', root: './test/templates/theme-light/layouts/'}], plugins: [posthtmlExtend({root: './'})]})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace via index file`, async t => {
  const actual = `<x-theme-dark::base><block name="content">Content</block><block name="footer">Footer</block></x-theme-dark::base>`;
  const expected = `<html><head><title>Dark Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'src', replaceTagNameWith: 'extends', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/layouts/'}, {name: 'theme-light', root: './test/templates/theme-light/layouts/'}]}),
    posthtmlExtend({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace's custom root`, async t => {
  const actual = `<x-theme-dark::base-layout><block name="content">Content</block><block name="footer">Footer</block></x-theme-dark::base-layout>`;
  const expected = `<html><head><title>Custom Dark Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'src', replaceTagNameWith: 'extends', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/layouts/', custom: './test/templates/custom/theme-dark/layouts/'}, {name: 'theme-light', root: './test/templates/theme-light/layouts/'}]}),
    posthtmlExtend({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace's custom root via index file`, async t => {
  const actual = `<x-theme-dark::base><block name="content">Content</block><block name="footer">Footer</block></x-theme-dark::base>`;
  const expected = `<html><head><title>Custom Dark Index Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'src', replaceTagNameWith: 'extends', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/layouts/', custom: './test/templates/custom/theme-dark/layouts/'}, {name: 'theme-light', root: './test/templates/theme-light/layouts/'}]}),
    posthtmlExtend({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace's fallback root`, async t => {
  const actual = `<x-theme-dark::admin-layout><block name="content">Content</block><block name="footer">Footer</block></x-theme-dark::admin-layout>`;
  const expected = `<html><head><title>Admin Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'src', replaceTagNameWith: 'extends', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/layouts/', fallback: './test/templates/layouts/'}, {name: 'theme-light', root: './test/templates/theme-light/layouts/'}]}),
    posthtmlExtend({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace's fallback root via index file`, async t => {
  const actual = `<x-theme-dark::admin><block name="content">Content</block><block name="footer">Footer</block></x-theme-dark::admin>`;
  const expected = `<html><head><title>Admin Index Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'src', replaceTagNameWith: 'extends', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/layouts/', fallback: './test/templates/layouts/'}, {name: 'theme-light', root: './test/templates/theme-light/layouts/'}]}),
    posthtmlExtend({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with defined root's fallback`, async t => {
  const actual = `<x-theme-dark::admin-layout><block name="content">Content</block><block name="footer">Footer</block></x-theme-dark::admin-layout>`;
  const expected = `<html><head><title>Admin Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'src', replaceTagNameWith: 'extends', namespaceFallback: true, namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/layouts/'}, {name: 'theme-light', root: './test/templates/theme-light/layouts/'}]}),
    posthtmlExtend({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must fail when namespace path is not found without fallback root', async t => {
  const actual = `<x-empty-namespace::base-layout><block name="content">Content</block><block name="footer">Footer</block></x-empty-namespace::base-layout>`;

  await t.throwsAsync(async () => posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'src', replaceTagNameWith: 'extends', namespaceFallback: false, namespaces: [{name: 'empty-namespace', root: './test/templates/empty-namespace/'}]})
  ]).process(actual));
});

test('Must fail when namespace path is not found with fallback root', async t => {
  const actual = `<x-empty-namespace::base-layout><block name="content">Content</block><block name="footer">Footer</block></x-empty-namespace::base-layout>`;

  await t.throwsAsync(async () => posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'src', replaceTagNameWith: 'extends', namespaceFallback: true, absolute: true, namespaces: {name: 'empty-namespace', root: './test/templates/empty-namespace/'}})
  ]).process(actual));
});

test('Must set custom attribute src and replace custom tag name', async t => {
  const actual = `<x-base-layout><block name="content">Content</block><block name="footer">Footer</block></x-base-layout>`;
  const expected = `<layout path="test/templates/layouts/base-layout.html"><block name="content">Content</block><block name="footer">Footer</block></layout>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'path', replaceTagNameWith: 'layout'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must auto initialize via options`, async t => {
  const actual = `<x-base-layout><block name="content">Content</block><block name="footer">Footer</block></x-base-layout>`;
  const expected = `<html><head><title>Base Layout</title></head><body><main>Content</main><footer>Footer</footer></body></html>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/layouts/', attribute: 'src', replaceTagNameWith: 'extends', extends: {root: './'}})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});
