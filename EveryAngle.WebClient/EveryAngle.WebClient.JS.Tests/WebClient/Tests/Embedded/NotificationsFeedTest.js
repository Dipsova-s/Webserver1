/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewManagement/User/UserSettingView.js" />
/// <reference path="/../SharedDependencies/notificationsfeed.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/NotificationsFeedHandler.js" />

describe("NotificationsFeed", function () {

    var notificationsFeedHandler;
    var notificationsFeedModel;
    var notificationsFeedRepository;

    var mockWellResponse = [
        {
            id: 1,
            title: { rendered: 'hero' },
            excerpt: { rendered: 'hero hero' },
            link: 'https://www.manaosoftware.com',
            date_gmt: '2019-03-05T13:54:12'
        }
    ];

    beforeEach(function () {
        var userId = 'localhost\HeroJa';
        var toggleMenuFunction = function () { };

        NotificationsFeedRepository.UserId = userId;
        notificationsFeedRepository = new NotificationsFeedRepository();

        notificationsFeedModel = new WCNotificationsFeedModel(
            notificationsFeedRepository,
            toggleMenuFunction
        );

        notificationsFeedHandler = new NotificationsFeedHandler(notificationsFeedModel);
    });

    describe("NotificationsFeedHandler", function () {
        beforeEach(function () {
            spyOn(notificationsFeedHandler, 'RequestFeedsHandling').and.callFake(jQuery.noop);
            spyOn(notificationsFeedHandler, 'ShowTopMenuIcon').and.callFake(jQuery.noop);
            spyOn(notificationsFeedHandler, 'CleanUpElements').and.callFake(jQuery.noop);
        });

        it(".LoadFeeds (force rendering)", function () {
            notificationsFeedHandler.LoadFeeds(true);
            expect(notificationsFeedHandler.ShowTopMenuIcon).toHaveBeenCalled();
            expect(notificationsFeedHandler.RequestFeedsHandling).toHaveBeenCalled();
        });

        it(".LoadFeeds (without force rendering)", function () {
            notificationsFeedHandler.LoadFeeds(false);
            expect(notificationsFeedHandler.CleanUpElements).toHaveBeenCalled();
            expect(notificationsFeedHandler.RequestFeedsHandling).toHaveBeenCalled();
        });

        it(".LoadFeeds (track the number of times it was called)", function () {
            notificationsFeedHandler.LoadFeeds(true);
            notificationsFeedHandler.LoadFeeds(false);
            notificationsFeedHandler.LoadFeeds(true);
            notificationsFeedHandler.LoadFeeds(false);
            notificationsFeedHandler.LoadFeeds(true);
            notificationsFeedHandler.LoadFeeds(false);

            expect(notificationsFeedHandler.RequestFeedsHandling.calls.count()).toEqual(1);
        });

    });

    describe("WCNotificationsFeedModel", function () {

        describe("Online scenario", function () {
            beforeEach(function () {
                notificationsFeedModel.SetDataFeeds(mockWellResponse);
            });

            
            it(".GetFeedsHistory", function () {
                var feeds = notificationsFeedModel.GetFeedsHistory();
                expect(feeds.length).toEqual(1);
            });

            it(".ViewModel.NumberOfNotify", function () {
                expect(notificationsFeedModel.ViewModel.NumberOfNotify()).toEqual(1);
            });

            it(".ViewModel.Feeds", function () {
                expect(notificationsFeedModel.ViewModel.Feeds().length).toEqual(1);
            });

        });

        describe("Offline scenario", function () {
            beforeEach(function () {
                var feedHistory = [
                    {
                        id: 1,
                        title: 'hero',
                        content: 'hero hero',
                        url: 'https://www.manaosoftware.com',
                        createDate: 1552275763
                    }
                ];

                notificationsFeedModel.SetOfflineDataFeeds(feedHistory);
            });

            it(".ViewModel.NumberOfNotify", function () {
                expect(notificationsFeedModel.ViewModel.NumberOfNotify()).toEqual(1);
            });

            it(".ViewModel.Feeds", function () {
                expect(notificationsFeedModel.ViewModel.Feeds().length).toEqual(1);
            });

        });

        describe("MarkAsRead scenario", function () {
            beforeEach(function () {
                notificationsFeedModel.SetDataFeeds(mockWellResponse);
            });

            it(".MarkAsRead", function () {
                var watchFeed = notificationsFeedModel.ViewModel.Feeds()[0];

                expect(watchFeed.isUnReadState()).toBe(true);
                expect(watchFeed.isNewState()).toBe(true);

                notificationsFeedModel.MarkAsRead(1);

                expect(watchFeed.isUnReadState()).toBe(false);
                expect(watchFeed.isNewState()).toBe(false);
            });
            
        });

        it(".SetDataViewAllUrl", function () {
            notificationsFeedModel.SetDataViewAllUrl('hero');

            expect(notificationsFeedModel.ViewModel.ViewAllUrl()).toEqual('hero');

            notificationsFeedModel.SetDataViewAllUrl(null);

            expect(notificationsFeedModel.ViewModel.ViewAllUrl()).toEqual('hero');
        });


        it(".MapFeedsView", function () {
            var mockNotWellResponse = [
                {
                    id: 1,
                    title: { rendered: 'hero' },
                    pokemon: 'pikachu'
                }
            ];

            expect(function () {
                notificationsFeedModel.MapFeedsView(mockNotWellResponse);
            }).not.toThrow();
        });

        it(".ToggleNotificationsMenu", function () {
            spyOn(notificationsFeedModel, 'MarkAndUpdateAllAsNotified');
            spyOn(notificationsFeedModel, 'DisplayRadialClickedEffect').and.callFake(jQuery.noop);
            notificationsFeedModel.ToggleNotificationsMenu();
            expect(notificationsFeedModel.MarkAndUpdateAllAsNotified).toHaveBeenCalled();
        });

    });

    describe("NotificationsFeedRepository", function () {

        beforeEach(function () {
            var userHistory = notificationsFeedRepository.GetCurrentUserFeedsHistory();
            userHistory[notificationsFeedRepository.NotifiedIdsIndex] = [];
            userHistory[notificationsFeedRepository.ReadStateIdsIndex] = [];
            notificationsFeedRepository.SaveCurrentUserFeedsHistory(userHistory);
        });

        it(".init", function () {
            var storage = jQuery.localStorage(NotificationsFeedRepository.StorageKey);
            expect(storage.users['localhostHeroJa']).not.toBe(null);
        });

        it(".GetFeeds, .SaveFeeds", function () {
            var contents = notificationsFeedRepository.GetFeeds();

            contents = {};
            contents['1111'] = { test: 'abc' };

            notificationsFeedRepository.SaveFeeds(contents);
            var contentsUpdated = notificationsFeedRepository.GetFeeds();

            expect(contentsUpdated['1111']).not.toBe(null);
        });

        it(".MarkAsNotified, .CountNumberOfNotify", function () {
            notificationsFeedRepository.MarkAsNotified(['1', '2']);

            var count = notificationsFeedRepository.CountNumberOfNotify(['1', '3', '2']);

            expect(count).toBe(1);
        });

        it(".IsReadState, .MarkAsRead", function () {
            var isRead = notificationsFeedRepository.IsReadState('1');

            expect(isRead).toBe(false);

            notificationsFeedRepository.MarkAsRead('1');

            isRead = notificationsFeedRepository.IsReadState('1');

            expect(isRead).toBe(true);
        });

    });
    

});
