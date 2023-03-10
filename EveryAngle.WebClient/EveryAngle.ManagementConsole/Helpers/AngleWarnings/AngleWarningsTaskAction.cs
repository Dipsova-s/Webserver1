using AngleWarnings;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings;
using EveryAngle.ManagementConsole.Helpers.AngleWarnings.Enums;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Helpers
{
    public class AngleWarningsTaskAction : IAngleWarningsTaskAction
    {
        [JsonProperty("action_type")]
        public string ActionType { get; set; }

        [JsonProperty("arguments")]
        public List<BaseArgument> Arguments { get; set; }

        [JsonProperty("notification")]
        public string Notification { get; set; }

        [JsonProperty("run_as_user")]
        public string Run_as_user { get; set; }

        [JsonProperty("approval_state")]
        public string Approval_state => "approved";

        public AngleWarningsTaskAction(string modelName)
        {
            if (string.IsNullOrEmpty(modelName))
            {
                throw new System.ArgumentException("Model name may not be empty.", nameof(modelName));
            }

            Arguments = new List<BaseArgument>();

            ActionType = "solve_angle_warnings";

            AddModelArgument(modelName);

            AddTargetIdsArgument();
        }

        private void AddModelArgument(string modelName)
        {
            ModelArgument argument = new ModelArgument
            {
                Name = "model",
                Value = modelName
            };

            AddArgumentToTask(argument);
        }

        private void AddTargetIdsArgument()
        {
            TargetIdArgument targetIdArgument = new TargetIdArgument
            {
                Name = "target_ids"
            };

            AddArgumentToTask(targetIdArgument);
        }

        public void AddTargetId(WarningFix warningFix, string angleId, string displayId)
        {
            TargetIdArgument targetIdArgument = (TargetIdArgument)Arguments.FirstOrDefault(x => x.Name == "target_ids");

            TargetIdValues value = new TargetIdValues
            {
                AngleId = angleId,
                DisplayId = displayId
            };

            targetIdArgument.Value.Add(value);
        }

        public void AddActionArgument(string oldField, ItemSolver solveItem, string startObject, string[] types)
        {
            ActionArgument actionArgument = new ActionArgument
            {
                Name = "action"
            };

            ActionValue actionValue = null;

            if (types.Contains("unsupported_grouping_field") || types.Contains("unsupported_aggregation_field"))
            {
                List<string> list = types.ToList();
                list.Add("unsupported_display_field");
                types = list.ToArray();
            }

            if (solveItem.Fix == WarningFix.ReplaceField)
            {
                actionValue = AddActionArgument_ReplaceField(warningSolution: WarningSolution.ReplaceField,
                                                             field: oldField,
                                                             replaceWith: solveItem.NewFieldOrClass,
                                                             types: types,
                                                             objects: new string[] { startObject });
            }

            if (solveItem.Fix == WarningFix.ReplaceJump)
            {
                actionValue = AddActionArgument_ReplaceJump(warningSolution: WarningSolution.ReplaceJump,
                                                            replaceWith: solveItem.NewFieldOrClass,
                                                            types: types,
                                                            objects: new string[] { startObject },
                                                            jump: solveItem.FieldOrClassToReplace);
            }

            if (solveItem.Fix == WarningFix.ReplaceClass)
            {
                actionValue = AddActionArgument_ReplaceStartObject(warningSolution: WarningSolution.ReplaceStartObject,
                                                                   replaceWith: new string[] { solveItem.NewFieldOrClass },
                                                                   types: types,
                                                                   objects: new string[] { startObject });                
            }

            if (solveItem.Fix == WarningFix.RemoveColumn)
            {
                actionValue = AddActionArgument_RemoveColumn(warningSolution: WarningSolution.RemoveColumn,
                                                                   fieldToBeRemoved: oldField,
                                                                   types: types,
                                                                   objects: new string[] { startObject });
            }

            if (actionValue != null)
            {
                actionArgument.Value = actionValue;

                AddArgumentToTask(actionArgument);
            }
        }

        private ActionValue AddActionArgument_RemoveColumn(WarningSolution warningSolution, string fieldToBeRemoved, string[] types, string[] objects)
        {
            ActionValue actionValue = new ActionValue
            {
                Action = ManagementConsoleEnumHelper.GetEnumDescription(warningSolution)
            };

            if (!types.Contains("unsupported_sorting_field"))
            {
                List<string> list = types.ToList();
                list.Add("unsupported_sorting_field");
                types = list.ToArray();
            }

            RemoveColumn_ActionParameters actionParameter = new RemoveColumn_ActionParameters
            {
                Field = fieldToBeRemoved,
                Objects = objects,
                Types = types
            };
           
            actionValue.Parameter = actionParameter;
            return actionValue;
        }

        private ActionValue AddActionArgument_ReplaceField(WarningSolution warningSolution, string field, string replaceWith, string[] types, string[] objects)
        {
            ActionValue actionValue = new ActionValue
            {
                Action = ManagementConsoleEnumHelper.GetEnumDescription(warningSolution)
            };

            ReplaceField_ActionParameters actionParameter = new ReplaceField_ActionParameters
            {
                Field = field,
                Objects = objects,
                Types = types,
                ReplaceWith = replaceWith,
                RemoveIfReplaceFieldExists = true
            };

            actionValue.Parameter = actionParameter;
            return actionValue;
        }

        private ActionValue AddActionArgument_ReplaceStartObject(WarningSolution warningSolution, string[] replaceWith, string[] types, string[] objects)
        {
            ActionValue actionValue = new ActionValue
            {
                Action = ManagementConsoleEnumHelper.GetEnumDescription(warningSolution)
            };

            ReplaceStartObject_ActionParameters actionParameter = new ReplaceStartObject_ActionParameters
            {
                Objects = objects,
                Types = types,
                ReplaceWith = replaceWith
            };

            actionValue.Parameter = actionParameter;
            return actionValue;
        }

        private ActionValue AddActionArgument_ReplaceJump(WarningSolution warningSolution, string replaceWith, string[] types, string[] objects, string jump)
        {
            ActionValue actionValue = new ActionValue
            {
                Action = ManagementConsoleEnumHelper.GetEnumDescription(warningSolution)
            };

            ReplaceJump_ActionParameters actionParameter = new ReplaceJump_ActionParameters
            {
                Objects = objects,
                Types = types,
                Jump = jump,
                ReplaceWith = replaceWith
            };

            actionValue.Parameter = actionParameter;
            return actionValue;
        }

        private void AddArgumentToTask(BaseArgument argument)
        {
            Arguments.Add(argument);
        }

    }
}
