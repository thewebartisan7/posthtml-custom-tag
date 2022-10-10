'use strict';

const path = require('path');
const fs = require('fs');
const match = require('posthtml-match-helper');

const folderSeparator = '.';

/**
 * Find path from tag name
 *
 * @param  {Object} node [posthtml element object]
 * @param  {Object} options [posthtml options]
 * @return {String|boolean}
 */
function findPathFromTagName(node, options) {
  if (!node.attrs) {
    node.attrs = {};
  }

  const {tag} = node;

  // Get module filename from tag name
  //  remove prefix "x-"
  //  replace dot "." with slash "/"
  //  append file extension
  const fileNameFromTag = tag
    .replace(options.tagPrefix, '')
    .split(folderSeparator)
    .join(path.sep)
    .concat(folderSeparator, options.fileExtension);

  // Find module by defined namespace in options.namespaces
  //  or by defined roots in options.roots
  return tag.includes(options.namespaceSeparator) ?
    findPathByNamespace(tag, fileNameFromTag.split(options.namespaceSeparator), options) :
    findPathByRoot(tag, fileNameFromTag, options);
}

/**
 * Search for module file within namespace path
 *
 * @param  {String} tag [tag name with namespace]
 * @param  {String} namespace [tag's namespace]
 * @param  {String} fileNameFromTag [filename converted from tag name]
 * @param  {Object} options [posthtml options]
 * @return {String|boolean} [custom tag root where the module is found]
 */
function findPathByNamespace(tag, [namespace, fileNameFromTag], options) {
  const customTagNamespace = options.namespaces.find(n => n.name === namespace.replace(options.tagPrefix, ''));

  if (!customTagNamespace) {
    if (options.strict) {
      throw new Error(`[custom-tag] Unknown module namespace ${namespace}.`);
    } else {
      return false;
    }
  }

  // Used to check module by index.html
  const indexFileNameFromTag = fileNameFromTag
    .replace(`.${options.fileExtension}`, '')
    .concat(path.sep, 'index.', options.fileExtension);

  // First check in defined namespace's custom root if module was overridden
  let foundByIndexFile = false;
  if (customTagNamespace.custom && (fs.existsSync(path.join(customTagNamespace.custom, fileNameFromTag)) || (foundByIndexFile = fs.existsSync(path.join(customTagNamespace.custom, indexFileNameFromTag))))) {
    customTagNamespace.root = customTagNamespace.custom;
    if (foundByIndexFile) {
      fileNameFromTag = indexFileNameFromTag;
    }
    // Then check in defined namespace's or fallback path
  } else if (!fs.existsSync(path.join(customTagNamespace.root, fileNameFromTag))) {
    if (fs.existsSync(path.join(customTagNamespace.root, indexFileNameFromTag))) {
      // Module found in folder `tag-name/index.html`
      fileNameFromTag = indexFileNameFromTag;
    } else if (customTagNamespace.fallback && (fs.existsSync(path.join(customTagNamespace.fallback, fileNameFromTag)) || (foundByIndexFile = fs.existsSync(path.join(customTagNamespace.fallback, indexFileNameFromTag))))) {
      // Module found in defined namespace fallback
      customTagNamespace.root = customTagNamespace.fallback;
      if (foundByIndexFile) {
        fileNameFromTag = indexFileNameFromTag;
      }
    } else if (options.namespaceFallback) {
      // Last resort: try to find module by defined roots as fallback
      try {
        // Passing tag name without namespace, although it's only used
        // for error message which in this case it's not even used.
        // But passing it correctly in case in future we do something
        // with tag name inside findModuleByRoot()
        return findPathByRoot(tag.replace(namespace, '').replace(options.namespaceSeparator, ''), fileNameFromTag, options);
      } catch {
        // With disabled strict mode we will never enter here as findPathByRoot() return false
        //  so we don't need to check if options.strict is true
        throw new Error(`[custom-tag] For the tag ${tag} was not found the template in the defined namespace's root ${customTagNamespace.root} nor in any defined custom tag roots.`);
      }
    } else if (options.strict) {
      throw new Error(`[custom-tag] For the tag ${tag} was not found the template in the defined namespace's path ${customTagNamespace.root}.`);
    } else {
      return false;
    }
  }

  // Return dirname + filename
  return customTagNamespace.root
    .replace(options.root, '')
    .replace(options.absolute ? '' : path.sep, '')
    .concat(path.sep, fileNameFromTag);
}

/**
 * Search for module file within all roots
 *
 * @param  {String} tag [tag name]
 * @param  {String} fileNameFromTag [filename converted from tag name]
 * @param  {Object} options [posthtml options]
 * @return {String|boolean} [custom tag root where the module is found]
 */
function findPathByRoot(tag, fileNameFromTag, options) {
  let root = options.roots.find(root => fs.existsSync(path.join(options.root, root, fileNameFromTag)));

  if (!root) {
    // Check if module exist in folder `tag-name/index.html`
    fileNameFromTag = fileNameFromTag
      .replace(`.${options.fileExtension}`, '')
      .concat(path.sep, 'index.', options.fileExtension);

    root = options.roots.find(root => fs.existsSync(path.join(options.root, root, fileNameFromTag)));
  }

  if (!root) {
    if (options.strict) {
      throw new Error(`[custom-tag] For the tag ${tag} was not found the template in any defined root path ${options.roots.join(', ')}`);
    } else {
      return false;
    }
  }

  return path.join(root, fileNameFromTag);
}

/**
 * Apply plugins to tree after the plugin.
 * Used for example for plugin posthtml-modules and posthtml-extend.
 *
 * @param  {Object} tree [tree object]
 * @param  {Object} plugins [posthtml plugins to be applied to the tree]
 * @return {Object} [tree object]
 */
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
      namespaces: [], // Array of namespaces path or single namespaces as object
      namespaceSeparator: '::',
      namespaceFallback: false,
      fileExtension: 'html',
      tagPrefix: 'x-',
      tagRegExp: new RegExp(`^${options.tagPrefix || 'x-'}`, 'i'),
      strict: true,
      replaceTagNameWith: 'module',
      attribute: 'href',
      plugins: [], // Plugin to be applied after, like posthtml-modules and/or posthtml-extend
      absolute: null, // Must be true with posthtml-modules and false with posthtml-extend (only with namespaced path)
      modules: null, // Options for plugin posthtml-modules
      extends: null // Options for plugin posthtml-extend
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
  //  When using custom tag for modules and/or extend, then set options.absolute to true for modules and to false for extend
  options.absolute = options.absolute === null ? options.replaceTagNameWith === 'module' : options.absolute;

  options.plugins = Array.isArray(options.plugins) ? options.plugins : [options.plugins];

  // When found options for modules or extend
  //  then auto initialize the plugin
  if (options.modules !== null || options.extends !== null) {
    options.plugins = [];

    if (options.modules) {
      options.plugins.push(require('posthtml-modules')(options.modules));
    }

    if (options.extends) {
      options.plugins.push(require('posthtml-extend')(options.extends));
    }
  }

  return function (tree) {
    return applyPluginsToTree(
      tree.match(match({tag: options.tagRegExp}), node => {
        const path = findPathFromTagName(node, options);

        if (path !== false) {
          node.attrs[options.attribute] = path;
          node.tag = options.replaceTagNameWith;
        }

        return node;
      }),
      options.plugins
    );
  };
};
