(function (win) {

    function MCNotificationsFeedModel(notificationsFeedRepository, notificationsOpeningFunction, setTimeoutFunction) {
        "use strict";

        NotificationsFeedModel.call(this, notificationsFeedRepository, notificationsOpeningFunction, setTimeoutFunction);
    }
    MCNotificationsFeedModel.prototype = Object.create(NotificationsFeedModel.prototype);
    MCNotificationsFeedModel.prototype.constructor = MCNotificationsFeedModel;

    MCNotificationsFeedModel.prototype.ConvertDateGmtToTimestamp = function (dateGmt) {
        return dateGmt ? MC.util.localDateToUnixTimestamp(new Date(dateGmt)) : '';
    };
    MCNotificationsFeedModel.prototype.ConvertTimestampToLocalDate = function (timestamp) {
        return MC.util.unixTimestampToDate(timestamp);
    };

    NotificationsFeedRepository.UserId = jQuery('#UserControlName').data('userid');
    win.MC.ui.notificationsFeed = new NotificationsFeedHandler(
        new MCNotificationsFeedModel(
            new NotificationsFeedRepository(),
            MC.topMenu.clickNotificationsFeed,
            window.__setTimeout
        ),
        window.__setTimeout,
        window.__clearTimeout
    );

    MC.ui.notificationsFeed.IsTouchDevice = Modernizr.touch;
    MC.addPageReadyFunction(MC.ui.notificationsFeed.LoadFeeds.bind(win, true));

})(window);
