/**
 * Created by Administrator on 2015/12/14.
 */
M.define("/js/Dropdown", function (c, b, d) {
    function a(e) {
        this.$nav = typeof e.nav === "string" ? $(e.nav) : e.nav;
        this.$panel = typeof e.panel === "string" ? $(e.panel) : e.panel;
        this.showCallback = e.showCallback;
        this.hideCallback = e.hideCallback;
        this.delay = e.delay || 0;
        this.event = e.event || "mouseenterleave";
        this._isShow = false;
        this.init()
    }

    a.prototype = {
        init: function () {
            if (this.event === "mouseenterleave") {
                this.$nav.on("mouseenter.dropdown", M.bind(function (e) {
                    this.show()
                }, this)).on("mouseleave.dropdown", M.bind(function (e) {
                    if ($(e.relatedTarget).closest(this.$panel).length === 0) {
                        this.hide(true)
                    }
                }, this));
                this.$panel.on("mouseenter.dropdown", M.bind(function (e) {
                    this.show()
                }, this)).on("mouseleave.dropdown", M.bind(function (e) {
                    if ($(e.relatedTarget).closest(this.$nav).length === 0) {
                        this.hide(false)
                    }
                }, this))
            }
            if (this.event === "click") {
                this.$nav.on("click.dropdown", M.bind(function (e) {
                    this.show()
                }, this));
                $(document).on("click.dropdown", M.bind(function (e) {
                    if ($(e.target).closest(this.$nav).length === 0 && $(e.target).closest(this.$panel).length === 0) {
                        this.hide(false)
                    }
                }, this))
            }
        }, show: function () {
            this.$panel.show();
            this._isShow = true;
            if (M.isFunction(this.showCallback)) {
                this.showCallback.call(this, this.$nav, this.$panel)
            }
        }, hide: function (e) {
            this._isShow = false;
            if (e && this.delay > 0) {
                setTimeout(M.bind(function () {
                    if (!this._isShow) {
                        this.$panel.hide();
                        if (M.isFunction(this.hideCallback)) {
                            this.hideCallback.call(this, this.$nav, this.$panel)
                        }
                    }
                }, this), this.delay)
            } else {
                this.$panel.hide();
                if (M.isFunction(this.hideCallback)) {
                    this.hideCallback.call(this, this.$nav, this.$panel)
                }
            }
        }, destory: function () {
            if (this.event === "mouseenterleave") {
                this.$nav.off("mouseenter.dropdown").off("mouseleave.dropdown");
                this.$panel.off("mouseenter.dropdown").off("mouseleave.dropdown")
            }
            if (this.event === "click") {
                this.$nav.off("click.dropdown")
            }
            this.$panel.hide()
        }
    };
    d.exports = a
});

