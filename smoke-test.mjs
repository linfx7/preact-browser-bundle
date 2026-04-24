import {
  h, htm, html, render, Component, createContext, createRef,
  cloneElement, toChildArray,
  useState, useReducer, useEffect, useLayoutEffect, useRef,
  useImperativeHandle, useMemo, useCallback, useContext,
  useDebugValue, useErrorBoundary,
  Signal, action, batch, computed, createModel, effect,
  signal, untracked, useComputed, useModel, useSignal,
  useSignalEffect
} from './dist/standalone.js';

let failed = false;
function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); failed = true; }
  else { console.log('OK:', msg); }
}

// h() creates vnodes
const vnode = h('div', { id: 'app' }, 'hello');
assert(vnode.type === 'div', 'h() vnode type');
assert(vnode.props.id === 'app', 'h() vnode props');
assert(vnode.props.children === 'hello', 'h() vnode children');

// html tagged template creates vnodes via htm+h
const tpl = html`<span class="x">ok</span>`;
assert(tpl.type === 'span', 'html`` vnode type');
assert(tpl.props.class === 'x', 'html`` vnode props');

// html nested children
const nested = html`<ul>${['a','b'].map(i => html`<li>${i}</li>`)}</ul>`;
assert(nested.type === 'ul', 'html`` nested parent');
assert(Array.isArray(nested.props.children), 'html`` nested children is array');
assert(nested.props.children.length === 2, 'html`` nested children count');

// Component class
assert(typeof Component === 'function', 'Component is function');
assert(typeof Component.prototype.setState === 'function', 'Component has setState');
assert(typeof Component.prototype.forceUpdate === 'function', 'Component has forceUpdate');

// createContext
const ctx = createContext('default');
assert(ctx.Provider !== undefined, 'createContext has Provider');
assert(ctx.Consumer !== undefined, 'createContext has Consumer');

// createRef
const ref = createRef();
assert(ref.current === null, 'createRef initial value is null');

// cloneElement
const original = h('p', { a: 1 }, 'text');
const cloned = cloneElement(original, { b: 2 });
assert(cloned.type === 'p', 'cloneElement preserves type');
assert(cloned.props.a === 1, 'cloneElement preserves props');
assert(cloned.props.b === 2, 'cloneElement merges new props');

// toChildArray
const arr = toChildArray([h('a', null), [h('b', null), h('c', null)]]);
assert(arr.length === 3, 'toChildArray flattens nested children');

// signal reactivity
const s = signal(1);
assert(s.value === 1, 'signal initial value');
s.value = 2;
assert(s.value === 2, 'signal set value');
assert(s instanceof Signal, 'signal instanceof Signal');

// computed
const c = computed(() => s.value * 10);
assert(c.value === 20, 'computed derives value');
s.value = 3;
assert(c.value === 30, 'computed reacts to signal change');

// effect
let effectRan = false;
const dispose = effect(() => { effectRan = s.value > 0; });
assert(effectRan === true, 'effect runs immediately');
dispose();

// batch
const log = [];
const b = signal(0);
effect(() => { log.push(b.value); });
batch(() => { b.value = 1; b.value = 2; b.value = 3; });
assert(log[log.length - 1] === 3, 'batch coalesces updates');

// untracked
const u = signal(10);
let tracked = false;
effect(() => { untracked(() => { u.value; }); tracked = true; });
tracked = false;
u.value = 20;
assert(tracked === false, 'untracked prevents dependency tracking');

// hooks are functions
for (const [name, fn] of Object.entries({
  useState, useReducer, useEffect, useLayoutEffect, useRef,
  useImperativeHandle, useMemo, useCallback, useContext,
  useDebugValue, useErrorBoundary,
  useComputed, useModel, useSignal, useSignalEffect
})) {
  assert(typeof fn === 'function', name + ' is function');
}

// render, action, createModel, htm are functions
assert(typeof render === 'function', 'render is function');
assert(typeof action === 'function', 'action is function');
assert(typeof createModel === 'function', 'createModel is function');
assert(typeof htm === 'function', 'htm is function');

if (failed) process.exit(1);
console.log('All smoke tests passed');
