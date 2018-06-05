window.UserLogin = function (username, password) {
    jQuery('#ErrorMessage').hide();
    jQuery('#ErrorMessage').text('');

    if (jQuery.trim(username) !== '' && jQuery.trim(password) !== '') {
        jQuery('#LoginForm').submit();
    }
    else {
        jQuery('#ErrorMessage').text('Please enter your username and password');
        jQuery('#ErrorMessage').show();
    }
};
