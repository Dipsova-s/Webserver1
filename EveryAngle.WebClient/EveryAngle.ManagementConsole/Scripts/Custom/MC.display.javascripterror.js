// Handle Error window by Show Error on Popup
$(window).on("error", function (evt) {
    var e = evt.originalEvent;

    var message;
    if (e.message) {
        message = "Error: " + e.message + "<br/>Line: " + e.lineno + "<br/>ile: " + e.filename;
    } else {
        message = "Error: " + e.type + "<br/>Element: " + (e.srcElement || e.target);
    }

    MC.ui.loading.show();
    MC.ui.loading.setError([
        '<h1>' + Localization.Error_Title + '</h1>',
        '<p>' + message + '</p>'
    ].join(''));

    //Hide All Popup still open before render popup error
    setTimeout(function () {
        $(".k-window").hide();
        $(".k-overlay").hide();
    }, 500);
});