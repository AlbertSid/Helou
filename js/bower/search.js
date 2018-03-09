/*
 * star_item 装修
 * price_item 楼层
 * facility_item 级别
 * 
 */
//ajax请求数据
M.define("/js/hotel/module/ListTips", function (c, b, d) {
    var a = {
        addListVisitor: function (e) {
            $.get("/hotel/ajax.php?sAction=addListVisitor&iPoiId=" + e)
        },
        getListVisitorCount: function (e) {
            return $.ajax({
                type: "GET",
                url: "/hotel/ajax.php?sAction=getListVisitorCount&iPoiId=" + e,
                dataType: "json"
            })
        },
        getMddOrderCount: function (e) {
            return $.ajax({
                type: "GET",
                url: "/hotel/ajax.php?sAction=getMddOrderCount&iPoiId=" + e,
                dataType: "json"
            })
        }
    };
    d.exports = a
});
//显示结果条件
Handlebars.registerHelper("list", function (b, d) {
    var c = "";
    for (var e = 0, a = b.length; e < a; e++) {
        c += d.fn(b[e])
    }
    return c
});
Handlebars.registerHelper("transfertag", function (b, a) {
    if (b == "airbnb") {
        return '<i class="airbnb-logo"></i>'
    }
    if (b == "1111") {
        return '<i class="icon-act1111"></i>'
    }
    return b
});
//backbone 过滤条件模块和视图
var FilterModel = Backbone.Model.extend({
    initialize: function () {
        this.initAttrs = this.toJSON();
        this.availableRate = null;
        this.isAirbnb = false;
        this.vid = _.uniqueId("model_vid");
        this.on("change", this.fetch);
        this.on("change:checkin_date change:sub_scope", this.fetchCount);
        this.fetchCount(true)
    },
    fetch: function (b, d) {
        var c = this;
        this.changeAirbnb();
        var a = this.vid = _.uniqueId("model_vid");
        if (!d || d.resetPage !== false) {
            c.set("page", 1, {
                silent: true
            })
        }
        this.sync("read", this, {
            data: this.toJSON(),
            url: c.url,
            success: function (e) {
                c.trigger("sync", a, e)
            }
        })
    },
    fetchCount: function (d) {
        var a = [];
        _.each(this.get("tab_tags"), function (e) {
            !!e.id && a.push(e.id)
        });
        if (a.length > 0) {
            var b = {
                    iMddId: this.get("city")["id"],
                    sCheckIn: this.get("checkin_date"),
                    sCheckOut: this.get("checkout_date"),
                    sTags: a.join("S")
                },
                c = this.get("sub_scope");
            if (c.type === "district") {
                b.iAreaId = c.id
            }
            $.getJSON("#xxxx/hotel/ajax.php?sAction=getHotelTypeNum", b).done(_.bind(function (f) {
                if (!!f.ret) {
                    var e = $("#hotel_types");
                    _.each(f.msg, function (h, g, k) {
                        var i = e.find('[data-value="' + h.tag_id + '"]'),
                            j = i.find(".num");
                        if (j.length === 0) {
                            j = $('<span class="num">').appendTo(i)
                        }
                        j.html("(" + h.hotel_num + ")")
                    })
                }
            }, this))
        }
    },
    changeAirbnb: function () {
        var b = false;
        _.each(this.get("tab_tags"), function (d) {
            if (d.id === 19646 && Boolean(d.selected)) {
                b = true
            }
        });
        if (this.isAirbnb !== b) {
            this.isAirbnb = b;
            if (this.isAirbnb) {
                this.set("sort", "combine_desc", {
                    silent: true
                })
            } else {
                this.set("sort", "comment_desc", {
                    silent: true
                })
            }
            this.set("only_discount", false, {
                silent: true
            }).set("only_available", false, {
                silent: true
            });
            var c = this.get("price_item");
            c.min = 0;
            c.max = Infinity;
            var a = this;
            _.each(["brand_item", "facility_item", "star_item", "number_item", "type_item"], function (d) {
                _.each(a.get(d).options, function (e) {
                    e.selected = false
                })
            });
            this.trigger("switchmode")
        }
    },
    hasChanged: function () {
        return !_.isEqual(this.toJSON(), this.initAttrs)
    },
    toJSON: function () {
        var f = {
            price_desc: {
                sSortType: "price",
                sSortFlag: "DESC"
            },
            price_asc: {
                sSortType: "price",
                sSortFlag: "ASC"
            },
            comment_desc: {
                sSortType: "comment",
                sSortFlag: "DESC"
            },
            order_desc: {
                sSortType: "hot",
                sSortFlag: "DESC"
            },
            combine_desc: {
                sSortType: "rank",
                sSortFlag: "DESC"
            },
            user_recommend_desc: {
                sSortType: "fengfeng",
                sSortFlag: "DESC"
            }
        };
        var c = this.get("only_discount") ? {
            sSortType: "deals",
            sSortFlag: "DESC"
        } : f[this.get("sort")];
        var a = {},
            h = this.get("sub_scope"),
            e = h.type,
            g = h.id;
        if (e == "district") {
            a = {
                iAreaId: g,
                iSearchArea: 1
            }
        } else {
            if (e == "landmark") {
                a = {
                    iPoiId: g
                }
            }
        }
        var b = [];
        _.each(["facility_item", "star_item", "number_item", "type_item", "brand_item"], function (i) {
            _.each(this.get(i)["options"], function (j) {
                if (j.selected) {
                    b.push(j.value)
                }
            })
        }, this);
        _.each(this.get("tags"), function (i) {
            if (i.selected) {
                b.push(i.id)
            }
        });
        _.each(this.get("tab_tags"), function (i) {
            if (i.selected && i.id) {
                b.push(i.id)
            }
        });
        var d = {
            iMddId: this.get("city")["id"],
            sKeyWord: this.get("keyword"),
            sCheckIn: this.get("checkin_date"),
            sCheckOut: this.get("checkout_date"),
            iPage: this.get("page"),
            sTags: b.join("S"),
            iPriceMin: this.get("price_item")["min"],
            iPriceMax: (this.get("price_item")["max"] === Infinity) ? "" : this.get("price_item")["max"],
            only_available: this.get("only_available") ? 1 : 0,
            only_fav: this.get("only_fav") ? 1 : 0
        };
        return _.extend(d, a, c)
    },
    toggleItem: function (c, d) {
        var b = this.get(c) || [],
            a;
        _.each(b.options, function (e) {
            if (e.value == d) {
                e.selected = a = !e.selected
            }
        });
        if ("brand_item" == c && !a) {
            if ("all" == d) {
                b.isSelectAll = !b.isSelectAll;
                _.each(b.options, function (e) {
                    e.selected = b.isSelectAll
                })
            } else {
                if (!a) {
                    b.isSelectAll = false
                }
            }
        }
        this.trigger("change:" + c, c);
        this.trigger("change")
    },
    setPriceRange: function (b, c) {
        var a = this.get("price_item") || {};
        a.min = b;
        a.max = c;
        !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
            //type: "价格",
            type: "楼层",
            mddid: window.mddid
        });
        this.trigger("change:price_item");
        this.trigger("change")
    },
    getPriceRangeText: function () {
        var b = this.get("price_item"),
            c = b.min,
            a = b.max;
        var d = "";
        if (c > 0 || a != Infinity) {
            if (c == 0) {
                d = a + "层以下"
            } else {
                if (a == Infinity) {
                    d = parseInt(c / 20) + "层以上"
                } else {
                    d = parseInt(c / 20) + "-" + parseInt(a / 20) + "层"
                }
            }
        }
        return d
    },
    reset: function (a) {
        _.each(a, _.bind(function (c) {
            switch (c.type) {
                case "price_item":
                    var b = this.get("price_item") || {};
                    b.min = 0;
                    b.max = Infinity;
                    this.trigger("change:price_item");
                    break;
                case"number_item":
                case "type_item":
                case "brand_item":
                case "facility_item":
                case "star_item":
                    var b = this.get(c.type) || [];
                    _.each(b.options, function (d) {
                        if (d.value == c.value) {
                            d.selected = !d.selected
                        }
                    });
                    if ("brand_item" == c.type && "all" == c.value) {
                        this.get("brand_item").isSelectAll = false;
                        _.each(b.options, function (d) {
                            d.selected = false
                        })
                    }
                    this.trigger("change:" + c.type, c.type);
                    break;
                case "keyword":
                    this.set("keyword", "", {
                        silent: true
                    });
                    this.trigger("change:keyword");
                    break;
                case "district":
                case "landmark":
                    this.set("sub_scope", {
                        type: "city",
                        id: this.get("city")["id"],
                        name: this.get("city")["name"]
                    }, {
                        silent: true
                    });
                    clearScenicMarker();
                    break
            }
        }, this));
        this.trigger("change");
        if (_.find(a, function (b) {
                return (b.type === "district" || b.type === "landmark")
            })) {
            this.trigger("change:sub_scope", this, this.get("sub_scope"))
        }
    }
});
var FilterView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, "change:sort", this.renderSorters);
        this.listenTo(this.model, "change:only_available", this.renderAvailable);
        this.listenTo(this.model, "change:only_discount", this.renderDiscount);
        this.listenTo(this.model, "change:only_fav", this.renderFav);
        this.listenTo(this.model, "change:tags", this.renderTags);
        this.listenTo(this.model, "change:star_item change:brand_item change:facility_item change:number_item change:type_item", this.renderCheckboxs);
        this.listenTo(this.model, "change:price_item", this.renderPrice);
        this.listenTo(this.model, "switchmode", this.renderAirbnb);
        this.template = Handlebars.compile($("#filter_template").html());
        this.listenTo(this.model, "sync", function (a, b) {
            var c = false;
            _.each(this.model.get("tab_tags"), function (d) {
                if (d.selected && d.id) {
                    c = true
                }
            });
            if ($("#selected").html() !== "" || !!this.$(".col-filter .on").length || c) {
                this.$(".total-info").html('共<span class="count">' + b.msg.count + "</span>楼盘符合条件")
            } else {
                this.$(".total-info").html('该地区共<span class="count">' + b.msg.count + "</span>个房源")
            }
        })
    },
    events: {
        click: function (k) {
            var b = $(k.srcElement ? k.srcElement : k.target).closest("[data-type]"),
                a = b.data("type"),
                f = b.data("value"),
                h = this.model;
            if (b.data("sub-type")) {
                return true
            }
            switch (a) {
                case "sort_price":
                    h.set("sort", h.get("sort") == "price_asc" ? "price_desc" : "price_asc");
                    !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                        type: "排序",
                        subType: "价格排序",
                        mddid: window.mddid
                    });
                    break;
                case "sort_order":
                    h.set("sort", "order_desc");
                    !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                        type: "排序",
                        subType: "订单排序",
                        mddid: window.mddid
                    });
                    break;
                case "sort_comment":
                    h.set("sort", "comment_desc");
                    !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                        type: "排序",
                        subType: "人气排序",
                        mddid: window.mddid
                    });
                    break;
                case "sort_combine":
                    h.set("sort", "combine_desc");
                    !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                        type: "排序",
                        subType: "综合排序",
                        mddid: window.mddid
                    });
                    break;
                case "sort_user_recommend":
                    h.set("sort", "user_recommend_desc");
                    break;
                case "only_available":
                    h.set("only_available", !h.get("only_available"));
                    !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                        type: "按楼盘查看",
                        mddid: window.mddid
                    });
                    break;
                case "only_discount":
                    h.set("only_discount", !h.get("only_discount"));
                    break;
                case "only_fav":
                    if (window.Env.UID) {
                        h.set("only_fav", !h.get("only_fav"));
                        !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                            type: "收藏",
                            mddid: window.mddid
                        })
                    } else {
                        show_login()
                    }
                    break;
                case "tag":
                    var m = h.get("tags");
                    _.each(m, function (n) {
                        if (n.id == f) {
                            n.selected = !n.selected
                        }
                    });
                    !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                        type: "tag",
                        subType: f,
                        mddid: window.mddid
                    });
                    h.trigger("change change:tags");
                    break;
                case"number_item":
                case "type_item":
                case "star_item":
                case "facility_item":
                case"brand_item":
                    h.toggleItem(a, f);
                    var d = {
                        number_item: "人数",
                        type_item: "级别",
                        star_item: "装修",
                        facility_item: "设施",
                        brand_item: "楼层"
                    };
                    !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {type: d[a], mddid: window.mddid});
                    break;
                case "price_item":
                    var i = f.split(","),
                        e, j, l = h.get("price_item");
                    if (isNaN(e = parseInt(i[0]))) {
                        e = 0
                    }
                    if (isNaN(j = parseInt(i[1]))) {
                        j = Infinity
                    }
                    if (e == l.min && j == l.max) {
                        h.setPriceRange(0, Infinity)
                    } else {
                        h.setPriceRange(e, j)
                    }
                    break;
                case "confirm_price_range":
                    var g = this.$el.find("[data-type='min_price']").val();
                    var c = this.$el.find("[data-type='max_price']").val();
                    g = parseInt(g);
                    c = parseInt(c);
                    if (isNaN(g) && isNaN(c)) {
                        return
                    }
                    if (isNaN(g)) {
                        if (!isNaN(c) && c > 0) {
                            h.setPriceRange(0, c)
                        }
                    } else {
                        if (isNaN(c)) {
                            if (!isNaN(g) && g >= 0) {
                                h.setPriceRange(g, Infinity)
                            }
                        } else {
                            if (c >= g) {
                                h.setPriceRange(g, c)
                            }
                        }
                    }
                    break
            }
            k.preventDefault()
        },
        "click [data-type='checkbox_list'] .drop-hd": function (c) {
            var a = $(c.currentTarget),
                b = a.closest('[data-type="checkbox_list"]');
            b.hasClass("drop-open") ? b.removeClass("drop-open") : b.addClass("drop-open");
            if (b.data("value") === "price_item") {
                var e = this.$(".bd-price .barchart ul"),
                    d = this.$(".bd-price .barchart .tip");
                e.find(".bar").each(function (f, g) {
                    $(g).stop().css("height", 0)
                });
                d.removeClass("active");
                if (b.hasClass("drop-open")) {
                    e.find(".bar").each(function (f, g) {
                        var h = $(g);
                        h.animate({
                            height: h.data("height")
                        }, 800, "swing", function () {
                            if (f === 0) {
                                d.addClass("active")
                            }
                        })
                    })
                }
            }
        },
        'click [data-type="checkbox_list"] .drop-hd .icon-checkbox': function (e) {
            var d = $(e.currentTarget),
                b = d.closest('[data-type="checkbox_list"]'),
                a = d.closest(".drop-hd").hasClass("on"),
                c = d.closest("[data-value]").data("value");
            if ("brand_item" == c) {
                _.each(this.model.get("brand_item").options, function (f) {
                    f.selected = !a
                });
                this.model.get("brand_item").isSelectAll = !a;
                if (b.hasClass("drop-open")) {
                    e.stopPropagation()
                }
                this.model.trigger("change:" + c, c);
                this.model.trigger("change")
            }
        },
        'mouseleave [data-type="checkbox_list"]': function (a) {
            $(a.currentTarget).removeClass("drop-open")
        }
    },
    render: function () {
        var n = this.model;
        var g = [n.get("star_item"), n.get("price_item"), n.get("brand_item"), n.get("facility_item")];
        if (this.model.isAirbnb) {
            g = [n.get("type_item"), n.get("price_item"), n.get("number_item")]
        }
        var h = this.template({
            filters: g,
            display_combine_sort: n.get("display_combine_sort"),
            display_user_recommend_sort: n.get("display_user_recommend_sort"),
            tags: n.get("tags"),
            checkinDate: n.get("checkin_date"),
            checkoutDate: n.get("checkout_date"),
            isAirbnb: this.model.isAirbnb
        });
        this.$el.html(h);
        this.$el.find('[data-value="brand_item"]').addClass("flr-brand").end().find('[data-value="facility_item"]').addClass("flr-brand");
        var j = this.$('[data-value="brand_item"] .drop-bd');

        this.$('[data-value="brand_item"] .drop-hd .icon-checkbox').addClass("clickstat").attr("data-cs-p", "品牌全选");
        if (!!j[0]) {
            j.attr("data-cs-t", "****");
            j.find("li a").each(function (i, w) {
                var m = $(w);
                m.attr("data-cs-p", m.text())
            })
        }
        var q = this.$el.find(".bd-price");
        q.css("marginLeft", "-86px");
        q.append('<p class="title">楼层范围</p>');
        var v = $('<div class="priceRange">').appendTo(q),
            d = $('<div class="barchart">').appendTo(v),
            s = $("<ul>").appendTo(d),
            c = window.baseInfo.priceDist,
            t = 0,
            l = 0,
            f = $('<div class="input-range">').appendTo(v),
            a = $('<div class="J_range_bar">').appendTo(f),
            o = $('<div class="mod-text"><div class="t1">0 Floor</div><div class="t2">100+ Floor</div></div>').appendTo(f),
            u = function (i) {
                if (i > 750) {
                    return 750 * 2 + (i - 750) * 6
                }
                return i * 2
            };
        for (var p = 0; p < c.length; p++) {
            s.append('<li><div class="bar" data-height="' + c[p].order_rate + '%"></div></li>');
            if (c[p].order_num > t) {
                t = c[p].order_num;
                l = p
            }
        }
        var e = $('<div class="gray" style="width:0;left:0;"></div>').appendTo(d),
            b = $('<div class="gray" style="width:0;right:0;"></div>').appendTo(d),
            r = $('<div class="tip"><i></i>选择最多</div>').css("left", l * 12 + 6 - 35 + "px").appendTo(d);
        a.slider({
            range: true,
            min: 0,
            max: 1000,
            step: 10,
            slide: function (m, x) {
                var i = u(x.values[0]) / 20,
                    w = u(x.values[1]) / 20;
                o.find(".t1").html(i + " Floor");
                o.find(".t2").html((w === 3000 ? "100+" : w) + " Floor");
                e.width(x.values[0] / 1000 * 601);
                b.width((1000 - x.values[1]) / 1000 * 601)
            },
            change: function (m, x) {
                var i = u(x.values[0]) / 20,
                    w = u(x.values[1]) / 20;
                o.find(".t1").html(i + " Floor");
                o.find(".t2").html((w === 3000 ? "100+" : w) + " Floor");
                e.width(x.values[0] / 1000 * 601);
                b.width((1000 - x.values[1]) / 1000 * 601)
            },
            stop: function (m, x) {
                var i = u(x.values[0]),
                    w = u(x.values[1]);
                if (w === 3000) {
                    w = Infinity
                }
                n.setPriceRange(i, w)
            }
        });
        var k = $("#list_paginator");
        if (!!k[0] && !!$(".count span:last", k)[0]) {
            this.$(".total-info").html('该地区共<span class="count">' + $(".count span:last", k).html() + "</span>个房源")
        } else {
            if (!!k[0] && !$(".count span:last", k)[0]) {
                this.$(".total-info").html('该地区共<span class="count">' + $("#hotel_list .h-item").length + "</span>个房源")
            } else {
                this.$(".total-info").html('该地区共<span class="count">0</span>个房源')
            }
        }
        this.renderSorters().renderAvailable().renderDiscount().renderFav().renderPrice().renderTags();
        if (this.model.isAirbnb) {
            this.renderCheckboxs("number_item").renderCheckboxs("type_item")
        } else {
            this.renderCheckboxs("star_item").renderCheckboxs("brand_item").renderCheckboxs("facility_item")
        }
        return this
    },
    renderSorters: function () {
        var a = this.$el.find("[data-type='sort']");
        a.find("li").removeClass("on");
        var b = a.find('[data-type="sort_price"]').removeClass("sort-down").removeClass("sort-up");
        switch (this.model.get("sort")) {
            case "price_desc":
                b.addClass("on sort-down");
                break;
            case "price_asc":
                b.addClass("on sort-up");
                break;
            case "comment_desc":
                a.find('[data-type="sort_comment"]').addClass("on");
                break;
            case "order_desc":
                a.find('[data-type="sort_order"]').addClass("on");
                break;
            case "combine_desc":
                a.find('[data-type="sort_combine"]').addClass("on");
                break;
            case "user_recommend_desc":
                a.find('[data-type="sort_user_recommend"]').addClass("on");
                break
        }
        return this
    },
    renderAvailable: function () {
        if (this.model.isAirbnb) {
            return this
        }
        var a = this.$el.find('[data-type="only_available"]');
        this.model.get("only_available") ? a.addClass("on") : a.removeClass("on");
        return this
    },
    renderDiscount: function () {
        if (this.model.isAirbnb) {
            return this
        }
        var a = this.$el.find('[data-type="only_discount"]');
        this.model.get("only_discount") ? a.addClass("on") : a.removeClass("on");
        return this
    },
    renderFav: function () {
        var a = this.$el.find('[data-type="only_fav"]');
        this.model.get("only_fav") ? a.addClass("on") : a.removeClass("on");
        return this
    },
    renderCheckboxs: function (c) {
        var b = this.$el.find('[data-type="checkbox_list"][data-value="' + c + '"]');
        var d = b.find("[data-type='drop-tip']").removeClass("on");
        b.find("li[data-value]").removeClass("on");
        var a = this.model.get(c).options;
        _.each(a, function (e) {
            if (e.selected) {
                d.addClass("on");
                b.find('li[data-value="' + e.value + '"]').addClass("on")
            }
        });
        return this
    },
    renderPrice: function () {
        var g = this.model.get("price_item") || {};
        var a = g.min,
            d = g.max;
        var e = a + "," + (d === Infinity ? "" : d);
        var b = this.$el.find("[data-type='checkbox_list'][data-value='price_item']");
        var c = this.$(".J_range_bar"),
            i = function (j) {
                if (j > 1500) {
                    return 1500 / 2 + Math.round((j - 1500) / 6)
                }
                return j / 2
            };
        c.slider("values", [i(a), (d === Infinity ? 1000 : i(d))]);
        var f = b.find("[data-type='drop-tip']").removeClass("on");
        var h = this.model.getPriceRangeText();
        h && f.addClass("on");
        return this
    },
    renderTags: function () {
        var b = this.model.get("tags"),
            c;
        var a = this;
        _.each(b, function (d) {
            c = a.$el.find('[data-type="tag"][data-value="' + d.id + '"]');
            d.selected ? c.addClass("on") : c.removeClass("on")
        });
        return this
    }
});
//楼盘分类筛选视图
var HotelTypeView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, "change:tab_tags", this.renderTags)
    },
    events: {
        'click [data-type="type"]': function (b) {
            var a = $(b.currentTarget),
                c = a.data("value");
            if (a.hasClass("on")) {
                return
            }
            _.each(this.model.get("tab_tags"), function (d) {
                d.selected = (d.id == c)
            });
            !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                type: "tag",
                subType: c,
                mddid: window.mddid
            });
            this.model.trigger("change change:tab_tags")
        }
    },
    render: function () {
        var b = this.model.get("tab_tags");
        if (b.length == 0) {
            this.$el.hide();
            return this
        }
        var a = $('<ul class="ul-tab" data-cs-t="楼盘分类筛选"></ul>');
        _.each(b, function (c) {
            a.append('<li><a data-type="type" data-value="' + c.id + '" data-cs-p="' + c.name + '">' + c.name + "</a></li>")
        });
        this.$el.append(a).show();
        this.renderTags();
        return this
    },
    renderTags: function () {
        var a;
        _.each(this.model.get("tab_tags"), function (b) {
            a = this.$el.find('[data-type="type"][data-value="' + b.id + '"]');
            b.selected ? a.addClass("on") : a.removeClass("on")
        }, this);
        return this
    }
});
//楼盘关键字视图
var KeywordView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, "change:keyword", this.render)
    },
    events: {
        'click [data-type="keyword_confirm"]': function () {
            this.model.set("keyword", this.$el.find('[data-type="keyword"]').val());
            !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                type: "搜索",
                mddid: window.mddid
            })
        },
        'keydown [data-type="keyword"]': function (a) {
            if (a.keyCode == 13) {
                this.model.set("keyword", this.$el.find('[data-type="keyword"]').val());
                !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
                    type: "搜索",
                    mddid: window.mddid
                })
            }
        }
    },
    render: function () {
        var a = this.model.get("keyword");
        this.$el.find('[data-type="keyword"]').val(a);
        return this
    }
});
//结果锁定和清除视图
var SelectedView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, "change:price_item change:brand_item change:facility_item change:star_item change:number_item change:type_item change:sub_scope change:keyword switchmode reset", function () {
            this.render()
        })
    },
    events: {
        "click em": function (c) {
            var a = $(c.currentTarget),
                e = a.closest("a"),
                b = e.data("type"),
                d = e.data("value");
            switch (b) {
                case "price_item":
                    this.model.setPriceRange(0, Infinity);
                    break;
                case"number_item":
                case "type_item":
                case "brand_item":
                case "facility_item":
                case "star_item":
                    this.model.toggleItem(b, d);
                    break;
                case "keyword":
                    this.model.set("keyword", "");
                    break;
                case "district":
                case "landmark":
                    this.model.set("sub_scope", {
                        type: "city",
                        id: this.model.get("city")["id"],
                        name: this.model.get("city")["name"]
                    });
                    clearScenicMarker();
                    break
            }
        },
        "click .btn-clear": function (b) {
            var a = [];
            this.$(".item").each(function (c, d) {
                var e = $(d);
                a.push({
                    type: e.data("type"),
                    value: e.data("value")
                })
            });
            this.model.reset(a)
        }
    },
    render: function () {
        var f = function (h, i, j) {
                return $('<a class="item a-tag"></a>').attr("data-type", h).attr("data-value", i).attr("data-sub-type", "selected").html("<span>" + j + "</span><em>×</em>")[0].outerHTML
            },
            b = function () {
                return $('<a class="btn-clear">清除</a>')[0].outerHTML
            };
        var e = "",
            g = this.model.get("sub_scope"),
            a = this.model.getPriceRangeText(),
            d = this.model.get("keyword"),
            c = ["facility_item", "star_item", "type_item", "number_item", "brand_item"];
        if (d) {
            e += f("keyword", "", d)
        }
        if (g.type == "district" || g.type == "landmark") {
            e += f(g.type, g.id, g.name)
        }
        if (this.model.get("price_item").min != 0 || this.model.get("price_item").max != Infinity) {
            e += f("price_item", a, a)
        }
        _.each(c, function (h) {
            _.each(this.model.get(h).options, function (i) {
                if (i.selected) {
                    e += f(h, i.value, i.text)
                }
            })
        }, this);
        if (e.length > 0) {
            e += b();
            this.$el.html(e)
        } else {
            this.$el.html("")
        }
    }
});
//结果列表视图
var ListView = Backbone.View.extend({
    initialize: function () {
        this.otaPriceLoader = new OtaPriceLoader(this);
        this.listenTo(this.model, "sync", function (a, b) {
            this.$el.html(b.html);
            this.updatePrice();
            showMapHotelList();
            this.$el.trigger("render")
        });
        this.listenTo(this.model, "change:page", function () {
            $("body").scrollTo($("#filters"), 500)
        })
    },
    events: {
        "click #list_paginator a[data-value]": function (b) {
            var a = $(b.currentTarget);
            this.model.set("page", a.data("value"), {
                resetPage: false
            });
            b.preventDefault()
        }
    },
    updatePrice: function () {
        var f = window.Env.UID || 0;
        if (_.contains([85650490, 12258], f)) {
            this.otaPriceLoader.loadPrice()
        }
        return this
    }
});
//加载条模块
var ProgressbarView = Backbone.View.extend({
    initialize: function () {
        this.listenTo(this.model, "request", function () {
            this.isFinish = false;
            this.validId = this.validId === undefined ? 0 : ++this.validId;
            var a = 0,
                c = this.validId;
            this.$el.progressbar({
                value: false
            });
            for (var b = 0; b < 20; b++) {
                setTimeout(_.bind(function () {
                    if (!this.isFinish && c === this.validId) {
                        a += 3 + Math.floor(Math.random() * 2);
                        this.$el.progressbar({
                            value: a
                        })
                    }
                }, this), b * 200)
            }
        });
        this.listenTo(this.model, "sync", function () {
            this.isFinish = true;
            this.$el.progressbar({
                value: 100
            });
            setTimeout(_.bind(function () {
                this.$el.progressbar("destroy")
            }, this), 200)
        })
    }
});
//日历模块
function OtaPriceLoader(a) {
    this.view = a;
    this.otaHotelsMap = {};
    this.hotelObjMap = {};
    this.validId = 0;
    this.availableQueue = async.queue(_.bind(function (b, g) {
        var e = this.hotelObjMap[b.hotelId],
            f = this;
        e[b.ota].attr("data-future-status-" + b.validId, "timeout-" + f.validId);
        if (b.validId !== this.validId) {
            g()
        }
        var d = this.hotelObjMap[b.hotelId],
            c = new Date(Date.parse(b.checkin) + 86400000).format("yyyy-MM-dd");
        //向后台交互数据
        $.getJSON("###XXXX.json", {
            sAction: "getAvailablePrice",
            iMddId: b.mddId,
            sCheckIn: c,
            iPoiId: b.hotelId,
            sOta: b.ota
        }).done(function (l) {
            var k = parseInt(l && l.msg && l.msg["list"] && l.msg["list"][b.ota]),
                i = l && l.msg && l.msg["check_in"];
            if (!!i) {
                var h = new Date(Date.parse(i)),
                    j = new Date(Date.parse(i) + 86400000);
                d[b.ota].find(".other").html("￥" + k + "/晚 - " + h.format("M月d日") + "可预订").end().data("isOtherDate", true).data("checkIn", h.format("yyyy-MM-dd")).data("checkOut", j.format("yyyy-MM-dd"))
            }
        }).always(function () {
            var j = d.$el.data("unavailableCount") - 1;
            if (j === 0) {
                var i = d[b.ota].parent(),
                    h = false;
                i.find(".btn-booking").each(function (k, l) {
                    if (!$(l).is(":hidden")) {
                        h = true
                    }
                });
                if (!h) {
                    i.html('<div class="btn-loading"><p class="h-1"><span><i class="i-sorry"></i><a href="/hotel/' + b.hotelId + '.html" target="_blank">已订满，看看哪天还有空房</a></span></p></div>')
                }
            } else {
                d.$el.data("unavailableCount", j)
            }
            d[b.ota].attr("data-future-status-" + b.validId, "finish-" + f.validId);
            g()
        })
    }, this), 4)
}
OtaPriceLoader.prototype.reset = function () {
    this.validId++;
    this.otaHotelsMap = {};
    this.hotelObjMap = {};
    this.availableQueue.kill()
};
OtaPriceLoader.prototype.setDataMap = function () {
    var a = this,
        d = a.view.model.get("city").id,
        b = a.view.model.get("checkin_date"),
        c = a.validId;
    a.view.$el.find(".h-item").each(function () {
        var e = $(this),
            g = {},
            f = e.data("id"),
            h = [];
        $(".btn-booking", e).each(function (i, k) {
            var j = $(k),
                l = j.data("otaname");
            if (!_.contains(["onyx", "zizaike", "airbnb"], l)) {
                if (!a.otaHotelsMap[l]) {
                    a.otaHotelsMap[l] = []
                }
                a.otaHotelsMap[l].push(f);
                h.push(l);
                g[l] = j
            }
        });
        if (h.length === 0) {
            return true
        }
        g.otaPrice = new HotelOtaPrice(f, h);
        g.$el = e;
        a.hotelObjMap[f] = g;
        g.otaPrice.always(function (k, j, i) {
            if (c !== a.validId) {
                return
            }
            var l = a.hotelObjMap[k],
                m = 0;
            _.each(j, function (p, q) {
                if (p > 0) {
                    $("._j_price", l[q]).html(p)
                } else {
                    m++;
                    var o = $("._j_price", l[q]).html();
                    l[q].find(".t i").remove().end().find(".t").append('<span class="no-room">该日无房</span>').end().find(".p").remove().end().find(".btn-bkg").remove().end().append('<span class="other">￥' + o + "/晚</span>").addClass("btn-otherDate");
                    var n = l[q].parent();
                    l[q].detach().appendTo(n);
                    a.availableQueue.push({
                        validId: c,
                        mddId: d,
                        hotelId: k,
                        ota: q,
                        checkin: b
                    })
                }
            });
            if (m > 0) {
                l.$el.data("unavailableCount", m)
            }
        })
    })
};
//时间的数据,返回与请求
OtaPriceLoader.prototype.loadPrice = function () {
    this.reset();
    this.setDataMap();
    var a = this,
        e = a.view.model.get("city").id,
        c = a.view.model.get("checkin_date"),
        b = a.view.model.get("checkout_date"),
        d = a.validId;
    _.each(a.otaHotelsMap, function (f, g) {
        /*json数据请求================请注意后台======*/
        $.getJSON("#xxx.json", {
            sAction: "getPriceByIds",
            iMddId: e,
            sCheckIn: c,
            sCheckOut: b,
            sPoiIds: f.join("S"),
            sOta: g
        }).done(function (h) {
            if (h.ret !== 1 || d !== a.validId) {
                return
            }
            _.each(h.msg, function (j, i) {
                if (g === "agoda" && j.pro_saving && j.pro_saving["agoda"]) {
                    var k = (100 - j.pro_saving["agoda"]) / 10;
                    a.hotelObjMap[i].agoda.find('[data-type="discount"]').html(k + "<br>折").show()
                }
                _.each(j.list_promote, function (m, n) {
                    if (n === g) {
                        m = m.replace(/\s+/g, "");
                        var l = m.length > 12 ? m.substring(0, 12) + "..." : m;
                        a.hotelObjMap[i][n].addClass("btn-discount").append('<span class="dis-txt" data-content="' + m + '">' + l + "</span>")
                    }
                });
                _.each(j.list, function (l, m) {
                    if (m === g) {
                        a.hotelObjMap[i].otaPrice.setPrice(m, Number(l))
                    }
                })
            })
        })
    })
};
//默认配置
var HashQuerier;
(function () {
    HashQuerier = function (b) {
        this.model = b;
        this.updateModel(this.model);
        this.updateHash(this.model.attributes);
        var c = this;
        this.model.on("change", function (d, e) {
            c.updateHash(this.attributes)
        })
    };
    var a = /&?([^=]+)=([^&]*)&?/g;
    HashQuerier.prototype = {
        map: {
            indate: "checkin_date",
            outdate: "checkout_date",
            q: "keyword",
            p: "page",
            sort: "sort"
        },
        updateHash: function (b) {
            var d = this._attr2param(b);
            var c = this._param2hash(d);
            window.location.hash = c
        },
        _attr2param: function (c) {
            var f = {},
                d = _.invert(this.map),
                e, b = [];
            _.each(c, function (j, h) {
                if (e = d[h]) {
                    f[e] = j;
                    return true
                }
                switch (h) {
                    case "sub_scope":
                        var k = !isNaN(parseInt(j.id)) ? j.id : 0;
                        var h = j.name || "";
                        j = j.type + "," + k + "," + h;
                        f.scope = j;
                        break;
                    case "price_item":
                        var i = !isNaN(parseInt(j.min)) ? j.min : "";
                        var g = !isNaN(parseInt(j.max)) ? j.max : "";
                        f.price = i + "," + g;
                        break;
                    case "only_discount":
                        f.sales = j ? 1 : 0;
                        break;
                    case "tags":
                    case "tab_tags":
                        _.each(j, function (l) {
                            if (l.selected) {
                                b.push(l.id)
                            }
                        });
                        break;
                    case"number_item":
                    case "type_item":
                    case "star_item":
                    case "facility_item":
                        _.each(j.options, function (l) {
                            if (l.selected) {
                                b.push(l.value)
                            }
                        });
                        break;
                    case "brand_item":
                        if (j.isSelectAll) {
                            b.push("brandAll")
                        } else {
                            _.each(j.options, function (l) {
                                if (l.selected) {
                                    b.push(l.value)
                                }
                            })
                        }
                        break;
                }
            }, this);
            if (b.length) {
                f.tag = b.join(",")
            }
            return f
        },
        _param2hash: function (c) {
            var b = [];
            _.each(c, function (e, d) {
                b.push(d + "=" + encodeURIComponent(e))
            });
            return b.join("&")
        },
        updateModel: function (b) {
            var d = this._getParamPairs();
            _.each(d, function (k, h) {
                if (this.map[h]) {
                    b.set(this.map[h], k, {
                        silent: true
                    });
                    return true
                }
                switch (h) {
                    case "scope":
                        var j = k.split(",");
                        b.set("sub_scope", {
                            type: j[0],
                            id: j[1],
                            name: j[2]
                        }, {
                            silent: true
                        });
                        break;
                    case "sales":
                        b.set("only_discount", !!parseInt(k), {
                            silent: true
                        });
                        break;
                    case "price":
                        var f = k.split(",");
                        var i, e;
                        i = parseInt(f[0]);
                        e = parseInt(f[1]);
                        b.get("price_item")["min"] = isNaN(i) ? 0 : i;
                        b.get("price_item")["max"] = isNaN(e) ? Infinity : e;
                    case "tag":
                        var g = k.split(",");
                        _.each(g, function (l) {
                            if ("brandAll" == l) {
                                _.each(b.get("brand_item").options, function (m) {
                                    m.selected = true
                                });
                                b.get("brand_item").isSelectAll = true
                            }
                            _.each(["star_item", "brand_item", "facility_item", "number_item", "type_item"], function (n) {
                                var m = b.get(n)["options"];
                                _.each(m, function (p) {
                                    if (p.value == l) {
                                        p.selected = true;
                                        return null
                                    }
                                })
                            });
                            _.each(["tags", "tab_tags"], function (m) {
                                _.each(b.get(m), function (n) {
                                    if (n.id == l) {
                                        n.selected = true;
                                        if (m == "tab_tags" && n.id == 19646) {
                                            b.isAirbnb = true
                                        }
                                        return null
                                    }
                                })
                            })
                        });
                        break
                }
            }, this);
            var c = false;
            _.each(b.get("tab_tags"), function (e) {
                if (e.selected && e.id != 0) {
                    c = true;
                    return null
                }
            });
            _.each(b.get("tab_tags"), function (e) {
                if (e.id == 0) {
                    e.selected = !c;
                    return null
                }
            })
        },
        _getParamPairs: function () {
            var c = this._getHash();
            var b, d = {};
            while ((b = a.exec(c)) !== null) {
                d[b[1]] = decodeURIComponent(b[2])
            }
            return d
        },
        _getHash: function () {
            var b = window.location.href.match(/#(.*)$/);
            return b ? b[1] : ""
        }
    }
})();
//具体条件设置模块。这是这个页面主要的部分
$(function () {
    var a = {
        type: "city",
        id: null,
        name: null
    };
    var k = parseInt(window.init_brand_id);
    var K = [];
    _.each(window.brand_info || [], function (W) {
        var V = (k && k == W.id);
        K.push({
            text: W.tag,
            value: W.id,
            selected: V
        })
    });
    var c = window.baseInfo.starDist;
    _.each(c, function (X, V, W) {
        X.order_percent = Math.round(X.order_percent)
    });
    var h = {
        city: {
            id: window.mddid,
            name: window.mddname
        },
        checkin_date: window.baseInfo.check_in,
        checkout_date: window.baseInfo.check_out,
        keyword: "",
        page: 1,
        sub_scope: a,
        sort: "comment_desc",
        only_available: false,
        only_discount: false,
        only_fav: false,
        tags: [],

        star_item: {
            type: "star_item",
            name: "装修",
            options: [{
                text: "豪华装修",
                value: "9927S15279",
                selected: window.star == 5,
                dist: c["9927"] || null
            }, {
                text: "高档装修",
                value: "9926S15280",
                selected: window.star == 4,
                dist: c["9926"] || null
            }, {
                text: "舒适装修",
                value: "9925S15281",
                selected: window.star == 3,
                dist: c["9925"] || null
            }, {
                text: "清水房",
                value: "9924S15282",
                selected: window.star == 2,
                dist: c["9924"] || null
            }],
            "class": "drop-bd-star"
        },
        price_item: {
            type: "price_item",
            name: "楼层",
            options: [
                {
                    text: "10层以下",
                    value: "0,10"
                },
                {
                    text: "10-20",
                    value: "10,20"
                },
                {
                    text: "20-30",
                    value: "20,30"
                },
                {
                    text: "30-40",
                    value: "30,40"
                },
                {
                    text: "40-50",
                    value: "40,50"
                },
                {
                    text: "50-60",
                    value: "50,60"
                },
                {
                    text: "60-70",
                    value: "60,70"
                },
                {
                    text: "70-80",
                    value: "70,80"
                },
                {
                    text: "80-90",
                    value: "80,90"
                },
                {
                    text: "90-100",
                    value: "90,100"
                },
                {
                    text: "100层以上",
                    value: "100,"
                }
            ],
            display_spec_price: true,
            min: 0,
            max: Infinity,
            "class": "bd-price",
            isCustom: true
        },
        brand_item: {
            type: "brand_item",
            name: "品牌",
            options: K,
            "class": "bd-brand",
            isSelectAll: false
        },
        facility_item: {
            type: "facility_item",
            name: "级别",
            options: [{
                text: "超甲级",
                value: "SSS"
            }, {
                text: "甲级",
                value: "AAA"
            }, {
                text: "乙级",
                value: "AA"
            }, {
                text: "丙级",
                value: "A"
            }],
            "class": "bd-brand"
        },
        type_item: {
            type: "type_item",
            name: "出租类型",
            options: [{text: "整套房子/公寓", value: "20044"}, {text: "独立房间", value: "20045"}, {
                text: "合住房间",
                value: "20046"
            }],
            "class": ""
        },
        number_item: {
            type: "number_item",
            name: "入住人数",
            options: [{text: "1-2人", value: "20048"}, {text: "3-5人", value: "20049"}, {
                text: "5-8人",
                value: "20050"
            }, {text: "8人以上", value: "20051"}],
            "class": ""
        },
        tab_tags: window.options || []
    };
    if (window.countryId == 21536) {
        _.each(h.facility_item.options, function (X, V, W) {
            if (X.value == 20070) {
                W.splice(V, 1)
            }
        })
    }
    if (h.sub_scope["type"] == "landmark") {
        h.sort = "combine_desc"
    }
    if (window.has_subway) {
        h.tags.push({
            id: 19455,
            name: "临地铁",
            selected: false
        })
    }
    _.each(h.tab_tags, function (X, V, W) {
        if (X.id === 19646) {
            X.selected = window.airbnb
        }
    });
    var r = new FilterModel(h);
    var P = new HashQuerier(r);
    /*过滤条件请求数据交互地址*/
    r.url = "/hotel/ajax.php?sAction=getPoiList4";
    var s = (new FilterView({
        model: r,
        el: "#filters"
    })).render();
    var o = (new SelectedView({
        model: r,
        el: "#selected"
    })).render();
    //实例化列表视图
    var T = new ListView({
        model: r,
        el: "#hotel_list"
    });
    T.updatePrice();
    if (_.contains([10189, 10130, 10573, 10819, 21434, 15325, 11065, 12594, 16405, 15284, 11047, 11045, 24356, 14210, 11046, 11030, 11025, 10765, 11042, 16283, 10746, 10769, 11041, 11118, 11120, 11122, 10742, 10926, 10579, 10928, 10923, 10927, 10855, 17339, 10865, 10856, 10891, 10222, 11124, 11100, 10958, 11081, 10102, 11228, 11159, 11084, 10755, 10063, 10343, 15338, 11091, 11108, 18041, 10754, 11110, 11087, 11095, 11125, 10761], window.mddid)) {
        T.$el.on("click", "a", function (Y) {
            var V = $(Y.currentTarget),
                Z = V.closest(".h-item");
            if (!!Z.data("isAirbnb") && V.attr("href") === "/hotel/" + Z.data("id") + ".html" && !V.closest(".btn-booking")[0]) {
                Y.preventDefault();
                var X = $(".btn-booking", Z),
                    W = X.data("url");
                if (!!X.data("isOtherDate")) {
                    W += "&checkin_date=" + X.data("checkIn") + "&checkout_date=" + X.data("checkOut")
                } else {
                    W += "&checkin_date=" + r.get("checkin_date") + "&checkout_date=" + r.get("checkout_date")
                }
                window.open(W, "_blank")
            }
        })
    }
    T.$el.on("click", ".J_onyx_tips", function (V) {

        window.open("http://cn.amari.com/bestrate_guarantee.aspx", "_blank");
        return false
    });
    T.$el.on("click", "a", function (X) {
        var W = $(X.currentTarget),
            V = W.closest(".J_airbnb_info");
        if (!!V[0]) {
            X.preventDefault();
            $(".btn-booking", W.closest(".h-item")).trigger("click")
        }
    });


    var j = navigator.userAgent.toLowerCase().match(/msie [\d.]+/),
        v = j ? parseFloat(j[0].substr(5)) : false;
    if (v && v <= 9) {
        T.$el.on("render", L)
    }

    var x = new ProgressbarView({
        model: r,
        el: "#J_loading_progressbar"
    });

    var f = (new KeywordView({
        model: r,
        el: "#keyword"
    })).render();

    var u = (new HotelTypeView({
        model: r,
        el: "#hotel_types"
    })).render();

    r.on("change:sub_scope", function (W, V) {
        switch (V.type) {
            case "city":
                selectArea(-1);
                break;
            case "district":
                selectArea(V.id);
                break;
            case "landmark":
                selectPoi(V.id);
                break
        }
    });
    if (r.hasChanged()) {
        r.fetch(r, {
            resetPage: false
        });
        var E = r.get("sub_scope");
        var U = E.type;
        if (U == "district") {
            window.init_area_id = E.id
        }
    }

    function O() {
        var X = document.createElement("div"),
            V = {
                WebkitTransition: {
                    end: "webkitTransitionEnd"
                },
                MozTransition: {
                    end: "transitionend"
                },
                OTransition: {
                    end: "oTransitionEnd otransitionend"
                },
                transition: {
                    end: "transitionend"
                }
            };
        for (var W in V) {
            if (X.style[W] !== undefined) {
                return V[W]
            }
        }
        return false
    }

    var J = O(),
        S = !!J && !!window.requestAnimationFrame;
    $("#hotel_list").on("click", ".btn-addCollect", function (X) {
        var V = $(this);
        var W = V.data("id");
        var Y = V.data("type_id");
        //post请求添加数据
        $.post("/hotel/ajax.php?sAction=addFav", {
            poiId: W,
            type: 0,
            subtype: Y,
            content: ""
        }, function (aa) {
            if (aa.ret == -1) {
                show_login();
                return false
            }
            V.addClass("hide").siblings("a").removeClass("hide");
            if (S) {
                var Z = $("#J_part_side_bar").find(".stbar-collect");
                snabbt(Z[0], "stop");
                Z.addClass("focus").snabbt({
                    duration: 200,
                    scale: [1.4, 1.4]
                }).snabbt({
                    duration: 200,
                    scale: [1, 1],
                    easing: "spring",
                    springDeceleration: 0.8,
                    complete: function () {
                        Z.removeClass("focus")
                    }
                })
            }
        }, "json")
    }).on("click", ".btn-cancelCollect", function (X) {
        var V = $(this);
        var W = V.data("id");
        var Y = V.data("type_id");
        //post请求删除数据
        $.post("/hotel/ajax.php?sAction=delFav", {
            poiId: W,
            type: 0,
            subtype: Y,
            content: ""
        }, function (Z) {
            if (Z.ret == -1) {
                show_login();
                return false
            }
            V.addClass("hide").siblings("a").removeClass("hide")
        }, "json")
    });

    var I = $('#scope_list [data-type="district_wrapper"]'),
        D = I.find('[data-type="district"]'),
        C = D.find("li").filter(function (W) {
            var X = $("a", this).data("id"),
                V = $("a", this).data("referId");
            return !!X && Number(X) > 0 && !V
        }),
        m = I.find('[data-type="toggle"]'),
        i = m.find("a"),
        Q = m.find("span");
    if (C.length && D[0].scrollHeight > D[0].clientHeight + 10) {
        var z = "（共" + C.length + "）个区域";
        Q.html("展开" + z);
        m.show();
        m.click(function (V) {
            V.preventDefault();
            if (i.hasClass("extend")) {
                i.removeClass("extend");
                D.addClass("restrictheight");
                Q.html("展开" + z)
            } else {
                i.addClass("extend");
                D.removeClass("restrictheight");
                Q.html("收起" + z)
            }
        })
    }
    $(".drop").mouseenter(function (V) {
        var W = $(V.currentTarget);
        clearTimeout(W.data("hideTimer"));
        W.addClass("open");
        W.children("bd").fadeIn(200)
    });
    $(".drop").mouseleave(function (V) {
        var W = $(V.currentTarget);
        W.data("hideTimer", setTimeout(function () {
            W.removeClass("open");
            W.children("bd").fadeOut(200)
        }, 100))
    });
    var G = $("#ipt_datepicker_1"),
        y = $("#ipt_datepicker_2"),
        e = $.trim(G.val()) || h.checkin_date,
        t = $.trim(y.val()) || h.checkout_date,
        d = $("#btn-datepicker"),
        F = $("#checkin-date"),
        R = $("#num-nights"),
        b = (new XDate()).toString("yyyy-MM-dd"),
        l = (new XDate()).addDays(365).toString("yyyy-MM-dd");
    if (!e) {
        e = $.datepicker.formatDate("yy-mm-dd", (+new Date()) + 3 * 24 * 60 * 60 * 1000);
        t = $.datepicker.formatDate("yy-mm-dd", (+new Date()) + 5 * 24 * 60 * 60 * 1000);
        G.val(e);
        y.val(t)
    }
    F.html((new XDate(e)).toString("yyyy/MM/dd"));
    R.html("共" + (new XDate(e)).diffDays((new XDate(t))) + "晚");
    var q = new DateRangePicker({
        startInput: G,
        endInput: y,
        startDate: e,
        endDate: t,
        minDate: b,
        maxDate: l,
        rangeMaxDays: 30,
        doublePick: true
    });
    $("#btn-datepicker, #checkin-date, #num-nights").on("click", function () {
        G.trigger("focus")
    });
    $(".col-date").on("mouseenter", function () {
        G.trigger("focus")
    }).on("mouseleave", function (V) {
        if (!$(V.relatedTarget).closest("#ui-datepicker-div")[0]) {
            G.datepicker("hide");
            y.datepicker("hide")
        }
    });
    $("#ui-datepicker-div").on("mouseleave", function (V) {
        if (!$(V.relatedTarget).closest(".col-date")[0]) {
            G.datepicker("hide");
            y.datepicker("hide")
        }
    });
    $("body").on("doublepicked.daterangepicker", function (X, W, Y) {
        var V = new XDate(W),
            Z = new XDate(Y);
        F.html(V.toString("yyyy/MM/dd"));
        R.html("共" + V.diffDays(Z) + "晚");
        r.set({
            checkin_date: W,
            checkout_date: Y
        });
        !!mfwPageEvent && mfwPageEvent("hotel", "list_filter", {
            type: "日期",
            mddid: window.mddid
        })
    });

    var A = $("#hotel_list");
    A.on("click", "a.btn-booking", function (X) {
        X.preventDefault();
        var W = $(X.currentTarget),
            V = W.data("url");
        if (!!W.data("isOtherDate")) {
            V += "&checkin_date=" + W.data("checkIn") + "&checkout_date=" + W.data("checkOut")
        } else {
            V += "&checkin_date=" + r.get("checkin_date") + "&checkout_date=" + r.get("checkout_date")
        }
        window.open(V, "_blank")
    });
    A.delegate(".a-maps", "click", function () {
        var V = $(this),
            Y = V.offset().top,
            X = V.offset().left;
        var W = V.closest(".hotel-item");
        //打开地图
        window.open("/这里地址" + W.data("id"), "_blank")
    });
    $("#pnl_mappop").delegate("#btn_close_map", "click", function () {
        $("#pnl_mappop").hide()
    });
    r.on("change", function () {
        $("#pnl_mappop").hide()
    });
    /*隐藏品牌*/
    $("div[data-value='brand_item']").hide();
});