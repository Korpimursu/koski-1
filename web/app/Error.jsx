import React from 'react'
import ReactDOM from 'react-dom'
import { logout } from './Login.jsx'
import { routeP } from './router'
import Bacon from 'baconjs'

const logError = (error) => {
  console.log('ERROR', error)
}

export const errorP = (stateP) => {
  const stateErrorP = stateP.changes().errors()
    .mapError(error => ({ httpStatus: error.httpStatus }))
    .flatMap(e => Bacon.once(e).concat(isRetryable(e)
        ? Bacon.fromEvent(document.body, 'click').map({}) // Retryable errors can be dismissed
        : Bacon.never()
    )).toProperty({})

  return Bacon.combineWith(stateErrorP, routeP, (error, route) =>
      error.httpStatus ? error : route
  )
}

export const handleError = (error) => {
  if (requiresLogin(error)) {
    logout()
  } else {
    logError(error)
  }
}

export function requiresLogin(e) {
  return e.httpStatus != 404 && e.httpStatus >= 400 && e.httpStatus < 500
}

export function isRetryable(e) {
  return e.httpStatus == 500
}

export const Error = ({isError}) => {
  return isError ? <div id="error" className="error">Järjestelmässä tapahtui odottamaton virhe.<a>&#10005;</a></div> : <div id="error"></div>
}

export const NotFound = () => <div className="not-found"><h1>404</h1><div className="error-message">Etsimääsi sivua ei löytynyt</div></div>
