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
