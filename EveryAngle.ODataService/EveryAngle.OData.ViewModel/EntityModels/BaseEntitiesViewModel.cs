namespace EveryAngle.OData.ViewModel
{
    public class BaseEntitiesViewModel
    {
        public string name { get; set; }
        public int entity_id { get; set; }
        public string web_client_uri { get; set; }

        // pivot, chart, list, angle
        public string item_type { get; set; }
    }
}
