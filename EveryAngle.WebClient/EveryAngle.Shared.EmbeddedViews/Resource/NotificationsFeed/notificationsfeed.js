
function NotificationsFeedHandler(notificationsFeedModel) {
    "use strict";

    var self = this;
    var isForceRender = false;
    var isLoaded = false;
    var scrollTimeout = null;
    var delay = 100;
    var htmlClassnameDisable = 'disabled';

    var _model = notificationsFeedModel;

    self.OnFeedLoaded = function (response) {
        _model.SetDataFeeds(response);
        _model.SetDataViewAllUrl(NotificationsFeed.viewAllUrl);
    };

    self.OnFeedCannotLoaded = function (error) {
        if (error.status === 200)
            return;

        var feeds = _model.GetFeedsHistory();
        if (feeds.length) {
            _model.SetOfflineDataFeeds(feeds);
            _model.SetDataViewAllUrl(NotificationsFeed.viewAllUrl);
        }
    };

    self.ShowTopMenuIcon = function () {
        getTopMenuContainerElement().removeClass(htmlClassnameDisable);
    };

    self.HideTopMenuIcon = function () {
        getTopMenuContainerElement().addClass(htmlClassnameDisable);
        jQuery('#NotificationsFeedMenu').css('display', 'none');
    };

    self.ProcessElements = function () {
        var topmenu = getTopMenuElement();
        var container = getContainerElement();
        
        topmenu.html(notificationsFeedTopMenuIconTemplate());
        container.filter('.sectionWelcome').find('.header').html(notificationsFeedHeaderHtmlTemplate());
        container.filter('.k-window-content').find('.header').html(notificationsFeedPopOverHeaderTemplate());
        container.find('.content').html(notificationsFeedHtmlTemplate());
        container.find('.footer').html(notificationsFeedFooterHtmlTemplate());

        applyScrollEventHandling();
        applyBindings();
    };

    self.CleanUpElements = function () {
        var topmenu = getTopMenuElement();
        var container = getContainerElement();

        topmenu.empty();
        container.find('.header').empty();
        container.find('.content').empty();
        container.find('.footer').empty();

        ko.cleanNode(topmenu.get(0));
        jQuery.each(container, function (i, element) {
            ko.cleanNode(element);
        });
    };

    self.LoadFeeds = function (renderImmediately) {
        isForceRender = renderImmediately;

        if (!isLoaded) {
            isLoaded = true;
            self.RequestFeedsHandling();
        }

        if (isForceRender) {
            self.ShowTopMenuIcon();
        }
        else {
            self.CleanUpElements();
        }
        
    };

    self.RequestFeedsHandling = function () {
        setTimeout(function () {
            // IMPORTANT: https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/
            jQuery.ajax({
                url: NotificationsFeed.dataUrl,
                type: 'get',
                dataType: 'jsonp',
                jsonp: '_jsonp',
                cache: false,
                success: self.OnFeedLoaded.bind(this),
                error: self.OnFeedCannotLoaded.bind(this)
            })
                .always(function () {
                    if (isForceRender) {
                        isForceRender = false;
                        self.ProcessElements();
                    }
                });
        }, 250);
    };

    var getContainerElement = function () {
        return jQuery('.notificationsFeed');
    };

    var getTopMenuElement = function () {
        return jQuery('#NotificationsFeed');
    };

    var getTopMenuContainerElement = function () {
        return getTopMenuElement().parent();
    };

    var applyBindings = function () {
        var elements = jQuery.merge(getTopMenuElement(), getContainerElement());
        jQuery.each(elements, function (index, element) {
            ko.applyBindings(_model, element);
        });
    };

    var applyScrollEventHandling = function () {
        getContainerElement().find('.list').off('scroll').on('scroll', function () {
            clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(function () {
                _model.MarkAndUpdateAllAsNotified();
                _model.UpdateAllNewFeedsState();
            }, delay);
        });
    };

}

