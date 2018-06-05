using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class Fields
    {
        public Header header { get; set; }
        public List<Field> fields { get; set; }
        public List<SortOption> sort_options { get; set; }
        public List<Facet> facets { get; set; }
    }
}
