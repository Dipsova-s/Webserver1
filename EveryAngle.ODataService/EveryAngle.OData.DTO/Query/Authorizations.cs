namespace EveryAngle.OData.DTO
{
    public class Authorizations
    {
        public bool change_query_filters { get; set; }
        public bool change_query_followups { get; set; }
        public bool single_item_view { get; set; }
        public bool change_field_collection { get; set; }
        public bool sort { get; set; }
        public bool add_filter { get; set; }
        public bool add_followup { get; set; }
        public bool add_aggregation { get; set; }
        public bool export { get; set; }
    }
}
