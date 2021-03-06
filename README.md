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

Also of note, an `mhelper` object is available with the following functions:

* `mhelper.tapeToNumber(tape)` converts a tape string to a number interpreting it as binary with the convention `R=0, B=1`
* `mhelper.numberToTape(number)` converts a number to a tape using the same convention.

Note that **by convention**, `mhelper.tapeToNumber` returns `0` on the empty string.
You may not want to consider the empty string a valid input for numeric problems (see the section on Invalid test strings below).

## Advanced

### Invalid test strings

If an input-output problem gaurantees only a particular kind of input tape, you can return `null` from `testString` to completely skip/disregard that test.
For example, consider level 19, whose description is "Put a yellow in the middle of the (even-length) string".
The problem assumes only even-length strings will be given as input.
We simply return `null` on all odd-length input strings to skip those tests.
We could write:

	testString = function(input) {

		// Put a yellow in the middle of the even-length string

		if (input.length == 0) return "Y";
		if (input.length % 2 != 0) return null; // Odd-length strings are not valid input

		var half = input.length/2;

		return input.substr(0, half) + "Y" + input.substr(half, half);

	}

Another very common use case here is when your program treats the tape as a binary number, and you don't want to consider the empty string a valid input.

### Fancier test vectors

If you are working on problems that consider non-trivial input strings (containing greens, yellows, etc. or of a particular form), you can directly modify the variable `testVector` anywhere outside the body of `testString`.
At the point of evaluation, `testVector` is an array containing all the strings that would normally be tested; you can overwrite it completely or modify/filter it in place.
In case you need to make something from scratch, `mhelper` also contains the following functions:

* `mhelper.genStringsOfLength(n)` returns all strings consisting of `B` and `R` only of exactly length `n`
* `mhelper.genStringsUpToLength(n)` returns all strings consisting of `B` and `R` only of every length up to and including `n`

For example, the last Manufactoria level is to add two numbers represented by strings of blue and red, separated by a green.
So we might do the following:

	// Construct our test set
	newTestVector = [];
	for (var x of testVector) {
		for (var y of testVector) {
			newTestVector.push(x + "G" + y);
		}
	}
	testVector = newTestVector;

	testString = function(input) {
		var parts = input.split("G");
		var a = mhelper.tapeToNumber(parts[0]);
		var b = mhelper.tapeToNumber(parts[1]);
		return mhelper.numberToTape(a+b);
	}

### Testing equivalence as binary numbers

If you would like the output tape from your test function and the output tape from your program to be compared *as numbers*, you can set

    numericEquivalence = true;

Anywhere outside the body of `testString`.
This avoids problems with leading zeroes (`R` characters).
If your manufactoria program returns the string `RRRB`, and your test function simply returns `B`, they will be compared as equal because they both represent the number `1`.

## Exporting

There two additional options to save your program in another format:
* The *JSON* option produces a JSON representation of the program
* The *Manufactoria Esolang (Extended)* produces an output file in the (modified) syntax of the [Manufactoria Esolang](https://esolangs.org/wiki/Manufactoria).
The exact format is defined by the [interpreter I wrote for it](https://github.com/cemulate/haskell-manufactoria-interpreter).
The specific changes that differ from the original esolang are discussed [here](https://github.com/cemulate/haskell-manufactoria-interpreter/blob/master/README.md#changes-to-specifications)
