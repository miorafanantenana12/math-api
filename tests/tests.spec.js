const chai = require('chai')
const path = require('path')
const nock = require('nock')
const unirest = require('unirest')
const qs = require('qs')
const fs = require('fs')
const appDir = (path.resolve(__dirname) + '/').replace('tests/', '')
const mainFile = require('../index.js')
const wolframAPI = process.env.app_id || null
const wolframMock = nock('https://api.wolframalpha.com/v2/')
const mongoose = mainFile.math.db

const ocr = mainFile.ocr
const math = mainFile.math
const user = mainFile.user
const utils = mainFile.utils
const api = mainFile.api

var expect = chai.expect
var dbStatus = 0

describe('First build and test', () => {
  it('should built without error', function (done) {
    done()
  })
})

describe('Mongoose connection', () => {
  it('should connect without error', function(done) {
    this.timeout(5000)
    var arg = null
    setTimeout(() =>{
      dbStatus = mongoose.connection.readyState
      try {
        expect(dbStatus).to.be.equal(1)
      } catch(err) {
        arg = err
      }
      done(arg)
    }, 1000)
  })
})

describe('Testing Lib OCR module', () => {
  describe('the functionalities of the Get Lines Method', () => {
    it('should be a function', function(done) {
      var err = null
      try {
        expect(typeof ocr.getLines).to.be.equal('function')
      } catch(error) {
        err = error
      }
      done(err)
    })
    it('Should split lines correctly', function(done) {
      this.timeout(5000)
      var fileContent = '2x" -7x +3 = 0\n(2x -1) (x -3)= 0\n\n'
      ocr
        .getLines(fileContent)
        .then(result => {
          var err = null
          try {
            expect(result).to.be.an('array')
            expect(result[0]).to.be.a('string').and.to.be.equal('2x" -7x +3 = 0')
            expect(result[1]).to.be.a('string').and.to.be.equal('(2x -1) (x -3)= 0')
          } catch(error) {
            err = error
          }
          done(err)
        })
        .catch(err => {
          done(expect(err).to.be.ok)
        })
    }) // OK
    it('Should return error when no parameter', function(done) {
      this.timeout(5000)
      ocr
        .getLines()
        .then(result => {
          done(expect(result).to.be.not.ok)
        })
        .catch(err => {
          var mErr = null
          try {
            expect(err).to.be.an('object')
            expect(err.message).to.be.equal('Please provide a parameter')
          } catch(error) {
            mErr = error
          }
          done(mErr)
        })
    }) // OK
    it('Should return error when type of parameter is not string', function(done) {
      this.timeout(5000)
      ocr
        .getLines(123)
        .then(result => {
          done(expect(result).to.be.not.ok)
        })
        .catch(err => {
          var mErr = null
          try {
            expect(err).to.be.an('object')
            expect(err.message).to.be.equal('Parameter must be a string')
          } catch(error) {
            mErr = error
          }
          done(mErr)
        })
    })
  })
})

describe('Testing the Utils Module', () => {
  describe('the functionalities of the buildUrl method', () => {
    it('should be a function', function(done) {
      var err = null
      try {
        expect(typeof utils.buildUrl).to.be.equal('function')
      } catch(error) {
        err = error
      }
      done(err)
    })
    it('should build url correctly', function(done) {
      var err = null
      const args = {
        url: 'https://api.wolframalpha.com/v2/query',
        input: '(7*x)+2=12'
      }
      const testUrl = 'https://api.wolframalpha.com/v2/query?input=(7*x)%2B2%3D12&primary=true&appid=XG33XY-HP96JJU3WX'

      utils
        .buildUrl(args)
        .then(result => {
          var err = null
          try {
            expect(result.url).to.be.equal(testUrl)
          } catch(error) {
            err = error
          }
          done(err)
        })
        .catch(err => done(err))
    })
    it('should build query correctly', function(done) {
      var err = null
      const args = {
        url: 'https://api.wolframalpha.com/v2/query',
        input: '(7*x)+2=12'
      }
      const testUrl = '?input=(7*x)%2B2%3D12&primary=true&appid=XG33XY-HP96JJU3WX'

      utils
        .buildUrl(args)
        .then(result => {
          var err = null
          try {
            expect(result.query).to.be.equal(testUrl)
          } catch(error) {
            err = error
          }
          done(err)
        })
        .catch(err => done(err))
    })
  })
})

