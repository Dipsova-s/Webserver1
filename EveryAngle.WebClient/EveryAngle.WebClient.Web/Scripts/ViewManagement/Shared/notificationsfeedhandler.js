
function WCNotificationsFeedModel(notificationsFeedRepository, notificationsOpeningFunction) {
    "use strict";

    NotificationsFeedModel.call(this, notificationsFeedRepository, notificationsOpeningFunction);
}
WCNotificationsFeedModel.prototype = Object.create(NotificationsFeedModel.prototype);
WCNotificationsFeedModel.prototype.constructor = WCNotificationsFeedModel;

WCNotificationsFeedModel.prototype.StripHTML = function (html) {
    return WC.HtmlHelper.StripHTML(html);
};
WCNotificationsFeedModel.prototype.ConvertDateToTimestamp = function (dateGmt) {
    return dateGmt ? WC.DateHelper.LocalDateToUnixTime(new Date(dateGmt)) : '';
};
WCNotificationsFeedModel.prototype.ConvertTimestampToLocalDate = function (timestamp) {
    return WC.DateHelper.UnixTimeToLocalDate(timestamp);
};
WCNotificationsFeedModel.prototype.ConvertLocalDateToDateView = function (localDate) {
    return localDate ? kendo.toString(localDate, 'dd-MM-yyyy, HH:mm') : 'n/a';
};

var notificationsFeedHandler = new NotificationsFeedHandler(
    new WCNotificationsFeedModel(
        new NotificationsFeedRepository(
            userModel && userModel.Data() && userModel.Data().id ? userModel.Data().id : null
        ),
        userSettingsView.ToggleMenuNotificationsFeed
    )
);
