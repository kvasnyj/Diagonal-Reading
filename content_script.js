var text = document.body.innerText;
text = text.replace(/[^A-Za-z]/g, " ");
text = text.split(" ");

var max = 0;
var words = {};

var stopword = [];
var stem = {};
loadWS();

for (i = 0; i < text.length; i++) {
    var src = text[i].toLowerCase();
    if (src.length < 3) continue;

    var Stem = function (lng) {
        var testStemmer = new Snowball(lng);
        return function (word) {
            testStemmer.setCurrent(word);
            testStemmer.stem();
            return testStemmer.getCurrent();
        }
    };

    var key = new Stem("english")(src);

    if (stopword.indexOf(key)>=0) continue;
    if (!(src in stem)) stem[src] = key;

    if (key in words)
        words[key]++;
    else {
        words[key] = 1
    }

    if (words[key] > max) max = words[key];
}

var lim = max * 0.1;
if (lim < 2) lim = 2;

var source = document.body.innerHTML;
for (key in stem)
    if (words[stem[key]] >= lim)
        source = source.replace(new RegExp("(^|\\s)(" + key + ")(\\s|$)", "gi"), "$1<b>$2</b>$3");

document.body.innerHTML = source;

/*
    SERVICE FUNCTIONs
*/

function Snowball(lng) {
    function Among(s, substring_i, result, method) {
        this.s_size = s.length;
        this.s = this.toCharArray(s);
        this.substring_i = substring_i;
        this.result = result;
        this.method = method;
    }
    Among.prototype.toCharArray = function (s) {
        var sLength = s.length, charArr = new Array(sLength);
        for (var i = 0; i < sLength; i++)
            charArr[i] = s.charCodeAt(i);
        return charArr;
    }
    function SnowballProgram() {
        var current;
        return {
            b: 0,
            k: 0,
            l: 0,
            c: 0,
            lb: 0,
            s_c: function (word) {
                current = word;
                this.c = 0;
                this.l = word.length;
                this.lb = 0;
                this.b = this.c;
                this.k = this.l;
            },
            g_c: function () {
                var result = current;
                current = null;
                return result;
            },
            i_g: function (s, min, max) {
                if (this.c < this.l) {
                    var ch = current.charCodeAt(this.c);
                    if (ch <= max && ch >= min) {
                        ch -= min;
                        if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                            this.c++;
                            return true;
                        }
                    }
                }
                return false;
            },
            i_g_b: function (s, min, max) {
                if (this.c > this.lb) {
                    var ch = current.charCodeAt(this.c - 1);
                    if (ch <= max && ch >= min) {
                        ch -= min;
                        if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                            this.c--;
                            return true;
                        }
                    }
                }
                return false;
            },
            o_g: function (s, min, max) {
                if (this.c < this.l) {
                    var ch = current.charCodeAt(this.c);
                    if (ch > max || ch < min) {
                        this.c++;
                        return true;
                    }
                    ch -= min;
                    if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                        this.c++;
                        return true;
                    }
                }
                return false;
            },
            o_g_b: function (s, min, max) {
                if (this.c > this.lb) {
                    var ch = current.charCodeAt(this.c - 1);
                    if (ch > max || ch < min) {
                        this.c--;
                        return true;
                    }
                    ch -= min;
                    if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                        this.c--;
                        return true;
                    }
                }
                return false;
            },
            e_s: function (s_size, s) {
                if (this.l - this.c < s_size)
                    return false;
                for (var i = 0; i < s_size; i++)
                    if (current.charCodeAt(this.c + i) != s.charCodeAt(i))
                        return false;
                this.c += s_size;
                return true;
            },
            e_s_b: function (s_size, s) {
                if (this.c - this.lb < s_size)
                    return false;
                for (var i = 0; i < s_size; i++)
                    if (current.charCodeAt(this.c - s_size + i) != s
							.charCodeAt(i))
                        return false;
                this.c -= s_size;
                return true;
            },
            f_a: function (v, v_size) {
                var i = 0, j = v_size, c = this.c, l = this.l, common_i = 0, common_j = 0, first_key_inspected = false;
                while (true) {
                    var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
							? common_i
							: common_j, w = v[k];
                    for (var i2 = common; i2 < w.s_size; i2++) {
                        if (c + common == l) {
                            diff = -1;
                            break;
                        }
                        diff = current.charCodeAt(c + common) - w.s[i2];
                        if (diff)
                            break;
                        common++;
                    }
                    if (diff < 0) {
                        j = k;
                        common_j = common;
                    } else {
                        i = k;
                        common_i = common;
                    }
                    if (j - i <= 1) {
                        if (i > 0 || j == i || first_key_inspected)
                            break;
                        first_key_inspected = true;
                    }
                }
                while (true) {
                    var w = v[i];
                    if (common_i >= w.s_size) {
                        this.c = c + w.s_size;
                        if (!w.method)
                            return w.result;
                        var res = w.method();
                        this.c = c + w.s_size;
                        if (res)
                            return w.result;
                    }
                    i = w.substring_i;
                    if (i < 0)
                        return 0;
                }
            },
            f_a_b: function (v, v_size) {
                var i = 0, j = v_size, c = this.c, lb = this.lb, common_i = 0, common_j = 0, first_key_inspected = false;
                while (true) {
                    var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
							? common_i
							: common_j, w = v[k];
                    for (var i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
                        if (c - common == lb) {
                            diff = -1;
                            break;
                        }
                        diff = current.charCodeAt(c - 1 - common) - w.s[i2];
                        if (diff)
                            break;
                        common++;
                    }
                    if (diff < 0) {
                        j = k;
                        common_j = common;
                    } else {
                        i = k;
                        common_i = common;
                    }
                    if (j - i <= 1) {
                        if (i > 0 || j == i || first_key_inspected)
                            break;
                        first_key_inspected = true;
                    }
                }
                while (true) {
                    var w = v[i];
                    if (common_i >= w.s_size) {
                        this.c = c - w.s_size;
                        if (!w.method)
                            return w.result;
                        var res = w.method();
                        this.c = c - w.s_size;
                        if (res)
                            return w.result;
                    }
                    i = w.substring_i;
                    if (i < 0)
                        return 0;
                }
            },
            r_s: function (c_bra, c_ket, s) {
                var adjustment = s.length - (c_ket - c_bra), left = current
						.substring(0, c_bra), right = current.substring(c_ket);
                current = left + s + right;
                this.l += adjustment;
                if (this.c >= c_ket)
                    this.c += adjustment;
                else if (this.c > c_bra)
                    this.c = c_bra;
                return adjustment;
            },
            s_ch: function () {
                if (this.b < 0 || this.b > this.k || this.k > this.l
						|| this.l > current.length)
                    throw ("faulty slice operation");
            },
            s_f: function (s) {
                this.s_ch();
                this.r_s(this.b, this.k, s);
            },
            s_d: function () {
                this.s_f("");
            },
            i_: function (c_bra, c_ket, s) {
                var adjustment = this.r_s(c_bra, c_ket, s);
                if (c_bra <= this.b)
                    this.b += adjustment;
                if (c_bra <= this.k)
                    this.k += adjustment;
            },
            s_t: function () {
                this.s_ch();
                return current.substring(this.b, this.k);
            },
            e_v_b: function (s) {
                return this.e_s_b(s.length, s);
            }
        };
    }
    var stemFactory = {
        EnglishStemmer: function () {
            var a_0 = [new Among("arsen", -1, -1), new Among("commun", -1, -1),
					new Among("gener", -1, -1)], a_1 = [new Among("'", -1, 1),
					new Among("'s'", 0, 1), new Among("'s", -1, 1)], a_2 = [
					new Among("ied", -1, 2), new Among("s", -1, 3),
					new Among("ies", 1, 2), new Among("sses", 1, 1),
					new Among("ss", 1, -1), new Among("us", 1, -1)], a_3 = [
					new Among("", -1, 3), new Among("bb", 0, 2),
					new Among("dd", 0, 2), new Among("ff", 0, 2),
					new Among("gg", 0, 2), new Among("bl", 0, 1),
					new Among("mm", 0, 2), new Among("nn", 0, 2),
					new Among("pp", 0, 2), new Among("rr", 0, 2),
					new Among("at", 0, 1), new Among("tt", 0, 2),
					new Among("iz", 0, 1)], a_4 = [new Among("ed", -1, 2),
					new Among("eed", 0, 1), new Among("ing", -1, 2),
					new Among("edly", -1, 2), new Among("eedly", 3, 1),
					new Among("ingly", -1, 2)], a_5 = [
					new Among("anci", -1, 3), new Among("enci", -1, 2),
					new Among("ogi", -1, 13), new Among("li", -1, 16),
					new Among("bli", 3, 12), new Among("abli", 4, 4),
					new Among("alli", 3, 8), new Among("fulli", 3, 14),
					new Among("lessli", 3, 15), new Among("ousli", 3, 10),
					new Among("entli", 3, 5), new Among("aliti", -1, 8),
					new Among("biliti", -1, 12), new Among("iviti", -1, 11),
					new Among("tional", -1, 1), new Among("ational", 14, 7),
					new Among("alism", -1, 8), new Among("ation", -1, 7),
					new Among("ization", 17, 6), new Among("izer", -1, 6),
					new Among("ator", -1, 7), new Among("iveness", -1, 11),
					new Among("fulness", -1, 9), new Among("ousness", -1, 10)], a_6 = [
					new Among("icate", -1, 4), new Among("ative", -1, 6),
					new Among("alize", -1, 3), new Among("iciti", -1, 4),
					new Among("ical", -1, 4), new Among("tional", -1, 1),
					new Among("ational", 5, 2), new Among("ful", -1, 5),
					new Among("ness", -1, 5)], a_7 = [new Among("ic", -1, 1),
					new Among("ance", -1, 1), new Among("ence", -1, 1),
					new Among("able", -1, 1), new Among("ible", -1, 1),
					new Among("ate", -1, 1), new Among("ive", -1, 1),
					new Among("ize", -1, 1), new Among("iti", -1, 1),
					new Among("al", -1, 1), new Among("ism", -1, 1),
					new Among("ion", -1, 2), new Among("er", -1, 1),
					new Among("ous", -1, 1), new Among("ant", -1, 1),
					new Among("ent", -1, 1), new Among("ment", 15, 1),
					new Among("ement", 16, 1)], a_8 = [new Among("e", -1, 1),
					new Among("l", -1, 2)], a_9 = [
					new Among("succeed", -1, -1), new Among("proceed", -1, -1),
					new Among("exceed", -1, -1), new Among("canning", -1, -1),
					new Among("inning", -1, -1), new Among("earring", -1, -1),
					new Among("herring", -1, -1), new Among("outing", -1, -1)], a_10 = [
					new Among("andes", -1, -1), new Among("atlas", -1, -1),
					new Among("bias", -1, -1), new Among("cosmos", -1, -1),
					new Among("dying", -1, 3), new Among("early", -1, 9),
					new Among("gently", -1, 7), new Among("howe", -1, -1),
					new Among("idly", -1, 6), new Among("lying", -1, 4),
					new Among("news", -1, -1), new Among("only", -1, 10),
					new Among("singly", -1, 11), new Among("skies", -1, 2),
					new Among("skis", -1, 1), new Among("sky", -1, -1),
					new Among("tying", -1, 5), new Among("ugly", -1, 8)], g_v = [
					17, 65, 16, 1], g_v_WXY = [1, 17, 65, 208, 1], g_valid_LI = [
					55, 141, 2], B_Y_found, I_p2, I_p1, habr = [r_Step_1b,
					r_Step_1c, r_Step_2, r_Step_3, r_Step_4, r_Step_5], sbp = new SnowballProgram();
            this.setCurrent = function (word) {
                sbp.s_c(word);
            };
            this.getCurrent = function () {
                return sbp.g_c();
            };
            function r_prelude() {
                var v_1 = sbp.c, v_2;
                B_Y_found = false;
                sbp.b = sbp.c;
                if (sbp.e_s(1, "'")) {
                    sbp.k = sbp.c;
                    sbp.s_d();
                }
                sbp.c = v_1;
                sbp.b = v_1;
                if (sbp.e_s(1, "y")) {
                    sbp.k = sbp.c;
                    sbp.s_f("Y");
                    B_Y_found = true;
                }
                sbp.c = v_1;
                while (true) {
                    v_2 = sbp.c;
                    if (sbp.i_g(g_v, 97, 121)) {
                        sbp.b = sbp.c;
                        if (sbp.e_s(1, "y")) {
                            sbp.k = sbp.c;
                            sbp.c = v_2;
                            sbp.s_f("Y");
                            B_Y_found = true;
                            continue;
                        }
                    }
                    if (v_2 >= sbp.l) {
                        sbp.c = v_1;
                        return;
                    }
                    sbp.c = v_2 + 1;
                }
            }
            function r_mark_regions() {
                var v_1 = sbp.c;
                I_p1 = sbp.l;
                I_p2 = I_p1;
                if (!sbp.f_a(a_0, 3)) {
                    sbp.c = v_1;
                    if (habr1()) {
                        sbp.c = v_1;
                        return;
                    }
                }
                I_p1 = sbp.c;
                if (!habr1())
                    I_p2 = sbp.c;
            }
            function habr1() {
                while (!sbp.i_g(g_v, 97, 121)) {
                    if (sbp.c >= sbp.l)
                        return true;
                    sbp.c++;
                }
                while (!sbp.o_g(g_v, 97, 121)) {
                    if (sbp.c >= sbp.l)
                        return true;
                    sbp.c++;
                }
                return false;
            }
            function r_shortv() {
                var v_1 = sbp.l - sbp.c;
                if (!(sbp.o_g_b(g_v_WXY, 89, 121)
						&& sbp.i_g_b(g_v, 97, 121) && sbp.o_g_b(g_v, 97, 121))) {
                    sbp.c = sbp.l - v_1;
                    if (!sbp.o_g_b(g_v, 97, 121)
							|| !sbp.i_g_b(g_v, 97, 121)
							|| sbp.c > sbp.lb)
                        return false;
                }
                return true;
            }
            function r_R1() {
                return I_p1 <= sbp.c;
            }
            function r_R2() {
                return I_p2 <= sbp.c;
            }
            function r_Step_1a() {
                var a_v, v_1 = sbp.l - sbp.c;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_1, 3);
                if (a_v) {
                    sbp.b = sbp.c;
                    if (a_v == 1)
                        sbp.s_d();
                } else
                    sbp.c = sbp.l - v_1;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_2, 6);
                if (a_v) {
                    sbp.b = sbp.c;
                    switch (a_v) {
                        case 1:
                            sbp.s_f("ss");
                            break;
                        case 2:
                            var c = sbp.c - 2;
                            if (sbp.lb > c || c > sbp.l) {
                                sbp.s_f("ie");
                                break;
                            }
                            sbp.c = c;
                            sbp.s_f("i");
                            break;
                        case 3:
                            do {
                                if (sbp.c <= sbp.lb)
                                    return;
                                sbp.c--;
                            } while (!sbp.i_g_b(g_v, 97, 121));
                            sbp.s_d();
                            break;
                    }
                }
            }
            function r_Step_1b() {
                var a_v, v_1, v_3, v_4;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_4, 6);
                if (a_v) {
                    sbp.b = sbp.c;
                    switch (a_v) {
                        case 1:
                            if (r_R1())
                                sbp.s_f("ee");
                            break;
                        case 2:
                            v_1 = sbp.l - sbp.c;
                            while (!sbp.i_g_b(g_v, 97, 121)) {
                                if (sbp.c <= sbp.lb)
                                    return;
                                sbp.c--;
                            }
                            sbp.c = sbp.l - v_1;
                            sbp.s_d();
                            v_3 = sbp.l - sbp.c;
                            a_v = sbp.f_a_b(a_3, 13);
                            if (a_v) {
                                sbp.c = sbp.l - v_3;
                                switch (a_v) {
                                    case 1:
                                        var c = sbp.c;
                                        sbp.i_(sbp.c, sbp.c, "e");
                                        sbp.c = c;
                                        break;
                                    case 2:
                                        sbp.k = sbp.c;
                                        if (sbp.c > sbp.lb) {
                                            sbp.c--;
                                            sbp.b = sbp.c;
                                            sbp.s_d();
                                        }
                                        break;
                                    case 3:
                                        if (sbp.c == I_p1) {
                                            v_4 = sbp.l - sbp.c;
                                            if (r_shortv()) {
                                                sbp.c = sbp.l - v_4;
                                                var c = sbp.c;
                                                sbp.i_(sbp.c, sbp.c, "e");
                                                sbp.c = c;
                                            }
                                        }
                                        break;
                                }
                            }
                            break;
                    }
                }
            }
            function r_Step_1c() {
                var v_1 = sbp.l - sbp.c;
                sbp.k = sbp.c;
                if (!sbp.e_s_b(1, "y")) {
                    sbp.c = sbp.l - v_1;
                    if (!sbp.e_s_b(1, "Y"))
                        return;
                }
                sbp.b = sbp.c;
                if (sbp.o_g_b(g_v, 97, 121) && sbp.c > sbp.lb)
                    sbp.s_f("i");
            }
            function r_Step_2() {
                var a_v;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_5, 24);
                if (a_v) {
                    sbp.b = sbp.c;
                    if (r_R1()) {
                        switch (a_v) {
                            case 1:
                                sbp.s_f("tion");
                                break;
                            case 2:
                                sbp.s_f("ence");
                                break;
                            case 3:
                                sbp.s_f("ance");
                                break;
                            case 4:
                                sbp.s_f("able");
                                break;
                            case 5:
                                sbp.s_f("ent");
                                break;
                            case 6:
                                sbp.s_f("ize");
                                break;
                            case 7:
                                sbp.s_f("ate");
                                break;
                            case 8:
                                sbp.s_f("al");
                                break;
                            case 9:
                                sbp.s_f("ful");
                                break;
                            case 10:
                                sbp.s_f("ous");
                                break;
                            case 11:
                                sbp.s_f("ive");
                                break;
                            case 12:
                                sbp.s_f("ble");
                                break;
                            case 13:
                                if (sbp.e_s_b(1, "l"))
                                    sbp.s_f("og");
                                break;
                            case 14:
                                sbp.s_f("ful");
                                break;
                            case 15:
                                sbp.s_f("less");
                                break;
                            case 16:
                                if (sbp.i_g_b(g_valid_LI, 99, 116))
                                    sbp.s_d();
                                break;
                        }
                    }
                }
            }
            function r_Step_3() {
                var a_v;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_6, 9);
                if (a_v) {
                    sbp.b = sbp.c;
                    if (r_R1()) {
                        switch (a_v) {
                            case 1:
                                sbp.s_f("tion");
                                break;
                            case 2:
                                sbp.s_f("ate");
                                break;
                            case 3:
                                sbp.s_f("al");
                                break;
                            case 4:
                                sbp.s_f("ic");
                                break;
                            case 5:
                                sbp.s_d();
                                break;
                            case 6:
                                if (r_R2())
                                    sbp.s_d();
                                break;
                        }
                    }
                }
            }
            function r_Step_4() {
                var a_v, v_1;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_7, 18);
                if (a_v) {
                    sbp.b = sbp.c;
                    if (r_R2()) {
                        switch (a_v) {
                            case 1:
                                sbp.s_d();
                                break;
                            case 2:
                                v_1 = sbp.l - sbp.c;
                                if (!sbp.e_s_b(1, "s")) {
                                    sbp.c = sbp.l - v_1;
                                    if (!sbp.e_s_b(1, "t"))
                                        return;
                                }
                                sbp.s_d();
                                break;
                        }
                    }
                }
            }
            function r_Step_5() {
                var a_v, v_1;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_8, 2);
                if (a_v) {
                    sbp.b = sbp.c;
                    switch (a_v) {
                        case 1:
                            v_1 = sbp.l - sbp.c;
                            if (!r_R2()) {
                                sbp.c = sbp.l - v_1;
                                if (!r_R1() || r_shortv())
                                    return;
                                sbp.c = sbp.l - v_1;
                            }
                            sbp.s_d();
                            break;
                        case 2:
                            if (!r_R2() || !sbp.e_s_b(1, "l"))
                                return;
                            sbp.s_d();
                            break;
                    }
                }
            }
            function r_exception2() {
                sbp.k = sbp.c;
                if (sbp.f_a_b(a_9, 8)) {
                    sbp.b = sbp.c;
                    return sbp.c <= sbp.lb;
                }
                return false;
            }
            function r_exception1() {
                var a_v;
                sbp.b = sbp.c;
                a_v = sbp.f_a(a_10, 18);
                if (a_v) {
                    sbp.k = sbp.c;
                    if (sbp.c >= sbp.l) {
                        switch (a_v) {
                            case 1:
                                sbp.s_f("ski");
                                break;
                            case 2:
                                sbp.s_f("sky");
                                break;
                            case 3:
                                sbp.s_f("die");
                                break;
                            case 4:
                                sbp.s_f("lie");
                                break;
                            case 5:
                                sbp.s_f("tie");
                                break;
                            case 6:
                                sbp.s_f("idl");
                                break;
                            case 7:
                                sbp.s_f("gentl");
                                break;
                            case 8:
                                sbp.s_f("ugli");
                                break;
                            case 9:
                                sbp.s_f("earli");
                                break;
                            case 10:
                                sbp.s_f("onli");
                                break;
                            case 11:
                                sbp.s_f("singl");
                                break;
                        }
                        return true;
                    }
                }
                return false;
            }
            function r_postlude() {
                var v_1;
                if (B_Y_found) {
                    while (true) {
                        v_1 = sbp.c;
                        sbp.b = v_1;
                        if (sbp.e_s(1, "Y")) {
                            sbp.k = sbp.c;
                            sbp.c = v_1;
                            sbp.s_f("y");
                            continue;
                        }
                        sbp.c = v_1;
                        if (sbp.c >= sbp.l)
                            return;
                        sbp.c++;
                    }
                }
            }
            this.stem = function () {
                var v_1 = sbp.c;
                if (!r_exception1()) {
                    sbp.c = v_1;
                    var c = sbp.c + 3;
                    if (0 <= c && c <= sbp.l) {
                        sbp.c = v_1;
                        r_prelude();
                        sbp.c = v_1;
                        r_mark_regions();
                        sbp.lb = v_1;
                        sbp.c = sbp.l;
                        r_Step_1a();
                        sbp.c = sbp.l;
                        if (!r_exception2())
                            for (var i = 0; i < habr.length; i++) {
                                sbp.c = sbp.l;
                                habr[i]();
                            }
                        sbp.c = sbp.lb;
                        r_postlude();
                    }
                }
                return true;
            }
        },
        RussianStemmer: function () {
            var a_0 = [new Among("\u0432", -1, 1),
					new Among("\u0438\u0432", 0, 2),
					new Among("\u044B\u0432", 0, 2),
					new Among("\u0432\u0448\u0438", -1, 1),
					new Among("\u0438\u0432\u0448\u0438", 3, 2),
					new Among("\u044B\u0432\u0448\u0438", 3, 2),
					new Among("\u0432\u0448\u0438\u0441\u044C", -1, 1),
					new Among("\u0438\u0432\u0448\u0438\u0441\u044C", 6, 2),
					new Among("\u044B\u0432\u0448\u0438\u0441\u044C", 6, 2)], a_1 = [
					new Among("\u0435\u0435", -1, 1),
					new Among("\u0438\u0435", -1, 1),
					new Among("\u043E\u0435", -1, 1),
					new Among("\u044B\u0435", -1, 1),
					new Among("\u0438\u043C\u0438", -1, 1),
					new Among("\u044B\u043C\u0438", -1, 1),
					new Among("\u0435\u0439", -1, 1),
					new Among("\u0438\u0439", -1, 1),
					new Among("\u043E\u0439", -1, 1),
					new Among("\u044B\u0439", -1, 1),
					new Among("\u0435\u043C", -1, 1),
					new Among("\u0438\u043C", -1, 1),
					new Among("\u043E\u043C", -1, 1),
					new Among("\u044B\u043C", -1, 1),
					new Among("\u0435\u0433\u043E", -1, 1),
					new Among("\u043E\u0433\u043E", -1, 1),
					new Among("\u0435\u043C\u0443", -1, 1),
					new Among("\u043E\u043C\u0443", -1, 1),
					new Among("\u0438\u0445", -1, 1),
					new Among("\u044B\u0445", -1, 1),
					new Among("\u0435\u044E", -1, 1),
					new Among("\u043E\u044E", -1, 1),
					new Among("\u0443\u044E", -1, 1),
					new Among("\u044E\u044E", -1, 1),
					new Among("\u0430\u044F", -1, 1),
					new Among("\u044F\u044F", -1, 1)], a_2 = [
					new Among("\u0435\u043C", -1, 1),
					new Among("\u043D\u043D", -1, 1),
					new Among("\u0432\u0448", -1, 1),
					new Among("\u0438\u0432\u0448", 2, 2),
					new Among("\u044B\u0432\u0448", 2, 2),
					new Among("\u0449", -1, 1),
					new Among("\u044E\u0449", 5, 1),
					new Among("\u0443\u044E\u0449", 6, 2)], a_3 = [
					new Among("\u0441\u044C", -1, 1),
					new Among("\u0441\u044F", -1, 1)], a_4 = [
					new Among("\u043B\u0430", -1, 1),
					new Among("\u0438\u043B\u0430", 0, 2),
					new Among("\u044B\u043B\u0430", 0, 2),
					new Among("\u043D\u0430", -1, 1),
					new Among("\u0435\u043D\u0430", 3, 2),
					new Among("\u0435\u0442\u0435", -1, 1),
					new Among("\u0438\u0442\u0435", -1, 2),
					new Among("\u0439\u0442\u0435", -1, 1),
					new Among("\u0435\u0439\u0442\u0435", 7, 2),
					new Among("\u0443\u0439\u0442\u0435", 7, 2),
					new Among("\u043B\u0438", -1, 1),
					new Among("\u0438\u043B\u0438", 10, 2),
					new Among("\u044B\u043B\u0438", 10, 2),
					new Among("\u0439", -1, 1),
					new Among("\u0435\u0439", 13, 2),
					new Among("\u0443\u0439", 13, 2),
					new Among("\u043B", -1, 1),
					new Among("\u0438\u043B", 16, 2),
					new Among("\u044B\u043B", 16, 2),
					new Among("\u0435\u043C", -1, 1),
					new Among("\u0438\u043C", -1, 2),
					new Among("\u044B\u043C", -1, 2),
					new Among("\u043D", -1, 1),
					new Among("\u0435\u043D", 22, 2),
					new Among("\u043B\u043E", -1, 1),
					new Among("\u0438\u043B\u043E", 24, 2),
					new Among("\u044B\u043B\u043E", 24, 2),
					new Among("\u043D\u043E", -1, 1),
					new Among("\u0435\u043D\u043E", 27, 2),
					new Among("\u043D\u043D\u043E", 27, 1),
					new Among("\u0435\u0442", -1, 1),
					new Among("\u0443\u0435\u0442", 30, 2),
					new Among("\u0438\u0442", -1, 2),
					new Among("\u044B\u0442", -1, 2),
					new Among("\u044E\u0442", -1, 1),
					new Among("\u0443\u044E\u0442", 34, 2),
					new Among("\u044F\u0442", -1, 2),
					new Among("\u043D\u044B", -1, 1),
					new Among("\u0435\u043D\u044B", 37, 2),
					new Among("\u0442\u044C", -1, 1),
					new Among("\u0438\u0442\u044C", 39, 2),
					new Among("\u044B\u0442\u044C", 39, 2),
					new Among("\u0435\u0448\u044C", -1, 1),
					new Among("\u0438\u0448\u044C", -1, 2),
					new Among("\u044E", -1, 2),
					new Among("\u0443\u044E", 44, 2)], a_5 = [
					new Among("\u0430", -1, 1),
					new Among("\u0435\u0432", -1, 1),
					new Among("\u043E\u0432", -1, 1),
					new Among("\u0435", -1, 1),
					new Among("\u0438\u0435", 3, 1),
					new Among("\u044C\u0435", 3, 1),
					new Among("\u0438", -1, 1),
					new Among("\u0435\u0438", 6, 1),
					new Among("\u0438\u0438", 6, 1),
					new Among("\u0430\u043C\u0438", 6, 1),
					new Among("\u044F\u043C\u0438", 6, 1),
					new Among("\u0438\u044F\u043C\u0438", 10, 1),
					new Among("\u0439", -1, 1),
					new Among("\u0435\u0439", 12, 1),
					new Among("\u0438\u0435\u0439", 13, 1),
					new Among("\u0438\u0439", 12, 1),
					new Among("\u043E\u0439", 12, 1),
					new Among("\u0430\u043C", -1, 1),
					new Among("\u0435\u043C", -1, 1),
					new Among("\u0438\u0435\u043C", 18, 1),
					new Among("\u043E\u043C", -1, 1),
					new Among("\u044F\u043C", -1, 1),
					new Among("\u0438\u044F\u043C", 21, 1),
					new Among("\u043E", -1, 1), new Among("\u0443", -1, 1),
					new Among("\u0430\u0445", -1, 1),
					new Among("\u044F\u0445", -1, 1),
					new Among("\u0438\u044F\u0445", 26, 1),
					new Among("\u044B", -1, 1), new Among("\u044C", -1, 1),
					new Among("\u044E", -1, 1),
					new Among("\u0438\u044E", 30, 1),
					new Among("\u044C\u044E", 30, 1),
					new Among("\u044F", -1, 1),
					new Among("\u0438\u044F", 33, 1),
					new Among("\u044C\u044F", 33, 1)], a_6 = [
					new Among("\u043E\u0441\u0442", -1, 1),
					new Among("\u043E\u0441\u0442\u044C", -1, 1)], a_7 = [
					new Among("\u0435\u0439\u0448\u0435", -1, 1),
					new Among("\u043D", -1, 2),
					new Among("\u0435\u0439\u0448", -1, 1),
					new Among("\u044C", -1, 3)], g_v = [33, 65, 8, 232], I_p2, I_pV, sbp = new SnowballProgram();
            this.setCurrent = function (word) {
                sbp.s_c(word);
            };
            this.getCurrent = function () {
                return sbp.g_c();
            };
            function habr3() {
                while (!sbp.i_g(g_v, 1072, 1103)) {
                    if (sbp.c >= sbp.l)
                        return false;
                    sbp.c++;
                }
                return true;
            }
            function habr4() {
                while (!sbp.o_g(g_v, 1072, 1103)) {
                    if (sbp.c >= sbp.l)
                        return false;
                    sbp.c++;
                }
                return true;
            }
            function r_mark_regions() {
                I_pV = sbp.l;
                I_p2 = I_pV;
                if (habr3()) {
                    I_pV = sbp.c;
                    if (habr4())
                        if (habr3())
                            if (habr4())
                                I_p2 = sbp.c;
                }
            }
            function r_R2() {
                return I_p2 <= sbp.c;
            }
            function habr2(a, n) {
                var a_v, v_1;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a, n);
                if (a_v) {
                    sbp.b = sbp.c;
                    switch (a_v) {
                        case 1:
                            v_1 = sbp.l - sbp.c;
                            if (!sbp.e_s_b(1, "\u0430")) {
                                sbp.c = sbp.l - v_1;
                                if (!sbp.e_s_b(1, "\u044F"))
                                    return false;
                            }
                        case 2:
                            sbp.s_d();
                            break;
                    }
                    return true;
                }
                return false;
            }
            function r_perfective_gerund() {
                return habr2(a_0, 9);
            }
            function habr1(a, n) {
                var a_v;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a, n);
                if (a_v) {
                    sbp.b = sbp.c;
                    if (a_v == 1)
                        sbp.s_d();
                    return true;
                }
                return false;
            }
            function r_adjective() {
                return habr1(a_1, 26);
            }
            function r_adjectival() {
                var a_v;
                if (r_adjective()) {
                    habr2(a_2, 8);
                    return true;
                }
                return false;
            }
            function r_reflexive() {
                return habr1(a_3, 2);
            }
            function r_verb() {
                return habr2(a_4, 46);
            }
            function r_noun() {
                habr1(a_5, 36);
            }
            function r_derivational() {
                var a_v;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_6, 2);
                if (a_v) {
                    sbp.b = sbp.c;
                    if (r_R2() && a_v == 1)
                        sbp.s_d();
                }
            }
            function r_tidy_up() {
                var a_v;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_7, 4);
                if (a_v) {
                    sbp.b = sbp.c;
                    switch (a_v) {
                        case 1:
                            sbp.s_d();
                            sbp.k = sbp.c;
                            if (!sbp.e_s_b(1, "\u043D"))
                                break;
                            sbp.b = sbp.c;
                        case 2:
                            if (!sbp.e_s_b(1, "\u043D"))
                                break;
                        case 3:
                            sbp.s_d();
                            break;
                    }
                }
            }
            this.stem = function () {
                r_mark_regions();
                sbp.c = sbp.l;
                if (sbp.c < I_pV)
                    return false;
                sbp.lb = I_pV;
                if (!r_perfective_gerund()) {
                    sbp.c = sbp.l;
                    if (!r_reflexive())
                        sbp.c = sbp.l;
                    if (!r_adjectival()) {
                        sbp.c = sbp.l;
                        if (!r_verb()) {
                            sbp.c = sbp.l;
                            r_noun();
                        }
                    }
                }
                sbp.c = sbp.l;
                sbp.k = sbp.c;
                if (sbp.e_s_b(1, "\u0438")) {
                    sbp.b = sbp.c;
                    sbp.s_d();
                } else
                    sbp.c = sbp.l;
                r_derivational();
                sbp.c = sbp.l;
                r_tidy_up();
                return true;
            }
        }
    }
    var stemName = lng.substring(0, 1).toUpperCase()
			+ lng.substring(1).toLowerCase() + "Stemmer";
    return new stemFactory[stemName]();
}

