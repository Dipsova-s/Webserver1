using AngleWarnings;
using EveryAngle.ManagementConsole.Helpers;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Linq;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class AngleWarningsTaskActionTests : UnitTestBase
    {
        [TestCase]
        public void AngleWarningsTaskAction_ShouldContainModelName()
        {
            string modelName = "EA2_800";

            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelName);

            ModelArgument modelArgument = (ModelArgument)taskAction.Arguments.FirstOrDefault(x => x.Name == "model");
            Assert.AreEqual(modelArgument.Value, modelName);
        }

        [TestCase]
        public void AngleWarningsTaskAction_AddTargetIds_ShouldSucceed()
        {
            string modelName = "EA2_800";

            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelName);

            taskAction.AddTargetId(WarningFix.ReplaceField, "angleId1", "displayId1");
            TargetIdArgument targetIdArgument = (TargetIdArgument)taskAction.Arguments.FirstOrDefault(x => x.Name == "target_ids");

            Assert.AreEqual(targetIdArgument.Value[0].AngleId, "angleId1");
            Assert.AreEqual(targetIdArgument.Value[0].DisplayId, "displayId1");
        }

        [TestCase]
        public void AngleWarningsTaskAction_AddTargetIdsWithNoDisplay_ShouldSucceed()
        {
            string modelName = "EA2_800";

            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelName);

            taskAction.AddTargetId(WarningFix.ReplaceField, "angleId1", null);
            TargetIdArgument targetIdArgument = (TargetIdArgument)taskAction.Arguments.FirstOrDefault(x => x.Name == "target_ids");

            Assert.IsNull(targetIdArgument.Value[0].DisplayId);
        }

        [TestCase]
        public void AngleWarningsTaskAction_AddActionArgument_ReplaceField1_ShouldSucceed()
        {
            string modelName = "EA2_800";
            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelName);

            AngleWarningsContentInput contentInput = new AngleWarningsContentInput(WarningFix.ReplaceField, "R2020SP5", "WorkOrder", "FieldA", "FieldB");

            taskAction.AddActionArgument("FieldA", contentInput, "WorkOrder", new string[] { "unsupported_display_field" });

            ActionArgument actionArgument = (ActionArgument)taskAction.Arguments.FirstOrDefault(x => x.Name == "action");

            ReplaceField_ActionParameters actionParameters = (ReplaceField_ActionParameters)actionArgument.Value.Parameter;

            Assert.AreEqual(actionArgument.Value.Action, "replace_field");
            Assert.AreEqual(actionParameters.Field, "FieldA");
            Assert.AreEqual(actionParameters.ReplaceWith, "FieldB");
            Assert.AreEqual(actionParameters.Objects, new string[] { "WorkOrder" });
            Assert.AreEqual(actionParameters.Types, new string[] { "unsupported_display_field" });
        }

        [TestCase]
        public void AngleWarningsTaskAction_AddActionArgument_ReplaceField2_ShouldSucceed()
        {
            string modelName = "EA2_800";
            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelName);

            AngleWarningsContentInput contentInput = new AngleWarningsContentInput(WarningFix.ReplaceField, "R2020SP5", "Material", "Material__FieldA", "Material__FieldB");

            taskAction.AddActionArgument("Material__FieldA", contentInput, "WorkOrder", new string[] { "unsupported_display_field" });

            ActionArgument actionArgument = (ActionArgument)taskAction.Arguments.FirstOrDefault(x => x.Name == "action");

            ReplaceField_ActionParameters actionParameters = (ReplaceField_ActionParameters)actionArgument.Value.Parameter;

            Assert.AreEqual(actionArgument.Value.Action, "replace_field");
            Assert.AreEqual(actionParameters.Field, "Material__FieldA");
            Assert.AreEqual(actionParameters.ReplaceWith, "Material__FieldB");
            Assert.AreEqual(actionParameters.Objects, new string[] { "WorkOrder" });
            Assert.AreEqual(actionParameters.Types, new string[] { "unsupported_display_field" });
        }

        [TestCase]
        public void AngleWarningsTaskAction_AddActionArgument_ReplaceClass_ShouldSucceed()
        {
            string modelName = "EA2_800";
            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelName);

            AngleWarningsContentInput contentInput = new AngleWarningsContentInput(WarningFix.ReplaceClass, "R2020SP5", "InternalOrder", "InternalOrder", "WorkOrder");

            taskAction.AddActionArgument(null, contentInput, "InternalOrder", new string[] { "unsupported_start_object" });

            ActionArgument actionArgument = (ActionArgument)taskAction.Arguments.FirstOrDefault(x => x.Name == "action");

            ActionValue actionValue = (ActionValue)actionArgument.Value;
            ReplaceStartObject_ActionParameters actionParameters = (ReplaceStartObject_ActionParameters)actionArgument.Value.Parameter;

            Assert.AreEqual(actionValue.Action, "replace_start_object");
            Assert.AreEqual(actionParameters.Objects, new string[] { "InternalOrder" });
            Assert.AreEqual(actionParameters.ReplaceWith, new string[] { "WorkOrder" });
            Assert.AreEqual(actionParameters.Types, new string[] { "unsupported_start_object" });
        }

        [TestCase]
        public void AngleWarningsTaskAction_AddActionArgument_ReplaceSublist_ShouldSucceed()
        {
            string modelName = "EA2_800";
            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelName);

            AngleWarningsContentInput contentInput = new AngleWarningsContentInput(WarningFix.ReplaceSublist, "R2020SP5", "InternalOrder", "SublistAs", "SublistBs");

            taskAction.AddActionArgument(null, contentInput, "InternalOrder", new string[] { "unsupported_jump" });

            ActionArgument actionArgument = (ActionArgument)taskAction.Arguments.FirstOrDefault(x => x.Name == "action");

            ActionValue actionValue = (ActionValue)actionArgument.Value;
            ReplaceJump_ActionParameters actionParameters = (ReplaceJump_ActionParameters)actionArgument.Value.Parameter;

            Assert.AreEqual(actionValue.Action, "replace_jump");
            Assert.AreEqual(actionParameters.Objects, new string[] { "InternalOrder" });
            Assert.AreEqual(actionParameters.Jump, "SublistAs");
            Assert.AreEqual(actionParameters.ReplaceWith, "SublistBs");
            Assert.AreEqual(actionParameters.Types, new string[] { "unsupported_jump" });
        }

        [TestCase]
        public void AngleWarningsTaskAction_AddActionArgument_ReplaceReference_ShouldSucceed()
        {
            string modelName = "EA2_800";
            AngleWarningsTaskAction taskAction = new AngleWarningsTaskAction(modelName);

            AngleWarningsContentInput contentInput = new AngleWarningsContentInput(WarningFix.ReplaceReference, "R2020SP5", "BillingDocumentItem", "Test_ref_Payer", "Payer__Description");

            taskAction.AddActionArgument("Test_ref_Payer__Description", contentInput, "BillingDocumentItem", new string[] { "unsupported_display_field" });

            ActionArgument actionArgument = (ActionArgument)taskAction.Arguments.FirstOrDefault(x => x.Name == "action");

            ActionValue actionValue = (ActionValue)actionArgument.Value;
            ReplaceField_ActionParameters actionParameters = (ReplaceField_ActionParameters)actionArgument.Value.Parameter;

            Assert.AreEqual(actionValue.Action, "replace_field");
            Assert.AreEqual(actionParameters.Objects, new string[] { "BillingDocumentItem" });
            Assert.AreEqual(actionParameters.Field, "Test_ref_Payer__Description");
            Assert.AreEqual(actionParameters.ReplaceWith, "Payer__Description");
            Assert.AreEqual(actionParameters.Types, new string[] { "unsupported_display_field" });
        }
    }
}