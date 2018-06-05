using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class Facet
    {
        public string id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public string type { get; set; }
        public List<Filter> filters { get; set; }
    }
}
