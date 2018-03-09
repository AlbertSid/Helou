(function ($) {
    var methods = {
        init: function (options) {
            var settings = $.extend({
                page: 1,
                total: 0,
                args: "",
                item_size: 10,
                display_num: 5,
                prev_text: "&lt;&lt;Prev",
                next_text: "Next&gt;&gt;",
                ellipse_text: "...",
                prev_show_always: true,
                next_show_always: true,
                item_class: "ti",
                current_item_class: "this-page",
                next_item_class: "next",
                callback: function () {
                    return false
                }
            }, options);
            return this.each(function () {
                var $this = $(this);
                methods._drawLinks.call($this, settings);
                $this.data("settings", settings)
            })
        }, _drawLinks: function (settings) {
            var self = this;
            var pagesize = Math.ceil(settings.total / settings.item_size);
            if (pagesize <= 1) {
                return ""
            }
            if (settings.display_num % 2 == 0) {
                settings.display_num++
            }
            if (settings.args.substr(0, 1) != "," && settings.args != "") {
                settings.args = "," + settings.args
            }
            this.empty();
            var has_fisrt = false, prev_flag = 0, next_flag = 0;
            if (settings.page > 1 && settings.prev_show_always) {
                this.append($('<a href="javascript:void(0);" class="' + settings.item_class + ' prev">' + settings.prev_text + "</a>").click(function () {
                    eval("settings.callback(" + (settings.page - 1) + settings.args + ")");
                    settings.page = settings.page - 1;
                    methods._drawLinks.call(self, settings)
                }))
            }
            if (settings.page != 1) {
                this.append($('<a href="javascript:void(0);" class="' + settings.item_class + '">1</a>').click(function () {
                    eval("settings.callback(1" + settings.args + ")");
                    settings.page = 1;
                    methods._drawLinks.call(self, settings)
                }));
                has_fisrt = true
            }
            if (settings.page != 1 && (pagesize > (settings.display_num + 2) && settings.page - (settings.display_num + 1) / 2 > 1)) {
                this.append($('<a href="javascript:void(0);" class="' + settings.item_class + '">...</a>').click(function () {
                    settings.page -= 5;
                    settings.page = settings.page <= 1 ? 1 : settings.page;
                    eval("settings.callback(1" + settings.args + ")");
                    methods._drawLinks.call(self, settings)
                }));
                has_fisrt = true
            }
            var left_start = (pagesize - settings.page >= (settings.display_num + 1) / 2) ? settings.page - (settings.display_num - 1) / 2 : settings.page - (settings.display_num - (pagesize - settings.page));
            for (var i = left_start; i < settings.page; i++) {
                if (i <= 1) {
                    continue
                }
                (function (obj, index, settings) {
                    obj.append($('<a href="javascript:void(0);" class="' + settings.item_class + '">' + index + "</a>").click(function () {
                        eval("settings.callback(" + index + settings.args + ")");
                        settings.page = index;
                        methods._drawLinks.call(obj, settings)
                    }))
                })(this, i, settings);
                prev_flag++
            }
            this.append($('<span class="' + settings.current_item_class + '">' + settings.page + "</span>"));
            next_flag = (settings.display_num - 1) - prev_flag + (!has_fisrt ? 1 : 0);
            if (settings.page < pagesize) {
                for (var j = settings.page + 1; j < pagesize && j <= settings.page + next_flag; j++) {
                    (function (obj, index, settings) {
                        obj.append($('<a href="javascript:void(0);" class="' + settings.item_class + '">' + index + "</a>").click(function () {
                            eval("settings.callback(" + index + settings.args + ")");
                            settings.page = index;
                            methods._drawLinks.call(obj, settings)
                        }))
                    })(this, j, settings)
                }
            }
            if (settings.page != pagesize && (pagesize > (settings.display_num + 2) && settings.page + (settings.display_num + 1) / 2 < pagesize)) {
                this.append($('<a href="javascript:void(0);" class="' + settings.item_class + '">...</a>').click(function () {
                    settings.page += 5;
                    settings.page = settings.page >= pagesize ? pagesize : settings.page;
                    eval("settings.callback(" + settings.page + settings.args + ")");
                    methods._drawLinks.call(self, settings)
                }))
            } else {
                if (settings.page != pagesize) {
                    this.append($('<a href="javascript:void(0);" class="' + settings.item_class + '">' + pagesize + "</a>").click(function () {
                        eval("settings.callback(" + pagesize + settings.args + ")");
                        settings.page = pagesize;
                        methods._drawLinks.call(self, settings)
                    }))
                }
            }
            if (settings.page < pagesize && settings.next_show_always) {
                this.append($('<a href="javascript:void(0);" class="' + settings.item_class + " " + settings.next_item_class + '">' + settings.next_text + "</a>").click(function () {
                    eval("settings.callback(" + (settings.page + 1) + settings.args + ")");
                    settings.page = settings.page + 1;
                    methods._drawLinks.call(self, settings)
                }))
            }
        }, destroy: function () {
            return this.each(function () {
                var $this = $(this);
                $this.html("")
            })
        }
    };
    $.fn.paginationForSalesOnly = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
        } else {
            if (typeof method === "object" || !method) {
                return methods.init.apply(this, arguments)
            } else {
                $.error("Method " + method + " does not exist in pagination")
            }
        }
    }
})(jQuery);

