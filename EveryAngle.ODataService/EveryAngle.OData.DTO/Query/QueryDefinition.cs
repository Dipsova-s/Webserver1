using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class QueryDefinition
    {
        public List<string> base_classes { get; set; }
        public string queryblock_type { get; set; }
        public bool? valid { get; set; }
        public ValidationDetails validation_details { get; set; }
        public List<QueryStep> query_steps { get; set; }
    }
}
