// import function for Bitcoin address checking
import validate from 'bitcoin-address-validation'
//console.log(validate)

function sendFunds (wallet, xmr_amount, xmr_send_address, sweep_wallet, validation_status_fn, handle_response_fn) {
  return new Promise((resolve, reject) => {
    // for debug, we use our own xmr_wallet and we send a tiny amount of XMR. Change this once we can send funds

    const enteredAddressValue = xmr_send_address // ;
    const resolvedAddress = ''
    const manuallyEnteredPaymentID = ''
    const resolvedPaymentID = ''
    const hasPickedAContact = false
    const manuallyEnteredPaymentID_fieldIsVisible = false
    const resolvedPaymentID_fieldIsVisible = false
    const resolvedAddress_fieldIsVisible = false
    let contact_payment_id
    let cached_OAResolved_address
    let contact_hasOpenAliasAddress
    let contact_address
    const raw_amount_string = xmr_amount // LOZZ amount in double
    const sweeping = sweep_wallet
    const simple_priority = 1

    wallet.SendFunds(
      enteredAddressValue,
      resolvedAddress,
      manuallyEnteredPaymentID,
      resolvedPaymentID,
      hasPickedAContact,
      resolvedAddress_fieldIsVisible,
      manuallyEnteredPaymentID_fieldIsVisible,
      resolvedPaymentID_fieldIsVisible,
      contact_payment_id,
      cached_OAResolved_address,
      contact_hasOpenAliasAddress,
      contact_address,
      raw_amount_string,
      sweeping,
      simple_priority,
      validation_status_fn,
      cancelled_fn,
      handle_response_fn
    )

    function cancelled_fn () { // canceled_fn
      // TODO: Karl: I haven't diven deep enough to determine what state would invoke this function yet
    }
  })
}

function validateBTCAddress (address) {
  console.log(validate(address))
  if (validate(address) == false) {
    return false
  }
  // TODO: check for and fail on testnet address? Force testnet address on ENABLE_TESTMODE?

  return true
}

function determineAddressNetwork (address) {
  const info = validate(address)
  return info.network
}

// end of functions to check Bitcoin address

function renderOrderStatus (order) {
  /*

        "btc_amount",
        "btc_amount_partial",
        "btc_dest_address",
        "btc_num_confirmations_threshold",
        "created_at",
        "in_amount_remaining",
        "out_amount",
        "status",
        "expires_at",
        "incoming_amount_total",
        "incoming_num_confirmations_remaining",
        "incoming_price_btc",
        "receiving_subaddress",
        "recommended_mixin",
        "remaining_amount_incoming",
        "seconds_till_timeout",
        "state",
        "uses_lightning",
        "uuid"
        "provider_order_id"

*/

  const idArr = [
    'in_amount_remaining',
    'out_amount',
    'status',
    'expires_at',
    'provider_order_id',
    'in_address',
    'in_amount'
  ]

  const test = document.getElementById('exchangePage')
  if (!(test == null)) {
    idArr.forEach((item, index) => {
      if (item == 'in_address') {
        document.getElementById('receiving_subaddress').innerHTML = order[item]
      } else {
        document.getElementById(item).innerHTML = order[item]
      }
    })
  }
}

function getTimeRemaining (endtime) {
  const total = Date.parse(endtime) - Date.parse(new Date())
  let seconds = Math.floor((total / 1000) % 60)
  let minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  if (total < 0) {
    seconds = 0
    minutes = 0
  }

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  }
}

function checkDecimals (value, decimals) {
  const str = value.toString()
  const strArr = str.split('.')
  if (strArr.length > 1) {
    if (strArr[1].length >= decimals) {
      return false
    }
  }
  return true
}

function isValidBase10Decimal (number) {
  const str = number.toString()
  const strArr = str.split('.')
  if (strArr.size > 1 && typeof (strArr) === Array) {
    return false
  }
  for (let i = 0; i < 2; i++) {
    if (isNaN(parseInt(strArr[i]))) {
      return false
    }
  }
  if (strArr.size > 1) {
    if (strArr[1].length == 0) {
      return false
    }
  }
  return true
}

export default { validateBTCAddress, getTimeRemaining, isValidBase10Decimal, checkDecimals, renderOrderStatus, sendFunds }
