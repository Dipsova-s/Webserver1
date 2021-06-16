using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Controllers;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using Moq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.AngleWarningsInput
{
    public class AngleWarningsAutoSolverTests : UnitTestBase
    {
        [TestCase]
        public void GetNumberOfSolvableFieldsViaInputFile_NoInputFile_ShouldReturn0()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(false);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            Assert.AreEqual(0, autoSolver.GetNumberOfSolvableFieldsViaInputFile(null));
        }

        [TestCase]
        public void GetNumberOfSolvableFieldsViaInputFile__ShouldSucceed()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.CountFieldMatches(It.IsAny<string>(), It.IsAny<JObject>())).Returns(5);
            contentInputter.Setup(x => x.TryReadInputList()).Returns(true);

            JObject angleWarning1st = new JObject();
            string serializeSummary = JsonConvert.SerializeObject(new AngleWarningsSummaryViewModel());

            List<AngleWarningFirstLevelViewmodel> firstLevelList = new List<AngleWarningFirstLevelViewmodel>();

            AngleWarningFirstLevelViewmodel firstLevelWarning = new AngleWarningFirstLevelViewmodel
            {
                Id = "unsupported_display_field",
                Count = 1,
                Severity = "warning",
                Uri = "/"
            };

            firstLevelList.Add(firstLevelWarning);
            firstLevelList.Add(firstLevelWarning);

            angleWarning1st.Add("data", JToken.FromObject(firstLevelList));
            angleWarning1st.Add("summary", JToken.FromObject(serializeSummary));
            modelService.Setup(x => x.GetAngleWarningFirstLevel(It.IsAny<string>())).Returns(angleWarning1st);

            JObject angleWarning2nd = new JObject();
            string serializeSolution = JsonConvert.SerializeObject(new List<AngleWarningsSolutionsViewModel>());
            angleWarning2nd.Add("data", JToken.FromObject(new List<AngleWarningSecondLevelViewmodel>()));
            angleWarning2nd.Add("solutions", JToken.FromObject(serializeSolution));
            modelService.Setup(x => x.GetAngleWarningSecondLevel(It.IsAny<string>())).Returns(angleWarning2nd);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            AngleWarningsController testingController;
            testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoSolver, sessionHelper.Object);

            NameValueCollection valueCollection = GetAngleWarningFilters();

            FormCollection formCollection = new FormCollection(valueCollection);

            JsonResult result = testingController.ReadAngleWarnings(null, "/models/1", formCollection) as JsonResult;
            AngleWarningsController.AngleWarningsDataSourceResult viewmodels = result.Data as AngleWarningsController.AngleWarningsDataSourceResult;

            Assert.AreEqual(10, autoSolver.GetNumberOfSolvableFieldsViaInputFile(viewmodels));
        }

        [TestCase]
        public void AutoSolver_WithInvalidFileOrNoModelId_ShouldFail()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.TryReadInputList()).Returns(false);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            Assert.That(() => autoSolver.ExecuteAngleWarningsUsingInputFile("EA2_800"), Throws.TypeOf<Exception>());
            Assert.That(() => autoSolver.ExecuteAngleWarningsUsingInputFile(""), Throws.TypeOf<ArgumentException>());
        }

        [TestCase]
        [Ignore] //dennis
        public void AutoSolverRun_MultipleTargets()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.CountFieldMatches(It.IsAny<string>(), It.IsAny<JObject>())).Returns(5);
            contentInputter.Setup(x => x.TryReadInputList()).Returns(true);

            ItemSolver contentInput1 = new ItemSolver(WarningFix.ReplaceField, "R2020", "Order", "FieldA", "FieldB");

            contentInputter.Setup(x => x.GetInputBySolutionClassAndField("unsupported_display_field", "Purchase", "Order__FieldA", null)).Returns(contentInput1);

            JObject angleWarning1st = new JObject();
            string serializeSummary = JsonConvert.SerializeObject(new AngleWarningsSummaryViewModel());

            angleWarning1st.Add("data", JToken.FromObject(GetFirstLeveWarningsList(1)));
            angleWarning1st.Add("summary", JToken.FromObject(serializeSummary));
            modelService.Setup(x => x.GetAngleWarningFirstLevel(It.IsAny<string>())).Returns(angleWarning1st);

            List<AngleWarningSecondLevelViewmodel> secondLevelList = GetSecondLevelWarningsList(11);

            JObject angleWarning2nd = new JObject();
            string serializeSolution = JsonConvert.SerializeObject(new List<AngleWarningsSolutionsViewModel>());
            angleWarning2nd.Add("data", JToken.FromObject(secondLevelList));
            angleWarning2nd.Add("solutions", JToken.FromObject(serializeSolution));

            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/1&offset=0&limit=300")).Returns(angleWarning2nd);

            List<AngleWarningThirdLevelViewmodel> thirdLevelList = GetThirdLevelWarningsList(2);

            JObject angleWarning3rd = new JObject();
            angleWarning3rd.Add("data", JToken.FromObject(thirdLevelList));
            modelService.Setup(x => x.GetAngleWarningThirdLevel(It.IsAny<string>())).Returns(angleWarning3rd);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            AngleWarningsController testingController;
            testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoSolver, sessionHelper.Object);

            NameValueCollection valueCollection = GetAngleWarningFilters();

            FormCollection formCollection = new FormCollection(valueCollection);

            JsonResult result = testingController.ReadAngleWarnings(null, "/models/1", formCollection) as JsonResult;
            AngleWarningsController.AngleWarningsDataSourceResult viewmodels = result.Data as AngleWarningsController.AngleWarningsDataSourceResult;

            string json = autoSolver.ExecuteAngleWarningsUsingInputFile("EA2_800");

            JObject actualJObject = JObject.Parse(json);

            string jsson = ExpectedJsonMultipleTargets();

            JObject ExceptectedJObject = JObject.Parse(ExpectedJsonMultipleTargets());

            Assert.IsTrue(JObject.DeepEquals(ExceptectedJObject, actualJObject));
        }

        [TestCase]
        [Ignore] //dennis
        public void CompleteAutoSolverRun()
        {
            Mock<IAngleWarningsContentInputter> contentInputter = new Mock<IAngleWarningsContentInputter>();
            contentInputter.Setup(x => x.CountFieldMatches(It.IsAny<string>(), It.IsAny<JObject>())).Returns(5);
            contentInputter.Setup(x => x.TryReadInputList()).Returns(true);

            AngleWarningsContentInput contentInput1 = new AngleWarningsContentInput(WarningFix.ReplaceField, "R2020", "Order", "FieldA", "FieldB");
            AngleWarningsContentInput contentInput2 = new AngleWarningsContentInput(WarningFix.ReplaceClass, "R2020", "InternalOrder", "InternalOrder", "WorkOrder");
            AngleWarningsContentInput contentInput3 = new AngleWarningsContentInput(WarningFix.ReplaceField, "R2020", "Batch", "FieldB", "FieldC");
            AngleWarningsContentInput contentInput4 = new AngleWarningsContentInput(WarningFix.ReplaceReference, "R2020", "InternalOrder", "InternalOrder", "WorkOrder");
            AngleWarningsContentInput contentInput5 = new AngleWarningsContentInput(WarningFix.ReplaceReference, "R2020", "BillingDocumentItem", "Test_ref_Payer", "Payer");

            contentInputter.Setup(x => x.GetInputBySolutionClassAndField("unsupported_display_field", "Order", "FieldA", null)).Returns(contentInput1);
            contentInputter.Setup(x => x.GetInputBySolutionClassAndField("unsupported_start_object", "InternalOrder", null, null)).Returns(contentInput2);
            contentInputter.Setup(x => x.GetInputBySolutionClassAndField("unsupported_sorting_field", "Batch", "FieldB", null)).Returns(contentInput3);
            contentInputter.Setup(x => x.GetInputBySolutionClassAndField("unsupported_filter_field", "Batch", "FieldB", null)).Returns(contentInput3);
            contentInputter.Setup(x => x.GetInputBySolutionClassAndField("unsupported_grouping_field", "Batch", "FieldB", null)).Returns(contentInput3);
            contentInputter.Setup(x => x.GetInputBySolutionClassAndField("unsupported_aggregration_field", "Batch", "FieldB", null)).Returns(contentInput3);
            contentInputter.Setup(x => x.GetInputBySolutionClassAndField("unsupported_jump", "PurchaseOrderScheduleLine", null, "InternalOrder")).Returns(contentInput4);
            contentInputter.Setup(x => x.GetInputBySolutionClassAndField("unsupported_display_field", "BillingDocumentItem", "Test_ref_Payer__Description", null)).Returns(contentInput5);

            JObject angleWarning1st = new JObject();
            string serializeSummary = JsonConvert.SerializeObject(new AngleWarningsSummaryViewModel());

            angleWarning1st.Add("data", JToken.FromObject(GetFirstLeveWarningsList(0)));
            angleWarning1st.Add("summary", JToken.FromObject(serializeSummary));
            modelService.Setup(x => x.GetAngleWarningFirstLevel(It.IsAny<string>())).Returns(angleWarning1st);

            List<AngleWarningSecondLevelViewmodel> secondLevelList = GetSecondLevelWarningsList(1);
            List<AngleWarningSecondLevelViewmodel> secondLevelList2 = GetSecondLevelWarningsList(2);
            List<AngleWarningSecondLevelViewmodel> secondLevelList3456 = GetSecondLevelWarningsList(3);
            List<AngleWarningSecondLevelViewmodel> secondLevelList7 = GetSecondLevelWarningsList(5);

            JObject angleWarning2nd = new JObject();
            string serializeSolution = JsonConvert.SerializeObject(new List<AngleWarningsSolutionsViewModel>());
            angleWarning2nd.Add("data", JToken.FromObject(secondLevelList));
            angleWarning2nd.Add("solutions", JToken.FromObject(serializeSolution));

            JObject angleWarning2nd2 = new JObject();
            string serializeSolution2 = JsonConvert.SerializeObject(new List<AngleWarningsSolutionsViewModel>());
            angleWarning2nd2.Add("data", JToken.FromObject(secondLevelList2));
            angleWarning2nd2.Add("solutions", JToken.FromObject(serializeSolution2));

            JObject angleWarning2nd3 = new JObject();
            string serializeSolution3 = JsonConvert.SerializeObject(new List<AngleWarningsSolutionsViewModel>());
            angleWarning2nd3.Add("data", JToken.FromObject(secondLevelList3456));
            angleWarning2nd3.Add("solutions", JToken.FromObject(serializeSolution3));

            JObject angleWarning2nd4 = new JObject();
            string serializeSolution4 = JsonConvert.SerializeObject(new List<AngleWarningsSolutionsViewModel>());
            angleWarning2nd4.Add("data", JToken.FromObject(secondLevelList7));
            angleWarning2nd4.Add("solutions", JToken.FromObject(serializeSolution4));

            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/1&offset=0&limit=300")).Returns(angleWarning2nd);
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/2&offset=0&limit=300")).Returns(angleWarning2nd2);
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/3&offset=0&limit=300")).Returns(angleWarning2nd3);
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/4&offset=0&limit=300")).Returns(angleWarning2nd3);
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/5&offset=0&limit=300")).Returns(angleWarning2nd3);
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/6&offset=0&limit=300")).Returns(angleWarning2nd3);
            modelService.Setup(x => x.GetAngleWarningSecondLevel("http://TH-EATST01.everyangle.org:30500/model/test/7&offset=0&limit=300")).Returns(angleWarning2nd4);

            List<AngleWarningThirdLevelViewmodel> thirdLevelList = GetThirdLevelWarningsList(1);

            JObject angleWarning3rd = new JObject
            {
                { "data", JToken.FromObject(thirdLevelList) }
            };

            List<AngleWarningThirdLevelViewmodel> thirdLevelList2 = GetThirdLevelWarningsList(3);

            JObject angleWarning3rd2 = new JObject
            {
                { "data", JToken.FromObject(thirdLevelList2) }
            };

            modelService.Setup(x => x.GetAngleWarningThirdLevel("")).Returns(angleWarning3rd);
            modelService.Setup(x => x.GetAngleWarningThirdLevel("unsupported_start_object")).Returns(angleWarning3rd2);

            AngleWarningsAutoSolver autoSolver = new AngleWarningsAutoSolver(modelService.Object, contentInputter.Object);
            autoSolver.Initialize(sessionHelper.Object);

            AngleWarningsController testingController;
            testingController = new AngleWarningsController(modelService.Object, globalSettingService.Object, autoSolver, sessionHelper.Object);

            NameValueCollection valueCollection = new NameValueCollection();
            valueCollection.Add("id", "1");
            valueCollection.Add("level", "1");
            valueCollection.Add("uri", "/uri/x");
            valueCollection.Add("include_angles", "true");
            valueCollection.Add("include_public", "true");
            valueCollection.Add("include_private", "true");
            valueCollection.Add("include_validated", "true");
            valueCollection.Add("created_by", "test_user");
            valueCollection.Add("include_templates", "false");

            FormCollection formCollection = new FormCollection(valueCollection);

            JsonResult result = testingController.ReadAngleWarnings(null, "/models/1", formCollection) as JsonResult;

            string json = autoSolver.ExecuteAngleWarningsUsingInputFile("EA2_800");

            JObject actualJObject = JObject.Parse(json);

            string jsson = ExpectedJson();

            JObject ExceptectedJObject = JObject.Parse(ExpectedJson());

            Assert.IsTrue(JObject.DeepEquals(ExceptectedJObject, actualJObject));
        }

        private static List<AngleWarningThirdLevelViewmodel> GetThirdLevelWarningsList(int index)
        {
            List<AngleWarningThirdLevelViewmodel> thirdLevelList = new List<AngleWarningThirdLevelViewmodel>();

            AngleWarningThirdLevelViewmodel thirdLevel = null;

            if (index == 1 || index == 2)
            {
                thirdLevel = new AngleWarningThirdLevelViewmodel
                {
                    AngleId = "angleId1",
                    DisplayId = "displayId1"
                };

                thirdLevelList.Add(thirdLevel);
            }
          
            if (index == 2)
            {
                thirdLevel = new AngleWarningThirdLevelViewmodel
                {
                    AngleId = "angleId1",
                    DisplayId = "displayId2"
                };

                thirdLevelList.Add(thirdLevel);
            }

            if (index == 3)
            {
                thirdLevel = new AngleWarningThirdLevelViewmodel
                {
                    AngleId = "angleId1"
                };

                thirdLevelList.Add(thirdLevel);
            }

            return thirdLevelList;
        }

        private static List<AngleWarningSecondLevelViewmodel> GetSecondLevelWarningsList(int index)
        {
            List<AngleWarningSecondLevelViewmodel> secondLevelList = new List<AngleWarningSecondLevelViewmodel>();

            if (index == 1)
            {
                AngleWarningSecondLevelViewmodel secondLevel;
                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 2,
                    Field = "FieldA",
                    Object = "Order",
                    Uri = ""
                };
                secondLevelList.Add(secondLevel);

                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 1,
                    Field = "Test_ref_Payer__Description",
                    Object = "BillingDocumentItem",
                    Uri = ""
                };
                secondLevelList.Add(secondLevel);
            }

            if (index == 2)
            {
                AngleWarningSecondLevelViewmodel secondLevel;
                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 1,
                    Field = null,
                    Object = "InternalOrder",
                    Uri = "unsupported_start_object"
                };
                secondLevelList.Add(secondLevel);
            }

            if (index == 3)
            {
                AngleWarningSecondLevelViewmodel secondLevel;
                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 1,
                    Field = "FieldB",
                    Object = "Batch",
                    Uri = ""
                };
                secondLevelList.Add(secondLevel);
            }

            if (index == 4)
            {
                AngleWarningSecondLevelViewmodel secondLevel;
                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 2,
                    Field = "FieldA",
                    Object = "Order",
                    Uri = "testMultiple"
                };
                secondLevelList.Add(secondLevel);
            }

            if (index == 5)
            {
                AngleWarningSecondLevelViewmodel secondLevel;
                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 2,
                    Object = "PurchaseOrderScheduleLine",
                    Jump = "InternalOrder",
                    Uri = ""
                };
                secondLevelList.Add(secondLevel);
            }

            if (index == 10)
            {
                AngleWarningSecondLevelViewmodel secondLevel;
                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 1,
                    Object = "BillingDocumentItem",
                    Field = "Test_ref_Payer__Description",
                    Uri = ""
                };
                secondLevelList.Add(secondLevel);
            }

            if (index == 11)
            {
                AngleWarningSecondLevelViewmodel secondLevel;
                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 2,
                    Field = "Order__FieldA",
                    Object = "Purchase",
                    Uri = ""
                };
                secondLevelList.Add(secondLevel);
            }

            return secondLevelList;
        }

        private static List<AngleWarningFirstLevelViewmodel> GetFirstLeveWarningsList(int index)
        {
            List<AngleWarningFirstLevelViewmodel> firstLevelList = new List<AngleWarningFirstLevelViewmodel>();

            AngleWarningFirstLevelViewmodel firstLevelWarning = new AngleWarningFirstLevelViewmodel();
            firstLevelWarning.Id = "unsupported_display_field";
            firstLevelWarning.Count = 2;
            firstLevelWarning.Severity = "warning";
            firstLevelWarning.Uri = "model/test/1";
            firstLevelList.Add(firstLevelWarning);

            if (index == 1)
                return firstLevelList;

            firstLevelWarning = new AngleWarningFirstLevelViewmodel
            {
                Id = "unsupported_start_object",
                Count = 1,
                Severity = "error",
                Uri = "model/test/2"
            };
            firstLevelList.Add(firstLevelWarning);

            firstLevelWarning = new AngleWarningFirstLevelViewmodel
            {
                Id = "unsupported_sorting_field",
                Count = 1,
                Severity = "warning",
                Uri = "model/test/3"
            };
            firstLevelList.Add(firstLevelWarning);

            firstLevelWarning = new AngleWarningFirstLevelViewmodel
            {
                Id = "unsupported_filter_field",
                Count = 1,
                Severity = "warning",
                Uri = "model/test/4"
            };
            firstLevelList.Add(firstLevelWarning);

            firstLevelWarning = new AngleWarningFirstLevelViewmodel
            {
                Id = "unsupported_grouping_field",
                Count = 1,
                Severity = "warning",
                Uri = "model/test/5"
            };
            firstLevelList.Add(firstLevelWarning);

            firstLevelWarning = new AngleWarningFirstLevelViewmodel
            {
                Id = "unsupported_aggregration_field",
                Count = 1,
                Severity = "warning",
                Uri = "model/test/6"
            };
            firstLevelList.Add(firstLevelWarning);

            firstLevelWarning = new AngleWarningFirstLevelViewmodel
            {
                Id = "unsupported_jump",
                Count = 1,
                Severity = "error",
                Uri = "model/test/7"
            };
            firstLevelList.Add(firstLevelWarning);

            return firstLevelList;
        }

        private NameValueCollection GetAngleWarningFilters()
        {
            return new NameValueCollection
            {
                { "id", "1" },
                { "level", "1" },
                { "uri", "/uri/x" },
                { "include_angles", "true" },
                { "include_public", "true" },
                { "include_private", "true" },
                { "include_validated", "true" },
                { "created_by", "test_user" },
                { "include_templates", "false" }
            };
        }
        
        private string ExpectedJsonMultipleTargets()
        {
            return @"
{
  ""name"": ""Solve angle warnings"",
  ""description"": ""This task use for solve angle warnings by user selected actions."",
  ""delete_after_completion"": false,
  ""enabled"": true,
  ""run_as_user"": ""testing_user"",
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
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId1""
            },
            {
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId2""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_field"",
            ""parameter"": {
              ""objects"": [
                ""Purchase""
              ],
              ""field"": ""Order__FieldA"",
              ""replace_with"": ""Order__FieldB"",
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
}
";
        }

            private string ExpectedJson()
        {
            return @"
{
  ""name"": ""Solve angle warnings"",
  ""description"": ""This task use for solve angle warnings by user selected actions."",
  ""delete_after_completion"": false,
  ""enabled"": true,
  ""run_as_user"": ""testing_user"",
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
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId1""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_field"",
            ""parameter"": {
              ""objects"": [
                ""Order""
              ],
              ""field"": ""FieldA"",
              ""replace_with"": ""FieldB"",
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
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId1""
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
              ""angle_id"": ""angleId1""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_start_object"",
            ""parameter"": {
              ""objects"": [
                ""InternalOrder""
              ],
              ""replace_with"": [
                ""WorkOrder""
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
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId1""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_field"",
            ""parameter"": {
              ""objects"": [
                ""Batch""
              ],
              ""field"": ""FieldB"",
              ""replace_with"": ""FieldC"",
              ""types"": [
                ""unsupported_sorting_field""
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
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId1""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_field"",
            ""parameter"": {
              ""objects"": [
                ""Batch""
              ],
              ""field"": ""FieldB"",
              ""replace_with"": ""FieldC"",
              ""types"": [
                ""unsupported_filter_field""
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
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId1""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_field"",
            ""parameter"": {
              ""objects"": [
                ""Batch""
              ],
              ""field"": ""FieldB"",
              ""replace_with"": ""FieldC"",
              ""types"": [
                ""unsupported_grouping_field""
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
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId1""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_field"",
            ""parameter"": {
              ""objects"": [
                ""Batch""
              ],
              ""field"": ""FieldB"",
              ""replace_with"": ""FieldC"",
              ""types"": [
                ""unsupported_aggregration_field""
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
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId1""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""replace_jump"",
            ""parameter"": {
              ""objects"": [
                ""PurchaseOrderScheduleLine""
              ],
              ""jump"": ""InternalOrder"",
              ""replace_with"": ""WorkOrder"",
              ""types"": [
                ""unsupported_jump""
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
}
";
        }
    }
}