var $searchResultType = true;
M.define("/js/SiteSearch", function (c) {
    var d = c("Suggestion"), b = window.Env || {};
    var a = function (o) {
        var p = $("#" + o.Input + ""), n = p.closest(".head-search-wrapper"), h = $("#_j_search_link"), m = $(".head-search form"), j = o.Input;
        var l = new d({
            url: (b.WWW_HOST ? "http://" + b.WWW_HOST : "") + "/group/ss.php",
            input: p,
            listItemHoverClass: "active",
            dataType: "jsonp",
            createListContainer: function () {
                return $('<div class="search-suggest-panel search-suggest-all hide"><ul class="suggest-list"></ul></div>').appendTo("body")
            },
            handleSuggest: function (t) {
                var r = t.data ? g(t.data, $.trim(p.val())) : [];
                p.data("droplist")["firstItemHover"] = t.exact == true;
                if (!r.length) {
                    p.data("droplist").hide()
                } else {
                    var q = [];
                    for (var s = 0; s < r.length; s++) {
                        if (r[s] == "search://") {
                            if (r[s + 1] == "more") {
                                q.push('<li class="ssp-more _j_listitem" data-type="' + r[s + 1] + '" data-url="http://' + b.WWW_HOST + r[s + 2] + '" data-title="' + r[s + 4] + '">' + r[s + 6] + "</li>")
                            } else {
                                q.push('<li class="_j_listitem" data-type="' + r[s + 1] + '" data-url="http://' + b.WWW_HOST + r[s + 2] + '" data-title="' + r[s + 4] + '"><i class="' + r[s + 3] + '"></i><span class="skey">' + r[s + 6] + "</span><span>" + r[s + 5] + "</span></li>")
                            }
                            s += 6
                        } else {
                            q.push("<li>" + r[s] + "</li>")
                        }
                    }
                    return q.join("")
                }
            },
            updateList: function (q) {
                this.listContainer.html(q)
            }
        });
        p.on("focus", function (q) {
            n.addClass("head-search-focus")
        }).on("blur", function (q) {
            n.removeClass("head-search-focus")
        });
        h.click(function (r) {
            var q = $.trim(p.val());
            if (!!q && $searchResultType) {
                i(q, "", "search_btn");
                location.href = "/group/s.php?q=" + q
            }
        });
        m.on("submit", function () {
            if ($searchResultType == false) {
                return false
            }
            i($.trim(p.val()), "", "enter");
            location.href = "/group/s.php?q=" + p.val()
        });
        $(window).resize(function () {
            if (l.listContainer && l.listContainer.length && l.listContainer.is(":visible")) {
                f(p, l.listContainer)
            }
        });
        M.Event(l).on("before show list", function () {
            f(p, l.listContainer)
        });
        M.Event(l).on("itemselected", function (r) {
            var s = r.item;
            if (s.length) {
                i($.trim(p.val()), s, "click");
                document.location.href = s.data("url")
            } else {
                var q = $.trim(p.val());
                if (!!q) {
                    location.href = "/group/s.php?q=" + q
                } else {
                    return
                }
            }
        });
        var i = function (r, t, s) {
            $searchResultType = false;
            var q = {};
            if (!!t) {
                var u = t.closest("li");
                q.local = u.index()
            }
            q.search_category = "suggest";
            q.url = "/group/s.php?q=" + encodeURIComponent(r);
            q.search_type = "all";
            q.search_tab = "suggest";
            q.trigger = s;
            if (j == "inp-txt") {
                q.search_from = "result_suggest"
            } else {
                q.search_from = "top"
            }
            q.keyword = r;
            if (t.length) {
                q.url = t.data("url");
                q.search_type = t.data("type")
            }
            q.trigger = q.search_type == "more" ? "more" : q.trigger;
            !!mfwPageEvent && mfwPageEvent("se", "result_click", q)
        };

        function f(q, s) {
            var r = q.offset();
            s.css({left: r.left - 4, top: r.top + p.outerHeight() + 3})
        }

        function g(r, v) {
            var s = [], x = r.split("|");
            v = e(v);
            for (var u = 0; u < x.length; u++) {
                var t = $.trim(x[u]);
                if (t == "search://") {
                    var q = s.length;
                    s[q] = x[u++];
                    s[q + 1] = x[u++];
                    s[q + 2] = x[u++];
                    s[q + 3] = x[u++];
                    s[q + 4] = x[u++];
                    s[q + 5] = x[u];
                    continue
                }
                if (t) {
                    try {
                        t = t.replace(new RegExp(v, "ig"), function (y) {
                            return '<span class="highlight">' + y + "</span>"
                        })
                    } catch (w) {
                        t = t.replace(v, function (y) {
                            return '<span class="highlight">' + y + "</span>"
                        })
                    }
                    s[s.length] = t
                }
            }
            return s
        }

        var k = $("<div/>");

        function e(q) {
            return k.text(q).html()
        }
    };
    return a
});

(function (a) {
    a.fn.UpNum = function (d, e, b, c) {
        return this.each(function () {
            var g = a(this).offset();
            var j = Math.round(g.left) + "px";
            var h = Math.round(g.top) + "px";
            if (d.toString().indexOf("-") == 0) {
                var k = Math.round(g.top) + 30 + "px"
            } else {
                var k = Math.round(g.top) - 30 + "px"
            }
            var f = "20px";
            if (b) {
                f = b
            }
            c = c || "120";
            var i = d || a(this).attr("money");
            a("<div/>").appendTo(a("body")).addClass("numeric").css({
                position: "absolute",
                top: h,
                left: j,
                color: (d.toString().indexOf("-") == 0) ? "#333" : "red",
                fontFamily: "Georgia",
                fontSize: f,
                zIndex: c
            }).html(i).animate({top: k}, {
                duration: 1000, complete: function () {
                    a(this).remove();
                    if (e) {
                        e()
                    }
                }
            })
        })
    };
    if (window.M && typeof M.define == "function") {
        M.define("jq-upnum", function () {
            return jQuery
        })
    }
})(jQuery);

