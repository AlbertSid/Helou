/**
 * Created by iTattoo on 2015-12-08.
 */
function iframe(that) {
    var url = $(that).attr("bata-href");
    var wh = $(that).attr("bata-wh").split(",");
    layer.open({
        type: 2,
        title: false,
        closeBtn: 1,
        shadeClose: true,
        shade: false,
        scrollbar: false,
        area: wh,
        content: url,
        success: function (object, index) {
            $(object).find("#layui-layer-iframe" + index).css({
                "height": wh[1]
            });
        }
    });
}
function ask() {
    layer.open({
        type: 2,
        title: false,
        skin: 'layui-layer-rim', //加上边框
        area: ['900px', '480px'], //宽高
        content: "../views/ask.html"
    });
}
$(function () {
    $('.aside a').not('.on').on('click', function (e) {
        var left, top;
        $('.aside .ripple').removeClass('animate');
        0 === $(this).children('.ripple').size() && $(this).prepend('<span class="ripple"></span>');
        var ripple = $(this).children('.ripple');
        left = e.pageX - $(this).offset().left - ripple.width() / 2;
        top = e.pageY - $(this).offset().top - ripple.height() / 2;
        ripple.css({
            top: top,
            left: left
        }).addClass('animate');
    });
});