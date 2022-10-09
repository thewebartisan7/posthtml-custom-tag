'use strict';

const path = require('path');
const fs = require('fs');
const match = require('posthtml-match-helper');

const folderSeparator = '.';

/**
 * Set node attribute
 *
 * @param  {Object} node [posthtml element object]
 * @param  {Object} options [posthtml options]
 * @return {void}
 */
function setNodeAttribute(node, options) {
  if (!node.attrs) {
    node.attrs = {};
  }

  const {tag} = node;

  // Get module filename from tag name by removing "x-"
  //  and replacing dot "." with slash "/" and appending extension
  const customTagFile = tag
    .replace(options.tagPrefix, '')
    .split(folderSeparator)
    .join(path.sep)
    .concat(folderSeparator, options.fileExtension);

  // Find module by defined namespace in options.customTagNamespaces
  //  or by defined roots in options.customTagRoot
  //  and set the returned path
  node.attrs[options.attribute] = tag.includes(options.namespaceSeparator) ?
    findPathByNamespace(tag, customTagFile.split(options.namespaceSeparator), options) :
    findPathByRoot(tag, customTagFile, options);

  node.tag = options.replaceTagNameWith;
}

/**
 * Search for module file within namespace path
 *
 * @param  {String} tag [tag name with namespace]
 * @param  {String} namespace [tag's namespace]
 * @param  {String} customTagFile [filename converted from tag name]
 * @param  {Object} options [posthtml options]
 * @return {String} [custom tag root where the module is found]
 */
function findPathByNamespace(tag, [namespace, customTagFile], options) {
  const customTagNamespace = options.namespaces.find(n => n.name === namespace.replace(options.tagPrefix, ''));

  if (!customTagNamespace) {
    throw new Error(`[custom-tag] Unknown module namespace ${namespace}.`);
  }

  // Used to check module by index.html
  const customTagIndexFile = customTagFile
    .replace(`.${options.fileExtension}`, '')
    .concat(path.sep, 'index.', options.fileExtension);

  // First check in defined namespace's custom root if module was overridden
  let foundByIndexFile = false;
  if (customTagNamespace.custom && (fs.existsSync(path.join(customTagNamespace.custom, customTagFile)) || (foundByIndexFile = fs.existsSync(path.join(customTagNamespace.custom, customTagIndexFile))))) {
    customTagNamespace.root = customTagNamespace.custom;
    if (foundByIndexFile) {
      customTagFile = customTagIndexFile;
    }
    // Then check in defined namespace's or fallback path
  } else if (!fs.existsSync(path.join(customTagNamespace.root, customTagFile))) {
    if (fs.existsSync(path.join(customTagNamespace.root, customTagIndexFile))) {
      // Module found in folder `tag-name/index.html`
      customTagFile = customTagIndexFile;
    } else if (customTagNamespace.fallback && (fs.existsSync(path.join(customTagNamespace.fallback, customTagFile)) || (foundByIndexFile = fs.existsSync(path.join(customTagNamespace.fallback, customTagIndexFile))))) {
      // Module found in defined namespace fallback
      customTagNamespace.root = customTagNamespace.fallback;
      if (foundByIndexFile) {
        customTagFile = customTagIndexFile;
      }
    } else if (options.namespaceFallback) {
      // Last resort: try to find module by defined roots as fallback
      try {
        // Passing tag name without namespace, although it's only used
        // for error message which in this case it's not even used.
        // But passing it correctly in case in future we do something
        // with tag name inside findModuleByRoot()
        return findPathByRoot(tag.replace(namespace, '').replace(options.namespaceSeparator, ''), customTagFile, options);
      } catch {
        throw new Error(`[custom-tag] For the tag ${tag} was not found the template in the defined namespace's root ${customTagNamespace.root} nor in any defined custom tag roots.`);
      }
    } else {
      throw new Error(`[custom-tag] For the tag ${tag} was not found the template in the defined namespace's path ${customTagNamespace.root}.`);
    }
  }

  // Return dirname + filename
  return customTagNamespace.root
    .replace(options.root, '')
    .replace(options.absolute ? '' : path.sep, '')
    .concat(path.sep, customTagFile);
}

/**
 * Search for module file within all roots
 *
 * @param  {String} tag [tag name]
 * @param  {String} customTagFile [filename converted from tag name]
 * @param  {Object} options [posthtml options]
 * @return {String} [custom tag root where the module is found]
 */
function findPathByRoot(tag, customTagFile, options) {
  let root = options.roots.find(root => fs.existsSync(path.join(options.root, root, customTagFile)));

  if (!root) {
    // Check if module exist in folder `tag-name/index.html`
    customTagFile = customTagFile
      .replace(`.${options.fileExtension}`, '')
      .concat(path.sep, 'index.', options.fileExtension);

    root = options.roots.find(root => fs.existsSync(path.join(options.root, root, customTagFile)));
  }

  if (!root) {
    throw new Error(`[custom-tag] For the tag ${tag} was not found the template in any defined root path ${options.roots.join(', ')}`);
  }

  return path.join(root, customTagFile);
}

function applyPluginsToTree(tree, plugins) {
  return plugins.reduce((tree, plugin) => {
    tree = plugin(tree);
    return tree;
  }, tree);
}

module.exports = options => {
  options = {
    ...{
      root: './',
      roots: '/',
      namespaces: [],
      namespaceSeparator: '::',
      namespaceFallback: false,
      fileExtension: 'html',
      tagPrefix: 'x-',
      replaceTagNameWith: 'module',
      tagRegExp: new RegExp(`^${options.tagPrefix || 'x-'}`, 'i'),
      encoding: 'utf8',
      strict: true,
      attribute: 'href',
      plugins: [],
      absolute: null
    },
    ...options
  };

  options.root = path.resolve(options.root);
  options.roots = Array.isArray(options.roots) ? options.roots : [options.roots];

  options.namespaces = Array.isArray(options.namespaces) ? options.namespaces : [options.namespaces];
  options.namespaces.forEach((namespace, index) => {
    options.namespaces[index].root = path.resolve(namespace.root);

    if (namespace.fallback) {
      options.namespaces[index].fallback = path.resolve(namespace.fallback);
    }

    if (namespace.custom) {
      options.namespaces[index].custom = path.resolve(namespace.custom);
    }
  });

  // Namespaced tag for module must use absolute path, while extend must use relative.
  // When using custom tag for modules and/or extend, then set options.absolute to true for modules and to false for extend
  options.absolute = options.absolute === null ? options.replaceTagNameWith === 'module' : options.absolute;

  function customTag(tree) {
    return applyPluginsToTree(
      tree.match(match({tag: options.tagRegExp}), node => {
        setNodeAttribute(node, options);

        return node;
      }),
      options.plugins
    );
  }

  return customTag;
};