M.define("InputListener", function (c, b, d) {
    var a = {
        listen: function (f, e) {
            f = $(f);
            f.each($.proxy(function (g, h) {
                h = $(h);
                if (!h.is("input") && !h.is("textarea")) {
                    throw new Error("input listener only apply to input or textarea")
                }
                this.initListen(h, e)
            }, this))
        },
        unlisten: function (e) {
            e = $(e);
            e.each($.proxy(function (h, k) {
                k = $(k);
                if (!k.is("input") && !k.is("textarea")) {
                    throw new Error("input listener only apply to input or textarea")
                }
                if (arguments.length == 1) {
                    k.unbind("focus", this.getStartListenFunc());
                    k.unbind("blur", this.getStopListenFunc());
                    k.removeData("__input_listener_handlers")
                } else {
                    if (typeof arguments[1] == "function") {
                        var j = arguments[1], g = k.data("__input_listener_listeninterval");
                        for (var h = 0, f = g.length; h < f; h++) {
                            if (g[h] == j) {
                                g.splice(h, 1);
                                h--
                            }
                        }
                    }
                }
            }, this))
        },
        initListen: function (f, e) {
            f.data("__input_listener_currentval", f.val());
            if (!f.data("__input_listener_handlers")) {
                this.bindListenEvent(f)
            }
            this.addListenHandler(f, e)
        },
        bindListenEvent: function (e) {
            e.data("__input_listener_handlers", []);
            e.focus(this.getStartListenFunc());
            e.blur(this.getStopListenFunc())
        },
        getStartListenFunc: function () {
            if (!this.bindStartListenFunc) {
                this.bindStartListenFunc = $.proxy(this.startListen, this)
            }
            return this.bindStartListenFunc
        },
        getStopListenFunc: function () {
            if (!this.bindStopListenFunc) {
                this.bindStopListenFunc = $.proxy(this.stopListen, this)
            }
            return this.bindStopListenFunc
        },
        startListen: function (e) {
            var f = $(e.target);
            f.data("__input_listener_currentval", f.val());
            f.data("__input_listener_listeninterval", setInterval($.proxy(function () {
                var h = f.data("__input_listener_currentval"), g = f.val();
                if (h != g) {
                    f.data("__input_listener_currentval", g);
                    this.triggerListenHandler(f)
                }
            }, this), 100))
        },
        stopListen: function (e) {
            var f = $(e.target);
            clearInterval(f.data("__input_listener_listeninterval"))
        },
        addListenHandler: function (f, e) {
            if (typeof e == "function") {
                f.data("__input_listener_handlers").push(e)
            }
        },
        triggerListenHandler: function (h) {
            var f = h.data("__input_listener_handlers");
            for (var g = 0, e = f.length; g < e; g++) {
                f[g].call(null, {target: h.get(0)})
            }
        }
    };
    return a
});

M.define("SuggestionXHR", function (b, a, c) {
    function d(e) {
        this.URL = null;
        this.delay = 200;
        this.dataType = "text";
        $.extend(this, e);
        this.delayTimer = null;
        this.xhr = null;
        this.cache = {};
        this.init()
    }

    d.prototype = {
        init: function () {
            if (!this.URL) {
                throw new Error("no url for suggestion")
            }
        }, getSuggestion: function (g, h) {
            var f = this.getQuery(g), e = this.cache[f];
            h = typeof h === "function" ? h : $.noop;
            this.stop();
            if (e) {
                h(e)
            } else {
                this.getXHRData(f, h)
            }
        }, stop: function () {
            clearTimeout(this.delayTimer);
            if (this.xhr && this.xhr.readyState !== 4) {
                this.xhr.abort()
            }
        }, getQuery: function (h) {
            var g = "";
            if (typeof h == "string") {
                g = encodeURIComponent(h)
            } else {
                if (h && typeof h == "object") {
                    var e = [];
                    for (var f in h) {
                        if (h.hasOwnProperty(f)) {
                            e.push(f + "=" + encodeURIComponent(h[f]))
                        }
                    }
                    g = e.join("&")
                }
            }
            return g
        }, getXHRData: function (e, h) {
            var f = this.xhr, g = {
                url: this.URL, data: e, dataType: this.dataType, success: M.bind(function (i) {
                    h(i);
                    this.cache[e] = i
                }, this)
            };
            this.delayTimer = setTimeout(M.bind(function () {
                this.xhr = $.ajax(g)
            }, this), this.delay)
        }
    };
    return d
});

