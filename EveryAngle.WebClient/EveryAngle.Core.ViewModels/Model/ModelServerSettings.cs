using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace EveryAngle.Core.ViewModels.Model
{
    public class ModelServerSettings
    {
        [JsonProperty(PropertyName = "setting_groups")]
        public List<SettingGroup> SettingsGroup { get; set; }

        [JsonProperty(PropertyName = "setting_list")]
        public List<Setting> SettingList { get; set; }

        public Setting GetSettingById(string id)
        {
            Setting setting = null;
            if (this.SettingList != null)
            {
                setting = this.SettingList.Where(filter => filter.Id == id).FirstOrDefault();
            }

            return setting;
        }
    }

    public class SettingGroup
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }


        [JsonProperty(PropertyName = "name")]
        public string Name { get; set; }

        [JsonProperty(PropertyName = "settings")]
        public List<string> Settings { get; set; }

        [DefaultValue(null)]
        [JsonProperty(PropertyName = "description", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Description { get; set; }

        [DefaultValue(null)]
        [JsonProperty(PropertyName = "enabler", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Enabler { get; set; }

        [DefaultValue(null)]
        [JsonProperty(PropertyName = "enabler_value", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string EnablerValue { get; set; }

        [JsonProperty(PropertyName = "groups")]
        public List<SettingGroup> Groups { get; set; }

        public bool HasSubGroup()
        {
            return this.Groups != null && this.Groups.Count > 0;
        }

        public List<SettingGroup> GetSettingGroupById(string id)
        {
            List<SettingGroup> group = null;

            if (HasSubGroup())
            {
                group = this.Groups.Where(filter => filter.Enabler == id).ToList();
            }

            return group;
        }



    }


    public class Setting
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [DefaultValue(null)]
        [JsonProperty(PropertyName = "name", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Name { get; set; }

        [DefaultValue(null)]
        [JsonProperty(PropertyName = "description", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Description { get; set; }

        [DefaultValue(null)]
        [JsonProperty(PropertyName = "type", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Type { get; set; }

        [JsonProperty(PropertyName = "value", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object Value { get; set; }

        [DefaultValue(null)]
        [JsonProperty(PropertyName = "options", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public List<Option> Options { get; set; }

        [DefaultValue(null)]
        [JsonProperty(PropertyName = "min", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object Min { get; set; }

        [DefaultValue(null)]
        [JsonProperty(PropertyName = "max", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object Max { get; set; }
    }


    public class Groups
    {

    }
}
