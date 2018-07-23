# reselect-scope
[![Build status][ci-badge]][ci]
[![Coveralls][coveralls-badge]][coveralls]
[![Npm][npm-badge]][npm]
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/SenyaMur/reselect-scope/blob/master/LICENSE)

`reselec-scope` use for reduce selectors instans in share components with complex logic where reuse selectors. Need for reduce dublicated selector objects in memory with wheir keepping values.

## Installation

```console
npm install reselect
npm install reselect-scope
```

## Usage
`reselect` example for share component

#### `selectors/orderListSelectors.js`
```js
import { createSelector } from 'reselect'

const getDiscount = (state, props) =>
  state.orderLists[props.listId].discount

const getVisibilityFilter = (state, props) =>
  state.orderLists[props.listId].visibilityFilter

const getOrderList = (state, props) =>
  state.orderLists[props.listId].orderlist

export const makeGetVisibleOrderList = () => {
  return createSelector(
    [ getVisibilityFilter, getOrderList ],
    (visibilityFilter, orderlist) => {
      switch (visibilityFilter) {
        case 'SHOW_AVAILABLE':
          return orderlist.filter(item => item.isAvailable)        
        default:
          return orderlist
      }
    }
  )
}

export const makeGetTotalSum = () => {
    return createSelector(
        makeGetVisibleOrderList(),
        orderlist=>orderlist.reduce((total, item) => total + item.count* item.price, 0)
    )
}

export const makeGetTotalSumWithDiscount = () =>{
    return createSelector(
        getDiscount,
        makeGetTotalSum,
        (discount, totalSum) => totalSum * discount
    )
}

```

#### `containers/VisibleOrderList.js`

```js
import { connect } from 'react-redux'
import { orderItemAdd } from '../actions'
import OrderList from '../components/OrderList'
import { 
    makeGetVisibleOrderList, 
    makeGetTotalSum, 
    makeGetTotalSumWithDiscount
} from '../selectors/orderListSelectors'

const makeMapStateToProps = () => {
  const getVisibleOrderList = makeGetVisibleOrderList()
  const getTotalSum = makeGetTotalSum()
  const getTotalSumWithDiscount = makeGetTotalSumWithDiscount()
  const mapStateToProps = (state, props) => {
    return {
      orderList: getVisibleOrderList(state, props)
      totalSum: getTotalSum(state, props)
      totalSumWithDiscount: getTotalSumWithDiscount(state, props)
    }
  }
  return mapStateToProps
}

const mapDispatchToProps = (dispatch,props) => {
  return {
    onOrderItemAdd: (id) => {
      dispatch(orderItemAdd(props.listId,id))
    }
  }
}

const VisibleOrderList = connect(
  makeMapStateToProps,
  mapDispatchToProps
)(OrderList)

export default VisibleOrderList
```

In above example `makeGetVisibleOrderList` is use 3 time. For: display order list, calculate total sum and total sum with discount.


`reselect-scope` example

#### `selectors/orderListSelectors.js`
```diff
- import { createSelector } from 'reselect'
+ import { createSelector } from 'reselect-scope'

```

#### `containers/VisibleOrderList.js`

```diff
+ import { beginScope, endScope } from 'reselect-scope'
import { connect } from 'react-redux'
import { orderItemAdd } from '../actions'
import OrderList from '../components/OrderList'
import { 
    makeGetVisibleOrderList, 
    makeGetTotalSum, 
    makeGetTotalSumWithDiscount
} from '../selectors/orderListSelectors'

const makeMapStateToProps = () => {
+  beginScope();
  const getVisibleOrderList = makeGetVisibleOrderList()
  const getTotalSum = makeGetTotalSum()
  const getTotalSumWithDiscount = makeGetTotalSumWithDiscount()
+  endScope();
  const mapStateToProps = (state, props) => {
    return {
      orderList: getVisibleOrderList(state, props),
      totalSum: getTotalSum(state, props),
      totalSumWithDiscount: getTotalSumWithDiscount(state, props),
    }
  }
  return mapStateToProps
}

...

```

Now we use only 1 makeGetVisibleOrderList in the scope.

## Reuse scope
If you want reuse scope in childred of share component

#### `containers/VisibleOrderList.js`

```js
import { beginScope, endScope } from 'reselect-scope'
import { connect } from 'react-redux'
import { orderItemAdd } from '../actions'
import OrderList from '../components/OrderList'
import { 
    makeGetVisibleOrderList, 
    makeGetTotalSum, 
    makeGetTotalSumWithDiscount
} from '../selectors/orderListSelectors'

const makeMapStateToProps = () => {
  beginScope();
  const getVisibleOrderList = makeGetVisibleOrderList()
  const getTotalSum = makeGetTotalSum()
  const getTotalSumWithDiscount = makeGetTotalSumWithDiscount()
  const reScope = endScope(); //Get current scope
  const mapStateToProps = (state, props) => {
    return {
      orderList: getVisibleOrderList(state, props),
      totalSum: getTotalSum(state, props),
      totalSumWithDiscount: getTotalSumWithDiscount(state, props),
      reScope: reScope //Put scope for use in to child props
    }
  }
  return mapStateToProps
}
...

```

#### `containers/OrderCard.js`

```js
import { beginScope, endScope } from 'reselect-scope'
import { connect } from 'react-redux'
import OrderCard from '../components/OrderCard'
import { 
    makeGetTotalSum, 
    makeGetTotalSumWithDiscount
} from '../selectors/orderListSelectors'

const makeMapStateToProps = (state, props) => {
  beginScope(props.reScope);
  const getTotalSum = makeGetTotalSum()
  const getTotalSumWithDiscount = makeGetTotalSumWithDiscount()
  endScope();
  const mapStateToProps = (state, props) => {
    return {
      totalSum: getTotalSum(state, props),
      totalSumWithDiscount: getTotalSumWithDiscount(state, props)
    }
  }
  return mapStateToProps
}
...

```