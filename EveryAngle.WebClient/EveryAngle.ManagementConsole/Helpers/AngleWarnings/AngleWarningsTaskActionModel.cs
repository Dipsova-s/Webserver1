namespace AngleWarnings
{
    using EveryAngle.ManagementConsole.Helpers;
    using Newtonsoft.Json;
    using System.Collections.Generic;

    public class MainTaskModel
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("delete_after_completion")]
        public bool DeleteAfterCompletion => false;

        [JsonProperty("enabled")]
        public bool Enabled => true;

        [JsonProperty("run_as_user")]
        public string RunAsUser { get; set; }

        [JsonProperty("actions")]
        public List<AngleWarningsTaskAction> Actions { get; set; }

        public MainTaskModel(string runAsUser)
        {
            Name = "Solve angle warnings";
            Description = "This task use for solve angle warnings by user selected actions.";
            RunAsUser = runAsUser;

            Actions = new List<AngleWarningsTaskAction>();
        }

        public void AddAction(AngleWarningsTaskAction angleWarningsTaskModel)
        {
            Actions.Add(angleWarningsTaskModel);
        }

        public string GetJsonRequest()
        {
            return JsonConvert.SerializeObject(this, Formatting.Indented);
        }
    }
    
    public class BaseArgument
    {
        [JsonProperty("name", Order = -2)]
        public string Name { get; set; }
    }

    public class ModelArgument : BaseArgument
    {
        [JsonProperty("value")]
        public string Value { get; set; }
    }

    public class TargetIdArgument : BaseArgument
    {
        [JsonProperty("value")]
        public List<TargetIdValues> Value { get; set; }

        public TargetIdArgument()
        {
            Value = new List<TargetIdValues>();
        }
    }

    public class TargetIdValues
    {
        [JsonProperty("angle_id")]
        public string AngleId { get; set; }

        [JsonProperty("display_id")]
        public string DisplayId { get; set; }

        public bool ShouldSerializeDisplayId()
        {
            return (DisplayId != null);
        }
    }

    public class ActionArgument : BaseArgument
    {
        [JsonProperty("value")]
        public ActionValue Value { get; set; }
    }

    public class ActionValue
    {
        [JsonProperty("action")]
        public string Action { get; set; }

        [JsonProperty("parameter")]
        public BaseActionParameter Parameter { get; set; }
    }

    public class BaseActionParameter
    {
    }

    public class ReplaceField_ActionParameters: BaseActionParameter
    {
        [JsonProperty("objects")]
        public string[] Objects { get; set; }

        [JsonProperty("field")]
        public string Field { get; set; }

        [JsonProperty("replace_with")]
        public string ReplaceWith { get; set; }

        [JsonProperty("types")]
        public string[] Types { get; set; }
    }

    public class RemoveColumn_ActionParameters : BaseActionParameter
    {
        [JsonProperty("objects")]
        public string[] Objects { get; set; }

        [JsonProperty("field")]
        public string Field { get; set; }

        [JsonProperty("types")]
        public string[] Types { get; set; }
    }

    public class ReplaceStartObject_ActionParameters : BaseActionParameter
    {
        [JsonProperty("objects")]
        public string[] Objects { get; set; }

        [JsonProperty("replace_with")]
        public string[] ReplaceWith { get; set; }

        [JsonProperty("types")]
        public string[] Types { get; set; }
    }

    public class ReplaceJump_ActionParameters : BaseActionParameter
    {
        [JsonProperty("objects")]
        public string[] Objects { get; set; }

        [JsonProperty("jump")]
        public string Jump { get; set; }

        [JsonProperty("replace_with")]
        public string ReplaceWith { get; set; }

        [JsonProperty("types")]
        public string[] Types { get; set; }
    }

}
