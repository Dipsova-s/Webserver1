/// <reference path="/../SharedDependencies/notificationsfeed.js" />
var NotificationsFeedRepository = {};
NotificationsFeedRepository.StorageKey = NotificationsFeedRepository.StorageKey;

describe("Storage test", function () {
    var key1 = "test1";
    var key2 = "test2";
    var keys = ['classes', 'fields', 'fields_instance', 'field_sources', 'field_domains', key1, key2];

    beforeEach(function () {

        window.storagePrefix = 'sub20_';
        jQuery.each(keys, function (index, key) {
            jQuery.localStorage(key, window.storagePrefix + key);
            jQuery.sessionStorage(key, window.storagePrefix + key);
        });

        window.storagePrefix = 'sub10_';
        jQuery.each(keys, function (index, key) {
            jQuery.localStorage(key, window.storagePrefix + key);
            jQuery.sessionStorage(key, window.storagePrefix + key);
        });
    });

    afterEach(function () {
        localStorage.clear();
        sessionStorage.clear();
    });

    describe("window.getStoragePrefix", function () {

        var tests = [
            { path: '/en/search/searchpage', 'prefix': '_' },
            { path: '/admin/home/index', 'prefix': '_' },
            { path: '/sub10/en/search/searchpage', 'prefix': 'sub10_' },
            { path: '/sub10/admin/home/index', 'prefix': 'sub10_' },
            { path: '/path/sub10/en/search/searchpage', 'prefix': 'pathsub10_' },
            { path: '/path/sub10/admin/home/index', 'prefix': 'pathsub10_' },
            { path: '/path1/path2/sub10/en/search/searchpage', 'prefix': 'path1path2_' }
        ];

        jQuery.each(tests, function (index, test) {
            it("should get prefix '" + test.prefix + "' from path '" + test.path + "'", function () {
                var prefix = window.getStoragePrefix(test.path);
                expect(test.prefix).toBe(prefix);
            });
        });

    });

    describe("jQuery.localStorage", function () {
        jQuery.each(keys, function (index, key) {
            it("should get localStorage from key '" + key + "' of sub10", function () {
                window.storagePrefix = 'sub10_';
                expect(jQuery.localStorage(key)).toBe(window.storagePrefix + key);
            });
        });

        jQuery.each(keys, function (index, key) {
            it("should get localStorage from key '" + key + "' of sub20", function () {
                window.storagePrefix = 'sub20_';
                expect(jQuery.localStorage(key)).toBe(window.storagePrefix + key);
            });
        });

        it("should handle correctly when localStorage reached limitation", function () {

            var text = '', i;
            for (i = 0; i < 1000000; i++)
                text += '0';

            // 5 items should have a value
            expect($.localStorage('classes')).not.toEqual(null);
            expect($.localStorage('fields')).not.toEqual(null);
            expect($.localStorage('fields_instance')).not.toEqual(null);
            expect($.localStorage('field_sources')).not.toEqual(null);
            expect($.localStorage('field_domains')).not.toEqual(null);

            // add another
            for (i = 0; i < 10; i++)
                $.localStorage('test' + i, text);

            // 5 specific keys from sub10 should be removed
            window.storagePrefix = 'sub10_';
            expect($.localStorage('classes')).toEqual(null);
            expect($.localStorage('fields')).toEqual(null);
            expect($.localStorage('fields_instance')).toEqual(null);
            expect($.localStorage('field_sources')).toEqual(null);
            expect($.localStorage('field_domains')).toEqual(null);

            // 5 specific keys from sub20 should be removed
            window.storagePrefix = 'sub20_';
            expect($.localStorage('classes')).toEqual(null);
            expect($.localStorage('fields')).toEqual(null);
            expect($.localStorage('fields_instance')).toEqual(null);
            expect($.localStorage('field_sources')).toEqual(null);
            expect($.localStorage('field_domains')).toEqual(null);

        });
    });

    describe("jQuery.localStorage.removeItem", function () {
        jQuery.each(keys, function (index, key) {
            it("should remove localStorage from key '" + key + "' of sub10 but sub20", function () {
                window.storagePrefix = 'sub10_';
                jQuery.localStorage.removeItem(key);
                expect(jQuery.localStorage(key)).toBe(null);

                window.storagePrefix = 'sub20_';
                expect(jQuery.localStorage(key)).not.toBe(null);
            });
        });
    });

    describe("jQuery.localStorage.removeAll", function () {
        it("should remove all localStorage fromn sub10 but sub20", function () {
            jQuery.localStorage.removeAll();
            jQuery.each(keys, function (index, key) {
                expect(jQuery.localStorage(key)).toBe(null);
            });

            window.storagePrefix = 'sub20_';
            jQuery.each(keys, function (index, key) {
                expect(jQuery.localStorage(key)).not.toBe(null);
            });
        });
    });

    describe("jQuery.localStorage.adjust", function () {
        it("should adjust localStorage if got QuotaExceededError error", function () {
            jQuery.localStorage.adjust();

            window.storagePrefix = 'sub10_';
            jQuery.each(keys, function (index, key) {
                if (key === key1 || key === key2)
                    expect(jQuery.localStorage(key)).not.toBe(null);
                else
                    expect(jQuery.localStorage(key)).toBe(null);
            });

            window.storagePrefix = 'sub20_';
            jQuery.each(keys, function (index, key) {
                if (key === key1 || key === key2)
                    expect(jQuery.localStorage(key)).not.toBe(null);
                else
                    expect(jQuery.localStorage(key)).toBe(null);
            });
        });
    });

    describe("jQuery.sessionStorage", function () {
        it("can get value from Session Storage correctly", function () {
            jQuery.sessionStorage(key1, window.storagePrefix + key1);
            expect(jQuery.sessionStorage(key1)).toBe(window.storagePrefix + key1);
        });
    });

    describe("jQuery.storageWatcher", function () {
        it("remove key from Local Storage, if value is undefined", function () {
            jQuery.storageWatcher(key1, window.storagePrefix + key1);
            jQuery.storageWatcher(key1, undefined);
            expect(jQuery.localStorage(key1)).toBe(null);
        });
    });
});
