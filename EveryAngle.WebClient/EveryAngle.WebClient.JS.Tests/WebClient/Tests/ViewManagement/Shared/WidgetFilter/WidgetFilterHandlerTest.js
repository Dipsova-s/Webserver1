/// <reference path="/Dependencies/Helper/DefaultValueHandler.js" />
/// <reference path="/Dependencies/Helper/HtmlHelper.Tooltip.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/UserFriendlyNameHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFollowupsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/FieldChooserHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ModelFieldSourceHandler.js" />
/// <reference path="/../SharedDependencies/FieldsChooser.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewModels/Shared/QueryBlock/QueryStepModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/resultmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/displaymodel.js" />
/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewManagement/Angles/FieldSettingsHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/HelpTextHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHandler.js" />

describe("WidgetFilterHandler", function () {
    var widgetFilterHandler;

    beforeEach(function () {

        widgetFilterHandler = new WidgetFilterHandler(null, []);

        modelFieldsHandler.GetFieldById = function () {
            return { fieldtype: 'int' };
        };
        modelFieldsHandler.SetFields = function () {
            return {};
        };
        modelFieldsHandler.LoadFieldsMetadata = function () {
            return jQuery.when();
        };
        requestHistoryModel.SaveLastExecute = function () {
            return true;
        };
        popup.Info = function () {
        };
        fieldsChooserHandler.ShowPopup = function () {
        };
        fieldsChooserModel.ClosePopup = function () {
        };
        modelFollowupsHandler.SetFollowups = function () {
        };
        helpTextHandler.ShowHelpTextPopup = function () {
        };
        helpTextHandler.HELPTYPE = {
            CLASS: 'class',
            FIELD: 'field',
            FOLLOWUP: 'followup',
            HELPTEXT: 'helptext'
        };
    });

    describe(".ApplyHandler", function () {
        var handler;
        var container = '<div id="FilterWrapper"></div>';
        var querySteps = [{
            "valid": true,
            "field": "ExecutionStatus",
            "operator": "in_set",
            "arguments": [{
                "argument_type": "value",
                "value": "es0ToBeExecuted"
            }],
            "step_type": "filter"
        }];

        beforeEach(function () {
            handler = new WidgetFilterHandler(container, querySteps);
            handler.View.GetHtmlElementById = function (id) {
                return jQuery('<div />').attr('id', id);
            };
            handler.View.BindingDropdownOperator = $.noop;
            handler.View.BindingAndSortingElementFilter = $.noop;
        });

        it("should apply handler when CanChange is true", function () {
            spyOn(handler, 'CanChange').and.callFake(function () {
                return true;
            });

            var result = handler.ApplyHandler();
            expect(result.length).toBe(1);
        });

        it("should not apply handler when CanChange is false", function () {
            spyOn(handler, 'CanChange').and.callFake(function () {
                return false;
            });

            var result = handler.ApplyHandler();
            expect(result.length).toBe(0);
        });
    });

    describe(".ReApplyHandler", function () {
        var handler;
        var container = '<div id="FilterWrapper"><div class="definitionList"></div></div>';
        var querySteps = [{
            "valid": true,
            "field": "ExecutionStatus",
            "operator": "in_set",
            "arguments": [{
                "argument_type": "value",
                "value": "es0ToBeExecuted"
            }],
            "step_type": "filter"
        }];

        beforeEach(function () {
            handler = new WidgetFilterHandler(container, querySteps);
            handler.View.GetHtmlElementById = function (id) {
                return jQuery('<div />').attr('id', id);
            };
            handler.View.BindingDropdownOperator = $.noop;
            handler.View.BindingAndSortingElementFilter = $.noop;
        });

        it("should re-apply filter steps when CanChange is true", function () {
            spyOn(handler, 'CanChange').and.callFake(function () {
                return true;
            });

            var result = handler.ReApplyHandler();
            expect(result.length).toBe(1);
        });

        it("should not re-apply filter steps when CanChange is false", function () {
            spyOn(handler, 'CanChange').and.callFake(function () {
                return true;
            });

            var result = handler.ReApplyHandler();
            expect(result.length).toBe(1);
        });
    });

    describe(".CanFiltersMovable", function () {
        it("Check filter moveable area", function () {
            // Arrange
            var container = null;
            var querySteps = [];
            var target = new WidgetFilterHandler(container, querySteps);

            // Act
            var actual = target.CanFiltersMovable();

            // Assert
            expect(actual).toBe(false);

            // Arrange
            target.View.CreateMovableArea = function () {
                return {};
            };

            // Act
            actual = target.CanFiltersMovable();

            // Assert
            expect(actual).toBe(true);
        });
    });

    describe(".CanFilterMoveToAngle", function () {
        it("Check filter can move to angle", function () {
            // Arrange
            var container = null;
            var querySteps = [
                {
                    "field": "InvoicedValue",
                    "operator": "greater_than",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": 10000
                        }
                    ],
                    "step_type": "filter"
                },
                {
                    "field": "DelivRelAsPercentage",
                    "operator": "greater_than",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": 0.5
                        }
                    ],
                    "step_type": "filter"
                },
                {
                    "followup": "CompanyCode",
                    "step_type": "followup"
                },
                {
                    "field": "WAERS_005",
                    "operator": "in_set",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": "EUR"
                        }
                    ],
                    "step_type": "filter",
                    "tech_info": "T005-WAERS"
                },
                {
                    "field": "TheDateTime",
                    "operator": "less_than",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": 1470009600
                        }
                    ],
                    "step_type": "filter",
                    "tech_info": "CountriesPerAreaDateTime-DATETIME"
                }
            ];
            var target = new WidgetFilterHandler(container, querySteps);
            target.View.CreateMovableArea = function () {
                return {};
            };
            var expected = [true, true, false, false, false];

            // Act
            for (var index = 0; index < querySteps.length; index++) {
                // Assert
                expect(target.CanFilterMoveToAngle(querySteps[index], index)).toBe(expected[index]);
            }
        });
    });

    describe(".AddFieldFilter", function () {
        it("Add filters from field chooser (not have execution parameter)", function () {
            // Arrange
            var container = null;
            var querySteps = [];
            var target = new WidgetFilterHandler(container, querySteps);
            var field = {
                "short_name": "Area",
                "long_name": "Area of the country",
                "id": "TheArea",
                "uri": "/models/1/instances/1/fields/996",
                "source": "/models/1/field_sources/1",
                "fieldtype": "text",
                "category": "/fieldcategories/1",
                "technical_info": "CountriesPerAreaDateTime-AREA",
                "helpid": "EA_PROPERTY_Area",
                "helptext": "/models/1/helptexts/244",
                "user_specific": {
                    "is_starred": false
                },
                "fieldlength": 8
            };
            target.View.Toggle = function () {
            };
            var expected = new WidgetFilterModel({
                "step_type": "filter",
                "field": "TheArea",
                "operator": "contains",
                "arguments": []
            }, false);

            // Act
            target.AddFieldFilter(field);

            // Assert
            expect(JSON.stringify(target.Data()[0])).toBe(JSON.stringify(expected));
        });

        it("Add filters from field chooser (have execution parameter)", function () {
            // Arrange
            var container = null;
            var querySteps = [];
            var target = new WidgetFilterHandler(container, querySteps);
            target.HasExecutionParameter(true);
            var field = {
                "short_name": "Area",
                "long_name": "Area of the country",
                "id": "TheArea",
                "uri": "/models/1/instances/1/fields/996",
                "source": "/models/1/field_sources/1",
                "fieldtype": "text",
                "category": "/fieldcategories/1",
                "technical_info": "CountriesPerAreaDateTime-AREA",
                "helpid": "EA_PROPERTY_Area",
                "helptext": "/models/1/helptexts/244",
                "user_specific": {
                    "is_starred": false
                },
                "fieldlength": 8
            };
            target.View.Toggle = function () {
            };
            var expected = new WidgetFilterModel({
                "step_type": "filter",
                "field": "TheArea",
                "operator": "contains",
                "arguments": [],
                "execution_parameter_id": 0,
                "valid": true,
                "is_adhoc_filter": false
            }, false);

            // Act
            target.AddFieldFilter(field);

            // Assert
            expect(JSON.stringify(target.Data()[0])).toBe(JSON.stringify(expected));
        });
    });

    describe(".SetCompareFieldFilter", function () {
        it("Add filters from fields (compare field)", function () {
            // Arrange
            var container = "<div><div id='Operator-0-DropdownList'></div></div>";
            var querySteps = [{
                "valid": true,
                "field": "Vendor__KTOKK",
                "operator": "equal_to",
                "arguments": [],
                "step_type": "filter"
            }];
            spyOn(modelFieldSourceHandler, 'GetFieldSourceByUri').and.callFake(function () {
                return {
                    "short_name": "TEST",
                    "long_name": "TEST",
                    "id": "TEST",
                    "uri": "TEST",
                    "class_uri": "TEST"
                };
            });
            var target = new WidgetFilterHandler(container, querySteps);
            target.CompareInfo = {
                Index: 0
            };
            target.FilterFor = target.FILTERFOR.ANGLE;
            target.View.IsCompareFilter = function () {
                return 1;
            };
            target.View.GetDropdownOperatorValue = function () {
                return 'equal_to';
            };
            target.View.GetFilterFieldType = function () {
                return 'enumerated';
            };
            target.View.GetCompareFieldId = function () {
                return 'FIELD_B';
            };
            target.View.UpdateWidgetFilterText = $.noop;
            target.AdjustLayout = $.noop;
            var field = {
                "short_name": "Account group",
                "long_name": "Vendor account group",
                "id": "Vendor__KTOKK",
                "uri": "/models/1/instances/1/fields/1079",
                "source": "/models/1/field_sources/29",
                "fieldtype": "enumerated",
                "domain": "/models/1/field_domains/134",
                "category": "/fieldcategories/2",
                "technical_info": "LFA1-KTOKK",
                "helpid": "KTOKK",
                "helptext": "/models/1/helptexts/749",
                "user_specific": {
                    "is_starred": false
                },
                "fieldlength": 4
            };

            // Act
            target.SetCompareFieldFilter(field, target.CompareInfo.Index);

            // Assert
            expect(target.Data()[0].arguments[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.FIELD);
            expect(target.Data()[0].arguments[0].field).toBe('FIELD_B');
        });
    });

    describe(".AddFieldFollowup", function () {
        it("Add Jumps from field chooser", function () {
            // Arrange
            var container = null;
            var querySteps = [];
            var target = new WidgetFilterHandler(container, querySteps);
            var jump = {
                "short_name": "Material Requirements - ML",
                "long_name": "Material requirements - multi level (ML)",
                "id": "FU_REQUIREMENTS",
                "uri": "/models/1/instances/1/followups/13",
                "resulting_classes": [
                    "ReservationLine",
                    "SalesDocumentScheduleLine",
                    "SafetyStockDemand",
                    "PlanOrder",
                    "IndependentRequirement",
                    "PurchaseRequisition",
                    "ForecastRequirement",
                    "Stockbatch",
                    "DeliveryNoteLine",
                    "PurchaseOrderScheduleLine"
                ],
                "category": "downmultilevel",
                "helpid": "EA_FU_RequirementsMultiLevel"
            };
            target.View.Toggle = function () {
            };
            var expected = new WidgetFilterModel({
                "step_type": "followup",
                "followup": "FU_REQUIREMENTS",
                "uri": "/models/1/instances/1/followups/13",
                "valid": true,
                "is_adhoc_filter": false,
                "execution_parameter_id": 0
            }, false);

            // Act
            var result = target.AddFieldFollowup(jump);

            // Assert
            expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
        });
    });

    describe(".RemoveFilter", function () {
        it("Remove filter or jump", function (done) {
            // Arrange
            var container = '<div id="FilterWrapper"></div>';;
            var querySteps = [
                {
                    "field": "DelivRelAsPercentage",
                    "operator": "greater_than",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": 0.5
                        }
                    ],
                    "step_type": "filter"
                },
                {
                    "followup": "CompanyCode",
                    "step_type": "followup"
                }
            ];
            var target = new WidgetFilterHandler(container, querySteps);
            target.View.GetHtmlElementById = function (id) {
                return jQuery('<div />').attr('id', id);
            };
            target.View.BindingDropdownOperator = $.noop;
            target.View.BindingAndSortingElementFilter = $.noop;

            // Act
            target.RemoveFilter(target.Data()[0], null);
            setTimeout(function () {
                target.RemoveFilter(target.Data()[0], null);
            }, 100);

            setTimeout(function () {
                // Assert
                expect(target.Data().length).toBe(0);
                done();
            }, 200);
        });
    });

    describe(".ShowCompareFilterPopup", function () {
        it("Show compare field popup", function () {
            // Arrange
            var container = '<div id="FilterWrapper"><div id="Operator-0-DropdownList"></div></div>';
            var querySteps = [];
            var target = new WidgetFilterHandler(container, querySteps);
            target.FilterFor = target.FILTERFOR.ANGLE;

            // Act
            var actual = target.ShowCompareFilterPopup(enumHandlers.FIELDTYPE.ENUM, 0);

            // Assert
            expect(actual).toBe("Operator-0-DropdownList");
        });
    });

    describe(".SetFieldChoooserInfo", function () {
        it("Set field choooser info for Angle", function () {
            // Arrange
            var container = null;
            var querySteps = [
                {
                    "field": "DelivRelAsPercentage",
                    "operator": "greater_than",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": 0.5
                        }
                    ],
                    "step_type": "filter",
                    "valid": true,
                    "is_adhoc_filter": false,
                    "execution_parameter_id": ""
                }
            ];
            var baseClasses = [
                "PurchaseOrderScheduleLine",
                "PurchaseOrder"
            ];
            var target = new WidgetFilterHandler(container, querySteps);
            target.ModelUri = '/models/1';
            target.FilterFor = target.FILTERFOR.ANGLE;

            // Act
            var actual = target.SetFieldChoooserInfo(baseClasses);

            // Assert
            expect(actual.ModelUri).toBe("/models/1");
            expect(actual.AngleClasses).toBe(baseClasses);
            expect(JSON.stringify(actual.AngleSteps)).toBe(JSON.stringify(querySteps));
            expect(actual.DisplaySteps.length).toBe(0);
        });

        it("Set field choooser info for Display", function () {
            // Arrange
            var container = null;
            var querySteps = [
                {
                    "field": "DelivRelAsPercentage",
                    "operator": "greater_than",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": 0.5
                        }
                    ],
                    "step_type": "filter",
                    "valid": true,
                    "is_adhoc_filter": false,
                    "execution_parameter_id": ""
                }
            ];
            var baseClasses = [
                "PurchaseOrderScheduleLine",
                "PurchaseOrder"
            ];
            var angleQuerySteps = [
                {
                    "field": "Material__BaseUnitOfMeasure",
                    "operator": "in_set",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": "BT"
                        }
                    ],
                    "step_type": "filter",
                    "tech_info": "MARA-MEINS"
                }
            ];
            var target = new WidgetFilterHandler(container, querySteps);
            target.ModelUri = '/models/1';
            target.FilterFor = target.FILTERFOR.DISPLAY;

            // Act
            var actual = target.SetFieldChoooserInfo(baseClasses, angleQuerySteps);

            // Assert
            expect(actual.ModelUri).toBe("/models/1");
            expect(actual.AngleClasses).toBe(baseClasses);
            expect(JSON.stringify(actual.AngleSteps)).toBe(JSON.stringify(angleQuerySteps));
            expect(JSON.stringify(actual.DisplaySteps)).toBe(JSON.stringify(querySteps));
        });
    });

    describe(".ShowFieldInfo", function () {
        it("Show field info", function () {
            // Arrange
            var container = null;
            var querySteps = [
                {
                    "field": "DelivRelAsPercentage",
                    "operator": "greater_than",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": 0.5
                        }
                    ],
                    "step_type": "filter"
                },
                {
                    "followup": "CompanyCode",
                    "step_type": "followup"
                }
            ];
            var target = new WidgetFilterHandler(container, querySteps);
            target.ModelUri = '/models/1';

            // Act
            var actual = target.ShowFieldInfo(querySteps[0], { currentTarget: $() });

            // Assert
            expect(actual.Id).toBe("DelivRelAsPercentage");
            expect(actual.HelpType).toBe("field");
            expect(actual.ModelUri).toBe("/models/1");

            // Act
            actual = target.ShowFieldInfo(querySteps[1], { currentTarget: $() });

            // Assert
            expect(actual.Id).toBe("CompanyCode");
            expect(actual.HelpType).toBe("followup");
            expect(actual.ModelUri).toBe("/models/1");
        });
    });

    describe(".HasDefinition", function () {
        it("Check definition has filer(s) or jump(s)", function () {
            // Arrange
            var container = null;
            var querySteps = [
                {
                    "field": "DelivRelAsPercentage",
                    "operator": "greater_than",
                    "arguments": [
                        {
                            "argument_type": "value",
                            "value": 0.5
                        }
                    ],
                    "step_type": "filter"
                },
                {
                    "followup": "CompanyCode",
                    "step_type": "followup"
                },
                {
                    "aggregation_fields": [
                        {
                            "field": "sum_ClaimedStocksValue",
                            "operator": "sum",
                            "source_field": "ClaimedStocksValue"
                        }
                    ],
                    "grouping_fields": [
                        {
                            "field": "power10_3_OrderedValue",
                            "operator": "power10_3",
                            "source_field": "OrderedValue"
                        },
                        {
                            "field": "individual_Material__BaseUnitOfMeasure",
                            "operator": "individual",
                            "source_field": "Material__BaseUnitOfMeasure",
                            "tech_info": "MARA-MEINS"
                        }
                    ],
                    "step_type": "aggregation"
                }
            ];
            var target = new WidgetFilterHandler(container, querySteps);

            // Act
            var actual = target.HasDefinition([querySteps[0]].concat([querySteps[1]]));

            // Assert
            expect(actual).toBe(true);

            // Act
            actual = target.HasDefinition([querySteps[2]]);

            // Assert
            expect(actual).toBe(false);
        });
    });

    describe(".CanChange", function () {
        it("CanChange filter or jump", function () {
            // Arrange
            var actual, actual_1, actual_2;
            var container = null;
            var querySteps = [];
            var target = new WidgetFilterHandler(container, querySteps);

            // ===============================================================================================
            // =                                        ANGLE                                                =
            // ===============================================================================================
            // ============= Test angle's filter but angle do not have update authorization ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: false
                }
            });

            // Act
            actual = target.CanChange({});

            // Assert
            expect(actual).toBe(false);

            // ============= Test angle's filter but do not have filter ==============
            target.FilterFor = '';
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable(null);

            // Act
            actual = target.CanChange();

            // Assert
            expect(actual).toBe(false);

            // ============= Test angle's filter but do not have permission in result ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: false
                }
            });

            // Act
            actual = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FILTER, valid: true });

            // Assert
            expect(actual).toBe(false);

            // ============= Test angle's filter but filter is invalid ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: true,
                    change_query_followups: false
                }
            });

            // Act
            actual = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FILTER, valid: false });

            // Assert
            expect(actual).toBe(true);

            // ============= Test angle's jump but do not have permission in result ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: false
                }
            });

            // Act
            actual = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FOLLOWUP, valid: true });

            // Assert
            expect(actual).toBe(false);

            // ============= Test angle's jump but jump is invalid ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: true
                }
            });

            // Act
            actual = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FOLLOWUP, valid: false });

            // Assert
            expect(actual).toBe(true);


            // ===============================================================================================
            // =                                       DISPLAY                                               =
            // ===============================================================================================
            // ============= Test display's filter but display do not have update authorization ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: false
                }
            });
            resultModel.Data = ko.protectedObservable(null);

            // Act
            actual = target.CanChange({});

            // Assert
            expect(actual).toBe(false);

            // ============= Test display's filter but do not have permission in result ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: false
                }
            });

            // Act
            actual_1 = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FILTER, valid: true, is_adhoc_filter: false });
            actual_2 = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FILTER, valid: true, is_adhoc_filter: true });

            // Assert
            expect(actual_1).toBe(false);
            expect(actual_2).toBe(true);

            // ============= Test display's filter but filter is invalid ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: true,
                    change_query_followups: false
                }
            });

            // Act
            actual_1 = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FILTER, valid: false, is_adhoc_filter: false });
            actual_2 = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FILTER, valid: false, is_adhoc_filter: true });

            // Assert
            expect(actual_1).toBe(true);
            expect(actual_2).toBe(true);

            // ============= Test display's jump but do not have permission in result ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: false
                }
            });

            // Act
            actual_1 = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FOLLOWUP, valid: true, is_adhoc_filter: false });
            actual_2 = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FOLLOWUP, valid: true, is_adhoc_filter: true });

            // Assert
            expect(actual_1).toBe(false);
            expect(actual_2).toBe(true);

            // ============= Test display's jump but jump is invalid ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: true
                }
            });

            // Act
            actual_1 = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FOLLOWUP, valid: false, is_adhoc_filter: false });
            actual_2 = target.CanChange({ step_type: enumHandlers.FILTERTYPE.FOLLOWUP, valid: false, is_adhoc_filter: true });

            // Assert
            expect(actual_1).toBe(true);
            expect(actual_2).toBe(true);
        });
    });

    describe(".CanRemove", function () {
        it("CanRemove filter or jump", function () {
            // Arrange
            var actual, actual_1, actual_2;
            var container = null;
            var querySteps = [{
                "field": "DelivRelAsPercentage",
                "operator": "greater_than",
                "arguments": [
                    {
                        "argument_type": "value",
                        "value": 0.5
                    }
                ],
                "step_type": "filter"
            }, {
                "followup": "CompanyCode",
                "step_type": "followup"
            }];
            var target = new WidgetFilterHandler(container, querySteps);

            // ===============================================================================================
            // =                                        ANGLE                                                =
            // ===============================================================================================
            // ============= Test angle's filter but angle do not have update authorization ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: false
                }
            });

            // Act
            actual = target.CanRemove({});

            // Assert
            expect(actual).toBe(false);

            // ============= Test angle's filter but do not have filter ==============
            target.FilterFor = '';
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable(null);

            // Act
            actual = target.CanRemove();

            // Assert
            expect(actual).toBe(false);

            // ============= Test angle's filter but do not have permission in result ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: false
                }
            });

            // Act
            actual = target.CanRemove(target.Data()[0]);

            // Assert
            expect(actual).toBe(false);

            // ============= Test angle's filter but filter is invalid ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: true,
                    change_query_followups: false
                }
            });

            // Act
            target.Data()[0].valid = false;
            actual = target.CanRemove(target.Data()[0]);
            target.Data()[0].valid = true;

            // Assert
            expect(actual).toBe(true);

            // ============= Test angle's jump but do not have permission in result ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: false
                }
            });

            // Act
            actual = target.CanRemove(target.Data()[1]);

            // Assert
            expect(actual).toBe(false);

            // ============= Test angle's jump but jump is invalid ==============
            target.FilterFor = target.FILTERFOR.ANGLE;
            angleInfoModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: true
                }
            });

            // Act
            target.Data()[1].valid = false;
            actual = target.CanRemove(target.Data()[1]);
            target.Data()[1].valid = true;

            // Assert
            expect(actual).toBe(true);


            // ===============================================================================================
            // =                                       DISPLAY                                               =
            // ===============================================================================================
            // ============= Test display's filter but display do not have update authorization ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: false
                }
            });
            resultModel.Data = ko.protectedObservable(null);

            // Act
            actual = target.CanRemove({});

            // Assert
            expect(actual).toBe(false);

            // ============= Test display's filter but do not have permission in result ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: false
                }
            });

            // Act
            actual_1 = target.CanRemove(target.Data()[0]);
            target.Data()[0].is_adhoc_filter = true;
            actual_2 = target.CanRemove(target.Data()[0]);
            target.Data()[0].is_adhoc_filter = false;

            // Assert
            expect(actual_1).toBe(false);
            expect(actual_2).toBe(true);

            // ============= Test display's filter but filter is invalid ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: true,
                    change_query_followups: false
                }
            });

            // Act
            target.Data()[0].valid = false;
            actual_1 = target.CanRemove(target.Data()[0]);
            target.Data()[0].is_adhoc_filter = true;
            actual_2 = target.CanRemove(target.Data()[0]);
            target.Data()[0].is_adhoc_filter = false;
            target.Data()[0].valid = true;

            // Assert
            expect(actual_1).toBe(true);
            expect(actual_2).toBe(true);

            // ============= Test display's jump but do not have permission in result ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: true,
                    change_query_followups: false
                }
            });

            // Act
            actual_1 = target.CanRemove(target.Data()[1]);
            target.Data()[1].is_adhoc_filter = true;
            actual_2 = target.CanRemove(target.Data()[1]);
            target.Data()[1].is_adhoc_filter = false;

            // Assert
            expect(actual_1).toBe(false);
            expect(actual_2).toBe(true);

            // ============= Test display's jump but jump is invalid ==============
            target.FilterFor = target.FILTERFOR.DISPLAY;
            displayModel.Data = ko.protectedObservable({
                authorizations: {
                    update: true
                }
            });
            resultModel.Data = ko.protectedObservable({
                authorizations: {
                    change_query_filters: false,
                    change_query_followups: true
                }
            });

            // Act
            target.Data()[1].valid = false;
            actual_1 = target.CanRemove(target.Data()[1]);
            target.Data()[1].is_adhoc_filter = true;
            actual_2 = target.CanRemove(target.Data()[1]);
            target.Data()[1].is_adhoc_filter = false;
            target.Data()[1].valid = true;

            // Assert
            expect(actual_1).toBe(true);
            expect(actual_2).toBe(true);
        });
    });

    describe(".GetTemplateName", function () {
        it("should get correct template", function () {
            // Arrange
            var actual_1, actual_2, actual_3, actual_4, actual_5;
            var container = null;
            var querySteps = [];
            var target = new WidgetFilterHandler(container, querySteps);

            // 1. DEFAULTCRITERIA
            // Act
            actual_1 = target.GetTemplateName();
            actual_2 = target.GetTemplateName(enumHandlers.FIELDTYPE.TEXT, enumHandlers.OPERATOR.HASVALUE.Value);
            actual_3 = target.GetTemplateName(enumHandlers.FIELDTYPE.TEXT, enumHandlers.OPERATOR.HASNOVALUE.Value);

            // Assert
            expect(actual_1).toBe('DEFAULTCRITERIA');
            expect(actual_2).toBe('DEFAULTCRITERIA');
            expect(actual_3).toBe('DEFAULTCRITERIA');

            // 2. BOOLEANTYPECRITERIA, CRITERIAGROUPONE and CRITERIAGROUPTWO
            // Act
            actual_1 = target.GetTemplateName(enumHandlers.FIELDTYPE.TEXT, enumHandlers.OPERATOR.EQUALTO.Value);
            actual_2 = target.GetTemplateName(enumHandlers.FIELDTYPE.BOOLEAN, enumHandlers.OPERATOR.GREATERTHAN.Value);
            actual_3 = target.GetTemplateName(enumHandlers.FIELDTYPE.PERIOD, enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value);

            // Assert
            expect(actual_1).toBe('CRITERIAGROUPONE');
            expect(actual_2).toBe('BOOLEANTYPECRITERIA');
            expect(actual_3).toBe('CRITERIAGROUPTWO');

            // 3. CRITERIAGROUPTWO
            // Act
            actual_1 = target.GetTemplateName(enumHandlers.FIELDTYPE.TEXT, enumHandlers.OPERATOR.BETWEEN.Value);
            actual_2 = target.GetTemplateName(enumHandlers.FIELDTYPE.BOOLEAN, enumHandlers.OPERATOR.NOTBETWEEN.Value);
            actual_3 = target.GetTemplateName(enumHandlers.FIELDTYPE.PERIOD, enumHandlers.OPERATOR.NOTBETWEEN.Value);
            actual_4 = target.GetTemplateName(enumHandlers.FIELDTYPE.PERCENTAGE, enumHandlers.OPERATOR.RELATIVEBEFORE.Value);
            actual_5 = target.GetTemplateName(enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.OPERATOR.RELATIVEBETWEEN.Value);

            // Assert
            expect(actual_1).toBe('CRITERIAGROUPTWO');
            expect(actual_2).toBe('CRITERIAGROUPTWO');
            expect(actual_3).toBe('CRITERIAGROUPTWO');
            expect(actual_4).toBe('CRITERIAGROUPTWO');
            expect(actual_5).toBe('CRITERIAGROUPTWO');

            // 4. CRITERIAGROUPTHREE and CRITERIAGROUPFOUR
            // Act
            actual_1 = target.GetTemplateName(enumHandlers.FIELDTYPE.TEXT, enumHandlers.OPERATOR.INLIST.Value);
            actual_2 = target.GetTemplateName(enumHandlers.FIELDTYPE.BOOLEAN, enumHandlers.OPERATOR.NOTINLIST.Value);
            actual_3 = target.GetTemplateName(enumHandlers.FIELDTYPE.ENUM, enumHandlers.OPERATOR.INLIST.Value);

            // Assert
            expect(actual_1).toBe('CRITERIAGROUPTHREE');
            expect(actual_2).toBe('CRITERIAGROUPTHREE');
            expect(actual_3).toBe('CRITERIAGROUPFOUR');

            // 5. CRITERIAGROUPTHREE
            // Act
            actual_1 = target.GetTemplateName(enumHandlers.FIELDTYPE.TEXT, enumHandlers.OPERATOR.CONTAIN.Value);
            actual_2 = target.GetTemplateName(enumHandlers.FIELDTYPE.BOOLEAN, enumHandlers.OPERATOR.STARTWITH.Value);
            actual_3 = target.GetTemplateName(enumHandlers.FIELDTYPE.ENUM, enumHandlers.OPERATOR.NOTENDON.Value);

            // Assert
            expect(actual_1).toBe('CRITERIAGROUPTHREE');
            expect(actual_2).toBe('CRITERIAGROUPTHREE');
            expect(actual_3).toBe('CRITERIAGROUPTHREE');

            // 5. COMPAREFIELD
            // Act
            actual_1 = target.GetTemplateName(enumHandlers.FIELDTYPE.ENUM, 'comparefield');

            // Assert
            expect(actual_1).toBe('COMPAREFIELD');
        });
    });

    describe(".RenderView", function () {
        it("should send data for request", function () {
            // Arrange
            var container = null;
            var querySteps = [{
                "field": "FIELD_A",
                "operator": "equal_to",
                "arguments": [
                    {
                        "argument_type": "field",
                        "field": "FIELD_B"
                    }
                ],
                "step_type": "filter"
            }, {
                "field": "FIELD_C",
                "operator": "equal_to",
                "arguments": [
                    {
                        "argument_type": "value",
                        "value": 100.05
                    }
                ],
                "step_type": "filter"
            }, {
                "field": "FIELD_D",
                "operator": "equal_to",
                "arguments": [],
                "step_type": "filter"
            }, {
                "valid": true,
                "field": "ExecutionStatus",
                "operator": "in_set",
                "arguments": [{
                    "argument_type": "value",
                    "value": "es0ToBeExecuted"
                }],
                "step_type": "filter"
            }, {
                "field": "FIELD_E",
                "operator": enumHandlers.OPERATOR.CONTAIN.Value,
                "arguments": [
                    {
                        "argument_type": "value",
                        "value": "X"
                    }
                ],
                "step_type": "filter"
            }, {
                "field": "FIELD_F",
                "operator": enumHandlers.OPERATOR.HASVALUE.Value,
                "arguments": [{
                    "argument_type": "value",
                    "value": null
                }],
                "step_type": "filter"
            }];
            var target = new WidgetFilterHandler(container, querySteps);
            var sender = {};
            sender.value = function () {
                return enumHandlers.OPERATOR.EQUALTO.Value;
            };
            modelFieldsHandler.GetFieldById = function () {
                return null;
            };
            target.FilterFor = target.FILTERFOR.ANGLE;
            target.View.IsCompareFilter = function () {
                return 1;
            };
            target.View.GetDropdownOperatorValue = function (i) {
                if (i === 0)
                    return enumHandlers.OPERATOR.EQUALTO.Value;
                else if (i === 1)
                    return enumHandlers.OPERATOR.GREATERTHAN.Value;
            };
            target.View.GetFilterFieldType = function () {
                return 'enumerated';
            };
            target.View.GetCompareFieldId = function () {
                return 'FIELD_B';
            };
            target.View.UpdateWidgetFilterText = $.noop;
            target.AdjustLayout = $.noop;
            target.View.GenerateCriteriaView = $.noop;

            // =================================== compare field but it's not switch operator
            // Act
            var actual = target.RenderView(sender, { index: 0, fieldType: enumHandlers.FIELDTYPE.TEXT });
            // Assert
            expect(actual.arguments[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.FIELD);
            expect(actual.arguments[0].field).toBe('FIELD_B');

            // =================================== compare field but it switch operator
            // Arrange
            target.SwitchOperator = true;
            // Act
            actual = target.RenderView(sender, { index: 0, fieldType: enumHandlers.FIELDTYPE.TEXT });
            // Assert
            expect(actual.arguments[0].field).toBe('FIELD_B');

            // =================================== value field but it's not switch operator
            // Act
            actual = target.RenderView(sender, { index: 1, fieldType: enumHandlers.FIELDTYPE.DOUBLE });
            // Assert
            expect(actual[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.VALUE);
            expect(actual[0].value).toBe(100.05);

            // =================================== value field but it switch operator but argument value is empty
            // Arrange
            target.SwitchOperator = true;
            // Act
            actual = target.RenderView(sender, { index: 2, fieldType: enumHandlers.FIELDTYPE.TEXT });
            // Assert
            expect(actual.length).toBe(0);

            // =================================== value field switch operator but field type is enum
            // Arrange
            target.SwitchOperator = true;
            // Act
            actual = target.RenderView(sender, { index: 3, fieldType: enumHandlers.FIELDTYPE.ENUM });
            // Assert
            expect(actual[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.VALUE);
            expect(actual[0].value).toBe('es0ToBeExecuted');

            // Arrange
            target.SwitchOperator = true;
            sender.value = function () {
                return enumHandlers.OPERATOR.NOTCONTAIN.Value;
            };
            // Act
            actual = target.RenderView(sender, { index: 4, fieldType: enumHandlers.FIELDTYPE.ENUM });
            // Assert
            expect(actual[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.VALUE);
            expect(actual[0].value).toBe('X');

            // Arrange
            target.SwitchOperator = true;
            sender.value = function () {
                return enumHandlers.OPERATOR.HASNOVALUE.Value;
            };
            // Act
            actual = target.RenderView(sender, { index: 5, fieldType: enumHandlers.FIELDTYPE.ENUM });
            // Assert
            expect(actual.length).toBe(0);

            // =================================== value field switch operator but field type is not enum
            // Arrange
            target.SwitchOperator = true;
            sender.value = function () {
                return enumHandlers.OPERATOR.EQUALTO.Value;
            };
            // Act
            actual = target.RenderView(sender, { index: 3, fieldType: enumHandlers.FIELDTYPE.TEXT });
            // Assert
            expect(actual[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.VALUE);
            expect(actual[0].value).toBe('es0ToBeExecuted');

            // Arrange
            target.SwitchOperator = true;
            sender.value = function () {
                return enumHandlers.OPERATOR.NOTCONTAIN.Value;
            };
            // Act
            actual = target.RenderView(sender, { index: 4, fieldType: enumHandlers.FIELDTYPE.TEXT });
            // Assert
            expect(actual[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.VALUE);
            expect(actual[0].value).toBe('X');

            // Arrange
            target.SwitchOperator = true;
            sender.value = function () {
                return enumHandlers.OPERATOR.HASNOVALUE.Value;
            };
            // Act
            actual = target.RenderView(sender, { index: 5, fieldType: enumHandlers.FIELDTYPE.TEXT });
            // Assert
            expect(actual.length).toBe(0);
        });
    });

    describe(".CreateFromQuerySteps", function () {
        var handler;
        var querySteps = [{
            "valid": true,
            "field": "ExecutionStatus",
            "operator": "in_set",
            "arguments": [{
                "argument_type": "value",
                "value": "es0ToBeExecuted"
            }],
            "step_type": "filter"
        }];

        beforeEach(function () {
            handler = new WidgetFilterHandler(null, []);
            handler.View.BindingDropdownOperator = $.noop;
            handler.GetFieldById = function () {
                return { fieldtype: 'int' };
            };
            handler.View.GetOperatorElement = function () {
                return jQuery('<div />');
            };
            handler.View.GetHtmlElementById = function (id) {
                return jQuery('<div />').attr('id', id);
            };
        });

        it("should create element inside accordion from all querysteps when CanChange is true", function () {
            spyOn(handler, 'CanChange').and.callFake(function () {
                return true;
            });
            
            var result = handler.CreateFromQuerySteps(querySteps);
            expect(result.length).toBe(1);
        });

        it("should not create element inside accordion from all querysteps when CanChange is false", function () {
            spyOn(handler, 'CanChange').and.callFake(function () {
                return false;
            });

            var result = handler.CreateFromQuerySteps(querySteps);
            expect(result.length).toBe(0);
        });
    });

    describe(".ApplyFilterParameterise", function () {
        it("ApplyFilterParameterise return correct data", function () {

            var widgetFilterHandler = new WidgetFilterHandler(null, []);

            widgetFilterHandler.View.GetHtmlElementById = function (id) {
                return jQuery('<div />').attr('id', id);
            };
            widgetFilterHandler.View.GetDropdownOperatorValue = function () {
                return "greater_than";
            };
            widgetFilterHandler.View.GetFilterFieldType = function () {
                return "int";
            };
            widgetFilterHandler.View.IsCompareFilter = function () {
                return false;
            };
            widgetFilterHandler.View.UpdateWidgetFilterText = function () {
                return "Mock filter text";
            };
            widgetFilterHandler.View.ConvertUIToArguments = function () {
                return 0;
            };
            widgetFilterHandler.View.SetPreviewDateText = $.noop;

            var event = {
                "currentTarget": { "id": "FilterHeader-0-Parameter" }
            };

            var data = {
                "valid": true,
                "field": "NetWeightInKGs",
                "operator": "greater_than",
                "arguments": [{
                    "argument_type": "value",
                    "value": 0
                }],
                "step_type": "filter"
            };

            var actualData = widgetFilterHandler.ApplyFilterParameterise(data, event);
            expect(actualData).toBe(true);

        });
    });

    describe(".ApplyFilterWhenAction", function () {
        it("ApplyFilterWhenAction return correct data", function () {

            var widgetFilterHandler = new WidgetFilterHandler(null, []);

            widgetFilterHandler.Element = jQuery("<div><input type='radio' value='true' id='AskValue-0-Yes' name='AskValue-0-Yes' checked='true'></ div>");

            var data = {
                "valid": true,
                "field": "NetWeightInKGs",
                "operator": "greater_than",
                "arguments": [{
                    "argument_type": "value",
                    "value": 0
                }],
                "step_type": "filter",
                "is_execution_parameter": ko.observable(true)
            };

            var actualData = widgetFilterHandler.HandleParameterize(data, 0, true);
            expect(actualData.is_execution_parameter()).toBe(true);

            widgetFilterHandler.Element = jQuery("<div><input type='radio' value='true' id='AskValue-0-Yes' name='AskValue-0-Yes'></ div>");
            actualData = widgetFilterHandler.HandleParameterize(data, 0, true);
            expect(actualData.is_execution_parameter()).toBe(false);

            widgetFilterHandler.Element = jQuery("<div></ div>");
            actualData = widgetFilterHandler.HandleParameterize(data, 0, true);
            expect(actualData.is_execution_parameter()).toBe(true);

        });

        it("ApplyFilterWhenAction with argument type value", function () {

            var querySteps = [{
                "valid": true,
                "field": "NetWeightInKGs",
                "operator": "greater_than",
                "arguments": [{
                    "argument_type": "value",
                    "value": 0
                }],
                "step_type": "filter"
            }];

            var widgetFilterHandler = new WidgetFilterHandler(null, querySteps);

            widgetFilterHandler.View.GetHtmlElementById = function (id) {
                return jQuery('<div />').attr('id', id);
            };
            widgetFilterHandler.View.GetDropdownOperatorValue = function () {
                return "greater_than";
            };
            widgetFilterHandler.View.GetFilterFieldType = function () {
                return "int";
            };
            widgetFilterHandler.View.IsCompareFilter = function () {
                return false;
            };
            widgetFilterHandler.View.UpdateWidgetFilterText = function () {
                return "Mock filter text";
            };
            widgetFilterHandler.View.ConvertUIToArguments = function () {
                return [{ argument_type: enumHandlers.FILTERARGUMENTTYPE.VALUE, value: 0 }];
            };

            var actualData = widgetFilterHandler.ApplyFilterWhenAction(0);
            expect(actualData.arguments[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.VALUE);
            expect(actualData.arguments[0].value).toBe(0);
            expect(actualData.field).toBe("NetWeightInKGs");
            expect(actualData.operator).toBe("greater_than");
            expect(actualData.step_type).toBe("filter");

            // test arguments is array
            widgetFilterHandler.View.ConvertUIToArguments = function () {
                return [{ argument_type: enumHandlers.FILTERARGUMENTTYPE.VALUE, value: 0 }, { argument_type: enumHandlers.FILTERARGUMENTTYPE.VALUE, value: 1 }];
            };

            actualData = widgetFilterHandler.ApplyFilterWhenAction(0);
            expect(actualData.arguments[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.VALUE);
            expect(actualData.arguments[0].value).toBe(0);
            expect(actualData.arguments[1].value).toBe(1);

        });
    });

    describe(".ApplyFilterWhenAction", function () {
        it("ApplyFilterWhenAction with argument type field (compare field)", function () {

            var querySteps = [{
                "valid": true,
                "field": "ExecutionStatus",
                "operator": "in_set",
                "arguments": [{
                    "argument_type": "value",
                    "value": "es0ToBeExecuted"
                }],
                "step_type": "filter"
            }];

            var widgetFilterHandler = new WidgetFilterHandler(null, querySteps);
            widgetFilterHandler.View.GetHtmlElementById = function (id) {
                return jQuery('<div />').attr('id', id);
            };
            widgetFilterHandler.View.GetDropdownOperatorValue = function () {
                return "in_set";
            };
            widgetFilterHandler.View.GetFilterFieldType = function () {
                return "enumerated";
            };
            widgetFilterHandler.View.IsCompareFilter = function () {
                return true;
            };
            widgetFilterHandler.View.GetCompareFieldId = function () {
                return "ExecutionStatus";
            };
            widgetFilterHandler.View.UpdateWidgetFilterText = function () {
                return "Mock filter text";
            };

            var actualData = widgetFilterHandler.ApplyFilterWhenAction(0);
            expect(actualData.arguments[0].argument_type).toBe(enumHandlers.FILTERARGUMENTTYPE.FIELD);
            expect(actualData.arguments[0].field).toBe("ExecutionStatus");
            expect(actualData.field).toBe("ExecutionStatus");
            expect(actualData.operator).toBe("in_set");
            expect(actualData.step_type).toBe("filter");
            expect(actualData.is_adhoc_filter).toBe(false);
        });
    });

    describe(".IsEqualGroupOperator", function () {
        it("IsEqualGroupOperator get correct data", function () {

            var widgetFilterHandler = new WidgetFilterHandler(null, []);

            expect(widgetFilterHandler.IsEqualGroupOperator(enumHandlers.OPERATOR.EQUALTO.Value)).toBe(true);
            expect(widgetFilterHandler.IsEqualGroupOperator(enumHandlers.OPERATOR.NOTEQUALTO.Value)).toBe(true);
            expect(widgetFilterHandler.IsEqualGroupOperator(enumHandlers.OPERATOR.SMALLERTHAN.Value)).toBe(true);
            expect(widgetFilterHandler.IsEqualGroupOperator(enumHandlers.OPERATOR.GREATERTHAN.Value)).toBe(true);
            expect(widgetFilterHandler.IsEqualGroupOperator(enumHandlers.OPERATOR.SMALLERTHANOREQUALTO.Value)).toBe(true);
            expect(widgetFilterHandler.IsEqualGroupOperator(enumHandlers.OPERATOR.GREATERTHANOREQUALTO.Value)).toBe(true);
            expect(widgetFilterHandler.IsEqualGroupOperator(enumHandlers.OPERATOR.RELATIVEAFTER.Value)).toBe(true);
            expect(widgetFilterHandler.IsEqualGroupOperator(enumHandlers.OPERATOR.RELATIVEBEFORE.Value)).toBe(true);
            expect(widgetFilterHandler.IsEqualGroupOperator(enumHandlers.OPERATOR.INLIST.Value)).toBe(false);
        });
    });

    describe(".IsListGroupOperator", function () {
        it("IsListGroupOperator get correct data", function () {

            var widgetFilterHandler = new WidgetFilterHandler(null, []);

            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.INLIST.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.NOTINLIST.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.CONTAIN.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.NOTCONTAIN.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.STARTWITH.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.NOTSTARTWITH.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.ENDON.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.NOTENDON.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.MATCHPATTERN.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.NOTMATCHPATTERN.Value)).toBe(true);
            expect(widgetFilterHandler.IsListGroupOperator(enumHandlers.OPERATOR.BETWEEN.Value)).toBe(false);
        });
    });

    describe(".IsBetweenGroupOperator", function () {
        it("IsBetweenGroupOperator get correct between operator data", function () {

            var widgetFilterHandler = new WidgetFilterHandler(null, []);

            expect(widgetFilterHandler.IsBetweenGroupOperator(enumHandlers.OPERATOR.BETWEEN.Value)).toBe(true);
            expect(widgetFilterHandler.IsBetweenGroupOperator(enumHandlers.OPERATOR.NOTBETWEEN.Value)).toBe(true);
            expect(widgetFilterHandler.IsBetweenGroupOperator(enumHandlers.OPERATOR.RELATIVEBETWEEN.Value)).toBe(true);
            expect(widgetFilterHandler.IsBetweenGroupOperator(enumHandlers.OPERATOR.NOTRELATIVEBETWEEN.Value)).toBe(true);
            expect(widgetFilterHandler.IsBetweenGroupOperator(enumHandlers.OPERATOR.NOTMATCHPATTERN.Value)).toBe(false);
        });
    });

    describe(".GetFilterElements", function () {
        it("GetFilterElements get correct elements", function () {

            var widgetFilterHandler = new WidgetFilterHandler(null, []);

            // for integer
            var actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.INTEGER, enumHandlers.OPERATOR.GREATERTHAN.Value);
            expect(actualData[0]).toBe("InputValue-0");
            expect(actualData.length).toBe(1);

            // for integer between
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.INTEGER, enumHandlers.OPERATOR.BETWEEN.Value);
            expect(actualData[0]).toBe("FirstInput-0");
            expect(actualData[1]).toBe("SecondInput-0");
            expect(actualData.length).toBe(2);

            // for integer
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.DOUBLE, enumHandlers.OPERATOR.GREATERTHAN.Value);
            expect(actualData[0]).toBe("InputValue-0");
            expect(actualData.length).toBe(1);

            //currrency
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.CURRENCY, enumHandlers.OPERATOR.GREATERTHAN.Value);
            expect(actualData[0]).toBe("InputValue-0");
            expect(actualData.length).toBe(1);

            //percentage
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.PERCENTAGE, enumHandlers.OPERATOR.GREATERTHAN.Value);
            expect(actualData[0]).toBe("InputValue-0");
            expect(actualData.length).toBe(1);

            //text
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.TEXT, enumHandlers.OPERATOR.GREATERTHAN.Value);
            expect(actualData[0]).toBe("InputValue-0");
            expect(actualData.length).toBe(1);

            //enum in list
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.ENUM, enumHandlers.OPERATOR.INLIST.Value);
            expect(actualData[0]).toBe("ValueList-0");
            expect(actualData.length).toBe(1);

            //boolean
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.BOOLEAN, enumHandlers.OPERATOR.GREATERTHAN.Value);
            expect(actualData[0]).toBe("YesChoice-0");
            expect(actualData[1]).toBe("NoChoice-0");
            expect(actualData.length).toBe(2);

            //date
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.DATE, enumHandlers.OPERATOR.GREATERTHAN.Value);
            expect(actualData[0]).toBe("InputValue-0");
            expect(actualData.length).toBe(1);

            //period with relative
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.PERIOD, enumHandlers.OPERATOR.RELATIVEAFTER.Value);
            expect(actualData[0]).toBe("FirstInput-0");
            expect(actualData.length).toBe(1);

            //time
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.TIME, enumHandlers.OPERATOR.GREATERTHAN.Value);
            expect(actualData[0]).toBe("InputValue-0");
            expect(actualData.length).toBe(1);

            // in case unknow argument
            actualData = widgetFilterHandler.GetFilterElements(0, enumHandlers.FIELDTYPE.TIME, "unknowoperator");
            expect(actualData.length).toBe(0);
        });
    });

    describe(".GetFilterArguments", function () {
        it("GetFilterArguments get correct amount of data", function () {

            var widgetFilterHandler = new WidgetFilterHandler(null, []);
            widgetFilterHandler.View.ConvertUIToArguments = function (operator, firstElementId, fieldType, secondElementId) {
                // check code access correct if else conditoin ConvertUIToArguments will in another test case
                return secondElementId ? 2 : 1;
            };
            widgetFilterHandler.GetFilterElements = function () {
                return ["InputValue-0"];
            };

            // for one arguments
            var actualData = widgetFilterHandler.GetFilterArguments(0, enumHandlers.FIELDTYPE.INTEGER, enumHandlers.OPERATOR.GREATERTHAN.Value);
            expect(actualData).toBe(1);

            // for two arguments
            widgetFilterHandler.GetFilterElements = function () {
                return ["FirstInput-0", "SecondInput-0"];
            };
            actualData = widgetFilterHandler.GetFilterArguments(0, enumHandlers.FIELDTYPE.INTEGER, enumHandlers.OPERATOR.BETWEEN.Value);
            expect(actualData).toBe(2);

        });
    });

    describe(".HaveJumpAfterIndex", function () {

        var tests = [
            { index: 1, expected: true },
            { index: 2, expected: true },
            { index: 4, expected: false }
        ];
        var querySteps = [];
        beforeEach(function () {
            querySteps = [
                { "step_type": "filter" },
                { "step_type": "followup" },
                { "step_type": "followup" },
                { "step_type": "filter" },
                { "step_type": "followup" },
                { "step_type": "filter" },
                { "step_type": "sorting" }
            ];
        });

        $.each(tests, function (index, test) {
            it("jump at index " + test.index + " should get " + test.expected, function () {
                var result = widgetFilterHandler.HaveJumpAfterIndex(test.index, querySteps);
                expect(test.expected).toBe(result);
            });
        });
    });

    describe(".GetAdvanceTemplateName", function () {

        var tests = [
            { argument: 'field', expected: 'CRITERIAADVANCE_FIELD' },
            { argument: 'function', expected: 'CRITERIAADVANCE_FUNCTION' },
            { argument: '', expected: 'CRITERIAADVANCE_VALUE' },
            { argument: 'random', expected: 'CRITERIAADVANCE_VALUE' }
        ];

        $.each(tests, function (index, test) {
            it("should get '" + test.expected + "' template if argument type is '" + test.argument + "'", function () {
                expect(widgetFilterHandler.GetAdvanceTemplateName(test.argument)).toBe(test.expected);
            });
        });

    });

    describe(".GetMaxArgumentsCount", function () {

        var noArgumentTests = ["has_value", "has_no_value"];
        $.each(noArgumentTests, function (index, operator) {
            it("should get 0 for empty operator (" + operator + ")", function () {
                expect(widgetFilterHandler.GetMaxArgumentsCount(operator)).toEqual(0);
            });
        });

        var equalGroupOperatorTests = ["equal_to", "not_equal_to", "less_than", "greater_than", "less_than_or_equal", "greater_than_or_equal", "relative_after", "relative_before"];
        $.each(equalGroupOperatorTests, function (index, operator) {
            it("should get 1 for single operator (" + operator + ")", function () {
                expect(widgetFilterHandler.GetMaxArgumentsCount(operator)).toEqual(1);
            });
        });

        var betweenGroupOperatorTests = ["between", "not_between", "relative_between", "not_relative_between"];
        $.each(betweenGroupOperatorTests, function (index, operator) {
            it("should get 2 for between operator (" + operator + ")", function () {
                expect(widgetFilterHandler.GetMaxArgumentsCount(operator)).toEqual(2);
            });
        });

        var listGroupOperatorTests = ["in_set", "not_in_set", "contains", "does_not_contain", "starts_with", "does_not_start_with", "ends_on", "does_not_end_on", "matches_pattern", "does_not_match_pattern"];
        $.each(listGroupOperatorTests, function (index, operator) {
            it("should get by max argument for set operator (" + operator + ")", function () {
                expect(widgetFilterHandler.GetMaxArgumentsCount(operator, 10)).toEqual(10);
            });
        });
    });

    describe(".GetSwitchedAdvanceArguments", function () {

        beforeEach(function () {
            widgetFilterHandler.SwitchOperator = true;
        });

        it("should get empty argument if it's empty", function () {
            var selectedOperator = '';
            var tempCriteria = [];
            var result = widgetFilterHandler.GetSwitchedAdvanceArguments(selectedOperator, tempCriteria);
            var expected = [];
            expect(result).toEqual(expected);
        });

        it("should get the same arguments if SwitchOperator = false", function () {
            widgetFilterHandler.SwitchOperator = false;

            var selectedOperator = 'equal_to';
            var tempCriteria = [{}];
            var result = widgetFilterHandler.GetSwitchedAdvanceArguments(selectedOperator, tempCriteria);
            var expected = [{}];
            expect(result).toEqual(expected);
        });

        it("should get 1 argument if it single operator", function () {
            var selectedOperator = 'equal_to';
            var tempCriteria = [{}, {}, {}, {}];
            var result = widgetFilterHandler.GetSwitchedAdvanceArguments(selectedOperator, tempCriteria);
            var expected = [{}];
            expect(result).toEqual(expected);
        });

        it("should get 2 argument if it between operator", function () {
            var selectedOperator = 'between';
            var tempCriteria = [{}, {}, {}, {}];
            var result = widgetFilterHandler.GetSwitchedAdvanceArguments(selectedOperator, tempCriteria);
            var expected = [{}, {}];
            expect(result).toEqual(expected);
        });

        it("should get 2 argument maximum if it between operator and argument < 2", function () {
            var selectedOperator = 'between';
            var tempCriteria = [{}];
            var result = widgetFilterHandler.GetSwitchedAdvanceArguments(selectedOperator, tempCriteria);
            var expected = [{}];
            expect(result).toEqual(expected);
        });

        it("should get max (same) arguments if it set operator", function () {
            var selectedOperator = 'in_set';
            var tempCriteria = [{}, {}, {}, {}];
            var result = widgetFilterHandler.GetSwitchedAdvanceArguments(selectedOperator, tempCriteria);
            var expected = [{}, {}, {}, {}];
            expect(result).toEqual(expected);
        });

    });

    describe(".IsCompareField", function () {

        it("should be 'true' when argument is defined", function () {
            var stepArguments = [{ argument_type: 'field', field: 'fake' }];
            expect(!!widgetFilterHandler.IsCompareField(stepArguments)).toBe(true);
        });

        it("should be 'false' when argument is not defined", function () {
            var stepArguments;
            expect(!!widgetFilterHandler.IsCompareField(stepArguments)).toBe(false);
        });

        it("should be 'false' when argument is not field type", function () {
            var stepArguments = [{ argument_type: 'value', value: 'fake' }];
            expect(!!widgetFilterHandler.IsCompareField(stepArguments)).toBe(false);
        });
    });

    describe(".GetAdvanceElementIndex", function () {

        it("should get index", function () {
            var elementLastPart = '1_10';
            expect(widgetFilterHandler.GetAdvanceElementIndex(elementLastPart)).toEqual('1');
        });

    });

    describe(".GetAdvanceElementData", function () {

        it("should get index and row if contains '_'", function () {
            var elementLastPart = '1_10';
            expect(widgetFilterHandler.GetAdvanceElementData(elementLastPart)).toEqual({ index: '1', row: '10' });
        });

        it("should get index and row = null if not contains '_'", function () {
            var elementLastPart = '1';
            expect(widgetFilterHandler.GetAdvanceElementData(elementLastPart)).toEqual({ index: '1', row: null });
        });

        it("should get result as string", function () {
            var elementLastPart = 1;
            expect(widgetFilterHandler.GetAdvanceElementData(elementLastPart)).toEqual({ index: '1', row: null });
        });
    });

    describe(".GetFilterEnumOption", function () {

        var item;
        beforeEach(function () {
            item = { id: 'C3S', short_name: 'cm3/s', long_name: 'Cubic centimeter/second' };
        });

        it("should get filter as object", function () {
            var filterValue = 'centi';

            var filter = widgetFilterHandler.GetFilterEnumOption(filterValue);
            expect(filter.value).toEqual(filterValue);
            expect(typeof filter.operator).toEqual('function');
        });

        var tests = [
            { value: 'centi', expected: true },
            { value: ' centi ', expected: true },
            { value: 'cubic c', expected: true },
            { value: '  ', expected: true },
            { value: ' ', expected: true },
            { value: ' /', expected: true },
            { value: 'Open', expected: false }
        ];
        $.each(tests, function (index, test) {
            it("should get '" + test.expected + "' if use '" + test.value + "' for filter", function () {
                var filter = widgetFilterHandler.GetFilterEnumOption(test.value);
                var result = filter.operator(item, filter.value);
                expect(test.expected).toEqual(result);
            });
        });

    });

    describe(".ShowAddFilterFromJumpPopup", function () {

        var testCases;

        testCases = [{
            title: 'should be true if viewmode is treeview',
            isTreeViewMode: true,
            expectedResult: true
        }, {
            title: 'should be false if viewmode is not treeview',
            isTreeViewMode: false,
            expectedResult: false
        }];

        testCases.forEach(function (testCase) {
            it(testCase.title, function () {
                var mockFilter = {
                    field: "test1",
                    step_type: "filter"
                };
                widgetFilterHandler.Data(mockFilter);

                if (testCase.isTreeViewMode)
                    widgetFilterHandler.SetTreeViewMode();

                var result = widgetFilterHandler.IsTreeViewHeader(mockFilter);

                expect(result).toEqual(testCase.expectedResult);
            });
        });

        testCases = [{
            title: 'should be true if params filter field is not equal previous filter field',
            paramFieldName: 'test2',
            expectedResult: true
        }, {
            title: 'should be false if params filter field is equal previous filter field',
            paramFieldName: 'test1',
            expectedResult: false
        }];

        testCases.forEach(function (testCase) {
            it(testCase.title, function () {
                var mockFilters = [{
                    field: "test1",
                    step_type: "filter"
                }, {
                    field: testCase.paramFieldName,
                    step_type: "filter"
                }];

                var mockParamFilter = mockFilters[1];

                widgetFilterHandler.Data(mockFilters);
                widgetFilterHandler.SetTreeViewMode();

                var result = widgetFilterHandler.IsTreeViewHeader(mockParamFilter);

                expect(result).toEqual(testCase.expectedResult);
            });
        });

    });

    describe(".ShowAddFilterFromJumpPopup", function () {
        it("should set FollowupInfo", function () {
            spyOn(fieldsChooserHandler, 'ShowPopup').and.callFake($.noop);
            widgetFilterHandler.ShowAddFilterFromJumpPopup({});
            expect(widgetFilterHandler.FollowupInfo).not.toEqual(null);
            expect(fieldsChooserHandler.ShowPopup).toHaveBeenCalled();
        });
    });

    describe(".IsReadOnly", function () {
        var tests = [
            { canChange: true, canRemove: true, expected: false },
            { canChange: true, canRemove: false, expected: false },
            { canChange: false, canRemove: true, expected: false },
            { canChange: false, canRemove: false, expected: true }
        ];

        $.each(tests, function (index, test) {
            it("should get correct readonly status (canChange=" + test.canChange + ", canRemove=" + test.canRemove + ")", function () {
                spyOn(widgetFilterHandler, 'CanChange').and.returnValue(test.canChange);
                spyOn(widgetFilterHandler, 'CanRemove').and.returnValue(test.canRemove);
                var result = widgetFilterHandler.IsReadOnly();
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".CanAddFilterFromJump", function () {
        var tests = [
            { canChange: true, stepType: 'followup', viewMode: 'listview', expected: true },
            { canChange: false, stepType: 'followup', viewMode: 'listview', expected: false },
            { canChange: true, stepType: 'filter', viewMode: 'listview', expected: false },
            { canChange: true, stepType: 'followup', viewMode: 'treeview', expected: false },
            { canChange: false, stepType: 'filter', viewMode: 'treeview', expected: false }
        ];

        $.each(tests, function (index, test) {
            it("should get correct status for add filter from jump (canChange=" + test.canChange + ", stepType=" + test.stepType + ", viewMode=" + test.viewMode + ")", function () {
                spyOn(widgetFilterHandler, 'CanChange').and.returnValue(test.canChange);
                widgetFilterHandler.ViewMode(test.viewMode);
                var data = {
                    step_type: test.stepType
                };
                var result = widgetFilterHandler.CanAddFilterFromJump(data);
                expect(result).toEqual(test.expected);
            });
        });
    });
});
