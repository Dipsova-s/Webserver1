using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.OData.DTO
{
    public class Display : BaseDTO<DisplayCompositeKey>, IBaseDTO<DisplayCompositeKey>, IMetadata
    {
        public void SetAngle (Angle angle)
        {
            this.Angle = angle;
        }

        private Angle Angle { get; set; }

        public string name { get; set; }
        public string description { get; set; }
        public string angle_id { get; set; }
        public string display_details { get; set; }
        public List<QueryBlock> query_blocks { get; set; }
        public List<Field> fields { get; set; }
        public string state { get; set; }
        public string angle_uri { get { return string.Join("/", uri.Split('/').Take(5)); } }
        public Created created { get; set; }
        public bool is_public { get; set; }
        public bool contained_aggregation_steps { get; set; }
        public bool used_in_task { get; set; }
        public string display_type { get; set; }
        public bool is_angle_default { get; set; }

        public string AngleName { get { return Angle.name; } }
    }
}