M.define("DropList", function (c, b, d) {
    var a = M.Event;

    function e(f) {
        this.trigger = null;
        this.container = null;
        this.itemSelector = "._j_listitem";
        this.itemHoverClass = "on";
        this.firstItemHover = false;
        $.extend(this, f);
        this.trigger = $(this.trigger);
        this.container = $(this.container);
        this.mouseon = false;
        this.visible = false;
        this.init()
    }

    M.mix(e.prototype, {
        createContainer: $.noop, updateList: $.noop, init: function () {
            if (!this.trigger.length) {
                M.error("no trigger for drop list")
            }
            if (!this.container.length) {
                this.container = this.createContainer()
            }
            if (!this.container.length) {
                M.error("no container for drop list")
            }
            this.bindEvents()
        }, bindEvents: function () {
            this.trigger.on("keydown", $.proxy(function (g) {
                var h = g.keyCode;
                if (this.visible && h == 13) {
                    var f = this.getFocusItem();
                    if (f.length) {
                        this.selectItem(f);
                        g.preventDefault()
                    }
                } else {
                    if (this.visible && h == 38) {
                        this.moveFocus(-1)
                    } else {
                        if (this.visible && h == 40) {
                            this.moveFocus(1)
                        }
                    }
                }
            }, this));
            this.container.on("mouseenter", this.itemSelector, $.proxy(this.moveFocus, this)).on("click", this.itemSelector, $.proxy(this.clickItem, this)).on("mouseenter", $.proxy(this.mouseOverCnt, this)).on("mouseleave", $.proxy(this.mouseOutCnt, this))
        }, show: function (g) {
            this.updateList(g);
            this.container.show();
            if (this.firstItemHover) {
                var f = this.container.find(this.itemSelector);
                if (f.length) {
                    this.moveFocus(1)
                }
            }
            this.visible = true
        }, hide: function () {
            this.container.hide();
            this.visible = false
        }, clickItem: function (g) {
            var f = this.getFocusItem();
            this.selectItem(f);
            g.preventDefault()
        }, selectItem: function (f) {
            a(this).fire("itemselected", {item: f})
        }, moveFocus: function (i) {
            var h = this.container.find(this.itemSelector), j = this.getFocusItem(), g = j, f;
            if (i === -1) {
                if (j.length) {
                    f = h.index(j) - 1
                }
                if (!j.length || f == -1) {
                    g = h.last()
                } else {
                    g = h.eq(f)
                }
            } else {
                if (i === 1) {
                    if (j.length) {
                        f = h.index(j) + 1
                    }
                    if (!j.length || f == h.length) {
                        g = h.first()
                    } else {
                        g = h.eq(f)
                    }
                } else {
                    if (i.currentTarget) {
                        g = $(i.currentTarget)
                    }
                }
            }
            j.removeClass(this.itemHoverClass);
            g.addClass(this.itemHoverClass)
        }, getFocusItem: function () {
            var f = this.container.find(this.itemSelector);
            return f.filter("." + this.itemHoverClass)
        }, mouseOverCnt: function () {
            this.mouseon = true
        }, mouseOutCnt: function () {
            this.mouseon = false
        }
    });
    return e
});

