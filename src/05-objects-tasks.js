/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.create(proto, Object.getOwnPropertyDescriptors(JSON.parse(json)));
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class Builder {
  constructor() {
    this.selectorsOrder = ['element', 'id', 'classes', 'attributes', 'pseudoClasses', 'pseudoElement'];
    this.selectors = new Map();
    this.stringResult = '';
    this.notUniqueErrorMsg = 'Element, id and pseudo-element should not occur more then one time inside the selector';
    this.orderErrorMsg = 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element';
  }

  throwNotUniqueError() {
    throw new Error(this.notUniqueErrorMsg);
  }

  throwOrderError() {
    throw new Error(this.orderErrorMsg);
  }

  isUnique(selector) {
    return this.selectors.has(selector) && this.throwNotUniqueError();
  }

  isRightOrder(selector) {
    const i = this.selectorsOrder.indexOf(selector);
    const nextSelectors = this.selectorsOrder.slice(i + 1);
    const orderErrors = nextSelectors.reduce((a, c) => (this.selectors.has(c) ? a + 1 : a), 0);
    return orderErrors && this.throwOrderError();
  }

  element(value) {
    this.isUnique('element');
    this.isRightOrder('element');
    this.selectors.set('element', value);
    return this;
  }

  id(value) {
    this.isUnique('id');
    this.isRightOrder('id');
    this.selectors.set('id', `#${value}`);
    return this;
  }

  class(value) {
    this.isRightOrder('classes');
    this.selectors.set('classes', [
      ...(this.selectors.has('classes')
        ? this.selectors.get('classes')
        : []),
      `.${value}`,
    ]);
    return this;
  }

  attr(value) {
    this.isRightOrder('attributes');
    this.selectors.set('attributes', [
      ...(this.selectors.has('attributes')
        ? this.selectors.get('attributes')
        : []),
      `[${value}]`,
    ]);
    return this;
  }

  pseudoClass(value) {
    this.isRightOrder('pseudoClasses');
    this.selectors.set('pseudoClasses', [
      ...(this.selectors.has('pseudoClasses')
        ? this.selectors.get('pseudoClasses')
        : []),
      `:${value}`,
    ]);
    return this;
  }

  pseudoElement(value) {
    this.isUnique('pseudoElement');
    this.selectors.set('pseudoElement', `::${value}`);
    return this;
  }

  stringify() {
    if (this.stringResult) {
      const res = this.stringResult;
      this.stringResult = '';
      this.selectors = new Map();
      return res;
    }
    const s = this.selectors;
    const o = this.selectorsOrder;
    const res = o.reduce((a, c) => {
      if (s.has(c)) {
        return typeof s.get(c) === 'object'
          ? a + s.get(c).join('')
          : a + s.get(c);
      }
      return a;
    }, '');
    this.selectors = new Map();
    return res;
  }

  combine(selector1, combinator, selector2) {
    this.stringResult = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return this;
  }
}

const cssSelectorBuilder = {
  element: (v) => new Builder().element(v),
  id: (v) => new Builder().id(v),
  class: (v) => new Builder().class(v),
  attr: (v) => new Builder().attr(v),
  pseudoClass: (v) => new Builder().pseudoClass(v),
  pseudoElement: (v) => new Builder().pseudoElement(v),
  combine: (s1, c, s2) => new Builder().combine(s1, c, s2),
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
