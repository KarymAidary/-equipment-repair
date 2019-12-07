$(document).ready(function () {
    var form = $('.form_buying_product');
    $('.add-to-cart-button').show();

    function basketUpdating(product_id, amount = null, material = null, size = null, is_delete = false, item = null) {
        var data = {};
        data.product_id = product_id;
        data.product_amount = amount;
        data.material = material;
        data.size = size;

        var csrf_token = $('.form_buying_product [name="csrfmiddlewaretoken"]').val();
        data["csrfmiddlewaretoken"] = csrf_token;
        var url = form.attr("action");

        if (is_delete) {
            data["is_delete"] = true;
        }
        ;

        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            success: function (data) {
                var $basket_total = data.basket_total;
                if (data.product_total == 0) {
                    $('.basket-wrapper').hide();
                    $('.empty-basket').append(data.empty_basket).show();
                    $('.header-user-counter').html(0)
                } else if (data.is_deleted) {
                    item.closest('.basket-items').remove();
                    $(".header-user-counter").text(data.product_total);
                    $('#total').text($basket_total + ' €');
                    calculatingBasketTotal();
                } else if (data.product_total > 0) {
                    $(".header-user-counter").text(data.product_total);
                    popUP($message = 'added successfully',
                        $bgColor = '#537559', $color = '#fff');
                }
            },
            error: function () {
                console.log("error");
            }

        });

    }

    form.on("submit", function (event) {
        event.preventDefault();
        var submit_btn = $('.submit_btn');
        var material = $("#material").val();
        var size = $("#size").val();
        var amount = $("#amount").val();
        var product_id = submit_btn.attr("id");
        basketUpdating(product_id, amount, material, size, is_delete = false);
    });
    $(document).on('click', '.cart-remove', function (e) {
        e.preventDefault();
        var item = $(this);
        product_id = $(this).data("product_id");
        amount = 0;
        material = null;
        size = null;
        basketUpdating(product_id, amount, material, size, is_delete = true, item);

    });

    function displayVals() {
        var singleValues = $("#material option:selected").text();
        $("#product-price").html(singleValues);
    }

    $("select").change(displayVals);
    displayVals();

    function calculatingTotalProductPrice() {
        var total_product_price = 0;
        $('.basket-items').each(function () {
            var product_price = parseFloat($(this).find('.cart-item-price').text());
            var product_amount = parseFloat($(this).find('.cart-item-amount').text());
            total_product_price = product_price * product_amount;
            $(this).find('.total_product_price').text(total_product_price + ' €');
        });
    }

    calculatingTotalProductPrice();

    function calculatingBasketTotal() {
        var total = 0;
        $('.total_product_price').each(function () {
            total += parseFloat($(this).text());
        });
        $('#subtotal_total').text(total + ' €');
        var total = parseFloat($('#total').text());
        var shipping = parseFloat($('#shipping').text());
        var subtotal = total - shipping;
        $('#subtotal').text(Math.round(subtotal * 100) / 100 + ' €');
    }

    calculatingBasketTotal();

    function unchangeablecalCulatingBasketTotal() {
        var unchangeableSubtotal = $('#unchangeable-total').text();
        var unchangeableShipping = $('#unchangeable-shipping').text();
        $('#unchangeable-subtotal').text(parseFloat(unchangeableSubtotal) - parseFloat(unchangeableShipping) + ' €');
    }

    unchangeablecalCulatingBasketTotal()
    document.getElementById('check_subscribe_policy_navbar').addEventListener('click', function (e) {
        document.getElementById('subscribe_submit_navbar').disabled = !e.target.checked;
    });

    document.getElementById('check_subscribe_policy_footer').addEventListener('click', function (e) {
        document.getElementById('subscribe_submit_footer').disabled = !e.target.checked;
    });

    $('.subscribe').submit(function (e) {
        e.preventDefault();
        var form = $('.subscribe');
        var email_id = $(this).find('.email_id').val();
        if (email_id) {
            var csrfmiddlewaretoken = csrftoken;
            var url = form.attr("action");
            var email_data = {
                "email_id": email_id,
                "csrfmiddlewaretoken": csrfmiddlewaretoken
            };
            $.ajax({
                type: 'POST',
                url: url,
                data: email_data,
                success: function (response) {
                    $('#email_id').val('');
                    if (response.status == "404") {
                        alert("This Email is already been subscribed!");
                    } else {
                        alert("Thank you for Subscribing! Please Check your Email to Confirm the Subscription");
                    }
                },
                error: function (response) {
                    alert("Sorry Something went Wrong");
                    $('#email_id').val('');
                }
            });
            return false;
        } else {
            alert("Please provide correct email!");
        }
    });


    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }


    var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();

    function csrfSafeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    $('#payment_method_paypal').on('click', function () {
        $('#card-element').parent().hide(200);
        $('.paypal-payment').show(200)

    });
    $('#payment_method_stripe').on('click', function () {
        $('#card-element').parent().show(200);
        $('.paypal-payment').hide(200)

    });

    $('#button_paypal').click(function () {
        $('#paypal_button').trigger()
    });

    var coll = document.getElementsByClassName("collapsible");
    var i;
    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + content.scrollHeight + content.scrollHeight + "px";
            }
        });
    }
    $('.ask_about_product').submit(function (e) {
        e.preventDefault();
        var $form = $('.ask_about_product');
        if (validateGoogleRecaptcha($form)) {
            var $name = $('#id_name').val();
            var $sender = $('#id_sender').val();
            var $id_message = $('#id_message').val();
            var csrfmiddlewaretoken = csrftoken;
            var url = $form.attr('action');
            var data = {
                "name": $name,
                "sender": $sender,
                "message": $id_message,
                "csrfmiddlewaretoken": csrfmiddlewaretoken
            };
            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: function (response) {
                    if (response.status == "successfully") {
                        $form.parent().hide();
                        $('.product-description-left').css('width', '100%');
                        popUP($message = 'Question successfully sent',
                            $bgColor = '#537559', $color = '#fff');
                    } else if (response.status == "invalid") {
                        popUP($message = 'Sorry Something went Wrong',
                            $bgColor = '#537559', $color = '#fff');
                    }
                },
                error: function (response) {
                    popUP($message = 'Sorry Something went Wrong',
                        $bgColor = '#537559', $color = '#fff');
                }
            });

        } else {
            popUP($message = 'Please, check reCaptcha',
                $bgColor = '#537559', $color = '#fff');
        }
    });

    $('.contact-form').submit(function (e) {
        e.preventDefault();
        var $form = $('.contact-form');
        if (validateGoogleRecaptcha($form)) {
            var $name = $('#id_contact_name').val();
            var $sender = $('#id_contact_email').val();
            var $id_message = $('#id_contact_message').val();
            var $id_subject = $('#id_contact_subject').val();
            var csrfmiddlewaretoken = csrftoken;
            var url = $form.attr('action');


            var data = {
                "contact_name": $name,
                "contact_email": $sender,
                "contact_message": $id_message,
                "contact_subject": $id_subject,
                "csrfmiddlewaretoken": csrfmiddlewaretoken,
            };
            $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: function (response) {
                    if (response.status == "successfully") {
                        $form.parent().hide();
                        popUP($message = 'Your message has been successfully sent',
                            $bgColor = '#537559', $color = '#fff');
                    } else if (response.status == "invalid") {
                        popUP($message = 'Sorry Something went Wrong',
                            $bgColor = '#537559', $color = '#fff');
                    }
                },
                error: function (response) {
                    popUP($message = 'Sorry Something went Wrong',
                        $bgColor = '#537559', $color = '#fff');
                }
            });

        } else {
            popUP($message = 'Please, check reCaptcha',
                $bgColor = '#537559', $color = '#fff');
        }
    });

});

