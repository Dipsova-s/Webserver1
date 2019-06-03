/// <reference path="/Dependencies/ViewModels/Shared/DataType/DataType.js" />
/// <reference path="/Dependencies/ViewModels/Models/User/usersettingmodel.js" />
/// <reference path="/Dependencies/ViewModels/Models/Angle/AngleInfoModel.js" />

describe("AngleInfoModel test", function () {
    var angleInfoModel;

    beforeEach(function () {
        angleInfoModel = new AngleInfoViewModel();
    });

    describe("when create new instance", function () {
        it("object should be defined", function () {
            expect(angleInfoModel).toBeDefined();
        });

        it(": Properties of instance are not undefined", function () {
            expect(angleInfoModel.AngleName).toBeDefined();
            expect(angleInfoModel.Data()).toBeDefined();
            expect(angleInfoModel.Name()).toBeDefined();
            expect(angleInfoModel.IsStarred()).toBeDefined();
            expect(angleInfoModel.IsPublished()).toBeDefined();
            expect(angleInfoModel.IsTemplate()).toBeDefined();
            expect(angleInfoModel.IsTempTemplate()).toBeDefined();
            expect(angleInfoModel.IsValidated()).toBeDefined();
            expect(angleInfoModel.IsTempValidated()).toBeDefined();
            expect(angleInfoModel.ModelName()).toBeDefined();
            expect(angleInfoModel.ModelName().ShortName()).toBeDefined();
            expect(angleInfoModel.ModelName().LongName()).toBeDefined();
            expect(angleInfoModel.ModelName().FriendlyName()).toBeDefined();
            expect(angleInfoModel.PrivateNote()).toBeDefined();
            expect(angleInfoModel.AngleId()).toBeDefined();
            expect(angleInfoModel.Description()).toBeDefined();
            expect(angleInfoModel.AllowMoreDetails()).toBeDefined();
            expect(angleInfoModel.AllowFollowups()).toBeDefined();
            expect(angleInfoModel.CreatedBy()).toBeDefined();
            expect(angleInfoModel.ChangedBy()).toBeDefined();
            expect(angleInfoModel.ExecutedBy()).toBeDefined();
            expect(angleInfoModel.ValidatedBy()).toBeDefined();
            expect(angleInfoModel.DeletedBy()).toBeDefined();
            expect(angleInfoModel.TimeExcuted()).toBeDefined();
            expect(angleInfoModel.IsNewAngle()).toBeDefined();
            expect(angleInfoModel.TemporaryAngleName).toBeDefined();
            expect(angleInfoModel.TemporaryAngle()).toBeDefined();
            expect(angleInfoModel.Languages).toBeDefined();
            expect(angleInfoModel.Languages.List()).toBeDefined();
            expect(angleInfoModel.ModelServerAvailable).toBeDefined();
        });

        it(": Function of instance are not undefined", function () {
            expect(angleInfoModel.Load).toBeDefined();
            expect(angleInfoModel.LoadAngle).toBeDefined();
            expect(angleInfoModel.SetData).toBeDefined();
            expect(angleInfoModel.DeleteReadOnlyAngleProperties).toBeDefined();
            expect(angleInfoModel.UpdateAngle).toBeDefined();
        });
    });

    describe("call UpdatePublicationsWatcher", function () {

        beforeEach(function () {
            angleInfoModel.Data(mockAngles[0]);
            angleInfoModel.Data.commit();

            jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[0].uri, angleInfoModel.Data().display_definitions[0].is_public);
            jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[1].uri, angleInfoModel.Data().display_definitions[1].is_public);
            jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[2].uri, angleInfoModel.Data().display_definitions[2].is_public);
        });

        it("should set publication status for each Display", function () {
            angleInfoModel.UpdatePublicationsWatcher();

            var watcher1 = jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[0].uri);
            var watcher2 = jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[1].uri);
            var watcher3 = jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[2].uri);

            expect(watcher1).toEqual(true);
            expect(watcher2).toEqual(false);
            expect(watcher3).toEqual(true);
        });

        it("should set publication status to true", function () {
            angleInfoModel.UpdatePublicationsWatcher(true);

            var watcher1 = jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[0].uri);
            var watcher2 = jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[1].uri);
            var watcher3 = jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[2].uri);

            expect(watcher1).toEqual(true);
            expect(watcher2).toEqual(true);
            expect(watcher3).toEqual(true);
        });

        it("should set publication status to false", function () {
            angleInfoModel.UpdatePublicationsWatcher(false);

            var watcher1 = jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[0].uri);
            var watcher2 = jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[1].uri);
            var watcher3 = jQuery.storageWatcher('__watcher_dashboard_publications_' + angleInfoModel.Data().display_definitions[2].uri);

            expect(watcher1).toEqual(false);
            expect(watcher2).toEqual(false);
            expect(watcher3).toEqual(false);
        });

    });

    describe("call SetExecutedBy", function () {

        it("cannot get executed if executed and changed are not defined", function () {
            angleInfoModel.SetExecutedBy(undefined, undefined);

            var executedBy = angleInfoModel.ExecutedBy();

            expect(executedBy.datetime).not.toBeDefined();
            expect(executedBy.full_name).not.toBeDefined();
        });

        it("can get executed if it is defined", function () {
            var executed = ({ datetime: 1474284511 , full_name: 'EAAdmin'});

            angleInfoModel.SetExecutedBy(executed, undefined);

            var executedBy = angleInfoModel.ExecutedBy();

            expect(executedBy.datetime).toContain('Sep/19/2016');
            expect(executedBy.full_name).toEqual('EAAdmin');
        });

        it("can get exected if executed is not defined but changed is defined", function () {
            var changed = ({ datetime: 1474284511, full_name: 'EAAdmin' });

            angleInfoModel.SetExecutedBy(undefined, changed);

            var executedBy = angleInfoModel.ExecutedBy();

            expect(executedBy.datetime).toContain('Sep/19/2016');
            expect(executedBy.full_name).toEqual('EAAdmin');
        });
    });
});
