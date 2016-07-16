let tmath = tmath || {};

export default tmath;

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

Mat2x2.ID =     function() { return new Mat2x2(1, 0, 0, 1); };      Mat2x2.kID = Mat2x2.ID();
Mat2x2.ROT1 =   function() { return new Mat2x2(0, -1, 1, 0); };     Mat2x2.kROT1 = Mat2x2.ROT1();
Mat2x2.ROT2 =   function() { return new Mat2x2(-1, 0, 0, -1); };    Mat2x2.kROT2 = Mat2x2.ROT2();
Mat2x2.ROT3 =   function() { return new Mat2x2(0, 1, -1, 0); };     Mat2x2.kROT3 = Mat2x2.ROT3();
Mat2x2.MIR =    function() { return new Mat2x2(-1, 0, 0, 1); };     Mat2x2.kMIR = Mat2x2.MIR();
Mat2x2.MROT1 =  function() { return new Mat2x2(0, 1, 1, 0); };      Mat2x2.kMROT1 = Mat2x2.MROT1();
Mat2x2.MROT2 =  function() { return new Mat2x2(1, 0, 0, -1); };     Mat2x2.kMROT2 = Mat2x2.MROT2();
Mat2x2.MROT3 =  function() { return new Mat2x2(0, -1, -1, 0); };    Mat2x2.kMROT3 = Mat2x2.MROT3();

Mat2x2.prototype.apply = function(v) {
    return new Vec2(this.a * v.x + this.b * v.y, this.c * v.x + this.d * v.y);
};

Mat2x2.prototype.scale = function(s) {
    return new Mat2x2(s*this.a, s*this.b, s*this.c, s*this.d);
}

Mat2x2.prototype.invert = function() {
    return new Mat2x2(this.d, -this.b, -this.c, this.a).scale((this.a*this.d - this.b*this.c));
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

export function orientationByName(dir, mirror) {
    var m = tmath.Mat2x2,
        regular = {
            "UP": m.kID,
            "RIGHT": m.kROT1,
            "DOWN": m.kROT2,
            "LEFT": m.kROT3
        },
        mirrored = {
            "UP": m.kMIR,
            "RIGHT": m.kMROT1,
            "DOWN": m.kMROT2,
            "LEFT": m.kMROT3
        };

    return mirror ? mirrored[dir] : regular[dir];
}

export function isMirrored(orientation) {
    var m = tmath.Mat2x2,
        l = [m.kMIR, m.kMROT1, m.kMROT2, m.kMROT3];

    return l.some(
        (mat) => _.isEqual(mat, orientation)
    );
}

export function nameFromOrientation(o) {
    let mirror = isMirrored(o),

        direction = "UP",

        m = tmath.Mat2x2;

    if (_.isEqual(o, m.kID) || _.isEqual(o, m.kMIR))
        direction = "UP";
    if (_.isEqual(o, m.kROT1) || _.isEqual(o, m.kMROT1))
        direction = "RIGHT";
    if (_.isEqual(o, m.kROT2) || _.isEqual(o, m.kMROT2))
        direction = "DOWN";
    if (_.isEqual(o, m.kROT3) || _.isEqual(o, m.kMROT3))
        direction = "LEFT";

    return {direction: direction, mirror: mirror};
}
