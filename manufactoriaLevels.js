let manufactoriaLevels = [];

export default manufactoriaLevels;

var level1 = `testString = function(input) {

	// Accept everything

	return true;

}`;

var level2 = `testString = function(input) {

	// Accept strings that start with blue

	return input.startsWith("B");

}`;

var level3 = `testString = function(input) {

	// Accept if there are three or more blues

	var b = 0;
	for (var c of input) {
		if (c == "B") b += 1;
	}

	return (b >= 3);

}`;

manufactoriaLevels.push({number: 1, name: "Robotoast!", testFunction: level1});
manufactoriaLevels.push({number: 2, name: "Robocoffee!", testFunction: level2});
manufactoriaLevels.push({number: 3, name: "Robolamp!", testFunction: level3});