function NotificationsFeedModel(notificationsFeedRepository, toggleNotificationsMenuFunction) {
    "use strict";

    var self = this;
    var isBellIconClicked = false;
    var negativeNumberOfMonth = 2;

    var _repository = notificationsFeedRepository;
    var _toggleNotificationsMenuFunction = toggleNotificationsMenuFunction;

    var updateNumberOfNotify = function (feedIds) {
        var numberOfNotified = _repository.CountNumberOfNotify(feedIds);
        self.ViewModel.NumberOfNotify(numberOfNotified);
    };

    self.ViewModel = {
        NumberOfNotify: ko.observable(0),
        Feeds: ko.observableArray([]),
        ViewAllUrl: ko.observable('')
    };

    self.OnFeedsRendered = function () {
        jQuery('#NotificationsFeed').find('.hide').removeClass('hide');
        jQuery('.notificationsFeed').find('.hide').removeClass('hide');
    };
    
    self.SetDataFeeds = function (response) {
        if (jQuery.isArray(response)) {
            var feeds = self.MapFeedsView(response);
            self.RebuildFeeds();
            self.SaveFeedsHistory(feeds);
            self.UpdateRepository(feeds);
            self.MapFeedsDateView(feeds);
            self.ViewModel.Feeds(feeds);
        }
    };

    self.SetOfflineDataFeeds = function (feeds) {
        self.UpdateRepository(feeds);
        self.MapFeedsIsUnReadStateOfflineView(feeds);
        self.MapFeedsDateView(feeds);
        self.ViewModel.Feeds(feeds);
    };

    self.MapFeedsView = function (response) {
        var result;

        try {
            result = jQuery.map(response, function (data) {
                return {
                    id: data.id,
                    title: self.StripHTML(data.title.rendered),
                    content: self.StripHTML(data.excerpt.rendered),
                    url: data.link,
                    createDate: self.ConvertDateToTimestamp(data.date_gmt),
                    isUnReadState: ko.observable(self.IsUnReadState(data.id)),
                    isNewState: ko.observable(self.IsNewState(data.id))
                };
            });
        }
        catch (e) {
            result = [];
        }

        return result;
    };

    self.MapFeedsDateView = function (feeds) {
        jQuery.each(feeds, function (i, feed) {
            feed.createDate = self.ConvertLocalDateToDateView(
                self.ConvertTimestampToLocalDate(feed.createDate)
            );
        });
    };

    self.MapFeedsIsUnReadStateOfflineView = function (feeds) {
        jQuery.each(feeds, function (i, feed) {
            feed.isUnReadState = ko.observable(self.IsUnReadState(feed.id));
            feed.isNewState = ko.observable(self.IsNewState(feed.id));
        });
    };

    self.SetDataViewAllUrl = function (url) {
        if (url) {
            self.ViewModel.ViewAllUrl(url);
        }
    };

    self.GetNumberOfNotifyForPopOver = function () {
        return '(' + self.ViewModel.NumberOfNotify() + ')';
    };

    self.IsUnReadState = function (id) {
        var result = !_repository.IsReadState(id);

        return result;
    };

    self.IsNewState = function (id) {
        var result = _repository.IsNewState(id);
        return result;
    };

    self.MarkAsRead = function (id) {
        if (id) {
            _repository.MarkAsRead(id);
            var isUnreadState = self.IsUnReadState(id);
            var isNewState = self.IsNewState(id);
            var content = self.ViewModel.Feeds().findObject('id', id);
            content.isUnReadState(isUnreadState);
            content.isNewState(isNewState);
            self.MarkAndUpdateAllAsNotified();
            self.UpdateAllNewFeedsState();
        }

        return true;
    };

    self.ToggleNotificationsMenu = function () {
        if (_toggleNotificationsMenuFunction) {
            self.MarkAndUpdateAllAsNotified();

            if (isBellIconClicked && $('#NotificationsFeedMenu').is(':hidden')) {
                self.UpdateAllNewFeedsState();
            }

            setTimeout(function () {
                _toggleNotificationsMenuFunction();
            }, 0);
            
            isBellIconClicked = true;
        }
    };

    self.MarkAndUpdateAllAsNotified = function () {
        var feedIds = jQuery.map(self.ViewModel.Feeds(), function (feed) {
            return feed.id;
        });

        _repository.MarkAsNotified(feedIds);
        updateNumberOfNotify(feedIds);
    };

    self.UpdateRepository = function (feeds) {
        var feedIds = jQuery.map(feeds, function (feed) {
            return feed.id;
        });

        self.ReBuildReadState(feedIds);
        updateNumberOfNotify(feedIds);
    };

    self.RebuildFeeds = function () {
        var newContents = {};
        var now = new Date();
        now.setMonth(new Date().getMonth() - negativeNumberOfMonth);
        var contents = _repository.GetFeeds();
        jQuery.each(contents, function (contentId) {
            var content = contents[contentId];
            if (content.createDate) {
                var contentDate = self.ConvertTimestampToLocalDate(content.createDate);
                if (now > contentDate) {
                    newContents[contentId] = content;
                }
            }
        });
        _repository.SaveFeeds(newContents);
    };

    self.ReBuildReadState = function (ids) {
        var result = [];
        var history = _repository.GetCurrentUserFeedsHistory();
        var feedIds = history[_repository.ReadStateIdsIndex];

        jQuery.each(ids, function (i, id) {
            var isFeedStillRemain = jQuery.inArray(id, feedIds) !== -1;

            if (isFeedStillRemain) {
                result.push(id);
            }
        });

        history[_repository.ReadStateIdsIndex] = result;
        _repository.SaveCurrentUserFeedsHistory(history);
    };

    self.GetFeedsHistory = function () {
        var feeds = [];
        var contents = _repository.GetFeeds();
        jQuery.each(contents, function (contentId) {
            feeds.push(contents[contentId]);
        });
        return feeds.reverse();
    };

    self.SaveFeedsHistory = function (feedsViewModel) {
        var clonefeedsViewModel = JSON.parse(JSON.stringify(feedsViewModel));
        var contents = _repository.GetFeeds();
        jQuery.each(clonefeedsViewModel, function (i, feedViewModel) {
            delete feedViewModel.isUnReadState;
            contents[feedViewModel.id] = feedViewModel;
        });
        _repository.SaveFeeds(contents);
    };

    self.UpdateAllNewFeedsState = function () {
        var notifiedIds = _repository.GetNotifiedIds();

        jQuery.each(self.ViewModel.Feeds(), function (i, feed) {
            var isNewState = jQuery.inArray(feed.id, notifiedIds) === -1;
            feed.isNewState(isNewState);
        });
    };

}
NotificationsFeedModel.prototype.StripHTML = function (html) {
    return html;
};
NotificationsFeedModel.prototype.ConvertDateToTimestamp = function (dateGmt) {
    return dateGmt;
};
NotificationsFeedModel.prototype.ConvertTimestampToLocalDate = function (timestamp) {
    return timestamp;
};
NotificationsFeedModel.prototype.ConvertLocalDateToDateView = function (localDate) {
    return localDate;
};

