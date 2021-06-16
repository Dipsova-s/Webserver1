using AngleWarnings;
using EveryAngle.ManagementConsole.Helpers;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class AngleWarningsTaskCreatorTests : UnitTestBase
    {
        [SetUp]
        public override void Setup()
        {
            base.Setup();
        }

        [TestCase]
        public void AngleWarningsTaskCreator_ShouldReturnCorrectJsonTask()
        {
            string modelName = "EA2_800";

            MainTaskModel mainTaskModel = new MainTaskModel("localEAAdmin");

            //Replace start object
            AngleWarningsContentInput contentInput = new AngleWarningsContentInput(WarningFix.ReplaceClass, "R2020SP4", "Internalorder", "Internalorder", "Workorder");
            AngleWarningsTaskAction actionReplaceStartObject = new AngleWarningsTaskAction(modelName);
            actionReplaceStartObject.AddTargetId(contentInput.Fix, "eadf5b93fbb20a4827ab7e5a25b93994e1", null);
            actionReplaceStartObject.AddActionArgument("Internalorder", contentInput, "Internalorder", new string[] { "unsupported_start_object" });
            mainTaskModel.AddAction(actionReplaceStartObject);

            // Replace field
            AngleWarningsContentInput contentInput2 = new AngleWarningsContentInput(WarningFix.ReplaceField, "R2020SP4", "PurchaseOrderScheduleLine", "DeliveryTimeRealizedInWorkingDays", "DeliveryTimeRealizedInWorkDays");
            AngleWarningsTaskAction actionReplaceField = new AngleWarningsTaskAction(modelName);
            actionReplaceField.AddTargetId(contentInput2.Fix, "eadf5b93fbb20a4827ab7e5a25b93994e1", "de3a904054afb7feac660621183330004");
            actionReplaceField.AddActionArgument("DeliveryTimeRealizedInWorkingDays", contentInput2, "PurchaseOrderScheduleLine", new string[] { "unsupported_display_field" });
            mainTaskModel.AddAction(actionReplaceField);

            //Replace reference
            AngleWarningsContentInput contentInput3 = new AngleWarningsContentInput(WarningFix.ReplaceReference, "R2020SP4", "BillingDocumentItem", "Test_ref_Payer", "Payer__Description");
            AngleWarningsTaskAction actionReplaceReference = new AngleWarningsTaskAction(modelName);
            actionReplaceReference.AddTargetId(contentInput3.Fix, "eadf5b93fbb20a4827ab7e5a25b93994e1", "de3a904054afb7feac660621183330004");
            actionReplaceReference.AddActionArgument("Test_ref_Payer__Description", contentInput3, "BillingDocumentItem", new string[] { "unsupported_display_field" });
            mainTaskModel.AddAction(actionReplaceReference);

            string actualJson = mainTaskModel.GetJsonRequest();
            string expectedJsonString = GetExpectedJsonString();

            JObject actualJObject = JObject.Parse(actualJson);
            JObject ExceptectedJObject = JObject.Parse(expectedJsonString);

            Assert.IsTrue(JObject.DeepEquals(actualJObject, ExceptectedJObject));
        }

        [TestCase]
        public void AngleWarningsTaskCreator_ShouldThrowExceptions()
        {
            Assert.Throws<ArgumentException>(() => new AngleWarningsTaskAction(null));
        }

        private string GetExpectedJsonString()
        {
            // This is an actual sample of a angle warnings tool api call
            return @"
{
  ""name"": ""Solve angle warnings"",
  ""description"": ""This task use for solve angle warnings by user selected actions."",
  ""delete_after_completion"": false,
  ""enabled"": true,
  ""run_as_user"": ""localEAAdmin"",
  ""actions"": [
    {
      ""action_type"": ""solve_angle_warnings"",
      ""arguments"": [
        {
          ""name"": ""model"",
          ""value"": ""EA2_800""
        },
        {
          ""name"": ""target_ids"",
          ""value"": [
            {
              ""angle_id"": ""eadf5b93fbb20a4827ab7e5a25b93994e1""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_start_object"",
            ""parameter"": {
              ""objects"": [
                ""Internalorder""
              ],
              ""replace_with"": [
                ""Workorder""
              ],
              ""types"": [
                ""unsupported_start_object""
              ]
            }
          }
        }
      ],
      ""notification"": null,
      ""run_as_user"": null,
      ""approval_state"": ""approved""
    },
    {
      ""action_type"": ""solve_angle_warnings"",
      ""arguments"": [
        {
          ""name"": ""model"",
          ""value"": ""EA2_800""
        },
        {
          ""name"": ""target_ids"",
          ""value"": [
            {
              ""angle_id"": ""eadf5b93fbb20a4827ab7e5a25b93994e1"",
              ""display_id"": ""de3a904054afb7feac660621183330004""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_field"",
            ""parameter"": {
              ""objects"": [
                ""PurchaseOrderScheduleLine""
              ],
              ""field"": ""DeliveryTimeRealizedInWorkingDays"",
              ""replace_with"": ""DeliveryTimeRealizedInWorkDays"",
              ""types"": [
                ""unsupported_display_field""
              ]
            }
          }
        }
      ],
      ""notification"": null,
      ""run_as_user"": null,
      ""approval_state"": ""approved""
    },
    {
      ""action_type"": ""solve_angle_warnings"",
      ""arguments"": [
        {
          ""name"": ""model"",
          ""value"": ""EA2_800""
        },
        {
          ""name"": ""target_ids"",
          ""value"": [
            {
              ""angle_id"": ""eadf5b93fbb20a4827ab7e5a25b93994e1"",
              ""display_id"": ""de3a904054afb7feac660621183330004""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_field"",
            ""parameter"": {
              ""objects"": [
                ""BillingDocumentItem""
              ],
              ""field"": ""Test_ref_Payer__Description"",
              ""replace_with"": ""Payer__Description"",
              ""types"": [
                ""unsupported_display_field""
              ]
            }
          }
        }
      ],
      ""notification"": null,
      ""run_as_user"": null,
      ""approval_state"": ""approved""
    }
  ]
}";
        }
    }
}