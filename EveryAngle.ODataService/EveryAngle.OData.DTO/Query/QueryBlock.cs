using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class QueryBlock
    {
        public string queryblock_type { get; set; }
        public string base_angle { get; set; }
        public string base_display { get; set; }
        public List<QueryStep> query_steps { get; set; }
        public bool? valid { get; set; }
    }
}
