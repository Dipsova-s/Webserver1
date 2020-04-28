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

            spyOn(formData, 'hasObject').and.callFake(function () {
                return true;
            });

            spyOn(packages, 'DropdownValuesById').and.returnValues('EA2_800', 'facet_angle');

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
            { name: 'should get export post data with include labels option for selecton', labels: true, labelExpected: true, packageCreationBy: 'Selection' },
            { name: 'should get export post data without include labels option for selection', labels: false, labelExpected: false, packageCreationBy: 'Selection' },
            { name: 'should get export post data with include labels option for url', labels: true, labelExpected: true, packageCreationBy: 'URL' },
            { name: 'should get export post data without include labels option for url', labels: false, labelExpected: false, packageCreationBy: 'URL' }
        ];
        beforeAll(function () {
            var fqParams = {
                fq: 'query'
            }
            spyOn(packages, 'DropdownValuesById').and.callFake(function () {
                return 'model id';
            });
            spyOn(packages, "GetFacetParameters").and.returnValue({});
            spyOn(packages, "GetFacetQueryString").and.returnValue('query');
            spyOn(packages, "GetParametersFromURL").and.returnValue(fqParams);
        });
        
        $.each(tests, function (index, test) {

            it(test.name, function () {
                
                // arrange
                var data = [
                    { name: 'packageCreationBy', value: test.packageCreationBy },
                    { name: 'package_id', value: 'package id' },
                    { name: 'package_name', value: 'package name' },
                    { name: 'package_version', value: 'package version' },
                    { name: 'package_description', value: 'package description' }
                ];
                if (test.labels) {
                    data.push({ name: 'has_label_categories_and_labels', value: true });
                    data.push({ name: 'has_Labels', value: true });
                }
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

    describe(".GetPackageSummary", function () {
        it("should call MC.ajax function", function () {
            spyOn(packages, 'GetPackageSummaryUri').and.returnValue('testUrl');
            spyOn(MC.ajax, 'request');
            packages.GetPackageSummary('itemsId', 'query');
            expect(MC.ajax.request).toHaveBeenCalled();
        });     
    });

    describe(".EnableSubmitButton", function () {
        it("should call removeClass function on passing true", function () {
            spyOn(jQuery.fn, 'removeClass');
            packages.EnableSubmitButton(true);
            expect(jQuery.fn.removeClass).toHaveBeenCalled();
        });
        it("should call addClass function on passing false", function () {
            spyOn(jQuery.fn, 'addClass');
            packages.EnableSubmitButton(false);
            expect(jQuery.fn.addClass).toHaveBeenCalled();
        });
    });

    describe(".CreatejQueryObject", function () {
        it("should return an object", function () {
            var input = "sort=name&dir=asc";
            var expectedResult = {
                sort: "name",
                dir: "asc"
            }
            var actualResult = packages.CreatejQueryObject(input);
            expect(actualResult).toEqual(expectedResult);
        });
    });

    describe(".GetParametersFromURL", function () {
        var tests = [
            { name: 'should get export post data for url with no model specified', url: 'https://test.com/searchpage#/?sort=name&dir=asc&fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_itemtype:(facet_angle%20facet_template)', hasModel: false },
            { name: 'should get export post data for url with model specified', url: 'https://test.com/searchpage#/?sort=name&dir=asc&fq=facetcat_bp:(PM%20QM)%20AND%20facetcat_itemtype:(facet_angle%20facet_template)%20AND%20facetcat_models:(EA2_800)', hasModel: true }
        ];
        var expectedResult = {
            sort: "name",
            dir: "asc",
            fq: "facetcat_bp:(PM QM) AND facetcat_itemtype:(facet_angle facet_template) AND facetcat_models:(EA2_800) AND -facetcat_characteristics:(facet_has_errors)"
        }
        $.each(tests, function (index, test) {
            it(test.name, function () {
                // arrange
                var data = [
                    { name: 'package_export_url', value: test.url }
                ];
                if (!test.hasModel) {
                    spyOn(packages, "DropdownValuesById").and.returnValue("EA2_800");

                }
                spyOn($.fn, "serializeArray").and.returnValue(data);
                
                var actualResult = packages.GetParametersFromURL();
                expect(actualResult).toEqual(expectedResult);
            });
        });
    });

    describe(".CheckPackageURL", function () {
        it("should not check the count of packages", function () {
            spyOn($.fn, "valid").and.returnValue(false);
            spyOn(packages, "PackageUrlError");
            packages.CheckPackageURL();
            expect(packages.PackageUrlError).toHaveBeenCalled();
        });
        it("should check for count of packages if form is valid", function () {
            var expectedResult = {
                sort: "name",
                dir: "asc",
                fq: "facetcat_bp:(PM QM) AND facetcat_itemtype:(facet_angle facet_template) AND facetcat_models:(EA2_800) AND -facetcat_characteristics:(facet_has_errors)"
            }
            var response = {
                TotalPublished: 5,
                TotalPrivate: 0
            }
            spyOn($.fn, "valid").and.returnValue(true);
            spyOn(packages, 'GetPackageSummary').and.returnValue($.when(response));
            spyOn(packages, 'GetParametersFromURL').and.returnValue(expectedResult);
            spyOn(packages, 'CheckSubmitButtonState');
            
            packages.CheckPackageURL();

            expect(packages.GetPackageSummary).toHaveBeenCalled();
            expect(packages.CheckSubmitButtonState).toHaveBeenCalled();
        });
    });
});