function NotificationsFeedRepository(userId) {
    "use strict";

    var self = this;
    var _userId = userId;
    
    self.NotifiedIdsIndex = 'notified_ids';
    self.ReadStateIdsIndex = 'read_state_ids';

    //#region count new coming feed
    self.MarkAsNotified = function (ids) {
        var history = self.GetCurrentUserFeedsHistory();
        history[self.NotifiedIdsIndex] = ids;
        self.SaveCurrentUserFeedsHistory(history);
    };
    self.CountNumberOfNotify = function (ids) {
        var result = 0;
        var feedIds = self.GetNotifiedIds();

        jQuery.each(ids, function (i, id) {
            var isOldFeed = jQuery.inArray(id, feedIds) !== -1;
            if (!isOldFeed) {
                result++;
            }
        });

        return result;
    };
    self.IsNewState = function (id) {
        var feedIds = self.GetNotifiedIds();
        var isNew = jQuery.inArray(id, feedIds) === -1;
        return isNew;
    };
    self.GetNotifiedIds = function () {
        var history = self.GetCurrentUserFeedsHistory();
        var feedIds = history[self.NotifiedIdsIndex];
        return feedIds;
    };
    //#end region count new coming feed

    // #region read state
    self.IsReadState = function (id) {
        var history = self.GetCurrentUserFeedsHistory();
        var feedIds = history[self.ReadStateIdsIndex];
        var isRead = jQuery.inArray(id, feedIds) !== -1;
        return isRead;
    };

    self.MarkAsRead = function (id) {
        if (!self.IsReadState(id)) {
            var history = self.GetCurrentUserFeedsHistory();
            history[self.ReadStateIdsIndex].push(id);
            self.SaveCurrentUserFeedsHistory(history);
        }
    };
    // #end region read state

    //#region per user
    self.GetCurrentUserFeedsHistory = function () {
        var storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
        var result = storage.users[encodeURIComponent(_userId)];
        return result;
    };
    self.SaveCurrentUserFeedsHistory = function (userFeedsHistory) {
        var storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
        storage.users[encodeURIComponent(_userId)] = userFeedsHistory;
        jQuery.localStorage(NotificationsFeedRepository.StorageKey, storage);
    };
    var createNewCurrentUserFeedsHistory = function (storage) {
        storage.users[encodeURIComponent(_userId)] = {};
        var user = storage.users[encodeURIComponent(_userId)];
        user[self.NotifiedIdsIndex] = [];
        user[self.ReadStateIdsIndex] = [];
        jQuery.localStorage(NotificationsFeedRepository.StorageKey, storage);
    };
    //#end region per user

    //#region content
    self.GetFeeds = function () {
        var storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
        return storage.contents;
    };
    self.SaveFeeds = function (contents) {
        var storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
        storage.contents = contents;
        jQuery.localStorage(NotificationsFeedRepository.StorageKey, storage);
    };
    //#end region content

    var installNewStorage = function () {
        var storage = {
            contents: {},
            users: {}
        };
        jQuery.localStorage(NotificationsFeedRepository.StorageKey, storage);
    };

    var init = function () {
        var storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
        if (!storage) {
            installNewStorage();
            storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
        }
        if (_userId && !storage.users[encodeURIComponent(_userId)]) {
            createNewCurrentUserFeedsHistory(storage);
        }
    };

    init();
}
NotificationsFeedRepository.StorageKey = 'notifications_feed';

