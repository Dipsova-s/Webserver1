/// <reference path="/Dependencies/page/MC.Models.Packages.js" />

describe("MC.Models.Packages.js", function () {

    describe("MC.Models.Packages", function () {

        it("should be defined", function () {
            expect(MC.Models.Packages).toBeDefined();
        });

    });

    describe("MC.Models.Packages.GetPackageButtonsTemplate", function () {

        it("should no error", function () {

            // prepare
            var data = {};
            var enable = true;
            spyOn(MC.Models.Packages, 'GetPackageActionHtmlAttributes').and.callFake($.noop);
            spyOn(MC.Models.Packages, 'GetPackageDownloadHtmlAttributes').and.callFake($.noop);
            spyOn(MC.Models.Packages, 'GetPackageButtonHtml').and.callFake(function () { return ''; });

            var template = MC.Models.Packages.GetPackageButtonsTemplate(data, enable);

            // assert
            expect(MC.Models.Packages.GetPackageActionHtmlAttributes).toHaveBeenCalled();
            expect(MC.Models.Packages.GetPackageDownloadHtmlAttributes).toHaveBeenCalled();
            expect(MC.Models.Packages.GetPackageButtonHtml).toHaveBeenCalled();
            expect('').toEqual(template);
        });

    });

    describe("MC.Models.Packages.GetPackageActionHtmlAttributes", function () {

        beforeEach(function () {
            MC.Models.Packages.ManagePackageUri = 'url1';
            MC.Models.Packages.ModelId = 'model1';
        });

        it("should get correct attributes for IsActivatingPackage state", function () {

            // prepare
            spyOn(MC.Models.Packages, 'IsActivatingPackage').and.callFake(function () { return true; });

            // act
            var attributes = MC.Models.Packages.GetPackageActionHtmlAttributes({}, true);

            // assert
            expect(attributes['class']).toEqual('btn btnSetInactive disabled');
            expect(attributes.text).toEqual(Localization.Activate);

        });

        it("should get correct attributes for IsDeactivatingPackage state", function () {

            // prepare
            spyOn(MC.Models.Packages, 'IsActivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'IsDeactivatingPackage').and.callFake(function () { return true; });

            // act
            var attributes = MC.Models.Packages.GetPackageActionHtmlAttributes({}, true);

            // assert
            expect(attributes['class']).toEqual('btn btnSetActive disabled');
            expect(attributes.text).toEqual(Localization.Deactivate);

        });

        it("should get correct attributes if CanDeactivatePackage and enable", function () {

            // prepare
            spyOn(MC.Models.Packages, 'IsActivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'IsDeactivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanDeactivatePackage').and.callFake(function () { return true; });

            // act
            var attributes = MC.Models.Packages.GetPackageActionHtmlAttributes({}, true);

            // assert
            expect(attributes['class']).toEqual('btn btnSetInactive');
            expect(attributes.text).toEqual(Localization.Deactivate);
            expect(attributes.href).toBeDefined();
            expect(attributes.onclick).toBeDefined();
            expect(attributes['data-parameters']).toBeDefined();
            expect(attributes['data-delete-template']).toEqual(Localization.MC_ConfirmDeactivatePackage);

        });

        it("should get correct attributes if CanDeactivatePackage and disable", function () {

            // prepare
            spyOn(MC.Models.Packages, 'IsActivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'IsDeactivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanDeactivatePackage').and.callFake(function () { return true; });

            // act
            var attributes = MC.Models.Packages.GetPackageActionHtmlAttributes({}, false);

            // assert
            expect(attributes['class']).toEqual('btn btnSetInactive disabled');
            expect(attributes.text).toEqual(Localization.Deactivate);
            expect(attributes.href).not.toBeDefined();
            expect(attributes.onclick).not.toBeDefined();
            expect(attributes['data-parameters']).not.toBeDefined();
            expect(attributes['data-delete-template']).not.toBeDefined();

        });

        it("should get correct attributes if CanUpdatePackage and enable", function () {

            // prepare
            spyOn(MC.Models.Packages, 'IsActivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'IsDeactivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanDeactivatePackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanUpdatePackage').and.callFake(function () { return true; });

            // act
            var attributes = MC.Models.Packages.GetPackageActionHtmlAttributes({}, true);

            // assert
            expect(attributes['class']).toEqual('btn btnSetActive');
            expect(attributes.text).toEqual(Localization.Update);
            expect(attributes.href).toBeDefined();
            expect(attributes.onclick).toBeDefined();
            expect(attributes['data-parameters']).toBeDefined();
            expect(attributes['data-delete-template']).toEqual(Localization.MC_ConfirmUpdatePackage);

        });

        it("should get correct attributes if CanUpdatePackage and disable", function () {

            // prepare
            spyOn(MC.Models.Packages, 'IsActivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'IsDeactivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanDeactivatePackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanUpdatePackage').and.callFake(function () { return true; });

            // act
            var attributes = MC.Models.Packages.GetPackageActionHtmlAttributes({}, false);

            // assert
            expect(attributes['class']).toEqual('btn btnSetActive disabled');
            expect(attributes.text).toEqual(Localization.Update);
            expect(attributes.href).not.toBeDefined();
            expect(attributes.onclick).not.toBeDefined();
            expect(attributes['data-parameters']).not.toBeDefined();
            expect(attributes['data-delete-template']).not.toBeDefined();

        });

        it("should get correct attributes if CanActivatePackage and enable", function () {

            // prepare
            spyOn(MC.Models.Packages, 'IsActivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'IsDeactivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanDeactivatePackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanUpdatePackage').and.callFake(function () { return false; });

            // act
            var attributes = MC.Models.Packages.GetPackageActionHtmlAttributes({}, true);

            // assert
            expect(attributes['class']).toEqual('btn btnSetActive');
            expect(attributes.text).toEqual(Localization.Activate);
            expect(attributes.href).toBeDefined();
            expect(attributes.onclick).toBeDefined();
            expect(attributes['data-parameters']).toBeDefined();
            expect(attributes['data-delete-template']).toEqual(Localization.MC_ConfirmActivatePackage);

        });

        it("should get correct attributes if CanActivatePackage and disable", function () {

            // prepare
            spyOn(MC.Models.Packages, 'IsActivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'IsDeactivatingPackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanDeactivatePackage').and.callFake(function () { return false; });
            spyOn(MC.Models.Packages, 'CanUpdatePackage').and.callFake(function () { return false; });

            // act
            var attributes = MC.Models.Packages.GetPackageActionHtmlAttributes({}, false);

            // assert
            expect(attributes['class']).toEqual('btn btnSetActive disabled');
            expect(attributes.text).toEqual(Localization.Activate);
            expect(attributes.href).not.toBeDefined();
            expect(attributes.onclick).not.toBeDefined();
            expect(attributes['data-parameters']).not.toBeDefined();
            expect(attributes['data-delete-template']).not.toBeDefined();

        });

    });

    describe("MC.Models.Packages.GetPackageDownloadHtmlAttributes", function () {

        beforeEach(function () {
            MC.Models.Packages.DownloadPackageUri = 'url1';
        });

        it("should get correct attributes for enable download state", function () {

            // prepare
            spyOn(MC.Models.Packages, 'CanDownloadPackage').and.callFake(function () { return true; });

            // act
            var attributes = MC.Models.Packages.GetPackageDownloadHtmlAttributes({}, true);

            // assert
            expect(attributes['class']).toEqual('btn btnDownload');
            expect(attributes.text).toEqual(Localization.Download);
            expect(attributes.href).toBeDefined();
            expect(attributes.onclick).toBeDefined();

        });

        it("should get correct attributes for disable download state", function () {

            // prepare
            spyOn(MC.Models.Packages, 'CanDownloadPackage').and.callFake(function () { return false; });

            // act
            var attributes = MC.Models.Packages.GetPackageDownloadHtmlAttributes({}, false);

            // assert
            expect(attributes['class']).toEqual('btn btnDownload disabled');
            expect(attributes.text).toEqual(Localization.Download);
            expect(attributes.href).not.toBeDefined();
            expect(attributes.onclick).not.toBeDefined();

        });

    });

    describe("MC.Models.Packages.GetPackageButtonHtml", function () {

        it("should create button html by attributes", function () {

            // prepare
            var attributes = {
                text: 'test',
                href: 'url',
                'class': 'class'
            };

            var template = MC.Models.Packages.GetPackageButtonHtml(attributes);

            // assert
            expect('<a href=\'url\' class=\'class\'>test</a>').toEqual(template);
        });

    });

    describe("MC.Models.Packages.IsActivatingPackage", function () {

        var tests = [
            {
                status: 'Activating',
                expected: true
            },
            {
                status: 'xxx',
                expected: false
            }
        ];

        $.each(tests, function (index, test) {

            it("should " + test.expected + " for status " + test.status, function () {

                // prepare
                var result = MC.Models.Packages.IsActivatingPackage(test.status);

                // assert
                expect(test.expected).toEqual(result);
            });

        });

    });

    describe("MC.Models.Packages.IsDeactivatingPackage", function () {

        var tests = [
            {
                status: 'Deactivating',
                expected: true
            },
            {
                status: 'xxx',
                expected: false
            }
        ];

        $.each(tests, function (index, test) {

            it("should " + test.expected + " for status " + test.status, function () {

                // prepare
                var result = MC.Models.Packages.IsDeactivatingPackage(test.status);

                // assert
                expect(test.expected).toEqual(result);
            });

        });

    });

    describe("MC.Models.Packages.CanDeactivatePackage", function () {

        var tests = [
            {
                active: true,
                active_version: 1,
                Version: 1,
                expected: true
            },
            {
                active: false,
                active_version: 1,
                Version: 1,
                expected: false
            },
            {
                active: true,
                active_version: 1,
                Version: 0,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {

            it("should " + test.expected + " if active=" + test.active + ", active_version=" + test.active_version + ", Version=" + test.Version, function () {

                // prepare
                var data = {
                    active: test.active,
                    active_version: test.active_version,
                    Version: test.Version
                };
                var result = MC.Models.Packages.CanDeactivatePackage(data);

                // assert
                expect(test.expected).toEqual(result);
            });

        });

    });

    describe("MC.Models.Packages.CanUpdatePackage", function () {

        var tests = [
            {
                active: false,
                active_version: 1,
                Version: 2,
                expected: true
            },
            {
                active: true,
                active_version: 1,
                Version: 2,
                expected: false
            },
            {
                active: false,
                active_version: null,
                Version: null,
                expected: false
            },
            {
                active: false,
                active_version: 1,
                Version: 1,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {

            it("should " + test.expected + " if active=" + test.active + ", active_version=" + test.active_version + ", Version=" + test.Version, function () {

                // prepare
                var data = {
                    active: test.active,
                    active_version: test.active_version,
                    Version: test.Version
                };
                var result = MC.Models.Packages.CanUpdatePackage(data);

                // assert
                expect(test.expected).toEqual(result);
            });

        });

    });

    describe("MC.Models.Packages.CanDownloadPackage", function () {

        var tests = [
            {
                enable: true,
                touch: false,
                safari: true,
                expected: true
            },
            {
                enable: true,
                touch: true,
                safari: false,
                expected: true
            },
            {
                enable: true,
                touch: true,
                safari: true,
                expected: false
            },
            {
                enable: false,
                touch: false,
                safari: true,
                expected: false
            }
        ];

        $.each(tests, function (index, test) {

            it("should " + test.expected + " if enable=" + test.enable + ", touch=" + test.touch + ", safari=" + test.safari, function () {
                // keep default value
                var defaultTouch = Modernizr.touch;
                var defaultSafari = $.browser.safari;

                // prepare
                Modernizr.touch = test.touch;
                $.browser.safari = test.safari;
                var result = MC.Models.Packages.CanDownloadPackage(test.enable);

                // restore default value
                Modernizr.touch = defaultTouch;
                $.browser.safari = defaultSafari;

                // assert
                expect(test.expected).toEqual(result);
            });

        });

    });

    describe("MC.Models.Packages.includeLabelsSelected", function () {

        var tests = [{
            checked: true
        }, {
            checked: false
        }];

        $.each(tests, function (index, test) {
            it("should " + (test.checked ? 'show' : 'hide') + " labelcategories section when include labels is " + (test.checked ? 'selected' : 'unselected'), function () {
                spyOn($.fn, 'addClass').and.callThrough();
                spyOn($.fn, 'removeClass').and.callThrough();

                MC.Models.Packages.includeLabelsSelected(test.checked);

                if (test.checked)
                    expect($.fn.removeClass).toHaveBeenCalled();
                else
                    expect($.fn.addClass).toHaveBeenCalled();
            });
        });

    });
});