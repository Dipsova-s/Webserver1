/// <reference path="/Dependencies/page/MC.GlobalSettings.Packages.js" />

describe("MC.GlobalSettings.Packages", function () {

    var packages;

    beforeEach(function () {
        packages = MC.GlobalSettings.Packages;
    });

    describe(".InitExportPostData()", function () {
        it("verify export post data", function () {
            // arrange
            var expectedResult = {
                modelId: '',
                packageId: '',
                packageName: '',
                packageVersion: '',
                packageDescription: '',
                facetQuery: '',
                includeLabels: true
            };

            // act
            var actualResult = packages.InitExportPostData();

            // assert
            expect(expectedResult).toEqual(actualResult);
        });
    });

    describe(".GetFacetParameters(formData)", function () {
        it("verify facet parameters", function () {
            // arrange
            var formData = {
                findObject: $.noop,
                hasObject: $.noop
            };

            var expectedResult = {
                modelId: 'EA2_800',
                itemType: 'facet_angle',
                includePrivate: true,
                includePublished: true,
                includeValidated: true
            };

            spyOn(formData, 'findObject').and.callFake(function () {
                return {
                    value: 'EA2_800'
                };
            });

            spyOn(formData, 'hasObject').and.callFake(function () {
                return true;
            });

            spyOn($.fn, 'data').and.callFake(function () {
                return {
                    value: function () {
                        return 'facet_angle';
                    }
                };
            });

            // act
            var actualResult = packages.GetFacetParameters(formData);

            // assert
            expect(expectedResult).toEqual(actualResult);
        });
    });

    describe(".GetFacetQueryString(facetParameter)", function () {
        // arrange
        var tests = [{
            name: 'all items',
            expectedResult: 'facetcat_itemtype:(facet_angle) AND facetcat_models:(EA2_800)',
            parameters: {
                modelId: 'EA2_800',
                itemType: 'facet_angle',
                includePrivate: true,
                includePublished: true,
                includeValidated: true
            }
        }, {
            name: 'all without private item',
            expectedResult: 'facetcat_itemtype:(facet_angle) AND facetcat_models:(EA2_800) AND (facetcat_characteristics:(facet_isvalidated) -facetcat_characteristics:(facet_isprivate))',
            parameters: {
                modelId: 'EA2_800',
                itemType: 'facet_angle',
                includePrivate: false,
                includePublished: true,
                includeValidated: true
            }
        }, {
            name: 'all without validated item',
            expectedResult: 'facetcat_itemtype:(facet_angle) AND facetcat_models:(EA2_800) AND -facetcat_characteristics:(facet_isvalidated)',
            parameters: {
                modelId: 'EA2_800',
                itemType: 'facet_angle',
                includePrivate: true,
                includePublished: true,
                includeValidated: false
            }
        }, {
            name: 'only private item',
            expectedResult: 'facetcat_itemtype:(facet_angle) AND facetcat_models:(EA2_800) AND (facetcat_characteristics:(facet_isprivate) AND -facetcat_characteristics:(facet_isvalidated))',
            parameters: {
                modelId: 'EA2_800',
                itemType: 'facet_angle',
                includePrivate: true,
                includePublished: false,
                includeValidated: false
            }
        }, {
            name: 'only published item',
            expectedResult: 'facetcat_itemtype:(facet_angle) AND facetcat_models:(EA2_800) AND -facetcat_characteristics:(facet_isprivate facet_isvalidated)',
            parameters: {
                modelId: 'EA2_800',
                itemType: 'facet_angle',
                includePrivate: false,
                includePublished: true,
                includeValidated: false
            }
        }, {
            name: 'only validated item',
            expectedResult: 'facetcat_itemtype:(facet_angle) AND facetcat_models:(EA2_800) AND (facetcat_characteristics:(facet_isprivate facet_isvalidated) AND -facetcat_characteristics:(facet_isprivate))',
            parameters: {
                modelId: 'EA2_800',
                itemType: 'facet_angle',
                includePrivate: false,
                includePublished: false,
                includeValidated: true
            }
        }];

        $.each(tests, function (index, test) {
            it("should get facet query when select " + test.name, function () {
                // act
                var actualResult = packages.GetFacetQueryString(test.parameters);

                // assert
                expect(test.expectedResult).toEqual(actualResult);
            });
        });
    });

    describe(".HasItems(itemSummaries)", function () {
        // arrange
        var tests = [{
            expectedResult: false,
            parameters: {
                TotalPrivate: 0,
                TotalPublished: 0,
                TotalValidated: 0
            }
        }, {
            expectedResult: true,
            parameters: {
                TotalPrivate: 1,
                TotalPublished: 2,
                TotalValidated: 3
            }
        }];

        $.each(tests, function (index, test) {
            it("disable state on submit button should be " + test.expectedResult + " when it has " + (test.expectedResult ? "no" : "") + " item", function () {
                // act
                var actualResult = packages.HasItems(test.parameters);

                // assert
                expect(test.expectedResult).toEqual(actualResult);
            });
        });
    });

    describe(".GetExportPostData()", function () {

        var tests = [
            { name: 'should get export post data with include labels option', labels: true, labelExpected: true },
            { name: 'should get export post data without include labels option', labels: false, labelExpected: false }
        ];

        $.each(tests, function (index, test) {

            it(test.name, function () {
                // arrange
                var data = [
                    { name: 'model_id', value: 'model id' },
                    { name: 'package_id', value: 'package id' },
                    { name: 'package_name', value: 'package name' },
                    { name: 'package_version', value: 'package version' },
                    { name: 'package_description', value: 'package description' }
                ];
                if (test.labels) {
                    data.push({ name: 'has_label_categories_and_labels', value: true });
                }

                spyOn(packages, "GetFacetParameters").and.returnValue({});
                spyOn(packages, "GetFacetQueryString").and.returnValue('query');
                spyOn($.fn, "serializeArray").and.returnValue(data);

                // act
                var actualResult = packages.GetExportPostData();

                // assert
                expect('package version').toEqual(actualResult.packageVersion);
                expect('package name').toEqual(actualResult.packageName);
                expect('package id').toEqual(actualResult.packageId);
                expect('package description').toEqual(actualResult.packageDescription);
                expect('model id').toEqual(actualResult.modelId);
                expect(test.labelExpected).toEqual(actualResult.includeLabels);
                expect('query').toEqual(actualResult.facetQuery);
            });

        });

    });

});