var notificationsFeedHeaderHtmlTemplate = function () {
    return [
        '<strong>' + Localization.NotificationsFeed_Updates + '</strong>',
        '<!-- ko if: ViewModel.NumberOfNotify -->',
        '<div class="notificationsFeedBadge hide">',
            '<span class="number">',
                '<span data-bind="text: ViewModel.NumberOfNotify"></span>',
            '</span>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
};

var notificationsFeedPopOverHeaderTemplate = function () {
    return [
        '<strong> ' + Localization.NotificationsFeed_Updates,
        '<!-- ko if: ViewModel.NumberOfNotify -->',
        '<span data-bind="text: GetNumberOfNotifyForPopOver"></span>',
        '<!-- /ko -->',
        '</strong >'
    ].join('');
};

var notificationsFeedTopMenuIconTemplate = function () {
    return [
        '<!-- ko if: ViewModel.NumberOfNotify -->',
        '<div class="notificationsFeedBadge hide" data-bind="click: $root.ToggleNotificationsMenu">',
            '<span class="number">',
                '<span data-bind="text: ViewModel.NumberOfNotify"></span>',
            '</span>',
        '</div>',
        '<!-- /ko -->',
        '<span id="NotificationsFeedIcon" data-bind="click: $root.ToggleNotificationsMenu"></span>'
    ].join('');
};

var notificationsFeedHtmlTemplate = function () {
    return [
        '<div class="list">',
            '<!-- ko foreach: { data: ViewModel.Feeds, afterRender: $root.OnFeedsRendered } -->',
                '<div class="item" data-bind="{ css: { \'unread\': $data.isUnReadState, \'new\': $data.isNewState }, click: $root.MarkAsRead.bind(this, $data.id) }">',
                    '<a data-bind="attr: {\'href\': $data.url}" target="_blank">',
                        '<div class="info">',
                            '<div class="infoWrapper">',
                                '<strong class="textEllipsis" data-bind="html: $data.title"></strong>',
                                '<p class="truncatable" data-bind="html: $data.content"></p>',
                                '<span class="icon"></span> <span class="createAt" data-bind="text: $data.createDate"></span>',
                            '</div>',
                        '</div>',
                    '</a>',
                '</div>',
            '<!-- /ko -->',
        '</div>'
    ].join('');
};

var notificationsFeedFooterHtmlTemplate = function () {
    return [
        '<!-- ko if: ViewModel.ViewAllUrl -->',
        '<a data-bind="attr: {href: ViewModel.ViewAllUrl}" target="_blank">' + Localization.NotificationsFeed_ViewAll + '</a>',
        '<!-- /ko -->'
    ].join('');
};
