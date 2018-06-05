namespace EveryAngle.Core.ViewModels.Model
{
    public class ModelSiteMapHanaServerViewModel : ModelSiteMapBaseViewModel
    {
        #region menu visibility
        
        public override bool CanViewModelServers => false;
        public override bool CanManageAngleWarnings => false;
        public override bool CanManageSuggestedFields => false;

        #endregion
    }
}
