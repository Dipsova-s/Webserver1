function WCNotificationsFeedModel(notificationsFeedRepository, notificationsOpeningFunction, setTimeoutFunction) {
    "use strict";

    NotificationsFeedModel.call(this, notificationsFeedRepository, notificationsOpeningFunction, setTimeoutFunction);
}
WCNotificationsFeedModel.prototype = Object.create(NotificationsFeedModel.prototype);
WCNotificationsFeedModel.prototype.constructor = WCNotificationsFeedModel;

WCNotificationsFeedModel.prototype.ConvertDateGmtToTimestamp = function (dateGmt) {
    return dateGmt ? WC.DateHelper.LocalDateToUnixTime(new Date(dateGmt)) : '';
};
WCNotificationsFeedModel.prototype.ConvertTimestampToLocalDate = function (timestamp) {
    return WC.DateHelper.UnixTimeToLocalDate(timestamp);
};
WCNotificationsFeedModel.prototype.ConvertTimestampToDateView = function (timestamp) {
    return WC.FormatHelper.GetFormattedValue(enumHandlers.FIELDTYPE.DATETIME_WC, timestamp);
};

var notificationsFeedHandler = new NotificationsFeedHandler(
    new WCNotificationsFeedModel(
        new NotificationsFeedRepository(),
        userSettingsView.ToggleMenuNotificationsFeed
    )
);
function WCNotificationsFeedCreator() {
    "use strict";
}
WCNotificationsFeedCreator.Create = function (userId) {
    NotificationsFeedRepository.UserId = userId;
    NotificationsFeedRepository.Init();
    notificationsFeedHandler.IsTouchDevice = Modernizr.touch;
    notificationsFeedHandler.LoadFeeds(true, true);
};