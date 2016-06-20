let manufactoriaLevels = [];

export default manufactoriaLevels;

var level1 = `testString = function(input) {

	// Level 1: Accept everything (Recommended size limit: 5x5)

	return true;

}`;

var level2 = `testString = function(input) {

	// Level 2: Accept strings that start with blue

	return input.startsWith("B");

}`;

var level3 = `testString = function(input) {

	// Level 3: Accept if string contains three or more blues

	var b = 0;
	for (var c of input) {
		if (c == "B") b += 1;
	}

	return (b >= 3);

}`;

var level4 = `testString = function(input) {

	// Level 4: Accept if string contains no red

	return (input.indexOf("R") == -1);

}`;

var level5 = `testString = function(input) {

	// Level 5: Accept if string has alternating colors

	if (input.length == 0) return true;

	var current = input[0];
	for (var c of input.slice(1)) {
		if (c == current) return false;
		current = c;
	}

	return true;

}`;

var level6 = `testString = function(input) {

	// Level 6: Accept if string ends with two blues

	return input.endsWith("BB");

}`;

var level7 = `testString = function(input) {

	// Level 7: Accept if string begins and ends with same color

	if (input.length == 0) return true;

	return (input[0] == input[input.length - 1]);

}`;

var level8 = `testString = function(input) {

	// Level 8: Return input, but with the first symbol at the end

	if (input.length == 0) return "";

	return input.slice(1) + input[0];

}`;

var level9 = `testString = function(input) {

	// Level 9: Replace blue with green, and red with yellow

	var r = input.replace(/B/g, "G");
	r = r.replace(/R/g, "Y");
	return r;

}`;

var level10 = `testString = function(input) {

	// Level 10: Put a green at the beginning and a yellow at the end

	return "G" + input + "Y";

}`;

var level11 = `testString = function(input) {

	// Level 11: With R=0, B=1, accept odd binary strings

	return input.endsWith("B");

}`;

var level12 = `numericEquivalence = true;

testString = function(input) {

	// Level 12: With R=0, B=1, return input multiplied by 8

	if (input.length == 0) return null; // Empty string not considered valid on numeric problems

	var num = mhelper.tapeToNumber(input);
	num = num * 8;
	return mhelper.numberToTape(num);

}`;

var level13 = `numericEquivalence = true;

testString = function(input) {

	// Level 13: With R=0, B=1, return input + 1

	if (input.length == 0) return null; // Empty string not considered valid on numeric problems

	var num = mhelper.tapeToNumber(input);
	num += 1;
	return mhelper.numberToTape(num);

}`;

var level14 = `numericEquivalence = true;

testString = function(input) {

	// Level 14: With R=0, B=1, subtract 1 from input

	if (input.length == 0) return null; // Empty string not considered valid on numeric problems

	var num = mhelper.tapeToNumber(input);
	num -= 1;
	return mhelper.numberToTape(num);

}`;

var level15 = `testString = function(input) {

	// Level 15: With R=0, B=1, accept values greater than 15

	if (input.length == 0) return null; // Empty string not considered valid on numeric problems

	var num = mhelper.tapeToNumber(input);
	return (num > 15);

}`;

var level16 = `testString = function(input) {

	// Level 16: With R=0, B=1, accept powers of 4

	if (input.length == 0) return null; // Empty string not considered valid on numeric problems

	var num = mhelper.tapeToNumber(input);
	var check = 1;
	while (check < num) {
		check *= 4;
		if (check == num) return true;
	}

	return false;

}`;

var level17 = `testString = function(input) {

	// Level 17: Accept strings that start with some number of blue, followed by the same number of red

	var form = /^B*R*$/;
	if (!form.test(input)) return false;

	if (input.length == 0) return true;
	var length1 = input.indexOf("R");
	var length2 = input.substr(length1).length;
	return (length1 == length2);

}`;

var level18 = `testString = function(input) {

	// Level 18: Accept strings that contain an equal amount of blue and red

	var b = 0, r = 0;
	for (var c of input) {
		if (c == "B") b += 1;
		if (c == "R") r += 1;
	}

	return (b == r);

}`;

