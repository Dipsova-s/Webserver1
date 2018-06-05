using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.OData.DTO
{
    public class Angle : BaseDTO<AngleCompositeKey>, IBaseDTO<AngleCompositeKey>, IMetadata
    {
        public Angle()
        {
            query_definition = new List<QueryDefinition>();
            display_definitions = new List<Display>();
        }

        public void SetDisplays(List<Display> displays)
        {
            this.display_definitions = displays;
            this.display_definitions.ForEach(display => display.SetAngle(this));
        }

        public List<Display> AvailableDisplays { get { return display_definitions.Where(display => display.is_available).ToList(); } }

        public string name { get; set; }
        public string description { get; set; }
        public List<DisplaysSummary> displays_summary { get; set; }
        public List<Display> display_definitions { get; set; }
        public bool template_has_invalid_classes { get; set; }
        public string model { get; set; }
        public bool is_validated { get; set; }
        public bool is_parameterized { get; set; }
        public bool is_published { get; set; }
        public bool is_template { get; set; }
        public Created created { get; set; }
        public bool has_warnings { get; set; }
        public string state { get; set; }
        public List<QueryDefinition> query_definition { get; set; }
    }
}
