$(document).ready(function () {
    $('#apply').click(function (e) {
        e.preventDefault();
        var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
        var cupone_code = $('#id_code').val();
        var csrfmiddlewaretoken = csrftoken;
        var data = {
            "cupone_code": cupone_code,
            "csrfmiddlewaretoken": csrfmiddlewaretoken
        };
        var url = $('.cupon_code').attr('action');
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            success: function (response) {
                $('#id_code').val('');
                var $basket_total = response.basket_total;
                if (response.status == "successfully") {
                    popUP($message = 'You have successfully used your coupon code',
                        $bgColor = '#537559', $color = '#fff');
                    $('.cart-summary .shipping').after(response.discount).show();
                    $('#total').text($basket_total + ' €');
                } else if (response.status == "already") {
                    popUP($message = "You have already used your coupon code",
                        $bgColor = '#cce5ff', $color = '#0c5460')
                } else {
                    popUP($message = "Invalid coupon code",
                        $bgColor = '#f8d7da', $color = '#721c24')
                }
            },
            error: function (response) {
                alert("Sorry Something went Wrong");
                $('#id_code').val('');
            }
        });
    });
});

function popUP($message, $bgColor, $color) {
    var popUp = $('.popUp');
    popUp.children().html($message).css('color', $color);
    popUp.css('background-color', $bgColor);
    popUp.toggleClass('popUp-show');
    setTimeout(function () {
        popUp.toggleClass('popUp-show');
    }, 1500);
};
