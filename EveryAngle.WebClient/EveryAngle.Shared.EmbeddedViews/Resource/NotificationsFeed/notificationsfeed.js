var notificationsFeedHeaderHtmlTemplate = function () {
    return [
        '<strong>' + Localization.NotificationsFeed_Updates + '</strong>',
        '<!-- ko if: $root.ViewModel.NumberOfNotify -->',
        '<div class="notificationsFeedBadge hide">',
        '<span class="number">',
        '<span data-bind="text: $root.ViewModel.NumberOfNotify"></span>',
        '</span>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
};

var notificationsFeedPopOverHeaderTemplate = function () {
    return [
        '<strong> ' + Localization.NotificationsFeed_Updates,
        '<!-- ko if: $root.ViewModel.NumberOfNotify -->',
        '<span data-bind="text: GetNumberOfNotifyForPopOver"></span>',
        '<!-- /ko -->',
        '</strong >'
    ].join('');
};

var notificationsFeedTopMenuIconTemplate = function () {
    return [
        '<span id="NotificationsFeedIcon" class="icon" data-bind="click: $root.ToggleNotificationsMenu">',
        '<div class="animation"></div>',
        '</span >',
        '<!-- ko if: $root.ViewModel.NumberOfNotify -->',
        '<div class="notificationsFeedBadge hide" data-bind="click: $root.ToggleNotificationsMenu">',
        '<span class="number">',
        '<span data-bind="text: $root.ViewModel.NumberOfNotify"></span>',
        '</span>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
};

var notificationsFeedHtmlTemplate = function () {
    return [
        '<div class="list">',
        '<!-- ko foreach: { data: $root.ViewModel.Feeds, afterRender: $root.OnFeedsRendered } -->',
        '<div class="item" data-bind="{ css: { \'unread\': $data.isUnReadState, \'new\': $data.isNewState }, click: $root.MarkAsRead.bind(this, $data.id) }">',
        '<a data-bind="attr: {\'href\': $data.url}" target="_blank">',
        '<div class="image">',
        '<div class="imageWrapper">',
        '<img data-bind="attr:{src: $data.thumbnail}">',
        '</div>',
        '</div>',
        '<div class="info">',
        '<div class="infoWrapper">',
        '<strong class="textEllipsis" data-bind="html: $data.title"></strong>',
        '<p class="truncatable" data-bind="html: $data.content"></p>',
        '<span class="icon"></span> <span class="createAt" data-bind="text: $data.createDate" data-role="localize"></span>',
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
        '<!-- ko if: $root.ViewModel.ViewAllUrl -->',
        '<div class="inner">',
        '<a data-bind="attr: {href: $root.ViewModel.ViewAllUrl}" target="_blank">' + Localization.NotificationsFeed_ViewAll + '</a>',
        '</div>',
        '<!-- /ko -->'
    ].join('');
};

function NotificationsFeedHandler(notificationsFeedModel, setTimeoutFunction, clearTimeoutFunction) {
    "use strict";

    var self = this;
    var isForceRender = false;
    var isLoaded = false;
    var scrollTimeout = null;
    var delay = 100;
    var htmlClassnameDisable = 'disabled';

    var _self = {};
    var _model = notificationsFeedModel;
    var _setTimeout = setTimeoutFunction || window.setTimeout;
    var _clearTimeout = clearTimeoutFunction || window.clearTimeout;

    self.IsTouchDevice = false;
    self.JsonpCallback = 'notificationsFeedHandler.OnFeedLoaded';

    self.OnFeedLoaded = function (response) {
        _model.SetDataFeeds(response);
        _model.SetDataViewAllUrl(notificationsFeed.viewAllUrl);
    };

    self.OnFeedCannotLoaded = function (error) {
        if (error.status === 200)
            return;

        var feeds = _model.GetFeedsHistory();
        if (feeds.length) {
            _model.SetOfflineDataFeeds(feeds);
            _model.SetDataViewAllUrl(notificationsFeed.viewAllUrl);
        }
    };

    self.ShowTopMenuIcon = function () {
        _self.getTopMenuContainerElement().removeClass(htmlClassnameDisable);
    };

    self.HideTopMenuIcon = function () {
        _self.getTopMenuContainerElement().addClass(htmlClassnameDisable);
        jQuery('#NotificationsFeedMenu').css('display', 'none');
    };

    self.ProcessElements = function () {
        var topmenu = _self.getTopMenuElement();
        var container = _self.getContainerElement();
        topmenu.html(notificationsFeedTopMenuIconTemplate());
        container.filter('.sectionWelcome').find('.header').html(notificationsFeedHeaderHtmlTemplate());
        container.filter('.k-window-content').find('.header').html(notificationsFeedPopOverHeaderTemplate());
        container.find('.content').html(notificationsFeedHtmlTemplate());
        container.find('.footer').html(notificationsFeedFooterHtmlTemplate());

        _self.applyScrollEventHandling();
        _self.applyBindings();
    };

    self.CleanUpElements = function () {
        var topmenu = _self.getTopMenuElement();
        var container = _self.getContainerElement();

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
        if (!window.notificationsFeed)
            return false;

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
        _setTimeout(function () {
            // IMPORTANT: https://developer.wordpress.org/rest-api/using-the-rest-api/global-parameters/
            jQuery
                .ajax({
                    url: notificationsFeed.dataUrl,
                    type: 'get',
                    dataType: 'jsonp',
                    jsonp: '_jsonp',
                    jsonpCallback: self.JsonpCallback,
                    cache: false,
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

    _self.getContainerElement = function () {
        return jQuery('.notificationsFeed');
    };

    _self.getTopMenuElement = function () {
        return jQuery('#NotificationsFeed');
    };

    _self.getTopMenuContainerElement = function () {
        return _self.getTopMenuElement().parent();
    };

    _self.applyBindings = function () {
        var elements = jQuery.merge(_self.getTopMenuElement(), _self.getContainerElement());
        jQuery.each(elements, function (index, element) {
            ko.applyBindings(_model, element);
        });
    };

    _self.applyScrollEventHandling = function () {
        var listContainer = _self.getContainerElement().find('.list');

        listContainer.off('scroll').on('scroll', function () {
            _clearTimeout(scrollTimeout);

            scrollTimeout = _setTimeout(function () {
                _model.MarkAndUpdateAllAsNotified();
                _model.UpdateAllNewFeedsState();
            }, delay);
        });

        if (self.IsTouchDevice) {
            listContainer.addClass('scroll');
        }
    };

}

function NotificationsFeedModel(notificationsFeedRepository, toggleNotificationsMenuFunction, setTimeoutFunction) {
    "use strict";

    var self = this;
    var isBellIconClicked = false;
    var negativeNumberOfMonth = 2;

    var _repository = notificationsFeedRepository;
    var _setTimeout = setTimeoutFunction || window.setTimeout;
    var _toggleNotificationsMenuFunction = toggleNotificationsMenuFunction;

    var updateNumberOfNotify = function (feedIds) {
        var numberOfNotified = _repository.CountNumberOfNotify(feedIds);
        self.ViewModel.NumberOfNotify(numberOfNotified);
    };

    var stripHTML = function (html) {
        return jQuery('<span/>').html(html).text();
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
            self.SaveFeedsHistory(feeds);
            self.UpdateRepository(feeds);
            self.MapFeedsDateView(feeds);
            self.ViewModel.Feeds(feeds);
            self.RebuildFeeds();
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
                    thumbnail: self.GetFeedThumbnail(data),
                    title: stripHTML(data.title.rendered),
                    content: stripHTML(data.excerpt.rendered),
                    url: data.link,
                    createDate: self.ConvertDateGmtToTimestamp(data.date_gmt),
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

    self.GetFeedThumbnail = function (data) {
        var thumbnail;
        try {
            thumbnail = data._embedded['wp:featuredmedia']['0'].media_details.sizes.thumbnail.source_url;
        } catch (e) {
            thumbnail = null;
        }
        return thumbnail;
    };

    self.MapFeedsDateView = function (feeds) {
        jQuery.each(feeds, function (i, feed) {
            feed.createDate = self.ConvertTimestampToDateView(feed.createDate);
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

    self.ToggleNotificationsMenu = function (data, event) {
        self.DisplayRadialClickedEffect(event);

        if (_toggleNotificationsMenuFunction) {
            self.MarkAndUpdateAllAsNotified();
            if (isBellIconClicked && $('#NotificationsFeedMenu').is(':hidden')) {
                self.UpdateAllNewFeedsState();
            }
            _setTimeout(function () {
                _toggleNotificationsMenuFunction();
            }, 0);
            isBellIconClicked = true;
        }
    };

    self.DisplayRadialClickedEffect = function (event) {
        var bell = jQuery(event.currentTarget).parent().find('#NotificationsFeedIcon');
        if (bell.hasClass('active'))
            return;

        bell.addClass('active');
        _setTimeout(function () {
            bell.removeClass('active');
        }, 200);
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
        var twoMonthsDateAgo = self.GetTwoMonthsDateAgo();
        var contents = _repository.GetFeeds();
        jQuery.each(contents, function (contentId) {
            var content = contents[contentId];
            if (content.createDate) {
                var contentDate = self.ConvertTimestampToLocalDate(content.createDate);
                if (contentDate > twoMonthsDateAgo) {
                    newContents[contentId] = content;
                }
            }
        });
        _repository.SaveFeeds(newContents);
    };

    self.GetTwoMonthsDateAgo = function () {
        var twoMonthsDateAgo = new Date();
        var currentMonth = new Date().getMonth();
        twoMonthsDateAgo.setMonth(currentMonth - negativeNumberOfMonth);

        return twoMonthsDateAgo;
    };

    self.ReBuildReadState = function (ids) {
        var result = [];
        var history = _repository.GetCurrentUserFeedsHistory();
        var feedIds = history[NotificationsFeedRepository.ReadStateIdsIndex];

        jQuery.each(ids, function (i, id) {
            var isFeedStillRemain = jQuery.inArray(id, feedIds) !== -1;

            if (isFeedStillRemain) {
                result.push(id);
            }
        });

        history[NotificationsFeedRepository.ReadStateIdsIndex] = result;
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
NotificationsFeedModel.prototype.ConvertDateGmtToTimestamp = function (dateGmt) {
    return dateGmt;
};
NotificationsFeedModel.prototype.ConvertTimestampToLocalDate = function (timestamp) {
    return timestamp;
};
NotificationsFeedModel.prototype.ConvertTimestampToDateView = function (timestamp) {
    return timestamp;
};

function NotificationsFeedRepository() {
    "use strict";

    var self = this;

    //#region count new coming feed
    self.MarkAsNotified = function (ids) {
        var history = self.GetCurrentUserFeedsHistory();
        history[NotificationsFeedRepository.NotifiedIdsIndex] = ids;
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
        var feedIds = history[NotificationsFeedRepository.NotifiedIdsIndex];
        return feedIds;
    };
    //#end region count new coming feed

    // #region read state
    self.IsReadState = function (id) {
        var history = self.GetCurrentUserFeedsHistory();
        var feedIds = history[NotificationsFeedRepository.ReadStateIdsIndex];
        var isRead = jQuery.inArray(id, feedIds) !== -1;
        return isRead;
    };

    self.MarkAsRead = function (id) {
        if (!self.IsReadState(id)) {
            var history = self.GetCurrentUserFeedsHistory();
            history[NotificationsFeedRepository.ReadStateIdsIndex].push(id);
            self.SaveCurrentUserFeedsHistory(history);
        }
    };
    // #end region read state

    //#region per user
    self.GetCurrentUserFeedsHistory = function () {
        var storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
        var result = storage.users[encodeURIComponent(NotificationsFeedRepository.UserId)];
        return result;
    };
    self.SaveCurrentUserFeedsHistory = function (userFeedsHistory) {
        var storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
        storage.users[encodeURIComponent(NotificationsFeedRepository.UserId)] = userFeedsHistory;
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

    NotificationsFeedRepository.Init();
}
NotificationsFeedRepository.StorageKey = 'notifications_feed';
NotificationsFeedRepository.NotifiedIdsIndex = 'notified_ids';
NotificationsFeedRepository.ReadStateIdsIndex = 'read_state_ids';
NotificationsFeedRepository.UserId = '';
NotificationsFeedRepository.Init = function () {
    var storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
    if (!storage) {
        NotificationsFeedRepository.InstallNewStorage();
        storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
    }
    if (NotificationsFeedRepository.UserId && !storage.users[encodeURIComponent(NotificationsFeedRepository.UserId)]) {
        NotificationsFeedRepository.CreateNewCurrentUserFeedsHistory(storage);
    }
};
NotificationsFeedRepository.InstallNewStorage = function () {
    var storage = {
        contents: {},
        users: {}
    };
    jQuery.localStorage(NotificationsFeedRepository.StorageKey, storage);
};
NotificationsFeedRepository.CreateNewCurrentUserFeedsHistory = function (storage) {
    storage.users[encodeURIComponent(NotificationsFeedRepository.UserId)] = {};
    var user = storage.users[encodeURIComponent(NotificationsFeedRepository.UserId)];
    user[NotificationsFeedRepository.NotifiedIdsIndex] = [];
    user[NotificationsFeedRepository.ReadStateIdsIndex] = [];
    jQuery.localStorage(NotificationsFeedRepository.StorageKey, storage);
};
