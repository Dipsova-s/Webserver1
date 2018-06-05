using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class QueryResult
    {
        public string id { get; set; }
        public string uri { get; set; }
        public string model { get; set; }
        public string instance { get; set; }
        public string search { get; set; }
        public string status { get; set; }
        public string language { get; set; }
        public double progress { get; set; }
        public bool successfully_completed { get; set; }
        public bool is_aggregated { get; set; }
        public int? row_count { get; set; }
        public int? object_count { get; set; }
        public int? execution_time { get; set; }
        public string query_definition { get; set; }
        public string data_fields { get; set; }
        public string query_fields { get; set; }
        public string followups { get; set; }
        public string data_rows { get; set; }
        public string execute_steps { get; set; }
        public string sap_transactions { get; set; }
        public List<string> actual_classes { get; set; }
        public List<string> potential_classes { get; set; }
        public List<string> default_fields { get; set; }
        public int modeldata_timestamp { get; set; }
        public Authorizations authorizations { get; set; }
    }
}
