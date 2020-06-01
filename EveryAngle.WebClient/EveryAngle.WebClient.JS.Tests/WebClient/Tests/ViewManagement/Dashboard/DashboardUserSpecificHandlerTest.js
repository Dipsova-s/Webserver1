/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ModelsHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewModels/Models/Dashboard/dashboardmodel.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Shared/ToastNotificationHandler.js" />
/// <chutzpah_reference path="/../../Dependencies/ViewManagement/Dashboard/DashboardUserSpecificHandler.js" />

describe("DashboardUserSpecificHandler", function () {
    var dashboardUserSpecificHandler;
    beforeEach(function () {
        var dashboardModel = new DashboardViewModel({});
        var unsavedModel = new DashboardViewModel({});
        dashboardUserSpecificHandler = new DashboardUserSpecificHandler(dashboardModel, unsavedModel);
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
                spyOn(dashboardUserSpecificHandler.DashboardModel, 'Data').and.returnValue({
                    authorizations: { update_user_specific: test.updateUserSpecific }
                });

                // actions
                var result = dashboardUserSpecificHandler.CanUpdate();

                // assert
                expect(result).toEqual(test.expected);
            });
        });
    });

    describe(".IsStarred", function () {
        it("should get starred", function () {
            //initial
            spyOn(dashboardUserSpecificHandler.DashboardModel, 'Data').and.returnValue({
                user_specific: {
                    is_starred: function () { return true; }
                }
            });

            // actions
            var result = dashboardUserSpecificHandler.IsStarred();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".SetFavorite", function () {
        beforeEach(function () {
            spyOn(dashboardUserSpecificHandler, 'IsStarred').and.returnValue(false);
            spyOn(dashboardUserSpecificHandler.DashboardModel, 'SetFavorite').and.returnValue($.when({
                user_specific: {
                    is_starred: true
                }
            }));
        });
        it("should not save", function () {
            // initial
            spyOn(dashboardUserSpecificHandler, 'CanUpdate').and.returnValue(false);

            // actions
            dashboardUserSpecificHandler.SetFavorite($());

            // assert
            expect(dashboardUserSpecificHandler.DashboardModel.SetFavorite).not.toHaveBeenCalled();
        });
        it("should save", function () {
            // initial
            spyOn(dashboardUserSpecificHandler, 'CanUpdate').and.returnValue(true);

            // actions
            dashboardUserSpecificHandler.SetFavorite($());

            // assert
            expect(dashboardUserSpecificHandler.DashboardModel.SetFavorite).toHaveBeenCalled();
            expect(dashboardUserSpecificHandler.UnsavedModel.Data().user_specific.is_starred()).toEqual(true);
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
                spyOn(dashboardUserSpecificHandler, 'CanUpdate').and.returnValue(test.updateUserSpecific);
                spyOn(dashboardUserSpecificHandler, 'GetPrivateNote').and.returnValue(test.privateNote);

                // actions
                var result = dashboardUserSpecificHandler.HasPrivateNote();

                // assert
                expect(!!result).toEqual(test.expected);
            });
        });
    });

    describe(".GetPrivateNote", function () {
        it("should get private note", function () {
            //initial
            spyOn(dashboardUserSpecificHandler.DashboardModel, 'Data').and.returnValue({
                user_specific: {
                    private_note: function () { return 'private note'; }
                }
            });

            // actions
            var result = dashboardUserSpecificHandler.GetPrivateNote();

            // assert
            expect(result).toEqual('private note');
        });
    });

    describe(".InitialPrivateNote", function () {
        var html;
        beforeEach(function () {
            html = $('<div id="TabContentDashboard" />').appendTo('body');
            html.append('<div class="card card-light section-personal-note editable"><div class="card-body section-personal-note-body"><textarea id="txtareaYourNote" rows="3" maxlength="100">update personal note</textarea></div></div>');

        });
        afterEach(function () {
            html.remove('#TabContentDashboard');
        });

        it('should initial private note', function () {
            // initail
            spyOn(dashboardUserSpecificHandler, 'CreateEditNoteUI');

            // actions
            dashboardUserSpecificHandler.InitialPrivateNote(jQuery("#TabContentDashboard .section-personal-note"));
            jQuery("#TabContentDashboard .section-personal-note .card-body").trigger('click');

            // assert
            expect(dashboardUserSpecificHandler.CreateEditNoteUI).toHaveBeenCalled();
        });
    });

    describe(".CreateEditNoteUI", function () {
        var html;
        beforeEach(function () {
            html = $('<div id="TabContentDashboard" />').appendTo('body');
            html.append('<div class="card card-light section-personal-note editable"><div class="card-body"></div></div>');

            spyOn(jQuery.fn, 'val').and.returnValue($());
            spyOn(jQuery.fn, 'on').and.returnValue($());
            spyOn(jQuery.fn, 'trigger').and.returnValue($());
        });
        afterEach(function () {
            html.remove('#TabContentDashboard');
        });

        it('should not create edit note UI', function () {
            // initail
            spyOn(dashboardUserSpecificHandler, 'CanUpdate').and.returnValue(false);

            // actions
            dashboardUserSpecificHandler.CreateEditNoteUI($('#TabContentDashboard .section-personal-note'), {});

            expect(jQuery.fn.val).toHaveBeenCalledTimes(0);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(0);
            expect(jQuery.fn.trigger).toHaveBeenCalledTimes(0);
        });

        it('should create edit note UI', function () {
            // initail
            var event = { currentTarget: null };
            spyOn(dashboardUserSpecificHandler, 'CanUpdate').and.returnValue(true);

            // actions
            dashboardUserSpecificHandler.CreateEditNoteUI($('#TabContentDashboard .section-personal-note'), event);

            // assert
            expect(jQuery.fn.val).toHaveBeenCalledTimes(1);
            expect(jQuery.fn.on).toHaveBeenCalledTimes(3);
            expect(jQuery.fn.trigger).toHaveBeenCalledTimes(2);

            expect(jQuery("#TabContentDashboard .section-personal-note").hasClass('editable')).toEqual(true);
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
            dashboardUserSpecificHandler.UpdateTextareaNoteHeight(event);

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
                spyOn(dashboardUserSpecificHandler, 'UpdateTextareaNoteHeight');
                spyOn(dashboardUserSpecificHandler, 'DoneEditNote');

                // actions
                dashboardUserSpecificHandler.OnTypingNote($(), event);

                // assert
                expect(dashboardUserSpecificHandler.UpdateTextareaNoteHeight).toHaveBeenCalledTimes(1);
                expect(dashboardUserSpecificHandler.DoneEditNote).toHaveBeenCalledTimes(test.expectedCall);
            });
        });
    });

    describe(".DoneEditNote", function () {
        var html;
        beforeEach(function () {
            html = $('<div id="TabContentDashboard" />').appendTo('body');
            html.append('<div class="card card-light section-personal-note editable"><div class="card-body"><textarea id="txtareaYourNote" rows="3" maxlength="100">update personal note</textarea></div></div>');

        });
        afterEach(function () {
            html.remove('#TabContentDashboard');
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
                spyOn(dashboardUserSpecificHandler, 'GetPrivateNote').and.returnValue(test.privateNote);  
                spyOn(dashboardUserSpecificHandler, 'SavePrivateNote').and.returnValue($.when());
                spyOn(dashboardUserSpecificHandler, 'RefreshPrivateNote');

                // actions
                dashboardUserSpecificHandler.DoneEditNote($('#TabContentDashboard .section-personal-note'), test.isSave);

                // assert
                expect(dashboardUserSpecificHandler.SavePrivateNote).toHaveBeenCalledTimes(test.expectedSavePrivateNote);
                expect(dashboardUserSpecificHandler.RefreshPrivateNote).toHaveBeenCalledTimes(test.expectedResetPrivateNote);

                expect(jQuery("#TabContentDashboard .section-personal-note .card-body").hasClass('editable')).toEqual(false);
            });
        });
    });

    describe(".SavePrivateNote", function () {
        it('should set private note and call save done', function () {
            //initial
            spyOn(dashboardUserSpecificHandler.DashboardModel, 'SetPrivateNote').and.returnValue($.when({
                user_specific: {
                    private_note: 'private note'
                }
            }));
            spyOn(dashboardUserSpecificHandler.UnsavedModel, 'Data').and.returnValue({
                user_specific: {
                    private_note: function () { return 'private note'; }
                }
            });
            spyOn(dashboardUserSpecificHandler, 'SaveDone');

            // actions
            dashboardUserSpecificHandler.SavePrivateNote('my note');

            // assert
            expect(dashboardUserSpecificHandler.DashboardModel.SetPrivateNote).toHaveBeenCalled();
            expect(dashboardUserSpecificHandler.UnsavedModel.Data).toHaveBeenCalled();
            expect(dashboardUserSpecificHandler.SaveDone).toHaveBeenCalled();
        });
    });

    describe(".RefreshPrivateNote", function () {
        it("should refresh a private note", function () {
            // initial
            spyOn(dashboardUserSpecificHandler.DashboardModel, 'Data').and.returnValue({
                user_specific: {
                    private_note: {
                        notifySubscribers: function () { return 'notifySubscribers'; }
                    }
                }
            });
            spyOn(dashboardUserSpecificHandler.DashboardModel.Data().user_specific.private_note, 'notifySubscribers');

            // actions
            dashboardUserSpecificHandler.RefreshPrivateNote();

            // assert
            expect(dashboardUserSpecificHandler.DashboardModel.Data().user_specific.private_note.notifySubscribers).toHaveBeenCalled();
        });
    });

    describe(".InitialExecuteAtLogon", function () {
        it("should apply knockout", function () {
            // initial
            spyOn(WC.HtmlHelper, 'ApplyKnockout');

            // actions
            dashboardUserSpecificHandler.InitialExecuteAtLogon();

            // assert
            expect(WC.HtmlHelper.ApplyKnockout).toHaveBeenCalled();
        });
    });

    describe(".GetExecuteAtLogon", function () {
        it("should get an execute at logon", function () {
            //initial
            spyOn(dashboardUserSpecificHandler.DashboardModel, 'Data').and.returnValue({
                user_specific: {
                    execute_on_login: function () { return true; }
                }
            });

            // actions
            var result = dashboardUserSpecificHandler.GetExecuteAtLogon();

            // assert
            expect(result).toEqual(true);
        });
    });

    describe(".ExecuteOnLoginChanged", function () {
        it('should call save', function () {
            // initial
            spyOn(dashboardUserSpecificHandler, 'GetExecuteAtLogon').and.returnValue(false);
            spyOn(dashboardUserSpecificHandler.DashboardModel, 'SetExecuteOnLogin').and.returnValue($.when({
                user_specific: {
                    execute_on_login: true
                }
            }));
            spyOn(dashboardUserSpecificHandler, 'SaveDone');

            // actions
            var result = dashboardUserSpecificHandler.ExecuteOnLoginChanged();

            // assert
            expect(result).toEqual(true);
            expect(dashboardUserSpecificHandler.CanExecuteAtLogon()).toEqual(true);
            expect(dashboardUserSpecificHandler.DashboardModel.SetExecuteOnLogin).toHaveBeenCalled();
            expect(dashboardUserSpecificHandler.SaveDone).toHaveBeenCalled();
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
                title: 'should not call toast when is_adhoc = true',
                is_adhoc: true,
                expected: 0
            }
        ];

        $.each(tests, function (index, test) {
            it(test.title, function () {
                //initial
                spyOn(dashboardUserSpecificHandler.DashboardModel, 'IsTemporaryDashboard').and.returnValue(test.is_adhoc);
                spyOn(toast, 'MakeSuccessTextFormatting');
                spyOn(dashboardUserSpecificHandler.UnsavedModel, 'Data').and.returnValue({
                    user_specific: {
                        private_note: function () { return 'private note'; }
                    }
                });

                // actions
                dashboardUserSpecificHandler.SaveDone();

                // assert
                expect(toast.MakeSuccessTextFormatting).toHaveBeenCalledTimes(test.expected);
            });
        });
    });
});
