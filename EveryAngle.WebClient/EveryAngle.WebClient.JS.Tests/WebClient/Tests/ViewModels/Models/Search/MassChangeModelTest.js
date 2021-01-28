/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Search/searchmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Search/masschangemodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelLabelCategoryHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/HtmlTemplate/MassChange/masschangelabelshtmltemplate.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemTagHandler.js" />

describe("MassChangeModel", function () {
    var massChangeModel;

    beforeEach(function () {
        massChangeModel = new MassChangeModel();
    });

    describe("when create new instance", function () {

        it("should be defined", function () {
            expect(massChangeModel).toBeDefined();
        });

    });

    describe("when select items from the same model", function () {
        it("should be able to set labels", function () {

            massChangeModel.GetSelectedAnglesModel = function () {
                return ['/models/1'];
            };

            var result = massChangeModel.CanSetLabels();
            expect(result).toEqual(true);
        });

    });

    describe("when select items from different models", function () {
        it("should NOT be able to set labels", function () {
            massChangeModel.GetSelectedAnglesModel = function () {
                return ['/models/1','/models/2'];
            };
            var result = massChangeModel.CanSetLabels();
            expect(result).toEqual(false);
        });

    });

    describe(".LabelTabClick", function () {
        it("Should call GenerateGeneralLabelView when viewType GENERAL", function () {
            var viewType = enumHandlers.LABELVIEWTYPE.GENERAL;
            spyOn(massChangeModel, 'GenerateGeneralLabelView').and.returnValue($.noop);
            var result = massChangeModel.LabelTabClick(viewType);
            expect(result).toBe($.noop);
            expect(massChangeModel.GenerateGeneralLabelView).toHaveBeenCalled();
        });
        it("Should call GenerateTagsLabelView when viewType Tag", function () {
            var viewType = enumHandlers.LABELVIEWTYPE.TAGS;
            spyOn(massChangeModel, 'GenerateTagsLabelView').and.returnValue($.noop);
            var result = massChangeModel.LabelTabClick(viewType);
            expect(result).toBe($.noop);
            expect(massChangeModel.GenerateTagsLabelView).toHaveBeenCalled();
        });
        it("Should call GenerateAddRemoveLabelView for other viewType", function () {
            var viewType = enumHandlers.LABELVIEWTYPE.BP;
            spyOn(massChangeModel, 'GenerateAddRemoveLabelView').and.returnValue($.noop);
            var result = massChangeModel.LabelTabClick(viewType);
            expect(result).toBe($.noop);
            expect(massChangeModel.GenerateAddRemoveLabelView).toHaveBeenCalled();
        });
    });
    describe(".GenerateGeneralLabelView", function () {
        beforeEach(function () {
            element = $('<div id="Labels-PlaceHolder"></div>').appendTo('body');
        });
        afterEach(function () {
            element.remove();
        });
        it("General tab selected value by default should be undefined", function () {
            //call
            massChangeModel.GenerateGeneralLabelView();

            //assert
            expect(massChangeModel.GeneralCategories[0].Category.name).toBe('Status');
            $.each(massChangeModel.GeneralCategories[0].Labels, function (_index, value) {
                expect($("input[name='" + value.name + "']:checked").val()).toBe('undefined');
            });
        });
        it("General tab selected value should be equal to expected", function () {
            var data = {
                Category: {
                    name: 'Status',
                    id: 'Status'
                },
                Labels: [{
                    name: Localization.MassChangeStarred,
                    id: massChangeModel.MASSNAME.STARRED,
                    IsChecked: ko.observable('true')
                },
                {
                    name: Localization.MassChangePublished,
                    id: massChangeModel.MASSNAME.PUBLISHED,
                    IsChecked: ko.observable('false')
                },
                {
                    name: Localization.MassChangeValidated,
                    id: massChangeModel.MASSNAME.VALIDATED,
                    IsChecked: ko.observable('true')
                },
                {
                    name: Localization.MassChangeTemplate,
                    id: massChangeModel.MASSNAME.TEMPLATE,
                    IsChecked: ko.observable('undefined')
                }]
            };
            massChangeModel.GeneralCategories.push(data);
            massChangeModel.GenerateGeneralLabelView();
            expect(massChangeModel.GeneralCategories[0].Category.name).toBe('Status');
            $.each(data.Labels, function (_index, value) {
                expect($("input[name='" + value.name + "']:checked").val()).toBe(value.IsChecked());
            });
        });
        it("IsChecked value should updated properly when switch between Yes and Leave unchanged radio button", function () {
            //call
            massChangeModel.GenerateGeneralLabelView();
            $("input[name=Starred][value='true']").prop("checked", true);
            $("input[name=Starred][value='undefined']").prop("checked", true);

            //assert
            expect(massChangeModel.GeneralCategories[0].Category.name).toBe('Status');
            $.each(massChangeModel.GeneralCategories[0].Labels, function (_index, value) {
                expect($("input[name='" + value.name + "']:checked").val()).toBe(value.IsChecked());
            });
        });
    });

    describe(".GenerateTagsLabelView", function () {
        var data = {
            Category: {
                name: 'Tags',
                id: 'Tags'
            },
            Labels: [{
                name: 'Demo',
                id: 'Demo',
                IsChecked: ko.observable('true'),
                Show: ko.observable(true)
            },
            {
                name: 'Test',
                id: 'Test',
                IsChecked: ko.observable('false'),
                Show: ko.observable(true)
            }]
        };
        beforeEach(function () {
            element = $('<div id="Labels-PlaceHolder"></div>').appendTo('body');
        });
        afterEach(function () {
            element.remove();
        });
        it("Angle Tag tab selected value should be equal to expected", function () {
            massChangeModel.TagCategories.push(data);
            massChangeModel.GenerateTagsLabelView();
            $.each(data.Labels, function (_index, value) {
                expect($("input[name='" + value.name + "']:checked").val()).toBe(value.IsChecked());
            });
        });
    });
    describe(".generateReportAndAssignLabel", function () {
        it("Should return expected report", function () {
            Localization.MassChangeStatusAddTag = 'Add tag "{0}"';
            Localization.MassChangeStatusRemoveTag ='Remove tag "{0}"'
            var data = [{
                Category: {
                    name: 'Tags',
                    id: 'Tags'
                },
                Labels: [{
                    name: 'Demo',
                    id: 'Demo',
                    IsChecked: ko.observable('true'),
                    Show: ko.observable(true),
                    IsRequire: true
                },
                {
                    name: 'Test',
                    id: 'Test',
                    IsChecked: ko.observable('false'),
                    Show: ko.observable(true),
                    IsRequire: true
                }]
            }];
            var result = massChangeModel.generateReportAndAssignLabel(data);
            expect(result.Report['Demo'].text).toBe('Add tag "Demo"');
            expect(result.Report['Test'].text).toBe('Remove tag "Test"');
            expect(result.AssignLabels)
        });
    });

    describe(".AddOrRemoveTag", function () {
        it("Should return report with add and remove tag message", function () {
            Localization.MassChangeStatusAddTag = 'Add tag "{0}"';
            Localization.MassChangeStatusRemoveTag = 'Remove tag "{0}"'
            var data = [{
                Category: {
                    name: 'Tags',
                    id: 'Tags'
                },
                Labels: [{
                    name: 'Demo',
                    id: 'Demo',
                    IsChecked: ko.observable('true'),
                    Show: ko.observable(true),
                    IsRequire: true
                },
                {
                    name: 'Test',
                    id: 'Test',
                    IsChecked: ko.observable('false'),
                    Show: ko.observable(true),
                    IsRequire: true
                }]
            }];
            massChangeModel.TagCategories = data;
            var labelDeferred = [];
            var reports = {
                header: {
                    cancelled: false,
                    total: 0,
                    count: 0
                }
            };
            spyOn(Array.prototype, 'pushDeferred');
            massChangeModel.Angles = [{
                assigned_tags: ['Test']
            }];
            massChangeModel.AddOrRemoveTag(reports, labelDeferred);
            expect(reports['Demo'].text).toBe('Add tag "Demo"');
            expect(reports['Test'].text).toBe('Remove tag "Test"');
        });
    });

    describe(".PropertyStatus", function () {
        it("should return status and value of the property", function () {
            //prepare
            var data = {
                Category: {
                    name: 'Status',
                    id: 'Status'
                },
                Labels: [{
                    name: Localization.MassChangeStarred,
                    id: massChangeModel.MASSNAME.STARRED,
                    IsChecked: ko.observable('true')
                },
                {
                    name: Localization.MassChangePublished,
                    id: massChangeModel.MASSNAME.PUBLISHED,
                    IsChecked: ko.observable('false')
                },
                {
                    name: Localization.MassChangeValidated,
                    id: massChangeModel.MASSNAME.VALIDATED,
                    IsChecked: ko.observable('true')
                },
                {
                    name: Localization.MassChangeTemplate,
                    id: massChangeModel.MASSNAME.TEMPLATE,
                    IsChecked: ko.observable('undefined')
                }]
            };
            massChangeModel.GeneralCategories.push(data);

            $.each(data.Labels, function (_index, label) {
                //call
                var result = massChangeModel.PropertyStatus(label.id);

                //assert
                expect(result.changed).toBe(label.IsChecked() !== 'undefined');
                expect(result.value).toBe(label.IsChecked());
            });            
        });
    });

    describe(".GenerateAddRemoveLabelView", function () {
        var data = {
            Category: {
                name: 'Business Process',
                id: 'BP',
                uri: '/test/'
            },
            Labels: [{
                name: "Supply to Demand",
                id: "S2D",
                IsChecked: ko.observable('true')
            },
            {
                name: "Purchase to Pay",
                id: "P2P",
                IsChecked: ko.observable('false')
            }]
        };
        beforeEach(function () {
            element = $('<div id="Labels-PlaceHolder"></div>').appendTo('body');
        });
        afterEach(function () {
            element.remove();
        });
        it("Label View selected value should be equal to expected", function () {
            //prepare
            spyOn(massChangeModel, 'CanSetLabels').and.returnValue(true);
            spyOn(modelLabelCategoryHandler, 'GetLabelsByCategoryUri').and.returnValue(data.Labels);
            massChangeModel.modelData = { uri: '//' }
            spyOn(modelLabelCategoryHandler, "GetLabelCategoriesByModelAndViewType").and.returnValue(data.Category);;

            //call
            massChangeModel.GenerateAddRemoveLabelView('business_process');

            //assert
            $.each(massChangeModel.BPCategories[0].Labels, function (_index, value) {
                expect($("input[name='" + value.name + "']:checked").val()).toBe(value.IsChecked());
            });
        });

        it("IsChecked value should updated properly when switch between Yes and Leave unchanged radio button", function () {
            //prepare
            spyOn(massChangeModel, 'CanSetLabels').and.returnValue(true);
            spyOn(modelLabelCategoryHandler, 'GetLabelsByCategoryUri').and.returnValue(data.Labels);
            massChangeModel.modelData = { uri: '//' }
            spyOn(modelLabelCategoryHandler, "GetLabelCategoriesByModelAndViewType").and.returnValue(data.Category);

            //call
            massChangeModel.GenerateAddRemoveLabelView('business_process');
            $("input[name='Supply to Demand'][value='true']").prop("checked", true);
            $("input[name='Supply to Demand'][value='undefined']").prop("checked", true);

            //assert
            $.each(massChangeModel.BPCategories[0].Labels, function (_index, value) {
                expect($("input[name='" + value.name + "']:checked").val()).toBe(value.IsChecked());
            });
        });
        it("'Note: To add/remove labels, only select Angle(s) from the same model' message should shown when we have multi model", function () {
            //arrange
            spyOn(massChangeModel, 'CanSetLabels').and.returnValue(false);

            //call
            massChangeModel.GenerateAddRemoveLabelView('business_process');

            //assert
            expect($('.infoText').text()).toBe('Note: To add/remove labels, only select Angle(s) from the same model.');
        });
    });
    describe(".IsGeneralLabel", function () {
        var element;
        afterEach(function () {
            element.remove();
        });
        it("Should return true ", function () {
            element = $('<div id="GeneralLabel" class="active""></div>').appendTo('body');
            var result = massChangeModel.IsGeneralLabel();
            expect(result).toBe(true);
        });
        it("Should return false ", function () {
            element = $('<div id="GeneralLabel" class="""></div>').appendTo('body');
            var result = massChangeModel.IsGeneralLabel();
            expect(result).toBe(false);
        });
    });
});
