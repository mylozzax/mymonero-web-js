'use strict'

import './assets/css/styles.css'
import './assets/css/clear.browser.css'

window.BootApp = async function () { // encased in a function to prevent scope being lost/freed on mobile
  const coreBridgeInstance = await require('@mylozzax/mylozzax-app-bridge')({})
  console.log(process.env.NETTYPE)
  const isMobile = ('ontouchstart' in document.documentElement) // an approximation for 'mobile'
  const config = {
    nettype: parseInt(process.env.NETTYPE), // critical setting 0 - MAINNET, 2 - STAGENET
    apiUrl: process.env.SERVER_URL,
    version: process.env.APP_VERSION,
    name: process.env.APP_NAME,
    isDebug: false,
    isMobile: isMobile,
    TabBarView_thickness: isMobile ? 48 : 79,
    appDownloadLink_domainAndPath: 'https://lozzax.xyz',
    appRepoLink: 'https://www.github.com/mylozzax/mylozzax-app-js/releases/latest',
    HostedMoneroAPIClient_DEBUGONLY_mockSendTransactionSuccess: false,
    monero_utils: coreBridgeInstance
  }
  // context
  const context = require('./MainWindow/Models/index_context.browser').NewHydratedContext(config)
  window.MyMonero_context = context
  // configure native UI elements
  document.addEventListener('touchstart', function () {}, true) // to allow :active styles to work in your CSS on a page in Mobile Safari:
  //
  if (isMobile) {
    // disable tap -> click delay on mobile browsers
    const attachFastClick = require('fastclick')
    attachFastClick.attach(document.body)
    //
    // when window resized on mobile (i.e. possibly when device rotated -
    // though we don't support that yet
    // if(/Android/.test(navigator.appVersion)) {
    const commonComponents_forms = require('./MMAppUICommonComponents/forms.web')
    window.addEventListener('resize', function () {
      console.log('💬  Window resized')
      commonComponents_forms.ScrollCurrentFormElementIntoView()
    })
    // }
  }
  { // root view
    const RootView = require('./MainWindow/Views/RootView.web')
    const rootView = new RootView({}, context) // hang onto reference
    rootView.superview = null // just to be explicit; however we will set a .superlayer
    // manually attach the rootView to the DOM and specify view's usual managed reference(s)
    const superlayer = document.body
    rootView.superlayer = superlayer
    superlayer.appendChild(rootView.layer) // the `layer` is actually the DOM element
  }
  { // and remove the loader (possibly fade this out)
    const el = document.getElementById('loading-spinner')
    el.parentNode.removeChild(el)
  }
}
window.BootApp()
