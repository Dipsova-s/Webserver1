namespace EveryAngle.OData.DTO.Model
{
    public class PrivilegesForModelViewModel
    {
        public bool? manage_model { get; set; }

        public bool? create_angles { get; set; }

        public bool? allow_single_item_view { get; set; }

        public bool? allow_more_details { get; set; }

        public bool? allow_followups { get; set; }

        public bool? allow_goto_sap { get; set; }

        public bool? allow_rpc { get; set; }

        public bool? allow_export { get; set; }

        public int? max_export_rows { get; set; }

        public bool? allow_advanced_filter { get; set; }

        public bool? access_data_via_webclient { get; set; }

        public bool? create_template_angles { get; set; }

        public bool? save_displays { get; set; }

        public bool? allow_publish_dashboards { get; set; }

        public bool? manage_private_items { get; set; }

        public bool? allow_nonvalidated_items { get; set; }

        public bool? access_data_via_odata { get; set; }

    }
}
