## Manufactoria Editor

A manufactoria editor and verifier.
Allows saving and loading from regular original manufactoria URLs, and also generating/loading from JSON.
Testing is done by writing a simple javascript function that is equivalent to the desired Manufactoria program, and then testing on a vector of test strings.
Try it at [https://cemulate.github.io/manufactoria-editor](https://cemulate.github.io/manufactoria-editor).

## Examples

Consider Manufactoria level 6 (Robocats!).
The condition is: accept if the string ends with two `B`s.
So we would write:

	testString = function(input) {
		return input.endsWith("BB");
	}

And a correct Manufactoria implementation can be loaded with the following URL:

    http://pleasingfungus.com/Manufactoria/?lvl=32&code=c11:5f2;c11:6f1;c12:4f3;p12:5f7;i12:6f1;p13:5f7;c13:6f0;c13:11f0;c14:4f3;p14:5f6;c14:6f0;c14:11f0;c15:5f3;c15:6f3;c15:7f3;c15:8f3;c15:9f3;c15:10f3;c15:11f0&ctm=Program;(Generated);:*;9;3;0

------------------

Consider Manufactoria level 25 (Roborockets!).
The condition is: Swap red for blue, and blue for red.
This is an input-output problem, so we could write:

	testString = function(input) {
		var s = input.replace(/B/g, "X");
		s = s.replace(/R/g, "B");
		s = s.replace(/X/g, "R");
		return s;
	}

And a correct Manufactoria implementation can be loaded with the following URL:

    http://pleasingfungus.com/Manufactoria/?lvl=32&code=b11:6f2;g12:5f3;p12:6f7;q12:7f6;c12:8f3;c12:9f3;r13:6f0&ctm=Program;(Generated);:*;7;3;0

---

Also of note, and `mhelper` object is available with the following functions:

* `mhelper.tapeToNumber` converts a tape string to a number interpreting it as binary with the convention `R=0, B=1`
* `mhelper.numberToTape` converts a number to a tape using the same convention.

## Advanced

If an input-output problem gaurantees only a particular kind of input tape, such as even-length only, you can return null from `testString` and that test will be skipped/disregarded.
For example, consider level 19, whose description is "Put a yellow in the middle of the (even-length) string".
We could write:

	testString = function(input) {

		// Put a yellow in the middle of the even-length string

		if (input.length == 0) return "Y";
		if (input.length % 2 != 0) return null; // Odd-length strings are not valid input

		var half = input.length/2;

		return input.substr(0, half) + "Y" + input.substr(half, half);

	}

---

If you are working on problems that consider non-trivial input strings (containing greens, yellows, etc. or of a particular form), you can directly modify the variable `testVector` anywhere outside the body of `testString`.
At the point of evaluation, `testVector` is an array containing all the strings that would normally be tested; you can overwrite it completely or modify it in place.
The function `genStringsOfLength(n)` is available which will generate possible strings consisting of `B` and `R` of length `n`.
For example, the last Manufactoria level is to add two numbers represented by strings of blue and red, separated by a green.
So we might do the following:

	// Construct our test set
	testVector = [];
	var a = genStringsOfLength(5);
	for (var x of a) {
		for (var y of a) {
			testVector.push(x + "G" + y);
		}
	}

	testString = function(input) {
		var parts = input.split("G");
		var a = mhelper.tapeToNumber(parts[0]);
		var b = mhelper.tapeToNumber(parts[1]);
		return mhelper.numberToTape(a+b);
	}
