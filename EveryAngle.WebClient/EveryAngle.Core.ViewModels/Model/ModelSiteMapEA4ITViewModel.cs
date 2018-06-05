namespace EveryAngle.Core.ViewModels.Model
{
    public class ModelSiteMapEA4ITViewModel : ModelSiteMapBaseViewModel
    {
        #region menu visibility
        
        public override bool CanManageExtractor => false;
        public override bool CanViewModelServers => false;
        public override bool CanManageRefreshTasks => false;
        public override bool CanManageAngleWarnings => false;
        public override bool CanManageContentParameters => false;
        public override bool CanManageModules => false;
        public override bool CanManageSuggestedFields => false;
        public override bool CanManageDownloadTables => false;

        #endregion
    }
}
