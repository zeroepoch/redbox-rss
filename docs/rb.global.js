var rb = {
    registerNamespace: function(n) {
        var l = window;
        var h = n.split(".");
        for (var j = 0, k = h.length; j < k; j++) {
            var o = h[j];
            var m = l[o];
            if (!m) {
                m = l[o] = {}
            }
            l = m
        }
    },
    createDelegate: function(d, c) {
        return function() {
            return c.apply(d, arguments)
        }
    },
    _tmplCache: {},
    parseTemplate: function(e, t, r, s) {
        var q = "";
        try {
            t.html("");
            var u = $(e).html();
            var v = rb._tmplCache[u];
            if (!v) {
                var w = "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" + u.replace(/[\r\t\n]/g, " ").replace(/'(?=[^#]*#>)/g, "\t").split("'").join("\\'").split("\t").join("'").replace(/<#=(.+?)#>/g, "',$1,'").split("<#").join("');").split("#>").join("p.push('") + "');}return p.join('');";
                v = new Function("obj", w);
                rb._tmplCache[u] = v
            }
            for (var o = 0; o < r.length; o++) {
                r[o].__index = o;
                var p = $(v(r[o]));
                t.append(p);
                if (s) {
                    s(p, r[o])
                }
            }
            return t
        } catch (n) {
            alert(n)
        }
    },
    serialize: function(b) {
        return JSON.stringify(b)
    },
    deserialize: function(data) {
        var exp = data.replace(new RegExp('(^|[^\\\\])\\"\\\\/Date\\((-?[0-9]+)\\)\\\\/\\"', "g"), "$1new Date($2)");
        return eval("(" + exp + ")")
    },
    lastLog: new Date(),
    log: function(c, d) {
        c += " " + (new Date() - rb.lastLog);
        rb.lastLog = new Date();
        if (window.console) {
            console.log(c)
        }
    },
    getPropDiff: function(g, f, e) {
        var h = {};
        $.each(e, function(a, b) {
            if (g[b] != f[b]) {
                if (f[b]) {
                    h[b] = f[b]
                } else {
                    h[b] = g[b]
                }
            }
        });
        return h
    },
    getPropCount: function(e) {
        var d = 0;
        for (var f in e) {
            if (e.hasOwnProperty(f)) {
                d++
            }
        }
        return d
    },
    isArray: function(b) {
        return Object.prototype.toString.call(b) === "[object Array]"
    },
    isNullOrEmpty: function(b) {
        return b == "" || b == null
    }
};
rb.validation = {
    init: function(d) {
        jQuery.validator.addMethod("person", function(a, b) {
            return this.optional(b) || /^[a-zA-Z][a-zA-Z '-]*$/.test(a)
        });
        jQuery.validator.addMethod("cvv", function(a, b) {
            return this.optional(b) || /^\d{3,4}$/.test(a)
        });
        jQuery.validator.addMethod("zip", function(a, b) {
            return this.optional(b) || /^\d{5}([\-]\d{4})?$/.test(a)
        });
        jQuery.validator.addMethod("password", function(a, b) {
            return this.optional(b) || a.length >= 6 && a.length <= 12
        });
        jQuery.validator.addMethod("phoneUS", function(a, b) {
            a = a.replace(/\s+/g, "");
            return this.optional(b) || a.length > 9 && a.match(/^(\+?1?([\-\s]?(\d{3}|\(\d{3}\)))[\-\s]?)?(\d{3})([\-\s]?\d{4})$/)
        });
        for (var c in d) {
            jQuery.validator.messages[c] = d[c]
        }
    },
    registerControls: function(t, q, o, w) {
        var n = {};
        for (var r = 0; r < q.length; r++) {
            var m = q[r];
            var v = m.ctl.attr("id");
            if (v) {
                m.ctl.attr("name", v)
            } else {
                v = m.ctl.attr("name")
            }
            n[v] = {
                required: m.required
            };
            if (m.required) {
                if (m.ctl.attr("id")) {
                    t.find("label[for=" + v + "]").addClass("required")
                } else {
                    m.ctl.parents("label:first").addClass("required")
                }
            }
            if (m.type) {
                n[v][m.type] = true
            }
        }
        var p = {};
        if (w != null) {
            for (var r = 0; r < w.length; r++) {
                var s = w[r];
                var u = s.ctl.attr("name");
                p[u] = s.message
            }
        }
        return t.validate({
            onsubmit: false,
            onkeyup: false,
            onfocusout: false,
            errorClass: "ui-state-error-text",
            validClass: "",
            highlight: function(c, b, a) {
                $(c).addClass(b).removeClass(a);
                if ($(c).attr("id")) {
                    $(c.form).find("label[for=" + c.id + "]").addClass(b)
                } else {
                    $(c).parents("label:first").addClass(b)
                }
            },
            unhighlight: function(c, b, a) {
                $(c).removeClass(b).addClass(a);
                if ($(c).attr("id")) {
                    $(c.form).find("label[for=" + c.id + "]").removeClass(b)
                } else {
                    $(c).parents("label:first").removeClass(b)
                }
            },
            errorContainer: o,
            errorLabelContainer: o != null ? "#" + o.attr("id") + " ul" : null,
            wrapper: "li",
            rules: n,
            messages: p,
            showErrors: function(d, c) {
                for (var b = 0; b < c.length; b++) {
                    for (var a = b + 1; a < c.length; a++) {
                        if (c[b].message == c[a].message) {
                            c[a].message = ""
                        }
                    }
                }
                this.defaultShowErrors();
                $("input.reg_password").attr("id", "");
                if (rb.util.Responsive == true) {
                    $("html, body").animate({
                        scrollTop: 0
                    }, "slow")
                }
            }
        })
    }
};
rb.UI = {
    createButton: function(c, d) {
        return $(String.format('<a class="jqbutton {0}"><span>{1}</span></a>', d, c)).button()
    },
    showThemeRoller: function() {
        if (!/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
            alert("Sorry, due to security restrictions, this tool only works in Firefox");
            return false
        }
        if (window.jquitr) {
            jquitr.addThemeRoller()
        } else {
            jquitr = {};
            jquitr.s = document.createElement("script");
            jquitr.s.src = "http://jqueryui.com/themeroller/developertool/developertool.js.php";
            document.getElementsByTagName("head")[0].appendChild(jquitr.s)
        }
        return false
    },
    lazyLoad: function(e, d, f) {
        if (!this.lazyLoadEnabled()) {
            if (f) {
                f(e)
            }
            return
        }
        if (d == null) {
            d = 100
        }
        e.appear(function() {
            var a = $(this);
            if (a.attr("original")) {
                setTimeout(function() {
                    a.attr("src", a.attr("original"));
                    a.attr("original", null);
                    if (f) {
                        f(a)
                    }
                }, d)
            }
            a.unbind("appear")
        })
    },
    lazyLoadEnabled: function() {
        return typeof($.fn.appear) != "undefined"
    }
};
rb.UI.eventHandlerList = function() {
    this._list = {}
};
rb.UI.eventHandlerList.prototype = {
    addHandler: function(e, d) {
        var f = this._getEvent(e, true);
        f.push(d)
    },
    removeHandler: function(f, e) {
        var h = this._getEvent(f);
        if (!h) {
            return
        }
        for (var g = 0; g < h.length; g++) {
            if (h[g] === e) {
                h.splice(g, 1);
                return true
            }
        }
        return false
    },
    getHandler: function(c) {
        var d = this._getEvent(c);
        if (!d || !d.length) {
            return null
        }
        var d = d.length === 1 ? [d[0]] : Array.apply(null, d);
        return function(b, h) {
            for (var g = 0, a = d.length; g < a; g++) {
                d[g](b, h)
            }
        }
    },
    _getEvent: function(d, e) {
        var f = this._list[d];
        if (!f) {
            if (!e) {
                return null
            }
            this._list[d] = f = []
        }
        return f
    }
};
rb.eventPublisher = {
    _initEventHandlerList: function() {
        this._eventHandlerList = new rb.UI.eventHandlerList()
    },
    addHandler: function(d, c) {
        this._eventHandlerList.addHandler(d, c)
    },
    removeHandler: function(d, c) {
        this._eventHandlerList.removeHandler(d, c)
    },
    raiseEvent: function(f, e) {
        var d = this._eventHandlerList.getHandler(f);
        if (d) {
            if (e == null) {
                e = {}
            }
            d(this, e);
            return e.cancel != true
        }
        return true
    }
};
rb.util = {
    IsAuthenticated: false,
    CustomerNumber: "",
    UserExperience: "",
    Responsive: false
};
rb.component = {
    controls: [],
    register: function(f, g, e) {
        var h = new g();
        e.id = f;
        rb.component._setProperties(h, e);
        rb.component.controls[f] = h;
        return h
    },
    find: function(b) {
        return rb.component.controls[b]
    },
    findFirstByType: function(d) {
        var c = this.findByType(d);
        if (c.length > 0) {
            return c[0]
        }
        return null
    },
    findByType: function(f) {
        var c = [];
        for (var h in rb.component.controls) {
            var g = rb.component.controls[h];
            if (g.get_type != null && g.get_type() == f) {
                c.push(g)
            }
        }
        return c
    },
    _setProperties: function(f, g) {
        for (var k in g) {
            var h = g[k];
            var j = f["set_" + k];
            if (typeof(j) === "function") {
                j.apply(f, [h])
            }
        }
    }
};
rb.persistence = {
    clientSession: {
        defaultScope: "global",
        save: function(h, f) {
            var e = rb.persistence.clientSession._load(f);
            for (var g in h) {
                if (h[g] != null) {
                    e[g] = h[g]
                } else {
                    delete e[g]
                }
            }
            rb.persistence.clientSession._save(e, f)
        },
        set: function(h, g, f) {
            var e = rb.persistence.clientSession._load(f);
            e[h] = g;
            rb.persistence.clientSession._save(e, f)
        },
        get: function(f, e) {
            var d = rb.persistence.clientSession._load(e);
            if (f) {
                return d[f]
            }
            return d
        },
        remove: function(f, e) {
            var d = rb.persistence.clientSession._load(e);
            if (d[f] !== null) {
                delete d[f]
            }
            rb.persistence.clientSession._save(d, e)
        },
        removeAll: function(f, e) {
            var d = rb.persistence.clientSession._load(e);
            $.each($.isArray(f) ? f : arguments, function(b, a) {
                delete d[a]
            });
            rb.persistence.clientSession._save(d, e)
        },
        clear: function() {
            this._setCookie("")
        },
        _load: function(c) {
            if (c == null) {
                c = rb.persistence.clientSession.defaultScope
            }
            var d = rb.persistence.clientSession._loadDict();
            if (d[c] == null) {
                d[c] = {}
            }
            return d[c]
        },
        _loadDict: function() {
            var c = "";
            var d = this._getCookie().match(/RB@@(.+)@@/);
            if (d != null) {
                c = d[1]
            }
            return $.deparam(c, true)
        },
        _save: function(g, h) {
            if (h == null) {
                h = rb.persistence.clientSession.defaultScope
            }
            var f = rb.persistence.clientSession._loadDict();
            for (var k in g) {
                if (g.hasOwnProperty(k)) {
                    g[k] = this._encode(g[k])
                }
            }
            f[h] = g;
            var j = $.param(f);
            this._setCookie(String.format("RB@@{0}@@", j))
        },
        _getCookie: function() {
            var j = document.cookie;
            var f = "rb.persist=";
            var h = null;
            var k = 0;
            var g = 0;
            if (j.length > 0) {
                k = j.indexOf(f);
                if (k != -1) {
                    k += f.length;
                    g = j.indexOf(";", k);
                    if (g == -1) {
                        g = j.length
                    }
                    h = this._decode(j.substring(k, g))
                }
            }
            if (h == null) {
                return ""
            }
            return (h)
        },
        _setCookie: function(b) {
            document.cookie = "rb.persist=" + b + "; path=/;"
        },
        _decode: function(c) {
            var d = "";
            if (c) {
                c = c.replace(/%252B/g, "PLUSSIGN");
                c = unescape(c.replace(/%2B/g, "PLUSSIGN"));
                d = c.replace(/PLUSSIGN/g, "%2B")
            }
            return d
        },
        _encode: function(c) {
            var d = "";
            if (c) {
                d = encodeURIComponent(c.toString().replace(/\+/g, "PLUSSIGN"));
                d = d.replace(/PLUSSIGN/g, "+")
            }
            d = c;
            return d
        }
    },
    cookielib: {
        get: function(e, f) {
            var d = rb.persistence.cookielib._load(e);
            if (f) {
                if (d[f] != null) {
                    return rb.deserialize(d[f])
                }
                return null
            }
            return d
        },
        set: function(g, h, e) {
            var f = rb.persistence.cookielib._load(g);
            f[h] = rb.serialize(e);
            rb.persistence.cookielib._save(g, f)
        },
        remove: function(e, f) {
            var d = rb.persistence.cookielib._load(e);
            if (d[f] !== undefined) {
                delete d[f]
            }
            rb.persistence.cookielib._save(e, d)
        },
        save: function(f, h) {
            var e = rb.persistence.cookielib._load(f);
            for (var g in h) {
                if (h[g] != null) {
                    e[g] = h[g]
                } else {
                    delete e[g]
                }
            }
            rb.persistence.cookielib._save(f, e)
        },
        _load: function(b) {
            return rb.deserialize(rb.persistence.cookielib._getCookie(b, "{}"))
        },
        _getCookie: function(n, o) {
            var k = document.cookie;
            var j = n + "=";
            var l = null;
            var m = 0;
            var h = 0;
            if (k.length > 0) {
                m = k.indexOf(j);
                if (m != -1) {
                    m += j.length;
                    h = k.indexOf(";", m);
                    if (h == -1) {
                        h = k.length
                    }
                    l = unescape(k.substring(m, h))
                }
            }
            if (l == null) {
                return o
            }
            return (l)
        },
        _save: function(g, f) {
            var k = 7;
            if (g == "rb30") {
                k = 30
            }
            var h = new Date();
            h.setTime(h.getTime() + (k * 24 * 60 * 60 * 1000));
            var j = rb.serialize(f);
            document.cookie = String.format("{0}={1}; expires={2}; path=/", g, escape(j), h.toGMTString())
        }
    },
    cookie: {
        save: function(b) {
            rb.persistence.cookielib.save("rbcookiebag", b)
        },
        set: function(c, d) {
            rb.persistence.cookielib.set("rbcookiebag", c, d)
        },
        get: function(b) {
            return rb.persistence.cookielib.get("rbcookiebag", b)
        },
        remove: function(b) {
            rb.persistence.cookielib.remove("rbcookiebag", b)
        },
        clear: function() {
            document.cookie = null
        }
    },
    cookie30: {
        save: function(b) {
            rb.persistence.cookielib.save("rb30", b)
        },
        set: function(c, d) {
            rb.persistence.cookielib.set("rb30", c, d)
        },
        get: function(b) {
            return rb.persistence.cookielib.get("rb30", b)
        },
        remove: function(b) {
            rb.persistence.cookielib.remove("rb30", b)
        },
        clear: function() {
            document.cookie = null
        }
    }
};
(function() {
    var c = false,
        d = /xyz/.test(function() {
            xyz
        }) ? /\b_super\b/ : /.*/;
    rb.Class = function() {};
    rb.Class.extend = function(j) {
        var b = this.prototype;
        c = true;
        var k = new this();
        c = false;
        for (var a in j) {
            k[a] = typeof j[a] == "function" && typeof b[a] == "function" && d.test(j[a]) ? (function(f, e) {
                return function() {
                    var l = this._super;
                    this._super = b[f];
                    var g = e.apply(this, arguments);
                    this._super = l;
                    return g
                }
            })(a, j[a]) : j[a]
        }
        function h() {
            if (!c && this.init) {
                this.init.apply(this, arguments)
            }
        }
        h.prototype = k;
        h.constructor = h;
        h.extend = arguments.callee;
        return h
    }
})();
Array.prototype.toDictionary = function(k, h) {
    var f = {};
    for (var g = 0; g < this.length; g++) {
        if (this[g] && this[g][k]) {
            var j = this[g][k];
            if (h != null) {
                j = h + j
            }
            f[j] = this[g]
        }
    }
    return f
};
Array.prototype.toList = function(f) {
    var e = [];
    for (var d = 0; d < this.length; d++) {
        if (this[d] && this[d][f]) {
            e.push(this[d][f])
        }
    }
    return e
};
String.format = function() {
    var e = arguments[0];
    for (var d = 0; d < arguments.length - 1; d++) {
        var f = new RegExp("\\{" + d + "\\}", "gm");
        e = e.replace(f, arguments[d + 1])
    }
    return e
};
String.prototype.endsWith = function(b) {
    return (this.substr(this.length - b.length) === b)
};
String.prototype.startsWith = function(b) {
    return (this.substr(0, b.length) === b)
};
String.prototype.ellipsify = function(b) {
    if (this.length > b) {
        return this.substr(0, b) + "..."
    }
    return this.toString()
};
String.prototype.show = function(b) {
    if (this) {
        return this + b
    } else {
        return ""
    }
};
String.prototype.htmlEncode = function() {
    if (this) {
        return $("<div/>").text(this.toString()).html()
    }
    return null
};
String.prototype.htmlDecode = function() {
    if (this) {
        return $("<div/>").html(this.toString()).text()
    }
    return null
};
Date.prototype.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Date.prototype.getMonthName = function() {
    return this.monthNames[this.getMonth()]
};
Date.prototype.getShortMonthName = function() {
    return this.getMonthName().substr(0, 3)
};
jQuery.fn.equalHeight = function() {
    var c = 0;
    var d = 0;
    this.each(function() {
        c = jQuery(this).outerHeight();
        d = (c > d) ? c : d
    });
    return this.each(function() {
        var f = jQuery(this);
        var a = d - (f.outerHeight() - f.height());
        var b = jQuery.browser.msie && jQuery.browser.version < 7 ? "height" : "min-height";
        f.css(b, a + "px")
    })
};
if (!this.JSON) {
    this.JSON = {}
}(function() {
    function f(n) {
        return n < 10 ? "0" + n : n
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function(key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
            return this.valueOf()
        }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        }, rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + string + '"'
    }
    function str(key, holder) {
        var i, k, v, length, mind = gap,
            partial, value = holder[key];
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key)
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value)
        }
        switch (typeof value) {
            case "string":
                return quote(value);
            case "number":
                return isFinite(value) ? String(value) : "null";
            case "boolean":
            case "null":
                return String(value);
            case "object":
                if (!value) {
                    return "null"
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null"
                    }
                    v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v
                }
                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === "string") {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v)
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v)
                            }
                        }
                    }
                }
                v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
                gap = mind;
                return v
        }
    }
    if (typeof JSON.stringify !== "function") {
        JSON.stringify = function(value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " "
                }
            } else {
                if (typeof space === "string") {
                    indent = space
                }
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify")
            }
            return str("", {
                "": value
            })
        }
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function(text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v
                            } else {
                                delete value[k]
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value)
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                })
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return typeof reviver === "function" ? walk({
                    "": j
                }, "") : j
            }
            throw new SyntaxError("JSON.parse")
        }
    }
}());
$.extend($.expr[":"], {
    inView: function(a) {
        var h = (document.documentElement.scrollTop || document.body.scrollTop),
            f = $(a).offset().top,
            g = (window.innerHeight && window.innerHeight < $(window).height()) ? window.innerHeight : $(window).height();
        return f > h && ($(a).height() + f) < (h + g)
    }
});
rb.cookie = {
    read: function(c) {
        var h = c + "=";
        var k = document.cookie.split(";");
        for (var g = 0; g < k.length; g++) {
            var j = k[g];
            while (j.charAt(0) == " ") {
                j = j.substring(1, j.length)
            }
            if (j.indexOf(h) == 0) {
                return j.substring(h.length, j.length)
            }
        }
        return null
    }
};
rb.navigation = {
    init: function() {
        this._generalLayout = $(".general-layout");
        this._nav = $("#nav");
        var b = this;
        $("#menu-btn").live("click", function(a) {
            a.preventDefault();
            var d = b._generalLayout.css("left");
            if (d == "0px") {
                b.slideRight()
            } else {
                b.slideLeft()
            }
        });
        rb.util.Menu_hidden = true
    },
    slideRight: function() {
        var e = {
            left: "80%"
        };
        var g = {
            duration: 300,
            queue: false
        };
        $(".mobile-mini").animate(e, g);
        this._generalLayout.animate(e, g);
        this._nav.show("slide", {
            direction: "left"
        }, 250);
        rb.util.Menu_hidden = false;
        var h = $("a.topofpage-btn.locations");
        var f = $("a.topofpage-btn.directions");
        h.add(f).removeClass("active")
    },
    slideLeft: function() {
        var e = {
            left: "0px"
        };
        var g = {
            duration: 180,
            queue: false
        };
        this._nav.hide();
        $(".mobile-mini").animate(e, g);
        this._generalLayout.animate(e, g);
        rb.util.Menu_hidden = true;
        var h = $("a.topofpage-btn.locations");
        var f = $("a.topofpage-btn.directions");
        h.add(f).removeClass("active");
        h.add(f).hide();
        h.add(f).addClass("active").fadeIn()
    }
};
rb.enquire = {
    init: function() {
        this._miniHeaderEdge = 80;
        this._miniHeaderVisible = false;
        this._spaceArea = $("#headerbar0_SpaceArea");
        this._logoImage = $("#header_LogoImage");
        this._logoImageMini = $("#header_LogoImageMini");
        var b = this;
        b.initMiniHeader(false);
        if (enquire) {
            enquire.register("screen and (max-width: 0px)", [{
                    deferSetup: true,
                    match: function() {
                        var a = $(".details-product-title").detach();
                        $(".details-box-art").before(a)
                    },
                    unmatch: function() {
                        var a = $(".details-product-title").detach();
                        $(".detail-top").prepend(a)
                    }
                }
            ]).listen();
            enquire.register("screen and (max-width: 0px)", [{
                    deferSetup: true,
                    match: function() {
                        rb.util.Responsive = true;
                        var a = $("#nav").detach();
                        a.insertAfter(".general-layout");
                        $("#nav").addClass("overthrow");
                        $("#header").addClass("mobile-mini");
                        $(".rb-footer-links").hide();
                        $(".search-field").hide();
                        $(".rb-footer-lists .footer-title").click(function() {
                            $(".rb-footer-lists .footer-title").not(this).next().slideUp();
                            $(".rb-footer-lists .footer-title").not(this).removeClass("footer-active");
                            $(this).next().slideToggle("fast", function() {
                                if ($(this).is(":visible")) {
                                    $(this).prev().addClass("footer-active")
                                } else {
                                    $(this).prev().removeClass("footer-active")
                                }
                            })
                        });
                        $("#mobile_search_btn").toggle(function() {
                            $(".search-field").show()
                        }, function() {
                            $(".search-field").hide()
                        });
                        var d = $(".review-widget");
                        if (d) {
                            d.detach()
                        }
                        b.initMiniHeader(true);
                        $(".desc-wrap").each(function() {
                            var f = $(this);
                            f.css("display", "none");
                            var c = $(".desc-read-more");
                            c.append("<h4>Details:</h4>");
                            c.children("h4").click(function() {
                                f.animate({
                                    height: "toggle"
                                });
                                $(".desc-read-more h4").toggleClass("details-active")
                            })
                        })
                    }
                }
            ]).fire()
        }
    },
    windowOverEdge: function() {
        if (rb.util.Responsive != true) {
            return $(window).scrollTop() > this._miniHeaderEdge
        }
    },
    setupMiniHeader: function(d) {
        if (rb.util.Responsive != true) {
            var c = this;
            $(window).scroll(function() {
                if (c.windowOverEdge()) {
                    c._showMini(d)
                } else {
                    c._hideMini(d)
                }
            })
        }
    },
    initMiniHeader: function(d) {
        if (rb.util.Responsive != true) {
            var c = this;
            if (this.windowOverEdge()) {
                setTimeout(function() {
                    c._showMini(d)
                }, 500)
            }
            this.setupMiniHeader(d)
        }
    },
    _showMini: function(b) {
        if (b === false) {
            this._logoImage.hide();
            this._logoImageMini.show();
            $(".head-top-area").hide();
            $(".find-location").hide();
            this._miniHeaderVisible = true;
            this._spaceArea.css("margin-top", "150px");
            $("#header").removeClass("mini").addClass("mini")
        } else {
            if (b === true) {
                $("#header").removeClass("mini").removeClass("mobile-mini").addClass("mobile-mini")
            }
        }
    },
    _hideMini: function(b) {
        if (b === false) {
            this._logoImage.show();
            this._logoImageMini.hide();
            $(".head-top-area").show();
            $(".find-location").show();
            this._miniHeaderVisible = false;
            this._spaceArea.css("margin-top", "0px");
            $("#header").removeClass("mini")
        } else {
            if (b === true) {}
        }
    }
};
rb.title_movie_genres = {
    init: function() {
        if (enquire) {
            enquire.register("screen and (max-width: 0px)", [{
                    deferSetup: true,
                    match: function() {
                        $("div.field-column:last-of-type label:nth-child(4), div.field-column:last-of-type label:nth-child(5)").appendTo("div.field-column:first-of-type");
                        $("div.title_movie_genres.inactive").live("click", function(b) {
                            $(this).removeClass("inactive").addClass("active");
                            $("div.reg_Subscription_Widget, div.section div.title_format, div.section div.format_content").hide();
                            $("div.movie_genres_content").show("slide", {
                                direction: "right"
                            }, 300)
                        });
                        $("div.title_movie_genres.active").live("click", function(b) {
                            $(this).removeClass("active").addClass("inactive");
                            $("div.movie_genres_content").hide("slide", {
                                direction: "left"
                            }, 300);
                            $("div.reg_Subscription_Widget, div.section div.title_format, div.section div.format_content").show()
                        });
                        $("div.mobi_supportedcarriers").live("click", function(b) {
                            $("div.mobi_carrierscontent").slideDown();
                            $(this).removeClass("inactive");
                            $(this).addClass("active");
                            $("div.mobi_supportedcarriers span").append("hide")
                        });
                        $("div.mobi_supportedcarriers.active").live("click", function(b) {
                            $("div.mobi_carrierscontent").slideUp();
                            $(this).removeClass("active");
                            $(this).addClass("inactive");
                            $("div.mobi_supportedcarriers span").empty()
                        })
                    }
                }
            ]).listen()
        }
    }
};
rb.locations = {
    init: function() {
        if (enquire) {
            enquire.register("screen and (max-width: 0px)", [{
                    deferSetup: true,
                    match: function() {
                        $("div.store-map-wrap").hide();
                        $("div.storeresults-pg a.pag-small-light").click(function() {
                            $("html, body").animate({
                                scrollTop: 150
                            }, "slow");
                            return false
                        });
                        $("div.loc-directions-wrap a.getdirections-btn").insertAfter("div.loc-directions-wrap div.directions-from input");
                        $("div.loc-directions-wrap a.getdirections-btn").empty().append('<span class="ui-button-tex"> GO </span>');
                        $("div.loc-directions-wrap div.directions-start-mappin, div.loc-directions-wrap div.directions-end-icon").empty();
                        var X = $("div.locations-tabs-bg");
                        var A = $("div.mobile-tabs.locations li");
                        var S = $("div.mobile-tabs.locations li.tab-map");
                        var H = $("div.mobile-tabs.locations li.tab-fav-loc");
                        var I = $("div.mobile-tabs.locations li.tab-store-results");
                        var V = $("div.directions-tabs");
                        var B = $("div.mobile-tabs.directions li");
                        var Q = $("div.mobile-tabs.directions li.tab-directions-steps");
                        var E = $("div.mobile-tabs.directions li.tab-directions-map");
                        var F = $("div.store-map-wrap");
                        var J = $("div.store-results-widget");
                        var T = $("div.store-fav-widget");
                        var W = $("div.storeresultslist-widget");
                        var U = $("div.rb-title-browse-filter");
                        var K = $("div.loc-store-search-widget");
                        var L = $("div.loc-directions-wrap ul.directions-results");
                        var z = $("div.loc-directions-wrap .directions-panel");
                        var O = $("div.loc-directions-wrap div.directions-form");

                        function N() {
                            $(A).removeClass("active");
                            $(I).addClass("active");
                            $(T).addClass("hidden");
                            $(T).add(F).hide();
                            $(W).add(U).fadeIn();
                            $(J).removeClass("fav-tab")
                        }
                        function P() {
                            $(A).removeClass("active");
                            $(H).addClass("active");
                            $(F).add(W).hide();
                            $(T).removeClass("hidden");
                            $(T).add(U).fadeIn();
                            $(J).addClass("fav-tab")
                        }
                        function M() {
                            $(A).removeClass("active");
                            $(S).addClass("active");
                            $(T).addClass("hidden");
                            $(T).add(W).add(U).hide();
                            $(F).fadeIn();
                            $(J).removeClass("fav-tab");
                            if (rb.util.Menu_hidden == true) {
                                $("a.topofpage-btn.locations").removeClass("active");
                                $("a.topofpage-btn.locations").addClass("active")
                            }
                            G()
                        }
                        function C() {
                            $(V).add(F).hide();
                            $(K).add(X).add(U).show();
                            $("div.store-results-widget div.products_filter").removeClass("hidden");
                            $(J).css("background", "#fff");
                            if (rb.util.Menu_hidden == true) {
                                $("a.topofpage-btn.directions").removeClass("active");
                                $("a.topofpage-btn.locations").addClass("active")
                            }
                            G()
                        }
                        function R() {
                            $(B).removeClass("active");
                            $(Q).addClass("active");
                            $(F).add(U).hide();
                            $(z).fadeIn()
                        }
                        function D() {
                            $(B).removeClass("active");
                            $(E).addClass("active");
                            $(U).add(z).hide();
                            $(F).add(O).fadeIn();
                            if (rb.util.Menu_hidden == true) {
                                $("a.topofpage-btn.directions").removeClass("active");
                                $("a.topofpage-btn.directions").addClass("active")
                            }
                            G()
                        }
                        $(I).click(function() {
                            N();
                            event.preventDefault()
                        });
                        $(H).click(function() {
                            P();
                            event.preventDefault()
                        });
                        $(S).click(function() {
                            M();
                            event.preventDefault()
                        });
                        $("a.backtoresults").click(function() {
                            C();
                            event.preventDefault()
                        });
                        $(Q).click(function() {
                            R();
                            event.preventDefault()
                        });
                        $(E).click(function() {
                            D();
                            event.preventDefault()
                        });
                        $(window).scroll(function() {
                            G()
                        });
                        $(window).resize(function() {
                            G()
                        });

                        function G() {
                            var e = $(window).height();
                            var d = $(window).scrollTop();
                            var g = $("div.map-bing-container").offset().top;
                            var b = $("div.map-bing-container").height();
                            var a = g + b;
                            var f = g - d + 70;
                            var h = a - d;
                            var j = $("a.topofpage-btn.locations");
                            var c = $("a.topofpage-btn.directions");
                            if (e < f) {
                                j.add(c).removeClass("active")
                            } else {
                                if (rb.util.Menu_hidden == true) {
                                    j.add(c).removeClass("active");
                                    j.add(c).addClass("active")
                                }
                                if (e > h) {
                                    $("a.topofpage-btn").css("position", "absolute")
                                } else {
                                    $("a.topofpage-btn").css("position", "fixed")
                                }
                            }
                        }
                        $("input.locations-search-input").focus(function() {
                            $("a.topofpage-btn.locations").css("display", "none");
                            $("div#header").css("position", "absolute")
                        });
                        $("input.locations-search-input").blur(function() {
                            $("a.topofpage-btn.locations").css("display", "block");
                            $("div#header").css("position", "fixed")
                        });
                        $("input.storeresults-origin").focus(function() {
                            $("a.topofpage-btn.directions").css("display", "none");
                            $("div#header").css("position", "absolute")
                        });
                        $("input.storeresults-origin").blur(function() {
                            $("a.topofpage-btn.directions").css("display", "block");
                            $("div#header").css("position", "fixed")
                        });
                        $("a.topofpage-btn").live("click", function() {
                            $(window).scrollTop(0)
                        })
                    }
                }
            ]).listen()
        }
    },
    _goto_SearchResultsTab: function() {
        var k = $("div.mobile-tabs.locations li");
        var o = $("div.mobile-tabs.locations li.tab-store-results");
        var j = $("div.store-map-wrap");
        var n = $("div.store-results-widget");
        var l = $("div.store-fav-widget");
        var q = $("div.storeresultslist-widget");
        var p = $("div.rb-title-browse-filter");
        var m = $("div.loc-store-search-widget");
        $(o).addClass("active");
        $(k).removeClass("active");
        $(l).addClass("hidden");
        $(l).add(j).hide();
        $(q).add(p).fadeIn();
        $(n).removeClass("fav-tab")
    }
};
var keystroke_keys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
var game_index = 0;
$(document).keydown(function(b) {
    if (b.keyCode === keystroke_keys[game_index++]) {
        if (game_index === keystroke_keys.length) {
            $(document).unbind("keydown", arguments.callee);
            window.location = "http://www.redbox.com/games/"
        }
    } else {
        game_index = 0
    }
});
rb.registerNamespace("rb.map");
rb.map = rb.Class.extend({
    get_APILoaded: function() {
        return this._apiLoaded
    },
    init: function(k, l, j, n, o, m, h) {
        this._locationCountryCodes = j;
        this._serviceURL = n;
        this._key = o;
        this._routeAPI = m;
        this._locationAPI = h;
        this._mapClose = k;
        this._mapDialog = l;
        this._self = this;
        this._directions = null;
        this._startMarker = null;
        this._endMarker = null;
        this._startPosition = null;
        this._endPosition = null;
        this._markers = null;
        this._pinLocationIds = null;
        this._bingMap = null;
        this._bingContainer = null;
        this._eventHandlers = new rb.UI.eventHandlerList();
        this._apiLoaded = false;
        this.initialized = false;
        this._locationCountryCodes = "";
        this._delegates = {
            onAddressResult: rb.createDelegate(this, this._onAddressResult),
            onBingDirectionsLoaded: rb.createDelegate(this, this._onBingDirectionsLoaded),
            onMarkerClicked: rb.createDelegate(this, this._onMarkerClicked),
            onMakeRoute: rb.createDelegate(this, this._onMakeRouteRequest),
            onCurrentLocationReady: rb.createDelegate(this, this._onCurrentLocationReady)
        };
        this._mapOptions = {};
        this._bingMapOptions = {}
    },
    initMap: function(e, d) {
        this._bingMapOptions = {
            credentials: this._key,
            mapTypeId: Microsoft.Maps.MapTypeId.road,
            enableClickableLogo: true,
            enableSearchLogo: false,
            disableKeyboardInput: true,
            showCopyright: true,
            zoom: 4
        };
        this._bingContainer = e;
        this._bingMap = new Microsoft.Maps.Map(e[0], this._bingMapOptions);
        var f = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(35, -125), new Microsoft.Maps.Location(35, -70));
        this._bingMap.setView({
            bounds: f
        });
        this._markers = {};
        this._pinLocationIds = [];
        this._apiLoaded = true;
        this.raiseEvent("onAPILoaded", this);
        if (d && d.startMarker && d.endMarker) {
            this._startMarker = d.startMarker;
            this._endMarker = d.endMarker
        }
    },
    getCurrentLocation: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._delegates.onCurrentLocationReady, this._delegates.onCurrentLocationReady)
        }
    },
    clearDirections: function() {
        this._bingMap.entities.clear()
    },
    getMapPoint: function(e, h, f, g) {
        return {
            ID: e,
            lat: h,
            lng: f,
            image: g
        }
    },
    updateMap: function(s, x) {
        if (typeof(x) == "undefined" || x == null) {
            x = 14
        }
        this._defaultZoom = x;
        this._mapPoints = s;
        this.clearMarkers();
        var p = [];
        var w = [];
        if (s && s.length > 0) {
            for (var o = 0; o < s.length; o++) {
                var r = s[o];
                if (r != null) {
                    var A = false;
                    for (var u in w) {
                        if (w[u].latitude == r.lat && w[u].longitude == r.lng) {
                            A = true;
                            break
                        }
                    }
                    if (!A) {
                        var z = new Microsoft.Maps.Location(r.lat, r.lng);
                        w.push(z)
                    }
                    var y = new Microsoft.Maps.Pushpin(z, {
                        icon: r.image
                    });
                    this._markers[r.ID] = y;
                    this._pinLocationIds[this._getPinKey(y)] = r.ID;
                    this._bingMap.entities.push(y);
                    var v = this;
                    Microsoft.Maps.Events.addHandler(y, "click", function(a) {
                        v._onMarkerClicked(a)
                    })
                }
            }
        }
        if (w && w.length > 0) {
            if (w.length > 1) {
                var q = Microsoft.Maps.LocationRect.fromLocations(w);
                this._bingMap.setView({
                    bounds: q
                })
            } else {
                this._bingMap.setView({
                    zoom: x,
                    center: w[0]
                })
            }
        } else {
            var t = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(35, -125), new Microsoft.Maps.Location(35, -70));
            this._bingMap.setView({
                bounds: t
            })
        }
    },
    clearMarkers: function() {
        this._markers = {};
        this._bingMap.entities.clear()
    },
    findAddress: function(c, d) {
        if (d == null) {
            d = this._delegates.onAddressResult
        }
        this._apiRequest({
            key: this._key,
            q: c
        }, d, this._locationAPI);
        this.raiseEvent("onGeoCode", this, {
            success: false
        })
    },
    getDirections: function(e, f, h, g) {
        this._startPosition = e + ", " + f;
        this._endPosition = h + ", " + g;
        this._onMakeRouteRequest();
        return
    },
    handleMarkerClick: function(b) {
        this.raiseEvent("onMarkerClick", this._kioskMarker, {
            ID: b
        })
    },
    handleAddressResult: function(e, g) {
        var h = {
            lat: 0,
            lng: 0,
            address: null,
            success: false
        };
        if (e && e.statusCode == 200) {
            if (e.resourceSets && e.resourceSets.length > 0 && e.resourceSets[0].resources.length > 0) {
                var f = e.resourceSets[0].resources[0];
                h.lat = f.point.coordinates[0];
                h.lng = f.point.coordinates[1];
                h.address = f.formatted_address;
                h.success = true
            }
        }
        return h
    },
    resizeCanvas: function(c, d) {
        if (this._bingMap && this._bingContainer) {
            this._bingContainer.css("height", c);
            this._bingContainer.css("width", d)
        }
    },
    showMarkerInfo: function(G, F, P, U, Q, V, T, R, M, Y) {
        var K = document.createElement("div");
        var W = document.createElement("div");
        W.style.border = "0px none";
        W.style.position = "absolute";
        W.style.background = "url('" + this._mapDialog + "')";
        W.style.paddingTop = "0px";
        W.style.width = "254px";
        W.style.height = "185px";
        var X = document.createElement("div");
        X.style.padding = "0px 30px 0px 35px";
        X.innerHTML = F;
        var L = document.createElement("div");
        L.style.textAlign = "right";
        L.style.paddingRight = "5px";
        L.style.paddingTop = "5px";
        var E = document.createElement("img");
        E.className = "mapClose";
        E.style.cursor = "pointer";
        E.src = this._mapClose;
        L.appendChild(E);
        W.appendChild(L);
        W.appendChild(X);
        K.appendChild(W);
        var H = null;
        var S = this._markers[G];
        var J = S.getLocation();
        var B = new Microsoft.Maps.Point(-80, 30);
        var C = new Microsoft.Maps.Point(15, 0);
        if (this._bingMap.entities.getLength() > 0) {
            var A = false;
            for (var D = 0; D < this._bingMap.entities.getLength(); D++) {
                var N = this._bingMap.entities.get(D);
                if (N.getTypeName && N.getTypeName() === "Infobox") {
                    N.setLocation(J);
                    N.setOptions({
                        visible: true,
                        offset: C,
                        htmlContent: K.innerHTML
                    });
                    var I = this._bingMap.getOptions();
                    I.bounds = null;
                    I.center = J;
                    I.centerOffset = B;
                    this._bingMap.setView(I);
                    H = N;
                    A = true;
                    break
                }
            }
            if (A === false) {
                var O = new Microsoft.Maps.Infobox(J, {
                    visible: true,
                    offset: C,
                    htmlContent: K.innerHTML
                });
                this._bingMap.entities.push(O);
                var I = this._bingMap.getOptions();
                I.bounds = null;
                I.center = J;
                I.centerOffset = B;
                this._bingMap.setView(I);
                H = O
            }
        } else {
            var O = new Microsoft.Maps.Infobox(J, {
                visible: true,
                offset: C,
                htmlContent: K.innerHTML
            });
            this._bingMap.entities.push(O);
            var I = this._bingMap.getOptions();
            I.bounds = null;
            I.center = J;
            I.centerOffset = B;
            this._bingMap.setView(I)
        }
        $(".mapClose").click({
            infobox: H
        }, function(a) {
            H.setOptions({
                visible: false
            })
        });
        $(".gbutton").button();
        $('.gbutton[type="select"]').click(R);
        $('.gbutton[type="rent"]').click(M);
        $(".gicon").click(Y);
        $(".gicon").each(function() {
            if ($(this).is(":visible")) {
                $(".map-info-window").css("width", 165);
                $(".map-info-window > h5").css("margin-bottom", "0.05em");
                $(".map-info-window > h5").css("overflow", "hidden");
                $(".map-info-window > h5").css("white-space", "nowrap")
            } else {
                $(".map-info-window").css("width", 200);
                $(".map-info-window > h5").css("margin-bottom", "0.5em")
            }
        })
    },
    _apiRequest: function(e, f, d) {
        $.ajax({
            url: this._serviceURL + d,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            beforeSend: null,
            dataType: "jsonp",
            jsonp: "jsonp",
            data: e,
            success: f
        })
    },
    _getPinKey: function(d) {
        var c = d.getLocation();
        return c.latitude + "_" + c.longitude
    },
    _onCurrentLocationReady: function(b) {
        this.raiseEvent("onCurrentLocationReady", b)
    },
    _onMakeRouteRequest: function() {
        this._apiRequest({
            "wp.0": this._startPosition,
            "wp.1": this._endPosition,
            routePathOutput: "Points",
            distanceUnit: "mi",
            output: "json",
            key: this._key
        }, this._delegates.onBingDirectionsLoaded, this._routeAPI)
    },
    _getTravelTime: function(g) {
        var e = "";
        var f = Math.floor(g / 60);
        f += g % 60 >= 30 ? 1 : 0;
        var h = Math.floor(f / 60);
        f = f - (60 * h);
        if (h == 0 && f == 0) {
            e = "1 min"
        } else {
            if (h > 0) {
                e = h.toString() + " hours"
            }
            e += f.toString() + " mins"
        }
        return e
    },
    _onBingDirectionsLoaded: function(q) {
        var v = {
            steps: [],
            success: false,
            code: null
        };
        if (q && q.resourceSets && q.resourceSets.length > 0 && q.resourceSets[0].resources && q.resourceSets[0].resources.length > 0) {
            var y = q.resourceSets[0].resources[0];
            v.distance = y.travelDistance.toFixed(1) + " mi";
            v.duration = this._getTravelTime(y.travelDuration);
            var B = y.bbox;
            var x = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(B[0], B[1]), new Microsoft.Maps.Location(B[2], B[3]));
            this._bingMap.setView({
                bounds: x
            });
            for (var C = 0; C < y.routeLegs[0].itineraryItems.length; C++) {
                var u = y.routeLegs[0].itineraryItems[C];
                v.steps.push({
                    id: C + 1,
                    instructions: u.instruction.text,
                    distance: u.travelDistance > 0 ? u.travelDistance.toFixed(1) + " mi" : "",
                    duration: u.travelDuration
                })
            }
            var w = y.routePath.line;
            var s = new Array();
            for (var C = 0; C < w.coordinates.length; C++) {
                s[C] = new Microsoft.Maps.Location(w.coordinates[C][0], w.coordinates[C][1])
            }
            this._bingMap.entities.clear();
            var r = new Microsoft.Maps.Polyline(s, {
                strokeColor: new Microsoft.Maps.Color(200, 0, 0, 200)
            });
            this._bingMap.entities.push(r);
            var A = new Microsoft.Maps.Location(w.coordinates[0][0], w.coordinates[0][1]);
            var t = new Microsoft.Maps.Location(w.coordinates[w.coordinates.length - 1][0], w.coordinates[w.coordinates.length - 1][1]);
            var p = new Microsoft.Maps.Pushpin(A, {
                icon: this._startMarker,
                width: 48,
                height: 40,
                anchor: new Microsoft.Maps.Point(17, 30)
            });
            var z = new Microsoft.Maps.Pushpin(t, {
                icon: this._endMarker,
                anchor: new Microsoft.Maps.Point(0, 9)
            });
            this._bingMap.entities.push(p);
            this._bingMap.entities.push(z);
            v.success = true
        }
        this.raiseEvent("onDirections", this, v)
    },
    _onMarkerClicked: function(b) {
        this.handleMarkerClick(this._pinLocationIds[this._getPinKey(b.target)])
    },
    _onAddressResult: function(d, e) {
        var f = this.handleAddressResult(d, e);
        this.raiseEvent("onGeoCode", this, f)
    },
    addEventHandler: function(d, c) {
        this._eventHandlers.addHandler(d, c)
    },
    removeEventHandler: function(d, c) {
        this._eventHandlers.removeHandler(d, c)
    },
    raiseEvent: function(g, f, h) {
        var e = this._eventHandlers.getHandler(g);
        if (e) {
            e(f, h)
        }
    }
});
if (window.rb == null) {
    window.rb = {}
}
$.ajaxSetup({
    beforeSend: function(b) {
        b.setRequestHeader("__K", rb.api.key)
    }
});
var __titlesDict = [];
rb.api = {
    url: "",
    key: "",
    invoke: function(l, u, t, r, p, s, m, o) {
        var q = String.format("{0}/{1}/{2}", l, u, t);
        if (r == null) {
            r = {}
        }
        var v = rb.api.url;
        if (o) {
            v = v.replace("http://", "https://")
        }
        var n = JSON.stringify(r);
        $.ajax({
            url: v + "api/" + q,
            type: "POST",
            data: n,
            dataType: "json",
            headers: {
                "cache-control": "no-cache"
            },
            success: function(b, c, a) {
                b = b.d;
                if (b.success) {
                    if (p) {
                        p(b, m)
                    }
                } else {
                    if (s) {
                        s(b, m)
                    }
                }
            },
            error: s
        })
    },
    get: function(t, o, q, n, s, l, r, m) {
        var p = String.format("{0}/{1}", t, o);
        if (q !== undefined && q !== null) {
            p += "/" + q
        }
        var k = rb.api.url;
        if (m) {
            k = k.replace("http://", "https://")
        }
        $.ajax({
            url: k + "api/" + p,
            type: "GET",
            data: n,
            contentType: "application/json; charset=utf8",
            success: function(b, c, a) {
                b = b.d;
                if (b.success) {
                    if (s) {
                        s(b, r)
                    }
                } else {
                    if (l) {
                        l(b, r)
                    }
                }
            },
            error: l
        })
    }
};
rb.api.version = {
    getVersion: function(d, f, e) {
        rb.api.invoke("Version", "Get", "", null, d, f, e)
    }
};
rb.api.product = {
    getProductTries: 0,
    get: function(d, f, e) {
        rb.api.invoke("Product", "Get", "", {}, d, f, e)
    },
    getProductsById: function(j, m) {
        if (typeof(__titles) == "undefined") {
            if (rb.api.product.getProductTries < 5) {
                rb.api.product.getProductTries++;
                $.getScript(rb.api.url + "/etc/designs/redbox/clientlibs/js/__titles", function() {
                    rb.api.product.getProductsById(j, m)
                })
            }
        } else {
            var g = __titles;
            if (__titlesDict.length == 0) {
                for (var l = 0; l < g.length; l++) {
                    var k = g[l].ID;
                    __titlesDict[k] = g[l]
                }
            }
            var h = {
                data: __titlesDict[j],
                total: 1
            };
            if (m) {
                return m(h)
            }
            return h
        }
    },
    getProducts: function(l, n, m, o) {
        if (l == null) {
            l = []
        }
        n = n || 1;
        m = m || 10000;
        if (typeof(__titles) == "undefined") {
            if (rb.api.product.getProductTries < 5) {
                rb.api.product.getProductTries++;
                $.getScript(rb.api.url + "api/product/js/__titles", function() {
                    rb.api.product.getProducts(l, n, m, o)
                })
            }
        } else {
            var h = __titles;
            if (l) {
                l = rb.api.product._mapFilters(l);
                h = h.where(l)
            }
            var k = (n - 1) * m;
            var j = {
                data: h.skiptake(k, m),
                total: h.length
            };
            if (o) {
                return o(j)
            }
            return j
        }
    },
    getStoreRankedInventory: function(e, f, h, g) {
        rb.api.invoke("product", "GetStoreRankedInventory", "", e, f, h, g)
    },
    getDetail: function(f, h, k, g, j) {
        rb.api.get("product", "details", f, {
            descriptionLimit: h
        }, k, g, j)
    },
    getDetailByName: function(m, h, j, g, k, l) {
        rb.api.get("product", "detailsbyname", m, {
            descriptionLimit: j,
            productType: h
        }, g, k, l)
    },
    getRankedProducts: function(e, f, h, g) {
        rb.api.invoke("Product", "GetRankings", "", e, f, h, g)
    },
    getRankings: function(e, f, h, g) {
        rb.api.invoke("Product", "GetRankings", "", {
            days: e.days,
            format: e.format,
            genre: e.genre,
            productType: e.productType,
            qty: e.qty,
            rating: e.rating,
            zip: e.zip
        }, f, h, g)
    },
    getRankingsForProductsHelper: function(e, f, d) {
        if (e) {
            if (d && d != "null") {
                e[f] = d
            }
        }
    },
    getRankingsForProducts: function(k, o, n, q, p, l, t, r, s) {
        var m = {};
        rb.api.product.getRankingsForProductsHelper(m, "days", k);
        rb.api.product.getRankingsForProductsHelper(m, "qty", o);
        rb.api.product.getRankingsForProductsHelper(m, "format", n);
        rb.api.product.getRankingsForProductsHelper(m, "genre", q);
        rb.api.product.getRankingsForProductsHelper(m, "rating", p);
        rb.api.product.getRankingsForProductsHelper(m, "zip", l);
        rb.api.get("Product", "GetRankingsForProducts", "", m, t, r, s)
    },
    getProductInterest: function(d, f, e) {
        rb.api.invoke("Product", "GetProductInterest", "", "", d, f, e)
    },
    getFormatName: function(c) {
        if (c) {
            for (var d in this._filterMappings.format.valueMap) {
                if (this._filterMappings.format.valueMap.hasOwnProperty(d) && this._filterMappings.format.valueMap[d] == c) {
                    return d
                }
            }
        }
        return "Unknown format"
    },
    _filterMappings: {
        genre: {
            propName: "genreIDs",
            valueMap: {
                action: 1000,
                comedy: 1004,
                drama: 1005,
                family: 1006,
                horror: 1009,
                actiongames: 1026,
                educational: 1027,
                fighting: 1028,
                movietv: 1029,
                musicparty: 1030,
                productivity: 1031,
                puzzlescards: 1032,
                roleplaying: 1033,
                shooter: 1034,
                simulation: 1035,
                sports: 1036,
                strategy: 1037
            }
        },
        format: {
            propName: "fmt",
            valueMap: {
                dvd: 1,
                bluray: 2,
                ps2: 6,
                xbox360: 7,
                ps3: 8,
                wii: 10
            }
        }
    },
    _mapFilters: function(b) {
        return $.map(b, function(f) {
            var a = rb.api.product._filterMappings[f.name];
            if (a) {
                var h = $.extend({}, f);
                if (a.propName) {
                    h.name = a.propName
                }
                if ($.isArray(f.val)) {
                    if (a.valueMap) {
                        for (var g = 0; g < f.val.length; g++) {
                            if (a.valueMap[f.val[g]] != null) {
                                h.val[g] = a.valueMap[f.val[g]]
                            }
                        }
                    }
                } else {
                    if (a.valueMap && a.valueMap[f.val] != null) {
                        h.val = a.valueMap[f.val]
                    }
                }
                return h
            } else {
                return f
            }
        })
    }
};
rb.api.account = {
    getDynamic: function(d, f, e) {
        rb.api.invoke("Account", "GetDynamic", "", null, d, f, e)
    },
    getComingSoonNotify: function(d, f, e) {
        rb.api.invoke("Account", "GetComingSoonNotify", "", null, d, f, e)
    },
    addComingSoonNotify: function(e, f, h, g) {
        rb.api.invoke("Account", "AddComingSoonNotify", "", {
            productRef: e
        }, f, h, g)
    },
    removeComingSoonNotify: function(e, f, h, g) {
        rb.api.invoke("Account", "RemoveComingSoonNotify", "", {
            productRef: e
        }, f, h, g)
    },
    getUser: function(d, f, e) {
        rb.api.invoke("Account", "GetUser", "", null, d, f, e)
    },
    getUserSubscriptions: function(d, f, e) {
        rb.api.invoke("Account", "GetUserSubscriptions", "", null, d, f, e, true)
    },
    getRentalHistory: function(g, e, h, f) {
        rb.api.invoke("Account", "GetRentalHistory", "", {
            page: g.page,
            pageSize: g.pageSize,
            id: g.id,
            direction: g.direction
        }, e, h, f, true)
    },
    getRecentRentalHistory: function(g, e, h, f) {
        rb.api.invoke("Account", "GetRecentRentalHistory", "", {
            page: g.page,
            pageSize: g.pageSize,
            id: g.id,
            direction: g.direction,
            customerNumber: g.customerNumber
        }, e, h, f, true)
    },
    getPurchaseHistory: function(g, e, h, f) {
        rb.api.invoke("Account", "GetPurchaseHistory", "", {
            page: g.page,
            pageSize: g.pageSize,
            id: g.id,
            direction: g.direction
        }, e, h, f, true)
    },
    getCreditHistory: function(g, e, h, f) {
        rb.api.invoke("Account", "GetCreditHistory", "", {
            page: g.page,
            pageSize: g.pageSize,
            id: g.id,
            direction: g.direction
        }, e, h, f, true)
    },
    getInvoiceItems: function(h, j, g, k, f) {
        rb.api.invoke("Account", "GetInvoiceItems", "", {
            id: h,
            transactionID: j
        }, g, k, f, true)
    },
    getInvoiceDetail: function(h, j, g, k, f) {
        rb.api.invoke("Account", "GetInvoiceDetail", "", {
            id: h,
            transactionID: j
        }, g, k, f, true)
    },
    getPromotions: function(e, f, h, g) {
        rb.api.invoke("Account", "GetPromotions", "", {
            customerNumber: e
        }, f, h, g, true)
    },
    getPromotionsSummary: function(e, f, h, g) {
        rb.api.invoke("Account", "GetPromotionSummary", "", {
            customerNumber: e
        }, f, h, g, true)
    },
    register: function(g, e, h, f) {
        rb.api.invoke("Account", "Register", "", {
            userName: g.userName,
            password: g.password,
            validationCode: g.validationCode,
            firstName: g.firstName,
            lastName: g.lastName,
            zip: g.zip,
            birthday: g.birthday,
            marketingOptIN: g.optin
        }, e, h, f, true)
    },
    ssoRegisteration: function(g, e, h, f) {
        rb.api.invoke("Account", "SsoRegisteration", "", {
            userName: g.userName,
            password: g.password,
            validationCode: g.validationCode,
            firstName: g.firstName,
            lastName: g.lastName,
            zip: g.zip,
            birthday: g.birthday,
            marketingOptIN: g.optin
        }, e, h, f, true)
    },
    login: function(l, m, h, g, j, k) {
        rb.api.invoke("Account", "Login", "", {
            userName: l,
            password: m,
            createPersistentCookie: h
        }, g, j, k, true)
    },
    ssoLogin: function(n, o, j, k, h, l, m) {
        rb.api.invoke("Account", "SSOLogin", "", {
            userName: n,
            password: o,
            createPersistentCookie: j,
            ssoReturnUrl: k
        }, h, l, m, true)
    },
    logout: function(g, e, h, f) {
        rb.api.invoke("Account", "Logout", "", {
            returnUrl: g
        }, e, h, f)
    },
    save: function(f, e, h, g) {
        rb.api.invoke("Account", "Save", "", f, e, h, g)
    },
    changePassword: function(h, j, m, g, k, l) {
        rb.api.invoke("Account", "ChangePassword", "", {
            password1: h,
            password2: j,
            currentPassword: m
        }, g, k, l)
    },
    resetPassword: function(j, h, f, k, g) {
        rb.api.invoke("Account", "ResetPassword", "", {
            userName: j,
            validationCode: h
        }, f, k, g, true)
    },
    getCards: function(d, f, e) {
        rb.api.invoke("Account", "GetCards", "", {}, d, f, e)
    },
    getOnlineCredits: function(g, e, h, f) {
        rb.api.invoke("Account", "GetOnlineCredits", "", {
            userName: g
        }, e, h, f)
    },
    saveFavoriteStore: function(f, h, k, g, j) {
        rb.api.invoke("Account", "SaveFavoriteStore", "", {
            id: f,
            alias: h
        }, k, g, j)
    },
    removeFavoriteStore: function(h, e, f, g) {
        rb.api.invoke("Account", "RemoveFavoriteStore", "", {
            id: h
        }, e, f, g)
    },
    updateFavoriteStores: function(f, e, h, g) {
        rb.api.invoke("Account", "UpdateFavoriteStores", "", {
            storeUpdates: f
        }, e, h, g)
    },
    saveCard: function(s, m, o, q, v, l, n, u, p, r, t) {
        rb.api.invoke("Account", "SaveCard", "", {
            id: s,
            name: m,
            num: o,
            month: q,
            year: v,
            zip: l,
            alias: n,
            pref: u
        }, p, r, t)
    },
    removeCard: function(h, e, f, g) {
        rb.api.invoke("Account", "RemoveCard", "", {
            id: h
        }, e, f, g)
    },
    updateCards: function(e, f, h, g) {
        rb.api.invoke("Account", "UpdateCards", "", {
            cardUpdates: e
        }, f, h, g)
    },
    updateAccountInterests: function(g, e, h, f) {
        rb.api.invoke("Account", "UpdateAccountInterests", "", {
            interestUpdates: g
        }, e, h, f)
    },
    signupNewsletter: function(h, e, f, g) {
        rb.api.invoke("Account", "SignupNewsletter", "", {
            email: h
        }, e, f, g)
    },
    collect: function(m, k, l, o, h, n, j) {
        rb.api.invoke("Account", "Collect", "", {
            url: m,
            body: k,
            email: l,
            zip: o
        }, h, n, j)
    },
    checkNewsletter: function(d, f, e) {
        rb.api.invoke("Account", "CheckNewsletter", "", {}, d, f, e)
    },
    reportProblem: function(g, e, h, f) {
        rb.api.invoke("Account", "ReportProblem", "", {
            accountHistoryID: g.accountHistoryID,
            description: g.description
        }, e, h, f)
    },
    updateUsername: function(l, k, m, g, h, j) {
        rb.api.invoke("Account", "UpdateUsername", "", {
            username: l,
            validate: k,
            password: m
        }, g, h, j)
    },
    unsubscribeComingsoon: function(e, f, h, g) {
        rb.api.invoke("Account", "UnsubscribeComingsoon", "", {
            username: e
        }, f, h, g)
    },
    signupSMS: function(m, h, l, g, j, k) {
        rb.api.invoke("Account", "SignupSMS", "", {
            number: m,
            group: h,
            keyword: l
        }, g, j, k)
    }
};
rb.api.store = {
    getUserStores: function(g, k, h) {
        var f = {
            user: true
        };
        var j = {
            profile: true,
            status: true,
            user: true
        };
        rb.api.store.getStores(f, j, g, k, h)
    },
    getNearbyStores: function(k, t, p, m, q, n, r, o) {
        var s = {
            proximity: {
                lat: k,
                lng: t,
                radius: p
            }
        };
        var l = {
            max: m,
            profile: true,
            status: true,
            proximity: true,
            user: true
        };
        if (q != null && q.length > 0) {
            l.inventory = true;
            l.inventoryProducts = q
        }
        rb.api.store.getStores(s, l, n, r, o)
    },
    getGroupStores: function(o, j, h, k, m) {
        var l = {
            groups: [{
                    type: o,
                    name: j
                }
            ]
        };
        var n = {
            profile: true
        };
        rb.api.store.getStores("all", l, n, h, k, m)
    },
    getStoresByIDs: function(g, m, l, h, k) {
        var j = {
            ids: g
        };
        if (m == null) {
            m = {
                profile: true
            }
        }
        rb.api.store.getStores(j, m, l, h, k)
    },
    getInventory: function(j, h, k, m) {
        var l = {
            ids: [j]
        };
        var o = {
            inventory: true
        };
        var n = function(a) {
            if (a.data != null && a.data.length > 0) {
                a.data = a.data[0]
            }
            h(a, m)
        };
        rb.api.store.getStores(l, o, n, k, m)
    },
    getStores: function(f, j, g, k, h) {
        if (f == null) {
            f = {}
        }
        if (j == null) {
            j = {}
        }
        rb.api.invoke("Store", "GetStores", "", {
            filters: f,
            resultOptions: j
        }, g, k, h)
    },
    getSuggestedStores: function(e, d, f) {
        rb.api.invoke("Store", "GetSuggestedStores", "", {
            recommendationCount: 3
        }, e, d, f)
    },
    getSuggestedStoresWithInventory: function(f, g, e, h) {
        rb.api.invoke("Store", "GetSuggestedStoresWithInventory", "", {
            product: f
        }, g, e, h)
    },
    selectStore: function(h, e, f, g) {
        rb.api.invoke("Store", "SelectStore", h, {
            returnUserStores: false
        }, e, f, g)
    },
    selectStoreByGUID: function(e, f, h, g) {
        rb.api.invoke("Store", "SelectStoreByGUID", e, f, h, g)
    },
    clearRecentlySelectedStores: function(d, f, e) {
        rb.api.invoke("Store", "ClearRecentlySelectedStores", "", null, d, f, e)
    }
};
rb.api.cart = {
    addItem: function(o, m, k, h, l, n) {
        var j = [];
        j.push(o);
        rb.api.invoke("Cart", "AddItems", "", {
            productRefs: j,
            runView: k,
            getPromos: false,
            inCartPromoRuleID: m
        }, h, l, n)
    },
    removeItem: function(m, h, g, j, l) {
        var k = [];
        k.push(m);
        rb.api.invoke("Cart", "RemoveItems", "", {
            productRefs: k,
            runView: h,
            getPromos: false
        }, g, j, l)
    },
    addItems: function(j, f, g, k, h) {
        rb.api.invoke("Cart", "AddItems", "", {
            productRefs: j,
            runView: f,
            getPromos: false
        }, g, k, h)
    },
    removeItems: function(j, f, g, k, h) {
        rb.api.invoke("Cart", "RemoveItems", "", {
            productRefs: j,
            runView: f,
            getPromos: false
        }, g, k, h)
    },
    swapItem: function(l, j, h, g, k, m) {
        rb.api.invoke("Cart", "SwapItems", "", {
            productRefs: [l, j],
            runView: h,
            getPromos: false
        }, g, k, m)
    },
    setApplyCredit: function(n, j, l, m, h, k, o) {
        rb.api.invoke("Cart", "SetApplyCredit", "", {
            applyCredit: n,
            applyOnlinePromotion: l,
            promoCode: m,
            runView: j
        }, h, k, o)
    },
    getView: function(d, f, e) {
        rb.api.invoke("Cart", "GetView", "", null, d, f, e)
    },
    checkout: function(j, g, f, k, h) {
        j.card = g;
        rb.api.invoke("Cart", "Checkout", "", j, f, k, h)
    },
    clearAndAddShoppingSession: function(f, h, g, k, j) {
        rb.api.invoke("Cart", "ClearAndAddShoppingSession", "", {
            storeRef: f,
            titleID: h
        }, g, k, j)
    },
    applyOnlinePromoCode: function(l, m, j, n, h, k, o) {
        rb.api.invoke("Cart", "ApplyOnlinePromoCode", "", {
            applyOnlinePromotion: l,
            promotionCode: m,
            runView: j,
            applyCredit: n
        }, h, k, o)
    }
};
rb.api.marketing = {
    getRecommendationsWithHistory: function(o, j, m, k, h, l, n) {
        rb.api.invoke("Marketing", "GetRecommendations", "", {
            productType: o,
            id: j,
            maxRecommendations: m,
            getHistory: k
        }, h, l, n)
    },
    getRecommendations: function(m, h, k, g, j, l) {
        rb.api.invoke("Marketing", "GetRecommendations", "", {
            productType: m,
            id: h,
            maxRecommendations: k
        }, g, j, l)
    },
    getComingSoonRecommendations: function(m, h, k, g, j, l) {
        rb.api.invoke("Marketing", "GetComingSoonRecommendations", "", {
            productType: m,
            id: h,
            maxRecommendations: k
        }, g, j, l)
    },
    getTrailerRecommendations: function(m, h, k, g, j, l) {
        rb.api.invoke("Marketing", "GetTrailerRecommendations", "", {
            productType: m,
            id: h,
            maxRecommendations: k
        }, g, j, l)
    },
    getPromoProducts: function(g, e, h, f) {
        rb.api.invoke("Marketing", "GetPromoProducts", "", g, e, h, f)
    },
    getInCartPromoProducts: function(g, e, h, f) {
        rb.api.invoke("Marketing", "GetInCartPromoProducts", "", g, e, h, f)
    },
    getEmailOptIn: function(e, h, f, g) {
        rb.api.invoke("Marketing", "GetEmailOptIn", "", {
            configId: e
        }, h, f, g, true)
    },
    emailOptInSubmit: function(k, g, j, h, f) {
        rb.api.invoke("Marketing", "EmailOptInSubmit", "", {
            email: k,
            configId: g
        }, j, h, f, true)
    },
    createEntry: function(f, g, k, j, h) {
        rb.api.invoke("Marketing", "CreateEntry", "", {
            entry: f,
            code: g
        }, k, j, h, true)
    }
};
rb.api.promo = {
    validateAndRedeem: function(m, h, l, g, j, k) {
        rb.api.invoke("Promo", "ValidateAndRedeem", "", {
            promoTypeID: m,
            code: h,
            validationCode: l
        }, g, j, k)
    }
};
rb.api.util = {
    toJson: function(b) {
        return JSON.stringify(b)
    },
    safeLower: function(b) {
        if (b.toLowerCase != null) {
            return b.toLowerCase()
        }
        return b
    },
    getScript: function(e) {
        var f = document.getElementsByTagName("SCRIPT");
        for (var d = 0; d < f.length; d++) {
            if (f[d].src != null && f[d].src.indexOf(e) > -1) {
                return f[d]
            }
        }
    },
    getScriptPath: function() {
        var b = rb.abi.util.getScript("rb.api.js").src;
        return b.substr(0, b.indexOf("rb.api.js"))
    }
};
if (!this.JSON) {
    this.JSON = {}
}(function() {
    function f(n) {
        return n < 10 ? "0" + n : n
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function(key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
            return this.valueOf()
        }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        }, rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + string + '"'
    }
    function str(key, holder) {
        var i, k, v, length, mind = gap,
            partial, value = holder[key];
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key)
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value)
        }
        switch (typeof value) {
            case "string":
                return quote(value);
            case "number":
                return isFinite(value) ? String(value) : "null";
            case "boolean":
            case "null":
                return String(value);
            case "object":
                if (!value) {
                    return "null"
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null"
                    }
                    v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v
                }
                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === "string") {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v)
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ": " : ":") + v)
                            }
                        }
                    }
                }
                v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
                gap = mind;
                return v
        }
    }
    if (typeof JSON.stringify !== "function") {
        JSON.stringify = function(value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " "
                }
            } else {
                if (typeof space === "string") {
                    indent = space
                }
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify")
            }
            return str("", {
                "": value
            })
        }
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function(text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v
                            } else {
                                delete value[k]
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value)
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                })
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return typeof reviver === "function" ? walk({
                    "": j
                }, "") : j
            }
            throw new SyntaxError("JSON.parse")
        }
    }
}());
String.prototype.trim = function String$trim() {
    return this.replace(/^\s+|\s+$/g, "")
};
Array.prototype.orderby = function(e) {
    var d = this.clone();
    var f = d.sort(function(a, o) {
        var b;
        var l;
        var n;
        var c;
        for (var m = 0; m < e.length; m++) {
            b = e[m].name;
            l = e[m].dir;
            n = a[b];
            c = o[b];
            if (n < c) {
                return (l * -1)
            } else {
                if (n > c) {
                    return l
                }
            }
        }
        return 0
    });
    return f
};
Array.prototype.groupby = function(d) {
    var e = new Array();
    var f = this.clone();
    $.each(d.values, function(c, b) {
        var a = f.where([{
                name: String(d.name),
                val: String(b),
                matchType: "exact"
            }
        ]);
        e.merge(a);
        $.each(a, function(j, k) {
            f.remove(k)
        })
    });
    e.merge(f);
    return e
};
Array.prototype.remove = function(c) {
    var d = this;
    $.each(d, function(a, b) {
        if (b === c) {
            d.splice(a, 1)
        }
    })
};
Array.prototype.clone = function() {
    return this.length === 1 ? [this[0]] : Array.apply(null, this)
};
Array.prototype.skiptake = function(g, e) {
    var h = [];
    for (var f = g; f < g + e; f++) {
        if (this[f]) {
            h.push(this[f])
        }
    }
    return h
};
Array.prototype.merge = function(g, k) {
    if (k != null) {
        var j = {};
        for (var h = 0; h < this.length; h++) {
            j[this[h][k]] = 1
        }
        for (var h = 0; h < g.length; h++) {
            if (j[g[h][k]] != 1) {
                this.push(g[h])
            }
        }
    } else {
        var f = this;
        $.each(g, function() {
            f.push(this)
        })
    }
};
Array.prototype.select = function(k) {
    var h = [];
    var f;
    var j;
    if (k == null) {
        return this
    }
    for (var g = 0; g < this.length; g++) {
        j = true;
        f = this[g];
        if (f[k] == null) {
            j = false;
            break
        }
        if (j) {
            h.push(this[g][k])
        }
    }
    return h
};
Array.prototype.where = function(p) {
    var q = [];
    var l;
    var o;
    var n;
    if (p.length == 0) {
        return this
    }
    for (var k = 0; k < this.length; k++) {
        o = true;
        l = this[k];
        for (var f = 0; f < p.length; f++) {
            filter = p[f];
            var m = filter.matchType == null ? "contains" : filter.matchType;
            n = l[filter.name];
            if (typeof(filter.val) == "object") {
                o = filter.val.any(n);
                if (o == false) {
                    break
                }
            } else {
                if (typeof(n) == "object") {
                    o = n.any(filter.val);
                    if (o == false) {
                        break
                    }
                } else {
                    if (m == "contains" && n.toString().toLowerCase().indexOf(filter.val) == -1) {
                        o = false;
                        break
                    } else {
                        if (m == "beginsWith" && n.toString().toLowerCase().indexOf(filter.val) != 0) {
                            o = false;
                            break
                        } else {
                            if (m == "exact" && n.toString().toLowerCase() != filter.val) {
                                o = false;
                                break
                            } else {
                                if (m == "greaterThan") {
                                    o = parseInt(n) > parseInt(filter.val);
                                    if (o == false) {
                                        break
                                    }
                                } else {
                                    if (m == "lessThan") {
                                        o = parseInt(n) < parseInt(filter.val);
                                        if (o == false) {
                                            break
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (o) {
            q.push(this[k])
        }
    }
    return q
};
Array.prototype.filter = function(e) {
    var h = [];
    var g;
    if (!e) {
        return this
    }
    for (var f = 0; f < this.length; f++) {
        g = this[f];
        if (e(this[f])) {
            h.push(this[f])
        }
    }
    return h
};
Array.prototype.any = function(f) {
    if (typeof(f) != "object") {
        f = [f]
    }
    for (var d = 0; d < this.length; d++) {
        for (var e = 0; e < f.length; e++) {
            if (this[d] == f[e]) {
                return true
            }
        }
    }
    return false
};
Array.prototype.innerJoin = function(l, n, q) {
    var o = l.toDictionary(q);
    var p = [];
    var m;
    for (var k = 0; k < this.length; k++) {
        var r = o[this[k][n]];
        if (r != null) {
            m = {};
            for (var s in r) {
                m[s] = r[s]
            }
            for (var s in this[k]) {
                m[s] = this[k][s]
            }
            p.push(m)
        }
    }
    return p
};
Array.prototype.outerJoin = function(l, n, q) {
    var o = l.toDictionary(q);
    var p = [];
    var m;
    for (var k = 0; k < this.length; k++) {
        var r = o[this[k][n]];
        m = {};
        for (var s in r) {
            m[s] = r[s]
        }
        for (var s in this[k]) {
            m[s] = this[k][s]
        }
        p.push(m)
    }
    return p
};
rb.app = {};
rb.app.store = {
    init: function(b) {
        $.extend(this, rb.eventPublisher);
        this._initEventHandlerList();
        this._selectedStore = b.selectedStore;
        this._requireInventoryOnStoreChange = false;
        this._inventory = {};
        this._suggestedStoresByStoreNumber = {};
        this._previousStore = null;
        this._delegates = {
            onInventoryReceived: rb.createDelegate(this, this._onInventoryReceived),
            onInventoryRequestFailed: rb.createDelegate(this, this._onInventoryRequestFailed),
            onStoreSelectionRequestSucceeded: rb.createDelegate(this, this._onStoreSelectionRequestSucceeded),
            onStoreSelectionRequestFailed: rb.createDelegate(this, this._onStoreSelectionRequestFailed)
        }
    },
    setSuggestedByStoreNumber: function(c, d) {
        this._suggestedStoresByStoreNumber[c] = d
    },
    getSuggestedByStoreNumber: function(b) {
        return this._suggestedStoresByStoreNumber[b]
    },
    requireInventoryOnStoreChange: function() {
        this._requireInventoryOnStoreChange = true
    },
    getSelectedStore: function() {
        return this._selectedStore
    },
    getPreviousStore: function() {
        return this._previousStore
    },
    selectPreviousStore: function() {
        this.selectStore(this._previousStore)
    },
    isStoreSelected: function() {
        if (this._selectedStore) {
            return (this._selectedStore.id > 0)
        }
        return false
    },
    selectStore: function(b) {
        this._previousStore = this.getSelectedStore();
        if (typeof(b) !== "object") {
            b = {
                id: Number(b)
            };
            if (isNaN(b.id)) {
                b.id = -1
            }
        }
        if (!b) {
            b = {
                id: -1
            }
        }
        if (typeof(b) === "object" && b !== null && b.id !== undefined) {
            this._beginStoreChange(b)
        }
    },
    clearSelectedStore: function() {
        if (this.isStoreSelected) {
            this._beginStoreChange({
                id: -1
            })
        }
    },
    getInventory: function(c, d) {
        if (!d && this.isStoreSelected()) {
            d = this._selectedStore.id
        }
        if (d && d > 0) {
            if (this._inventory[d] != null) {
                c && c(this._inventory[d]);
                return
            } else {
                this._requestInventory(d, c);
                return
            }
        }
        c && c(null)
    },
    _beginStoreChange: function(b) {
        this.raiseStoreChange({
            state: "pending",
            store: b
        });
        if (b.id > 0 && this._requireInventoryOnStoreChange) {
            this._pendingStoreChange = {
                newStore: b
            };
            if (this._inventory[b.id] != null) {
                this._continueStoreChangeWithInventory(this._inventory[b.id])
            } else {
                this._requestInventory(b.id)
            }
        } else {
            this._requestStoreSelection(b)
        }
    },
    _continueStoreChangeWithInventory: function() {
        this._requestStoreSelection(this._pendingStoreChange.newStore)
    },
    _requestStoreSelection: function(b) {
        rb.api.store.selectStore(b.id, this._delegates.onStoreSelectionRequestSucceeded, this._delegates.onStoreSelectionRequestFailed)
    },
    _onStoreSelectionRequestSucceeded: function(c, d) {
        if (c.data != null) {
            this._selectedStore = c.data.selectedStore;
            if (this._selectedStore != null) {
                this._selectedStore.inventory = {
                    products: this._inventory[this._selectedStore.id]
                }
            }
        }
        this._pendingStoreChange = null;
        this.raiseStoreChange({
            state: "completed",
            store: this._selectedStore
        })
    },
    _onStoreSelectionRequestFailed: function(c, d) {
        this._cancelStoreChange()
    },
    _cancelStoreChange: function() {
        this._pendingStoreChange = null;
        this.raiseStoreChange({
            state: "cancelled"
        })
    },
    _requestInventory: function(c, d) {
        rb.api.store.getInventory(c, this._delegates.onInventoryReceived, this._delegates.onInventoryRequestFailed, d)
    },
    _onInventoryReceived: function(c, d) {
        if (c.data != null) {
            if (c.data.inventory == null || c.data.inventory.products == null) {
                this._inventory[c.data.id] = []
            } else {
                this._inventory[c.data.id] = c.data.inventory.products
            } if (this._pendingStoreChange != null) {
                this._continueStoreChangeWithInventory()
            } else {
                if (d != null) {
                    d(this._inventory[c.data.id])
                }
            }
        } else {
            if (this._pendingStoreChange != null) {
                this._cancelStoreChange()
            } else {
                if (d != null) {
                    d(null)
                }
            }
        }
    },
    _onInventoryRequestFailed: function(c, d) {
        if (this._pendingStoreChange != null) {
            alert("Inventory request failed. Kiosk change cancelled.");
            this._cancelStoreChange()
        } else {
            if (d != null) {
                d(null)
            }
        }
    },
    addStoreChangeHandler: function(b) {
        this.addHandler("storeChange", b)
    },
    removeStoreChangeHandler: function(b) {
        this.removeHandler("storeChange", b)
    },
    raiseStoreChange: function(b) {
        return this.raiseEvent("storeChange", b)
    }
};
rb.app.cart = {
    init: function(b) {
        $.extend(this, rb.eventPublisher);
        this._initEventHandlerList();
        this._data = b;
        this._maxItems = b.maxItems;
        this._cartUrl = b.cartUrl;
        this._redirectToCart = false;
        this._redirectingFlag = false;
        this._delegates = {
            onAddResponse: rb.createDelegate(this, this._onAddResponse),
            onAddRequestFailed: rb.createDelegate(this, this._onAddRequestFailed),
            onRemoveResponse: rb.createDelegate(this, this._onRemoveResponse),
            onRemoveRequestFailed: rb.createDelegate(this, this._onRemoveRequestFailed)
        }
    },
    getRedirectingFlag: function() {
        return this._redirectingFlag
    },
    setRedirectingFlag: function(b) {
        this._redirectingFlag = b
    },
    getUrl: function() {
        return this._cartUrl
    },
    getItem: function(c) {
        if (this.hasItems() == false) {
            return null
        }
        for (var d = 0; d < this._data.session.items.length; d++) {
            if (this._data.session.items[d].productRef == c) {
                return this._data.session.items[d]
            }
        }
        return null
    },
    getItems: function() {
        if (this.hasItems()) {
            return this._data.session.items
        }
        return null
    },
    hasItems: function() {
        return this._data && this._data.session && this._data.session.items && this._data.session.items.length > 0
    },
    addItem: function(g, e, h, f) {
        this._redirectToCart = h;
        this._redirectingFlag = false;
        if (this.isFull(1)) {
            this.raiseCartChange({
                data: this._data,
                type: "max",
                productRefID: g
            })
        } else {
            this._onAddItem(g, e, f)
        }
    },
    removeItem: function(c, d) {
        if (d == null) {
            d = false
        }
        rb.api.cart.removeItem(c, d, this._delegates.onRemoveResponse, this._delegates.onRemoveRequestFailed, c)
    },
    swapItem: function(f, e, d) {
        rb.api.cart.swapItem(f, e, d, this._delegates.onAddResponse, this._delegates.onRemoveRequestFailed, f)
    },
    isFull: function(b) {
        if (b) {
            return (b + this._data.session.items.length) > this._maxItems
        }
        return this._data.session.items.length >= this._maxItems
    },
    _onAddItem: function(e, d, f) {
        if (d == null || this._redirectToCart == null || this._redirectToCart) {
            d = false
        }
        rb.api.cart.addItem(e, f, d, this._delegates.onAddResponse, this._delegates.onAddRequestFailed, e)
    },
    _onAddResponse: function(c, d) {
        if (this._redirectToCart && this._cartUrl) {
            this._redirectingFlag = true;
            window.location.href = this._cartUrl
        } else {
            this._data = c.data;
            this.raiseCartChange({
                data: this._data,
                type: "add",
                productRefID: d
            })
        }
    },
    _onRemoveResponse: function(c, d) {
        this._data = c.data;
        this.raiseCartChange({
            data: this._data,
            type: "remove",
            productRefID: d
        })
    },
    _onAddRequestFailed: function(c, d) {
        this.raiseCartChange({
            type: "error",
            result: c
        })
    },
    _onRemoveRequestFailed: function(c, d) {
        this.raiseCartChange({
            type: "error",
            result: c
        })
    },
    addCartChangeHandler: function(b) {
        this.addHandler("cartChange", b)
    },
    removeCartChangeHandler: function(b) {
        this.removeHandler("cartChange", b)
    },
    raiseCartChange: function(b) {
        return this.raiseEvent("cartChange", b)
    }
};
rb.app.user = {
    init: function(b) {
        $.extend(this, rb.eventPublisher);
        this._initEventHandlerList();
        this._loggedIn = b.loggedIn;
        this._url = b.loginUrl;
        this._delegates = {
            onLoginResponse: rb.createDelegate(this, this._onLoginResponse),
            onLoginRequestFailed: rb.createDelegate(this, this._onLoginRequestFailed),
            onLogoutResponse: rb.createDelegate(this, this._onLogoutResponse),
            onLogoutRequestFailed: rb.createDelegate(this, this._onLogoutRequestFailed)
        }
    },
    getLoginUrl: function() {
        return this._url
    },
    isLoggedIn: function() {
        return this._loggedIn
    },
    lastLogin: function() {
        return rb.persistence.cookie.get("loginEmail")
    },
    login: function(f, e, d) {
        rb.api.account.login(f, e, d, this._delegates.onLoginResponse, this._delegates.onLoginRequestFailed)
    },
    logout: function(b) {
        rb.api.account.logout(b, this._delegates.onLogoutResponse, this._delegates.onLogoutRequestFailed)
    },
    showLogin: function(u, p, w, t) {
        var m = rb.component.findFirstByType("storesearch");
        if (m) {
            var r = $.deparam.querystring(this._url, true);
            if (r.ReturnUrl) {
                var v = this._url.split("?");
                if (v.length > 1) {
                    var n = v[0] + "?";
                    var s = $.param.querystring(r.ReturnUrl, "loc=" + m.get_searchText());
                    var o = v[1].split("&");
                    for (var q = 0; q < o.length; q++) {
                        if (o[q].startsWith("ReturnUrl")) {
                            o[q] = "ReturnUrl=" + encodeURIComponent(s)
                        }
                        n += o[q];
                        n += q == o.length - 1 ? "" : "&"
                    }
                    this._url = n
                }
            }
        }
        if (u != undefined) {
            this._url = this._addLoginParameter(this._url, "refer", u)
        }
        if (p === true) {
            this._url = this._addLoginParameter(this._url, "short", "true")
        }
        if (w != undefined) {
            this._url = this._addLoginParameter(this._url, "product", w)
        }
        if (t) {
            this._url = this._addLoginParameter(this._url, "email", t)
        }
        window.location.href = this._url
    },
    _onLoginResponse: function(c, d) {
        this._loggedIn = c.data.loggedIn;
        if (c.success && this._loggedIn) {
            if (c.data && c.data.loginEmail) {
                rb.persistence.cookie.set("loginEmail", c.data.loginEmail, 30)
            }
            this.raiseUserChange({
                type: "login",
                result: c
            })
        } else {
            this.raiseUserChange({
                type: "error",
                result: c
            })
        }
    },
    _onLogoutResponse: function(c, d) {
        if (c.success && c.data.loggedIn == false) {
            this.raiseUserChange({
                type: "error",
                result: c
            })
        } else {
            window.location.reload()
        }
    },
    _onLoginRequestFailed: function(c, d) {
        this.raiseUserChange({
            type: "error",
            result: c
        })
    },
    _onLogoutRequestFailed: function(c, d) {
        this.raiseUserChange({
            type: "error",
            result: c
        })
    },
    _addLoginParameter: function(e, h, f) {
        var g = e.indexOf("&" + h + "=") > -1 || e.indexOf("?" + h + "=") > -1;
        if (!g) {
            if (e.indexOf("?") > -1) {
                e = e + "&" + h + "=" + f
            } else {
                e = e + "?" + h + "=" + f
            }
        }
        return e
    },
    addUserChangeHandler: function(b) {
        this.addHandler("userChange", b)
    },
    removeUserChangeHandler: function(b) {
        this.removeHandler("userChange", b)
    },
    raiseUserChange: function(b) {
        return this.raiseEvent("userChange", b)
    }
};
rb.registerNamespace("rb.rec.Omn");
rb.rec.Omn = {
    DebugMode: "Off",
    DebugPropFilter: /prop.*|eVar.*|events|state|zip|linkTrackVars|linkTrackEvents/,
    s: null,
    Enable: false,
    Enabled: function() {
        return (rb.rec.Omn.Enable && typeof(s_gi) != "undefined")
    },
    Reset: function(c) {
        rb.rec.Omn.s.linkTrackVars = "None";
        rb.rec.Omn.s.linkTackEvents = "None";
        if (c) {
            for (var d in c) {
                delete rb.rec.Omn.s[d]
            }
        }
    },
    RecordPage: function(j, r, q, p, k) {
        if (rb.rec.Omn.Enabled() == false) {
            return
        }
        if (k == null) {
            k = []
        }
        var n = j;
        var m = r;
        var l = j;
        var o = j;
        rb.rec.Omn.s = s_gi(s_account);
        switch (j) {
            case "Find A Movie":
                o = "FM";
                break;
            case "Find A Game":
                o = "FG";
                break;
            case "Find A Redbox":
                o = "FR";
                break
        }
        if (r == null) {
            m = o
        } else {
            m = String.format("{0}: {1}", o, r);
            l = m
        } if (q != null) {
            l = String.format("{0}: {1}", m, q)
        }
        rb.rec.Omn.s.pageName = l;
        rb.rec.Omn.s.prop1 = n;
        rb.rec.Omn.s.prop2 = m;
        rb.rec.Omn.s.prop11 = rb.util.IsAuthenticated ? "Logged In" : "Not Logged In";
        if (p == null) {
            p = []
        }
        if (rb.util.IsAuthenticated && rb.util.CustomerNumber != null && rb.util.CustomerNumber != "") {
            p.eVar33 = rb.util.CustomerNumber
        }
        p.eVar58 = rb.util.UserExperience;
        rb.rec.Omn._processDict(p, rb.rec.Omn.s);
        rb.rec.Omn._processEvents(k, rb.rec.Omn.s);
        rb.rec.Omn.ShowDebug("RecordPage");
        rb.rec.Omn.s.t();
        rb.rec.Omn.Reset(p)
    },
    RecordAction: function(h, e, g, f) {
        if (rb.rec.Omn.Enabled() == false) {
            return
        }
        if (!f) {
            f = "o"
        }
        if (rb.rec.Omn.s == null) {
            rb.rec.Omn.s = s_gi(s_account)
        }
        rb.rec.Omn._processDict(e, rb.rec.Omn.s, true);
        rb.rec.Omn._processEvents(g, rb.rec.Omn.s, true);
        rb.rec.Omn.ShowDebug("RecordAction");
        rb.rec.Omn.s.tl(true, f, h);
        rb.rec.Omn.Reset(e)
    },
    RecordExitLink: function(f, d, e) {
        rb.rec.Omn.RecordAction(f, d, e, "e")
    },
    _processDict: function(l, m, k) {
        var j = [];
        for (var h in l) {
            var g = l[h];
            if (g != null && g != "Null") {
                j.push(h);
                m[h] = l[h]
            }
        }
        if (k && j.length > 0) {
            m.linkTrackVars = j.join(",")
        } else {
            m.linkTrackVars = "None"
        }
    },
    _processEvents: function(k, h, f) {
        var j = [];
        if (k) {
            for (var g = 0; g < k.length; g++) {
                if (k[g] == "prodView") {
                    j.push("event3")
                }
                j.push(k[g])
            }
        }
        if (j.length > 0) {
            h.events = j.join(",");
            if (f) {
                h.linkTrackEvents = h.events;
                if (h.linkTrackVars != null && h.linkTrackVars.length > 0 && h.linkTrackVars.toLowerCase() != "none") {
                    h.linkTrackVars += ",events"
                } else {
                    h.linkTrackVars = "events"
                }
            }
        } else {
            h.events = "";
            h.linkTrackEvents = "None"
        }
    },
    ShowDebug: function(f) {
        if (rb.rec.Omn.DebugMode == "Omniture") {
            window.open("", "stats_debugger", "width=600,height=600,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1").document.write('<script language="JavaScript" src="https://sitecatalyst.omniture.com/sc_tools/stats_debugger.html"></script><script language="JavaScript">window.onload : function() {document.forms["debugger"].auto_refresh.checked=false;window.auto_refresh=false;};window.setTimeout(function() {function get_movies(){alert("cool");}}, 5000);</script>')
        } else {
            if (rb.rec.Omn.DebugMode == "On") {
                var k = new Sys.StringBuilder();
                var g = 0;
                for (var h in rb.rec.Omn.s) {
                    if (rb.rec.Omn.DebugPropFilter && !h.match(rb.rec.Omn.DebugPropFilter)) {
                        continue
                    }
                    if (rb.rec.Omn.s[h] != null && rb.rec.Omn.s[h].toString().indexOf("function") != 0) {
                        g++;
                        var j = rb.rec.Omn.s[h];
                        if (j.toString().length > 25) {
                            j = j.toString().substr(0, 25) + "....."
                        }
                        k.append(h + " = " + j);
                        if (g % 7 == 0) {
                            k.appendLine("")
                        } else {
                            k.append(" ~ ")
                        }
                    }
                }
                alert(f + ":" + k.toString())
            }
        }
    }
};
rb.registerNamespace("rb.rec.DART");
rb.rec.DART = {
    Url: null,
    Enable: false,
    Record: function(j, n, o) {
        if (!this.Enable || !j || !n || !rb.rec.DART.Url) {
            return
        }
        var m = "";
        if (j.startsWith("sales")) {
            m = String.format("type={0};cat={1};u1={2};u2={3};u3={4};u4={5};u5={6};qty={7};cost={8};ord={9}", j, n, o.u1, o.u2, o.u3, o.u4, o.u5, o.qty, o.cost, o.ord)
        } else {
            var l = Math.random() + "";
            var a = l * 10000000000000;
            m = String.format("type={0};cat={1};ord={2}", j, n, a)
        }
        var k = String.format("{0};{1}?", rb.rec.DART.Url, m);
        var p = document.getElementById("dartTag");
        if (p) {
            p.src = k
        } else {
            p = document.createElement("iframe");
            p.setAttribute("id", "dartTag");
            p.setAttribute("width", 1);
            p.setAttribute("height", 1);
            p.setAttribute("frameborder", 0);
            p.src = k;
            document.body.appendChild(p)
        }
    }
};
if (window.rb == null) {
    window.rb = {}
}
rb.search = {
    init: function(b) {
        this._searchUrl = b.searchUrl
    },
    invoke: function(g, f, h) {
        var e = this._searchUrl + g;
        $.ajax({
            url: e,
            beforeSend: null,
            dataType: "jsonp",
            success: f,
            error: h
        })
    }
};
rb.registerNamespace("rb.widget");
rb.widget.base = rb.Class.extend({
    get_id: function() {
        return this._id
    },
    set_id: function(b) {
        this._id = b
    },
    get_type: function() {
        return this._type
    },
    set_type: function(b) {
        this._type = b
    },
    get_urlPath: function() {
        return this._urlPath
    },
    set_urlPath: function(b) {
        this._urlPath = b
    },
    get_clientText: function() {
        return this._clientText
    },
    set_clientText: function(b) {
        this._clientText = b
    },
    get_loaded: function() {
        return this._loaded
    },
    set_loaded: function(b) {
        this._loaded = b
    },
    productType: {
        movie: 1,
        game: 5
    },
    events: {
        storeChange: 1,
        cartChange: 2,
        userChange: 3
    },
    getText: function(c, d) {
        if (this._clientText[c] != null) {
            return this._clientText[c]
        }
        if (d == null) {
            d = "[" + c + "]"
        }
        return d
    },
    getID: function(b) {
        return this._id + "_" + b
    },
    findChildWidget: function(b) {
        return rb.component.find(this.getID(b))
    },
    getControl: function(c) {
        var d = this.getID(c);
        if (this._controls[d] == null) {
            this._controls[d] = $("#" + d)
        }
        return this._controls[d]
    },
    getWidget: function(c) {
        var d = this.getID(c);
        return rb.component.find(d)
    },
    init: function() {
        $.extend(this, rb.eventPublisher);
        this._initEventHandlerList();
        this._id = null;
        this._urlPath = "";
        this._clientText = {};
        this._deferred = [];
        this._errorCtl = [];
        this._loaded = false;
        this._locked = false;
        this._subscriptions = [];
        this._controls = [];
        this._app = {
            cart: null,
            user: null
        };
        this._baseDelegates = {
            onLoadDelegate: rb.createDelegate(this, this._onBaseLoad),
            onAjaxFailDelegate: rb.createDelegate(this, this._onAjaxFail),
            onKeyPressDelegate: rb.createDelegate(this, this._onKeyPress)
        };
        this._baseEvents = {
            storeChange: rb.createDelegate(this, this._onStoreChange),
            cartChange: rb.createDelegate(this, this._onCartChange),
            userChange: rb.createDelegate(this, this._onUserChange)
        };
        $(document).ready(rb.createDelegate(this, function() {
            window.setTimeout(this._baseDelegates.onLoadDelegate, 0)
        }))
    },
    lock: function() {
        this._locked = true;
        this.getControl("ProgressBar").show()
    },
    unlock: function() {
        this._locked = false;
        this.getControl("ProgressBar").hide()
    },
    showNotification: function(c, d) {
        if (c) {
            if (d) {
                this.getControl("Notification").html(c).slideDown(500).delay(d).slideUp(500)
            } else {
                this.getControl("Notification").html(c).show()
            }
        }
    },
    log: function(b) {
        if (!window.console || typeof console == "undefined" || console == null || console.log == null) {
            console = function() {
                this.log = function() {
                    return
                }
            }
        }
    },
    hideNotification: function() {
        this.getControl("Notification").hide()
    },
    showError: function(c) {
        if (c) {
            if (this._errorCtl.length > 0) {
                var d = this._errorCtl.find("ul:first");
                if (d.size() == 1) {
                    d.append('<li><label class="ui-state-error-text" generated="false" style="display: block;">' + c + "</label></li>");
                    this._errorCtl.show().children().show()
                } else {
                    this._errorCtl.html(c).show()
                }
            } else {}
        }
    },
    hideError: function() {
        var b = this._errorCtl.find("li").has('label[generated="false"]');
        if (b.size() > 0) {
            b.remove()
        }
        this._errorCtl.hide()
    },
    clearError: function() {
        this._errorCtl.find("li").remove();
        this._errorCtl.hide()
    },
    validateRedboxURL: function(d) {
        var c = new RegExp("^(http://" + location.host + "|https://" + location.host + "|" + location.host + "|/)");
        return c.test(d)
    },
    checkQueryStringExists: function(f, d) {
        var e = $.deparam.querystring()[f];
        if (e != null) {
            window.setTimeout(function() {
                d(e)
            }, 500)
        }
    },
    getQueryStringValue: function(b) {
        return $.deparam.querystring()[b]
    },
    findChildByType: function(f) {
        var c = [];
        for (var h in rb.component.controls) {
            var g = rb.component.controls[h];
            if (g.get_type != null && g.get_type() == f && g.get_id().indexOf(this._id + "_") == 0) {
                c.push(g)
            }
        }
        return c
    },
    findFirstChildByType: function(d) {
        var c = this.findChildByType(d);
        if (c.length > 0) {
            return c[0]
        }
        return null
    },
    getQueryStringParam: function(e, f) {
        var d = $.deparam.querystring()[e];
        if (!d || f === false) {
            return d
        }
        return d.htmlEncode()
    },
    refreshCaptcha: function() {
        var e = this.getControl("Widget");
        var f = new Date();
        var g = e.find('img[src$="/captcha/image"]');
        var h = e.find(".refreshedCaptcha");
        e.find('img[src$="/captcha/image"]').each(function() {
            var a = $(this);
            var b = a.attr("src");
            a.attr("src", "").addClass("refreshedCaptcha");
            a.attr("src", b + "?" + f.getTime())
        });
        e.find("img.captcha").each(function() {
            var a = $(this);
            a.removeClass("captcha");
            var b = a.attr("src");
            a.attr("src", "").addClass("refreshedCaptcha");
            a.attr("src", b + "?" + f.getTime())
        });
        e.find(".refreshedCaptcha").each(function() {
            var a = $(this);
            var b = a.attr("src").split("?")[0];
            a.attr("src", b + "?" + f.getTime())
        })
    },
    _onLoad: function(c, d) {},
    _onBaseLoad: function(d, e) {
        this._errorCtl = this.getControl("Error");
        this.getControl("Widget").keypress(this._baseDelegates.onKeyPressDelegate);
        this._eventSubscriptions();
        this._onLoad(d, e);
        this._loaded = true;
        if (this._deferred.length > 0) {
            var f = this;
            $.each(this._deferred, function(b, a) {
                a()
            })
        }
    },
    _onStoreChange: function() {},
    _onCartChange: function() {},
    _onUserChange: function() {},
    _eventSubscriptions: function() {
        var b = this;
        $.each(this._subscriptions, function(d, a) {
            switch (a) {
                case b.events.storeChange:
                    rb.app.store.addStoreChangeHandler(b._baseEvents.storeChange);
                    break;
                case b.events.cartChange:
                    rb.app.cart.addCartChangeHandler(b._baseEvents.cartChange);
                    break;
                case b.events.userChange:
                    rb.app.user.addUserChangeHandler(b._baseEvents.userChange);
                    break
            }
        })
    },
    _defer: function(b) {
        if (!this._loaded) {
            this._deferred.push(b);
            return true
        } else {
            return false
        }
    },
    _onKeyEnter: function(b) {},
    _onKeyPress: function(b) {
        if (b.which == 13) {
            return this._onKeyEnter(b)
        }
    },
    _onAjaxFail: function(e, h, g) {
        var f = e.msg;
        if (this.Res && this.Res.AjaxRequestFailed) {
            f = String.format(this.Res.AjaxRequestFailed, e.get_statusCode())
        }
        if (f == null) {
            if (rb.app.cart.getRedirectingFlag()) {
                this.unlock();
                rb.app.cart.setRedirectingFlag(false);
                return
            }
            this.log("Unknown API Error")
        }
        this.showError(f);
        this.unlock()
    },
    navigate: function(b) {
        if (b) {
            window.location.href = b
        }
    },
    scroll: function(c, d) {
        if (c) {
            if (d == null) {
                d = false
            }
            if ((d == true && c.is(":not(:inView)")) || d == false) {
                $("html,body").animate({
                    scrollTop: c.offset().top
                }, 1500)
            }
        }
    }
});
rb.registerNamespace("rb.widget");
rb.widget.search = rb.widget.base.extend({
    get_searchAcct: function() {
        return this._searchAcct
    },
    set_searchAcct: function(b) {
        this._searchAcct = b
    },
    get_searchApi: function() {
        return this._searchApi
    },
    set_searchApi: function(b) {
        this._searchApi = b
    },
    get_searchUrl: function() {
        return this._searchUrl
    },
    set_searchUrl: function(b) {
        this._searchUrl = b
    },
    init: function() {
        this._super();
        this._widget = null;
        this._searchBox = null;
        this._searchForm = null;
        this._searchIcon = null;
        this._didYouMeanOriginalTerm = null;
        this._defaultText = null;
        this._searchAcct = null;
        this._searchApi = null;
        this._searchUrl = null;
        this._delegates = {
            onSearch: rb.createDelegate(this, this._onSearch),
            onSubmitSearch: rb.createDelegate(this, this._onSubmitSearch)
        }
    },
    _onLoad: function(d, e) {
        this._widget = this.getControl("Widget");
        this._searchBox = this.getControl("SearchBox");
        this._searchForm = this.getControl("SearchForm");
        this._searchIcon = this.getControl("SearchIcon");
        this._didYouMeanOriginalTerm = this.getControl("DidYouMeanOriginalTerm");
        this._defaultText = this.getText("SearchMoviesAndGames");
        var f = this;
        this._searchIcon.click(this._delegates.onSubmitSearch);
        this._searchBox.AdobeAutocomplete({
            account: this._searchAcct,
            searchDomain: this._searchApi,
            inputElement: "input#" + this._searchBox.attr("id"),
            inputFormElement: "form#" + this._searchForm.attr("id"),
            delay: 300,
            minLength: 3,
            maxResults: 10,
            browserAutocomplete: true,
            queryCaseSensitive: false,
            startsWith: false,
            submitOnSelect: true,
            onselect: this._delegates.onSearch
        }).attr("title", this._defaultText).simpleWaterMark("watermark");
        if (this._searchBox.is(":disabled")) {
            this._searchBox.prop("disabled", false)
        }
    },
    _onKeyEnter: function() {
        this._onSearch()
    },
    _onSubmitSearch: function(d, c) {
        this._onSearch(d, c)
    },
    _onSearch: function(f, e) {
        if (f && f.originalTerm != "undefined") {
            this._didYouMeanOriginalTerm.val(f.originalTerm)
        }
        var h = this._searchBox.val();
        if (h == this._defaultText) {
            h = ""
        }
        var g = this._didYouMeanOriginalTerm.val();
        this.navigate(this._searchUrl + "/?q=" + encodeURIComponent(h) + "&d=" + encodeURIComponent(g))
    }
});
rb.registerNamespace("rb.widget");
rb.widget.welcome = rb.widget.base.extend({
    get_authUrl: function(b) {
        return this._authUrl
    },
    set_authUrl: function(b) {
        this._authUrl = b
    },
    get_defaultUrl: function(b) {
        return this._defaultUrl
    },
    set_defaultUrl: function(b) {
        this._defaultUrl = b
    },
    get_rootUrl: function(b) {
        return this._rootUrl
    },
    set_rootUrl: function(b) {
        this._rootUrl = b
    },
    get_dynamicBlock: function() {
        return this._dynamicBlock
    },
    set_dynamicBlock: function(b) {
        this._dynamicBlock = b
    },
    init: function() {
        this._super();
        this._authUrl = {};
        this._defaultUrl = "";
        this._rootUrl = "";
        this._dynamicBlock = null;
        this._loginLink = null;
        this._logoutLink = null;
        this._accountLink = null;
        this._creditHeader = null;
        this._noCreditHeader = null;
        this._accountSeperator = null;
        this._expirySection = null;
        this._creditSummaryText = null;
        this._delegates = {
            onLoginLinkClick: rb.createDelegate(this, this._onLoginLinkClicked),
            onLogoutLinkClick: rb.createDelegate(this, this._onLogoutLinkClicked)
        };
        this._subscriptions = [this.events.userChange]
    },
    refresh: function(c) {
        if (rb.app.user.isLoggedIn()) {
            var d = c.firstName;
            this.getControl("Howdy").html("Hi, " + d + "! ");
            this._loginLink.hide();
            this._logoutLink.show();
            this._accountLink.show();
            this._accountSeperator.show();
            this._helpLink.show();
            if (c.credits) {
                this._creditSummaryText.html(String.format('You have {0} C<span class="credit-color">red</span>its', c.credits.TotalCredits))
            }
            if (c.showCreditHeader === true) {
                this._showCreditSummaryHeader();
                this.getControl("WelcomeArea").removeClass("head-welcome-area").addClass("head-welcome-area-credit")
            } else {
                this._hideCreditSummaryHeader();
                this.getControl("WelcomeArea").removeClass("head-welcome-area-credit").addClass("head-welcome-area")
            } if (c.isDigitalCustomer === true) {
                this.getControl("DigitalSection").show()
            } else {
                this.getControl("DigitalSection").hide()
            } if (c.expiringCreditsCount > 0) {
                this._expirySection.html(String.format("{0} credits expire this week", c.expiringCreditsCount)).show()
            } else {
                this._expirySection.html("").hide()
            }
        } else {
            this.getControl("Howdy").html(this.getText("Welcome"));
            this._loginLink.show();
            this._helpLink.show();
            this._logoutLink.hide();
            this._accountLink.hide();
            this._accountSeperator.hide();
            this.getControl("WelcomeArea").removeClass("head-welcome-area").removeClass("head-welcome-area-credit").addClass("head-welcome-area");
            if (this._creditHeader) {
                this.getControl("CreditHeaderText").hide();
                this._creditHeader.removeClass("credit-header")
            }
            if (this._noCreditHeader) {
                this._noCreditHeader.show()
            }
        }
    },
    _onLoad: function(c, d) {
        this._super(c, d);
        this._loginLink = this.getControl("LoginLink");
        this._logoutLink = this.getControl("LogoutLink");
        this._accountLink = this.getControl("AccountLink");
        this._helpLink = this.getControl("HelpLink");
        this._creditHeader = this.getControl("CreditHeader");
        this._noCreditHeader = this.getControl("NoCreditHeader");
        this._loginLink.click(this._delegates.onLoginLinkClick);
        this._logoutLink.click(this._delegates.onLogoutLinkClick);
        this._helpLink.click(function() {
            rb.rec.Omn.RecordExitLink("Help Link")
        });
        this._accountSeperator = this.getControl("AccountSeperator");
        this._expirySection = this.getControl("ExpirySection");
        this._creditSummaryText = this.getControl("CreditSummaryText");
        if (this._dynamicBlock) {
            this.refresh(this._dynamicBlock)
        }
    },
    _onLoginLinkClicked: function(b) {
        rb.app.user.showLogin()
    },
    _onLogoutLinkClicked: function(b) {
        rb.app.user.logout(this._defaultUrl)
    },
    _onUserChange: function(j, m) {
        var g = false;
        if (j._loggedIn === true && m && m.result && m.result.data && m.result.data.loggedIn === false) {
            var k = $.url.parse(location.href.toLowerCase());
            var h = $.url.parse(this._rootUrl.toLowerCase());
            var l = k.relative.replace(h.relative, "");
            for (i = 0; i < this._authUrl.length; i++) {
                if (l.startsWith(this._authUrl[i])) {
                    g = true;
                    break
                }
            }
            if (g === true) {
                this.navigate(this._defaultUrl)
            } else {
                window.location.reload()
            }
        }
    },
    _showCreditSummaryHeader: function() {
        if (this._creditHeader) {
            this._creditHeader.show()
        }
        if (this._noCreditHeader) {
            this._noCreditHeader.hide()
        }
    },
    _hideCreditSummaryHeader: function() {
        if (this._creditHeader) {
            this._creditHeader.hide()
        }
        if (this._noCreditHeader) {
            this._noCreditHeader.show()
        }
    }
});
var lockRecord = false;
rb.registerNamespace("rb.widget");
rb.widget.buttonset = rb.widget.base.extend({
    get_dvdText: function() {
        return this._dvdText
    },
    set_dvdText: function(b) {
        this._dvdText = b
    },
    get_blurayText: function() {
        return this._blurayText
    },
    set_blurayText: function(b) {
        this._blurayText = b
    },
    get_rent: function() {
        return this._rent
    },
    set_rent: function(b) {
        this._rent = b
    },
    get_inCart: function() {
        return this._inCart
    },
    set_inCart: function(b) {
        this._inCart = b
    },
    get_find: function() {
        return this._find
    },
    set_find: function(b) {
        this._find = b
    },
    get_findNearby: function() {
        return this._findNearby
    },
    set_findNearby: function(b) {
        this._findNearby = b
    },
    get_remindMe: function() {
        return this._remindMe
    },
    set_remindMe: function(b) {
        this._remindMe = b
    },
    get_processing: function() {
        return this._processing
    },
    set_processing: function(b) {
        this._processing = b
    },
    get_findProductFormat: function() {
        return this._findProductFormat
    },
    set_findProductFormat: function(b) {
        this._findProductFormat = b
    },
    get_findNearbyProductFormat: function() {
        return this._findNearbyProductFormat
    },
    set_findNearbyProductFormat: function(b) {
        this._findNearbyProductFormat = b
    },
    get_rentProductFormat: function() {
        return this._rentProductFormat
    },
    set_rentProductFormat: function(b) {
        this._rentProductFormat = b
    },
    get_remindMeProductFormat: function() {
        return this._remindMeProductFormat
    },
    set_remindMeProductFormat: function(b) {
        this._remindMeProductFormat = b
    },
    get_inventory: function() {
        return this._inventory
    },
    set_inventory: function(b) {
        this._inventory = b
    },
    get_reminders: function() {
        return this._reminders
    },
    set_reminders: function(b) {
        this._reminders = b
    },
    get_runView: function() {
        return this._runView
    },
    set_runView: function(b) {
        this._runView = b
    },
    get_enableSuggestedStores: function() {
        return this._enableSuggestedStores
    },
    set_enableSuggestedStores: function(b) {
        this._enableSuggestedStores = b
    },
    get_locationsUrl: function() {
        return this._locationsUrl
    },
    set_locationsUrl: function(b) {
        this._locationsUrl = b
    },
    get_activeDialog: function() {
        return this._activeDialog
    },
    init: function() {
        this._super();
        this._defaultButtonset = null;
        this._dvdText = null;
        this._blurayText = null;
        this._cartItems = null;
        this._inventory = null;
        this._registeredSets = {};
        this._reminders = null;
        this._runView = null;
        this._currentCtx = null;
        this._enableSuggestedStores = null;
        this._locationsUrl = null;
        this._storeChanged = null;
        this._storePicker = null;
        this._rent = null;
        this._inCart = null;
        this._find = null;
        this._findNearby = null;
        this._remindMe = null;
        this._processing = null;
        this._findProductFormat = null;
        this._findNearbyProductFormat = null;
        this._rentProductFormat = null;
        this._remindMeProductFormat = null;
        this._isCompletedCart = false;
        this._subscriptions = [this.events.storeChange, this.events.cartChange]
    },
    lock: function(b) {
        if (b.data("locked") == null || b.data("locked") == false) {
            b.data("locked", true);
            if (b.find(".ui-button-text").size() > 0) {
                b.data("button-text", b.find(".ui-button-text").html());
                b.find(".ui-button-text").html("<span>" + this.get_processing() + "</span>")
            }
        }
    },
    isCompletedCart: function(b) {
        this._isCompletedCart = b
    },
    unlock: function(b) {
        if (b.data("locked") == true) {
            b.data("locked", false);
            if (b.find(".ui-button-text").size() > 0) {
                b.find(".ui-button-text").html("<span>" + b.data("button-text") + "</span>")
            }
        }
    },
    updateButton: function(u, C) {
        this.unlock(u);
        var q = u.attr("buttonkey");
        var x = u.attr("comingsoon") === "1";
        var s = u.attr("customButtons") === "1";
        var z = u.siblings(".rb-ribbon");
        if (C === undefined) {
            C = this.resolveButtonSet(u)
        }
        var t = "";
        var B = "";
        var v = "";
        var w = this._getProduct(q);
        if (w == null) {
            return
        }
        var r = w.productType == this.productType.movie;
        var p = s && rb.api.product.getFormatName(w.fmt) == "dvd";
        var A = s && rb.api.product.getFormatName(w.fmt) == "bluray";
        if (x) {
            var y = r && s ? p ? String.format(this._remindMeProductFormat, this._dvdText) : String.format(this._remindMeProductFormat, this._blurayText) : this.get_remindMe();
            if (this._isReminded(q)) {
                v = '<div class="rb-btn-reminded-' + C + '">' + y + "</div>";
                t = "rb-blue rb-btn-reminded";
                if (p) {
                    t += " reminded_dvd"
                } else {
                    if (A) {
                        t += " reminded_blu"
                    }
                }
                B = "rb-ribbon-blue"
            } else {
                if (this._isCompletedCart) {
                    v = '<div class="rb-btn-remind-' + C + '">' + y + "</div>";
                    t = " rb-red rb-btn-remind";
                    if (p) {
                        t += " remind_dvd"
                    } else {
                        if (A) {
                            t += " remind_blu"
                        }
                    }
                    B = "rb-ribbon-red"
                } else {
                    v = '<div class="rb-btn-remind-' + C + '">' + y + "</div>";
                    t = " rb-red rb-btn-remind";
                    if (p) {
                        t += " remind_dvd"
                    } else {
                        if (A) {
                            t += " remind_blu"
                        }
                    }
                    B = "rb-ribbon-red"
                }
            }
        } else {
            if (this._isInCart(q)) {
                v = this.get_inCart();
                t = "in-cart rb-blue rb-btn-cart";
                if (p) {
                    t += " cart_dvd"
                } else {
                    if (A) {
                        t += " cart_blu"
                    }
                }
                B = "rb-ribbon-blue";
                if (this._isKioskSelected() && !this._isInStock(q)) {
                    t += " rb-btn-oos"
                }
            } else {
                if (this._isKioskSelected()) {
                    if (this._isInStock(q)) {
                        v = r && s ? p ? String.format(this._rentProductFormat, this._dvdText) : String.format(this._rentProductFormat, this._blurayText) : this.get_rent();
                        t = "w-loc rb-blue rb-btn-rent";
                        if (p) {
                            t += " rsv_dvd"
                        } else {
                            if (A) {
                                t += " rsv_blu"
                            }
                        }
                        B = "rb-ribbon-red"
                    } else {
                        v = r && s ? p ? String.format(this._findNearbyProductFormat, this._dvdText) : String.format(this._findNearbyProductFormat, this._blurayText) : this.get_findNearby();
                        t = "ooo rb-orange rb-btn-find rb-btn-oos";
                        if (p) {
                            t += " near_dvd"
                        } else {
                            if (A) {
                                t += " near_blu"
                            }
                        }
                        B = "rb-ribbon-orange"
                    }
                } else {
                    v = r && s ? p ? String.format(this._findProductFormat, this._dvdText) : String.format(this._findProductFormat, this._blurayText) : this.get_find();
                    t = "no-loc rb-blue rb-btn-find";
                    if (p) {
                        t += " find_dvd"
                    } else {
                        if (A) {
                            t += " find_blu"
                        }
                    }
                    B = "rb-ribbon-red"
                }
            }
        } if (u.find(".ui-button-text").size() > 0) {
            u.find(".ui-button-text").html("<span>" + v + "</span>");
            u.removeClass("w-loc no-loc ooo rb-red rb-blue rb-orange rb-btn-remind rb-btn-reminded rb-btn-cart rb-btn-rent rb-btn-find rb-btn-oos rsv_dvd rsv_blu find_dvd find_blu near_dvd near_blu cart_dvd cart_blu remind_dvd remind_blu reminded_dvd reminded_blu").addClass(t)
        } else {
            u.html(v);
            u.addClass(t)
        } if (z.size() > 0) {
            z.removeClass("rb-ribbon-red rb-ribbon-blue rb-ribbon-orange").addClass(B)
        }
    },
    createButton: function(d) {
        if (this._defaultButtonset == null) {
            this._defaultButtonset = rb.component.findFirstByType("buttonset")
        }
        var c = d.find("[buttonkey]:first");
        this._defaultButtonset.updateButton(c, this._defaultButtonset.resolveButtonSet(c));
        if (c.attr("latebind") != "true") {
            this._defaultButtonset.registerSingle(c)
        }
    },
    onClick: function(c, d) {
        this._storeChanged = (d) | false;
        this._onButtonClicked(c)
    },
    refresh: function(b) {
        this._onRegistered(this._registeredSets[b].find(".rb-btn-unreg"))
    },
    raiseStoreDialog: function(e, g, h) {
        if (this._enableSuggestedStores) {
            if (this._storePicker == null) {
                this._storePicker = this.findFirstChildByType("storepicker")
            }
            var f = this;
            this._storePicker.loadSuggestions(e, h);
            this._raiseDialog("StoreDialog", function() {
                f._recordFindingMethod(g);
                f._closeDialog(true)
            }, null, "380px")
        } else {
            if (e) {
                this.navigate(this._locationsUrl + "?productRef=" + e)
            } else {
                this.navigate(this._locationsUrl)
            }
        }
    },
    register: function(h, g, e, f) {
        if (this._registeredSets[h] != undefined && this._registeredSets[h].autoUpdate == true) {
            return
        }
        this._registeredSets[h] = g;
        if (e == true) {
            this._registeredSets[h].autoUpdate = true;
            this._registeredSets[h].auCallback = f
        } else {
            this._registeredSets[h].autoUpdate = false;
            this._registeredSets[h].auCallback = null
        }
        this.refresh(h)
    },
    registerSingle: function(b) {
        this._onRegistered(b)
    },
    resolveButtonSet: function(b) {
        return b.parents("[buttonset]:first").attr("buttonset")
    },
    _onLoad: function(e, f) {
        this._super(e, f);
        this._defaultButtonset = rb.component.findFirstByType("buttonset");
        this._storeChanged = false;
        if ($("[buttonset]").size() > 0) {
            var g = this;
            rb.app.store.requireInventoryOnStoreChange();
            this._cartItems = rb.app.cart.getItems();
            var h = rb.persistence.cookie.get("addreminder");
            if (rb.app.user.isLoggedIn() && h != null) {
                rb.api.account.addComingSoonNotify(h, function() {
                    g._reminders.push(h);
                    rb.persistence.cookie.remove("addreminder");
                    g._refreshButtons('[buttonkey="' + h + '"]');
                    var a = false;
                    g._recordClick(null, h, null, "comingSoon", a, "remind")
                })
            }
            $("[buttonset]").each(function() {
                var a = $(this);
                if ($(this).attr("tnt") == "true") {
                    g.register(a.attr("buttonset"), a, true);
                    g._refreshButtons()
                } else {
                    g.register(a.attr("buttonset"), a)
                }
            })
        }
    },
    _isInCart: function(b) {
        if (this._cartItems) {
            for (i = 0; i <= this._cartItems.length - 1; i++) {
                if (this._cartItems[i]["productRef"] == b) {
                    return true
                }
            }
        }
        return false
    },
    _isInStock: function(b) {
        if (this._inventory) {
            for (i = 0; i <= this._inventory.length - 1; i++) {
                if (this._inventory[i]["id"] == b && this._inventory[i]["stock"]) {
                    return true
                }
            }
        }
        return false
    },
    _hasUpsell: function() {
        if (this._cartItems) {
            for (i = 0; i <= this._cartItems.length - 1; i++) {
                if (this._cartItems[i].upsell) {
                    return true
                }
            }
        }
        return false
    },
    _isReminded: function(b) {
        if (this._reminders) {
            for (i = 0; i <= this._reminders.length - 1; i++) {
                if (this._reminders[i] == b) {
                    return true
                }
            }
        }
        return false
    },
    _isKioskSelected: function() {
        return rb.app.store.isStoreSelected()
    },
    _onButtonClicked: function(x) {
        var u = $(x.currentTarget);
        var y = u.data("locked");
        this._currentCtx = u;
        if (y == null || y == false) {
            var B = u.attr("buttonkey");
            var D = this._getProduct(B);
            if (D == null) {
                return
            }
            var s = u.attr("customButtons") == "1";
            var I = u.attr("hasSibling") == "1";
            var F = u.attr("productContext") ? u.attr("productContext") : null;
            var t = u.attr("incartPromotion");
            if (t == null) {
                t = 0
            }
            var A = u.parents("[buttonset]:first").attr("fromCart");
            var v = this;
            if (u.hasClass("rb-btn-remind")) {
                this._recordCustomButtonClick(s, I, F, D.fmt);
                if (rb.app.user.isLoggedIn()) {
                    this.lock(u);
                    rb.api.account.addComingSoonNotify(B, function() {
                        v._reminders.push(B);
                        v._refreshButtons('[buttonkey="' + B + '"]');
                        v._recordClick(null, B, null, "comingSoon", A, "remind");
                        v.unlock(u)
                    }, function(a) {
                        if (a.success == false && a.msg == "Permission Denied.") {
                            rb.persistence.cookie.set("addreminder", B);
                            rb.app.user.showLogin("ComingSoon", true, B);
                            this.unlock(u)
                        }
                    })
                } else {
                    rb.persistence.cookie.set("addreminder", B);
                    rb.app.user.showLogin("ComingSoon", true, B)
                }
            }
            if (u.hasClass("rb-btn-reminded")) {
                this.lock(u);
                rb.api.account.removeComingSoonNotify(B, function() {
                    if ($.inArray(B, v._reminders) >= 0) {
                        v._reminders.splice($.inArray(B, v._reminders), 1)
                    }
                    v._refreshButtons(".rb-btn-reminded")
                })
            }
            if (u.hasClass("rb-btn-cart")) {
                this.lock(u);
                this.navigate(rb.app.cart.getUrl());
                return
            }
            var z = u.parents("[buttonset]:first");
            var G = z.attr("cartredir") == null || (z.attr("cartredir") != null && z.attr("cartredir") != "false");
            if (D && u.hasClass("rb-btn-rent")) {
                this.lock(u);
                this._recordCustomButtonClick(s, I, F, D.fmt);
                var E = z.attr("origin");
                var A = z.attr("fromCart");
                this._recordClick(u, B, z.attr("buttonset"), E, A, "rent");
                if (rb.app.cart.isFull()) {
                    this._raiseDialog("MaxItemsDialog", function() {
                        this.navigate(rb.app.cart.getUrl());
                        v._closeDialog(true)
                    }, u);
                    return
                } else {
                    var H = u.attr("upsell");
                    if (H && this._hasUpsell() == false) {
                        var w = rb.api.product.getProductsById(D.ID);
                        if (w && w.data) {
                            rb.app.cart.swapItem(D.ID, w.data.sib, true)
                        }
                    } else {
                        var C = rb.api.product.getFormatName(D.fmt);
                        if (C == "bluray") {
                            this._raiseDialog("BlurayDialog", function() {
                                v._recordFindingMethod(u);
                                rb.app.cart.addItem(D.ID, v._runView, G, t);
                                v._closeDialog(true)
                            }, u);
                            return
                        } else {
                            this._recordFindingMethod(u);
                            rb.app.cart.addItem(D.ID, this._runView, G, t);
                            return
                        }
                    }
                }
            }
            if (D && u.hasClass("rb-btn-find")) {
                this._recordCustomButtonClick(s, I, F, D.fmt);
                this.raiseStoreDialog(B, u)
            }
        }
    },
    _getContainerName: function(b) {
        return $(b).closest("div").attr("container")
    },
    _onCartChange: function(c, d) {
        this._cartItems = rb.app.cart.getItems();
        rb.app.store.getInventory(rb.createDelegate(this, this._onStoreChanged));
        if (this._currentCtx) {
            this.unlock(this._currentCtx)
        }
    },
    _onStoreChange: function(c, d) {
        this._cartItems = rb.app.cart.getItems();
        if (d.state == "completed") {
            rb.app.store.getInventory(rb.createDelegate(this, this._onStoreChanged))
        }
    },
    _onStoreChanged: function(b) {
        this._inventory = b;
        this._refreshButtons()
    },
    _onRegistered: function(b) {
        b.button().removeClass("rb-btn-unreg").addClass("rb-btn-reg").unbind("click").click(rb.createDelegate(this, this._onButtonClicked))
    },
    _raiseDialog: function(h, k, m, l) {
        this._currentCtx = m;
        this._activeDialog = this.getControl(h).attr("type", h);
        var j = this._activeDialog.find(".rb-dialog-disabled").prop("checked", rb.persistence.cookie.get(h + "Disabled") != true ? false : true);
        var n = l || 520;
        if (j.size() > 0 && j.is(":checked")) {
            k()
        } else {
            this._activeDialog.find(".rb-dialog-yes").unbind("click").click(rb.createDelegate(this, k));
            this._activeDialog.find(".rb-dialog-no").unbind("click").click(rb.createDelegate(this, this._closeDialog));
            var o = this;
            this._activeDialog.dialog({
                dialogClass: "rb-dialog-red rb-dialog",
                autoOpen: false,
                width: n,
                height: "auto",
                minHeight: 120,
                modal: true,
                draggable: false,
                resizable: false,
                open: function(b, a) {
                    window.setTimeout(function() {
                        jQuery(document).unbind("mousedown.dialog-overlay").unbind("mouseup.dialog-overlay")
                    }, 100)
                },
                closeOnEscape: false
            });
            this._activeDialog.dialog("open");
            $(".ui-widget-overlay").click(function() {
                o._closeDialog()
            })
        }
    },
    _closeDialog: function(c) {
        if (this._activeDialog) {
            if (c != true && this._currentCtx) {
                if (this._storeChanged && this._activeDialog.selector.indexOf("BlurayDialog" > -1)) {
                    rb.app.store.selectPreviousStore()
                }
                this.unlock(this._currentCtx)
            }
            this._activeDialog.dialog("close");
            var d = this._activeDialog.find(".rb-dialog-disabled");
            if (d.size() > 0) {
                rb.persistence.cookie.set(this._activeDialog.attr("type") + "Disabled", d.is(":checked"))
            }
        }
        this._storeChanged = false
    },
    _getProduct: function(c) {
        var d = rb.api.product.getProductsById(c);
        if (d && d.data) {
            return d.data
        } else {
            return null
        }
    },
    _refreshButtons: function(e) {
        for (var g in this._registeredSets) {
            if (this._registeredSets[g].autoUpdate || e != undefined) {
                var f = this;
                var h;
                if (e == undefined) {
                    h = this._registeredSets[g].find("[buttonkey]")
                } else {
                    h = this._registeredSets[g].find(e)
                } if (h.size() > 0) {
                    if (this._registeredSets[g].auCallback) {
                        this._registeredSets[g].auCallback({
                            state: "pending",
                            buttons: null
                        })
                    }
                    h.each(function() {
                        f.updateButton($(this))
                    });
                    if (this._registeredSets[g].auCallback) {
                        this._registeredSets[g].auCallback({
                            state: "completed",
                            buttons: h
                        })
                    }
                }
            }
        }
    },
    _recordCustomButtonClick: function(q, p, l, k) {
        if (q === true && p === true && l && k) {
            var n = "DVD";
            var o = "Title Detail {0} Button Click";
            var m = {
                products: ";" + l
            };
            var j = [];
            if (rb.api.product.getFormatName(k) === "dvd") {
                j.push("event61")
            } else {
                if (rb.api.product.getFormatName(k) === "bluray") {
                    n = "Blu-ray";
                    j.push("event62")
                }
            }
            rb.rec.Omn.RecordAction(String.format(o, n), m, j)
        }
    },
    _recordClick: function(m, n, j, p, q, l) {
        var k = [];
        var o = {
            products: ";" + n
        };
        if (l == "rent") {
            if (typeof(m.attr("incartpromotion")) != "undefined" && m.attr("incartpromotion") > 0) {
                return
            }
            if (p == "titleMarketing") {
                o.eVar3 = "cart recommendation - title marketing"
            }
            if (p == "default" && q == "True") {
                o.eVar3 = "cart recommendation - double feature"
            }
            if (p == "upsell") {
                o.eVar3 = "Upsell Promotion"
            }
            if (q == "True") {
                o.eVar31 = "cart"
            }
            k.push("scAdd");
            if (j && j.indexOf("productlist") == 0) {
                k.push("prodView")
            }
            if (rb.app.cart.hasItems() == false) {
                k.push("scOpen")
            }
            rb.rec.Omn.RecordAction("Add to Cart", o, k)
        } else {
            if (l == "remind") {
                if (p == "comingSoon") {
                    o.eVar3 = "coming soon"
                }
                if (q == "True") {
                    o.eVar31 = "cart"
                }
                k.push("event31");
                rb.rec.Omn.RecordAction("Coming Soon", o, k)
            }
        }
    },
    _recordFindingMethod: function(c) {
        if (c) {
            var d = this._getContainerName(c);
            if (d == "FT") {
                lockRecord = true;
                rb.rec.Omn.RecordAction("Featured Titles Add", {
                    eVar3: "Featured Titles"
                });
                setTimeout("lockRecord = false;", 1000)
            }
        }
    }
});
rb.registerNamespace("rb.widget");
rb.widget.storepickermenu = rb.widget.base.extend({
    get_childId: function() {
        return this._childId
    },
    set_childId: function(b) {
        this._childId = b
    },
    init: function() {
        this._super();
        this._hovering = false;
        this._childId = null;
        this._dropdown = null;
        this._findButton = null;
        this._retract = null;
        this._widget = null;
        this._storepickerWidget = null;
        this._subscriptions = [this.events.storeChange]
    },
    toggle: function(b) {
        if (this._dropdown.is(":visible")) {
            if (this._widget.has(b.target.nodeName).length === 0 || $(b.target).hasClass("ui-button-text") === true) {
                this._dropdown.hide()
            }
        } else {
            if (this._storepickerWidget && b.target.id === this._storepickerWidget.getControl("DialogHandler").attr("id")) {
                return
            }
            if (this._storepickerWidget) {
                this._storepickerWidget.loadSuggestions()
            }
            this._dropdown.show()
        }
    },
    _onLoad: function(d, e) {
        this._super(d, e);
        this._dropdown = this.getControl("Dropdown");
        this._findButton = this.getControl("FindButton");
        this._retract = this.getControl("Retract");
        this._widget = this.getControl("Widget");
        this._storepickerWidget = this.findChildWidget(this._childId);
        this._findButton.click(rb.createDelegate(this, this._onButtonToggled));
        this._retract.click(rb.createDelegate(this, this._onButtonToggled));
        var f = this;
        this._dropdown.hover(function() {
            f._hovering = true
        }, function() {
            f._hovering = false
        });
        $("body").mouseup(function() {
            if (!f._hovering) {
                f._dropdown.hide()
            }
        })
    },
    _onButtonToggled: function(b) {
        if (this._widget.has(b.target.nodeName).length > 0) {
            this.toggle(b)
        }
    },
    _onStoreChange: function(c, d) {
        if (d.state == "completed") {
            this._dropdown.hide()
        }
    }
});
rb.registerNamespace("rb.widget");
rb.widget.storepicker = rb.widget.base.extend({
    get_moviesUrl: function() {
        return this._moviesUrl
    },
    set_moviesUrl: function(b) {
        this._moviesUrl = b
    },
    get_getSuggestions: function() {
        return this._getSuggestions
    },
    set_getSuggestions: function(b) {
        this._getSuggestions = b
    },
    get_inTitlesContext: function() {
        return this._inTitlesContext
    },
    set_inTitlesContext: function(b) {
        this._inTitlesContext = b
    },
    get_inLocationContext: function() {
        return this._inLocationContext
    },
    set_inLocationContext: function(b) {
        this._inLocationContext = b
    },
    get_searchUrl: function() {
        return this._searchUrl
    },
    set_searchUrl: function(b) {
        this._searchUrl = b
    },
    get_productRef: function() {
        return this._productRef
    },
    set_productRef: function(b) {
        this._productRef = b
    },
    get_displaySuggestedStores: function() {
        return this._displaySuggestedStores
    },
    set_displaySuggestedStores: function(b) {
        this._displaySuggestedStores = b
    },
    get_parentType: function() {
        return this._parentType
    },
    set_parentType: function(b) {
        this._parentType = b
    },
    init: function() {
        this._super();
        this._buttonSetWidget = null;
        this._currentStoreSuggestion = null;
        this._getSuggestions = false;
        this._moviesUrl = null;
        this._productRef = null;
        this._inTitlesContext = null;
        this._inLocationContext = false;
        this._processStoreChange = false;
        this._searchUrl = null;
        this._suggestionCache = [];
        this._displaySuggestedStores = false;
        this._parentType = null;
        this._rentButton = null;
        this._searchBox = null;
        this._searchButton = null;
        this._SearchIconBtn = null;
        this._findNearbyButton = null;
        this._searchIcon = null;
        this._storeList = null;
        this._storeTemplate = null;
        this._widget = null;
        this._delegates = {
            onChangeLocation: rb.createDelegate(this, this._onChangeLocation),
            onSearch: rb.createDelegate(this, this._onSearch),
            onFindNearby: rb.createDelegate(this, this._onFindNearby),
            onSuggestionsLoaded: rb.createDelegate(this, this._onSuggestionsLoaded),
            onCurrentLocationReady: rb.createDelegate(this, this._onCurrentLocationReady)
        };
        this._subscriptions = [this.events.storeChange]
    },
    loadSuggestions: function(g, l) {
        var h = false;
        if (this._parentType == "StorePickerMenu" && this._inLocationContext) {
            h = true
        }
        if (g != null) {
            this._productRef = g
        }
        if (h) {
            this._productRef = null
        }
        if (this._getSuggestions) {
            this.lock();
            if (l === true) {
                rb.api.store.getSuggestedStoresWithInventory(this._productRef == null ? 0 : this._productRef, this._delegates.onSuggestionsLoaded, this._baseDelegates.onAjaxFailDelegate, l)
            } else {
                if (this._productRef == null) {
                    var m = rb.app.store.getSelectedStore();
                    if (m) {
                        var j = rb.app.store.getSuggestedByStoreNumber(m.id);
                        if (j) {
                            this._onSuggestionsLoaded(j)
                        } else {
                            rb.api.store.getSuggestedStores(this._delegates.onSuggestionsLoaded, this._baseDelegates.onAjaxFailDelegate)
                        }
                    } else {
                        var k = rb.app.store.getPreviousStore();
                        if (k) {
                            var j = rb.app.store.getSuggestedByStoreNumber(k.id);
                            if (j) {
                                this._onSuggestionsLoaded(j)
                            } else {
                                rb.api.store.getSuggestedStores(this._delegates.onSuggestionsLoaded, this._baseDelegates.onAjaxFailDelegate)
                            }
                        } else {
                            rb.api.store.getSuggestedStores(this._delegates.onSuggestionsLoaded, this._baseDelegates.onAjaxFailDelegate)
                        }
                    }
                    this.unlock()
                } else {
                    if (this._suggestionCache[this._productRef]) {
                        this._onSuggestionsLoaded(this._suggestionCache[this._productRef])
                    } else {
                        rb.api.store.getSuggestedStoresWithInventory(this._productRef, this._delegates.onSuggestionsLoaded, this._baseDelegates.onAjaxFailDelegate)
                    }
                }
            }
        }
    },
    lock: function() {
        this._locked = true;
        this.getControl("Stores").hide();
        this.getControl("ProgressBar").show()
    },
    unlock: function() {
        this._locked = false;
        this.getControl("ProgressBar").hide()
    },
    _onLoad: function(d, e) {
        this._super(d, e);
        this._searchBox = this.getControl("SearchBox");
        this._searchButton = this.getControl("SearchButton");
        this._SearchIconBtn = this.getControl("SearchIconBtn");
        this._findNearbyButton = this.getControl("FindNearbyButton");
        this._searchIcon = this.getControl("SearchIcon");
        this._storeList = this.getControl("StoreList");
        this._storeTemplate = this.getControl("StoreTemplate");
        this._widget = this.getControl("Widget");
        this._pickerMenuWidget = this.getControl("");
        this._buttonSetWidget = rb.component.findFirstByType("buttonset");
        this._widget.find(".sp-btn").click(this._delegates.onChangeLocation);
        this._widget.find(".sp-btn-clear").click(this._delegates.onChangeLocation);
        this._searchBox.attr("title", this.getText("EnterAddressOrZip")).simpleWaterMark("watermark");
        if (this._findNearbyButton) {
            this._findNearbyButton.click(this._delegates.onFindNearby)
        }
        this._searchButton.click(this._delegates.onSearch);
        this._SearchIconBtn.click(this._delegates.onSearch);
        this._searchIcon.click(this._delegates.onSearch);
        var f = rb.persistence.cookie.get("locationSearchValue");
        if (f) {
            f = unescape(f).replace(/\+/g, " ");
            this._searchBox.val(f)
        }
        if (this._displaySuggestedStores || (this._parentType == "StoreSearch")) {
            this.loadSuggestions()
        } else {
            this.unlock()
        }
    },
    _onStoreChange: function(d, e) {
        if (e.state == "completed" && rb.util.Responsive) {
            rb.navigation.slideLeft()
        }
        if (e.state == "completed" && this._processStoreChange && e.store && e.store.id) {
            this._suggestionCache = [];
            this._recordSelectKiosk(e.store.id);
            var f = this._buttonSetWidget.get_activeDialog();
            if (f) {
                f.dialog("close")
            }
            if (this._rentButton) {
                this._buttonSetWidget.onClick(this._rentButton, true)
            } else {
                if (!this._inTitlesContext && e.store.id > -1) {
                    this.navigate(this._moviesUrl)
                }
            }
            this._processStoreChange = false
        }
    },
    _onChangeLocation: function(e) {
        var f = $(e.currentTarget);
        var d = f.parent("[kioskID]").attr("kioskID");
        if (f.hasClass("rb-btn-rent") && f.attr("buttonkey") > 0) {
            this._rentButton = e
        } else {
            this._rentButton = null
        } if (f.hasClass("sp-btn-clear")) {
            this._processStoreChange = false
        } else {
            this._processStoreChange = true
        }
        rb.app.store.selectStore(d)
    },
    _onKeyEnter: function(b) {
        this._onSearch();
        return false
    },
    _recordSelectKiosk: function(f) {
        if (!f) {
            return
        }
        var e = [];
        e.push("event32");
        var d = {
            prop17: f,
            eVar32: f
        };
        rb.rec.Omn.RecordAction("SelectedLocation", d, e)
    },
    _onFindNearby: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._delegates.onCurrentLocationReady, this._delegates.onCurrentLocationReady)
        }
    },
    _onCurrentLocationReady: function(b) {
        if (b && b.coords) {
            this._searchBox.val(String.format("{0}, {1}", b.coords.latitude, b.coords.longitude));
            this._onSearch()
        }
    },
    _onSearch: function() {
        var d = this._searchBox.val();
        var c = this._productRef ? "&productRef=" + this._productRef : "";
        if (this._validate(d)) {
            rb.persistence.cookie.set("locationSearchValue", d);
            this.navigate(this._searchUrl + "?loc=" + d + c)
        }
    },
    _onSuggestionsLoaded: function(e, f) {
        if (this._productRef) {
            this._suggestionCache[this._productRef] = e
        } else {
            if (f == null || f == false) {
                var d = rb.app.store.getSelectedStore();
                if (d) {
                    rb.app.store.setSuggestedByStoreNumber(d.id, e)
                } else {
                    if (e && e.data && e.data.length > 0) {
                        rb.app.store.setSuggestedByStoreNumber(e.data[0].id, e)
                    }
                }
            }
        } if (e && e.data && e.data.length > 0) {
            rb.parseTemplate(this._storeTemplate, this._storeList, e.data.skiptake(0, 3));
            this._widget.find(".location-kiosk-content").show();
            if (this._productRef) {
                this._widget.find(".sp-btn").text(this.getText("Rent")).removeClass("rb-red").css("width", "110px").addClass("rb-blue").attr("buttonkey", this._productRef).button().click(this._delegates.onChangeLocation)
            } else {
                if (this._inTitlesContext === true && rb.app.store.isStoreSelected()) {
                    this._widget.find(".sp-btn").not(".sp-btn-clear").text(this.getText("Select")).button().click(this._delegates.onChangeLocation)
                } else {
                    this._widget.find(".sp-btn").not(".sp-btn-clear").text(this.getText("Browse")).button().click(this._delegates.onChangeLocation)
                }
            }
            this.getControl("Stores").show()
        } else {
            this._widget.find(".sp-btn-clear").hide()
        } if (this._parentType == "StoreSearch" || this._parentType == "ButtonSet") {
            this._widget.find(".sp-btn-clear").hide()
        } else {
            if (rb.app.store.isStoreSelected()) {
                this._widget.find(".sp-btn-clear").show()
            } else {
                this._widget.find(".sp-btn-clear").hide()
            }
        } if (this._parentType != "StoreSearch" || this._inLocationContext == false) {
            this._widget.find(".search-for-location").show()
        } else {
            this._widget.find(".search-for-location").hide()
        }
        this.unlock()
    },
    _validate: function(d) {
        if (d.length < 2) {
            return false
        }
        var c = this.getText("EnterAddressOrZip");
        if (d.substring(0, c.length) === c) {
            return false
        }
        return true
    }
});
rb.registerNamespace("rb.widget");
rb.widget.footer = rb.widget.base.extend({
    init: function() {
        this._super()
    },
    _onLoad: function(c, d) {
        this._super(c, d);
        this.getControl("FooterFacebookLink").click(function() {
            rb.rec.Omn.RecordExitLink("Facebook Link")
        });
        this.getControl("FooterTwitterLink").click(function() {
            rb.rec.Omn.RecordExitLink("Twitter Link")
        });
        this.getControl("FooterMobileLink").click(function() {
            rb.rec.Omn.RecordExitLink("iTunes Link")
        });
        this.getControl("FooterRedblogLink").click(function() {
            rb.rec.Omn.RecordExitLink("Redblog Link")
        });
        $(".rb-footer-facebook").click(function() {
            rb.rec.Omn.RecordExitLink("Facebook Link")
        });
        $(".rb-footer-twitter").click(function() {
            rb.rec.Omn.RecordExitLink("Twitter Link")
        });
        $(".rb-footer-mobile").click(function() {
            rb.rec.Omn.RecordExitLink("iTunes Link")
        });
        $(".rb-footer-redblog").click(function() {
            rb.rec.Omn.RecordExitLink("Redblog Link")
        })
    }
});
rb.registerNamespace("rb.widget");
rb.widget.shoppingsession = rb.widget.base.extend({
    get_data: function() {
        return this._data
    },
    set_data: function(b) {
        this._data = b
    },
    get_maxItems: function() {
        return this._maxItems
    },
    set_maxItems: function(b) {
        this._maxItems = b
    },
    get_reachedMaxItems: function() {
        return this._data.session.items.length >= this._maxItems
    },
    init: function() {
        this._super();
        this._data = null;
        this._redirectToCart = false;
        this._fromBrowse = false;
        this._maxItems = null;
        this._button = null;
        this._buttonText = "";
        this._cartItems = null;
        this._delegates = {
            onAddResponse: rb.createDelegate(this, this._onAddResponse),
            onRemoveResponse: rb.createDelegate(this, this._onRemoveResponse),
            onMaxItemsClick: rb.createDelegate(this, this._onMaxItemsClick)
        };
        this._subscriptions = [this.events.cartChange]
    },
    bind: function() {
        this._cartItems.text(this._data.session.items.length)
    },
    addItem: function(f, e, g, h) {
        this._redirectToCart = g;
        if (this.get_reachedMaxItems()) {
            this.showMaxItemsDialog()
        } else {
            this._onAddItem(f, e, h)
        }
    },
    removeItem: function(c, d) {
        this.lock();
        if (d == null) {
            d = false
        }
        rb.api.cart.removeItem(c, d, this._delegates.onRemoveResponse, this._baseDelegates.onAjaxFailDelegate, c)
    },
    getItem: function(c) {
        if (!this.hasItems()) {
            return null
        }
        for (var d = 0; d < this._data.session.items.length; d++) {
            if (this._data.session.items[d].productRef == c) {
                return this._data.session.items[d]
            }
        }
        return null
    },
    hasItems: function() {
        return (this._data != null && this._data.session.items != null && this._data.session.items.length > 0)
    },
    _onLoad: function(c, d) {
        this._super(c, d);
        this._button = this.getControl("Button");
        this._button.click(rb.createDelegate(this, this._onClick));
        this._cartItems = this.getControl("CartItems");
        this._buttonText = this._button.text();
        this.bind()
    },
    _onAddItem: function(e, d, f) {
        this.lock();
        if (d == null || this._redirectToCart == null || this._redirectToCart) {
            d = false
        }
        rb.api.cart.addItem(e, f, d, this._delegates.onAddResponse, this._baseDelegates.onAjaxFailDelegate, e)
    },
    _onClick: function(c, d) {
        return this._data.session.items.length > 0
    },
    _onCartChange: function(c, d) {
        this._data = {
            session: d.data.cart
        };
        this.bind();
        this.unlock()
    },
    _onAddResponse: function(c, d) {
        if (this._redirectToCart) {
            window.location.href = rb.app.cart.getUrl()
        } else {
            this.unlock();
            this._data = c.data;
            this.raiseOnSessionChange({
                data: this._data,
                type: "add",
                productRefID: d
            });
            this.bind()
        }
    },
    _onRemoveResponse: function(c, d) {
        this.unlock();
        this._data = c.data;
        this.raiseOnSessionChange({
            data: this._data,
            type: "remove",
            productRefID: d
        });
        this.bind()
    },
    addOnSessionChange: function(b) {
        this.addHandler("onSessionChange", b)
    },
    removeOnSessionChange: function(b) {
        this.removeHandler("onSessionChange", b)
    },
    raiseOnSessionChange: function(b) {
        return this.raiseEvent("onSessionChange", {
            data: b
        })
    }
});
rb.registerNamespace("rb.widget");
rb.widget.headerbar = rb.widget.base.extend({
    init: function() {
        this._super();
        this._miniEdge = 80;
        this._widget = null;
        this._spaceArea = null;
        this._logoImage = null;
        this._logoImageMini = null;
        this._moviessubmenu = null;
        this._gamessubmenu = null;
        this._digital = null
    },
    _onLoad: function(c, d) {
        this._super(c, d);
        this._digital = this.getControl("Digital");
        this._digital.show();
        $("#ticketsbutton").show();
        this._widget = this.getControl("Widget");
        this._spaceArea = this.getControl("SpaceArea");
        this._logoImage = this._widget.find("#header_LogoImage");
        this._logoImageMini = this._widget.find("#header_LogoImageMini");
        this._moviessubmenu = this._widget.find("#head-subnav-menuoptions");
        this._gamessubmenu = this._widget.find("#head-subnav-menuoptions");
        this._moviessubmenu.children().removeClass("active");
        if ($("body").hasClass("url-movies") || $("body").hasClass("url-action-movies") || $("body").hasClass("url-comedy-movies") || $("body").hasClass("url-drama-movies") || $("body").hasClass("url-family-movies") || $("body").hasClass("url-horror-movies")) {
            if ($("body").hasClass("url-top20")) {
                $("#nav").find("#moviestop20").addClass("active")
            } else {
                if ($("body").hasClass("url-comingsoon")) {
                    $("#nav").find("#moviescomingsoon").addClass("active")
                } else {
                    $("#nav").find("#moviesallmovies").addClass("active")
                }
            }
        } else {
            if ($("body").hasClass("url-games") || $("body").hasClass("url-wii-games") || $("body").hasClass("url-xbox360-games") || $("body").hasClass("url-ps3-games")) {
                if ($("body").hasClass("url-comingsoon")) {
                    $("#nav").find("#gamescomingsoon").addClass("active")
                } else {
                    $("#nav").find("#gamesallgames").addClass("active")
                }
            }
        }
    }
});
