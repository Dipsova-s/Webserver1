using EveryAngle.Core.ViewModels.Model;
using EveryAngle.ManagementConsole.Controllers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Web.Mvc;
using static EveryAngle.ManagementConsole.Controllers.AngleWarningsController;

namespace EveryAngle.ManagementConsole.Test.AngleWarningsInput
{
    // Meant for creating some angle warnings to test
    public static class AngleWarningsTestsHelper
    {
        public static JObject GetFirstLevelWarningsJObject(int count)
        {
            JObject angleWarningsLevel1 = new JObject();
            string serializeSummary = JsonConvert.SerializeObject(new AngleWarningsSummaryViewModel());

            angleWarningsLevel1.Add("data", JToken.FromObject(GetFirstLevelWarningsList(count)));
            angleWarningsLevel1.Add("summary", JToken.FromObject(serializeSummary));

            return angleWarningsLevel1;
        }

        public static JObject GetSecondLevelWarningsJObject(int count)
        {
            JObject angleWarningsLevel2 = new JObject();

            string serializeSolution = JsonConvert.SerializeObject(new List<AngleWarningsSolutionsViewModel>());
            angleWarningsLevel2.Add("data", JToken.FromObject(GetSecondLevelWarningsList(count)));
            angleWarningsLevel2.Add("solutions", JToken.FromObject(serializeSolution));

            return angleWarningsLevel2;
        }

        public static JObject GetThirdLevelWarningsJObject(int count)
        {
            List<AngleWarningThirdLevelViewmodel> thirdLevelList = GetThirdLevelWarningsList(count);

            JObject angleWarningsLevel3 = new JObject();
            angleWarningsLevel3.Add("data", JToken.FromObject(thirdLevelList));

            return angleWarningsLevel3;
        }

        public static AngleWarningsDataSourceResult GetAngleWarningsDataSourceResult(AngleWarningsController testingController)
        {
            NameValueCollection valueCollection = GetAngleWarningFilters();

            FormCollection formCollection = new FormCollection(valueCollection);

            JsonResult result = testingController.ReadAngleWarnings(null, "/models/1", formCollection) as JsonResult;
            AngleWarningsController.AngleWarningsDataSourceResult viewmodels = result.Data as AngleWarningsController.AngleWarningsDataSourceResult;

            return viewmodels;
        }

        private static NameValueCollection GetAngleWarningFilters()
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

        private static List<AngleWarningFirstLevelViewmodel> GetFirstLevelWarningsList(int count)
        {
            List<AngleWarningFirstLevelViewmodel> firstLevelList = new List<AngleWarningFirstLevelViewmodel>();

            AngleWarningFirstLevelViewmodel firstLevelWarning = new AngleWarningFirstLevelViewmodel();
            firstLevelWarning.Id = "unsupported_display_field";
            firstLevelWarning.Count = count;
            firstLevelWarning.Severity = "warning";
            firstLevelWarning.Uri = "model/test/1";
            firstLevelList.Add(firstLevelWarning);

            if (count == 1)
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

        private static List<AngleWarningSecondLevelViewmodel> GetSecondLevelWarningsList(int count)
        {
            List<AngleWarningSecondLevelViewmodel> secondLevelList = new List<AngleWarningSecondLevelViewmodel>();

            if (count == 1 || count == 2)
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
            }

            if (count == 2)
            {
                AngleWarningSecondLevelViewmodel secondLevel;
                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 1,
                    Field = "Test_ref_Payer__Description",
                    Object = "BillingDocumentItem",
                    Uri = ""
                };
                secondLevelList.Add(secondLevel);

                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 1,
                    Field = "SomeFieldToBeDeleted",
                    Object = "WorkOrder",
                    Uri = ""
                };
                secondLevelList.Add(secondLevel);
            }

            if (count == 3)
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

            if (count == 4)
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

            if (count == 5)
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

            if (count == 11)
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

            if (count == 6)
            {
                AngleWarningSecondLevelViewmodel secondLevel;
                secondLevel = new AngleWarningSecondLevelViewmodel
                {
                    Count = 1,
                    Field = "SomeFieldToBeDeleted",
                    Object = "WorkOrder",
                    Uri = ""
                };
                secondLevelList.Add(secondLevel);
            }

            return secondLevelList;
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

        public static string GetExpectedJsonForMultipleTargetTest()
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


        public static string GetExpectedJsonForCompleteRun()
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
              ""angle_id"": ""angleId1"",
              ""display_id"": ""displayId1""
            }
          ]
        },
        {
          ""name"": ""action"",
          ""value"": {
            ""action"": ""remove_column"",
            ""parameter"": {
              ""objects"": [
                ""WorkOrder""
              ],
              ""field"": ""SomeFieldToBeDeleted"",
              ""types"": [
                ""unsupported_display_field"",
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
                ""unsupported_grouping_field"",
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
