'use strict';

const test = require('ava');
const customTag = require('../src');
const posthtml = require('posthtml');
const posthtmlModules = require('posthtml-modules');
const clean = html => html.replace(/(\n|\t)/g, '').trim();

test('Must set attribute href and replace tag name', async t => {
  const actual = `<div><x-button>Submit</x-button></div>`;
  const expected = `<div><module href="test/templates/modules/button.html">Submit</module></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/modules/', attribute: 'href', replaceTagNameWith: 'module'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must output result', async t => {
  const actual = `<div><x-button>Submit</x-button></div>`;
  const expected = `<div><button>Submit</button></div>`;

  const html = await posthtml([
    customTag({root: './', roots: ['test/templates/modules/'], attribute: 'href', replaceTagNameWith: 'module'}),
    posthtmlModules({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must output result by using plugin via options', async t => {
  const actual = `<div><x-button>Submit</x-button></div>`;
  const expected = `<div><button>Submit</button></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/modules/', attribute: 'href', replaceTagNameWith: 'module', plugins: [posthtmlModules({root: './'})]})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must set attribute href and replace tag name using namespace', async t => {
  const actual = `<div><x-theme-dark::button>Submit</x-theme-dark::button></div>`;
  const expected = `<div><module href="/test/templates/theme-dark/modules/button.html">Submit</module></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}]})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must output result with namespace', async t => {
  const actual = `<div><x-theme-dark::button>Submit</x-theme-dark::button></div>`;
  const expected = `<div><button class="bg-dark text-light">Submit</button></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}]}),
    posthtmlModules({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must output result with namespace by using plugin via options', async t => {
  const actual = `<div><x-theme-dark::button>Submit</x-theme-dark::button></div>`;
  const expected = `<div><button class="bg-dark text-light">Submit</button></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}], plugins: [posthtmlModules({root: './'})]})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace via index file`, async t => {
  const actual = `<div><x-theme-dark::label>My Label</x-theme-dark::label></div>`;
  const expected = `<div><label class="text-light">My Label</label></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}]}),
    posthtmlModules({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace's custom root`, async t => {
  const actual = `<div><x-theme-dark::button>Submit</x-theme-dark::button></div>`;
  const expected = `<div><button class="bg-dark-custom text-light-custom">Submit</button></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/', custom: './test/templates/custom/theme-dark/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}]}),
    posthtmlModules({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace's custom root via index file`, async t => {
  const actual = `<div><x-theme-dark::label>My Label</x-theme-dark::label></div>`;
  const expected = `<div><label class="text-light-custom">My Label</label></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/', custom: './test/templates/custom/theme-dark/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}]}),
    posthtmlModules({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace's fallback root`, async t => {
  const actual = `<div><x-theme-dark::input></x-theme-dark::input></div>`;
  const expected = `<div><input type="text" name="name" value=""></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/', fallback: './test/templates/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}]}),
    posthtmlModules({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with namespace's fallback root via index file`, async t => {
  const actual = `<div><x-theme-dark::select></x-theme-dark::select></div>`;
  const expected = `<div><select name="select"><option>Option one</option></select></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/', fallback: './test/templates/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}]}),
    posthtmlModules({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test(`Must output result with defined root's fallback`, async t => {
  const actual = `<div><x-theme-dark::select></x-theme-dark::select></div>`;
  const expected = `<div><select name="select"><option>Option one</option></select></div>`;

  const html = await posthtml([
    customTag({root: './', roots: 'test/templates/modules/', attribute: 'href', replaceTagNameWith: 'module', namespaceFallback: true, namespaces: [{name: 'theme-dark', root: './test/templates/theme-dark/modules/'}, {name: 'theme-light', root: './test/templates/theme-light/modules/'}]}),
    posthtmlModules({root: './'})
  ])
    .process(actual)
    .then(result => clean(result.html));

  t.is(html, expected);
});

test('Must fail when namespace path is not found without fallback root', async t => {
  const actual = `<div><x-empty-namespace::button>Submit</x-empty-namespace::button></div>`;

  await t.throwsAsync(async () => posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaceFallback: false, namespaces: [{name: 'empty-namespace', root: './test/templates/empty-namespace/'}]})
  ]).process(actual));
});

test('Must fail when namespace path is not found with fallback root', async t => {
  const actual = `<div><x-empty-namespace::button>Submit</x-empty-namespace::button></div>`;

  await t.throwsAsync(async () => posthtml([
    customTag({root: './', roots: 'test/templates/', attribute: 'href', replaceTagNameWith: 'module', namespaceFallback: true, absolute: true, namespaces: {name: 'empty-namespace', root: './test/templates/empty-namespace/'}})
  ]).process(actual));
});
