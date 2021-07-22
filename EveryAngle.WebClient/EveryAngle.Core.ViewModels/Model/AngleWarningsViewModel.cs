using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace EveryAngle.Core.ViewModels.Model
{
    public class AngleWarningsViewModel
    {
        public int? fakeId { get; set; }

        public int? ParentId { get; set; }

        public string Id { get; set; }

        public string Name { get; set; }

        public bool hasChildren { get; set; }

        public int Level { get; set; }

        public string Uri { get; set; }

        public AngleWarningFirstLevelViewmodel DataFirstLevel { get; set; }

        public AngleWarningSecondLevelViewmodel DataSecondLevel { get; set; }

        public AngleWarningThirdLevelViewmodel DataThirdLevel { get; set; }
    }

    public class AngleWarningsSummaryViewModel
    {
        [JsonProperty(PropertyName = "angles_total")]
        public int AnglesTotal { get; set; }

        [JsonProperty(PropertyName = "angles_with_warnings")]
        public int AnglesWarnings { get; set; }

        [JsonProperty(PropertyName = "displays_total")]
        public int DisplaysTotal { get; set; }

        [JsonProperty(PropertyName = "displays_with_warnings")]
        public int DisplaysWarnings { get; set; }

        [JsonProperty(PropertyName = "errors_total")]
        public int ErrorsTotal { get; set; }

        [JsonProperty(PropertyName = "errors_unique")]
        public int ErrorsUnique { get; set; }

        [JsonProperty(PropertyName = "warnings_total")]
        public int WarningsTotal { get; set; }

        [JsonProperty(PropertyName = "warnings_unique")]
        public int WarningsUnique { get ; set; }

        [JsonProperty(PropertyName = "warnings_solvable")]
        public int WarningsSolvable { get; set; }
    }

    public class AngleWarningsSolutionsViewModel
    {
        [JsonProperty(PropertyName = "action")]
        public string Action { get; set; }

        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "parameter_type")]
        public string ParameterType { get; set; }

        [JsonProperty(PropertyName = "parameter_selection")]
        public string ParameterSelection { get; set; }

        [JsonProperty(PropertyName = "warning_types")]
        public List<string> WarningTypes { get; set; }
    }

    public class AngleWarningFirstLevelViewmodel
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "severity")]
        public string Severity { get; set; }

        [JsonProperty(PropertyName = "count")]
        public int Count { get; set; }

        [JsonProperty(PropertyName = "uri")]
        public string Uri { get; set; }
    }

    public class AngleWarningSecondLevelViewmodel
    {
        [JsonProperty(PropertyName = "object")]
        public string Object { get; set; }

        [JsonProperty(PropertyName = "count")]
        public int Count { get; set; }

        [JsonProperty(PropertyName = "uri")]
        public string Uri { get; set; }

        [JsonProperty(PropertyName = "jump")]
        public string Jump { get; set; }

        [JsonProperty(PropertyName = "field")]
        public string Field { get; set; }

        public string FieldType { get; set; }
    }

    public class AngleWarningThirdLevelViewmodel
    {
        [JsonProperty(PropertyName = "angle_id")]
        public string AngleId { get; set; }

        [JsonProperty(PropertyName = "angle_uri")]
        public string AngleUri { get; set; }

        [JsonProperty(PropertyName = "display_id")]
        public string DisplayId { get; set; }

        [JsonProperty(PropertyName = "display_uri")]
        public string DisplayUri { get; set; }

        public string Type { get; set; }
    }

}
