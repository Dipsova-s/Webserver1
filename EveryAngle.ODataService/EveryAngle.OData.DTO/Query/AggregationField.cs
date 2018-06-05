namespace EveryAngle.OData.DTO
{
    public class AggregationField
    {
        public string field { get; set; }
        public string @operator { get; set; }
        public string source_field { get; set; }
        public bool? valid { get; set; }
    }
}
