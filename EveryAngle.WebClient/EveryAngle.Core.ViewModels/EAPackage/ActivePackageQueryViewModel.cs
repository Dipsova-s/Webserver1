using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.EAPackage
{
    public class ActivePackageQueryViewModel
    {
        public string PackageUri { get; set; }
        public bool IsActive { get; set; }
        public string ModelId { get; set; }
        public bool IncludeLabelCategories { get; set; }
        public bool IncludeExternalId { get; set; }
        public bool IncludePrivateItems { get; set; }
        public string AnglesConflictResolution { get; set; }
        public string LabelCategoriesConflictResolution { get; set; }
        public string MappingObj { get; set; }
        public string SourceModel { get; set; }
    }

    public class MappingModel
    {
        public string SourceModel { get; set; }
        public string ModelId { get; set; }
        public string PackageUri { get; set; }
    }
}
