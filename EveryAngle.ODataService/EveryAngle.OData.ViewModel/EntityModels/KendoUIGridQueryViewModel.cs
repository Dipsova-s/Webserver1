using System.Collections.Generic;

namespace EveryAngle.OData.ViewModel
{
    public class KendoUIGridQueryViewModel
    {
        public int? id { get; set; }
        public int take { get; set; }
        public int skip { get; set; }
        public int page { get; set; }
        public int pageSize { get; set; }
        public FilterQueryViewModel filter { get; set; }
        public IList<SortQueryViewModel> sort { get; set; }        
    }

    public class SortQueryViewModel
    {
        public string field { get; set; }
        public string dir { get; set; }
    }
    public class FilterQueryViewModel
    {
        public string logic { get; set; }
        public IList<SubFilterQueryViewModel> filters { get; set; }
    }
    public class SubFilterQueryViewModel
    {
        public string field { get; set; }
        public string @operator { get; set; }
        public string @value { get; set; }
    }
}
