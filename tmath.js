var tmath = tmath || {};

(function(tmath) {

    var Vec2 = function(x, y) {
        this.x = x;
        this.y = y;
    };

    Vec2.prototype.add = function(v2) {
        return new Vec2(this.x + v2.x, this.y + v2.y);
    };

    Vec2.prototype.equals = function(v2) {
        return (this.x == v2.x && this.y == v2.y);
    };

    tmath.Vec2 = Vec2;

    var Mat2x2 = function(a,b,c,d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    };

    Mat2x2.ID =     function() { return new Mat2x2(1, 0, 0, 1); };
    Mat2x2.ROT1 =   function() { return new Mat2x2(0, -1, 1, 0); };
    Mat2x2.ROT2 =   function() { return new Mat2x2(-1, 0, 0, -1); };
    Mat2x2.ROT3 =   function() { return new Mat2x2(0, 1, -1, 0); };
    Mat2x2.MIR =    function() { return new Mat2x2(-1, 0, 0, 1); };
    Mat2x2.MROT1 =  function() { return new Mat2x2(0, 1, 1, 0); };
    Mat2x2.MROT2 =  function() { return new Mat2x2(1, 0, 0, -1); };
    Mat2x2.MROT3 =  function() { return new Mat2x2(0, -1, -1, 0); };

    Mat2x2.prototype.apply = function(v) {
        return new Vec2(this.a * v.x + this.b * v.y, this.c * v.x + this.d * v.y);
    };

    Mat2x2.prototype.invert = function() {
        return new Mat2x2(this.d, -this.b, -this.c, this.a);
    };

    Mat2x2.prototype.compose = function(m2) {
        return new Mat2x2(this.a * m2.a + this.b* m2.c,
                          this.a * m2.b + this.b * m2.d,
                          this.c * m2.a + this.d * m2.c,
                          this.c * m2.b + this.d * m2.d);
    };

    Mat2x2.prototype.equals = function(m2) {
        return (this.a == m2.a && this.b == m2.b && this.c == m2.c && this.d == m2.d);
    };

    tmath.Mat2x2 = Mat2x2;

})(tmath);