/*
 * CLI-related tasks
 *
 */

 // Dependencies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');
class _events extends events{};
var e = new _events();
var os = require('os');
var v8 = require('v8');
var _data = require('./data');
var _logs = require('./logs');
var helpers = require('./helpers');
var menu = require('../.data/menu/menu');
// Instantiate the cli module object
var cli = {};


// Input handlerds
e.on('man', function(str){
	cli.responders.help();
});

e.on('help',function(str){
	cli.responders.help();
});

e.on('exit',function(str){
	cli.responders.exit();
});
e.on('stats',function(str){
	cli.responders.stats();
});
e.on('current items', function(str){
	cli.responders.currentItems();
})
e.on('view recent order', function(str){
	cli.responders.viewRecentOrder(str);
});
e.on('order info', function(str){
	cli.responders.orderInfo(str);
});
e.on('list recent users', function(str){
 cli.responders.listRecentUsers(str);
});
e.on('user info', function(){
	cli.responders.userInfo();
});
e.on('more log info', function(str){
	cli.responders.moreLogInfo(str);
});


// Responder object
cli.responders = {};

// Help / Man
cli.responders.help = function() {
	//console.log("You asked for help");
	// Codify the commands and their explanations
	var commands = {
		'exit' : 'Kill the Cli (and the rest of the application)',
		'man' : 'Show this help page',
		'help' : 'Alias of the "man" command',
		'stats' : 'Get statistics on the underlying operating system and resource utilization',
		'current itmes' : 'Show all the current items available in this application',
		'view recent order' : 'Show details of a specified user',
		'order info' : 'All the information about order ',
		'list recent users' : 'Show all the details of recent users',
		'user info' : 'Show a list of all the log files available to be read (Compressed and uncompressed)'
	};

	// Show a header for the help page that is as wide as  the screen

	cli.horizontalLine();
	cli.centered('CLI MANUAL');
	cli.horizontalLine();
	cli.verticalSpace(2);

	// Show each command, followed by its explanation, in white and yellow respectively

	for(var key in commands) {
		if(commands.hasOwnProperty(key)) {
			var value = commands[key];
			var line = '      \x1b[33m '+key+'      \x1b[0m';
			var padding = 60 - line.length;
			for(i = 0; i < padding; i++) {
				line+= '';
			}
			line+=value;
			console.log(line);
			cli.verticalSpace();
		}
	}

	cli.verticalSpace(1);

	// End with another horizontal line
	cli.horizontalLine();

}

// Create a vertical space

cli.verticalSpace = function(lines) {
	lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
	for(i = 0; i < lines; i++) {
		console.log('');
	}
};

// Create a horizontal line across the screen

cli.horizontalLine = function() {
	// Get the available screen size

	var width = process.stdout.columns;

	// Put in enough dashes to go across the screen

	var line = '';
	for(i = 0; i < width; i++) {
		line+= '-';
	}

	console.log(line);
};

// Create centered text on the screen
cli.centered = function(str) {
	str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';

	// Get the available screen size

	var width = process.stdout.columns;

	// Calculate the left padding there should be
	var leftPadding = Math.floor((width - str.length) / 2);

	// Put in left padded spaces before the string itself

	var line = '';
	for(i = 0; i< leftPadding; i++) {
		line += ' ';
	}
	line+= str;
	console.log(line);
};


// Exit
cli.responders.exit = function() {
	//console.log("You asked to exit");
	process.exit(0);
};

// stats
cli.responders.stats = function() {
	//console.log("You asked for stats");
 
  // Comile an object of stats

  var stats = {

  	'Load Average' : os.loadavg().join('  '),
  	'CPU Count' : os.cpus().length,
  	'Free Memory' : os.freemem(),
  	'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
  	'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
  	'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
  	'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
  	'Uptime' : os.uptime()+' Seconds'
  };

  // Create a header for the stats

  cli.horizontalLine();
  cli.centered('SYSTEM STATISTICS');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Log out eact stat

  for(var key in stats) {
  	if(stats.hasOwnProperty(key)){
  		var value = stats[key];
  		var line = '      \x1b[33m '+key+'      \x1b[0m';
  		var padding = 60 - line.length;
  		for(i = 0; i < padding; i++) {
  			line += ' ';
  		}
  		line += value;
  		console.log(line);
  		cli.verticalSpace();
  	}
  }

  // Create a footer for the stats

  cli.verticalSpace();
  cli.horizontalLine();

};


//List Menu Itens
cli.responders.currentItems = function (){
  //Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('Menu List');
  cli.horizontalLine();
  cli.verticalSpace(2); 
  menu.available.forEach((item) => { 
  var line = '      \x1b[33m   '+item.code+'   \x1b[33m   '+item.type+'  \x1b[0m    \x1b[33m   '+item.name+'      \x1b[0m      ';
  var padding = 50 - line.length;
    for (i = 0; i < padding; i++) {
        line+=' ';
    }
    line += '$ ';
    line += item.price;
    console.log(line);
    cli.verticalSpace();
  });   

}

