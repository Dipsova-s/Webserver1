using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Label;
using EveryAngle.Core.ViewModels.LabelCategory;
using EveryAngle.Core.ViewModels.SystemLanguages;

using System.Collections.Generic;
using System.Data;


namespace EveryAngle.Core.Interfaces.Services
{
    public interface ILabelService
    {
        ListViewModel<LabelCategoryViewModel> GetLabelCategories(string uri);

        LabelCategoryViewModel GetLabelCategory(string labelUri);

        void DeleteLabelCategory(string labelUri);
    
        ListViewModel<LabelViewModel> GetLabels(string uri);

        LabelViewModel GetLabel(string labelUri);

        LabelViewModel CreateLabel(string labelCategoryUri, string newLabel);

        LabelViewModel UpdateLabel(string labelCategoryUri, string updatedLabel);

        LabelViewModel UpdateNewLabel(string labelCategoryUri, string updatedLabel);

        LabelCategoryViewModel UpdateNewCategoryLabel(string modelUri, string updatedLabel);
      
        LabelCategoryViewModel UpdateLabelCategory(string labelCategoryUri, string updatedLabel);
       
        void DeleteLabel(string labelUri);

        DataTable GetMultilingualLabelCategory(string categoryUri, LabelCategoryViewModel labelCategory = null, List<SystemLanguageViewModel> languages = null);

        DataTable GetLabelsGrid(string labelsUri, string categoryUri, int page, int pagesize, List<SystemLanguageViewModel> languages = null);

        List<SystemLanguageViewModel> GetSystemLanguages();
    }
}
