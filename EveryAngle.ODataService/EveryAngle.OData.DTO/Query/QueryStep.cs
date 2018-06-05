using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class QueryStep
    {
        public string field { get; set; }
        public string @operator { get; set; }
        public string step_type { get; set; }
        public bool? valid { get; set; }
        public List<AggregationField> aggregation_fields { get; set; } = new List<AggregationField>();
        public List<GroupingField> grouping_fields { get; set; } = new List<GroupingField>();

        // disabled because can't handle old style arguments
        // public List<Argument> arguments { get; set; }
    }
}
