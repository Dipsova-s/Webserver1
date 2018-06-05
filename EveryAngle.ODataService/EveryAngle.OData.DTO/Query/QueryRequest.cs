using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class QueryRequest
    {
        public List<QueryBlock> query_definition { get; set; }
    }
}
