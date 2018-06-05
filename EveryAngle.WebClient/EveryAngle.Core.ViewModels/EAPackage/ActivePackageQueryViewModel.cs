namespace EveryAngle.Core.ViewModels.EAPackage
{
    public class ActivePackageQueryViewModel
    {
        public string PackageUri { get; set; }
        public bool IsActive { get; set; }
        public string ModelId { get; set; }
        public bool IncludeLabelCategories { get; set; }
        public bool IncludePrivateItems { get; set; }
        public string AnglesConflictResolution { get; set; }
        public string LabelCategoriesConflictResolution { get; set; }
    }
}
