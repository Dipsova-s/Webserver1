using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class Angles
    {
        public Header header { get; set; }
        public List<Angle> angles { get; set; }
        public List<SortOption> sort_options { get; set; }
    }
}
