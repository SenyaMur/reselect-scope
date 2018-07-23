import { createSelector as createSelectorInner } from 'reselect';

let defaultSelector = createSelectorInner;

/**
 * Set default CreateSelector
 * @param {*} newCreateSelector 
 */
export function setDefaultSelector(newCreateSelector){
    defaultSelector = newCreateSelector;
}

let reselectScope = null;
/**
 * enter new/or reuse spote selectors
 * @param {Array} [scope=[]]
 */
export function beginScope(scope) {
  reselectScope = scope || [];
};

/**
 * Return current scope
 */
export function endScope(){
  const tmpScope = reselectScope;
  reselectScope = null;
  return tmpScope;
};

function defaultEqualityCheck(a, b) {
    let isEqual = false;
    if (Array.isArray(a) && Array.isArray(b)) {
      return areArgumentsShallowlyEqual(a, b);
    } else if (Array.isArray(a) || Array.isArray(b)) {
      return false;
    } else if (a.scopeIndex != null && b.scopeIndex != null) {
      //If CreateSelect created in scope
      isEqual = a.scopeIndex === b.scopeIndex;
      return isEqual;
    } else if (a.resultFunc && b.resultFunc) {
      //If const CreateSelect
      isEqual = a === b;
      return isEqual;
    } else if ((typeof a ==='function') && (typeof b ==='function')) {
      isEqual = '' + a.prototype.constructor == '' + b.prototype.constructor;
      return isEqual;
    } else {
      isEqual = a === b;
      return isEqual;
    }
}
function areArgumentsShallowlyEqual(prev, next) {
  if (prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  const length = prev.length;
  for (let i = 0; i < length; i++) {
    if (!defaultEqualityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

export function createSelector() {
  let inner = null;
  if (reselectScope) {
    const innerItem = reselectScope.find(item =>
      areArgumentsShallowlyEqual(item.args, arguments)
    );
    // const ownerNameMethod = new Error().stack
    //   .split('\n')[2]
    //   .trim()
    //   .split(' ')[1];
    if (innerItem != null) {    
      return innerItem.fn;
    }/* else if (reselectScope.find(item => item.name === ownerNameMethod)) {
      console.error('not found compare for ' + ownerNameMethod);
    }*/

    inner = defaultSelector.apply(null, arguments);
    inner.scopeIndex = reselectScope.length;
    // inner.selectorName = ownerNameMethod;
    reselectScope.push({ args: arguments, fn: inner/*, name: ownerNameMethod*/ });
    // console.warn(
    //   `create new reselect(${reselectScope.length}) ${ownerNameMethod}`
    // );
  } else {
    inner = defaultSelector.apply(null, arguments);
  }
  return inner;
}