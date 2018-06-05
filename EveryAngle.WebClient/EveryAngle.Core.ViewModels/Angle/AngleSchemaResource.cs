using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Angle
{
    public class AngleSchemaResource
    {
        public string Key { get; set; }
        public string Picture { get; set; }
        public List<AreaCoordinate> Details { get; set; }
        public string ModelName { get; set; }
        public string DefaultHelp { get; set; }
    }
}
