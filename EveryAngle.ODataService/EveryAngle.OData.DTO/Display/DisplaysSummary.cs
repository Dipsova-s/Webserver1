namespace EveryAngle.OData.DTO
{
    public class DisplaysSummary : BaseDTO<DisplayCompositeKey>, IBaseDTO<DisplayCompositeKey>
    {
        public string state { get; set; }
        public bool is_public { get; set; }
        public bool contained_aggregation_steps { get; set; }
        public bool used_in_task { get; set; }
        public string display_type { get; set; }
        public bool is_angle_default { get; set; }
        public string display_details { get; set; }
    }
}
