using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Item;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.Package;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class ItemService : BaseService, IItemService
    {
        #region Constant

        private const string FACET_URI = "items?offset=0&limit=0&viewmode=basic&lang=en&fq={0}&export=true";
        private const string ITEM_EXPORT_URI = "item_exports?export=true";

        #endregion

        #region Public method

        public IEnumerable<FacetViewModel> GetFacets(string fq)
        {
            string uri = string.Format(FACET_URI, fq);
            IEnumerable<FacetViewModel> viewModel = GetItems<FacetViewModel>(uri, "facets");

            return viewModel;
        }

        public ExportItemViewModel CreateItemExport(ExportPackageQueryModel queryModel)
        {
            string body = Newtonsoft.Json.JsonConvert.SerializeObject(queryModel);
            ExportItemViewModel viewModel = Create<ExportItemViewModel>(ITEM_EXPORT_URI, body);

            return viewModel;
        }

        public ExportItemViewModel GetItemExport(string itemUri)
        {
            ExportItemViewModel viewModel = Get<ExportItemViewModel>(itemUri);

            return viewModel;
        }

        #endregion
    }
}