M.define("Suggestion", function (c) {
    var a = c("InputListener");
    var b = '{{each(i, item) list}}<li class="${listItemClass}" data-value="${item.value}">${item.text}</li>{{/each}}';

    function d(e) {
        e.suggestionURL = e.url || $(e.input).data("suggestionurl");
        this.dropListClass = "droplist";
        this.listItemSelector = "._j_listitem";
        this.listItemHoverClass = "on";
        this.listFirstItemHover = false;
        this.keyParamName = "key";
        this.dataType = "json";
        this.suggestionParams = {};
        this.listContainer = null;
        M.mix(this, e);
        this.input = $(this.input);
        this.listTmpl = this.listTmpl || b;
        this.actOnList = false;
        this.init()
    }

    M.mix(d.prototype, {
        init: function () {
            a.listen(this.input, $.proxy(this.inputChange, this));
            this.input.blur($.proxy(function (f) {
                var e = $(f.currentTarget);
                if (e.data("droplist")) {
                    setTimeout($.proxy(function () {
                        if (!this.actOnList && e.data("droplist")) {
                            e.data("droplist").hide()
                        }
                        this.actOnList = false
                    }, this), 200)
                }
            }, this));
            this.input.keyup($.proxy(function (f) {
                var e = $(f.currentTarget);
                if (f.keyCode == 40 && (!e.data("droplist") || !e.data("droplist").visible)) {
                    this.inputChange(f)
                }
            }, this))
        }, inputChange: function (i) {
            var f = $(i.target), k = $.trim(f.val()), j = c("SuggestionXHR"), h = c("DropList");
            var g = f.data("droplist");
            if (!g) {
                f.data("droplist", g = new h({
                    trigger: f,
                    itemSelector: this.listItemSelector,
                    itemHoverClass: this.listItemHoverClass,
                    firstItemHover: this.listFirstItemHover,
                    container: this.listContainer,
                    createContainer: $.proxy(function () {
                        var l = this.createListContainer(f);
                        this.listContainer = l;
                        return l
                    }, this),
                    updateList: $.proxy(this.updateList, this)
                }));
                M.Event(g).on("itemselected", $.proxy(function (l) {
                    this.dropItemSelected(f, l.item)
                }, this))
            }
            var e = f.data("suggestion");
            if (!e) {
                f.data("suggestion", e = new j({URL: this.suggestionURL, dataType: this.dataType}))
            }
            if (!k.length) {
                e.stop();
                g.hide()
            } else {
                this.suggestionParams[this.keyParamName] = k;
                M.Event(this).fire("before suggestion xhr");
                e.getSuggestion(this.suggestionParams, $.proxy(function (m) {
                    M.Event(this).fire("before show list");
                    var l = this.handleSuggest(m);
                    if (l) {
                        f.data("droplist").show(l)
                    }
                }, this))
            }
        }, handleSuggest: function (f) {
            var e = "";
            if (this.dataType == "json") {
                e = $.tmpl(this.listTmpl, f)
            }
            return e
        }, createListContainer: function (f) {
            var g = $("<ul />"), e = f.position();
            g.css({
                display: "none",
                position: "absolute",
                left: e.left,
                top: e.top + f.outerHeight()
            }).addClass(this.dropListClass);
            g.insertAfter(f);
            return g
        }, updateList: function (e) {
            this.listContainer.html(e)
        }, hideDropList: function () {
            this.input.data("droplist") && this.input.data("droplist").hide()
        }, dropItemSelected: function (e, f) {
            a.unlisten(e);
            M.Event(this).fire("itemselected", {item: f, input: e});
            a.listen(e, $.proxy(this.inputChange, this))
        }
    });
    return d
});

