namespace EveryAngle.Core.ViewModels.Model
{
    public class ModelSiteMapSlaveViewModel : ModelSiteMapBaseViewModel
    {
        #region menu visibility

        public override bool CanViewModelServers => false;
        public override bool CanManageAngleWarnings => false;
        public override bool CanManageContentParameters => false;
        public override bool CanManageLabelCategories => false;
        public override bool CanManagePackages => false;
        public override bool CanManageSuggestedFields => false;

        #endregion
    }
}