var level19 = `testString = function(input) {

	// Level 19: Put a yellow in the middle of the even-length string

	if (input.length == 0) return "Y";
	if (input.length % 2 != 0) return null; // Odd-length strings are not valid input, skip them.

	var half = input.length/2;

	return input.substr(0, half) + "Y" + input.substr(half, half);

}`;

var level20 = `testString = function(input) {

	// Level 20: Accept even length strings that repeat half-way through

	if (input.length == 0) return true;
	if (input.length % 2 != 0) return false;

	var half = input.length/2;

	return (input.substr(0, half) == input.substr(half, half));

}`;

var level21 = `testString = function(input) {

	// Level 21: Accept N blue, followed by N red, and then N more blue (for any N)

	var form = /^B*R*B*$/;
	if (!form.test(input)) return false;

	if (input.length == 0) return true;
	var length1 = input.indexOf("R");
	var length2 = input.substr(length1).indexOf("B");
	var length3 = input.substr(length2).length;
	return (length1 == length2 && length2 == length3 && length1 == length3);

}`;

var level22 = `testString = function(input) {

	// Level 22: Accept if there are twice as many blues as reds

	var b = 0, r = 0;
	for (var c of input) {
		if (c == "B") b += 1;
		if (c == "R") r += 1;
	}

	return (b == 2*r);

}`;

var level23 = `testString = function(input) {

	// Level 23: Reverse the input string

	return input.split("").reverse().join("");

}`;

var level24 = `testString = function(input) {

	// Level 24: Accept perfectly symmetrical strings

	if (input.length == 0) return true;
	if (input.length % 2 != 0) return null; // Odd-length strings not considered valid input

	var half = input.length / 2;
	var first = input.substr(0, half);
	var second = input.substr(half, half).split("").reverse().join("");
	return (first == second);

}`;

var level25 = `testString = function(input) {

	// Level 25: Swap blue for red and red for blue

	var r = input.replace(/B/g, "X");
	r = r.replace(/R/g, "B");
	r = r.replace(/X/g, "R");
	return r;

}`;

var level26 = `testString = function(input) {

	// Level 26: Output the input with red taken out

	return input.replace(/R/g, "");

}`;

var level27 = `testString = function(input) {

	// Level 27: Return the input with all the blues moved to the front

	var front = "";
	for (var c of input) {
		if (c == "B") front += "B";
	}

	var r = input.replace(/B/g, "");
	return front + r;

}`;

var level28 = `testString = function(input) {

	// Level 28: Return the input, with the last symbol moved to the front

	if (input.length == 0) return "";
	return input.substr(0, input.length - 1) + input[input.length - 1];

}`;

var level29 = `// Construct our test vector
var newTestVector = [];
for (var x of testVector) {
	for (var y of testVector) {
		newTestVector.push(x + "G" + y);
	}
}
testVector = newTestVector;

testString = function(input) {

	// Level 29: Accept two identical strings, separated by a green

	var parts = input.split("G");
	return (parts[0] == parts[1]);

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
manufactoriaLevels.push({number: 10, name: "Robostilts!", testFunction: level10});
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
manufactoriaLevels.push({number: 21, name: "Teachers!", testFunction: level21});
manufactoriaLevels.push({number: 22, name: "Politicians!", testFunction: level22});
manufactoriaLevels.push({number: 23, name: "Academics!", testFunction: level23});
manufactoriaLevels.push({number: 24, name: "Engineers!", testFunction: level24});
manufactoriaLevels.push({number: 25, name: "Roborockets!", testFunction: level25});
manufactoriaLevels.push({number: 26, name: "Roboplanes!", testFunction: level26});
manufactoriaLevels.push({number: 27, name: "Rocket Planes!", testFunction: level27});
manufactoriaLevels.push({number: 28, name: "Robomecha!", testFunction: level28});
manufactoriaLevels.push({number: 29, name: "Seraphim", testFunction: level29});
