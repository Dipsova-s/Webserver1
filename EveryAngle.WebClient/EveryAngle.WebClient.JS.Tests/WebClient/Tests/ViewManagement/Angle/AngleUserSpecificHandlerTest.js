/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usermodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/privileges.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/DisplayModel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/ResultModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/DirectoryHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/PopupPageHandlers.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ValidationHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/WidgetFilter/WidgetFilterHelper.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ItemDescription/ItemDescriptionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepView.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepViewModel.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryDefinitionHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepFilterHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepJumpHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/QueryDefinition/QueryStepSortableHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/BaseItemHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticView.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayStatisticHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/DisplayHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/ResultHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/businessprocesshandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleBusinessProcessHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Angle/AngleUserSpecificHandler.js" />
/// <reference path="/Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />

describe("AngleUserSpecificHandler", function () {
    var angleUserSpecificHandler;
    beforeEach(function () {
        angleUserSpecificHandler = new AngleUserSpecificHandler(new AngleHandler());
    });

    describe(".CanUpdate", function () {
        var tests = [
            {
                title: 'should return true when have authorization to update user specific',
                updateUserSpecific: true,
                expected: true
            },
            {
                title: 'should return false when do not have authorization to update user specific',
                updateUserSpecific: false,
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                //initial
                spyOn(angleUserSpecificHandler.AngleHandler, 'Data').and.returnValue({
                    authorizations: { update_user_specific: test.updateUserSpecific }
                });

                // actions
                var result = angleUserSpecificHandler.CanUpdate();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".Save", function () {
        it("should save then set data", function () {
            //initial
            spyOn(angleUserSpecificHandler.AngleHandler, 'IsAdhoc');
            spyOn(window, 'UpdateDataToWebService').and.returnValue($.when());
            spyOn(angleUserSpecificHandler, 'SetData');

            // actions
            angleUserSpecificHandler.Save();

            // assert
            expect(angleUserSpecificHandler.SetData).toHaveBeenCalled();
        });
    });

    describe(".SetData", function () {
        it("should set data", function () {
            //initial
            spyOn(angleUserSpecificHandler.AngleHandler, 'SetRawData');

            // actions
            var data = {
                user_specific: {
                    private_note: 'new note',
                    is_starred: 'new starred'
                }
            };
            angleUserSpecificHandler.SetData(data);

            // assert
            expect(angleUserSpecificHandler.AngleHandler.SetRawData).toHaveBeenCalled();
            expect(angleUserSpecificHandler.AngleHandler.Data().user_specific.private_note()).toEqual('new note');
            expect(angleUserSpecificHandler.AngleHandler.Data().user_specific.is_starred()).toEqual('new starred');
        });
    });

    describe(".HasPrivateNote", function () {
        var tests = [
            {
                title: 'should return true when have authorization to update user specific and private note',
                updateUserSpecific: true,
                privateNote: 'personal note',
                expected: true
            },
            {
                title: 'should return false when do not have authorization to update user specific',
                updateUserSpecific: false,
                privateNote: 'personal note',
                expected: false
            },
            {
                title: 'should return false when do not have private note',
                updateUserSpecific: true,
                privateNote: '',
                expected: false
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                //initial
                spyOn(angleUserSpecificHandler, 'CanUpdate').and.returnValue(test.updateUserSpecific);
                spyOn(angleUserSpecificHandler, 'GetPrivateNote').and.returnValue(test.privateNote);

                // actions
                var result = angleUserSpecificHandler.HasPrivateNote();

                // assert
                expect(!!result).toEqual(test.expected);
            });
        });
    });

    describe(".GetPrivateNote", function () {
        it("should get private note", function () {
            //initial
            spyOn(angleUserSpecificHandler.AngleHandler, 'Data').and.returnValue({
                user_specific: {
                    private_note: function () { return 'private note'; }
                }
            });

            // actions
            var result = angleUserSpecificHandler.GetPrivateNote();

            // assert
            expect(result).toEqual('private note');
        });
    });

    describe(".InitialPrivateNote", function () {
        var html;
        beforeEach(function () {
            html = $('<div id="TabContentAngle" />').appendTo('body');
            html.append('<div class="card card-light section-personal-note editable"><div class="card-body section-personal-note-body"><textarea id="txtareaYourNote" rows="3" maxlength="100">update personal note</textarea></div></div>');

        });
        afterEach(function () {
            html.remove('#TabContentAngle');
        });

        it('should initial private note', function () {
            // initail
            spyOn(angleUserSpecificHandler, 'CreateEditNoteUI');

            // actions
            angleUserSpecificHandler.InitialPrivateNote($('.section-personal-note'));
            jQuery("#TabContentAngle .section-personal-note .card-body").trigger('click');

            // assert
            expect(angleUserSpecificHandler.CreateEditNoteUI).toHaveBeenCalled();
        });
    });

    describe(".CreateEditNoteUI", function () {
        var html;
        beforeEach(function () {
            html = $('<div id="TabContentAngle" />').appendTo('body');
            html.append('<div class="card card-light section-personal-note editable"><div class="card-body"></div></div>');

            spyOn(jQuery.fn, 'val').and.returnValue($());
            spyOn(jQuery.fn, 'on').and.returnValue($());
            spyOn(jQuery.fn, 'trigger').and.returnValue($());
        });
        afterEach(function () {
            html.remove('#TabContentAngle');
        });

        it('should not create edit note UI', function () {
            // initail
            spyOn(angleUserSpecificHandler, 'CanUpdate').and.returnValue(false);

            // actions
            angleUserSpecificHandler.CreateEditNoteUI({});

            expect(jQuery.fn.val).toHaveBeenCalledTimes(0);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(0);
            expect(jQuery.fn.trigger).toHaveBeenCalledTimes(0);
        });

        it('should create edit note UI', function () {
            // initail
            var event = { currentTarget: null };
            spyOn(angleUserSpecificHandler, 'CanUpdate').and.returnValue(true);

            // actions
            angleUserSpecificHandler.CreateEditNoteUI($(), event);

            // assert
            expect(jQuery.fn.val).toHaveBeenCalledTimes(1);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(3);
            expect(jQuery.fn.trigger).toHaveBeenCalledTimes(2);

            expect(jQuery("#TabContentAngle .section-personal-note").hasClass('editable')).toEqual(true);
        });
    });

    describe(".UpdateTextareaNoteHeight", function () {
        it('should update textarea note height', function () {
            // initail
            var event = {
                currentTarget: {
                    scrollHeight: 100
                }
            };
            spyOn(jQuery.fn, 'height').and.returnValue($());

            // actions
            angleUserSpecificHandler.UpdateTextareaNoteHeight(event);

            // assert
            expect(jQuery.fn.height).toHaveBeenCalled();
        });
    });

    describe(".OnTypingNote", function () {
        var tests = [
            {
                title: 'should call DoneEditNote when event key == enter',
                key: 13,
                expectedCall: 1
            },
            {
                title: 'should call DoneEditNote when event key == esc',
                key: 27,
                expectedCall: 1
            },
            {
                title: 'should not call DoneEditNote when event key != enter or esc',
                key: 55,
                expectedCall: 0
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // initail
                var event = {
                    keyCode: test.key,
                    preventDefault: function () { }
                };
                spyOn(angleUserSpecificHandler, 'UpdateTextareaNoteHeight');
                spyOn(angleUserSpecificHandler, 'DoneEditNote');

                // actions
                angleUserSpecificHandler.OnTypingNote($(), event);

                // assert
                expect(angleUserSpecificHandler.UpdateTextareaNoteHeight).toHaveBeenCalledTimes(1);
                expect(angleUserSpecificHandler.DoneEditNote).toHaveBeenCalledTimes(test.expectedCall);
            });
        });
    });

    describe(".DoneEditNote", function () {
        var html;
        beforeEach(function () {
            html = $('<div id="TabContentAngle" />').appendTo('body');
            html.append('<div class="card card-light section-personal-note editable"><div class="card-body"><textarea id="txtareaYourNote" rows="3" maxlength="100">update personal note</textarea></div></div>');

        });
        afterEach(function () {
            html.remove('#TabContentAngle');
        });

        var tests = [
            {
                title: 'should save private note',
                isSave: true,
                privateNote: 'personal note',
                expectedSavePrivateNote: 1,
                expectedResetPrivateNote: 1
            },
            {
                title: 'should reset your note',
                isSave: false,
                privateNote: 'personal note',
                expectedSavePrivateNote: 0,
                expectedResetPrivateNote: 1
            }
        ];
        $.each(tests, function (index, test) {
            it(test.title, function () {
                // initail
                spyOn(angleUserSpecificHandler.AngleHandler, 'GetPrivateNote').and.returnValue(test.privateNote);  
                spyOn(angleUserSpecificHandler, 'SavePrivateNote').and.returnValue($.when());
                spyOn(angleUserSpecificHandler, 'RefreshPrivateNote');

                // actions
                angleUserSpecificHandler.DoneEditNote($(), test.isSave);

                // assert
                expect(angleUserSpecificHandler.SavePrivateNote).toHaveBeenCalledTimes(test.expectedSavePrivateNote);
                expect(angleUserSpecificHandler.RefreshPrivateNote).toHaveBeenCalledTimes(test.expectedResetPrivateNote);

                expect(jQuery("#TabContentAngle .section-personal-note .card-body").hasClass('editable')).toEqual(false);
            });
        });
    });

    describe(".SavePrivateNote", function () {
        it("should call save done", function () {
            // initial
            spyOn(angleUserSpecificHandler, 'Save').and.returnValue($.when({
                user_specific: {
                    private_note: 'private note'
                }
            }));
            spyOn(angleUserSpecificHandler, 'SaveDone');

            // actions
            angleUserSpecificHandler.SavePrivateNote('my note');

            // assert
            expect(angleUserSpecificHandler.Save).toHaveBeenCalled();
            expect(angleUserSpecificHandler.SaveDone).toHaveBeenCalled();
        });
    });

    describe(".RefreshPrivateNote", function () {
        it("should refresh a private note", function () {
            // actions
            spyOn(angleUserSpecificHandler.AngleHandler.Data().user_specific.private_note, 'notifySubscribers');
            angleUserSpecificHandler.RefreshPrivateNote();

            // assert
            expect(angleUserSpecificHandler.AngleHandler.Data().user_specific.private_note.notifySubscribers).toHaveBeenCalled();
        });
    });

    describe(".IsStarred", function () {
        it("should get starred", function () {
            // actions
            angleUserSpecificHandler.AngleHandler.Data().user_specific.is_starred(true);
            var result = angleUserSpecificHandler.IsStarred();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".SaveStarred", function () {
        it("should not save a starred", function () {
            // actions
            spyOn(angleUserSpecificHandler, 'CanUpdate').and.returnValue(false);
            spyOn(angleUserSpecificHandler, 'Save').and.returnValue($.when());
            spyOn(angleUserSpecificHandler, 'RefreshStarred');
            angleUserSpecificHandler.SaveStarred(null);

            // assert
            expect(angleUserSpecificHandler.Save).not.toHaveBeenCalled();
            expect(angleUserSpecificHandler.RefreshStarred).not.toHaveBeenCalled();
        });
        it("should save a starred", function () {
            // actions
            spyOn(angleUserSpecificHandler, 'CanUpdate').and.returnValue(true);
            spyOn(angleUserSpecificHandler, 'Save').and.returnValue($.when());
            spyOn(angleUserSpecificHandler, 'RefreshStarred');
            angleUserSpecificHandler.SaveStarred(null);

            // assert
            expect(angleUserSpecificHandler.Save).toHaveBeenCalled();
            expect(angleUserSpecificHandler.RefreshStarred).toHaveBeenCalled();
        });
    });

    describe(".RefreshStarred", function () {
        it("should refresh a starred", function () {
            // actions
            spyOn(angleUserSpecificHandler.AngleHandler.Data().user_specific.is_starred, 'notifySubscribers');
            angleUserSpecificHandler.RefreshStarred();

            // assert
            expect(angleUserSpecificHandler.AngleHandler.Data().user_specific.is_starred.notifySubscribers).toHaveBeenCalled();
        });
    });

    describe(".SaveDone", function () {
        var tests = [
            {
                title: 'should call toast when is_adhoc = false',
                is_adhoc: false,
                expected: 1
            },
            {
                title: 'should call toast when is_adhoc = true',
                is_adhoc: true,
                expected: 0
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                //initial
                spyOn(angleUserSpecificHandler.AngleHandler, 'IsAdhoc').and.returnValue(test.is_adhoc);
                spyOn(toast, 'MakeSuccessTextFormatting');

                // actions
                angleUserSpecificHandler.SaveDone();

                // assert
                expect(toast.MakeSuccessTextFormatting).toHaveBeenCalledTimes(test.expected);
            });
        });
    });
});
