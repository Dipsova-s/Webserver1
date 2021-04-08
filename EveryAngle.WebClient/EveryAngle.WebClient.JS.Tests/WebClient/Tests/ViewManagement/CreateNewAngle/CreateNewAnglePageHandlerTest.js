/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/AboutSystemHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/CreateNewAngle/createnewanglepagehandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/HelpTextHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/SystemSettingHandler.js" />

describe("CreateNewAnglePageHandlerTest", function () {

    var createNewAngleViewManagementModel;

    beforeEach(function () {
        createNewAngleViewManagementModel = new CreateNewAngleViewManagementModel();
        createNewAngleViewManagementModel.CurrentModelData = {};
        window.createAngleSchemaHtmlTemplate = function () { return "<div />" };
    });

    describe(".CanUseTemplate", function () {

        var angle = {
            template_has_invalid_classes: false,
            displays_summary: [{ display_type: 'list' }]
        };

        it("can use the template", function () {
            expect(createNewAngleViewManagementModel.CanUseTemplate(angle)).toEqual(true);
        });

        it("cannot use the template", function () {
            angle.template_has_invalid_classes = true;
            expect(createNewAngleViewManagementModel.CanUseTemplate(angle)).toEqual(false);
        });
    });

    describe(".GetListFields", function () {
        var resultModel = {
            Data: function () {
                return { query_fields: '' };
            }
        };

        beforeEach(function () {
            spyOn(displayModel, "GenerateDefaultField").and.callFake($.noop);
            spyOn(displayModel, "GetDefaultListFields").and.callFake($.noop);
        });

        it("if skip template, function GenerateDefaultField have been called", function () {
            var skipTemplate = true;
            createNewAngleViewManagementModel.GetListFields(skipTemplate, resultModel);
            expect(displayModel.GenerateDefaultField).toHaveBeenCalled();
        });

        it("if not skip template, function GetDefaultListFields have been called", function () {
            var skipTemplate = false;
            createNewAngleViewManagementModel.GetListFields(skipTemplate, resultModel);
            expect(displayModel.GetDefaultListFields).toHaveBeenCalled();
        });
    });

    describe(".SelectBusinessProcesses", function () {
        it("should select the first active and allowed BP", function () {
            var result = [{ id: 'P2P', enabled: false, is_allowed: false },
            { id: 'S2D', enabled: true, is_allowed: true },
            { id: 'IT', enabled: false, is_allowed: false }];

            var handler = { Data: $.noop };
            spyOn(handler, 'Data').and.returnValue(result);
            spyOn(window, 'BusinessProcessesViewModel').and.returnValue(handler);
            spyOn(businessProcessHandler, 'ManageBPAuthorization').and.returnValue();

            var result = createNewAngleViewManagementModel.SelectBusinessProcesses();
            expect(result).toEqual('S2D');
        });
    });

    describe(".ShowCreateAngleBySchema", function () {

        beforeEach(function () {
            buttonSimple = $('<a id=\"ButtonCreateAngleFromSchemaSimple\"/>').appendTo('body');
            buttonDetailed = $('<a id=\"ButtonCreateAngleFromSchemaDetailed\"/>').appendTo('body');
        });

        afterEach(function () {
            buttonSimple.remove();
            buttonDetailed.remove();
        });

        it("should not show CreateNewAngleBySchema popup if Continue buttons are disabled", function () {
            // arrange
            buttonSimple.addClass('disabled');
            buttonDetailed.addClass('disabled');
            spyOn(createNewAngleViewManagementModel, 'CloseCreateOption');
            spyOn(popup, 'Show');

            // act
            createNewAngleViewManagementModel.ShowCreateAngleBySchema(createNewAngleViewManagementModel.SCHEMAVIEWTYPE.SIMPLE);

            // assert
            expect(createNewAngleViewManagementModel.CloseCreateOption).not.toHaveBeenCalled();
            expect(popup.Show).not.toHaveBeenCalled();
        });

        it("should show CreateNewAngleBySchema popup if Continue buttons are enabled", function () {
            // arrange
            spyOn(createNewAngleViewManagementModel, 'CloseCreateOption');
            spyOn(popup, 'Show');

            // act
            createNewAngleViewManagementModel.ShowCreateAngleBySchema(createNewAngleViewManagementModel.SCHEMAVIEWTYPE.DETAILED);

            // assert
            expect(createNewAngleViewManagementModel.CloseCreateOption).toHaveBeenCalled();
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".ShowCreateAngleBySchemaCallback", function () {
        it("should call functions by sequence", function () {
            // arrange
            var e = {
                sender: {
                    element: {
                        find: function () { return { busyIndicator: $.noop } }
                    }
                }
            };
            var bpViewModel = {
                Theme: $.noop,
                MultipleActive: $.noop,
                CanEmpty: $.noop,
                ClickCallback: $.noop,
                ApplyHandler: $.noop,
                CurrentActive: $.noop
            };
            createNewAngleViewManagementModel.CreateAngleSettings = {
                createby_schema: {
                    'simple': {
                        'bp': 'S2D'
                    }
                }
            };
            createNewAngleViewManagementModel.CurrentModelData = {
                short_name: "EA2_800"
            };
            spyOn(window, 'BusinessProcessesViewModel').and.returnValue(bpViewModel);
            spyOn(createNewAngleViewManagementModel, 'SetSchemaHelpTexts');
            spyOn(createNewAngleViewManagementModel, 'SetSchemaDiagram');
            spyOn(WC.HtmlHelper, 'ApplyKnockout');
            spyOn(popup, 'Show');
            spyOn(window, 'setTimeout');
            createNewAngleViewManagementModel.ShowCreateAngleBySchema(createNewAngleViewManagementModel.SCHEMAVIEWTYPE.SIMPLE);

            // act
            createNewAngleViewManagementModel.ShowCreateAngleBySchemaCallback(e);

            // assert
            expect(createNewAngleViewManagementModel.SetSchemaHelpTexts).toHaveBeenCalled();
            expect(createNewAngleViewManagementModel.SetSchemaDiagram).toHaveBeenCalled();
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
            expect(popup.Show).toHaveBeenCalled();
        });
    });

    describe(".GetSchemaData", function () {

        beforeEach(function () {
            createNewAngleViewManagementModel.DataAngleSchema = []
        });

        var tests = [
            {
                title: 'should get new schema data with model',
                bp: 'S2D',
                mode: 'detailed',
                schemaData: [
                    {
                        'Key': 'S2D_objects',
                        'ModelName': 'EA2_800'
                    }
                ],
                modelData: {
                    id: 'EA2_800'
                },
                expected: {
                    'Key': 'S2D_objects',
                    'ModelName': 'EA2_800'
                }
            },
            {
                title: 'should get new schema data without model',
                bp: 'S2D',
                mode: 'simple',
                schemaData: [
                    {
                        'Key': 'S2D_activities',
                        'ModelName': ''
                    }
                ],
                modelData: {
                    id: 'EA2_800'
                },
                expected: {
                    'Key': 'S2D_activities',
                    'ModelName': ''
                }
            },
            {
                title: 'should get old schema data with model',
                bp: 'S2D',
                mode: 'simple',
                schemaData: [
                    {
                        'Key': 'S2D_Basic',
                        'ModelName': 'EA2_800'
                    }
                ],
                modelData: {
                    id: 'EA2_800'
                },
                expected: {
                    'Key': 'S2D_Basic',
                    'ModelName': 'EA2_800'
                }
            },
            {
                title: 'should get old schema data without model',
                bp: 'S2D',
                mode: 'detailed',
                schemaData: [
                    {
                        'Key': 'P2P_Detailed',
                        'ModelName': ''
                    },
                    {
                        'Key': 'S2D_Detailed',
                        'ModelName': ''
                    }
                ],
                modelData: {
                    id: 'EA2_800'
                },
                expected: {
                    'Key': 'S2D_Detailed',
                    'ModelName': ''
                }
            },
            {
                title: 'should get no schema data when data not found ',
                bp: 'S2D',
                mode: 'simple',
                schemaData: [
                    {
                        'Key': 'P2P_objects',
                        'ModelName': ''
                    },
                    {
                        'Key': 'O2C_objects',
                        'ModelName': ''
                    }
                ],
                modelData: {
                    id: 'EA2_800'
                },
                expected: null
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                // arrange
                createNewAngleViewManagementModel.CurrentModelData = test.modelData;
                createNewAngleViewManagementModel.DataAngleSchema = test.schemaData;

                // act
                var result = createNewAngleViewManagementModel.GetSchemaData(test.bp, test.mode);

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".GetHelptextFilters", function () {
        it("should get Helptext filters for valid Helptext Ids", function () {
            // arrange
            var schemaData = {
                Key: 'S2D_objects',
                Details: [
                    { ClassId: 'ea_s2d_1', IsValidHelptextId: true },
                    { ClassId: 'ea_s2d_2', IsValidHelptextId: true },
                    { ClassId: 'ea_s2d_3', IsValidHelptextId: false },
                    { ClassId: 'ea_s2d_4', IsValidHelptextId: true },
                    { ClassId: 'ea_s2d_5', IsValidHelptextId: false },
                ]
            };
            var expected = ["ea_s2d_1", "ea_s2d_2", "ea_s2d_4"]
            businessProcessesModel.CreateNewAngleSchemaBusinessProcess = {
                GetActive: $.noop
            };
            spyOn(businessProcessesModel.CreateNewAngleSchemaBusinessProcess, 'GetActive').and.returnValue("S2D");
            spyOn(createNewAngleViewManagementModel, 'GetSchemaData').and.returnValue(schemaData);

            // act
            var result = createNewAngleViewManagementModel.GetHelptextFilters();

            // assert
            expect(result).toEqual(expected);
        });
    });

    describe(".SetSchemaHelpTexts", function () {
        it("should set SchemaName when Helptext filters exist", function () {
            // arrange
            spyOn(createNewAngleViewManagementModel, 'GetHelptextFilters').and.returnValue(["ea_class_1", "ea_class_2", "ea_class_3"]);
            spyOn(createNewAngleViewManagementModel, 'LoadHelptextsByIds').and.returnValue(jQuery.when({ help_texts: [] }));
            spyOn(createNewAngleViewManagementModel, 'SetSchemaName');

            // act
            createNewAngleViewManagementModel.SetSchemaHelpTexts();

            // assert
            expect(createNewAngleViewManagementModel.SetSchemaName).toHaveBeenCalled();
        });
        it("should not set SchemaName when Helptext filters does not exist", function () {
            // arrange
            spyOn(createNewAngleViewManagementModel, 'GetHelptextFilters').and.returnValue([]);
            spyOn(createNewAngleViewManagementModel, 'SetSchemaName');

            // act
            createNewAngleViewManagementModel.SetSchemaHelpTexts();

            // assert
            expect(createNewAngleViewManagementModel.SetSchemaName).not.toHaveBeenCalled();
        });
    });

    describe(".LoadHelptextsByIds", function () {
        it("should return helpTexts for helpText Ids", function () {
            // input
            var helpTextIds = ["ea_class_1", "ea_class_2"];

            // arrange
            spyOn(helpTextHandler, 'LoadHelpTextByIds').and.returnValue(jQuery.when({
                help_texts: [
                    { html_help: '', id: 'ea_class_1', long_name: '', short_name: '', uri: 'null/not_found/ea_class_1' },
                    { html_help: '', id: 'ea_class_2', long_name: '', short_name: '', uri: 'null/not_found/ea_class_2' }
                ]
            }));
            spyOn(helpTextHandler, 'GetHelpTextById')
            spyOn(helpTextHandler, 'SetData')

            // act
            $.when(createNewAngleViewManagementModel.LoadHelptextsByIds(helpTextIds))
                .done(function (result) {
                    // assert
                    expect(result).toEqual({
                        help_texts: [
                            { html_help: '', id: 'ea_class_1', long_name: '', short_name: '', uri: 'null/not_found/ea_class_1' },
                            { html_help: '', id: 'ea_class_2', long_name: '', short_name: '', uri: 'null/not_found/ea_class_2' },
                            { html_help: '', id: 'ea_class_1', long_name: '', short_name: '', uri: 'null/not_found/ea_class_1' },
                            { html_help: '', id: 'ea_class_2', long_name: '', short_name: '', uri: 'null/not_found/ea_class_2' }
                        ]
                    });
                });
        });
        it("should return empty help_texts array for empty helpText Ids", function () {
            // input
            var helpTextIds = [];

            // arrange
            spyOn(helpTextHandler, 'LoadHelpTextByIds').and.returnValue(jQuery.when({ help_texts: [] }));
            spyOn(helpTextHandler, 'GetHelpTextById')
            spyOn(helpTextHandler, 'SetData')

            // act
            $.when(createNewAngleViewManagementModel.LoadHelptextsByIds(helpTextIds))
                .done(function (result) {
                    // assert
                    expect(result).toEqual({ help_texts: [] });
                });
        });
    });

    describe(".SetSchemaDiagram", function () {

        beforeEach(function () {
            schemaArea = $('<div id=\"Schema\"/>').appendTo('body');
        });

        afterEach(function () {
            schemaArea.remove();
        });

        it("should set Schema Diagram with valid/invalid helptexts, correct styles, simulate single/double click", function () {
            // arrange
            var schemaData = {
                Key: 'S2D_objects',
                Details: [
                    {
                        Name: 'Plant',
                        ClassId: 'ea_class_plant',
                        TemplateId: 'ea_tpl_plant',
                        AreaStyle: {
                            BorderColor: '#ffffff',
                            VerticalAlignment: 'baseline',
                            TextColor: '#000000',
                            FontWeight: '500',
                            TextAlignment: 'center',
                            FontSize: '16px'
                        },
                        Coordinate: [5, 5, 200, 100],
                        IsValidHelptextId: true
                    },
                    {
                        Name: 'Stock',
                        ClassId: 'ea_class_stock',
                        TemplateId: 'ea_tpl_stock',
                        AreaStyle: {
                            BorderColor: '#ffffff'
                        },
                        Coordinate: [15, 20, 200, 100],
                    }
                ],
                Picture: '/Resources/image.png'
            };
            businessProcessesModel.CreateNewAngleSchemaBusinessProcess = {
                GetActive: $.noop
            };
            spyOn(businessProcessesModel.CreateNewAngleSchemaBusinessProcess, 'GetActive').and.returnValue("S2D");
            createNewAngleViewManagementModel.CreateAngleSettings = {
                createby_schema: {}
            };
            spyOn(createNewAngleViewManagementModel, 'SaveSettings');
            spyOn(createNewAngleViewManagementModel, 'SetSchemaTemplates').and.returnValue($.when());
            spyOn(createNewAngleViewManagementModel, 'SetSchemaHelpTexts');
            spyOn(createNewAngleViewManagementModel, 'GetPictureFromSchemaData');
            spyOn(createNewAngleViewManagementModel, 'ShowSchemaDefaultHelp');
            spyOn(createNewAngleViewManagementModel, 'GetSchemaData').and.returnValue(schemaData);

            // act
            createNewAngleViewManagementModel.SetSchemaDiagram();

            // assert function calls
            expect(createNewAngleViewManagementModel.SaveSettings).toHaveBeenCalled();
            expect(createNewAngleViewManagementModel.SetSchemaHelpTexts).toHaveBeenCalled();
            expect(createNewAngleViewManagementModel.GetPictureFromSchemaData).toHaveBeenCalled();
            expect(createNewAngleViewManagementModel.ShowSchemaDefaultHelp).toHaveBeenCalled();
            expect(createNewAngleViewManagementModel.SetSchemaTemplates).toHaveBeenCalled();
            expect(createNewAngleViewManagementModel.GetSchemaData).toHaveBeenCalled();

            // assert DOM element
            expect($('#Schema').children().length).not.toEqual(0);
            expect($('#classid_plant').css('width')).toEqual(schemaData.Details[0].Coordinate[2] + 'px');
            expect($('#classid_plant').css('height')).toEqual(schemaData.Details[0].Coordinate[3] + 'px');
            expect($('#classid_plant').css('border-color')).toEqual('rgba(0, 0, 0, 0)');
            expect($('#templateid_ea_tpl_plant').css('vertical-align')).toEqual(schemaData.Details[0].AreaStyle.VerticalAlignment);
            expect($('#templateid_ea_tpl_plant').css('color')).toEqual('rgb(0, 0, 0)');
            expect($('#templateid_ea_tpl_plant').css('font-weight')).toEqual(schemaData.Details[0].AreaStyle.FontWeight);
            expect($('#templateid_ea_tpl_plant').css('text-align')).toEqual(schemaData.Details[0].AreaStyle.TextAlignment);
            expect($('#templateid_ea_tpl_plant').css('font-size')).toEqual(schemaData.Details[0].AreaStyle.FontSize);

            /***** For invalid Helptext Id ******/
            expect($('#classid_stock').attr('title')).toEqual('The id: ea_class_stock is not valid');
            expect($('#classid_stock').hasClass('validWarning')).toEqual(true);
            expect($('#classid_stock').attr('name')).toEqual('classid_ea_class_stock');

            /***** show helpText description on single click ******/
            spyOn(createNewAngleViewManagementModel, 'MapClicked');

            // act
            $('#classid_plant').trigger('click');

            // assert
            expect(createNewAngleViewManagementModel.MapClicked).toHaveBeenCalled();

            /***** create new angle on double click ******/
            spyOn(createNewAngleViewManagementModel, 'CreateNewAngleFromSchema');
            $('#classid_plant').removeClass('disabled');

            // act
            $('#classid_plant').trigger('dblclick');

            // assert
            expect(createNewAngleViewManagementModel.CreateNewAngleFromSchema).toHaveBeenCalled();
        });
    });

    describe(".GetPictureFromSchemaData", function () {
        it("should get picture location when schemaData exist", function () {
            var schemaData = {
                Picture: "//Resources/Images/S2D_functions.png"
            };

            var result = createNewAngleViewManagementModel.GetPictureFromSchemaData(schemaData);

            expect(result).toEqual("/resources/images/s2d_functions.png");
        });
        it("should get blank picture when schemaData null", function () {
            var schemaData = null

            var result = createNewAngleViewManagementModel.GetPictureFromSchemaData(schemaData);

            expect(result).toEqual('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');
        });
    });

    describe(".GetTemplateFilters", function () {
        it("should get Template filters for valid TemplateIds", function () {
            // arrange
            var schemaData = {
                Key: 'S2D_objects',
                Details: [
                    { TemplateId: 'ea_class_1', IsValidTemplateId: false },
                    { TemplateId: 'ea_class_2', IsValidTemplateId: true },
                    { TemplateId: 'ea_class_3', IsValidTemplateId: false },
                    { TemplateId: 'ea_class_4', IsValidTemplateId: true },
                    { TemplateId: 'ea_class_5', IsValidTemplateId: true },
                ]
            };
            var expected = ["ea_class_2", "ea_class_4", "ea_class_5"]
            businessProcessesModel.CreateNewAngleSchemaBusinessProcess = {
                GetActive: $.noop
            };
            spyOn(businessProcessesModel.CreateNewAngleSchemaBusinessProcess, 'GetActive').and.returnValue("S2D");
            spyOn(createNewAngleViewManagementModel, 'GetSchemaData').and.returnValue(schemaData);

            // act
            var result = createNewAngleViewManagementModel.GetTemplateFilters();

            // assert
            expect(result).toEqual(expected);
        });
    });

    describe(".ShowSchemaDefaultHelp", function () {

        beforeEach(function () {
            element = $(
                '<div id=\"Schema\">'
                + '<div class=\"SubClass active\" />'
                + '<div class=\"SubClass\" />'
                + '<div class=\"SubClass\" />'
                + '</div>')
                .appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });

        it("should show default text and deactivate active objects", function () {
            // arrange
            var schemaData = {
                DefaultHelp: 'EA_S2D_OBJECT_INTRO'
            };
            spyOn(createNewAngleViewManagementModel, 'ShowSchemaHelptextDescription');

            // act
            createNewAngleViewManagementModel.ShowSchemaDefaultHelp(schemaData);

            // assert
            expect(createNewAngleViewManagementModel.ShowSchemaHelptextDescription).toHaveBeenCalled();
            expect(createNewAngleViewManagementModel.SelectedSchema()).toEqual(null);
            expect(element.children().hasClass('active')).toEqual(false);

        });
    });

    describe(".ShowSchemaHelptextDescription", function () {
        it("should show Empty helptext in Area", function () {
            spyOn(helpTextHandler, 'ShowHelpTextInArea');

            createNewAngleViewManagementModel.ShowSchemaHelptextDescription(null);

            expect(helpTextHandler.ShowHelpTextInArea).toHaveBeenCalled();
        });
        it("should show helptext in Area if loading helptext successful", function () {
            spyOn(createNewAngleViewManagementModel, 'LoadHelptextsByIds').and.returnValue($.when());
            spyOn(helpTextHandler, 'ShowHelpTextInArea');

            createNewAngleViewManagementModel.ShowSchemaHelptextDescription('helpId');

            expect(helpTextHandler.ShowHelpTextInArea).toHaveBeenCalled();
        });
        it("should not show helptext in Area if loading helptext unsuccessful", function () {
            spyOn(createNewAngleViewManagementModel, 'LoadHelptextsByIds').and.returnValue($.Deferred().fail());
            spyOn(helpTextHandler, 'ShowHelpTextInArea');

            createNewAngleViewManagementModel.ShowSchemaHelptextDescription('helpId');

            expect(helpTextHandler.ShowHelpTextInArea).not.toHaveBeenCalled();
        });
    });

    describe(".SetGrayout", function () {

        beforeEach(function () {
            element = $(
                '<div id=\"Schema\">'
                + '<div><a id=\"templateid_ea_class_tpl_plant\"></a></div>'
                + '<div><a id=\"templateid_ea_class_tpl_material\"></a></div>'
                + '<div><a id=\"templateid_ea_class_tpl_stock\"></a></div>'
                + '</div>')
                .appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });

        it("should enable/disable templates which are valid/invalid", function () {
            var angles = [
                { id: 'EA_CLASS_TPL_PLANT' },
                { id: 'EA_CLASS_TPL_MATERIAL' },
                { id: 'EA_CLASS_TPL_STOCK' }
            ];
            var expected = [true, false, true];
            spyOn(createNewAngleViewManagementModel, 'CanUseTemplate').and.returnValues(true, false, true);

            createNewAngleViewManagementModel.SetGrayout(angles);

            $('#Schema div').each(function (index) {
                expect($(this).hasClass('disabled')).toEqual(!expected[index]);
            });
        });
    });

    describe(".SetSchemaName", function () {

        beforeEach(function () {
            element = $(
                '<div id="Schema">'
                + '<div name="classid_001"><a><span class="inprogress"></span></a></div>'
                + '<div name="classid_002"><a class="short"><span class="inprogress"></span></a></div>'
                + '<div name="classid_003"><a><span class="inprogress"></span></a></div>'
                + '</div>')
                .appendTo('body');
        });

        afterEach(function () {
            element.remove();
        });

        it("should set schemaName as long_name, short_name or id", function () {
            // arrange
            var helpTexts = [
                { id: '001', long_name: 'class_001' },
                { id: '002', short_name: 'c_002' },
                { id: '003' }
            ];
            var expectedSchemaName = ["class_001", "c_002", "003"];

            // act
            createNewAngleViewManagementModel.SetSchemaName(helpTexts);

            // assert
            $('#Schema span').each(function (index) {
                expect($(this).hasClass('inprogress')).toEqual(false);
                expect($(this).text()).toEqual(expectedSchemaName[index]);
            });
        });
    });

    describe(".SetSchemaTemplates", function () {
        it("should call SetGrayout", function () {
            // arrange
            spyOn(createNewAngleViewManagementModel, 'GetTemplateFilters').and.returnValue(["angle_001"]);
            spyOn(window, 'GetDataFromWebService').and.returnValue($.when({ angles: [] }));
            spyOn(createNewAngleViewManagementModel, 'SetGrayout');

            // act
            createNewAngleViewManagementModel.SetSchemaTemplates();

            // assert
            expect(createNewAngleViewManagementModel.SetGrayout).toHaveBeenCalled();
        });
    });
});