// View recent order (within in 24hrs)

cli.responders.viewRecentOrder = function() {
  cli.horizontalLine();
  cli.centered(' Recent order');
  cli.horizontalLine();
  cli.verticalSpace();

  // Grab all the users from orders

  _data.list('users', function(error, listofFiles){
    if(error) {
      console.log('Error reading order:', error);
      return;
    }
    if(listofFiles.length==0) {
      console.log('No order ever registered');
    }

    showAfter = new Date().valueOf() - 1000 * 60 * 60 * 24;

    // for each user with an order, go through his list of orders and print the ones made in the last 24 hrs

    listofFiles.forEach((userOrderFile) => {
      _data.read('order', userOrderFile, function(err, ordersData){
        if(!err && orderData) {
          orderData.forEach((order) => {
            if(order.registeredAt  > showAfter.valueOf()) {
              console.log('Customer:' + userOrderFile.replace('.json', '') +' | ID: ' + order.ID);
            }
          })
        }else{
          console.log('Error reading user order: ', err);
        }
      });
    });
  });
}


// Detail about an order, provided customer email and order Id (more order inof)

cli.responders.orderInfo = function(str) {
  var arr = str.split('--');
  var userMail = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  var orderId = typeof(arr[2]) == 'string' && arr[2].trim().length > 0 ? arr[2].trim() : false;

  if(!(userMail && orderId)){
    console.log('Incorrect parameters.');
    return;
  };

  cli.horizontalLine();
  cli.centered(' Order Information');
  cli.horizontalLine();

  // lookup the user's order list

  _data.read('orders', userMail, function(err, ordersData){
    if(!err && ordersData) {
      if(ordersData.length==0) {
        console.log('Order not found. No order at all was found for ther user', userMail);
        return;
      };
      var printed = false;
      ordersData.forEach((order) => {
        if(order.ID == orderId) {
          cli.verticalSpace();
          console.dir(order,{'colors' : true});
          cli.verticalSpace();
          printed = true;
        };
      });

      if(!printed) {
        console.log('Order not found');
      };
    }else{
      console.log('No order found for customer' +userMail);
    }
  });
}

//list recent users
cli.responders.listRecentUsers = function () {
    
    cli.horizontalLine();
    cli.centered('RECENT USERS (LAST 24H)');
    cli.horizontalLine();
    cli.verticalSpace(2); 

    //grab all users with orders
    _data.list('users', (error, listOfUsers) => {
        if(error){
            console.log('Error reading users:', error);
            return;
        };

        if (listOfUsers.length==0) {
            console.log('No user ever registered');
            return;
        };

        showAfter = new Date().valueOf() - 1000 * 60 * 60 * 24;

        //for each user with an order, go through his list of orders and print the ones made in the last 24h
        listOfUsers.forEach((user) => {
            _data.read('users', user, function(err, userData){
                if (!err && userData) {
                    if (userData.registeredAt > showAfter.valueOf()){
                        console.log('Customer: ' + user.replace('.json',''));
                    } ;
                } else {
                    console.log('error reading user: ', err);
                }
            });            
        });
    });
  };

//more user info --{userEmail}
cli.responders.userInfo = function(str){
    var arr = str.split('--');
    var userMail = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
    if (!userMail){
        console.log('Incorrect parameters.');
        return;
    };

    cli.horizontalLine();
    cli.centered('Order Customers: ' + userMail.replace('.json','') + ' >');
    cli.horizontalLine();

    //lookup the user
    _data.read('users', userMail, function(err, userData){
        if (!err && userData) {
                    cli.verticalSpace();
                    console.dir(userData, {'colors' : true});
                    cli.verticalSpace();
                    printed = true;
        } else {
            console.log('Customer not found: ' + userMail);
        }
    });   
}

// Input processor
cli.processInput = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something, otherwise ignore it
  if(str){
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'current items',
      'view recent order',
      'order info',
      'list recent users',
      'user info'
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false;
    var counter = 0;
    uniqueInputs.some(function(input){
      if(str.toLowerCase().indexOf(input) > -1){
        matchFound = true;
        // Emit event matching the unique input, and include the full string given
        e.emit(input,str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if(!matchFound){
      console.log("Sorry, try again");
    }

  }
};

// Init script
cli.init = function(){

  // Send to console, in dark blue
  console.log('\x1b[34m%s\x1b[0m','The CLI is running');

  // Start the interface
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line', function(str){
    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on('close', function(){
    process.exit(0);
  });

};


 // Export the module
 module.exports = cli;