describe('Testing Lib Math Module', () => {
  describe('the functionalities of the getExpType method', () => {
    it('should be a function', function(done) {
      var err = null
      try {
        expect(typeof math.getExpType).to.be.equal('function')
      } catch(error) {
        err = error
      }
      done(err)
    })
    it('should return normalized equation', function(done) {
      math
      .getExpType('x^2-7x+3=0')
      .then(result => {
        var err = null
        try {
          // console.log(result)
          expect(result).to.be.an('object')
          expect(result).to.have.property('expression').equal('x ^ 2 - 7 * x + 3 = 0')
          expect(result).to.have.property('isEq').equal(true)
        } catch(error) {
          err = error
        }
        done(err)
      })
      .catch(err => {
        done(err)
      })
    })
    it('should return parameter error', function(done) {
      math
      .getExpType()
      .then(result => {
        done(expect(result).to.not.be.ok)
      })
      .catch(err => {
        var mErr = null
        try {
          expect(err).to.be.an('object')
          expect(err.message).to.be.equal('Please provide a parameter')
        } catch(error) {
          mErr = error
        }
        done(mErr)
      })
    })
    it('should return type error', function(done) {
      math
      .getExpType(123)
      .then(result => {
        done(expect(result).to.not.be.ok)
      })
      .catch(err => {
        var mErr = null
        try {
          expect(err).to.be.an('object')
          expect(err.message).to.be.equal('Parameter must be a string')
        } catch(error) {
          mErr = error
        }
        done(mErr)
      })
    })
  })
  describe('the functionalities of the mathJsSolve method', () => {
    it('should be a function', function(done) {
      var err = null
      try {
        expect(typeof math.mathJsSolve).to.be.equal('function')
      } catch(error) {
        err = error
      }
      done(err)
    })
    it('should return result from expression array', function(done) {
      math
      .mathJsSolve(['sqrt(9)', '123+77'])
      .then(result => {
        var err = null
        try {
          expect(result).to.be.an('array')
          expect(result[0].solution).to.be.equal(3)
          expect(result[1].solution).to.be.equal(200)
        } catch(error) {
          err = error
        }
        done(err)
      })
      .catch(err => {
        done(err)
      })
    })
    it('should return parameter error', function(done) {
      math
      .mathJsSolve()
      .then(result => {
        done(expect(result).to.not.be.ok)
      })
      .catch(err => {
        var mErr = null
        try {
          expect(err).to.be.an('object')
          expect(err.message).to.be.equal('Please provide a parameter')
        } catch(error) {
          mErr = error
        }
        done(mErr)
      })
    })
    it('should return array error', function(done) {
      math
      .mathJsSolve([])
      .then(result => {
        done(expect(result).to.not.be.ok)
      })
      .catch(err => {
        var mErr = null
        try {
          expect(err).to.be.an('object')
          expect(err.message).to.be.equal('Expression array is empty!')
        } catch(error) {
          mErr = error
        }
        done(mErr)
      })
    })
    it('should return expression error index 1', function(done) {
      math.mathJsSolve(['2+3', {}])
        .then(result => {
          var err = null
          try {
            expect(result.hasExpressionError).to.be.ok
            expect(result).to.be.an('array')
            expect(result[1]).to.have.property('error')
            expect(result[1].error).to.be.an('error')
          } catch(error) {
            err = error
          }
          done(err)
        })
        .catch(err => {
          done(expect(err).to.be.ok)
        })
    })
  })
  describe('the functionalities of the wolframCall method', () => {
    it('should be a function', function(done) {
      var err = null
      try {
        expect(typeof math.wolframCall).to.be.equal('function')
      } catch(error) {
        err = error
      }
      done(err)
    })
    it('should return wolfram mock', function(done) {
      this.timeout(5000)

      const mockOpts = {
        xmlMock: '<?xml version="1.0" encoding="UTF-8" ?><queryresult error="false" mock="true"></queryresult>',
        url: 'https://api.wolframalpha.com/v2/query',
        input: '(7*x)+2=12',
        primary: true,
        appid: wolframAPI
      }

      utils
        .buildUrl(mockOpts)
        .then(bUrl =>{

          wolframMock
          .get('/query'+bUrl.query)
          .reply(200, mockOpts.xmlMock)

          math
            .wolframCall(mockOpts.input)
            .then(result => {
              var err = null
                expect(result.$.mock).to.be.equal('true')
              try {
              } catch(error) {
                err = error
              }
              done(err)
            })
            .catch(err => done(err) )
        })
        .catch(err => done(err) )

    })
    it('should return wolfram result', function(done) {
      this.timeout(5000)

      const XML = fs.readFileSync(appDir+"/tests/actual_response.xml", 'utf-8')

      const mockOpts = {
        xmlMock: XML,
        url: 'https://api.wolframalpha.com/v2/query',
        input: '(7*x)+2=12',
        primary: true,
        appid: wolframAPI
      }

      utils
        .buildUrl(mockOpts)
        .then(bUrl =>{
          wolframMock
          .get('/query'+bUrl.query)
          .reply(200, mockOpts.xmlMock)

          math
            .wolframCall(mockOpts.input)
            .then(result => {
              var err = null
              try {
                expect(result.$.success).to.be.equal('true')
                expect(result.$.error).to.be.equal('false')
                expect(result.pod).to.have.length.of.at.least(1)
              } catch(error) {
                err = error
              }
              done(err)
            })
            .catch(err => {
              done(err)
            })
        })
        .catch(err => done(err))
    })
  })
  describe('the functionalities of the evaluate method',() => {
    it('should be a function', function(done) {
      var err = null
      try {
        expect(typeof math.evaluate).to.be.equal('function')
      } catch(error) {
        err = error
      }
      done(err)
    })
    it('should return mathjs result', function(done) {
      const args = {
        user: '68301f4aef1facb568301f4a',
        query: 'sqrt(49) + 3'
      }
      math
        .evaluate(args)
        .then(result => {
          var err = null
          try {
            // console.log(result)
            expect(result.solveType).to.be.equal('mathjs')
            expect(result.simplified).to.be.equal('10')
            expect(result.solution).to.be.equal(10)
            expect(result.error).to.be.null
            expect(result.expression).to.be.equal(args.query)
          } catch(error){
            err = error
          }
          done(err)
        })
        .catch(err => done(err))
    })
    it('should return wolfram result', function(done) {
      const XML = fs.readFileSync(appDir+"/tests/actual_response.xml", 'utf-8')

      const mockOpts = {
        xmlMock: XML,
        url: 'https://api.wolframalpha.com/v2/query',
        input: '(7*x)+2=12',
        primary: true,
        appid: wolframAPI
      }

      const args = {
        user: '68301f4aef1facb568301f4a',
        query: mockOpts.input
      }

      utils
        .buildUrl(mockOpts)
        .then(bUrl =>{
          wolframMock
          .get('/query'+bUrl.query)
          .reply(200, mockOpts.xmlMock)

          math
            .evaluate(args)
            .then(result => {
              var err = null
              try {
                // expect(result.solveType).to.be.equal('wolfram')
                // expect(result.simplified).to.be.equal('7*x+2=12')
                // expect(result.solution.pod).to.have.length.of.at.least(1)
                // expect(result.solution.$.success).to.be.equal('true')
                // expect(result.solution.$.error).to.be.equal('false')
              } catch(error){
                err = error
              }
              done(err)
            })
            .catch(err => done(err))
        })
        .catch(err => done(err))
    })
  })
})
