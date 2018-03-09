/**
 * Created by Administrator on 2015/12/14.
 */
M.define("Slider", function (b, a, c) {
    function d(e) {
        this.viewSize = 1;
        this.slideCnt = null;
        this.slideList = null;
        this.prev = $();
        this.next = $();
        this.indexer = $();
        this.itemSize = null;
        this.slideTime = 200;
        this.slideSize = 1;
        this.indexerOnClass = "on";
        this.disabledClass = "disabled";
        this.indexAttr = "index";
        this.shStyle = "slide";
        this.index = 1;
        M.mix(this, e);
        this.init()
    }

    d.prototype = {
        init: function () {
            this.hasMore = true;
            this.bindEvents();
            this.updateStatus();
            if (!this.itemSize) {
                this.itemSize = $(this.slideList).eq(0).outerWidth(true)
            }
        }, bindEvents: function () {
            this.prev.click($.proxy(this.toPrev, this));
            this.next.click($.proxy(this.toNext, this));
            this.indexer.click($.proxy(function (g) {
                g.preventDefault();
                var e = $(g.currentTarget), f = e.index() + 1;
                if (!e.hasClass(this.indexerOnClass) && !this.sliding && !isNaN(f)) {
                    this.toIndex(f)
                }
            }, this))
        }, toPrev: function (e) {
            if (!this.prev.hasClass(this.disabledClass) && !this.sliding) {
                this.slide(-this.slideSize)
            }
            e.preventDefault()
        }, toNext: function (e) {
            if (!this.next.hasClass(this.disabledClass) && !this.sliding) {
                this.slide(this.slideSize)
            }
            e.preventDefault()
        }, toIndex: function (e) {
            this.slide(e - this.index)
        }, updateStatus: function () {
            if (this.index === 1) {
                this.prev.addClass(this.disabledClass)
            } else {
                this.prev.removeClass(this.disabledClass)
            }
            if ((this.index + this.viewSize - 1) >= $(this.slideList).length && !this.hasMore) {
                this.next.addClass(this.disabledClass)
            } else {
                this.next.removeClass(this.disabledClass)
            }
            this.indexer.filter("." + this.indexerOnClass).removeClass(this.indexerOnClass);
            this.indexer.eq(this.index - 1).addClass(this.indexerOnClass);
            M.Event(this).fire("slide", {data: {index: this.index, total: $(this.slideList).length}})
        }, slide: function (e) {
            this.sliding = true;
            this.realSlideNum = e;
            this.prepareData($.proxy(function () {
                var f = this;
                d.shower[this.shStyle].show(this, function () {
                    f.index += f.realSlideNum;
                    f.sliding = false;
                    f.updateStatus()
                })
            }, this))
        }, prepareData: function (h) {
            var f = this.realSlideNum, e = $(this.slideList).length, h = typeof h === "function" ? h : $.noop, g = f >= 0 ? (e - this.index - this.viewSize + 1) : (this.index - 1);
            if (g <= 1) {
                this.hasMore = false
            }
            if (g <= 0) {
                this.realSlideNum = 0
            } else {
                this.realSlideNum = Math.abs(f) > g ? g : f;
                if (f < 0 && this.realSlideNum > 0) {
                    this.realSlideNum = -this.realSlideNum
                }
            }
            h()
        }, reset: function () {
            this.index = 1;
            this.hasMore = true;
            this.updateStatus();
            if (this.shStyle === "slide") {
                this.slideCnt.css("left", 0)
            }
        }
    };
    d.shower = {
        slide: {
            show: function (f, h) {
                var e = parseInt($(f.slideCnt).css("left"), 10), g = f.itemSize * f.realSlideNum;
                e = isNaN(e) ? 0 : e, $(f.slideCnt).animate({left: e - g}, f.slideTime, function () {
                    h()
                })
            }
        }, fadeInOut: {
            show: function (f, h) {
                var g = $(f.slideList[f.index - 1]), e = $(f.slideList[f.index + f.realSlideNum - 1]);
                g.fadeOut(f.slideTime);
                e.fadeIn(f.slideTime, function () {
                    h()
                })
            }
        }
    };
    return d
});
//这是home_mid
M.closure(function (aw) {
    var s = aw("Slider");
    var ai = 600,
        aE = 5000,
        aJ = false,
        N = $("#_j_top_pic_container"),//slider设置文件
        al = N.find(".show-image"),//slider设置文件.大图
        ag = N.find(".show-nav"),//slider设置文件。小图
        R = al.children("li"),
        C = R.length;
    var aB = new s({
        slideCnt: al,
        slideList: R,
        slideTime: ai,
        indexer: ag.children("li"),
        indexerOnClass: "active",
        shStyle: "fadeInOut"
    });
    al.add(ag).bind("mouseenter", function () {
        aJ = true
    }).bind("mouseleave", function () {
        aJ = false
    });
    setInterval(function () {
        if (!aJ && M.windowFocused) {
            if (aB.index < C) {
                aB.toIndex(aB.index + 1)
            } else {
                aB.toIndex(1)
            }
        }
    }, aE);
    var ao = $("#_j_index_search"),//slider父收索盒子
        af = $("#_j_index_search_tab"),//slider收索盒子
        S = $("#_j_index_search_bar_all"),//商圈部分
        i = $("#_j_index_search_bar_hotel"),//搜共享办公
        P = $("#_j_index_search_bar_mdd"),//我要去...新楼盘
        aC = $("#_j_index_search_bar_sales"),//搜二手..房源
        d = function (aL) {
            switch (aL) {
                case 0:
                    return S;
                    break;
                case 1:
                    return i;
                    break;
                case 2:
                    return P;
                    break;
                case 3:
                    return aC;
                    break;
                default:
            }
        };
    //点击li切换,收缩框
    af.on("click", "li", function (aO) {
        var aQ = $(aO.currentTarget),
            aL = Number(aQ.data("index")),
            aM = d(aL), aS = af.find(".tab-selected"),
            aR = Number(aS.data("index")),
            aP = d(aR),
            aN = $.trim(aP.find(".search-input input").val());
        af.find("li").removeClass("tab-selected");
        aQ.addClass("tab-selected");
        ao.find(".searchbar").hide();
        aM.find(".search-input input").val(aN).end().show()
    });
    var m = $("#_j_check_in"),//面积部分
        n = m.find("span"),//面积部分
        T = m.find("input"),//面积部分
        mj = $(".search-mod-m"),
        mja = mj.find("a"),

        A = $("#_j_check_out"),//商圈部分
        aI = A.find("input"),//商圈部分
        a = A.find("span"),//商圈部分
        sq = $(".search-mod-place"),
        sqa = sq.find("a");
    a.click(function () {
        sq.toggleClass("hide");
    });
    n.click(function () {
        mj.toggleClass("hide");
    });
    sqa.click(function () {
        a.text($(this).text());
        aI.val($(this).text());
        sq.toggleClass("hide");
        console.log(aI.val())
    });
    mja.click(function () {
        n.text($(this).text());
        T.val($(this).text());
        mj.toggleClass("hide");
        console.log(T.val())
    });

});