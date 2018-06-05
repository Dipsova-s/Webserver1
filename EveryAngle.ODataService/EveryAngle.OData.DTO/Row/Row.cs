using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class Row
    {
        public string row_id { get; set; }
        public List<object> field_values { get; set; }
    }
}
