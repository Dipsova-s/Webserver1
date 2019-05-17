using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.EAPackage
{
    public class ImportPackageResultViewModel
    {
        public JObject source { get; set; }
        public List<JObject> angles { get; set; } = new List<JObject>();
        public List<JObject> dashboards { get; set; } = new List<JObject>();
    }

    public class ImportPackageItemViewModel
    {
        public List<JObject> items { get; set; } = new List<JObject>();
    }
}
