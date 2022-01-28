'use strict'

const monero_config = require('@mylozzax/mylozzax-monero-config')
// ^-- TODO: remove this
//
const openalias_utils = require('./openalias_utils')
const currency_openAliasPrefix = monero_config.openAliasPrefix
//
function DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress (address) {
  if (address.indexOf('.') !== -1) {
    // assumed to be an OA address asXMR addresses do not have periods and OA addrs must
    return true
  }
  return false
}
exports.DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress = DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress
//
function ResolvedMoneroAddressInfoFromOpenAliasAddress (
  openAliasAddress,
  txtRecordResolver, // see "./TXTResolver*.js"
  nettype,
  monero_utils,
  fn
  // fn: (
  // 	err,
  // 	moneroReady_address,
  //	payment_id, // may be undefined
  //	tx_description, // may be undefined
  // 	openAlias_domain,
  // 	oaRecords_0_name,
  // 	oaRecords_0_description,
  // 	dnssec_used_and_secured
  // ) -> HostedMoneroAPIClient_RequestHandle
) {
  if (DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(openAliasAddress) === false) {
    throw Error('Asked to resolve non-OpenAlias address.') // throw as code fault
  }
  const openAlias_domain = openAliasAddress.replace(/@/g, '.')
  const resolverHandle = txtRecordResolver.TXTRecords(
    openAlias_domain,
    function (err, records, dnssec_used, secured, dnssec_fail_reason) {
      if (err) {
        const message = err.message ? err.message : err.toString()
        const errStr = "Couldn't look up '" + openAlias_domain + "'… " + message
        const returnableErr = new Error(errStr)
        fn(returnableErr)
        return
      }
      // console.log(openAlias_domain + ": ", records);
      let oaRecords
      try {
        oaRecords = openalias_utils.ValidatedOARecordsFromTXTRecordsWithOpenAliasPrefix(
          openAlias_domain,
          records,
          dnssec_used,
          secured,
          dnssec_fail_reason,
          currency_openAliasPrefix
        )
      } catch (e) {
        const err = new Error(e)
        fn(err)
        return
      }
      const sampled_oaRecord = oaRecords[0] // going to assume we only have one, or that the first one is sufficient
      // console.log("OpenAlias record: ", sampled_oaRecord)
      const oaRecord_address = sampled_oaRecord.address
      try { // verify address is decodable for currency
        monero_utils.decode_address(oaRecord_address, nettype)
      } catch (e) {
        const errStr = 'Address received by parsing OpenAlias address ' + oaRecord_address + ' was not a valid Monero address: ' + e
        const error = new Error(errStr) // apparently if this is named err, JS will complain. no-semicolon parsing issue?
        fn(error)
        return
      }
      const moneroReady_address = oaRecord_address // now considered valid
      const payment_id = sampled_oaRecord.tx_payment_id
      const tx_description = sampled_oaRecord.tx_description
      //
      const oaRecords_0_name = sampled_oaRecord.name
      const oaRecords_0_description = sampled_oaRecord.description
      const dnssec_used_and_secured = dnssec_used && secured
      //
      fn(
        null,
        //
        moneroReady_address,
        payment_id,
        tx_description,
        //
        openAlias_domain,
        oaRecords_0_name,
        oaRecords_0_description,
        dnssec_used_and_secured
      )
    }
  )
  return resolverHandle
}
exports.ResolvedMoneroAddressInfoFromOpenAliasAddress = ResolvedMoneroAddressInfoFromOpenAliasAddress