$('.add-to-cart-button').hide();

function validateGoogleRecaptcha($form) {
    var recaptchaWidgetID = $form.data('recaptcha-widget-id');
    if (grecaptcha && !grecaptcha.getResponse(recaptchaWidgetID).length) {
        return false;
    }
    return true;
}

function popUP($message, $bgColor, $color) {
    var popUp = $('.popUp');
    popUp.children().html($message).css('color', $color);
    popUp.css('background-color', $bgColor);
    popUp.toggleClass('popUp-show');
    setTimeout(function () {
        popUp.toggleClass('popUp-show');
    }, 1500);
}


$(function () {
    $('.lazy').lazy({
        effect: "fadeIn",
        effectTime: 2000,
        threshold: 0,
        placeholder: "data:img/svg;base64,R0lGODlhEALAPQAPzl5uLr9Nrl8e7...",
    });
});
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}
var htmlLang = $('html').attr('lang');

$.cookieMessage({
    mainMessage: htmlLang == 'en' ? '<div class="text">We use cookies on our website to improve its functionality and enhance your user experience. <br>' +
        'Continuing browsing this website, you agree with our ' + '<a href="https://flomory.com/privacy-policy/">Privacy Policy</a>.</div>' : '<div class="text">Flomory verwendet Cookies, um dir das bestmögliche Shopping-Erlebnis zu bieten. <br>' +
        'Wenn du auf der Seite weitersurfst, ' +
        'stimmst du der ' + '<a href="https://flomory.com/privacy-policy/">Cookie-Nutzung</a> zu.</div>',
    acceptButton: 'Accept',
    backgroundColor: '#000000',
    fontSize: '15px',
    fontColor: '#fff',
    btnBackgroundColor: '#000000',
    btnFontSize: '15px',
    btnFontColor: '#fff',
    linkFontColor: '#fff',
    expirationDays: 20,
    cookieName: 'cookieMessage'
});