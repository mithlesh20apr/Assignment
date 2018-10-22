/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require('./config');
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');

// Container for all the helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function (str) {
  if (typeof (str) == 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function (strLength) {
  strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for (i = 1; i <= strLength; i++) {
      // Get a random charactert from the possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      // Append this character to the string
      str += randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

// Validate that the email is on correct form.
helpers.validEmail = function (email) {
  return typeof (email) == 'string' && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

helpers.sendStripePayment = function (amount, email, callback) {

  amount = typeof (amount) == 'number' && amount > 0 ? amount : false;
  email = typeof (email) == 'string' && email.trim().length > 0 ? email.trim() : false;

  if (amount && email) {
    // Configure the request payload
    var payload = {
      amount: amount,
      currency: "usd",
      source: "tok_mastercard",
      description: "Charge for " + email
    };
    var stringPayload = querystring.stringify(payload);

    // Configure the request details  
    var requestDetails = {
      protocol: 'https:',
      method: 'POST',
      hostname: 'api.stripe.com',
      port: 443,
      path: '/v1/charges',
      // 'auth': config.stripe.apiKey,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload),
        Authorization: `Bearer ${config.stripe.secretKey}`
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails, function (res) {
      // Grab the status of the sent request
      var status = res.statusCode;
      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(status, { Error: 'Status code returned was ' + status });
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', function (e) {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);
    // End the request
    req.end();
  } else {
    callback('Given parameters were missing or invalid');
  }
}

helpers.sendReceipt = function (amount, email, callback) {

  // Validate parameters
  amount = typeof (amount) == 'number' && amount > 0 ? amount : false;

  if (amount) {
    // Configure the request payload
    var payload = {
      from: config.mailgun.from,
      to: email,
      subject: "Your receipt",
      text: "You just bought pizza for " + amount + " $..."
    };
    var stringPayload = querystring.stringify(payload);

    // Configure the request details    
    var requestDetails = {
       auth: 'api:' + config.mailgun.apiKey,
    protocol: 'https:',
    hostname: 'api.mailgun.net',
    method: 'POST',
    path: '/v3/' + config.mailgun.domainName + '/messages',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails, function (res) {
      // Grab the status of the sent request
      var status = res.statusCode;
      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(true);
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', function (e) {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);
    // End the request
    req.end();
  } else {
    callback('Given parameters were missing or invalid');
  }
}

// Get the string content of a template, and use provided data for string interpolation
helpers.getTemplate = function (templateName, data, callback) {
  // validate templateName
  templateName = typeof (templateName) == 'string' && templateName.length > 0 ? templateName : false;
  data = typeof (data) == 'object' && data !== null ? data : {};
  if (templateName) {
    var templatesDir = path.join(__dirname, '/../templates/');
    fs.readFile(templatesDir + templateName + '.html', 'utf8', function (err, str) {
      if (!err && str && str.length > 0) {
        // Do interpolation on the string
        var finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('No template could be found');
      }
    })
  } else {
    callback('A valid template name was not specified');
  }
}

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = function (str, data, callback) {
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};
  // Get the header
  helpers.getTemplate('_header', data, function (err, headerString) {
    if (!err && headerString) {
      // Get the footer
      helpers.getTemplate('_footer', data, function (err, footerString) {
        if (!err && headerString) {
          // Add them all together
          var fullString = headerString + str + footerString;
          callback(false, fullString);
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
};

// Take a given string and data object, and find/replace all the keys within it
helpers.interpolate = function (str, data) {
  str = typeof (str) == 'string' && str.length > 0 ? str : '';
  data = typeof (data) == 'object' && data !== null ? data : {};

  // Add the templateGlobals to the data object, prepending their key name with "global."
  for (var keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.' + keyName] = config.templateGlobals[keyName]
    }
  }

  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (var key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key] == 'string')) {
      var replace = data[key];
      var find = '{' + key + '}';
      str = str.replace(find, replace);
    }
  }
  return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = function (fileName, callback) {
  fileName = typeof (fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if (fileName) {
    var publicDir = path.join(__dirname, '../public/');
    fs.readFile(publicDir + fileName, function (err, data) {
      if (!err && data) {
        callback(false, data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
};

// Export the module
module.exports = helpers;
