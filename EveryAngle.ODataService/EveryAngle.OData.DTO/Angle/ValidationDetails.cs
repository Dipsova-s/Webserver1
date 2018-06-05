using System.Collections.Generic;

namespace EveryAngle.OData.DTO
{
    public class ValidationDetails
    {
        public string warning_type { get; set; }
        public List<string> classes { get; set; }
        public string field { get; set; }
    }
}