function loadWS() {
    stopword.push("a");
    stopword.push("about");
    stopword.push("abov");
    stopword.push("accord");
    stopword.push("across");
    stopword.push("after");
    stopword.push("against");
    stopword.push("albeit");
    stopword.push("all");
    stopword.push("almost");
    stopword.push("alon");
    stopword.push("along");
    stopword.push("alreadi");
    stopword.push("also");
    stopword.push("although");
    stopword.push("alwai");
    stopword.push("among");
    stopword.push("amongst");
    stopword.push("amp");
    stopword.push("an");
    stopword.push("and");
    stopword.push("ani");
    stopword.push("anoth");
    stopword.push("anybodi");
    stopword.push("anyhow");
    stopword.push("anyon");
    stopword.push("anyth");
    stopword.push("anywai");
    stopword.push("anywh");
    stopword.push("apart");
    stopword.push("ar");
    stopword.push("arj");
    stopword.push("around");
    stopword.push("as");
    stopword.push("at");
    stopword.push("av");
    stopword.push("avail");
    stopword.push("back");
    stopword.push("be");
    stopword.push("becam");
    stopword.push("becau");
    stopword.push("becom");
    stopword.push("been");
    stopword.push("befor");
    stopword.push("beforehand");
    stopword.push("behind");
    stopword.push("below");
    stopword.push("besid");
    stopword.push("best");
    stopword.push("between");
    stopword.push("beyond");
    stopword.push("both");
    stopword.push("but");
    stopword.push("by");
    stopword.push("can");
    stopword.push("cannot");
    stopword.push("canst");
    stopword.push("certain");
    stopword.push("cf");
    stopword.push("cfrd");
    stopword.push("cgi");
    stopword.push("chat");
    stopword.push("choo");
    stopword.push("click");
    stopword.push("co");
    stopword.push("com");
    stopword.push("conduct");
    stopword.push("consid");
    stopword.push("contrariwi");
    stopword.push("could");
    stopword.push("crd");
    stopword.push("cu");
    stopword.push("dai");
    stopword.push("der");
    stopword.push("describ");
    stopword.push("design");
    stopword.push("determin");
    stopword.push("did");
    stopword.push("differ");
    stopword.push("discuss");
    stopword.push("do");
    stopword.push("doe");
    stopword.push("don");
    stopword.push("dost");
    stopword.push("doth");
    stopword.push("doubl");
    stopword.push("down");
    stopword.push("dual");
    stopword.push("due");
    stopword.push("dure");
    stopword.push("each");
    stopword.push("edu");
    stopword.push("either");
    stopword.push("el");
    stopword.push("elsewh");
    stopword.push("email");
    stopword.push("enough");
    stopword.push("et");
    stopword.push("etc");
    stopword.push("even");
    stopword.push("ever");
    stopword.push("everi");
    stopword.push("everybodi");
    stopword.push("everyon");
    stopword.push("everyth");
    stopword.push("everywh");
    stopword.push("except");
    stopword.push("faq");
    stopword.push("far");
    stopword.push("farther");
    stopword.push("farthest");
    stopword.push("few");
    stopword.push("ff");
    stopword.push("file");
    stopword.push("find");
    stopword.push("first");
    stopword.push("for");
    stopword.push("formerli");
    stopword.push("forth");
    stopword.push("forward");
    stopword.push("found");
    stopword.push("free");
    stopword.push("from");
    stopword.push("front");
    stopword.push("ftp");
    stopword.push("further");
    stopword.push("furthermor");
    stopword.push("furthest");
    stopword.push("gener");
    stopword.push("get");
    stopword.push("given");
    stopword.push("go");
    stopword.push("ha");
    stopword.push("had");
    stopword.push("halv");
    stopword.push("hardli");
    stopword.push("hast");
    stopword.push("hath");
    stopword.push("have");
    stopword.push("he");
    stopword.push("help");
    stopword.push("henc");
    stopword.push("henceforth");
    stopword.push("her");
    stopword.push("here");
    stopword.push("hereabout");
    stopword.push("hereaft");
    stopword.push("herebi");
    stopword.push("herein");
    stopword.push("hereto");
    stopword.push("hereupon");
    stopword.push("herself");
    stopword.push("hi");
    stopword.push("him");
    stopword.push("himself");
    stopword.push("hindmost");
    stopword.push("hither");
    stopword.push("hitherto");
    stopword.push("home");
    stopword.push("how");
    stopword.push("howev");
    stopword.push("howsoev");
    stopword.push("i");
    stopword.push("ie");
    stopword.push("if");
    stopword.push("in");
    stopword.push("inasmuch");
    stopword.push("ind");
    stopword.push("indoor");
    stopword.push("insid");
    stopword.push("insomuch");
    stopword.push("instead");
    stopword.push("into");
    stopword.push("investig");
    stopword.push("inward");
    stopword.push("is");
    stopword.push("it");
    stopword.push("itself");
    stopword.push("just");
    stopword.push("kg");
    stopword.push("kind");
    stopword.push("km");
    stopword.push("last");
    stopword.push("latest");
    stopword.push("latter");
    stopword.push("latterli");
    stopword.push("less");
    stopword.push("lest");
    stopword.push("let");
    stopword.push("like");
    stopword.push("link");
    stopword.push("littl");
    stopword.push("ltd");
    stopword.push("made");
    stopword.push("mai");
    stopword.push("mani");
    stopword.push("mayb");
    stopword.push("me");
    stopword.push("meantim");
    stopword.push("meanwhil");
    stopword.push("middot");
    stopword.push("might");
    stopword.push("more");
    stopword.push("moreov");
    stopword.push("most");
    stopword.push("mostli");
    stopword.push("mr");
    stopword.push("ms");
    stopword.push("msn");
    stopword.push("much");
    stopword.push("must");
    stopword.push("my");
    stopword.push("myself");
    stopword.push("need");
    stopword.push("neither");
    stopword.push("net");
    stopword.push("never");
    stopword.push("nevertheless");
    stopword.push("next");
    stopword.push("ng");
    stopword.push("no");
    stopword.push("nobodi");
    stopword.push("none");
    stopword.push("nonetheless");
    stopword.push("noon");
    stopword.push("nope");
    stopword.push("nor");
    stopword.push("not");
    stopword.push("encyclopedia");
    stopword.push("search");
    stopword.push("noth");
    stopword.push("notwithstandi");
    stopword.push("now");
    stopword.push("nowadai");
    stopword.push("nowher");
    stopword.push("obtain");
    stopword.push("of");
    stopword.push("off");
    stopword.push("often");
    stopword.push("ok");
    stopword.push("on");
    stopword.push("onc");
    stopword.push("onli");
    stopword.push("onto");
    stopword.push("or");
    stopword.push("org");
    stopword.push("other");
    stopword.push("otherwi");
    stopword.push("ought");
    stopword.push("our");
    stopword.push("ourselv");
    stopword.push("out");
    stopword.push("outsid");
    stopword.push("over");
    stopword.push("own");
    stopword.push("pdf");
    stopword.push("per");
    stopword.push("ether");
    stopword.push("case");
    stopword.push("wai");
    stopword.push("york");
    stopword.push("perhap");
    stopword.push("php");
    stopword.push("plea");
    stopword.push("plenti");
    stopword.push("possibl");
    stopword.push("quit");
    stopword.push("quot");
    stopword.push("rar");
    stopword.push("rather");
    stopword.push("realli");
    stopword.push("relat");
    stopword.push("requir");
    stopword.push("round");
    stopword.push("said");
    stopword.push("sake");
    stopword.push("same");
    stopword.push("sang");
    stopword.push("save");
    stopword.push("saw");
    stopword.push("see");
    stopword.push("seem");
    stopword.push("seen");
    stopword.push("seldom");
    stopword.push("select");
    stopword.push("selv");
    stopword.push("sent");
    stopword.push("sever");
    stopword.push("sfrd");
    stopword.push("shalt");
    stopword.push("she");
    stopword.push("should");
    stopword.push("shown");
    stopword.push("sidewai");
    stopword.push("signif");
    stopword.push("sinc");
    stopword.push("slept");
    stopword.push("slew");
    stopword.push("slung");
    stopword.push("slunk");
    stopword.push("smote");
    stopword.push("so");
    stopword.push("some");
    stopword.push("somebodi");
    stopword.push("somehow");
    stopword.push("someon");
    stopword.push("someth");
    stopword.push("sometim");
    stopword.push("somewhat");
    stopword.push("somewh");
    stopword.push("spake");
    stopword.push("spat");
    stopword.push("spoke");
    stopword.push("spoken");
    stopword.push("sprang");
    stopword.push("sprung");
    stopword.push("srd");
    stopword.push("stave");
    stopword.push("still");
    stopword.push("studi");
    stopword.push("submit");
    stopword.push("such");
    stopword.push("suppo");
    stopword.push("than");
    stopword.push("that");
    stopword.push("the");
    stopword.push("thee");
    stopword.push("thei");
    stopword.push("their");
    stopword.push("them");
    stopword.push("themselv");
    stopword.push("then");
    stopword.push("thenc");
    stopword.push("thenceforth");
    stopword.push("there");
    stopword.push("thereabout");
    stopword.push("thereaft");
    stopword.push("therebi");
    stopword.push("therefor");
    stopword.push("therein");
    stopword.push("thereof");
    stopword.push("thereon");
    stopword.push("thereto");
    stopword.push("thereupon");
    stopword.push("these");
    stopword.push("thi");
    stopword.push("those");
    stopword.push("thou");
    stopword.push("though");
    stopword.push("thrice");
    stopword.push("through");
    stopword.push("throughout");
    stopword.push("thru");
    stopword.push("thu");
    stopword.push("thy");
    stopword.push("thyself");
    stopword.push("till");
    stopword.push("to");
    stopword.push("togeth");
    stopword.push("too");
    stopword.push("top");
    stopword.push("total");
    stopword.push("toward");
    stopword.push("type");
    stopword.push("unabl");
    stopword.push("und");
    stopword.push("under");
    stopword.push("underneath");
    stopword.push("unless");
    stopword.push("unlik");
    stopword.push("until");
    stopword.push("up");
    stopword.push("upon");
    stopword.push("upward");
    stopword.push("url");
    stopword.push("us");
    stopword.push("variou");
    stopword.push("veri");
    stopword.push("via");
    stopword.push("vs");
    stopword.push("wa");
    stopword.push("want");
    stopword.push("we");
    stopword.push("well");
    stopword.push("were");
    stopword.push("what");
    stopword.push("whatev");
    stopword.push("whatsoev");
    stopword.push("when");
    stopword.push("whenc");
    stopword.push("whenev");
    stopword.push("whensoev");
    stopword.push("where");
    stopword.push("wherea");
    stopword.push("whereabout");
    stopword.push("whereaft");
    stopword.push("whereat");
    stopword.push("wherebi");
    stopword.push("wherefor");
    stopword.push("wherefrom");
    stopword.push("wherein");
    stopword.push("whereinto");
    stopword.push("whereof");
    stopword.push("whereon");
    stopword.push("wheresoev");
    stopword.push("whereto");
    stopword.push("whereunto");
    stopword.push("whereupon");
    stopword.push("wherev");
    stopword.push("wherewith");
    stopword.push("whether");
    stopword.push("whew");
    stopword.push("which");
    stopword.push("whichev");
    stopword.push("whichsoevr");
    stopword.push("while");
    stopword.push("whilst");
    stopword.push("whither");
    stopword.push("who");
    stopword.push("whoa");
    stopword.push("whoever");
    stopword.push("whole");
    stopword.push("whom");
    stopword.push("whomev");
    stopword.push("whomsoev");
    stopword.push("whose");
    stopword.push("whosoev");
    stopword.push("why");
    stopword.push("will");
    stopword.push("wilt");
    stopword.push("with");
    stopword.push("within");
    stopword.push("without");
    stopword.push("wor");
    stopword.push("worst");
    stopword.push("would");
    stopword.push("wow");
    stopword.push("ye");
    stopword.push("yet");
    stopword.push("yipp");
    stopword.push("you");
    stopword.push("your");
    stopword.push("yourself");
    stopword.push("yourselv");
    stopword.push("http");
    stopword.push("www");
    stopword.push("post");
    stopword.push("wikipedia");
    stopword.push("wikiproject");
    stopword.push("templat");
    stopword.push("retriev");
    stopword.push("edit");
    stopword.push("new");
    stopword.push("refer");
    stopword.push("articl");
    stopword.push("state");
    stopword.push("categori");
    stopword.push("unit");
    stopword.push("put");
    stopword.push("follow");
    stopword.push("de");
    stopword.push("man");
    stopword.push("time");
    stopword.push("la");
    stopword.push("great");
    stopword.push("two");
    stopword.push("know");
    stopword.push("good");
    stopword.push("old");
    stopword.push("men");
    stopword.push("shall");
    stopword.push("le");
    stopword.push("came");
    stopword.push("project");
    stopword.push("come");
    stopword.push("make");
    stopword.push("long");
    stopword.push("work");
    stopword.push("am");
    stopword.push("en");
    stopword.push("que");
    stopword.push("sai");
    stopword.push("think");
    stopword.push("life");
    stopword.push("went");
    stopword.push("take");
    stopword.push("peopl");
    stopword.push("thought");
    stopword.push("def");
    stopword.push("again");
    stopword.push("place");
    stopword.push("awai");
    stopword.push("young");
    stopword.push("die");
    stopword.push("give");
    stopword.push("hand");
    stopword.push("ey");
    stopword.push("part");
    stopword.push("left");
    stopword.push("thing");
    stopword.push("year");
    stopword.push("took");
    stopword.push("three");
    stopword.push("right");
    stopword.push("face");
    stopword.push("becaus");
    stopword.push("tell");
    stopword.push("son");
    stopword.push("love");
    stopword.push("un");
    stopword.push("hous");
    stopword.push("hw");
    stopword.push("got");
    stopword.push("god");
    stopword.push("call");
    stopword.push("look");
    stopword.push("set");
    stopword.push("told");
    stopword.push("night");
    stopword.push("knew");
    stopword.push("se");
    stopword.push("qui");
    stopword.push("name");
    stopword.push("done");
    stopword.push("better");
    stopword.push("full");
    stopword.push("du");
    stopword.push("gave");
    stopword.push("countri");
    stopword.push("er");
    stopword.push("gutenberg");
    stopword.push("soon");
    stopword.push("cours");
    stopword.push("ask");
    stopword.push("small");
    stopword.push("ne");
    stopword.push("il");
    stopword.push("side");
    stopword.push("brought");
    stopword.push("po");
    stopword.push("taken");
    stopword.push("end");
    stopword.push("turn");
    stopword.push("p");
    stopword.push("felt");
    stopword.push("lord");
    stopword.push("dan");
    stopword.push("oh");
    stopword.push("began");
    stopword.push("present");
    stopword.push("larg");
    stopword.push("den");
    stopword.push("poor");
    stopword.push("pa");
    stopword.push("tt");
    stopword.push("stood");
    stopword.push("half");
    stopword.push("public");
    stopword.push("morn");
    stopword.push("sir");
    stopword.push("keep");
    stopword.push("b");
    stopword.push("hundr");
    stopword.push("je");
    stopword.push("war");
    stopword.push("mean");
    stopword.push("form");
    stopword.push("pour");
    stopword.push("receiv");
    stopword.push("voic");
    stopword.push("believ");
    stopword.push("y");
    stopword.push("white");
    stopword.push("miss");
    stopword.push("near");
    stopword.push("pass");
    stopword.push("matter");
    stopword.push("read");
    stopword.push("TRUE");
    stopword.push("point");
    stopword.push("person");
    stopword.push("high");
    stopword.push("met");
    stopword.push("dear");
    stopword.push("least");
    stopword.push("hear");
    stopword.push("known");
    stopword.push("four");
    stopword.push("hope");
    stopword.push("au");
    stopword.push("leav");
    stopword.push("sure");
    stopword.push("open");
    stopword.push("inde");
    stopword.push("wish");
    stopword.push("gone");
    stopword.push("lai");
    stopword.push("held");
    stopword.push("ce");
    stopword.push("vou");
    stopword.push("return");
    stopword.push("land");
    stopword.push("thousand");
    stopword.push("bodi");
    stopword.push("air");
    stopword.push("sat");
    stopword.push("speak");
    stopword.push("m");
    stopword.push("feel");
    stopword.push("rest");
    stopword.push("busi");
    stopword.push("zu");
    stopword.push("cri");
    stopword.push("plu");
    stopword.push("lost");
    stopword.push("repli");
    stopword.push("kept");
    stopword.push("five");
    stopword.push("care");
    stopword.push("fire");
    stopword.push("short");
    stopword.push("manner");
    stopword.push("citi");
    stopword.push("fell");
    stopword.push("abl");
    stopword.push("caus");
    stopword.push("strong");
    stopword.push("par");
    stopword.push("ten");
    stopword.push("o");
    stopword.push("england");
    stopword.push("dead");
    stopword.push("bring");
    stopword.push("sur");
    stopword.push("foundat");
    stopword.push("live");
    stopword.push("doubt");
    stopword.push("hard");
    stopword.push("soul");
    stopword.push("sort");
    stopword.push("fine");
    stopword.push("hold");
    stopword.push("ladi");
    stopword.push("beauti");
    stopword.push("sens");
    stopword.push("close");
    stopword.push("sa");
    stopword.push("understand");
    stopword.push("show");
    stopword.push("lui");
    stopword.push("written");
    stopword.push("n");
    stopword.push("common");
    stopword.push("est");
    stopword.push("fear");
    stopword.push("parti");
    stopword.push("readi");
    stopword.push("forc");
    stopword.push("carri");
    stopword.push("earli");
    stopword.push("talk");
    stopword.push("ja");
    stopword.push("paid");
    stopword.push("arm");
    stopword.push("necessari");
    stopword.push("si");
    stopword.push("spirit");
    stopword.push("da");
    stopword.push("idea");
    stopword.push("ebook");
    stopword.push("charact");
    stopword.push("reach");
    stopword.push("copyright");
    stopword.push("sea");
    stopword.push("appear");
    stopword.push("van");
    stopword.push("sight");
    stopword.push("interest");
    stopword.push("six");
    stopword.push("st");
    stopword.push("von");
    stopword.push("book");
    stopword.push("continu");
    stopword.push("avec");
    stopword.push("strang");
    stopword.push("copi");
    stopword.push("ag");
    stopword.push("meet");
    stopword.push("longer");
    stopword.push("stori");
    stopword.push("sn");
    stopword.push("deep");
    stopword.push("nearli");
    stopword.push("line");
    stopword.push("footnot");
    stopword.push("later");
    stopword.push("suddenli");
    stopword.push("ad");
    stopword.push("sich");
    stopword.push("stand");
    stopword.push("art");
    stopword.push("real");
    stopword.push("nicht");
    stopword.push("rose");
    stopword.push("es");
    stopword.push("sie");
    stopword.push("mile");
    stopword.push("pretti");
    stopword.push("act");
    stopword.push("suppos");
    stopword.push("ich");
    stopword.push("tabl");
    stopword.push("river");
    stopword.push("cut");
    stopword.push("chang");
    stopword.push("past");
    stopword.push("nou");
    stopword.push("enter");
    stopword.push("happi");
    stopword.push("posit");
    stopword.push("franc");
    stopword.push("els");
    stopword.push("clear");
    stopword.push("late");
    stopword.push("american");
    stopword.push("bed");
    stopword.push("laid");
    stopword.push("cold");
    stopword.push("bad");
    stopword.push("sound");
    stopword.push("rememb");
    stopword.push("view");
    stopword.push("led");
    stopword.push("low");
    stopword.push("mit");
    stopword.push("fair");
    stopword.push("purpos");
    stopword.push("pai");
    stopword.push("comm");
    stopword.push("armi");
    stopword.push("daughter");
    stopword.push("note");
    stopword.push("run");
    stopword.push("dr");
    stopword.push("fall");
    stopword.push("dem");
    stopword.push("effect");
    stopword.push("sun");
    stopword.push("road");
    stopword.push("eti");
    stopword.push("avait");
    stopword.push("charg");
    stopword.push("tri");
    stopword.push("certainli");
    stopword.push("import");
    stopword.push("literari");
    stopword.push("servic");
    stopword.push("red");
    stopword.push("probabl");
    stopword.push("futur");
    stopword.push("pr");
    stopword.push("especi");
    stopword.push("quill");
    stopword.push("desir");
    stopword.push("ell");
    stopword.push("send");
    stopword.push("offic");
    stopword.push("archiv");
    stopword.push("greater");
    stopword.push("te");
    stopword.push("big");
    stopword.push("peac");
    stopword.push("hair");
    stopword.push("pleasur");
    stopword.push("includ");
    stopword.push("fld");
    stopword.push("hors");
    stopword.push("glad");
    stopword.push("remain");
    stopword.push("opinion");
    stopword.push("het");
    stopword.push("bien");
    stopword.push("histori");
    stopword.push("plai");
    stopword.push("di");
    stopword.push("tout");
    stopword.push("cd");
    stopword.push("wrote");
    stopword.push("wild");
    stopword.push("ist");
    stopword.push("ran");
    stopword.push("govern");
    stopword.push("donat");
    stopword.push("al");
    stopword.push("length");
    stopword.push("ah");
    stopword.push("master");
    stopword.push("col");
    stopword.push("particular");
    stopword.push("mark");
    stopword.push("inform");
    stopword.push("cett");
    stopword.push("bear");
    stopword.push("fellow");
    stopword.push("attent");
    stopword.push("walk");
    stopword.push("chief");
    stopword.push("strength");
    stopword.push("mine");
    stopword.push("pari");
    stopword.push("duti");
    stopword.push("drew");
    stopword.push("singl");
    stopword.push("visit");
    stopword.push("begin");
    stopword.push("heavi");
    stopword.push("ein");
    stopword.push("immedi");
    stopword.push("captain");
    stopword.push("unto");
    stopword.push("e");
    stopword.push("try");
    stopword.push("rich");
    stopword.push("plain");
    stopword.push("sweet");
    stopword.push("madam");
    stopword.push("minut");
    stopword.push("troubl");
    stopword.push("write");
    stopword.push("chanc");
    stopword.push("regard");
    stopword.push("fill");
    stopword.push("s");
    stopword.push("tree");
    stopword.push("ou");
    stopword.push("presenc");
    stopword.push("mere");
    stopword.push("auf");
    stopword.push("secret");
    stopword.push("former");
    stopword.push("struck");
    stopword.push("learn");
    stopword.push("happen");
    stopword.push("influenc");
    stopword.push("condit");
    stopword.push("twenti");
    stopword.push("window");
    stopword.push("georg");
    stopword.push("afraid");
    stopword.push("wrong");
    stopword.push("silenc");
    stopword.push("broken");
    stopword.push("rais");
    stopword.push("u");
    stopword.push("caught");
    stopword.push("simpl");
    stopword.push("lip");
    stopword.push("figur");
    stopword.push("ago");
    stopword.push("easili");
    stopword.push("nobl");
    stopword.push("dit");
    stopword.push("een");
    stopword.push("ancient");
    stopword.push("blue");
    stopword.push("agre");
    stopword.push("easi");
    stopword.push("ship");
    stopword.push("action");
    stopword.push("stai");
    stopword.push("hat");
    stopword.push("move");
    stopword.push("properti");
    stopword.push("fit");
    stopword.push("grew");
    stopword.push("afterward");
    stopword.push("born");
    stopword.push("imposs");
    stopword.push("worth");
    stopword.push("arriv");
    stopword.push("occas");
    stopword.push("pleas");
    stopword.push("green");
    stopword.push("marri");
    stopword.push("third");
    stopword.push("mouth");
    stopword.push("sleep");
    stopword.push("period");
    stopword.push("fresh");
    stopword.push("faith");
    stopword.push("system");
    stopword.push("entir");
    stopword.push("smile");
    stopword.push("blockquot");
    stopword.push("goe");
    stopword.push("usual");
    stopword.push("charl");
    stopword.push("cover");
    stopword.push("bound");
    stopword.push("respect");
    stopword.push("quiet");
    stopword.push("dinner");
    stopword.push("express");
    stopword.push("stop");
    stopword.push("slowli");
    stopword.push("consider");
    stopword.push("princ");
    stopword.push("wonder");
    stopword.push("mari");
    stopword.push("greatest");
    stopword.push("provid");
    stopword.push("etext");
    stopword.push("perfect");
    stopword.push("court");
    stopword.push("exclaim");
    stopword.push("youth");
    stopword.push("cost");
    stopword.push("scarc");
    stopword.push("sudden");
    stopword.push("evil");
    stopword.push("danger");
    stopword.push("main");
    stopword.push("notic");
    stopword.push("piec");
    stopword.push("polit");
    stopword.push("sister");
    stopword.push("proper");
    stopword.push("c");
    stopword.push("start");
    stopword.push("allow");
    stopword.push("expect");
    stopword.push("joi");
    stopword.push("privat");
    stopword.push("bright");
    stopword.push("result");
    stopword.push("school");
    stopword.push("sit");
    stopword.push("lo");
    stopword.push("individu");
    stopword.push("south");
    stopword.push("mon");
    stopword.push("meant");
    stopword.push("food");
    stopword.push("wide");
    stopword.push("week");
    stopword.push("seven");
    stopword.push("tear");
    stopword.push("opportun");
    stopword.push("valu");
    stopword.push("och");
    stopword.push("wait");
    stopword.push("broke");
    stopword.push("observ");
    stopword.push("support");
    stopword.push("villag");
    stopword.push("fight");
    stopword.push("experi");
    stopword.push("medium");
    stopword.push("stone");
    stopword.push("circumst");
    stopword.push("discov");
    stopword.push("access");
    stopword.push("henri");
    stopword.push("offer");
    stopword.push("grand");
    stopword.push("effort");
    stopword.push("societi");
    stopword.push("boat");
    stopword.push("san");
    stopword.push("date");
    stopword.push("origin");
    stopword.push("difficult");
    stopword.push("convers");
    stopword.push("produc");
    stopword.push("paragraph");
    stopword.push("cast");
    stopword.push("tone");
    stopword.push("laugh");
    stopword.push("intend");
    stopword.push("step");
    stopword.push("honour");
    stopword.push("direct");
    stopword.push("terribl");
    stopword.push("silent");
    stopword.push("eight");
    stopword.push("prepar");
    stopword.push("lie");
    stopword.push("scene");
    stopword.push("attempt");
    stopword.push("associ");
    stopword.push("drawn");
    stopword.push("fifti");
    stopword.push("fast");
    stopword.push("street");
    stopword.push("wall");
    stopword.push("troop");
    stopword.push("modern");
    stopword.push("militari");
    stopword.push("author");
    stopword.push("field");
    stopword.push("heaven");
    stopword.push("fee");
    stopword.push("quickli");
    stopword.push("perfectli");
    stopword.push("soft");
    stopword.push("bit");
    stopword.push("chair");
    stopword.push("cry");
    stopword.push("hot");
    stopword.push("dat");
    stopword.push("declar");
    stopword.push("passag");
    stopword.push("music");
    stopword.push("christ");
    stopword.push("soldier");
    stopword.push("pictur");
    stopword.push("simpli");
    stopword.push("pleasant");
    stopword.push("fix");
    stopword.push("permiss");
    stopword.push("speech");
    stopword.push("marriag");
    stopword.push("race");
    stopword.push("religi");
    stopword.push("west");
    stopword.push("w");
    stopword.push("l");
    stopword.push("beneath");
    stopword.push("duke");
    stopword.push("ill");
    stopword.push("offici");
    stopword.push("distribut");
    stopword.push("spent");
    stopword.push("justic");
    stopword.push("straight");
    stopword.push("trust");
    stopword.push("break");
    stopword.push("equal");
    stopword.push("north");
    stopword.push("v");
    stopword.push("kill");
    stopword.push("threw");
    stopword.push("watch");
    stopword.push("understood");
    stopword.push("forget");
    stopword.push("ex");
    stopword.push("instant");
    stopword.push("middl");
    stopword.push("sin");
    stopword.push("success");
    stopword.push("built");
    stopword.push("oblig");
    stopword.push("fortun");
    stopword.push("spite");
    stopword.push("wise");
    stopword.push("moral");
    stopword.push("aux");
    stopword.push("plan");
    stopword.push("touch");
    stopword.push("rise");
    stopword.push("flower");
    stopword.push("social");
    stopword.push("higher");
    stopword.push("rate");
    stopword.push("garden");
    stopword.push("corner");
    stopword.push("jame");
    stopword.push("island");
    stopword.push("spring");
    stopword.push("pain");
    stopword.push("wood");
    stopword.push("instanc");
    stopword.push("vain");
    stopword.push("directli");
    stopword.push("suffici");
    stopword.push("journei");
    stopword.push("pale");
    stopword.push("dress");
    stopword.push("worthi");
    stopword.push("lead");
    stopword.push("non");
    stopword.push("ly");
    stopword.push("grave");
    stopword.push("possess");
    stopword.push("legal");
    stopword.push("queen");
    stopword.push("lower");
    stopword.push("special");
    stopword.push("nation");
    stopword.push("warm");
    stopword.push("degre");
    stopword.push("memori");
    stopword.push("promis");
    stopword.push("wie");
    stopword.push("situat");
    stopword.push("foreign");
    stopword.push("deux");
    stopword.push("greek");
    stopword.push("rome");
    stopword.push("member");
    stopword.push("vast");
    stopword.push("ma");
    stopword.push("escap");
    stopword.push("loss");
    stopword.push("prove");
    stopword.push("complet");
    stopword.push("passion");
    stopword.push("leur");
    stopword.push("shot");
    stopword.push("difficulti");
    stopword.push("courag");
    stopword.push("ordinari");
    stopword.push("mighti");
    stopword.push("fallen");
    stopword.push("nativ");
    stopword.push("concern");
    stopword.push("accept");
    stopword.push("board");
    stopword.push("seriou");
    stopword.push("spread");
    stopword.push("del");
    stopword.push("spot");
    stopword.push("colonel");
    stopword.push("twelv");
    stopword.push("prevent");
    stopword.push("camp");
    stopword.push("winter");
    stopword.push("excel");
    stopword.push("addit");
    stopword.push("america");
    stopword.push("michael");
    stopword.push("tax");
    stopword.push("fait");
    stopword.push("car");
    stopword.push("exampl");
    stopword.push("silver");
    stopword.push("glass");
    stopword.push("share");
    stopword.push("centuri");
    stopword.push("engag");
    stopword.push("class");
    stopword.push("shook");
    stopword.push("train");
    stopword.push("mention");
    stopword.push("lot");
    stopword.push("europ");
    stopword.push("decid");
    stopword.push("particularli");
    stopword.push("greatli");
    stopword.push("method");
    stopword.push("final");
    stopword.push("curiou");
    stopword.push("opposit");
    stopword.push("pure");
    stopword.push("floor");
    stopword.push("exist");
    stopword.push("thirti");
    stopword.push("wors");
    stopword.push("refund");
    stopword.push("affair");
    stopword.push("sorri");
    stopword.push("servant");
    stopword.push("safe");
    stopword.push("anxiou");
    stopword.push("doctor");
    stopword.push("thrown");
    stopword.push("extent");
    stopword.push("narrow");
    stopword.push("pride");
    stopword.push("breath");
    stopword.push("repeat");
    stopword.push("similar");
    stopword.push("surpris");
    stopword.push("exactli");
    stopword.push("march");
    stopword.push("dog");
    stopword.push("iron");
    stopword.push("crowd");
    stopword.push("sought");
    stopword.push("con");
    stopword.push("rule");
    stopword.push("dollar");
    stopword.push("page");
    stopword.push("shore");
    stopword.push("trademark");
    stopword.push("drink");
    stopword.push("judg");
    stopword.push("serv");
    stopword.push("attack");
    stopword.push("movement");
    stopword.push("million");
    stopword.push("glanc");
    stopword.push("trade");
    stopword.push("lose");
    stopword.push("broad");
    stopword.push("grace");
    stopword.push("distant");
    stopword.push("sign");
    stopword.push("highest");
    stopword.push("advantag");
    stopword.push("peter");
    stopword.push("clearli");
    stopword.push("honest");
    stopword.push("freeli");
    stopword.push("jesu");
    stopword.push("royal");
    stopword.push("juli");
    stopword.push("loui");
    stopword.push("seat");
    stopword.push("illustr");
    stopword.push("path");
    stopword.push("proud");
    stopword.push("finish");
    stopword.push("space");
    stopword.push("request");
    stopword.push("fulli");
    stopword.push("sad");
    stopword.push("quick");
    stopword.push("evid");
    stopword.push("sky");
    stopword.push("auch");
    stopword.push("fanci");
    stopword.push("choos");
    stopword.push("drop");
    stopword.push("dry");
    stopword.push("tast");
    stopword.push("sword");
    stopword.push("confid");
    stopword.push("amount");
    stopword.push("health");
    stopword.push("liberti");
    stopword.push("wine");
    stopword.push("li");
    stopword.push("shut");
    stopword.push("settl");
    stopword.push("report");
    stopword.push("creat");
    stopword.push("june");
    stopword.push("secur");
    stopword.push("permit");
    stopword.push("daili");
    stopword.push("seek");
    stopword.push("f");
    stopword.push("tall");
    stopword.push("princip");
    stopword.push("monsieur");
    stopword.push("portion");
    stopword.push("carefulli");
    stopword.push("mountain");
    stopword.push("add");
    stopword.push("measur");
    stopword.push("glori");
    stopword.push("dare");
    stopword.push("cloth");
    stopword.push("peculiar");
    stopword.push("build");
    stopword.push("brave");
    stopword.push("honor");
    stopword.push("dream");
    stopword.push("hung");
    stopword.push("refus");
    stopword.push("licens");
    stopword.push("gentl");
    stopword.push("occupi");
    stopword.push("ear");
    stopword.push("sick");
    stopword.push("presid");
    stopword.push("thick");
    stopword.push("progress");
    stopword.push("claim");
    stopword.push("im");
    stopword.push("game");
    stopword.push("aid");
    stopword.push("check");
    stopword.push("succeed");
    stopword.push("asid");
    stopword.push("contrari");
    stopword.push("fond");
    stopword.push("draw");
    stopword.push("tu");
    stopword.push("holi");
    stopword.push("grow");
    stopword.push("bottom");
    stopword.push("event");
    stopword.push("emperor");
    stopword.push("anim");
    stopword.push("fals");
    stopword.push("expens");
    stopword.push("section");
    stopword.push("judgment");
    stopword.push("numer");
    stopword.push("spanish");
    stopword.push("frequent");
    stopword.push("creatur");
    stopword.push("hill");
    stopword.push("altogeth");
    stopword.push("washington");
    stopword.push("famou");
    stopword.push("otherwis");
    stopword.push("cross");
    stopword.push("activ");
    stopword.push("sharp");
    stopword.push("bank");
    stopword.push("tou");
    stopword.push("forgotten");
    stopword.push("advanc");
    stopword.push("capit");
    stopword.push("jack");
    stopword.push("seiz");
    stopword.push("contact");
    stopword.push("che");
    stopword.push("necess");
    stopword.push("taught");
    stopword.push("op");
    stopword.push("establish");
    stopword.push("golden");
    stopword.push("intellectu");
    stopword.push("emploi");
    stopword.push("bread");
    stopword.push("thin");
    stopword.push("fail");
    stopword.push("suffer");
    stopword.push("fate");
    stopword.push("phrase");
    stopword.push("hart");
    stopword.push("sont");
    stopword.push("novemb");
    stopword.push("thoma");
    stopword.push("stream");
    stopword.push("coast");
    stopword.push("hall");
    stopword.push("david");
    stopword.push("popular");
    stopword.push("awar");
    stopword.push("appoint");
    stopword.push("bent");
    stopword.push("gather");
    stopword.push("slight");
    stopword.push("group");
    stopword.push("aber");
    stopword.push("appar");
    stopword.push("remark");
    stopword.push("neck");
    stopword.push("forest");
    stopword.push("encor");
    stopword.push("rock");
    stopword.push("remov");
    stopword.push("bore");
    stopword.push("grown");
    stopword.push("publish");
    stopword.push("bird");
    stopword.push("midst");
    stopword.push("divin");
    stopword.push("h");
    stopword.push("carriag");
    stopword.push("join");
    stopword.push("noch");
    stopword.push("popul");
    stopword.push("wealth");
    stopword.push("comfort");
    stopword.push("list");
    stopword.push("blow");
    stopword.push("tender");
    stopword.push("stranger");
    stopword.push("speci");
    stopword.push("decemb");
    stopword.push("handsom");
    stopword.push("sacr");
    stopword.push("actual");
    stopword.push("yellow");
    stopword.push("surfac");
    stopword.push("consequ");
    stopword.push("piti");
    stopword.push("throw");
    stopword.push("januari");
    stopword.push("j");
    stopword.push("weak");
    stopword.push("distinguish");
    stopword.push("prai");
    stopword.push("freedom");
    stopword.push("stage");
    stopword.push("mir");
    stopword.push("angri");
    stopword.push("brown");
    stopword.push("satisfi");
    stopword.push("rain");
    stopword.push("principl");
    stopword.push("owner");
    stopword.push("tire");
    stopword.push("poet");
    stopword.push("practic");
    stopword.push("familiar");
    stopword.push("reader");
    stopword.push("por");
    stopword.push("delight");
    stopword.push("weather");
    stopword.push("fish");
    stopword.push("oli");
    stopword.push("nine");
    stopword.push("approach");
    stopword.push("weight");
    stopword.push("truli");
    stopword.push("materi");
    stopword.push("paul");
    stopword.push("finger");
    stopword.push("accompani");
    stopword.push("suggest");
    stopword.push("rode");
    stopword.push("grass");
    stopword.push("resolv");
    stopword.push("richard");
    stopword.push("quarter");
    stopword.push("style");
    stopword.push("regular");
    stopword.push("song");
    stopword.push("og");
    stopword.push("educ");
    stopword.push("contain");
    stopword.push("drive");
    stopword.push("virtu");
    stopword.push("fashion");
    stopword.push("driven");
    stopword.push("proceed");
    stopword.push("gate");
    stopword.push("sentenc");
    stopword.push("twice");
    stopword.push("wore");
    stopword.push("extraordinari");
    stopword.push("guard");
    stopword.push("beat");
    stopword.push("august");
    stopword.push("burst");
    stopword.push("calm");
    stopword.push("dont");
    stopword.push("mass");
    stopword.push("som");
    stopword.push("price");
    stopword.push("scienc");
    stopword.push("increas");
    stopword.push("treat");
    stopword.push("lift");
    stopword.push("thank");
    stopword.push("nur");
    stopword.push("base");
    stopword.push("april");
    stopword.push("explain");
    stopword.push("propos");
    stopword.push("heat");
    stopword.push("address");
    stopword.push("previou");
    stopword.push("geniu");
    stopword.push("constant");
    stopword.push("imagin");
    stopword.push("guess");
    stopword.push("chose");
    stopword.push("nach");
    stopword.push("impress");
    stopword.push("uncl");
    stopword.push("vallei");
    stopword.push("snow");
    stopword.push("su");
    stopword.push("unknown");
    stopword.push("print");
    stopword.push("statement");
    stopword.push("compli");
    stopword.push("machin");
    stopword.push("quietli");
    stopword.push("occur");
    stopword.push("fut");
    stopword.push("rank");
    stopword.push("listen");
    stopword.push("tongu");
    stopword.push("absolut");
    stopword.push("larger");
    stopword.push("edg");
    stopword.push("ii");
    stopword.push("ceas");
    stopword.push("loud");
    stopword.push("capabl");
    stopword.push("struggl");
    stopword.push("q");
    stopword.push("wound");
    stopword.push("philip");
    stopword.push("forti");
    stopword.push("drove");
    stopword.push("qex");
    stopword.push("favour");
    stopword.push("moi");
    stopword.push("burn");
    stopword.push("fifteen");
    stopword.push("volunt");
    stopword.push("titl");
    stopword.push("seri");
    stopword.push("pound");
    stopword.push("admit");
    stopword.push("collect");
    stopword.push("slave");
    stopword.push("mission");
    stopword.push("size");
    stopword.push("om");
    stopword.push("upper");
    stopword.push("priest");
    stopword.push("vessel");
    stopword.push("companion");
    stopword.push("height");
    stopword.push("nice");
    stopword.push("destroi");
    stopword.push("separ");
    stopword.push("absenc");
    stopword.push("r");
    stopword.push("breast");
    stopword.push("ni");
    stopword.push("content");
    stopword.push("nois");
    stopword.push("demand");
    stopword.push("inhabit");
    stopword.push("releas");
    stopword.push("pair");
    stopword.push("bui");
    stopword.push("sympathi");
    stopword.push("sum");
    stopword.push("slow");
    stopword.push("begun");
    stopword.push("hurt");
    stopword.push("qau");
    stopword.push("shoulder");
    stopword.push("current");
    stopword.push("wisdom");
    stopword.push("niet");
    stopword.push("rapidli");
    stopword.push("gain");
    stopword.push("affect");
    stopword.push("splendid");
    stopword.push("advic");
    stopword.push("squar");
    stopword.push("whisper");
    stopword.push("bitter");
    stopword.push("mich");
    stopword.push("aliv");
    stopword.push("majesti");
    stopword.push("itali");
    stopword.push("han");
    stopword.push("press");
    stopword.push("task");
    stopword.push("fool");
    stopword.push("cruel");
    stopword.push("sundai");
    stopword.push("shape");
    stopword.push("birth");
    stopword.push("polici");
    stopword.push("credit");
    stopword.push("sold");
    stopword.push("superior");
    stopword.push("professor");
    stopword.push("storm");
    stopword.push("catch");
    stopword.push("delic");
    stopword.push("palac");
    stopword.push("peu");
    stopword.push("won");
    stopword.push("constantli");
    stopword.push("ihm");
    stopword.push("loos");
    stopword.push("leg");
    stopword.push("zijn");
    stopword.push("italian");
    stopword.push("empti");
    stopword.push("qualiti");
    stopword.push("sorrow");
    stopword.push("belief");
    stopword.push("civil");
    stopword.push("um");
    stopword.push("dozen");
    stopword.push("commit");
    stopword.push("station");
    stopword.push("nearer");
    stopword.push("chosen");
    stopword.push("satisfact");
    stopword.push("friendli");
    stopword.push("fort");
    stopword.push("smoke");
    stopword.push("germani");
    stopword.push("dy");
    stopword.push("brief");
    stopword.push("kindli");
    stopword.push("huge");
    stopword.push("literatur");
    stopword.push("bought");
    stopword.push("dass");
    stopword.push("appli");
    stopword.push("proof");
    stopword.push("gradual");
    stopword.push("spiritu");
    stopword.push("ik");
    stopword.push("ihr");
    stopword.push("flesh");
    stopword.push("partli");
    stopword.push("fruit");
    stopword.push("deepli");
    stopword.push("east");
    stopword.push("connect");
    stopword.push("brilliant");
    stopword.push("hij");
    stopword.push("suppli");
    stopword.push("coat");
    stopword.push("edward");
    stopword.push("limit");
    stopword.push("firm");
    stopword.push("ride");
    stopword.push("pwh");
    stopword.push("ring");
    stopword.push("enjoi");
    stopword.push("centr");
    stopword.push("supper");
    stopword.push("wear");
    stopword.push("sooner");
    stopword.push("attach");
    stopword.push("instantli");
    stopword.push("shame");
    stopword.push("rough");
    stopword.push("minist");
    stopword.push("protect");
    stopword.push("intent");
    stopword.push("assist");
    stopword.push("highli");
    stopword.push("sein");
    stopword.push("soil");
    stopword.push("featur");
    stopword.push("sd");
    stopword.push("coupl");
    stopword.push("fought");
    stopword.push("count");
    stopword.push("grief");
    stopword.push("irish");
    stopword.push("conscienc");
    stopword.push("exercis");
    stopword.push("assur");
    stopword.push("det");
    stopword.push("relief");
    stopword.push("buri");
    stopword.push("femal");
    stopword.push("welcom");
    stopword.push("digniti");
    stopword.push("hate");
    stopword.push("counten");
    stopword.push("site");
    stopword.push("render");
    stopword.push("blind");
    stopword.push("extrem");
    stopword.push("fairli");
    stopword.push("mad");
    stopword.push("process");
    stopword.push("bare");
    stopword.push("poetri");
    stopword.push("brain");
    stopword.push("surround");
    stopword.push("parent");
    stopword.push("rare");
    stopword.push("entranc");
    stopword.push("introduc");
    stopword.push("control");
    stopword.push("clean");
    stopword.push("consciou");
    stopword.push("durch");
    stopword.push("varieti");
    stopword.push("donc");
    stopword.push("immens");
    stopword.push("etait");
    stopword.push("devot");
    stopword.push("level");
    stopword.push("virginia");
    stopword.push("dull");
    stopword.push("aunt");
    stopword.push("eager");
    stopword.push("star");
    stopword.push("sacrific");
    stopword.push("compel");
    stopword.push("faint");
    stopword.push("teeth");
    stopword.push("thoroughli");
    stopword.push("labor");
    stopword.push("pull");
    stopword.push("text");
    stopword.push("colour");
    stopword.push("cup");
    stopword.push("grai");
    stopword.push("strike");
    stopword.push("descript");
    stopword.push("citizen");
    stopword.push("tea");
    stopword.push("preciou");
    stopword.push("custom");
    stopword.push("messag");
    stopword.push("choic");
    stopword.push("divid");
    stopword.push("older");
    stopword.push("grant");
    stopword.push("excit");
    stopword.push("sou");
    stopword.push("sing");
    stopword.push("einen");
    stopword.push("knee");
    stopword.push("prayer");
    stopword.push("merci");
    stopword.push("aw");
    stopword.push("fly");
    stopword.push("accustom");
    stopword.push("avoid");
    stopword.push("solemn");
    stopword.push("compos");
    stopword.push("mental");
    stopword.push("india");
    stopword.push("comput");
    stopword.push("theori");
    stopword.push("suit");
    stopword.push("recogn");
    stopword.push("devil");
    stopword.push("weari");
    stopword.push("aros");
    stopword.push("violent");
    stopword.push("fault");
    stopword.push("crown");
    stopword.push("intellig");
    stopword.push("hidden");
    stopword.push("acquaint");
    stopword.push("volum");
    stopword.push("statu");
    stopword.push("color");
    stopword.push("hurri");
    stopword.push("aussi");
    stopword.push("mistress");
    stopword.push("septemb");
    stopword.push("prais");
    stopword.push("writer");
    stopword.push("g");
    stopword.push("deliv");
    stopword.push("dust");
    stopword.push("pocket");
    stopword.push("ihn");
    stopword.push("repres");
    stopword.push("una");
    stopword.push("arrang");
    stopword.push("nose");
    stopword.push("dread");
    stopword.push("tale");
    stopword.push("terror");
    stopword.push("beg");
    stopword.push("kiss");
    stopword.push("scatter");
    stopword.push("attitud");
    stopword.push("ei");
    stopword.push("perceiv");
    stopword.push("innoc");
    stopword.push("utterli");
    stopword.push("quand");
    stopword.push("chiefli");
    stopword.push("yard");
    stopword.push("cool");
    stopword.push("attend");
    stopword.push("cousin");
    stopword.push("circl");
    stopword.push("energi");
    stopword.push("union");
    stopword.push("februari");
    stopword.push("dire");
    stopword.push("prison");
    stopword.push("liabil");
    stopword.push("ascii");
    stopword.push("temp");
    stopword.push("favor");
    stopword.push("younger");
    stopword.push("product");
    stopword.push("votr");
    stopword.push("cloud");
    stopword.push("ahead");
    stopword.push("wenn");
    stopword.push("provis");
    stopword.push("harri");
    stopword.push("anger");
    stopword.push("worn");
    stopword.push("charm");
    stopword.push("yesterdai");
    stopword.push("rush");
    stopword.push("victori");
    stopword.push("local");
    stopword.push("att");
    stopword.push("joseph");
    stopword.push("castl");
    stopword.push("lover");
    stopword.push("vision");
    stopword.push("bold");
    stopword.push("rien");
    stopword.push("explan");
    stopword.push("miser");
    stopword.push("branch");
    stopword.push("oder");
    stopword.push("perform");
    stopword.push("eas");
    stopword.push("lake");
    stopword.push("teach");
    stopword.push("worship");
    stopword.push("stock");
    stopword.push("ireland");
    stopword.push("quantiti");
    stopword.push("earlier");
    stopword.push("interrupt");
    stopword.push("confess");
    stopword.push("convinc");
    stopword.push("valuabl");
    stopword.push("sell");
    stopword.push("roof");
    stopword.push("growth");
    stopword.push("commerci");
    stopword.push("aan");
    stopword.push("pardon");
    stopword.push("record");
    stopword.push("replac");
    stopword.push("develop");
    stopword.push("treatment");
    stopword.push("arthur");
    stopword.push("fat");
    stopword.push("wir");
    stopword.push("mistak");
    stopword.push("napoleon");
    stopword.push("gloriou");
    stopword.push("inclin");
    stopword.push("anywher");
    stopword.push("milk");
    stopword.push("bridg");
    stopword.push("excus");
    stopword.push("humbl");
    stopword.push("everywher");
    stopword.push("meat");
    stopword.push("cela");
    stopword.push("skin");
    stopword.push("gentli");
    stopword.push("likewis");
    stopword.push("dick");
    stopword.push("consent");
    stopword.push("adopt");
    stopword.push("guid");
    stopword.push("parliament");
    stopword.push("wit");
    stopword.push("throne");
    stopword.push("indic");
    stopword.push("visibl");
    stopword.push("flat");
    stopword.push("wick");
    stopword.push("univers");
    stopword.push("exact");
    stopword.push("readili");
    stopword.push("ignor");
    stopword.push("voyag");
    stopword.push("homm");
    stopword.push("paus");
    stopword.push("latin");
    stopword.push("foolish");
    stopword.push("israel");
    stopword.push("trial");
    stopword.push("unfortun");
    stopword.push("singular");
    stopword.push("gift");
    stopword.push("proport");
    stopword.push("hotel");
    stopword.push("spend");
    stopword.push("fled");
    stopword.push("mysteri");
    stopword.push("european");
    stopword.push("audienc");
    stopword.push("safeti");
    stopword.push("etern");
    stopword.push("skill");
    stopword.push("gun");
    stopword.push("locat");
    stopword.push("bow");
    stopword.push("readabl");
    stopword.push("fierc");
    stopword.push("earnest");
    stopword.push("sail");
    stopword.push("bill");
    stopword.push("sui");
    stopword.push("extend");
    stopword.push("cattl");
    stopword.push("push");
    stopword.push("plant");
    stopword.push("templ");
    stopword.push("admir");
    stopword.push("band");
    stopword.push("med");
    stopword.push("danc");
    stopword.push("doubtless");
    stopword.push("detail");
    stopword.push("bless");
    stopword.push("compani");
    stopword.push("cnet");
    stopword.push("internet");
    stopword.push("editor");
}