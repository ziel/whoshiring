'use strict'
/* eslint-env node, mocha */
/* eslint-disable no-process-env */

const sinon = require('sinon')
const Output = require('../lib/output')
const Spinner = require('cli-spinner').Spinner
const ChildProcess = require('child_process')

describe('Output', function () {
  // -------------------------------------------------------------
  // Sinon sandbox setup/teardown
  // -------------------------------------------------------------

  const sandbox = sinon.sandbox.create({
    useFakeTimers: false,
    useFakeServer: false
  })

  beforeEach(function () {
    sandbox.stub(Output, 'println')
    sandbox.stub(Spinner.prototype, 'start')
    sandbox.stub(Spinner.prototype, 'setSpinnerTitle')
    sandbox.stub(ChildProcess, 'spawn').returns({
      stdin: {
        on: sandbox.stub(),
        write: sandbox.stub(),
        end: sandbox.stub()
      }
    })
  })

  afterEach(function () {
    sandbox.restore()
  })

  // -------------------------------------------------------------
  // Tests
  // -------------------------------------------------------------

  it('should not display progress unless interactive', function () {
    process.stdout.isTTY = false
    Output.progress('test progress message')
    sinon.assert.notCalled(Spinner.prototype.setSpinnerTitle)
  })

  it('should not start spinning when already spinning', function () {
    process.stdout.isTTY = true

    const spinning = sandbox
      .stub(Spinner.prototype, 'isSpinning')
      .returns(true)

    spinning
      .onCall(0)
      .returns(false)

    Output.progress('test progress message 1')
    Output.progress('test progress message 2')
    Output.progress('test progress message 3')

    sinon.assert.calledOnce(Spinner.prototype.start)
  })

  it('should spawn a pager when interactive', function () {
    process.stdout.isTTY = true
    process.env.PAGER = 'pager'

    Output.data('test data')
    sinon.assert.called(ChildProcess.spawn)
  })

  it('should not spawn a pager when PAGER isn\'t set', function () {
    process.stdout.isTTY = true
    delete process.env.PAGER

    Output.data('test data')
    sinon.assert.notCalled(ChildProcess.spawn)
  })

  it('should print to stdout when PAGER isn\'t set', function () {
    process.stdout.isTTY = true
    delete process.env.PAGER

    Output.data('test data')
    sinon.assert.called(Output.println)
  })

  it('should not spawn a pager when not interactive', function () {
    process.stdout.isTTY = false
    process.env.PAGER = 'pager'

    Output.data('test data')
    sinon.assert.notCalled(ChildProcess.spawn)
  })

  it('should print to stdout when not interactive', function () {
    process.stdout.isTTY = false
    process.env.PAGER = 'pager'

    Output.data('test data')
    sinon.assert.called(Output.println)
  })
})
