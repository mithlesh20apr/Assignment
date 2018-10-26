/*
	* Create and export configuration variables
	*
    *
*/

//Container for all the environments

var environments = {};
//Staging (default) environments
environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging'
}

//Production environments

environments.production = {
	'httpPort' : 5000,
	'httpsPort': 5001,
	'envName': 'production'
}


//Determine which environments was passed as command-line arguments

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check that the current environments is one of the environments above, if not, default to staging

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//Export the module

module.exports = environmentToExport;