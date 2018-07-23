import chai from 'chai';
import {  createSelector, beginScope, endScope  } from '../src/index';

const assert = chai.assert;

suite('selector', () => {
    test('basic selector ', () => {        
        const makeselector = ()=> createSelector(
            state => state.a,
            a => a
          );
        let selector1 = null;
        let selector2 = null;
        beginScope();
        selector1 =makeselector();
        selector2 =makeselector();
        const scope = endScope();
        assert.equal(selector1,selector2)
        assert.equal(scope.length,1);
    }),
    test('basic selector array selectors', () => {        
        const makeselector = ()=> createSelector(
            [
                state => state.a,
                ()=> true
            ],
            a => a
          );
        let selector1 = null;
        let selector2 = null;
        beginScope();
        selector1 =makeselector();
        selector2 =makeselector();
        const scope = endScope();
        assert.equal(selector1,selector2)
        assert.equal(scope.length,1);
    }),
    test('basic selector const ', () => {        
        const makeselector = ()=> createSelector(
            () => true,
            a => a
          );
        let selector1 = null;
        let selector2 = null;
        beginScope();
        selector1 =makeselector();
        selector2 =makeselector();
        const scope = endScope();
        assert.equal(selector1,selector2)
        assert.equal(scope.length,1);
    }),
    test('basic selector const function', () => { 
        const constFn = ()=> 1;       
        const makeselector = ()=> createSelector(
            constFn,
            a => a
          );
        let selector1 = null;
        let selector2 = null;
        beginScope();
        selector1 =makeselector();
        selector2 =makeselector();
        const scope = endScope();
        assert.equal(selector1,selector2)
        assert.equal(scope.length,1);
    }),
    test('basic selector different', () => {        
        const makeselector1 = ()=> createSelector(
            state => state.a,
            a => a
          );
        const makeselector2 = ()=> createSelector(
            state => state.b,
            b => b
          );
        let selector1 = null;
        let selector2 = null;
        beginScope();
        selector1 =makeselector1();
        selector2 =makeselector2();
        const scope = endScope();
        assert.notEqual(selector1,selector2)
        assert.equal(scope.length,2);
    }),
    test('basic selector with const selector', () => {
        const selectorConst = createSelector(
            state => state.b,
            b => b
          );
        const makeselector = ()=> createSelector(
            selectorConst,
            a => a
          );
        let selector1 = null;
        let selector2 = null;
        beginScope();
        selector1 =makeselector();
        selector2 =makeselector();
        const scope = endScope();
        assert.equal(selector1,selector2)
        assert.equal(scope.length,1);
    }),
    test('basic selector with const selector different ', () => {
        const selectorConst = createSelector(
            state => state.b,
            b => b
          );
        const makeselector1 = ()=> createSelector(
            selectorConst,
            a => a
          );
          const makeselector2 = ()=> createSelector(
            selectorConst,
            b => b
          );
        let selector1 = null;
        let selector2 = null;
        beginScope();
        selector1 =makeselector1();
        selector2 =makeselector2();
        const scope = endScope();
        assert.notEqual(selector1,selector2)
        assert.equal(scope.length,2);
    })
    test('selector selector with sharing selector ', () => {
        const selectorConst = createSelector(
            state => state.b,
            b => b
          );
        const makeselector = ()=> createSelector(
            selectorConst,
            a => a
          );
        const makeselectorDeep = ()=> createSelector(
            makeselector(),
            a => a
          );
        let selector1 = null;
        let selector2 = null;
        let selector3 = null;
        beginScope();
        selector1 =makeselector();
        selector2 =makeselectorDeep();
        selector3 =makeselectorDeep();
        const scope = endScope();
        assert.equal(selector1,scope[0].fn);
        assert.equal(selector2,selector3);
        assert.notEqual(selector1,selector3);
        assert.equal(scope.length,2);
    })
    test('selector selector with sharing selector whti array selectors ', () => {
        const selectorConst = createSelector(
            state => state.b,
            b => b
          );
        const makeselector = ()=> createSelector(
            [
                selectorConst
            ],
            a => a
          );
        const makeselectorDeep = ()=> createSelector(
            [
                makeselector()
            ],
            a => a
          );
        let selector1 = null;
        let selector2 = null;
        let selector3 = null;
        beginScope();
        selector1 =makeselector();
        selector2 =makeselectorDeep();
        selector3 =makeselectorDeep();
        const scope = endScope();
        assert.equal(selector1,scope[0].fn);
        assert.equal(selector2,selector3);
        assert.notEqual(selector1,selector3);
        assert.equal(scope.length,2);
    })
})    