M.closure(function (l) {
    var F = $("#header");
    if (!F.length) {
        return false
    }
    var z = l("/js/Dropdown");
    var x = l("/js/SiteSearch"),
        i = new x({Input: "head-search-word"});
    var b = $("#head-btn-daka"),
        y = $("#head-my-coin");
    l("jq-upnum");
    $(function () {
        $(".new_daka_tips").addClass("on")
    });
    $(".ndt_close").on("click", function () {
        $(this).parent().hide()
    });
    M.Event.on("afterDaka", C);
    function C(I) {
        if (I && I.dakaFlag) {
            b.closest(".head-daka").addClass("daka-complete")
        }
    }

    var d = k("dakaday");
    if (d != null) {
        $(".head-btn-daka").attr("data-day", d)
    }
    function k(I) {
        var J = new RegExp("(^|&)" + I + "=([^&]*)(&|$)");
        var K = window.location.search.substr(1).match(J);
        if (K != null) {
            return unescape(K[2])
        }
        return null
    }

    var H = new z({
        nav: "#_j_head_user", panel: "#_j_user_panel", showCallback: function (I, J) {
            I.find(".drop-trigger").addClass("drop-trigger-active")
        }, hideCallback: function (I, J) {
            I.find(".drop-trigger").removeClass("drop-trigger-active")
        }, delay: 500
    });
    var j = 0, c = $("#_j_head_msg"), e = $("#_j_msg_panel"), B = c.find(".head-msg-new"), g = $("#_j_msg_float_panel");
    var h = new z({
        nav: c.selector, panel: e.selector, showCallback: function (I, J) {
            I.find(".drop-trigger").addClass("drop-trigger-active")
        }, hideCallback: function (I, J) {
            I.find(".drop-trigger").removeClass("drop-trigger-active")
        }, delay: 200
    });
    M.Event.on("get new msg", function (I) {
        if (I.msg || j > 0) {
            e.find("ul").html(I.menu_index);
            D()
        }
    });
    e.on("click", "a", function (I) {
        M.Event.fire("update msg")
    });
    g.on("click", "ul a", function (I) {
        M.Event.fire("update msg")
    });
    g.on("click", ".close-newmsg", function (I) {
        w()
    });
    function w() {
        B.hide();
        g.hide();
        $.ajax({
            url: "http://" + Env.WWW_HOST + "/ajax/ajax_msg.php",
            dataType: "jsonp",
            data: {a: "ignore", from: "1"},
            success: function (I) {
                M.Event.fire("update msg")
            }
        })
    }

    window.close_msg_tips = w;
    function D() {
        var I = "";
        j = 0;
        e.find(".num").each(function (J, L) {
            var K = $(L);
            j += Number(K.html());
            I += "<li>" + K.closest("li").html() + "</li>"
        });
        if (j > 0) {
            B.html((j > 99 ? "99+" : j)).show();
            g.find("ul").html(I).end().show()
        } else {
            B.hide();
            g.hide()
        }
    }

    D();
    $("#_j_nav_sales").find("[data-sales-nav]").on("click", function () {
        var I = $(this).data("salesNav");
        mfwPageEvent("sales", "index_sales_nav", {name: I})
    });
    var f = 0, A = 0;
    $("._j_sales_nav_show").hover(function () {
        clearTimeout(f);
        A = setTimeout(function () {
            $("._j_sales_nav_show").addClass("head-nav-hover");
            $("._j_sales_top").fadeIn(300)
        }, 200)
    }, function () {
        clearTimeout(A);
        f = setTimeout(function () {
            $("._j_sales_nav_show").removeClass("head-nav-hover");
            $("._j_sales_top").fadeOut(300)
        }, 200)
    });
    var v = 0, p = 0;
    $("._j_shequ_nav_show").hover(function () {
        clearTimeout(v);
        p = setTimeout(function () {
            $("._j_shequ_nav_show").addClass("head-nav-hover");
            $("._j_shequ_top").fadeIn(300)
        }, 200)
    }, function () {
        clearTimeout(p);
        v = setTimeout(function () {
            $("._j_shequ_nav_show").removeClass("head-nav-hover");
            $("._j_shequ_top").fadeOut(300)
        }, 200)
    });
    var E = $("#_j_community_panel"), r = E.find(".panel-image").length, s = Math.floor(Math.random() * r);
    if (s === r) {
        s--
    }
    E.find(".panel-image").eq(s).show();
    $("#_j_showlogin").click(function (I) {
        if (window.location.host === Env.WWW_HOST) {
            I.preventDefault()
        }
        M.Event.fire("login:required")
    });
    var o = window.location.hostname, t = window.location.pathname + window.location.search, a = $("#_j_head_nav");
    if (o.indexOf("www") === 0) {
        if (t === "" || t === "/") {
            a.children("li:eq(0)").addClass("head-nav-active")
        }
        var q = new RegExp("^/(mdd|photo/mdd|poi|photo/poi|travel-scenic-spot|jd|cy|gw|yl|yj|xc)/|sFrom=mdd.*|sFrom=smdd.*", "i");
        if (q.test(t)) {
            a.children("li:eq(1)").addClass("head-nav-active")
        }
        var n = new RegExp("^/gonglve/.*", "i");
        if (n.test(t)) {
            a.children("li:eq(2)").addClass("head-nav-active")
        }
        var m = window.Env && window.Env.sales_title_tag;
        if (m) {
            if (m === "flight_hotel") {
                a.children("li:eq(3)").find("ul>li:eq(0)>a").addClass("on")
            } else {
                if (m === "visa") {
                    a.children("li:eq(3)").find("ul>li:eq(2)>a").addClass("on")
                } else {
                    if (m === "localdeals") {
                        a.children("li:eq(3)").find("ul>li:eq(1)>a").addClass("on")
                    } else {
                        if (m === "insure") {
                            a.children("li:eq(3)").find("ul>li:eq(4)>a").addClass("on")
                        }
                    }
                }
            }
            a.find("li:eq(3)").addClass("head-nav-active")
        }
        var G = new RegExp("^/hotel/(?!.*sFrom=mdd).*", "ig");
        if (G.test(t)) {
            a.children("li:eq(4)").addClass("head-nav-active")
        }
        var u = new RegExp("^/(wenda|qa|mall|together|group|i|traveller|rudder|paimai|club|postal|school|photo_pk|focus)/(?!.*sFrom=mdd|s.php*).*", "i");
        if (u.test(t)) {
            a.children("li:eq(5)").addClass("head-nav-active")
        }
    }
});