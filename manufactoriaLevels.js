let manufactoriaLevels = [];

export default manufactoriaLevels;

var level1 = `testString = function(input) {

	// Accept everything (Recommended size limit: 5x5)

	return true;

}`;

var level2 = `testString = function(input) {

	// Accept strings that start with blue

	return input.startsWith("B");

}`;

var level3 = `testString = function(input) {

	// Accept if string contains three or more blues

	var b = 0;
	for (var c of input) {
		if (c == "B") b += 1;
	}

	return (b >= 3);

}`;

var level4 = `testString = function(input) {

	// Accept if string contains no red

	return (input.indexOf("R") == -1);

}`;

var level4 = `testString = function(input) {

	// Accept if string contains no red

	return (input.indexOf("R") == -1);

}`;

var level5 = `testString = function(input) {

	// Accept if string has alternating colors

	if (input.length == 0) return true;

	var current = input[0];
	for (var c of input.slice(1)) {
		if (c == current) return false;
		current = c;
	}

	return true;

}`;

var level6 = `testString = function(input) {

	// Accept if string ends with two blues

	return input.endsWith("BB");

}`;

var level7 = `testString = function(input) {

	// Accept if string begins and ends with same color

	if (input.length == 0) return true;

	return (input[0] == input[input.length - 1]);

}`;

var level8 = `testString = function(input) {

	// Return input, but with the first symbol at the end

	if (input.length == 0) return "";

	return input.slice(1) + input[0];

}`;

var level9 = `testString = function(input) {

	// Replace blue with green, and red with yellow

	var r = input.replace(/B/g, "G");
	r = r.replace(/R/g, "Y");
	return r;

}`;

var level10 = `testString = function(input) {

	// Put a green at the beginning and a yellow at the end

	return "G" + input + "Y";

}`;

var level11 = `testString = function(input) {

	// With R=0, B=1, accept odd binary strings

	return input.endsWith("B");

}`;

var level12 = `testString = function(input) {

	// With R=0, B=1, return input multiplied by 8

	var num = mhelper.tapeToNumber(input);
	num = num * 8;
	return mhelper.numberToTape(num);

}`;

var level13 = `testString = function(input) {

	// With R=0, B=1, return input + 1

	var num = mhelper.tapeToNumber(input);
	num += 1;
	return mhelper.numberToTape(num);

}`;

var level14 = `testString = function(input) {

	// With R=0, B=1, subtract 1 from input

	var num = mhelper.tapeToNumber(input);
	num -= 1;
	return mhelper.numberToTape(num);

}`;

var level15 = `testString = function(input) {

	// With R=0, B=1, accept values greater than 15

	var num = mhelper.tapeToNumber(input);
	return (num > 15);

}`;

var level16 = `testString = function(input) {

	// With R=0, B=1, accept powers of 4

	var num = mhelper.tapeToNumber(input);
	var check = 1;
	while (check < num) {
		check *= 4;
		if (check == num) return true;
	}

	return false;

}`;

var level17 = `testString = function(input) {

	// Accept strings that start with some number of blue, followed by the same number of red

	var b = 0, r = 0;
	var onBlue = true;
	for (var c of input) {
		if (c == "R") onBlue = false;
		if ((onBlue && c == "R") || (!onBlue && c == "B")) return false;
		if (c == "B") b += 1;
		if (c == "R") r += 1;
	}

	return (b == r);

}`;

var level18 = `testString = function(input) {

	// Accept strings that contain an equal amount of blue and red

	var b = 0, r = 0;
	for (var c of input) {
		if (c == "B") b += 1;
		if (c == "R") r += 1;
	}

	return (b == r);

}`;

// This one needs some more infrastructure to support
var level19 = `testString = function(input) {

	// Put a yellow in the middle of the even-length string

	if (input.length == 0) return "Y";
	if (input.length % 2 != 0) return null; // Odd-length strings are not valid input, skip them.

	var half = input.length/2;

	return input.substr(0, half) + "Y" + input.substr(half, half);

}`;

var level20 = `testString = function(input) {

	// Accept even length strings that repeat half-way through

	if (input.length == 0) return true;
	if (input.length % 2 != 0) return false;

	var half = input.length/2;

	return (input.substr(0, half) == input.substr(half, half));

}`;


manufactoriaLevels.push({number: 1, name: "Robotoast!", testFunction: level1});
manufactoriaLevels.push({number: 2, name: "Robocoffee!", testFunction: level2});
manufactoriaLevels.push({number: 3, name: "Robolamp!", testFunction: level3});
manufactoriaLevels.push({number: 4, name: "Robofish!", testFunction: level4});
manufactoriaLevels.push({number: 5, name: "Robobugs!", testFunction: level5});
manufactoriaLevels.push({number: 6, name: "Robocats!", testFunction: level6});
manufactoriaLevels.push({number: 7, name: "Robobears!", testFunction: level7});
manufactoriaLevels.push({number: 8, name: "RC Cars!", testFunction: level8});
manufactoriaLevels.push({number: 9, name: "Robocars!", testFunction: level9});
manufactoriaLevels.push({number: 10, name: "Robostils!", testFunction: level10});
manufactoriaLevels.push({number: 11, name: "Milidogs!", testFunction: level11});
manufactoriaLevels.push({number: 12, name: "Soldiers", testFunction: level12});
manufactoriaLevels.push({number: 13, name: "Officers!", testFunction: level13});
manufactoriaLevels.push({number: 14, name: "Generals!", testFunction: level14});
manufactoriaLevels.push({number: 15, name: "Robotanks!", testFunction: level15});
manufactoriaLevels.push({number: 16, name: "Robospies!", testFunction: level16});
manufactoriaLevels.push({number: 17, name: "Androids!", testFunction: level17});
manufactoriaLevels.push({number: 18, name: "Robo-children!", testFunction: level18});
manufactoriaLevels.push({number: 19, name: "Police!", testFunction: level19});
manufactoriaLevels.push({number: 20, name: "Judiciary!", testFunction: level20});
