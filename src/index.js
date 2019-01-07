import { createStore } from 'botframework-webchat'
import { css } from 'glamor'
import React from 'react'
import ReactDOM from 'react-dom'
import memoize from 'memoize-one';

import App from './App'

css.global('html, body, #root', { height: '100%' })
css.global('body', { margin: 0 })

const REDUX_STORE_KEY = 'REDUX_STORE'
const store = createStore()

store.subscribe(() => {
  sessionStorage.setItem(REDUX_STORE_KEY, JSON.stringify(store.getState()))
})

try {
  const baseUri = 'http://localhost:3978'
  const fetchDirectlineToken = memoize(() => {
    return fetch(`${baseUri}/directline/token`, { method: 'POST' }).then(res => res.json()).then(({ token }) => token)
  }, (x, y) => {
    return Math.abs(x - y) < 60000
  })

  fetchDirectlineToken(Date.now()).then(directLineToken =>
    ReactDOM.render(
      <App
        directLineToken={directLineToken}
        store={store}
        speech=''
      />,
      document.getElementById('root')
    )
  )
} catch (err) {
  console.log(err)
  alert('Failed to get Direct Line token')
}
