using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class ModelInfo
    {
        public string latest_instance { get; set; }
        public string current_instance { get; set; }
        public bool available { get; set; }
        public string model_status { get; set; }
        public string label_categories { get; set; }
        public string validate_query_integrity { get; set; }
        public string labels { get; set; }
        public string instances { get; set; }
        public string angles { get; set; }
        public string followups { get; set; }
        public string model_roles { get; set; }
        public string classes { get; set; }
        public string fielddomains { get; set; }
        public string fieldsources { get; set; }
        public string fields { get; set; }
        public string servers { get; set; }
        public string suggested_fields_summary { get; set; }
        public int? authorized_users { get; set; }
        public string help_texts { get; set; }
        public string license { get; set; }
        public string agent_uri { get; set; }
        public string agent { get; set; }
        public int? connected_users { get; set; }
        public string angle_warnings_summary { get; set; }
        public string id { get; set; }
        public string short_name { get; set; }
        public string long_name { get; set; }
        public string uri { get; set; }
        public string modelserver_settings { get; set; }
        public string environment { get; set; }
        public bool switch_when_postprocessing { get; set; }
        public bool is_postprocessing { get; set; }
        public List<string> licensed_apps { get; set; }
        public List<string> active_languages { get; set; }
        public Created created { get; set; }
        public string type { get; set; }
        public string packages { get; set; }
    }
}