(function (d, c) {
    var b = {
        //hotVisaMdd: "to",
        //visaMdd: "to",
        packMdd: "to",
        //relatedMdd: "to",
        dept: "from",
        deptTime: "go_time"
        //salesType: "type",
        //tripDays: "trip_days",
        //costRange: "cost_range",
        //visaDistrict: "visa_district",
        //visaType: "visa_type"
    };
    var a = function () {
        this.asyncHttpTimer = 0;
        this.httpParam = {page: 1, group: globalGroup, sort: "rank", sort_type: "desc"};
        this.lastVisaTo = "";
        this.bindFilterEvent();
        this.bindSortEvent();
        this.bindSaleTimeEvent();
        this.bindSearchInputEvent();
        this.bindStickEvent();
        this.bindEventPublish();
        this.pagination(1, globalListTotal)
    };
    a.prototype.injectDefaultParams = function (f) {
        var g;
        for (var e in f) {
            if (f.hasOwnProperty(e)) {
                g = f[e];
                this.httpParam[e] = g;
                this.touch(e, g, false)
            }
        }
    };
    a.prototype.bindFilterEvent = function () {
        var e = this;
        for (var f in b) {
            if (b.hasOwnProperty(f)) {
                (function (g) {
                    var j = b[g];
                    var h = d("[data-search-group=" + j + "]");
                    var i = d("[data-view-group=" + g + "]");
                    i.find("[data-v]").on("click", function (r, m) {
                        r.preventDefault();
                        var u = d(this),
                            k = u.data("v"),
                            p = u.text(),
                            l = u.data("default") || !k,
                            n = typeof m == "undefined" ? true : m.withHttp;
                        h.find("[data-v]").not('[data-v="' + k + '"]').removeClass("on");
                        u.addClass("on");
                        if (!d("[data-kw-input]").val() && e.httpParam.kw) {
                            e.httpParam.kw = "";
                            e.reset("kw", true, false, false)
                        }
                        if (g == "packMdd") {
                            d(".s-inp").val("");
                            e.httpParam.kw = "";
                            d('[data-stick-text="kw"]').closest("a").hide()
                        }
                        !l && e.ensureStick(j, p);
                        l && e.reset(j, true, false, false);
                        n && e.http(j, k, true, function (v) {
                            e.httpVisa()
                        });
                        if (g == "visaMdd" || g == "hotVisaMdd") {
                            var q = g == "visaMdd" ? "hotVisaMdd" : "visaMdd",
                                t = d('[data-view-group="' + q + '"]'), s = t.find('[data-v="' + k + '"]').length > 0;
                            t.find("[data-v]").removeClass("on").end().find('[data-v="' + k + '"]').addClass("on");
                            if (!s && q == "hotVisaMdd" && k) {
                                t.find("[data-extend=1]").addClass("on").text(p).data("v", k).show()
                            }
                        }
                    })
                })(f)
            }
        }
    };
    a.prototype.bindSortEvent = function () {
        var e = this;
        d("[data-sort]").on("click", function () {
            var f = d(this), g = f.data("sort"), h = f.data("sortType");
            d("[data-sort-active]").removeClass("active").filter('[data-sort-active="' + g + '"]').addClass("active");
            e.http("sort", g, true, function () {
            });
            e.http("sort_type", h, true, function () {
            });
            d('[data-sort-active="price"]').html((f.closest(".sort-price").length ? f.text() : "价格") + "<i></i>")
        });
        d(".sort-price").hover(function () {
            d(this).find(".drop-list").show()
        }, function () {
            d(this).find(".drop-list").hide()
        })
    };
    a.prototype.bindSearchInputEvent = function () {
        var e = this;
        d(".s-btn").on("click", function () {
            var g = d(".s-inp"), f = g.val();
            if (f === "") {
                e.reset("kw", false, false, false);
                return
            }
            d('[data-view-group="packMdd"]').find("[data-v]").removeClass("on");
            f && e.ensureStick("kw", f);
            e.http("kw", f, true);
            mfwPageEvent("sales", "sales_index_q", {q: f, platform: "www"})
        })
    };
    a.prototype.bindSaleTimeEvent = function () {
        var e = this;
        d('[data-id="btn_sale_time"]').on("click", function () {
            var f = d(this), g = f.hasClass("on");
            e.http("sales_time", g ? "0" : "24", true);
            f.toggleClass("on")
        })
    };
    a.prototype.bindStickEvent = function () {
        var e = this;
        d("[data-stick]").find('[data-btn="close"]').on("click", function () {
            e.reset(d(this).siblings("[data-stick-text]").data("stickText"), true, true, true)
        }).closest("a.item").siblings('[data-btn="close_all"]').on("click", function () {
            d(this).siblings("a.item").find('[data-btn="close"]').each(function () {
                d(this).trigger("click")
            });
            d('[data-id="btn_sale_time"]').removeClass("on");
            d("[data-visatab]:gt(0)").removeClass("on");
            e.http("sales_time", "0", true, function () {
                e.httpVisa()
            })
        });
        d("[data-notfound=1]>a").on("click", function () {
            d('[data-btn="close_all"]').trigger("click")
        })
    };
    a.prototype.touch = function (i, h, f) {
        var e = d("[data-search-group=" + i + "]").find('[data-v="' + h + '"]').eq(0).trigger("click", {withHttp: f});
        var j = e.closest("[data-view-group]"), g = j.data("viewGroup");
        if (g == "hotVisaMdd" || g == "visaMdd") {
            j.siblings('[data-search-group="to"]').find('[data-v="' + h + '"]').each(function () {
                d(this).trigger("click", {withHttp: false})
            })
        }
    };
    a.prototype.httpVisa = function () {
        var g = this, e = "/sales/ajax_new.php?act=GetVisaListBySearch", f = d("#visa_recommend");
        if (f.length == 0) {
            return
        }
        if (g.httpParam.to == "" || g.lastVisaTo == g.httpParam.to) {
            return
        }
        g.lastVisaTo = g.httpParam.to;
        d.getJSON(e, {to: g.lastVisaTo}).done(function (h) {
            if (h.ret == 1 && h.msg > 0) {
                f.fadeOut(300, function () {
                    d(this).find("ul").html(h.html)
                }).fadeIn()
            } else {
                f.fadeOut()
            }
        })
    };
    a.prototype.http = function (i, h, f, j) {
        var g = this, e = "/sales/ajax_new.php?act=GetSalesListBySearch";
        this.httpParam[i] = h;
        this.httpParam.page = i === "page" ? h : 1;
        if (f) {
            c.clearTimeout(this.asyncHttpTimer);
            this.asyncHttpTimer = c.setTimeout(function () {
                d.getJSON(e, g.httpParam).done(function (k) {
                    g.renderList(k);
                    if (Object.prototype.toString.call(j).toLowerCase() === "[object function]") {
                        j()
                    }
                })
            }, 0)
        } else {
            d.getJSON(e, g.httpParam).done(function (k) {
                hat.renderList(k);
                if (Object.prototype.toString.call(j).toLowerCase() === "[object function]") {
                    j()
                }
            })
        }
    };
    a.prototype.pagination = function (h, f) {
        var e = this, g = d("#list_pagination");
        g.paginationForSalesOnly("destroy");
        g.paginationForSalesOnly({
            page: h || 1,
            total: f,
            item_size: 20,
            item_class: "pi",
            current_item_class: "pg-current",
            next_item_class: "pg-next",
            callback: function (i) {
                e.http("page", i, true, function () {
                    d("html, body").scrollTop(d("[data-list=1]").offset().top - 60)
                })
            }
        })
    };
    a.prototype.renderList = function (e) {
        if (e.ret == 1) {
            var g = parseInt(e.msg.page), f = parseInt(e.msg.total);
            d("[data-list=1]").fadeOut(300, function () {
                d(this).html(e.html)
            }).fadeIn();
            this.pagination(g, f);
            d("[data-notfound]")[f === 0 ? "show" : "hide"]()
        }
    };
    a.prototype.ensureStick = function (h, f) {
        var g = d("[data-stick-text=" + h + "]"), e = g.data("suffix");
        g.text(f + e).closest("a").show().closest("[data-stick]").show();
        if (globalShowMddHead) {
            g.closest(".crumb").show()
        }
    };
    a.prototype.reset = function (k, i, g, f) {
        var h = this, e = d("[data-search-group=" + k + "]"), l = d("[data-stick]");
        if (i) {
            d("[data-stick-text=" + k + "]").closest("a").hide();
            if (k == "kw") {
                d(".s-inp").val("")
            }
            if (l.find("a.item:visible").length == 0) {
                l.hide();
                if (globalShowMddHead) {
                    l.closest(".crumb").hide()
                }
            }
        }
        g && e.find("[data-v].on").removeClass("on").end().find("[data-default]").addClass("on");
        if (f) {
            var j = e.find("[data-default]").data("v");
            h.http(k, j, true, function () {
                h.httpVisa()
            })
        }
    };
    a.prototype.bindEventPublish = function () {
        d("[data-v]").on("click", function () {
            var f = d(this), h = f.closest("[data-search-group]").data("searchGroup"), g = f.text(), e = f.data("v");
            if (h == "to") {
                mfwPageEvent("sales", "sales_index_mddto", {mdd_id: e, mdd_q: g, plateform: "www"})
            } else {
                if (h == "type") {
                    mfwPageEvent("sales", "sales_index_type", {sales_type: g, platform: "www"})
                } else {
                    if (h == "go_time") {
                        mfwPageEvent("sales", "sales_index_gotime", {gotime: e, platform: "www"})
                    } else {
                        if (h == "from") {
                            mfwPageEvent("sales", "sales_index_mddfrom", {mdd_id: e, mdd_name: g, platform: "www"})
                        }
                    }
                }
            }
        })
    };
    c.FilterRunner = a
})(jQuery, window);