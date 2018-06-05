using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class DataRows
    {
        public Header header { get; set; }
        public List<Row> rows { get; set; }
        public List<string> fields { get; set; }
    }
}
