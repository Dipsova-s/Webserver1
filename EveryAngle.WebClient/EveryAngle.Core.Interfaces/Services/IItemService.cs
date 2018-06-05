using EveryAngle.Core.ViewModels.Item;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.Package;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IItemService
    {
        IEnumerable<FacetViewModel> GetFacets(string itemType);
        ExportItemViewModel CreateItemExport(ExportPackageQueryModel queryModel);
        ExportItemViewModel GetItemExport(string itemUri);
    }
}
